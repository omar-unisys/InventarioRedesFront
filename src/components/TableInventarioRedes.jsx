import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import getAll  from '../services/InventarioRedesApi';
import 'primeicons/primeicons.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'primereact/badge';


export const TableInventarioRedes = () => {
    const [inventario, setInventario] = useState([]);
    const [SelectedData, setSelectedData] = useState([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        representative: { value: null, matchMode: FilterMatchMode.IN },
        date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        activity: { value: null, matchMode: FilterMatchMode.BETWEEN }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    


    useEffect(() => {
        getAll.getAll().then((data) => setInventario(getDates(data)));
    }, []); 

    const getDates = (data) => {
        return [...(data || [])].map((d) => {
            d.FechaSoporte = new Date(d.date);
            return d;
        });
    };

    const formatDate = (value) => {
        return value.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fechasBodyTemplate = (rowData) => {
        return <>
            <Badge value={rowData.startTime} severity="info"></Badge> {'> '}
            <Badge value={rowData.endTime} severity="info"></Badge>
            </>;
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div>
                <h4 className="m-0 !important">Inventario de Redes</h4>
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar" />
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    };

    const handleFormTask = (event) => {
        Swal.fire({
            title: "",
            text: `¿Quieres gestionar la actividad del cambio ${event.data.numberChange}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "No",
            confirmButtonText: "Si"
            }).then((result) => {
            if (result.isConfirmed) {
                navigate("/sabi/timerecord/"+event.data.id, { replace: true });
            }
        });
    };

    const header = renderHeader();

    return (
        <div className="card">
            <DataTable value={inventario} paginator header={header} rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]} dataKey="id" selectionMode="checkbox" selection={SelectedData} onSelectionChange={(e) => setSelectedData(e.value)}
                    //onRowSelect={handleFormTask} 
                    filters={filters} filterDisplay="menu" globalFilterFields={['Marca', 'Modelo', 'NombreEquipo', 'DireccionIp', 'TipoRed','Pais',
                        'Sede','Edificio','Piso','Ubicación','TipoServicio','DetalleServicio','Administrable','FechaSoporte',
                        'SoporteDetalle','FechaGarantia','GarantiaDetalle','FechaEoL','EolDetalle','VrsFirmware','NumPuertos',
                        'FechaIngreso','FechaModificacion','Comentario','Conectado','InStock']}
                    emptyMessage="No se encontró ningún registro" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries" size='small'>
                <Column field="Marca" header="Marca"  style={{ minWidth: '5rem' }} />
                <Column field="Modelo" header="Modelo"  style={{ minWidth: '5rem' }} />
                <Column field="NombreEquipo" header="Nombre Equipo"  style={{ minWidth: '5rem' }} />
                <Column field="DireccionIp" header="Direccion Ip" style={{ minWidth: '7rem' }} />
                <Column field="TipoRed" header="Tipo de Red"  style={{ minWidth: '7rem' }} />
                <Column field="Pais" header="País"  style={{ minWidth: '7rem' }} />
                <Column field="Sede" header="Sede" style={{ minWidth: '7rem' }} />
                <Column field="Edificio" header="Edificio" style={{ minWidth: '7rem' }} />
                <Column field="Piso" header="Piso" style={{ minWidth: '4rem' }} />
                <Column field="Ubicación" header="Ubicación" style={{ minWidth: '7rem' }} />
                <Column field="TipoServicio" header="Tipo Servicio" style={{ minWidth: '7rem' }} />
                <Column field="DetalleServicio" header="Detalle Servicio" style={{ minWidth: '7rem' }} />
                <Column field="Administrable" header="Administrable" dataType="boolean" style={{ minWidth: '7rem' }} />
                <Column field="FechaSoporte" header="Fecha Soporte" sortable filterField="FechaSoporte" dataType="date" style={{ minWidth: '7rem' }} body={dateBodyTemplate}/>
                <Column field="SoporteDetalle" header="Detalle Soporte" style={{ minWidth: '7rem' }} />
                <Column field="FechaGarantia" header="Fecha Gatantía" sortable filterField="FechaGarantia" dataType="date" style={{ minWidth: '7rem' }}/>
                <Column field="GarantiaDetalle" header="Detalle Garantía" style={{ minWidth: '7rem' }} />
                <Column field="FechaEoL" header="Fecha EoL" sortable filterField="FechaEoL" dataType="date" style={{ minWidth: '7rem' }} />
                <Column field="EolDetalle" header="Detalle EoL" style={{ minWidth: '7rem' }} />
                <Column field="VrsFirmware" header="Versión Firmware" style={{ minWidth: '7rem' }} />
                <Column field="NumPuertos" header="Versión de Firmware" style={{ minWidth: '7rem' }} />
                <Column field="FechaIngreso" header="Fecha de Ingreso" sortable filterField="FechaIngreso" dataType="date" style={{ minWidth: '7rem' }} />
                <Column field="FechaModificacion" header="Fecha de Modificación" sortable filterField="FechaModificacion" dataType="date" style={{ minWidth: '7rem' }}/>
                <Column field="Comentario" header="Comentario" style={{ minWidth: '7rem' }} />
                <Column field="Conectado" header="Conectado" dataType="boolean" style={{ minWidth: '7rem' }} />
                <Column field="InStock" header="En Stock" dataType="boolean" style={{ minWidth: '7rem' }} />
            </DataTable>
        </div>
    );
}
