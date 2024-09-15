import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import InventarioRedesApi from '../services/InventarioRedesApi';
import { Toast } from 'primereact/toast';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'primereact/badge';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';



export const TableInventarioRedes = () => {
    const [inventario, setInventario] = useState([]);
    const [SelectedData, setSelectedData] = useState([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const toast = useRef(null);
    const [originalData, setOriginalData] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await InventarioRedesApi.getAll();
                const formattedData = getDates(data);
                setInventario(getDates(data));
                initFilters(); // Inicializa los filtros después de cargar los datos
                setOriginalData(formattedData); // Guardar los datos originales
            } catch (error) {
                console.error('Error loading data:', error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos.' });
            }
        };
        fetchData();

    }, []);

    const resetSort = () => {
        setSortField(null);   // Restablecer el campo de ordenamiento
        setSortOrder(null);   // Restablecer el orden (ascendente o descendente)
    };
    

    //Se obtienen los datos recibidos de la base de datos y se dan formato a las Fechas y Booleanos
    const getDates = (data) => {
        // Función auxiliar para convertir fechas
        const convertDate = (date) => {
            if (!date || date === "null" || date === "undefined") return null; // Retorna null si la fecha es nula o indefinida
    
            // Asegura de que la fecha sea válida
            const parsedDate = new Date(date);
            return isNaN(parsedDate.getTime()) ? null : parsedDate; // Retorna null si la fecha no es válida
        };
    
        // Función auxiliar para convertir booleanos a 'Si' o 'No'
        const convertBooleanToYesNo = (value) => (value === 1 ? 'Si' : 'No');
    
        return (data || []).map((d) => ({
            ...d,  // Mantén las propiedades originales
            FechaSoporte: convertDate(d.FechaSoporte),
            FechaGarantia: convertDate(d.FechaGarantia),
            FechaEoL: convertDate(d.FechaEoL),
            FechaIngreso: convertDate(d.FechaIngreso),
            FechaModificacion: convertDate(d.FechaModificacion),
            InStock: convertBooleanToYesNo(d.InStock),
            Conectado: convertBooleanToYesNo(d.Conectado),
            Administrable: convertBooleanToYesNo(d.Administrable)
        }));
    };
    

    
    //Se definen las opciones de los filtros en cada columna
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            idSerial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idCriticidad: { value: null, matchMode: FilterMatchMode.EQUALS },
            idTipoEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Marca: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Modelo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NombreEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DireccionIp: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            InStock: { value: null, matchMode: FilterMatchMode.EQUALS },
            TipoRed: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Pais: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Sede: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Edificio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Piso: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Ubicacion: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoServicio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DetalleServicio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Administrable: { value: null, matchMode: FilterMatchMode.EQUALS },
            FechaSoporte: { value: null, matchMode: FilterMatchMode.DATE_IS },
            SoporteDetalle: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaGarantia: { value: null, matchMode: FilterMatchMode.DATE_IS },
            GarantiaDetalle: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaEoL: { value: null, matchMode: FilterMatchMode.DATE_IS },
            EolDetalle: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            VrsFirmware: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NumPuertos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaIngreso: { value: null, matchMode: FilterMatchMode.DATE_IS },
            Comentario: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaModificacion:{ value: null, matchMode: FilterMatchMode.DATE_IS },
            Conectado: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
    };

    // Template para el filtro de fecha
    const fechaSoporteFilterTemplate = (options) => (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterApplyCallback(e.value)}
            dateFormat="dd/mm/yy"
            placeholder="Seleccionar fecha"
            className="p-column-filter"
            style={{ minWidth: '10rem' }}
        />
    );



    //Template que devuelve la FechaSoporte con formato 
    const FechaSoporteBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaSoporte);
    };

    //Template que devuelve la FechaGarantia con formato 
    const FechaGarantiaBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaGarantia);
    };

    //Template que devuelve la FechaEoL con formato 
    const FechaEoLBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaEoL);
    };

    //Template que devuelve la FechaIngreso con formato 
    const FechaIngresoBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaIngreso);
    };

    //Template que devuelve la FechaModificación con formato 
    const FechaModificacionBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaModificacion);
    };

    // Formato de fecha
