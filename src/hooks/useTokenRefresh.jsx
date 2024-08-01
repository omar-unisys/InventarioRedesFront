import { useEffect } from 'react';
import { RefreshToken } from '../helpers/RefreshToken';

export const useTokenRefresh = () => {
    useEffect(() => {
        const interval = setInterval(async () => {
            const expirationTime = localStorage.getItem('tokenExpiration');
            const now = Date.now();

            // Refresca el token si falta menos de 5 minutos para que expire
            if (now >= expirationTime - 5 * 60 * 1000) {
            console.log('Se ejecuta el refreshToken');
            await RefreshToken();
            }
            console.log('Se ejecuta el hook');
        }, 3 * 60 * 1000); // Verifica cada 5 minutos
        
        return () => clearInterval(interval);
    }, []);
}
