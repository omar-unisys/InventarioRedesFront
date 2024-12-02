import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import InventarioRedesApi from '../services/InventarioRedesApi';
import { Checkbox } from 'primereact/checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export const RegistroInventarioForm = () => {
    const { idInventarioRedes } = useParams();
    const navigate = useNavigate();
    const [inventario, setInventario] = useState({
        idSerial: '',
        idFilial: '',
        idCriticidad: '',
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
        FechaSoporte: null,
        SoporteDetalle: '',
        FechaGarantia: null,
        GarantiaDetalle: '',
        FechaEoL: null,
        EolDetalle: '',
        VrsFirmware: '',
        NumPuertos: '',
        idEstado: '',
        FechaIngreso: new Date(),
        FechaModificacion: new Date(),
        Comentario: '',
        InStock: true,
        Activo: false,
        hasError: false,
        cambioInStock: false,
        FechaInStock: null
    });
    const [errors, setErrors] = useState({
        DireccionIp: '',
    });
    const [validated, setValidated] = useState(false);
    const [title, setTitle] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await InventarioRedesApi.getAll();
            setInventario(prevState => ({
                ...prevState,
                ...data,
                InStock: data.InStock !== undefined ? data.InStock : true, // Asegura que InStock esté en true por defecto
                Activo: data.Activo !== undefined ? data.Activo : false, // Asegurat que Activo esté en false por defecto
            }));
            
            if (idInventarioRedes) {
                await getInventarioRedesBy();
            } else {
                resetForm();
            }
        };
        fetchData();
    }, [idInventarioRedes]);
    



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

        try {
            const response = await InventarioRedesApi.createInventarioRedes(inventario);

            if (response && response.idSerial) { // Ajusta esta condición según el campo que indica éxito en tu respuesta
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
            Swal.fire({
                title: '',
                text: 'Hubo un problema con la solicitud. Por favor intente de nuevo',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            console.error('Error al guardar el inventario:', error);
        }
    };

    const formatDate = (value) => {
        if (!value || isNaN(new Date(value).getTime())) {
            return ""; // Devuelve un string vacío si el valor es nulo o inválido
        } else {
            const date = new Date(value);
            return date.toISOString().split('T')[0]; // Devuelve el formato yyyy-MM-dd
        }
    };

    const getInventarioRedesBy = async () => {
        try {
            const responseData = await InventarioRedesApi.getInventarioRedesByID(idInventarioRedes);
            if (responseData.length > 0) {
                const data = responseData[0];
    
                // Asegúrate de que todos los campos tengan valores predeterminados si no están definidos
                setInventario({
                    idSerial: data.idSerial || '',
                    idFilial: data.idFilial || '',
                    idCriticidad: data.idCriticidad || '',
                    idTipoEquipo: data.idTipoEquipo || '',
                    idPropietarioFilial: data.idPropietarioFilial || '',
                    idFilialPago: data.idFilialPago || '',
                    Marca: data.Marca || '',
                    Modelo: data.Modelo || '',
                    NombreEquipo: data.NombreEquipo || '',
                    DireccionIp: data.DireccionIp || '',
                    TipoRed: data.TipoRed || '',
                    Pais: data.Pais || '',
                    Sede: data.Sede || '',
                    Edificio: data.Edificio || '',
                    Piso: data.Piso || '',
                    Ubicacion: data.Ubicacion || '',
                    TipoServicio: data.TipoServicio || '',
                    DetalleServicio: data.DetalleServicio || '',
                    Administrable: data.Administrable ?? false, // Para booleanos
                    FechaSoporte: data.FechaSoporte ? new Date(data.FechaSoporte) : new Date(),
                    SoporteDetalle: data.SoporteDetalle || '',
                    FechaGarantia: data.FechaGarantia ? new Date(data.FechaGarantia) : new Date(),
                    GarantiaDetalle: data.GarantiaDetalle || '',
                    FechaEoL: data.FechaEoL ? new Date(data.FechaEoL) : new Date(),
                    EolDetalle: data.EolDetalle || '',
                    VrsFirmware: data.VrsFirmware || '',
                    NumPuertos: data.NumPuertos || '',
                    idEstado: data.idEstado || '',
                    FechaIngreso: data.FechaIngreso ? new Date(data.FechaIngreso) : new Date(),
                    FechaModificacion: data.FechaModificacion ? new Date(data.FechaModificacion) : new Date(),
                    Comentario: data.Comentario || '',
                    InStock: data.InStock ?? true, // Asegura de que no sea undefined
                    Activo: data.Activo ?? false, // Asegura de que no sea undefined
                    FechaInStock: data.FechaInStock ? new Date(data.FechaInStock) : new Date(),
                    hasError: data.hasError ?? false, // Para cualquier otro campo booleano
                    cambioInStock: data.cambioInStock ?? false,
                });
    
                setTitle("Registro de horas - " + (data.groupActivity || 'Sin actividad'));
                setIsDisabled(true);
            } else {
                navigate("/inventario/RegistroInventarioForm", { replace: true });
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
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
                    <Accordion defaultActiveKey={['0', '1', '2', '3', '4']} alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Identificacion del equipo</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                <Col sm={4}>
    <FloatingLabel controlId="txtIdSerial" label="Serial" className="mb-3">
        <Form.Control 
            type="text" 
            placeholder="Serial"
            name='idSerial'
            value={inventario.idSerial}
            onChange={e => {
                const trimmedValue = e.target.value.trim();  // Elimina los espacios antes y después
                setInventario({ ...inventario, idSerial: trimmedValue });  // Actualiza el estado sin espacios
            }}
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
                                            <Form.Control as="select" type="select"
                                                name='idCriticidad'
                                                value={inventario.idCriticidad}
                                                onChange={e => setInventario({ ...inventario, idCriticidad: e.target.value })}
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
                                            <Checkbox
                                                inputId="chActivo"
                                                name="Activo"
                                                value="Activo"
                                                onChange={e => setInventario({ ...inventario, Activo: e.checked, cambioInstock: true})}
                                                checked={inventario.Activo} // Se asegura que el valor por defecto sea true
                                                disabled // Deshabilitar el checkbox
                                            />
                                            <label htmlFor="chActivo" className="ml-2">Activo</label>
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
                                                <option value="INTEIA">INTEIA</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="RUTA DE LOA">RUTA DE LOA</option>
                                                <option value="RUTA DEL ESTE">RUTA DEL ESTE</option>
                                                <option value="TRANSELCA">TRANSELCA</option>
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
                                                <option value="INTEIA">INTEIA</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="RUTA DE LOA">RUTA DE LOA</option>
                                                <option value="RUTA DEL ESTE">RUTA DEL ESTE</option>
                                                <option value="TRANSELCA">TRANSELCA</option>
                                                <option value="XM">XM</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione una filial de Pago
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtidFilial" label="Filial en uso" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idFilial'
                                                value={inventario.idFilial}
                                                onChange={e => setInventario({ ...inventario, idFilial: e.target.value })}
                                                required
                                            //disabled={isDisabled}
                                            >
                                                <option value="">Seleccione la filial</option>
                                                <option value="INTEIA">INTEIA</option>
                                                <option value="INTERCHILE">INTERCHILE</option>
                                                <option value="INTERNEXA">INTERNEXA</option>
                                                <option value="INTERVIAL">INTERVIAL</option>
                                                <option value="ISA">ISA</option>
                                                <option value="ISA BOLIVIA">ISA BOLIVIA</option>
                                                <option value="REP">REP</option>
                                                <option value="RUTA COSTERA">RUTA COSTERA</option>
                                                <option value="RUTA DE LOA">RUTA DE LOA</option>
                                                <option value="RUTA DEL ESTE">RUTA DEL ESTE</option>
                                                <option value="TRANSELCA">TRANSELCA</option>
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
                        <Col ><Button type="submit" variant="primary">Guardar</Button></Col>
                        <Col ></Col>
                    </Row>



                </Container>




            </Form>
        </>
    )
}
