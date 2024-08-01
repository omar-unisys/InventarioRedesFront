import { useState } from "react";
import Cookies from 'js-cookie';

export const useLocalStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // const value = window.localStorage.getItem(keyName);
            const value = Cookies.get(keyName);

            if (value) {
            return JSON.parse(value);
            } else {
            let now = new Date();
            let time = now.getTime();
            //let expireTime = time + 1000 * 60 * parseInt(process.env.REACT_APP_TIMEOUT_COOKIES);
            let expireTime = time + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);
            Cookies.set(keyName, JSON.stringify(defaultValue), { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });
            // window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
            return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });
    const setValue = (newValue) => {
    try {
        let now = new Date();
        let time = now.getTime();
        let expireTime = time + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);

        Cookies.set(keyName, JSON.stringify(newValue), { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });
        // window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
        console.log(err);
    }
    setStoredValue(newValue);
    };

    return [storedValue, setValue];
}
