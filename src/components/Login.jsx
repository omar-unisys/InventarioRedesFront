import React, {useState, useEffect} from 'react';
import './Login.css';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import { FloatingLabel, Form, InputGroup, Button } from 'react-bootstrap';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';


export const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    //Se usa para redireccionar al home en caso de que ya se encuentre loggeado
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const [showPasswordLogin, setShowPasswordLogin] = useState(false);

    const togglePasswordLoginVisibility = () => {
        setShowPasswordLogin(!showPasswordLogin);
    };

    const [validated, setValidated] = useState(false);

    const handleClickLogging = async (e) => {
        const form = document.getElementById('frmLogging');

        if (form.checkValidity() === false) {
        setValidated(true); // Marcar el formulario como validado para mostrar los mensajes de validación
        return;
        }

        login({ user: {nombres: 'Julian', apellidos: 'Peña Gallego'}, token: 'asdasdafdfsdfsdf', dateSession: '' });

    };

  
    const [formDataLogging, setFormDataLogging] = useState({
        usuario: '',
        contra: '',
        nuevaContra: '',
        confirmNuevaContra: ''
    });

    const handleChangeLogging = (e) => {
        const { name, value } = e.target;
        setFormDataLogging(prevState => ({
        ...prevState,
        [name]: value
        }));
    };
  return (
    <div id='Login'>
      <main>

        <div className="fondo-con-opacidad" >
          <div className="opacidad-negra"></div>
        </div>
        <div className="contenido">
            <p className='titulo' >Facturación grupo ISA</p>
        </div>
        
        <div>
          <div className='container'>
            <div className='row'>&nbsp;</div>
            <div className='row'>
              <div className='col-lg-4'></div>
              <div className='col-lg-4'>
                {/* <span>¿No tienes un usuario?</span><button className='link' onClick={handleShowCreateUser}>CRÉALO AQUÍ</button> */}
              </div>
            </div>
            <div className='row'>&nbsp;</div>
            <div className='row'>
              <div className='col-lg-4'></div>
              <div className='col-lg-4'>
                <Form id="frmLogging" noValidate validated={validated}>
                  <FloatingLabel controlId="txtUsuario" label="Ingrese su usuario" className="mb-3">
                    <Form.Control type="text" onKeyDown={(e) => {if (e.key === "Enter") handleClickLogging();}} placeholder="Ingrese su usuario" name='usuario' value={formDataLogging.usuario} onChange={handleChangeLogging} required autoFocus={true} />
                  </FloatingLabel>
                  <FloatingLabel controlId="txtPassword" label="Ingrese su contraseña" className="mb-3">
                    <Form.Control type={showPasswordLogin ? 'text' : 'password'} onKeyDown={(e) => {if (e.key === "Enter") handleClickLogging();}} placeholder="Ingrese su contraseña" name='contra' value={formDataLogging.contra} onChange={handleChangeLogging} required />
                    <InputGroup.Text onClick={togglePasswordLoginVisibility} className='eye'>
                      {showPasswordLogin ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
                    </InputGroup.Text>
                  </FloatingLabel>
                  <Button id='btnIniciarSesion' variant="primary" className="btn btn-lg" onClick={handleClickLogging}>
                    Iniciar Sesión 
                  </Button>
                </Form>
              </div>
            </div>
            <div className='row'>&nbsp;</div>
            <div className='row'>
              <div className='col-lg-4'></div>
              <div className='col-lg-4'>
                {/* <span>¿Olvidaste tu contraseña?</span><button className='link' onClick={handleShowRecovery}>Recupérala AQUÍ</button> */}
              </div>
            </div>
            <div className='row'>&nbsp;</div>
            
            <div className='row'>&nbsp;</div>
            <div className='row'>&nbsp;</div>
            {/* <div className='row'>
              <div className='col-lg-3'></div>
              <div className='col-lg-3'>
                <button type="button" className="btn btn-primary btn-lg">Iniciar sesión</button>
              </div>
              <div className='col-lg-3'>
                <button type="button" className="btn btn-primary btn-lg" onClick={handleShow}>Registrarme</button>
              </div>
            </div> */}
          </div>
        </div>
      </main>

    </div>
  )
}
