import { Upload } from "@mui/icons-material";

const getInventarioRedesByID = async (idInventarioRedes) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/${idInventarioRedes}`;
    const res = await fetch(url);
    const data = await res.json();
    //console.log(data);
    return data;
}


const updateInventarioRedes = async (idInventarioRedes, inventario) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/${idInventarioRedes}`;
    console.log("URL de la solicitud:", url);

    // Convertir valores booleanos a enteros (0 o 1)
    inventario.Administrable = inventario.Administrable ? 1 : 0;
    inventario.InStock = inventario.InStock ? 1 : 0;

    // Función auxiliar para convertir a ISO solo si hay un valor válido
    const toISOStringSafe = (dateValue) => {
        if (!dateValue) return null; // Devuelve null si no hay valor
        const date = new Date(dateValue);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
    };

    inventario.FechaSoporte = toISOStringSafe(inventario.FechaSoporte);
    inventario.FechaGarantia = toISOStringSafe(inventario.FechaGarantia);
    inventario.FechaEoL = toISOStringSafe(inventario.FechaEoL);
    inventario.FechaIngreso = toISOStringSafe(inventario.FechaIngreso);
    inventario.FechaInStock = toISOStringSafe(inventario.FechaInStock);
    inventario.FechaModificacion = new Date().toISOString().split('T')[0];
    
    //console.log("Inventario antes de actualizar:", JSON.stringify(inventario, null, 2));

    try {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(inventario),
            headers: { 'Content-Type': 'application/json' }
        });
    
        if (!res.ok) {
            const errorData = await res.json();
            console.error('Error al actualizar:', errorData);
            throw new Error(errorData.message || 'Error desconocido al actualizar el inventario');
        }
    
        const data = await res.json();
        console.log('Actualización exitosa:', data);
        return data;
        
    } catch (error) {
        console.error('Error en la solicitud de actualización:', error);
    }
};

//Funcion que comvierte en un objeto JSON los datos traidos de la tabla de Inventario de Red
const getAll = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

//Funcion que comvierte en un objeto JSON los datos traidos de la tabla de Factuas
const getAllFacturas = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}facturasinvred/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

//Funcion que comvierte en un objeto JSON los datos traidos de la tabla de Factuas
const getTarifario = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}tarifario/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

//Funcion que comvierte en un objeto JSON los datos traidos de un JOIN entre las tablas de Inventario de Red y de Factuas
const joinInventarioFactura = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}JoinInventarioFactura/`;
    //trycatch para manejo de errores
    try {
        const res = await fetch(url);
        
        // Verifica si la respuesta es correcta (código 200)
        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }
        
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error al obtener inventario y facturas:", error);
        return null; 
    }
};



const createInventarioRedes = async (inventario) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/`;
    
    // Convertir valores booleanos a enteros (0 o 1)
    inventario.Administrable = inventario.Administrable ? 1 : 0;
    inventario.InStock = inventario.InStock ? 1 : 0;

    // Función auxiliar para convertir a ISO solo si hay un valor válido
    const toISOStringSafe = (dateValue) => {
        if (!dateValue) return null; // Devuelve null si no hay valor
        const date = new Date(dateValue);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
    };

    inventario.FechaSoporte = toISOStringSafe(inventario.FechaSoporte);
    inventario.FechaGarantia = toISOStringSafe(inventario.FechaGarantia);
    inventario.FechaEoL = toISOStringSafe(inventario.FechaEoL);
    inventario.FechaIngreso = toISOStringSafe(inventario.FechaIngreso);
    inventario.FechaInStock = toISOStringSafe(inventario.FechaInStock);
    inventario.FechaModificacion = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(inventario),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            // Si la respuesta HTTP no es ok, lanzar un error con el mensaje recibido del backend
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la solicitud de crear inventario:', error);
        throw error; // Propagar el error para manejarlo en el lugar donde se llama a la función
    }
};

const deleteInventarioRedes = async (idInventarioRedes) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/${idInventarioRedes}`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data;
}

const createLineaBase= async (lineaBase) =>{
    const url = `${import.meta.env.VITE_URL_SERVICES}linebase/`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(lineaBase),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            // Si la respuesta HTTP no es ok, lanzar un error con el mensaje recibido del backend
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la solicitud de crear la Linea Base:', error);
        throw error; // Propagar el error para manejarlo en el lugar donde se llama a la función
    }
}

//Funcion que comvierte en un objeto JSON los datos traidos de la tabla Linea Base
const getLineaBase = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}linebase/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

//Funcion que comvierte en un objeto JSON los datos traidos de la tabla Disponibilidad
const getDisponibilidad = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}reportedisponibilidad/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

const getSumCantidadByDevices = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}getSumCantidadByDevices/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

const actualizarValorUnitario = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}actualizar-valor-unitario/`;
    try {
        const res = await fetch(url, {
            method: 'PUT',
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar el valor unitario:', error);
        throw error; // Propagar el error para manejarlo más arriba en la llamada
    }
};

const UploadExcelDisponibilidad = async (file) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}importReporteDisponibilidad/`;

    // Crear una instancia de FormData
    const formData = new FormData();
    formData.append('file', file); // 'file' es el campo del archivo en la API

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData, // No se necesita especificar el Content-Type, fetch lo manejará automáticamente
        });

        if (!response.ok) {
            // Si la respuesta HTTP no es ok, lanzar un error con el mensaje recibido del backend
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la solicitud de subir el archivo:', error);
        throw error; // Propagar el error para manejarlo en el lugar donde se llama a la función
    }
};

const enviarCorreoCambioInStock = async (inventario, mensaje, destinatarios) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}sendEmail`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mensaje: mensaje,
                destinatarios: destinatarios, // Pasar los destinatarios
                idSerial: inventario.idSerial, // Suponiendo que tienes el ID del dispositivo
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Correo enviado con éxito", data);
        return data;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
};


const fetchWithErrorHandling = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al hacer la solicitud');
    }
    return await response.json();
};


const getDisponibilidadByMonth = async (month, year) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}reportedisponibilidad/ver/${year}/${month}`;
    
    return await fetchWithErrorHandling(url);
};

const getEmailsDestinatarios= async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}emailsDestinatarios`;
    
    const res = await fetch(url);
    const data = await res.json();
    console.log("Correos: ", data);
    return data;
};

const checkExistingRecords = async (month, year) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}check-records?month=${month}&year=${year}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.exists; // Asumiendo que el API devuelve { exists: true/false }
};

const deleteExistingRecords = async (month, year) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}delete-records?month=${month}&year=${year}`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        throw new Error('Error al eliminar registros existentes'); // Manejo de errores
    }

    const data = await res.json();
    return data;
};


const InventarioRedesApi = {
    createInventarioRedes,
    getAll,
    getInventarioRedesByID,
    updateInventarioRedes,
    deleteInventarioRedes,
    getAllFacturas,
    joinInventarioFactura,
    getTarifario, 
    getLineaBase,
    createLineaBase,
    getDisponibilidad,
    getDisponibilidadByMonth,
    getSumCantidadByDevices,
    actualizarValorUnitario,
    UploadExcelDisponibilidad,
    enviarCorreoCambioInStock,
    getEmailsDestinatarios,
    checkExistingRecords,
    deleteExistingRecords
}

export default InventarioRedesApi;


