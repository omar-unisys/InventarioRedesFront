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
    inventario.Conectado = inventario.Conectado ? 1 : 0;
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
    
    console.log("Inventario antes de actualizar:", JSON.stringify(inventario, null, 2));

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







const getAll = async () => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/`;
    //console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

const createInventarioRedes = async (inventario) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/`;
    
    // Convertir valores booleanos a enteros (0 o 1)
    inventario.Administrable = inventario.Administrable ? 1 : 0;
    inventario.Conectado = inventario.Conectado ? 1 : 0;
    inventario.InStock = inventario.InStock ? 1 : 0;

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

const InventarioRedesApi = {
    createInventarioRedes,
    getAll,
    getInventarioRedesByID,
    updateInventarioRedes,
    deleteInventarioRedes
}

export default InventarioRedesApi;


