import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const ProtectedElement = ({ objSeguridad, children }) => {
    const { dataSecurity } = useAuth();

    if (!dataSecurity) {
        return null; // O algún indicador de carga
    }

    // Si no se coloca el id de seguridad no se controla la seguridad
    if(objSeguridad === '' || !objSeguridad)
        return <>{children}</>;

    const permission = dataSecurity.find(perm => perm.obj_nombre === objSeguridad);

    if (!permission || !permission.obj_permiso) {
        return null; // O un mensaje de "Acceso denegado"
    }

    return <>{children}</>;
}
