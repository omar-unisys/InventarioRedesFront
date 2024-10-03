import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import InventarioRedesApi from '../services/InventarioRedesApi';
import { Toast } from 'primereact/toast';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';



export const TableLineaBase = () => {

   // Estado
   const [tarifas, setFacturas] = useState([]);
   const [SelectedData, setSelectedData] = useState([]);
   const [filters, setFilters] = useState({});
   const [sortField, setSortField] = useState(null);
   const [sortOrder, setSortOrder] = useState(null);
   const toast = useRef(null);
   const [originalData, setOriginalData] = useState([]);
   

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await InventarioRedesApi.getLineaBase();
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
            Filial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Dispositivo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Criticidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            Cantidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        });
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
            const filteredData = applyFilters(tarifas, filters);

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
            saveAsExcelFile(excelBuffer, 'tarifas');
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
            <h4 className='titleCenter'> Línea Base Inventario de Redes</h4>
                <DataTable
                    value={tarifas}
                    paginator
                    header={header}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="Combinacion" 
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
                    <Column field="Filial" header="Filial"  filter="true"/>
                    <Column field="Dispositivo" header="Dispositivo" filter="true" />
                    <Column field="Criticidad" header="Criticidad" filter="true" />
                    <Column field="Cantidad" header="Cantidad" filter="true"/>
                </DataTable>
            </div>
        </div>
    );
    

}
