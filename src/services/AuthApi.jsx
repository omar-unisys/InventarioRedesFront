const getRefreshToken = async(url, token)=>{
    const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    //const data = await res.json();
    return res;
}   

const getPermisos = async(url, token)=>{
    const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    const data = await res.json();
    return data;
}  

const AuthApi = {
    getRefreshToken,
    getPermisos
}

export default AuthApi;