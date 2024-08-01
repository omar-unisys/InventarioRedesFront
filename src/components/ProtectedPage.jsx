import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const ProtectedPage = () => {
    const { dataSecurity } = useAuth();

    if (!dataSecurity) {
        return null; // O algún indicador de carga
    }

    // Si no se coloca el id de seguridad no se controla la seguridad
    if(objSeguridad === '' || !objSeguridad)
        return <>{children}</>;

    const permission = dataSecurity.find(perm => perm.obj_nombre === objSeguridad);

    if (!permission || !permission.obj_permiso) {
        return <div className="fadein-page text-center mt-5"><h1 style={{ color: 'red' }}>Usted no tiene permisos para ingresar a este módulo. Por favor consulte con el administrador del sistema</h1></div>; // O un mensaje de "Acceso denegado"
    }

    return <>{children}</>;
}
