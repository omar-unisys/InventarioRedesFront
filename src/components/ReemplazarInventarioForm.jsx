import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Button } from 'primereact/button';
import InventarioRedesApi from '../services/InventarioRedesApi';
import { Checkbox } from 'primereact/checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import 'primeicons/primeicons.css';
import { Divider } from 'primereact/divider';


export const ReemplazarInventarioForm = () => {
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

    const [inventarioSaliente, setInventarioSaliente] = useState({
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

    const handleClear = () => {
        setInventario({
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
    };

    const [inventarioTable, setInventarioTable] = useState([]);
    const [validated, setValidated] = useState(false);
    //const [title, setTitle] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [newIdInventario, setValue] = useState('');
    

    useEffect(() => {
        InventarioRedesApi.getAll().then((data) => setInventario(data));
        //idInventarioRedes ? getInventarioRedesBy() : resetForm();
        InventarioRedesApi.getInventarioRedesByID(idInventarioRedes).then((dataInvTable) => setInventarioTable(getDates(dataInvTable)));
    }, []);

    const getDates = (data) => {
        return [...(data || [])].map((d) => {
            d.FechaSoporte = new Date(d.FechaSoporte);
            d.FechaGarantia = new Date(d.FechaGarantia);
            d.FechaEoL = new Date(d.FechaEoL);
            d.FechaIngreso = new Date(d.FechaIngreso);
            d.FechaModificacion = new Date(d.FechaModificacion);
            if (d.InStock == 1)
                d.InStock = "Si"
            else
                d.InStock = "No"

            if (d.Conectado == 1)
                d.Conectado = "Si"
            else
                d.Conectado = "No"
            if (d.Administrable == 1)
                d.Administrable = "Si"
            else
                d.Administrable = "No"
            return d;
        });
    };
    

    const handleCancel = () => {

        navigate("/inventario/inventarioRedes", { replace: true });
    }


    const handleSubmit = e => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            
        } else {
            //Guardar los datos
            saveInventario();

        }
        setValidated(true);
    }

    const saveInventario = async () => {
        try {
            // Primero, actualiza la tabla InventarioRedes
            const responseRedes = await InventarioRedesApi.updateInventarioRedes(newIdInventario, inventario);
    
            if (responseRedes) {
                throw new Error('Error al guardar InventarioRedes');
            }
    
            // Luego, actualiza la segunda tabla (por ejemplo, InventarioOtraTabla)
            const responseOtraTabla = await InventarioRedesApi.updateInventarioRedes(idInventarioRedes, inventarioSaliente);
    
            if (responseOtraTabla) {
                throw new Error('Error al guardar InventarioOtraTabla');
            }
    
            // Si ambas actualizaciones son exitosas, muestra el mensaje de éxito
            Swal.fire({
                title: '',
                text: 'Se ha guardado el formulario correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                navigate("/inventario/inventarioRedes", { replace: true });
            });
    
        } catch (error) {
            // Muestra el mensaje de error si ocurre algún problema
            Swal.fire({
                title: '',
                text: `Hubo un problema al procesar la solicitud: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const changeInstock = async (e) => {
        e.preventDefault();
    
        try {
            console.log("Id Tabla: " + idInventarioRedes);
    
            // Espera la respuesta de la API
            const response = await InventarioRedesApi.getInventarioRedesByID(idInventarioRedes);
    
            // Verifica si la respuesta es válida y tiene al menos un elemento
            if (response && response.length > 0) {
                // Asegúrate de que las fechas sean válidas
                response[0].FechaSoporte = formatDate(new Date(response[0].FechaSoporte));
                response[0].FechaGarantia = formatDate(new Date(response[0].FechaGarantia));
                response[0].FechaEoL = formatDate(new Date(response[0].FechaEoL));
                response[0].FechaIngreso = formatDate(new Date(response[0].FechaIngreso));
                response[0].FechaModificacion = formatDate(new Date(response[0].FechaModificacion));
    
                // Convierte los valores de "Si"/"No" a booleanos
                response[0].InStock = response[0].InStock === "Si";
                response[0].Administrable = response[0].Administrable === "Si";
                response[0].Conectado = response[0].Conectado === "Si";

                response[0].InStock= true;

                setInventarioSaliente(response[0]);
                console.log(response[0]);

            } else {
                console.warn("No se encontraron datos para el ID proporcionado.");
            }
        } catch (error) {
            console.error("Error al obtener o procesar los datos:", error);
        }
    };

    const formatDate = (value) => {
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

    const [SelectedData, setSelectedData] = useState(null);

    const getInventarioRedesBy = async (e) => {
        e.preventDefault();
        console.log("Nuevo id: " + newIdInventario);
    
        // Helper function to handle errors and clear state
        const handleError = (message) => {
            handleClear();
            setSelectedData(false);
            setIsDisabled(true);
            Swal.fire({
                title: "",
                text: message,
                icon: "error",
            });
        };
    
        // Early return if the new ID matches the existing ID
        if (newIdInventario === idInventarioRedes) {
            handleClear();
            setSelectedData(false);
            Swal.fire({
                title: "",
                text: "Ingresó el mismo serial del equipo saliente. Por favor validar",
                icon: "error",
            });
            return;
        }
    
        // Early return if the new ID is empty
        if (!newIdInventario) {
            handleClear();
            setIsDisabled(true);
            setSelectedData(false);
            return;
        }
    
        try {
            // Fetch data from the API
            const responseData = await InventarioRedesApi.getInventarioRedesByID(newIdInventario);
    
            if (responseData.length === 0) {
                handleError("El serial ingresado no se encuentra registrado. Por favor validar");
                return;
            }
    
            const data = responseData[0];
    
            // Check if the serial matches and whether it is in stock
            if (newIdInventario === data.idSerial) {
                if (data.InStock === 1) {
                    // Update state and format dates
                    setIsDisabled(false);
                    setSelectedData(true);
                    setInventario({
                        ...data,
                        FechaSoporte: formatDate(new Date(data.FechaSoporte)),
                        FechaGarantia: formatDate(new Date(data.FechaGarantia)),
                        FechaEoL: formatDate(new Date(data.FechaEoL)),
                        FechaIngreso: formatDate(new Date(data.FechaIngreso)),
                        FechaModificacion: formatDate(new Date(data.FechaModificacion)),
                        Administrable: data.Administrable === 1,
                        Conectado: data.Conectado === 1,
                        InStock: data.InStock === 0,
                    });
                    console.log(data);
                } else {
                    handleError(`El elemento del inventario con Serial ${newIdInventario}, no se encuentra en Stock. Por favor validar`);
                }
            } else {
                handleError("El serial ingresado no se encuentra registrado. Por favor validar");
            }
        } catch (error) {
            handleError("Hubo un problema al obtener los datos del inventario. Por favor intente de nuevo.");
            console.error('Error fetching data:', error);
        }
    };
    

    // Función que maneja el presionar Enter
    const handleKeyPress = (e) => {
        debugger
        if (e.key === 'Enter') {
            // Evitar la acción por defecto del Enter (si es necesario)
            e.preventDefault();
            // Llama a las funciones deseadas
            getInventarioRedesBy(e);
            changeInstock(e);
        }
    };
  
    //Botnones de Control del Inventario en la Cabecera
    const renderHeader = () => {
        return (
            <div className="gap-2 align-items-center justify-content-between titleCenter" >
                Hola Esto es una prueb
            </div>
        );
    };

     // Actualiza el estado del campo de texto para buscar el nuevo serial
     const handleChange = (e) => {
        setValue(e.target.value);
    };


    const header = renderHeader();

    return (
        <div className="card">
            <h4 className='titleCenter'> Equipo Saliente</h4>
            <DataTable value={inventarioTable} tableStyle={{ minWidth: '50rem' }}>
                <Column field="idSerial" header="Serial"></Column>
                <Column field="Marca" header="Marca"></Column>
                <Column field="Modelo" header="Modelo"></Column>
                <Column field="NombreEquipo" header="NombreEquipo"></Column>
                <Column field="DireccionIp" header="DireccionIp"></Column>
                <Column field="idTipoEquipo" header="Tipo de Equipo"></Column>
                <Column field="Sede" header="Sede"></Column>
                <Column field="InStock" header="En Stock"></Column>
            </DataTable>
            <Divider />
            <Divider align="center">
                <div className="p-inputgroup flex-1">
                    <InputText placeholder="Serial del nuevo equipo" 
                        value={newIdInventario} 
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                    />
                    <Button icon="pi pi-search" className="search-button" onClick={(e) => {getInventarioRedesBy(e); changeInstock(e)}} />
                </div>
            </Divider>
            <Divider />


            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <h4 className='titleCenter'> Equipo Entrante</h4>
                <Container>
                    <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Identificacion del equipo</Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col sm={4}>
                                        <FloatingLabel controlId="txtIdSerial" label="Serial" className="mb-3">
                                            <Form.Control type="text" placeholder="Serial"
                                                name='idSerial'
                                                defaultValue={""}
                                                value={inventario.idSerial}
                                                onChange={e => setInventario({ ...inventario, idSerial: e.target.value, idModified: true, idSerialAnterior: inventario.idSerial })}
                                                required
                                                disabled
                                                //disabled={isDisabled}
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
                                                disabled
                                                //disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtModelo" label="Modelo" className="mb-3">
                                            <Form.Control type="text" placeholder="Modelo"
                                                name='Modelo'
                                                value={inventario.Modelo || ""}
                                                onChange={e => setInventario({ ...inventario, Modelo: e.target.value })}
                                                disabled
                                                //disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtVrsFirmware" label="Versión del Firmware" className="mb-3">
                                            <Form.Control type="text" placeholder="Versión del Firmware"
                                                name='VrsFirmware'
                                                value={inventario.VrsFirmware || ""}
                                                onChange={e => setInventario({ ...inventario, VrsFirmware: e.target.value })}
                                                disabled
                                                //disabled={isDisabled}
                                            />
                                        </FloatingLabel>


                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtDireccionIp" label="Direccion Ip" className="mb-3">
                                            <Form.Control type="text" placeholder="Direccion Ip"
                                                name='DireccionIp'
                                                value={inventario.DireccionIp || ""}
                                                onChange={e => setInventario({ ...inventario, DireccionIp: e.target.value })}
                                                disabled={isDisabled}
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
                                                disabled
                                                //disabled={isDisabled}
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

                                                checked={inventario.Administrable || false}
                                                disabled
                                                //disabled={isDisabled}
                                            >
                                            </Checkbox>
                                            <label htmlFor="chAdministrable" className="ml-2">Administrable</label>
                                        </div>

                                    </Col>
                                    <Col sm>
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="chConectado" name="Conectado" value="Conectado"
                                                onChange={e => setInventario({ ...inventario, Conectado: e.checked })}
                                                checked={inventario.Conectado || false}
                                                disabled
                                                //disabled={isDisabled}
                                            >
                                            </Checkbox>
                                            <label htmlFor="chConectado" className="ml-2">Conectado</label>
                                        </div>
                                    </Col>
                                    <Col sm>
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="chInStock" name="InStock" value="InStock"
                                                onChange={e => setInventario({ ...inventario, InStock: e.checked })}
                                                checked={inventario.InStock || false}
                                                disabled
                                                //disabled={isDisabled}
                                            >
                                            </Checkbox>

                                            <label htmlFor="chInStock" className="ml-2">En Stock</label>
                                        </div>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2" >
                            <Accordion.Header>Características del equipo</Accordion.Header >
                            <Accordion.Body data-pr-collapse="collapse">
                                <Row>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidTipoEquipo" label="Tipo de equipo" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idTipoEquipo'
                                                value={inventario.idTipoEquipo}
                                                onChange={e => setInventario({ ...inventario, idTipoEquipo: e.target.value })}
                                                required
                                                disabled
                                                //disabled={isDisabled}
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
                                                disabled
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
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtTipoRed" label="Tipo de Red" className="mb-3">
                                            <Form.Control type="text" placeholder="Tipo de Red"
                                                name='TipoRed'
                                                value={inventario.TipoRed || ""}
                                                onChange={e => setInventario({ ...inventario, TipoRed: e.target.value })}
                                                disabled
                                                //disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    <Col sm>
                                        <FloatingLabel controlId="txtEdificio" label="Edificio" className="mb-3">
                                            <Form.Control type="text" placeholder="Edificio"
                                                name='Edificio'
                                                value={inventario.Edificio || ""}
                                                onChange={e => setInventario({ ...inventario, Edificio: e.target.value })}
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm={2}>
                                        <FloatingLabel controlId="txtPiso" label="Piso" className="mb-3">
                                            <Form.Control type="text" placeholder="Piso"
                                                name='Piso'
                                                value={inventario.Piso || ""}
                                                onChange={e => setInventario({ ...inventario, Piso: e.target.value })}
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtidPropietarioFilial" label="Filial Propietaria" className="mb-3">
                                            <Form.Control as="select" type="select"
                                                name='idPropietarioFilial'
                                                value={inventario.idPropietarioFilial}
                                                onChange={e => setInventario({ ...inventario, idPropietarioFilial: e.target.value })}
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
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
                                        <FloatingLabel controlId="txtFechaSoporte" label="Fecha de Soporte" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Soporte"
                                                name='FechaSoporte'
                                                value={new Date(inventario.FechaSoporte).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                onChange={e => setInventario({ ...inventario, FechaSoporte: e.target.value })}
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtSoporteDetalle" label="Detalle Soporte" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Soporte"
                                                name='SoporteDetalle'
                                                value={inventario.SoporteDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, SoporteDetalle: e.target.value })}
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaGarantia" label="Fecha de Garantía" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Garantía"
                                                name='FechaGarantia'
                                                value={new Date(inventario.FechaGarantia).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                onChange={e => setInventario({ ...inventario, FechaGarantia: e.target.value })}
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaEoL" label="Fecha EoL" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha Eol"
                                                name='FechaEoL'
                                                value={new Date(inventario.FechaEoL).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                onChange={e => setInventario({ ...inventario, FechaEoL: e.target.value })}
                                                //disabled 
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col sm>
                                        <FloatingLabel controlId="txtEolDetalle" label="Detalle Eol" className="mb-3">
                                            <Form.Control type="text" placeholder="Detalle Eol"
                                                name='EolDetalle'
                                                value={inventario.EolDetalle || ""}
                                                onChange={e => setInventario({ ...inventario, EolDetalle: e.target.value })}
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                </Row>
                                <Row>


                                    <Col sm>
                                        <FloatingLabel controlId="txtFechaIngreso" label="Fecha de Ingreso" className="mb-3">
                                            <Form.Control type="date" placeholder="Fecha de Ingreso"
                                                name='FechaIngreso'
                                                value={new Date(inventario.FechaIngreso).toLocaleDateString('fr-CA', {
                                                    timeZone: 'UTC',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                                onChange={e => setInventario({ ...inventario, FechaIngreso: e.target.value })}
                                                //disabled 
                                                disabled={isDisabled}
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
                                                disabled={isDisabled}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Row className="flex align-items-center" >
                        <Col ></Col>
                        <Col style={{ textAlign: "center" }}><Button className="btn btn-danger" onClick={handleCancel}>Cancelar</Button></Col>
                        <Col style={{ textAlign: "center" }}><Button type="submit" className="btn btn-primary" disabled={!SelectedData}>Reemplazar</Button></Col>
                        <Col ></Col>
                    </Row>

                </Container>
            </Form >
        </div>

    )
}