const formatDate = (value) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    return ''; // Retorna una cadena vacía si el valor no es una fecha válida
};


    //Se cargan los datos a una matriz con Si o No. Reutilizado para Stok, Administrable y Conectado
    const enStockOptions = [
        { label: 'Sí', value: 'Si' },
        { label: 'No', value: 'No' }
    ];

    //Se cargan los datos a una matriz con Si o No. Reutilizado para Stok, Administrable y Conectado
    const criticidadOptions = [
        { label: 'Baja', value: 'Baja' },
        { label: 'Media', value: 'Media' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Muy Alta', value: 'Muy Alta' }
    ];


    const createRowFilterTemplate = (options, itemTemplate) => (
        <Dropdown
            value={options.value}
            options={enStockOptions}
            onChange={(e) => options.filterApplyCallback(e.value)}
            itemTemplate={itemTemplate}
            placeholder="Seleccione"
            className="p-column-filter"
            style={{ minWidth: '10rem' }}
        />
    );

    const RowFilterTemplate = (options) => (
        <Dropdown
            value={options.value}
            options={criticidadOptions}
            onChange={(e) => options.filterApplyCallback(e.value)}
            placeholder="Seleccione"
            className="p-column-filter"
            style={{ minWidth: '10rem' }}
        />
    );

    const enStockRowFilterTemplate = (options) => createRowFilterTemplate(options, enStockItemTemplate);
    const conectadoRowFilterTemplate = (options) => createRowFilterTemplate(options, conectadoItemTemplate);
    const administrableRowFilterTemplate = (options) => createRowFilterTemplate(options, administrableItemTemplate);
    const criticidadRowFilterTemplate = (options) => RowFilterTemplate(options);

    //Determinar el color de las opciones Si o No de Administrable
    const administrableItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    //Determinar el color de las opciones Si o No de Conectado
    const conectadoItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    //Determinar el color de las opciones (Del filtro) Si o No de InStock
    const enStockItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    //Retorna el color que se le va a gregar a las opciones. Reutilizado para Stok, Administrable y Conectado
    const getSeverity = (value) => {
        switch (value) {
            case 'No':
                return 'danger';
            case 'Si':
                return 'success';
            default:
                return 'info'; // Valor por defecto
        }
    };

    //Determinar el color de las opciones (De las filas de la Tabla) Si o No de InStock
    const enStockBodyTemplate = (rowData) => {
        return <Tag value={rowData.InStock} severity={getSeverity(rowData.InStock)} />;
    };

    //Determinar el color de las opciones (De las filas de la Tabla) Si o No de Conectado
    const conectadoBodyTemplate = (rowData) => {
        return <Tag value={rowData.Conectado} severity={getSeverity(rowData.Conectado)} />;
    };

    //Determinar el color de las opciones (De las filas de la Tabla) Si o No de Administrable
    const administrableBodyTemplate = (rowData) => {
        return <Tag value={rowData.Administrable} severity={getSeverity(rowData.Administrable)} />;
    };

    





    //Se crea el archivo de excel con columnas y filas
    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(inventario);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            saveAsExcelFile(excelBuffer, 'inventario');
        });
    };

    //Se da nombre y formato xlsx al archivo creado
    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });
                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };

    //Se quitan los filtos de la tabla
    const clearFilter = () => {
        initFilters(); // Limpiar los filtros
        resetSort();   // Restablecer el orden
    };

    //Redirecciona al formulario de creacion de nuevo elemento en el inventario
    const RedirectCreateNewForm = () => {
        navigate("/inventario/RegistroInventarioForm/", { replace: true });
    }



    //Botnones de Control del Inventario en la Cabecera
    const createButton = (label, icon, onClick, className, disabled = false) => (
        <Button
            label={label}
            icon={icon}
            rounded
            outlined
            onClick={onClick}
            className={className}
            disabled={disabled}
            style={{ margin: "5px" }}
        />
    );

    const renderHeader = () => (
        <div className="gap-2 align-items-center justify-content-between buttonStyles">
            {createButton("Quitar Filtros", "pi pi-filter-slash", clearFilter, 'clearFilterStyle clearfilterStyle')}
            {createButton("Exportar", "pi pi-file-excel", exportExcel, "btn btn-success")}
            {createButton("Nuevo", "pi pi-file-plus", RedirectCreateNewForm, 'btn btn-primary')}
            {createButton("Reemplazar", "pi pi-sync", handleFormReemplazar, "btn btn-warning", !SelectedData || SelectedData.length === 0)}
            {createButton("Modificar", "pi pi-file-edit", handleFormTask, 'btn btn-primary', !SelectedData || SelectedData.length === 0)}
        </div>
    );


    //Ventana emergente de alerta confirmacion para editar la informacion de algun registro de la tabla 
    const handleFormTask = useCallback(() => {
        console.log(SelectedData);
        Swal.fire({
            title: "",
            text: `¿Quiere editar la información del inventario con Serial ${SelectedData.idSerial}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "No",
            confirmButtonText: "Si"
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/inventario/updateInventarioForm/${SelectedData.idSerial}`, { replace: true });
            }
        });
    }, [SelectedData, navigate]);

    //Ventana emergente de alerta confirmacion para Reemplazar un equipo de la tabla 
    const handleFormReemplazar = useCallback(() => {
        console.log(SelectedData);
        if (SelectedData.InStock === "No") {
            Swal.fire({
                title: "",
                text: `¿Quiere reemplazar el elemento del inventario con Serial ${SelectedData.idSerial}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: "No",
                confirmButtonText: "Si"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/inventario/ReemplazarInventarioForm/${SelectedData.idSerial}`, { replace: true });
                }
            });
        } else {
            Swal.fire({
                title: "",
                text: `El elemento del inventario con Serial ${SelectedData.idSerial}, se encuentra en Stock. Por favor validar`,
                icon: "error",
            });
        }
    }, [SelectedData, navigate]);





    const header = renderHeader();

    const commonColumnProps = (header) => ({
        filter: true,
        filterPlaceholder: `${header}`, // Utiliza el nombre del encabezado para el placeholder
        style: { minWidth: '7rem', textAlign: "left" }
    });

    // Propiedades específicas para columnas con filtros personalizados o estilos únicos
    const customColumnProps = {
        enStock: {
            filterMenuStyle: { width: '1rem' },
            body: enStockBodyTemplate,
            filterElement: enStockRowFilterTemplate,
            style: { minWidth: '1rem' }
        },
        administrable: {
            filterMenuStyle: { width: '1rem' },
            body: administrableBodyTemplate,
            filterElement: administrableRowFilterTemplate,
            style: { minWidth: '1rem' }
        },
        dateColumn: {
            sortable: true,
            filterField: "FechaSoporte",
            dataType: "date",
            body: FechaSoporteBodyTemplate,
            style: { minWidth: '10rem' }
        },
        criticidad: {
            filterMenuStyle: { width: '1rem' },
            filterElement: criticidadRowFilterTemplate,
            style: { minWidth: '1rem' }
        }
        // Agrega más configuraciones específicas si es necesario
    };

    const renderColumn = (field, header, extraProps = {}) => (
        <Column
            field={field}
            header={header}
            {...commonColumnProps(header)}
            {...extraProps}
        />
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <h4 className='titleCenter'> Inventario de Redes</h4>
                <DataTable
                    value={inventario}
                    paginator
                    header={header}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="idSerial"
                    selectionMode="checkbox"
                    selection={SelectedData}
                    onSelectionChange={(e) => setSelectedData(e.value)}
                    emptyMessage="No se encontró ningún registro"
                    currentPageReportTemplate="Viendo {first} a {last} de {totalRecords} registros"
                    size="small"
                    filters={filters}
                    onFilter={(e) => setFilters(e.filters)}
                    sortField={sortField}  // Añadir esta línea
                    sortOrder={sortOrder}  // Añadir esta línea
                    onSort={(e) => {
                        setSortField(e.sortField);
                        setSortOrder(e.sortOrder);
                    }}
                    scrollable
                    scrollHeight="600px"
                    style={{ minWidth: '50rem' }}
                >
                    <Column selectionMode="single" exportable={false} />
                    {renderColumn("idSerial", "Serial", { style: { minWidth: '12rem' } })}
                    {renderColumn("Marca", "Marca")}
                    {renderColumn("Modelo", "Modelo")}
                    {renderColumn("NombreEquipo", "Nombre Equipo")}
                    {renderColumn("DireccionIp", "Dirección Ip")}
                    <Column
                        field="InStock"
                        header="En Stock"
                        filter
                        {...customColumnProps.enStock}
                    />
                    <Column
                    field="idCriticidad"
                    header="Criticidad"
                    filter
                    {...customColumnProps.criticidad}
                    />
                    {renderColumn("TipoRed", "Tipo de Red")}
                    {renderColumn("Pais", "País")}
                    {renderColumn("Sede", "Sede")}
                    {renderColumn("Edificio", "Edificio")}
                    {renderColumn("Piso", "Piso")}
                    {renderColumn("Ubicacion", "Ubicación")}
                    {renderColumn("TipoServicio", "Tipo Servicio")}
                    {renderColumn("DetalleServicio", "Detalle Servicio")}
                    <Column
                        field="Administrable"
                        header="Administrable"
                        filter
                        {...customColumnProps.administrable}
                    />
                    <Column
                        field="FechaSoporte"
                        header="Fecha Soporte"
                        sortable
                        filter
                        filterElement={fechaSoporteFilterTemplate}
                        body={FechaSoporteBodyTemplate}
                        style={{ minWidth: '10rem' }}
                    />
                    {renderColumn("SoporteDetalle", "Detalle Soporte")}
                    <Column
                        field="FechaGarantia"
                        header="Fecha Garantía"
                        sortable
                        filter
                        filterElement={fechaSoporteFilterTemplate}
                        body={FechaGarantiaBodyTemplate}
                        style={{ minWidth: '10rem' }}
                    />
                    {renderColumn("GarantiaDetalle", "Detalle Garantía")}
                    <Column
                        field="FechaEoL"
                        header="Fecha EoL"
                        sortable
                        filter
                        filterElement={fechaSoporteFilterTemplate}
                        body={FechaEoLBodyTemplate}
                        style={{ minWidth: '10rem' }}
                    />
                    {renderColumn("EolDetalle", "Detalle EoL")}
                    {renderColumn("VrsFirmware", "Versión Firmware")}
                    {renderColumn("NumPuertos", "Número de Puertos")}
                    <Column
                        field="FechaIngreso"
                        header="Fecha de Ingreso"
                        sortable
                        filter
                        filterElement={fechaSoporteFilterTemplate}
                        body={FechaIngresoBodyTemplate}
                        style={{ minWidth: '10rem' }}
                    />
                    <Column
                        field="FechaModificacion"
                        header="Fecha de Modificación"
                        sortable
                        filter
                        filterElement={fechaSoporteFilterTemplate}
                        body={FechaModificacionBodyTemplate}
                        style={{ minWidth: '10rem' }}
                    />
                    {renderColumn("Comentario", "Comentario")}
                    
                </DataTable>
            </div>
        </div>
    );

}
