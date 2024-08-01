import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

// Minutos para el timeout
const minIdle = parseInt(import.meta.env.VITE_TIMEOUT_SESSION);

export const useIdleTimer = (onIdle, timeout = 1000 * 60 * minIdle) => {
    const resetTimerRef = useRef(null); // Crear un ref para resetTimer

    useEffect(() => {
        let timer;
    
        const resetTimer = () => {
          const keyName = 'dateSession_fact';
          const now = new Date();
          const time = now.getTime();
          const expireTime = time + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);
          const dateSession = Cookies.get(keyName);
    
          if (dateSession !== 'null') {
            Cookies.set(keyName, now, { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });
          }
    
          clearTimeout(timer);
          timer = setTimeout(onIdle, timeout);
        };
    
        resetTimerRef.current = resetTimer; // Asignar resetTimer al ref
    
        const handleActivity = () => {
          resetTimer();
        };
    
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('touchstart', handleActivity);
    
        resetTimer();
    
        return () => {
          clearTimeout(timer);
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
          window.removeEventListener('scroll', handleActivity);
          window.removeEventListener('touchstart', handleActivity);
        };
      }, [onIdle, timeout]);

  return resetTimerRef.current; // Retornar el ref
}
