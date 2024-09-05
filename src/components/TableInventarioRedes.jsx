import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import InventarioRedesApi from '../services/InventarioRedesApi';
import { Toast } from 'primereact/toast';
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
    const [SelectedData, setSelectedData] = useState(null);
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);


    const toast = useRef(null);

    //Se cargan los datos a una matriz con Si o No. Reutilizado para Stok, Administrable y Conectado
    const [EnStock] = useState(['No', 'Si']);

    const enStockRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} options={EnStock} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={enStockItemTemplate} placeholder="Seleccione una opción" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    const conectadoRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} options={EnStock} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={conectadoItemTemplate} placeholder="Seleccione una opción" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    const administrableRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} options={EnStock} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={administrableItemTemplate} placeholder="Seleccione una opción" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    //Determinar el color de las opciones Si o No de Administrable
    const administrableItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };

    //Determinar el color de las opciones Si o No de Conectado
    const conectadoItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };
    
    //Determinar el color de las opciones (Del filtro) Si o No de InStock
    const enStockItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };

    //Retorna el color que se le va a gregar a las opciones. Reutilizado para Stok, Administrable y Conectado
    const getSeverity = (InStock) => {
        switch (InStock) {
            case 'No':
                return 'danger';

            case 'Si':
                return 'success';
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

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        InventarioRedesApi.getAll().then((data) => setInventario(getDates(data)));
        initFilters();
    }, []);

    //Se obtienen los datos recibidos de la base de datos y se dan formato a las Fechas y Booleanos
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

    //Formato de fecha 
    const formatDate = (value) => {
        return value.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
        initFilters();
    };

    //Redirecciona al formulario de creacion de nuevo elemento en el inventario
    const RedirectCreateNewForm = () => {
        navigate("/inventario/RegistroInventarioForm/", { replace: true });
    }

    //Se definen las opciones de los filtros en cada columna
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            idSerial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idCriticidad: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idTipoEquipo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            idPropietarioFilial: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            idFilialPago: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Marca: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Modelo: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            NombreEquipo: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            DireccionIp: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            TipoRed: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Pais: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Sede: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Edificio: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Piso: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Ubicacion: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            TipoServicio: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            DetalleServicio: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

            idCriticidad: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            balance: { value: null, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            verified: { value: null, matchMode: FilterMatchMode.EQUALS }
        });

    };

    //Botnones de Control del Inventario en la Cabecera
    const renderHeader = () => {
        return (
            <div className="gap-2 align-items-center justify-content-between buttonStyles" >
                <Button label="Quitar Filtros" icon="pi pi-filter-slash" rounded outlined onClick={clearFilter} className='clearFilterStyle' />

                <Button label="Exportar" icon="pi pi-file-excel" rounded onClick={exportExcel} data-pr-tooltip="XLS" className="btn btn-success" />
                <label htmlFor="string">&nbsp;&nbsp;</label>
                <Button label="Nuevo" icon="pi pi-file-plus" rounded outlined onClick={RedirectCreateNewForm} className='btn btn-primary' />
                <label htmlFor="string">&nbsp;&nbsp;</label>
                <Button label="Reemplazar" icon="pi pi-sync" className="btn btn-warning" onClick={handleFormReemplazar} disabled={!SelectedData} />
                <label htmlFor="string">&nbsp;&nbsp;</label>
                <Button label="Modificar" icon="pi pi-file-edit" className="btn btn-primary" onClick={handleFormTask} disabled={!SelectedData} />
            </div>
        );
    };

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

    //Ventana emergente de alerta confirmacion para editar la informacion de algun registro de la tabla 
    const handleFormTask = () => {
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
                navigate("/inventario/updateInventarioForm/" + SelectedData.idSerial, { replace: true });
            }
        });
    };

    //Ventana emergente de alerta confirmacion para Reemplazar un equipo de la tabla 
    const handleFormReemplazar = () => {
        console.log(SelectedData);
        if (SelectedData.InStock == "No") {
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
                    navigate("/inventario/ReemplazarInventarioForm/" + SelectedData.idSerial, { replace: true });
                }
            });
        } else {
            Swal.fire({
                title: "",
                text: `El elemento del inventario con Serial ${SelectedData.idSerial}, se encuentra en Stock. Por favor validar`,
                icon: "error",
            }).then((result) => {

            });
        }

    };

    //Filtro de fechas
    const dateFilterTemplate = (options) => {
        console.log(options.value);
        return <Calendar value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
    };



    const header = renderHeader();

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <h4 className='titleCenter'> Inventario de Redes</h4>
                <DataTable value={inventario} paginator header={header} rows={10}

                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]} dataKey="idSerial" selectionMode="checkbox" selection={SelectedData} onSelectionChange={(e) => setSelectedData(e.value)}
                    //onRowSelect={handleFormTask} 
                    filters={filters}
                    emptyMessage="No se encontró ningún registro" currentPageReportTemplate="Viendo {first} a {last} de {totalRecords} registros " size="small"
                    onFilter={(e) => setFilters(e.filters)}
                    scrollable scrollHeight="600px" style={{ minWidth: '50rem' }}>

                    <Column selectionMode="single" exportable={false} />
                    <Column field="idSerial" header="Serial" filter filterPlaceholder="Serial" style={{ minWidth: '12rem' }} />
                    <Column field="Marca" header="Marca" style={{ minWidth: '10rem', textAlign: "left" }} filter filterPlaceholder="Marca" />
                    <Column field="Modelo" header="Modelo" style={{ minWidth: '10rem', textAlign: "left" }} filter filterPlaceholder="Modelo" />
                    <Column field="NombreEquipo" header="Nombre Equipo" style={{ minWidth: '12rem', textAlign: "left" }} filter filterPlaceholder="Nombre Equipo" />
                    <Column field="DireccionIp" header="Direccion Ip" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Dirección IP" />
                    <Column field="InStock" header="En Stock" filterMenuStyle={{ width: '1rem' }} style={{ minWidth: '1rem', textAlign: "left" }} body={enStockBodyTemplate} filter filterElement={enStockRowFilterTemplate} />
                    <Column field="TipoRed" header="Tipo de Red" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Tipo de Red" />
                    <Column field="Pais" header="País" style={{ minWidth: '1rem', textAlign: "left" }} />
                    <Column field="Sede" header="Sede" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Sede" />
                    <Column field="Edificio" header="Edificio" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Edificio" />
                    <Column field="Piso" header="Piso" style={{ minWidth: '4rem', textAlign: "left" }} filter filterPlaceholder="Piso" />
                    <Column field="Ubicacion" header="Ubicación" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Ubicacion" />
                    <Column field="TipoServicio" header="Tipo Servicio" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="DetalleServicio" header="Detalle Servicio" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="Administrable" header="Administrable" dataType="boolean" style={{ minWidth: '7rem', textAlign: "left" }} body={administrableBodyTemplate} filter filterElement={administrableRowFilterTemplate} />
                    <Column field="FechaSoporte" header="Fecha Soporte" sortable filterField="FechaSoporte" filter filterElement={dateFilterTemplate} dataType="date" style={{ minWidth: '10rem', textAlign: "left" }} body={FechaSoporteBodyTemplate} />
                    <Column field="SoporteDetalle" header="Detalle Soporte" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="FechaGarantia" header="Fecha Gatantía" sortable filterField="FechaGarantia" dataType="date" style={{ minWidth: '7rem', textAlign: "left" }} body={FechaGarantiaBodyTemplate} />
                    <Column field="GarantiaDetalle" header="Detalle Garantía" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="FechaEoL" header="Fecha EoL" sortable filterField="FechaEoL" dataType="date" style={{ minWidth: '7rem', textAlign: "left" }} body={FechaEoLBodyTemplate} />
                    <Column field="EolDetalle" header="Detalle EoL" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="VrsFirmware" header="Versión Firmware" style={{ minWidth: '7rem', textAlign: "left" }} filter filterPlaceholder="Versión Firmware" />
                    <Column field="NumPuertos" header="Número de Puertos" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="FechaIngreso" header="Fecha de Ingreso" sortable filterField="FechaIngreso" dataType="date" style={{ minWidth: '7rem', textAlign: "left" }} body={FechaIngresoBodyTemplate} />
                    <Column field="FechaModificacion" header="Fecha de Modificación" sortable filterField="FechaModificacion" dataType="date" style={{ minWidth: '7rem', textAlign: "left" }} body={FechaModificacionBodyTemplate} />
                    <Column field="Comentario" header="Comentario" style={{ minWidth: '7rem', textAlign: "left" }} />
                    <Column field="Conectado" header="Conectado" filterMenuStyle={{ width: '7rem' }} style={{ minWidth: '10rem', textAlign: "left" }} body={conectadoBodyTemplate} filter filterElement={conectadoRowFilterTemplate} />

                </DataTable>
            </div>
        </div>
    );
}
