const getRefreshToken = async (url, token) => {
  try {
      const res = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
      });

      // Verifica si la respuesta fue exitosa
      if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
      }

      return res;
  } catch (error) {
      console.error("Error al obtener el refresh token:", error);
      throw error;  // Propaga el error para manejarlo en otro lugar si es necesario
  }
};

const getPermisos = async (url, token) => {
  try {
      const res = await fetch(url, {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      // Verifica si la respuesta fue exitosa
      if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
      }

      // Intenta convertir la respuesta a JSON
      const data = await res.json();
      return data;
  } catch (error) {
      console.error("Error al obtener permisos:", error);
      throw error;  // Propaga el error para manejarlo en otro lugar si es necesario
  }
};

const AuthApi = {
  getRefreshToken,
  getPermisos,
};

export default AuthApi;
