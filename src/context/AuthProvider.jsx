import { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Cookies from 'js-cookie';
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("user_fact", null);
    const [token, setToken] = useLocalStorage("jwt_token_fact", null);
    const [dateSession, setDateSession] = useLocalStorage("dateSession_fact", null);
    const navigate = useNavigate();
    const currentLocation = useLocation(); // Renombrar a currentLocation

    // call this function when you want to authenticate the user
    const login = useCallback(async (data) => {

        const { user, token, expirationTime } = data;

        const expirationDate = Date.now() + expirationTime * 1000;
        
        localStorage.setItem('tokenExpiration', expirationDate);

        setUser(user);
        setToken(token);
        setDateSession(Date.now());
        navigate("/");
    }, [setUser, setToken, setDateSession, navigate]);

    // call this function to sign out logged in user
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setDateSession(null);
        navigate("/login", { replace: true });
    }, [setUser, setToken, setDateSession, navigate]);

    // call this function when you want to authenticate the user
    const refreshSession = useCallback(async (data) => {
        setDateSession(data);
    }, [setDateSession]);

    const checkCookieExpiry = useCallback(() => {
        const token2 = Cookies.get('jwt_token_fact');
        const user2 = Cookies.get('user_fact');
        if (user2 === "null" || token2 === "null" || !user2 || !token2) {
        logout();
        }
    }, [logout]);

    useEffect(() => {
        if (currentLocation.pathname !== "/login") { // Usar currentLocation en lugar de location
        checkCookieExpiry();
        }
    }, [currentLocation.pathname, checkCookieExpiry]);

    const value = useMemo(
        () => ({
          user,
          token,
          dateSession,
          login,
          logout,
          refreshSession,
        }),
        [user, token, dateSession, login, logout, refreshSession]
      );

  return (
    <AuthContext.Provider
        value={value}>
        {children}
    </AuthContext.Provider>
  )
}
