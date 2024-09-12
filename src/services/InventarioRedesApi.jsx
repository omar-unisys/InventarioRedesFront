const getInventarioRedesByID = async (idInventarioRedes) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/${idInventarioRedes}`;
    const res = await fetch(url);
    const data = await res.json();
    //console.log(data);
    return data;
}


const updateInventarioRedes = async (idInventarioRedes, inventario) => {
    const url = `${import.meta.env.VITE_URL_SERVICES}invred/${idInventarioRedes}`;

    

    inventario.Administrable ? inventario.Administrable = 1 : inventario.Administrable = 0;
    inventario.Conectado ? inventario.Conectado = 1 : inventario.Conectado = 0;
    inventario.InStock ? inventario.InStock = 1 : inventario.InStock = 0;


    if (inventario.idModified == true) {
        
        createInventarioRedes(inventario);
        console.log(inventario.idSerialAnterior);

        deleteInventarioRedes(inventario.idSerialAnterior);
        
        return false;
       
        
    } else {
        inventario.FechaModificacion = new Date().toLocaleDateString('fr-CA', {
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        console.log(inventario.FechaModificacion);
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(inventario),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        //console.log(data);
        return false;
    }

}

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


