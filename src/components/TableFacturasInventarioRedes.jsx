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
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';


export const TableFacturasInventarioRedes = () => {

    // Función para formatear fechas
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

   // Estado
   const [facturas, setFacturas] = useState([]);
   const [SelectedData, setSelectedData] = useState([]);
   const [filters, setFilters] = useState({});
   const [sortField, setSortField] = useState(null);
   const [sortOrder, setSortOrder] = useState(null);
   const toast = useRef(null);
   const [originalData, setOriginalData] = useState([]);
   const navigate = useNavigate();

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await InventarioRedesApi.getAllFacturas();
                const formattedData = getDates(data);
                setFacturas(getDates(data));
                console.log("Facturas Tabla: ",getDates(data));
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
            FechaInStock: convertDate(d.FechaInStock),
            InStock: convertBooleanToYesNo(d.InStock),
            Conectado: convertBooleanToYesNo(d.Conectado),
            Administrable: convertBooleanToYesNo(d.Administrable)
        }));
    };
    

    //Se definen las opciones de los filtros en cada columna
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Filial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Sede: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            UbicacionFisicaEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            CriticidadPrevia: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            CriticidadActual: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaModificacionIngreso: { value: null, matchMode: FilterMatchMode.DATE_IS },
            TipoEquipo: { value: null, matchMode: FilterMatchMode.EQUALS },
            Modelo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Fabricante: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoRed: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DetalleServicio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Observaciones: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NombreEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            IPEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NroSerial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ActivoInactivo: { value: null, matchMode: FilterMatchMode.EQUALS },
            EmpresaPropietariaEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            EstadisticasAtencionSitio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },        
            Pais: { value: null, matchMode: FilterMatchMode.EQUALS },
            QueSalen: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NumeroElementos: { value: null, matchMode: FilterMatchMode.DATE_IS },
            TipoCriticidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoPrecio: { value: null, matchMode: FilterMatchMode.DATE_IS },
            ValorUnitarioUSD: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DisponibilidadRealCliente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ANSComprometido: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ANSCumplido: { value: null, matchMode: FilterMatchMode.DATE_IS },
            DescuentoRecargoVolumen: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DescuentoANS:{ value: null, matchMode: FilterMatchMode.DATE_IS },
            TotalFacturarUSD: { value: null, matchMode: FilterMatchMode.EQUALS }
            
        });
    };

   
    // Template para el filtro de fecha
    const fechaModificacionIngresoFilterTemplate = (options) => (
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
    const FechaModificacionIngresoBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaSoporte);
    };

   
    //Template que devuelve la FechaModificación con formato 
    const FechaModificacionBodyTemplate = (rowData) => {
        return formatDate(rowData.FechaModificacion);
    };
  




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
    const administrableRowFilterTemplate = (options) => createRowFilterTemplate(options, administrableItemTemplate);
    const criticidadRowFilterTemplate = (options) => RowFilterTemplate(options);


    


