import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import InventarioRedesApi from '../services/InventarioRedesApi';
import getAll from '../services/InventarioRedesApi';
import { Checkbox } from 'primereact/checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { data } from 'jquery';
import moment from 'moment';

export const UpdateInventarioForm = () => {
    const { idInventarioRedes } = useParams();
    const navigate = useNavigate();
    const [inventario, setInventario] = useState({
        idSerial: '',
        idFilial: '',
        idCriticidad: '',
        idCriticidadAnterior: '',
        idTipoEquipo: '',
        idPropietarioFilial: '',
        idFilialPago: '',
        Marca: '',
        Modelo: '',
        NombreEquipo: '',
        DireccionIp: '',
        TipoRed: '',
        Pais: '',
        Sede: '',
        Edificio: '',
        Piso: '',
        Ubicacion: '',
        TipoServicio: '',
        DetalleServicio: '',
        Administrable: false,
        FechaSoporte: new Date(),
        SoporteDetalle: '',
        FechaGarantia: new Date(),
        GarantiaDetalle: '',
        FechaEoL: new Date(),
        EolDetalle: '',
        VrsFirmware: '',
        NumPuertos: '',
        idEstado: '',
        FechaIngreso: new Date(),
        FechaModificacion: new Date(),
        Comentario: '',
        InStock: false,
        idModified: false,
        idSerialAnterior: "",
        cambioInStock: false,
        cambioCriticidad: false,
        FechaInStock:new Date()
    });
    const [errors, setErrors] = useState({
        DireccionIp: '',
    });
    const [validated, setValidated] = useState(false);
    const [title, setTitle] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

useEffect(() => {
    if (idInventarioRedes) {
        getInventarioRedesBy(idInventarioRedes);
    } else {
        resetForm();
    }
}, [idInventarioRedes]);

useEffect(() => {
    if (inventario.cambioInStock) {  // Verifica si ha habido un cambio en `InStock`
       const cambioInStock = true;  // Llamada para enviar el correo
    }
}, [inventario.InStock]);  // Solo se ejecuta cuando cambia el valor de `InStock`




    const resetForm = () => {
        setTitle("Registro de inventario");
        setIsDisabled(false);
    }

    const handleCancel = () => {

        navigate("/inventario/inventarioRedes", { replace: true });
    }


    const handleSubmit = e => {
        e.preventDefault();
        const form = e.currentTarget;
    
        // Validar Dirección IP si no está vacía
        if (inventario.DireccionIp !== '' && !ipv4Regex.test(inventario.DireccionIp)) {
            setErrors({
                ...errors,
                DireccionIp: 'Por favor ingrese una dirección IP válida (Formato: 192.168.1.1) o deje el campo vacío',
            });
            return; // Detener la ejecución si la IP no es válida
        }
    
        // Si el formulario es válido y la IP es correcta, guarda los datos
        if (form.checkValidity() === false) {
            // Manejar los errores de validación aquí si es necesario
        } else {
            saveInventario(); // Llama a la función para guardar los datos
        }
    
        setValidated(true);
    };

    const saveInventario = async () => {
        const datosEquipo = `
            ID Serial: ${inventario.idSerial}
            Marca: ${inventario.Marca}
            Modelo: ${inventario.Modelo}
            Nombre del Equipo: ${inventario.NombreEquipo}
            Dirección IP: ${inventario.DireccionIp}
            Tipo de Equipo: ${inventario.idTipoEquipo}
            Sede: ${inventario.Sede}
        `;
    
        let mensaje = '';
    
        // Construir el mensaje si hay cambios en stock
        if (inventario.cambioInStock) {
            if (inventario.InStock === false) {
                inventario.FechaInStock = inventario.FechaModificacion;
                mensaje += `El equipo ha pasado a estado Activo. Por favor, pasar a Monitoreo.\n\n`;
            } else {
                mensaje += `El equipo ha pasado a Stock. Por favor, quitar de Monitoreo.\n\n`;
            }
        }
    
        // Construir el mensaje si hay cambios en criticidad
        if (inventario.cambioCriticidad) {
            mensaje += `Se ha cambiado el nivel de Criticidad de "${inventario.idCriticidadAnterior}" a "${inventario.idCriticidad}".\n\n`;
        }
    
        // Agregar los detalles del equipo al final del mensaje
        if (mensaje) {
            mensaje += `Detalles del equipo:\n${datosEquipo}`;
        }
    
        // Enviar correo solo si hay un mensaje para enviar
        if (mensaje) {
            try {
                const destinatarios = await obtenerDestinatarios();
                console.log("Destinatarios: ", destinatarios);
                await InventarioRedesApi.enviarCorreoCambioInStock(inventario, mensaje, destinatarios);
                console.log("Correo enviado con los cambios:");
            } catch (error) {
                console.error("Error al enviar correo:", error);
            }
        }
    
        // Actualizar el inventario
        try {
            const response = await InventarioRedesApi.updateInventarioRedes(idInventarioRedes, inventario);
            if (response) {
                Swal.fire({
                    title: '',
                    text: 'Se ha guardado el formulario correctamente',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    navigate("/inventario/inventarioRedes", { replace: true });
                });
            } else {
                Swal.fire({
                    title: '',
                    text: 'Se generó un error al momento de guardar. Por favor intente de nuevo',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        } catch (error) {
            console.error("Error al actualizar el inventario:", error);
            Swal.fire({
                title: '',
                text: 'Se generó un error al momento de actualizar. Por favor intente de nuevo',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };
    
    
    
    
    // Función para obtener los destinatarios de la base de datos
    const obtenerDestinatarios = async () => {
        try {
            const data = await InventarioRedesApi.getEmailsDestinatarios(); // Espera el JSON directamente
            console.log("Datos recibidos de la API:", data); // Imprime la respuesta
            const correos = data.map(destinatario => destinatario.email);
            console.log("Correos extraídos:", correos);
            return correos;
        } catch (error) {
            console.error("Error en obtenerDestinatarios:", error);
            throw new Error("Error al obtener los destinatarios");
        }
    };
    
    
    
    

    

    const formatDate = (value) => {
        console.log("Fecha: ", value);
        if (!value || isNaN(new Date(value).getTime())) {
            return ""; // Devuelve un string vacío si el valor es nulo o inválido
        } else {
            const date = new Date(value);
            return date.toISOString().split('T')[0]; // Devuelve el formato yyyy-MM-dd
        }
    };
    


    const getInventarioRedesBy = async (id) => {
        try {
            const responseData = await InventarioRedesApi.getInventarioRedesByID(id);
            
            //console.log("Datos de la API:", responseData);
            
            if (responseData.length > 0) {
                const [data] = responseData;  // Desestructuración para obtener el primer elemento
    
                // Función para formatear fechas
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
                };
    
                // Actualiza los campos de fecha
                const dateFields = [
                    'FechaSoporte',
                    'FechaGarantia',
                    'FechaEoL',
                    'FechaIngreso',
                    'FechaModificacion'
                ];
                dateFields.forEach(field => {
                    if (data[field]) {
                        data[field] = formatDate(data[field]);
                    }
                });
    
                // Función para convertir valores booleanos
                const toBoolean = (value) => value === 1;
    
                // Actualiza los valores booleanos
                data.Administrable = toBoolean(data.Administrable);
                data.InStock = toBoolean(data.InStock);
    
                // Verifica qué campos están siendo establecidos
                console.log("Datos que se van a establecer:", data);
    
                // Actualiza el estado con el primer elemento, asegurando que todos los campos se asignen
                setInventario({
                    ...data // Directamente establece data sin el estado previo
                });
    
                // Configura el título
                setTitle(`Registro del serial - ${data.idSerial}`);
                setIsDisabled(false); // Asegúrate de habilitar el formulario
    
            } else {
                navigate("/inventario/UpdateInventarioForm", { replace: true });
            }
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            // Manejo de errores según sea necesario
        }
    };
    
    
    
    
    // Expresión regular para validar IPv4
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInventario({ ...inventario, [name]: value });

        // Validar Dirección IP
        if (name === 'DireccionIp') {
            if (!ipv4Regex.test(value)) {
                setErrors({
                    ...errors,
                    DireccionIp: 'Por favor ingrese una dirección IP válida (Formato: 192.168.1.1) o deje el campo vacío',
                });
            } else {
                setErrors({ ...errors, DireccionIp: '' });
            }
        }
    };
    

    const handleDateChange = (fieldName) => (e) => {
        const inputValue = e.target.value;
        if (inputValue) {
            const [year, month, day] = inputValue.split('-');
            const newDate = new Date(year, month - 1, day);
            setInventario((prevInventario) => {
                const updatedInventario = { ...prevInventario, [fieldName]: newDate };
                //console.log(updatedInventario); // Agregar aquí
                return updatedInventario;
            });
        } else {
            setInventario((prevInventario) => {
                const updatedInventario = { ...prevInventario, [fieldName]: null };
                //console.log(updatedInventario); // Agregar aquí
                return updatedInventario;
            });
        }
    };
    
    
    
    
    return (
        <>
            
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <h4 className='titleCenter'>{title}</h4>
                

                <Container>
                    <Accordion defaultActiveKey={['0', '1', '2', '3','4']} alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Identificacion del equipo</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm={4}>
                                        <FloatingLabel controlId="txtIdSerial" label="Serial" className="mb-3">
                                            <Form.Control type="text" placeholder="Serial"
                                                name='idSerial'
                                                value={inventario.idSerial || ''}
                                                onChange={e => setInventario({ ...inventario, idSerial: e.target.value, idModified: true, idSerialAnterior: inventario.idSerial })}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor Ingrese el Serial
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtMarca" label="Marca" className="mb-4">
                                            <Form.Control type="text" placeholder="Marca"
                                                name='Marca'
                                                value={inventario.Marca || ""}
                                                onChange={e => setInventario({ ...inventario, Marca: e.target.value })}
                                                disabled={false}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtModelo" label="Modelo" className="mb-3">
                                            <Form.Control type="text" placeholder="Modelo"
                                                name='Modelo'
                                                value={inventario.Modelo || ""}
                                                onChange={e => setInventario({ ...inventario, Modelo: e.target.value })}
                                            //disabled={isDisabled}
                                            //style={{ height: '100px' }} 
                                            />
                                        </FloatingLabel>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtNombreEquipo" label="Nombre del Equipo" className="mb-3">
                                            <Form.Control type="text" placeholder="Nombre del Equipo"
                                                name='NombreEquipo'
                                                value={inventario.NombreEquipo || ""}
                                                onChange={e => setInventario({ ...inventario, NombreEquipo: e.target.value })}
                                            //disabled={isDisabled}
                                            //style={{ height: '100px' }} 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtVrsFirmware" label="Versión del Firmware" className="mb-3">
                                            <Form.Control type="text" placeholder="Versión del Firmware"
                                                name='VrsFirmware'
                                                value={inventario.VrsFirmware || ""}
                                                onChange={e => setInventario({ ...inventario, VrsFirmware: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>


                                    </Col>
                                    <Col sm>
                                    <FloatingLabel controlId="txtDireccionIp" label="Dirección IP" className="mb-3">
                                            <Form.Control
                                                type="text"
                                                placeholder="Dirección IP"
                                                name='DireccionIp'
                                                value={inventario.DireccionIp || ""}
                                                onChange={handleInputChange}
                                                isInvalid={errors.DireccionIp !== ''}
                                            />

                                            <Form.Control.Feedback type="invalid">
                                                {errors.DireccionIp}
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Criticidad y Estado</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm>
                                    <FloatingLabel controlId="txtCriticidad" label="Criticidad" className="mb-3">
    <Form.Control as="select"
        name='idCriticidad'
        value={inventario.idCriticidad}
        onChange={e => {
            const nuevoValor = e.target.value;
            setInventario(prevInventario => ({
                ...prevInventario,
                idCriticidad: nuevoValor,
                cambioCriticidad: nuevoValor !== prevInventario.idCriticidad, // Verifica si hay cambio
                idCriticidadAnterior: prevInventario.idCriticidad // Guarda el valor anterior
            }));
        }}
    >
        <option value="">Seleccione el nivel de Criticidad</option>
        <option value="Baja">Baja</option>
        <option value="Media">Media</option>
        <option value="Alta">Alta</option>
        <option value="Muy Alta">Muy Alta</option>
    </Form.Control>
    <Form.Control.Feedback type="invalid">
        Por favor seleccione un nivel de Criticidad
    </Form.Control.Feedback>
</FloatingLabel>


                                    </Col>
                                    <Col sm>

                                        <div className="flex align-items-center">
                                            <Checkbox inputId="chAdministrable" name="Administrable" value="Administrable"

                                                onChange={e => setInventario({ ...inventario, Administrable: e.checked })}

                                                checked={inventario.Administrable || false}>


                                            </Checkbox>
                                            <label htmlFor="chAdministrable" className="ml-2">Administrable</label>
                                        </div>

                                    </Col>
                                    
                                    <Col sm>
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="chInStock" name="InStock" value="InStock"
                                                onChange={e => setInventario({ ...inventario, InStock: e.checked, cambioInStock:true })}
                                                checked={inventario.InStock || false}>
                                            </Checkbox>
                                            <label htmlFor="chInStock" className="ml-2">En Stock</label>
                                        </div>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Características del equipo</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidTipoEquipo" label="Tipo de equipo" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idTipoEquipo'
                                                value={inventario.idTipoEquipo}
                                                onChange={e => setInventario({ ...inventario, idTipoEquipo: e.target.value })}
                                                required
                                            >
                                                <option value="">Seleccione el tipo de equipo</option>
                                                <option value="Comunicaciones">Comunicaciones</option>
                                                <option value="Fuente">Fuente</option>
                                                <option value="Router">Router</option>
                                                <option value="Switche">Switche</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione un tipo de Equipo
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtNumPuertos" label="Número de Puertos" className="mb-3">
                                            <Form.Control type="text" placeholder="Número de Puertos"
                                                name='NumPuertos'
                                                value={inventario.NumPuertos || ""}
                                                onChange={e => setInventario({ ...inventario, NumPuertos: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtTipoServicio" label="Tipo de Servicio" className="mb-3">
                                            <Form.Control type="text" placeholder="Tipo de Servicio"
                                                name='TipoServicio'
                                                value={inventario.TipoServicio || ""}
                                                onChange={e => setInventario({ ...inventario, TipoServicio: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtDetalleServicio" label="Detalle Servicio" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Servicio"
                                                name='DetalleServicio'
                                                value={inventario.DetalleServicio || ""}
                                                onChange={e => setInventario({ ...inventario, DetalleServicio: e.target.value })}

                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtTipoRed" label="Tipo de Red" className="mb-3">
                                            <Form.Control type="text" placeholder="Tipo de Red"
                                                name='TipoRed'
                                                value={inventario.TipoRed || ""}
                                                onChange={e => setInventario({ ...inventario, TipoRed: e.target.value })}

                                            />
                                        </FloatingLabel>

                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidEstado" label="Estado" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idEstado'
                                                value={inventario.idEstado}
                                                onChange={e => setInventario({ ...inventario, idEstado: e.target.value })}
                                                required
                                                disabled={isDisabled}>
                                                <option value="">Seleccione un Estado</option>
                                                <option value="Configurado">Configurado</option>
                                                <option value="Disponible">Disponible</option>
                                                <option value="Malo">Malo</option>
                                                <option value="Prestamo">Prestamo</option>
                                                <option value="Utilizado">Utilizado</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione un Estado
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Ubicación y Sede</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtPais" label="País" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='Pais'
                                                value={inventario.Pais}
                                                onChange={e => setInventario({ ...inventario, Pais: e.target.value })}

                                                disabled={isDisabled}>
                                                <option value="">Seleccione un País</option>
                                                <option value="Bolivia">Bolivia</option>
                                                <option value="Brasil">Brasil</option>
                                                <option value="Chile">Chile</option>
                                                <option value="Colombia">Colombia</option>
                                                <option value="Peru">Perú</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione un País
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtSede" label="Sede" className="mb-3">
                                            <Form.Control type="text" placeholder="Sede"
                                                name='Sede'
                                                value={inventario.Sede || ""}
                                                onChange={e => setInventario({ ...inventario, Sede: e.target.value })}
                                            //disabled={isDisabled} 
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtEdificio" label="Edificio" className="mb-3">
                                            <Form.Control type="text" placeholder="Edificio"
                                                name='Edificio'
                                                value={inventario.Edificio || ""}
                                                onChange={e => setInventario({ ...inventario, Edificio: e.target.value })}
                                            //disabled={isDisabled} 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm={2}>
                                        <FloatingLabel controlId="txtPiso" label="Piso" className="mb-3">
                                            <Form.Control type="text" placeholder="Piso"
                                                name='Piso'
                                                value={inventario.Piso || ""}
                                                onChange={e => setInventario({ ...inventario, Piso: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>


                                </Row>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtUbicacion" label="Ubicación" className="mb-3">
                                            <Form.Control type="text" placeholder="Ubicación"
                                                name='Ubicacion'
                                                value={inventario.Ubicacion || ""}
                                                onChange={e => setInventario({ ...inventario, Ubicacion: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidPropietarioFilial" label="Filial Propietaria" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idPropietarioFilial'
                                                value={inventario.idPropietarioFilial}
                                                onChange={e => setInventario({ ...inventario, idPropietarioFilial: e.target.value })}

                                            >
                                                <option value="">Seleccione la filial propietaria</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="XM">XM</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione una filial propietaria
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtidFilialPago" label="Filial de pago" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idFilialPago'
                                                value={inventario.idFilialPago}
                                                onChange={e => setInventario({ ...inventario, idFilialPago: e.target.value })}
                                            >
                                                <option value="">Seleccione la filial de Pago</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="XM">XM</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione una filial de Pago
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtidFilial" label="Filial" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idFilial'
                                                value={inventario.idFilial}
                                                onChange={e => setInventario({ ...inventario, idFilial: e.target.value })}
                                                required
                                            //disabled={isDisabled}
                                            >
                                                <option value="">Seleccione la filial</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="XM">XM</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione una filial
                                            </Form.Control.Feedback>
                                        </FloatingLabel>

                                    </Col>

                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="4">
                            <Accordion.Header>Garantía y Fechas de Control</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaSoporte" label="Fecha Vencimiento de Soporte" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Soporte"
                                                name='FechaSoporte'
                                                value={inventario.FechaSoporte ? formatDate(inventario.FechaSoporte) : ""}
                                                onChange={handleDateChange('FechaSoporte')}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtSoporteDetalle" label="Detalle Soporte" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Soporte"
                                                name='SoporteDetalle'
                                                value={inventario.SoporteDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, SoporteDetalle: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaGarantia" label="Fecha Vencimiento Garantía" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Garantía"
                                                name='FechaGarantia'
                                                value={inventario.FechaGarantia ? formatDate(inventario.FechaGarantia) : ""}
                                                onChange={handleDateChange('FechaGarantia')}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtGarantiaDetalle" label="Detalle de Garantía" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle de Garantía"
                                                name='GarantiaDetalle'
                                                value={inventario.GarantiaDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, GarantiaDetalle: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaEoL" label="Fecha EoL" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha Eol"
                                                name='FechaEoL'
                                                value={inventario.FechaEoL ? formatDate(inventario.FechaEoL) : ""}
                                                onChange={handleDateChange('FechaEoL')}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtEolDetalle" label="Detalle Eol" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Eol"
                                                name='EolDetalle'
                                                value={inventario.EolDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, EolDetalle: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                </Row>
                                <Row>


                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaIngreso" label="Fecha de Ingreso" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Ingreso"
                                                name='FechaIngreso'
                                                value={inventario.FechaIngreso ? formatDate(inventario.FechaIngreso) : ""}
                                                onChange={handleDateChange('FechaIngreso')}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaModificacion" label="Fecha de Modificación" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Modificación"
                                                name='FechaModificacion'
                                                value={inventario.FechaModificacion ? formatDate(inventario.FechaModificacion) : ""}
                                                onChange={handleDateChange('FechaModificacion')}
                                                disabled={true}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtComentario" label="Comentario" className="mb-3">
                                            <Form.Control type="text" placeholder="Comentario"
                                                name='Comentario'
                                                value={inventario.Comentario || ""}
                                                onChange={e => setInventario({ ...inventario, Comentario: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Row className="justify-content-md-center mb-3" >
                        <Col ></Col>
                        <Col ><Button variant="danger" onClick={handleCancel}>Cancelar</Button></Col>
                        <Col ><Button type="submit" variant="primary">Actualizar</Button></Col>
                        <Col ></Col>
                    </Row>



                </Container>




            </Form>
        </>
    )
}
