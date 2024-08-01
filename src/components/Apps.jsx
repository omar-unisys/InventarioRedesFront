import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Apps.css';
import AuthApi from '../services/AuthApi';

export const Apps = () => {
    const { user, token } = useAuth();
    const [apps, setApps] = useState([]);
    const [error, setError] = useState(null);
    // const [isAdmin, setIsAdmin] = useState(false);
    // token = JSON.parse(token);

    useEffect(() => {
        permisosUsuario();
    }, [user.usuario, token]);

    const permisosUsuario = async()=>{
        const url = `${import.meta.env.VITE_URL_SEGURIDAD + 'permisosusuario/'}${user.usuario}`;
        await AuthApi.getPermisos(url, token).then(responseData => {
            if (responseData.error) {
            setError(responseData.error);
            } else {
            //Se reestructura el json sólo con las propiedades idaplicacion, nombreaplicacion, url, imagen
            responseData = responseData.map(u => ({idaplicacion: u.idaplicacion, nombreaplicacion: u.nombreaplicacion, url: u.url, imagen: u.imagen}));
            
            //Se eliminan los duplicados
            const ids = responseData.map(({ nombreaplicacion }) => nombreaplicacion);
            responseData = responseData.filter(({ nombreaplicacion }, index) => !ids.includes(nombreaplicacion, index + 1));

            // setIsAdmin(responseData.filter(({ idaplicacion }, index) => idaplicacion === import.meta.env.REACT_APP_IDAPP));

            //Se filtra el json si viene algún permiso del sistema de seguridad
            responseData = responseData.filter(({ idaplicacion }, index) => idaplicacion !== import.meta.env.REACT_APP_IDAPP);

            setApps(responseData);
            }
        })
        .catch(error => {
            console.log(error);
            setError('No se pudo cargar la información de las aplicaciones. Por favor contacte al administrador del sistema');
        });
    }

    // const handleSubmit = (appUrl, event) => {
    //   event.preventDefault();
    //   const form = document.createElement('form');
    //   form.method = 'POST';
    //   form.action = appUrl;
    //   form.target = '_blank';

    //   const tokenField = document.createElement('input');
    //   tokenField.type = 'hidden';
    //   tokenField.name = 'token';
    //   tokenField.value = token;
    //   form.appendChild(tokenField);

    //   document.body.appendChild(form);
    //   form.submit();
    //   document.body.removeChild(form);
    // };
  return (
    <div id='apps' className="fadein-page text-center mt-5">
      <div className='container'>
        <div className='row'>
          {apps.length > 0 ? (
            apps.map((app, index) => (
              <div key={index} className='col-md-2 mt-3'>
                <a href={app.url} target='_blank' rel="noreferrer">
                  <img
                    className="img-responsive img-app"
                    alt={app.nombreaplicacion}
                  />
                  <br />
                  <span className='tituloApp'>{app.nombreaplicacion}</span>
                </a>

                {/* <div
                    role="link"
                    tabIndex="0"
                    onClick={(e) => handleSubmit(app.url, e)}
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        className="img-responsive img-app"
                        alt={app.nombreaplicacion}
                        src={app.imagen ? `data:image/png;base64,${byteArrayToBase64(app.imagen.data)}` : './img/app.png'}
                    />
                    <br />
                    <span className='tituloApp'>{app.nombreaplicacion}</span>
                </div> */}

              </div>
            ))
          ) : (
            <div>
              <br />
              <br />
              <span className='empty-apps'>{error || '¡Usted no tiene acceso a ninguna aplicación, por favor cominicarse con el administrador del portal!'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
