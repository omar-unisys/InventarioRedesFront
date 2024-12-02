import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
    //return useContext(AuthContext);
    const context = useContext(AuthContext);
    return context || { user: null }; // Devolver un objeto con user como null
}