// Función para manejar filtros y actualizar el estado de datos filtrados
const handleFilter = (e) => {
    // Revisa y actualiza los filtros
    const newFilters = Object.fromEntries(
        Object.entries(e.filters).map(([key, value]) => {
            if (value && value.value) {
                return [key, value];
            }
            return [key, { value: null, matchMode: FilterMatchMode.CONTAINS }];
        })
    );
    setFilters(newFilters);
};


    const applyFilters = (data, filters) => {
        console.log('Aplicando filtros:', filters);
        console.log('Datos originales:', data);

        return data.filter(item => {
            // Aplicar filtro global
            if (filters.global && filters.global.value) {
                const globalFilterValue = filters.global.value.toLowerCase(); // Valor del filtro global en minúsculas
                const itemValues = Object.values(item).map(val => val ? val.toString().toLowerCase() : ''); // Valores del ítem en minúsculas
                const matchesGlobalFilter = itemValues.some(val => val.includes(globalFilterValue));
                if (!matchesGlobalFilter) return false;
            }

            // Aplicar filtros específicos de campo
            for (const [field, filter] of Object.entries(filters)) {
                if (field === 'global') continue; // Ya se manejó el filtro global

                const value = item[field];
                const filterValue = filter ? filter.value : null;

                if (filterValue !== null) {
                    switch (filter.matchMode) {
                        case FilterMatchMode.STARTS_WITH:
                            if (!value.toString().toLowerCase().startsWith(filterValue.toString().toLowerCase())) return false;
                            break;
                        case FilterMatchMode.CONTAINS:
                            if (!value.toString().toLowerCase().includes(filterValue.toString().toLowerCase())) return false;
                            break;
                        case FilterMatchMode.EQUALS:
                            if (value.toString().toLowerCase() !== filterValue.toString().toLowerCase()) return false;
                            break;
                        case FilterMatchMode.DATE_IS:
                            const dateValue = new Date(value);
                            const filterDate = new Date(filterValue);
                            if (dateValue.toDateString() !== filterDate.toDateString()) return false;
                            break;
                        default:
                            return true;
                    }
                }
            }

            return true;
        });
    };



    //Se crea el archivo de excel con columnas y filas
    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            // Aplicar filtros a los datos
            const filteredData = applyFilters(facturas, filters);

            // Verificar si hay datos filtrados antes de exportar
            if (filteredData.length === 0) {
                alert('No hay datos que coincidan con los filtros aplicados.');
                return;
            }

            // Convertir los datos filtrados a una hoja de cálculo
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            // Guardar el archivo Excel
            saveAsExcelFile(excelBuffer, 'facturas');
        });
    };



    // Se da nombre y formato xlsx al archivo creado
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
            text: `¿Quiere editar la información de la factura con Serial ${SelectedData.idSerial}?`,
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
                <DataTable
                    value={facturas}
                    paginator
                    header={header}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="NroSerial" // Ajusta esto si es necesario
                    selectionMode="single"
                    selection={SelectedData}
                    onSelectionChange={(e) => setSelectedData(e.value ? e.value : null)}
                    emptyMessage="No se encontró ningún registro"
                    currentPageReportTemplate="Viendo {first} a {last} de {totalRecords} registros"
                    size="small"
                    filters={filters}
                    onFilter={handleFilter}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={(e) => {
                        setSortField(e.sortField);
                        setSortOrder(e.sortOrder);
                    }}
                    scrollable
                    scrollHeight="600px"
                    style={{ minWidth: '50rem' }}
                >
                    <Column selectionMode="single" exportable={false} />
                    <Column field="Filial" header="Filial" />
                    <Column field="Sede" header="Sede" />
                    <Column field="UbicacionFisicaEquipo" header="Ubicación Física" />
                    <Column field="CriticidadPrevia" header="Criticidad Previa" />
                    <Column field="CriticidadActual" header="Criticidad Actual" />
                    <Column 
                        field="FechaModificacionIngreso" 
                        header="Fecha Modificación" 
                        sortable 
                        filter 
                        filterElement={fechaModificacionIngresoFilterTemplate} // Usar el filtro de fecha
                        body={FechaModificacionIngresoBodyTemplate} // Usar el template para formato
                    />
                    <Column field="TipoEquipo" header="Tipo de Equipo" />
                    <Column field="Modelo" header="Modelo" />
                    <Column field="Fabricante" header="Fabricante" />
                    <Column field="TipoRed" header="Tipo de Red" />
                    <Column field="DetalleServicio" header="Detalle Servicio" />
                    <Column field="Observaciones" header="Observaciones" />
                    <Column field="NombreEquipo" header="Nombre Equipo" />
                    <Column field="IPEquipo" header="IP Equipo" />
                    <Column field="NroSerial" header="Nro Serial" />
                    <Column field="ActivoInactivo" header="Activo/Inactivo" />
                    <Column field="EmpresaPropietariaEquipo" header="Empresa Propietaria" />
                    <Column field="EstadisticasAtencionSitio" header="Estadísticas Atención Sitio" />
                    <Column field="Pais" header="País" />
                    <Column field="QueSalen" header="Que Salen" />
                    <Column field="NumeroElementos" header="Número Elementos" />
                    <Column field="TipoCriticidad" header="Tipo Criticidad" />
                    <Column field="TipoPrecio" header="Tipo Precio" />
                    <Column field="ValorUnitarioUSD" header="Valor Unitario (USD)" />
                    <Column field="DisponibilidadRealCliente" header="Disponibilidad Real Cliente" />
                    <Column field="ANSComprometido" header="ANS Comprometido" />
                    <Column field="ANSCumplido" header="ANS Cumplido" />
                    <Column field="DescuentoRecargoVolumen" header="Descuento Recargo Volumen" />
                    <Column field="DescuentoANS" header="Descuento ANS" />
                    <Column field="TotalFacturarUSD" header="Total a Facturar (USD)" />
                </DataTable>
            </div>
        </div>
    );
    

}
