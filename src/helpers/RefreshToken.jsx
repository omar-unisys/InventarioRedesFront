import Cookies from 'js-cookie';
import AuthApi from '../services/AuthApi';

export const RefreshToken = async () => {
  const keyName = 'jwt_token_fact';
  
  // Obtener token de las cookies
  const token_ = Cookies.get(keyName);
  if (!token_) {
    console.error('No token found in cookies');
    throw new Error('No token found in cookies');
  }

  console.log('Token encontrado:', token_);

  try {
    const url = import.meta.env.VITE_URL_SEGURIDAD + 'refresh/';

    // Solicitar un nuevo token
    const response = await AuthApi.getRefreshToken(url, token_);
    const data = await response.json();

    if (response.ok) {
      const { token, expirationTime } = data;

      // Calcula el tiempo de expiración (en milisegundos)
      const now = new Date();
      const expireTime = now.getTime() + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);

      // Establecer el nuevo token en cookies con la fecha de expiración
      Cookies.set(keyName, JSON.stringify(token), { expires: new Date(expireTime), secure: true, sameSite: 'None' });

      // Establecer la fecha de expiración en el localStorage
      const expirationDate = Date.now() + expirationTime * 1000;
      localStorage.setItem('tokenExpiration', expirationDate.toString());

      console.log('Token renovado exitosamente:', token);
      return token;  // Retornar el nuevo token
    } else {
      // Manejar el error, por ejemplo, redirigir al login si no se puede renovar el token
      console.error('Error al renovar el token:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al intentar renovar el token', error);
    // Redirigir a la página de login si no se puede renovar el token
    window.location.href = '/login'; // O cualquier redirección que necesites
  }
};
