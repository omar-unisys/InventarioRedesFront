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


export const ReemplazarInventarioForm = () => {
    const { idInventarioRedes } = useParams();
    console.log("Parametros " + idInventarioRedes);
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
        FechaSoporte: '',
        SoporteDetalle: '',
        FechaGarantia: '',
        GarantiaDetalle: '',
        FechaEoL: '',
        EolDetalle: '',
        VrsFirmware: '',
        NumPuertos: '',
        idEstado: '',
        FechaIngreso: '',
        FechaModificacion: '',
        Comentario: '',
        Conectado: false,
        InStock: false
    });

    const [validated, setValidated] = useState(false);
    const [title, setTitle] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);


    useEffect(() => {
        InventarioRedesApi.getAll().then((data) => setInventario(data));
        idInventarioRedes ? getInventarioRedesBy() : resetForm();
    }, []);


    const resetForm = () => {
        setTitle("Reemplazo del serial "+ responseData[0].idSerial);
        setIsDisabled(false);
    }

    const handleCancel = () => {

        navigate("/inventario/inventarioRedes", { replace: true });
    }


    const handleSubmit = e => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            //console.log(form);
        } else {
            //Guardar los datos
            saveInventario();

        }
        setValidated(true);
    }

    const saveInventario = async () => {
        await InventarioRedesApi.updateInventarioRedes(idInventarioRedes, inventario).then(response => {
            
            if (!response) {
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
        });
    }

    const formatDate = (value) => {
        console.log("Valor: " + value);
        if (value == "Wed Dec 31 1969 19:00:00 GMT-0500 (Colombia Standard Time)" || value == null) {
            return "";
        } else {
            return value.toLocaleDateString('fr-CA', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

    };


    const getInventarioRedesBy = async () => {
        await InventarioRedesApi.getInventarioRedesByID(idInventarioRedes).then(responseData => {
            if (responseData.length > 0) {

                setInventario(responseData[0]);
                console.log(responseData[0]);

                responseData[0].FechaSoporte = formatDate(new Date(responseData[0].FechaSoporte));
                responseData[0].FechaGarantia = formatDate(new Date(responseData[0].FechaGarantia));
                responseData[0].FechaEoL = formatDate(new Date(responseData[0].FechaEoL));
                responseData[0].FechaIngreso = formatDate(new Date(responseData[0].FechaIngreso));
                responseData[0].FechaModificacion = formatDate(new Date(responseData[0].FechaModificacion));

                if (responseData[0].Administrable == 1) {
                    responseData[0].Administrable = true;
                } else {
                    responseData[0].Administrable = false;
                }
                if (responseData[0].Conectado == 1) {
                    responseData[0].Conectado = true;
                } else {
                    responseData[0].Conectado = false;
                }
                if (responseData[0].InStock == 1) {
                    responseData[0].InStock = true;
                } else {
                    responseData[0].InStock = false;
                }
                console.log(responseData[0].FechaSoporte);
                setTitle("Reemplazo del serial - " + responseData[0].idSerial);


            } else {
                navigate("/inventario/ReemplazarInventarioForm", { replace: true });
            }
        });
    }

//Botnones de Control del Inventario en la Cabecera
const renderHeader = () => {
    return (
        <div className="gap-2 align-items-center justify-content-between titleCenter" >
            Hola Esto es una prueb
        </div>
    );
};

const header = renderHeader();

    return (
        <>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <h4 className='titleCenter'>{title}</h4>

                <h6>{header}</h6>

                <Container>
                    <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Identificacion del equipo</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm={4}>
                                        <FloatingLabel controlId="txtIdSerial" label="Nuevo Serial" className="mb-3">
                                            <Form.Control type="text" placeholder="Nuevo Serial"
                                                name='idSerial'
                                                defaultValue={""}
                                                //value={inventario.idSerial}
                                                onChange={e => setInventario({ ...inventario, idSerial: e.target.value })}
                                                required
                                                //disabled={true}
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
                                                //value={inventario.Marca || ""}
                                                onChange={e => setInventario({ ...inventario, Marca: e.target.value })}
                                                disabled={false}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtModelo" label="Modelo" className="mb-3">
                                            <Form.Control type="text" placeholder="Modelo"
                                                name='Modelo'
                                                //value={inventario.Modelo || ""}
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
                                                //value={inventario.NombreEquipo || ""}
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
                                                //value={inventario.VrsFirmware || ""}
                                                onChange={e => setInventario({ ...inventario, VrsFirmware: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>


                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtDireccionIp" label="Direccion Ip" className="mb-3">
                                            <Form.Control type="text" placeholder="Direccion Ip"
                                                name='DireccionIp'
                                                //value={inventario.DireccionIp || ""}
                                                onChange={e => setInventario({ ...inventario, DireccionIp: e.target.value })}
                                            //disabled={isDisabled} 
                                            />
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
                                                required
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
                                            <Checkbox inputId="chConectado" name="Conectado" value="Conectado"
                                                onChange={e => setInventario({ ...inventario, Conectado: e.checked })}
                                                checked={inventario.Conectado || false}>
                                            </Checkbox>
                                            <label htmlFor="chConectado" className="ml-2">Conectado</label>
                                        </div>
                                    </Col>
                                    <Col sm>
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="chInStock" name="InStock" value="InStock"
                                                onChange={e => setInventario({ ...inventario, InStock: e.checked })}
                                                checked={ true}>  disabled={true}
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
                                                //value={inventario.idTipoEquipo}
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
                                                //value={inventario.NumPuertos || ""}
                                                onChange={e => setInventario({ ...inventario, NumPuertos: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtTipoServicio" label="Tipo de Servicio" className="mb-3">
                                            <Form.Control type="text" placeholder="Tipo de Servicio"
                                                name='TipoServicio'
                                                //value={inventario.TipoServicio || ""}
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
                                                //value={inventario.DetalleServicio || ""}
                                                onChange={e => setInventario({ ...inventario, DetalleServicio: e.target.value })}

                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtTipoRed" label="Tipo de Red" className="mb-3">
                                            <Form.Control type="text" placeholder="Tipo de Red"
                                                name='TipoRed'
                                                //value={inventario.TipoRed || ""}
                                                onChange={e => setInventario({ ...inventario, TipoRed: e.target.value })}

                                            />
                                        </FloatingLabel>

                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidEstado" label="Estado" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idEstado'
                                                //value={inventario.idEstado}
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

                                                disabled={true}>
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
                                                disabled={true}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtEdificio" label="Edificio" className="mb-3">
                                            <Form.Control type="text" placeholder="Edificio"
                                                name='Edificio'
                                                value={inventario.Edificio || ""}
                                                onChange={e => setInventario({ ...inventario, Edificio: e.target.value })}
                                                disabled={true}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm={2}>
                                        <FloatingLabel controlId="txtPiso" label="Piso" className="mb-3">
                                            <Form.Control type="text" placeholder="Piso"
                                                name='Piso'
                                                value={inventario.Piso || ""}
                                                onChange={e => setInventario({ ...inventario, Piso: e.target.value })}
                                                disabled={true}
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
                                                disabled={true}
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

                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Garantía y Fechas de Control</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaSoporte" label="Fecha de Soporte" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Soporte"
                                                name='FechaSoporte'
                                                /*value={new Date(inventario.FechaSoporte).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                */
                                                onChange={e => setInventario({ ...inventario, FechaSoporte: e.target.value })}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtSoporteDetalle" label="Detalle Soporte" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Soporte"
                                                name='SoporteDetalle'
                                                //value={inventario.SoporteDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, SoporteDetalle: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaGarantia" label="Fecha de Garantía" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Garantía"
                                                name='FechaGarantia'
                                                /*value={new Date(inventario.FechaGarantia).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                    */
                                                onChange={e => setInventario({ ...inventario, FechaGarantia: e.target.value })}
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
                                                //value={inventario.GarantiaDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, GarantiaDetalle: e.target.value })}
                                            //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaEoL" label="Fecha EoL" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha Eol"
                                                name='FechaEoL'
                                                /*value={new Date(inventario.FechaEoL).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                */
                                                onChange={e => setInventario({ ...inventario, FechaEoL: e.target.value })}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtEolDetalle" label="Detalle Eol" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Eol"
                                                name='EolDetalle'
                                                //value={inventario.EolDetalle || ""}
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
                                                /*value={new Date(inventario.FechaIngreso).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                */
                                                onChange={e => setInventario({ ...inventario, FechaIngreso: e.target.value })}
                                            //disabled 
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaModificacion" label="Fecha de Modificación" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Modificación"
                                                name='FechaModificacion'
                                                value={new Date(inventario.FechaModificacion).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                onChange={e => setInventario({ ...inventario, FechaModificacion: e.target.value })}
                                                disabled ={true}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtComentario" label="Comentario" className="mb-3">
                                            <Form.Control type="text" placeholder="Comentario"
                                                name='Comentario'
                                                //value={inventario.Comentario || ""}
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
                        <Col ><Button type="submit" variant="primary">Reemplazar</Button></Col>
                        <Col ></Col>
                    </Row>



                </Container>




            </Form>
        </>
    )
}
