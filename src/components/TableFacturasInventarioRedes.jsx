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
import { InputText } from 'primereact/inputtext';

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
    const [selectedRow, setSelectedRow] = useState(null);


    const onRowClick = (event) => {
        setSelectedRow(event.data);
    };



    const rowClassName = (rowData) => {
        return {
            'p-highlight': selectedRow && selectedRow.idSerial === rowData.idSerial,
        };
    };

    const criticidadOptions = [
        { label: 'Muy Alta', value: 'Muy Alta' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Media', value: 'Media' },
        { label: 'Baja', value: 'Baja' },
    ];

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await InventarioRedesApi.joinInventarioFactura();
                console.log("Data: ", data);
                const formattedData = getDates(data);
                setFacturas(getDates(data));
                console.log("Facturas Tabla: ", getDates(data));
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

    //Funcion para editar la columna estadisticasatencion en sitio
    const estadisticasEditor = (options) => {
        return (
            <InputText
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                placeholder="Ingrese estadísticas"
            />
        );
    };

    const queSalenEditor = (options) => {
        return (
            <InputText
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                placeholder="Ingrese qué salen"
            />
        );
    };

    const numeroElementosEditor = (options) => {
        return (
            <InputText
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                placeholder="Ingrese número de elementos"
            />
        );
    };

    const disponibilidadRealEditor = (options) => {
        return (
            <InputText
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                placeholder="Ingrese disponibilidad real"
            />
        );
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
            FechaModificacionIngreso: convertDate(d.FechaModificacionIngreso),
        }));
    };


    //Se definen las opciones de los filtros en cada columna
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            idFilialPago: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Sede: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Ubicacion: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idCriticidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            CriticidadActual: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            FechaModificacionIngreso: { value: null, matchMode: FilterMatchMode.DATE_IS },
            idTipoEquipo: { value: null, matchMode: FilterMatchMode.EQUALS },
            Modelo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Marca: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoRed: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DetalleServicio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Observaciones: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NombreEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DireccionIp: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idSerial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            InStock: { value: null, matchMode: FilterMatchMode.EQUALS },
            idPropietarioFilial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            EstadisticasAtencionSitio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Pais: { value: null, matchMode: FilterMatchMode.EQUALS },
            QueSalen: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            NumeroElementos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoCriticidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            TipoPrecio: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ValorUnitarioUSD: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DisponibilidadRealCliente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ANSComprometido: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            ANSCumplido: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DescuentoRecargoVolumen: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            DescuentoANS: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
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
        return formatDate(rowData.FechaModificacionIngreso);
    };

    const criticidadEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={criticidadOptions}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Selecciona criticidad"
            />
        );
    };

    const onRowEditComplete = (e) => {
        let updatedFacturas = [...facturas];
        updatedFacturas[e.index] = e.newData;
        setFacturas(updatedFacturas);
    };

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
        setSelectedRow(null); // Deseleccionar si la misma fila se hace clic de nuevo
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
        </div>
    );








    const header = renderHeader();




    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <h4 className='titleCenter'> Facturación Inventario de Redes</h4>
                <DataTable
                    value={facturas}
                    paginator
                    header={header}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="idSerial"

                    emptyMessage="No se encontró ningún registro"
                    editMode="row"
                    onRowEditComplete={onRowEditComplete}
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
                    onRowClick={onRowClick}
                    rowClassName={rowClassName}
                >
                    <Column rowEditor headerStyle={{ width: '10rem' }} bodyStyle={{ textAlign: 'center' }} frozen={true} />
                    <Column field="idFilialPago" header="Filial" filter="true" />
                    <Column field="Sede" header="Sede" filter="true" />
                    <Column field="Ubicacion" header="Ubicación Física" filter="true" />
                    <Column field="idCriticidad" header="Criticidad Previa" filter="true" />
                    <Column field="CriticidadActual" header="Criticidad Actual" filter="true" editor={(options) => criticidadEditor(options)} />

                    <Column
                        field="FechaModificacionIngreso"
                        header="Fecha Modificación"
                        sortable
                        filter
                        filterElement={fechaModificacionIngresoFilterTemplate} // Usar el filtro de fecha
                        body={FechaModificacionIngresoBodyTemplate} // Usar el template para formato
                    />
                    <Column field="idTipoEquipo" header="Tipo de Equipo" filter="true" />
                    <Column field="Modelo" header="Modelo" filter="true" />
                    <Column field="Marca" header="Fabricante" filter="true" />
                    <Column field="TipoRed" header="Tipo de Red" filter="true" />
                    <Column field="DetalleServicio" header="Detalle Servicio" filter="true" />
                    <Column field="Observaciones" header="Observaciones" filter="true" />
                    <Column field="NombreEquipo" header="Nombre Equipo" filter="true" />
                    <Column field="DireccionIp" header="IP Equipo" filter="true" />
                    <Column field="idSerial" header="Nro Serial" filter="true" />
                    <Column field="InStock" header="Activo/Inactivo" filter="true" />

                    <Column field="idPropietarioFilial" header="Empresa Propietaria" filter="true" />
                    <Column
                        field="EstadisticasAtencionSitio"
                        header="Estadísticas Atención Sitio"
                        filter="true"
                        editor={estadisticasEditor} // Editor de texto para esta columna
                    />
                    <Column field="Pais" header="País" filter="true" />
                    <Column
                        field="QueSalen"
                        header="Que Salen"
                        filter="true"
                        editor={queSalenEditor} // Agregar el editor para Que Salen
                    />
                    <Column
                        field="NumeroElementos"
                        header="Número Elementos"
                        filter="true"
                        editor={numeroElementosEditor} // Agregar el editor para Número Elementos
                    />

                    <Column field="TipoCriticidad" header="Tipo Criticidad" filter="true" />
                    <Column field="TipoPrecio" header="Tipo Precio" filter="true" />
                    <Column field="ValorUnitarioUSD" header="Valor Unitario (USD)" filter="true" />
                    <Column
                        field="DisponibilidadRealCliente"
                        header="Disponibilidad Real Cliente"
                        filter="true"
                        editor={disponibilidadRealEditor} // Agregar el editor para Disponibilidad Real Cliente
                    />

                    <Column field="ANSComprometido" header="ANS Comprometido" filter="true" />
                    <Column field="ANSCumplido" header="ANS Cumplido" filter="true" />
                    <Column field="DescuentoRecargoVolumen" header="Descuento Recargo Volumen" filter="true" />
                    <Column field="DescuentoANS" header="Descuento ANS" filter="true" />
                    <Column field="TotalFacturarUSD" header="Total a Facturar (USD)" filter="true" />

                </DataTable>
            </div>
        </div>
    );


}
