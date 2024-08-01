import Cookies from 'js-cookie';
import AuthApi from '../services/AuthApi';

export const RefreshToken = async () => {
  const keyName = 'jwt_token_fact';
  const token_ = JSON.parse(Cookies.get(keyName));

  // token_ = JSON.parse(token_);
  console.log(token_);

  try {
    
    const url = import.meta.env.VITE_URL_SEGURIDAD + 'refresh/';

    const response = await AuthApi.getRefreshToken(url,token_);
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token_}`
    //   }
    // });

    const data = await response.json();

    if (response.ok) {
      const { token, expirationTime } = data;


      var now = new Date();
      var time = now.getTime();
      var expireTime = time + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);

      Cookies.set(keyName, JSON.stringify(token), { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });

      
      const expirationDate = Date.now() + expirationTime * 1000
      localStorage.setItem('tokenExpiration', expirationDate);
      return token;
    } else {
      // Maneja el error según sea necesario (redireccionar a login, mostrar mensaje, etc.)
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error refreshing token', error);
  }
};