import axios from 'axios';

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const clienteApi = axios.create({
  baseURL: URL_API,
  withCredentials: true, // Permitir enviar cookies (tokenRefresco)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token de acceso en cada petición
clienteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tokenAcceso');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar la expiración del token de acceso y renovarlo automáticamente
let refrescandoToken = false;
let suscriptoresAlToken: ((token: string) => void)[] = [];

const suscribirseAlRefresco = (cb: (token: string) => void) => {
  suscriptoresAlToken.push(cb);
};

const refrescarSuscriptores = (token: string) => {
  suscriptoresAlToken.forEach((cb) => cb(token));
  suscriptoresAlToken = [];
};

clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const peticionOriginal = error.config;

    // Si el error es 401 (No Autorizado) y la petición no era ya de login/refresh/logout
    if (
      error.response?.status === 401 &&
      !peticionOriginal._retry &&
      !peticionOriginal.url?.includes('/autenticacion/acceso') &&
      !peticionOriginal.url?.includes('/autenticacion/registro')
    ) {
      peticionOriginal._retry = true;

      if (!refrescandoToken) {
        refrescandoToken = true;

        try {
          // Llamar al endpoint de refresco
          const respuesta = await axios.post(
            `${URL_API}/autenticacion/refrescar-token`,
            {},
            { withCredentials: true }
          );

          const { tokenAcceso } = respuesta.data.datos;
          localStorage.setItem('tokenAcceso', tokenAcceso);

          refrescandoToken = false;
          refrescarSuscriptores(tokenAcceso);

          // Reintentar la petición original con el nuevo token
          peticionOriginal.headers.Authorization = `Bearer ${tokenAcceso}`;
          return clienteApi(peticionOriginal);
        } catch (errorRefresco) {
          refrescandoToken = false;
          suscriptoresAlToken = [];
          
          // Si el refresco falla, la sesión expiró por completo, limpiar localstorage y redirigir
          localStorage.removeItem('tokenAcceso');
          localStorage.removeItem('usuario');
          
          // Emitimos un evento personalizado para que el AuthContext se entere
          window.dispatchEvent(new Event('sesionExpirada'));
          
          return Promise.reject(errorRefresco);
        }
      }

      // Si ya se está refrescando, encolar esta petición para cuando esté listo
      const promesaReintento = new Promise((resolve) => {
        suscribirseAlRefresco((nuevoToken) => {
          peticionOriginal.headers.Authorization = `Bearer ${nuevoToken}`;
          resolve(clienteApi(peticionOriginal));
        });
      });

      return promesaReintento;
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
