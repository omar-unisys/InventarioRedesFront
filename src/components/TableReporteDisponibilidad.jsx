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
import axios from 'axios';



export const TableReporteDisponibilidad = () => {

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
   const [disponibilidad, setFacturas] = useState([]);
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
                const data = await InventarioRedesApi.getDisponibilidad();
                console.log("Data: ",data);
                const formattedData = data;
                setFacturas(data);
                console.log("Facturas Tabla: ",data);
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

    

    //Se definen las opciones de los filtros en cada columna
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Client: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Host: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Start_Date: { value: null, matchMode: FilterMatchMode.DATE_IS },
            End_Date: { value: null, matchMode: FilterMatchMode.DATE_IS },
            Days: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Testname: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Availability: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Downtime: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Type: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Page: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Group: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Comment: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Name_Alias: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Description_1: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Description_2: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Description_3: { value: null, matchMode: FilterMatchMode.STARTS_WITH }

        });
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
            const filteredData = applyFilters(disponibilidad, filters);

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
            saveAsExcelFile(excelBuffer, 'disponibilidad');
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

    const renderHeader = () => {
        const [selectedFile, setSelectedFile] = useState(null);
    
        // Manejar el cambio de archivo en el input
        const handleFileChange = (e) => {
            setSelectedFile(e.target.files[0]);
        };
    
        // Función para manejar el envío del archivo
        const handleUpload = async () => {
            if (!selectedFile) {
                alert("Por favor, selecciona un archivo primero.");
                return;
            }
    
            try {
                console.log("Archivo: ", selectedFile);
                const result = await InventarioRedesApi.UploadExcelDisponibilidad(selectedFile);
                console.log('Archivo subido con éxito:', result);
            } catch (error) {
                console.error('Error al subir el archivo:', error);
            }
        };
    
        return (
            <div className="gap-2 align-items-center justify-content-between buttonStyles">
                {createButton("Quitar Filtros", "pi pi-filter-slash", clearFilter, 'clearFilterStyle clearfilterStyle')}
                {createButton("Exportar", "pi pi-file-excel", exportExcel, "btn btn-success")}
                
                {/* Formulario para cargar archivo */}
                <input type="file" onChange={handleFileChange} accept=".xlsx, .xls, .xlsb" />
                <button onClick={handleUpload} className="btn btn-primary">Subir Archivo</button>
            </div>
        );
    };
    
    


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
            <h4 className='titleCenter'> Reporte de Disponibilidad Inventario de Redes</h4>
                <DataTable
                    value={disponibilidad}
                    paginator
                    header={header}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="Host" 
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
                    <Column field="Client" header="Client"  filter="true"/>
                    <Column field="Host" header="Host" filter="true" />
                    <Column field="Start_Date" header="Start Date" filter="true" />
                    <Column field="End_Date" header="End Date" filter="true"/>
                    <Column field="Days" header="Days" filter="true"/>
                    <Column field="Availability" header="Availability (%)" filter="true"/>
                    <Column field="Downtime" header="Downtime (h:m:s)" filter="true"/>
                    <Column field="Type" header="Type" filter="true"/>
                    <Column field="Page" header="Page" filter="true"/>
                    <Column field="Group" header="Group" filter="true"/>
                    <Column field="Comment" header="Comment" filter="true"/>
                    <Column field="Name_Alias" header="Name_Alias" filter="true"/>
                    <Column field="Description_1" header="Description_1" filter="true"/>
                    <Column field="Description_2" header="Description_2" filter="true"/>
                    <Column field="Description_3" header="Description_3" filter="true"/>




                </DataTable>
            </div>
        </div>
    );
    

}
