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

    // Obtener los parámetros de la URL
    const month = new URLSearchParams(location.search).get('month')//Extrae el mes
    const year = new URLSearchParams(location.search).get('year'); // Extrae el año

    //Hook para obtener los datos de la DB y Guardarlos en un Objeto, además se inicializan los valores del los filtros
    useEffect(() => {
        // Solo llamar a la API si month y year están presentes
        if (month && year) {
            const fetchData = async () => {
                try {
                    // Llamada al backend para actualizar valores unitarios
                    //await InventarioRedesApi.actualizarValorUnitario(month, year);

                    // Luego recuperamos los datos actualizados
                    const data = await InventarioRedesApi.joinInventarioFactura(month, year);

                    // Verifica si los datos están vacíos o no se encontraron registros
                    if (!data || data.length === 0) {
                        // Si no hay datos, muestra un mensaje y redirige al usuario
                        Swal.fire({
                            title: 'No se encontraron registros',
                            text: 'No se encontraron registros para el periodo seleccionado. Por favor, valide el mes y año.',
                            icon: 'warning',
                            confirmButtonText: 'Aceptar',
                        }).then(() => {
                            // Redirigir a la pantalla de inventario
                            navigate('/inventario/facturacionRedes');
                        });
                    } else {
                        // Si hay datos, formatearlos y actualizar el estado
                        const formattedData = getDates(data);
                        setFacturas(formattedData);
                        console.log("Facturas Tabla: ", formattedData);
                        initFilters();
                        setOriginalData(formattedData); // Guardar los datos originales
                    }
                } catch (error) {
                    console.error('Error loading data:', error);

                    // Si ocurre un error con la llamada a la API (por ejemplo, 404 no encontrado)
                    if (error.message.includes('404')) {
                        // Muestra el error de que no se encontraron registros
                        Swal.fire({
                            title: 'No se encontraron registros',
                            text: 'No se encontraron registros para el periodo seleccionado. Por favor, valide el mes y año.',
                            icon: 'warning',
                            confirmButtonText: 'Aceptar',
                        }).then(() => {
                            // Redirigir a la pantalla de inventario
                            navigate('/inventario/facturacionRedes');
                        });
                    } else {
                        // Mostrar un mensaje de error si algo sale mal
                        toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos.' });
                    }
                }
            };

            fetchData();
        } else {
            console.error('Mes o año no proporcionados');
        }
    }, [month, year]); // Dependencias: el efecto se ejecutará cuando month o year cambien



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



    // Se crea el archivo de excel con las hojas solicitadas
    const exportExcel = async () => {
        import('xlsx').then(async (xlsx) => {
            // Obtener los datos de las diferentes hojas
            const filiales = await InventarioRedesApi.getFiliales();
            const inventarioActivos = await InventarioRedesApi.getInventarioActivos(month, year);
            const inventarioEnStock = await InventarioRedesApi.getInventarioEnStock(month, year);
            const reporteDisponibilidad = await InventarioRedesApi.getDisponibilidadByMonth(month, year);

            // Crear el libro de Excel
            const workbook = {
                Sheets: {},
                SheetNames: []
            };

            // Crear la hoja vacía llamada "Total facturacion mes" (sin agregar filas de datos)
            const worksheetFacturacion = xlsx.utils.aoa_to_sheet([[]]); // Hoja vacía
            workbook.SheetNames.push('Total facturacion mes');
            workbook.Sheets['Total facturacion mes'] = worksheetFacturacion;

            // Recorrer las filiales con un ciclo for...of para poder usar await dentro
            for (const filial of filiales) {
                // Verificar que la filial tenga datos en inventario activos
                const datosFilial = inventarioActivos.filter(item => item.Filial === filial.idFilial);

                // Si no hay datos para esta filial, saltamos al siguiente
                if (datosFilial.length === 0) {
                    console.warn(`No hay datos para la filial ${filial.idFilial}. Saltando...`);
                    continue;
                }

                // Obtener el resumen de resultados totales para esta filial
                const resumenTotales = await InventarioRedesApi.getResultadosTotales(filial.idFilial, month, year);

                // Verificar que el resumen tenga datos
                if (resumenTotales.length === 0) {
                    console.warn(`No se encontraron resultados totales para la filial ${filial.idFilial}`);
                }

                // Crear la tabla de facturación con el resumen
                const totalFacturacion = [
                    ['FACTURACION (' + filial.idFilial + ') - Conectados'],  // Título de la tabla
                    ['TipoEquipo', 'CriticidadActual', 'CountNroSerial', 'MaxValorUnitarioUSD', 'MaxDescuentoRecargoVolumen', 'TotalFacturarUSD'],  // Encabezados de la tabla
                    ...resumenTotales.map(item => [
                        item.TipoEquipo || 'Total',
                        item.CriticidadActual || 'Total',
                        item.CountNroSerial,
                        item.MaxValorUnitarioUSD,
                        item.MaxDescuentoRecargoVolumen,
                        item.TotalFacturarUSD
                    ])
                ];

                // Combinar la tabla de facturación con los datos de inventario de la filial
                const datosCombinados = [
                    ...totalFacturacion, // Primero los datos de facturación
                    [''], // Separador vacío entre facturación e inventario (opcional)
                    ['INVENTARIO (' + filial.idFilial + ')'],  // Título de la sección de inventario
                    ['Filial', 'Sede', 'Ubicación Física del Equipo', 'Criticidad Previa', 'Criticidad Actual',
                        'fecha Modificación Y O Ingreso', 'Tipo Equipo', 'Modelo', 'Fabricante', 'Tipo red', 'Detalle de Servicio',
                        'Observaciones', 'Nombre Equipo', 'IP Equipo', 'Nro Placa Nro Serial', 'Activo/Inactivo',
                        'Empresa Propietaria del Equipo', 'Estadisticas atención en sitio', 'Pais', 'Que Salen',
                        '# Elementos', 'TipoCriticidad', 'Tipo Precio', 'Valor Unitario USD', 'Disponibilidad Real Cliente',
                        'ANS COMPROMETIDO', 'ANS CUMPLIDO', 'Descuento/recargo por volumen', 'Descuento ANS', 'Total a facturar USD'
                    ], // Encabezados de inventario
                    ...datosFilial.map(item => [
                        item.Filial,
                        item.Sede,
                        item.UbicacionFisicaEquipo,
                        item.CriticidadPrevia,
                        item.CriticidadActual,
                        item.FechaModificacionIngreso,
                        item.TipoEquipo,
                        item.Modelo,
                        item.Fabricante,
                        item.TipoRed,
                        item.DetalleServicio,
                        item.Observaciones,
                        item.NombreEquipo,
                        item.IPEquipo,
                        item.NroSerial,
                        item.ActivoInactivo,
                        item.EmpresaPropietariaEquipo,
                        item.EstadisticasAtencionSitio,
                        item.Pais,
                        item.QueSalen,
                        item.NumeroElementos,
                        item.TipoCriticidad,
                        item.TipoPrecio,
                        item.ValorUnitarioUSD,
                        item.DisponibilidadRealCliente,
                        item.ANSComprometido,
                        item.ANSCumplido,
                        item.DescuentoRecargoVolumen,
                        item.DescuentoANS,
                        item.TotalFacturarUSD
                    ])
                ];

                // Crear la hoja combinada de facturación e inventario para la filial
                const worksheetFilialCombinada = xlsx.utils.aoa_to_sheet(datosCombinados);

                // Agregar la hoja combinada al libro de trabajo
                workbook.SheetNames.push(filial.idFilial);  // Nombre de la hoja combinada
                workbook.Sheets[filial.idFilial] = worksheetFilialCombinada;

                // Mapeo de cada fila de datos para la facturación
                for (const item of resumenTotales) {
                    // Obtener los valores de facturación de esta filial
                    const valorFacturacionUSD = parseFloat(item.TotalFacturarUSD) || 0;  // Valor de facturación
                    const ise = parseFloat(item.MaxDescuentoRecargoVolumen) || 0;  // ISE (puedes ajustar este valor según el cálculo que necesites)
                    const actividadesEspeciales = parseFloat(item.MaxValorUnitarioUSD) || 0;  // Actividades especiales en moneda local (ajustar según sea necesario)
                    const moneda = 'USD';  // Establecer la moneda. Si tienes más detalles, puedes hacer esta asignación dinámica.

                    const nuevaFila = [
                        filial.idFilial,
                        valorFacturacionUSD.toFixed(2),
                        ise.toFixed(2),
                        actividadesEspeciales.toFixed(2),
                        moneda
                    ];

                    // Usar sheet_add_aoa para agregar las nuevas filas
                    xlsx.utils.sheet_add_aoa(worksheetFacturacion, [nuevaFila], { origin: -1 });
                }
            }

            // Crear una hoja con el inventario de equipos activos (Activo = 1)
            const worksheetInventarioActivos = xlsx.utils.aoa_to_sheet([
                // Encabezados de la hoja "Inventario RED"
                ['Propietario Equipo', 'Filial En Uso', 'Empresa Pago', 'Marca', 'Modelo', 'Serial',
                    'Placa', 'Nombre Equipo', 'Dirección IP', 'TipoEquipo', 'Tipo Red', 'Criticidad Actual',
                    'Pais', 'Sede', 'Edificio Sede', 'Piso Sede', 'Ubicación', 'Tipo Servicio', 'Detalle de Servicios',
                    'Administrable', 'Fecha vencimiento Soporte', 'Detalle de Soporte', 'Fecha Vencimiento Garantía',
                    'Detalle de Garantía', 'EoL', 'EoL Detalle', 'Versión Firmware', 'Número Puertos', 'Estado',
                    'Comentario', 'Fecha de Ingreso', 'Activo/Inactivo'],
                // Mapeo de datos
                ...inventarioActivos.map(item => [
                    item.idPropietarioFilial,
                    item.idFilialEnUso,
                    item.Filial,
                    item.Fabricante,
                    item.Modelo,
                    item.NroSerial,
                    item.Placa,
                    item.NombreEquipo,
                    item.IPEquipo,
                    item.TipoEquipo,
                    item.TipoRed,
                    item.CriticidadActual,
                    item.Pais,
                    item.Sede,
                    item.Edificio,
                    item.Piso,
                    item.UbicacionFisicaEquipo,
                    item.TipoServicio,
                    item.DetalleServicio,
                    item.Administrable === 1 ? 'Si' : 'No',  // Convertir 1 a "Si" y 0 a "No"
                    item.FechaSoporte,
                    item.SoporteDetalle,
                    item.FechaGarantia,
                    item.GarantiaDetalle,
                    item.FechaEoL,
                    item.EolDetalle,
                    item.VrsFirmware,
                    item.NumPuertos,
                    item.idEstado,
                    item.Comentario,
                    item.FechaIngreso,
                    item.ActivoInactivo === 1 ? 'Si' : 'No'  // Convertir 1 a "Si" y 0 a "No"
                ])
            ]);

            // Agregar la hoja de "Inventario RED" al libro de trabajo
            workbook.SheetNames.push('Inventario RED');
            workbook.Sheets['Inventario RED'] = worksheetInventarioActivos;

            // Crear una hoja con el reporte de disponibilidad para el mes y año seleccionados
            const worksheetReporteDisponibilidad = xlsx.utils.json_to_sheet(reporteDisponibilidad);
            workbook.SheetNames.push('Reporte Disponibilidad');
            workbook.Sheets['Reporte Disponibilidad'] = worksheetReporteDisponibilidad;

            // Filtrar los equipos disponibles (Activo = 0)
            const equiposEnStock = inventarioEnStock.filter(item => item.ActivoInactivo === 0);

            // Crear la hoja con los equipos disponibles (Activo = 0)
            const worksheetInventarioDisponibles = xlsx.utils.aoa_to_sheet([
                // Encabezados de la hoja "Equipos en Stock"
                ['Propietario Equipo', 'Filial En Uso', 'Empresa Pago', 'Marca', 'Modelo', 'Serial',
                    'Placa', 'Nombre Equipo', 'Dirección IP', 'TipoEquipo', 'Tipo Red', 'Criticidad Actual',
                    'Pais', 'Sede', 'Edificio Sede', 'Piso Sede', 'Ubicación', 'Tipo Servicio', 'Detalle de Servicios',
                    'Administrable', 'Fecha vencimiento Soporte', 'Detalle de Soporte', 'Fecha Vencimiento Garantía',
                    'Detalle de Garantía', 'EoL', 'EoL Detalle', 'Versión Firmware', 'Número Puertos', 'Estado',
                    'Comentario', 'Fecha de Ingreso', 'Activo/Inactivo'],
                // Mapeo de datos
                ...equiposEnStock.map(item => [
                    item.idPropietarioFilial,
                    item.idFilialEnUso,
                    item.Filial,
                    item.Fabricante,
                    item.Modelo,
                    item.NroSerial,
                    item.Placa,
                    item.NombreEquipo,
                    item.IPEquipo,
                    item.TipoEquipo,
                    item.TipoRed,
                    item.CriticidadActual,
                    item.Pais,
                    item.Sede,
                    item.Edificio,
                    item.Piso,
                    item.UbicacionFisicaEquipo,
                    item.TipoServicio,
                    item.DetalleServicio,
                    item.Administrable === 1 ? 'Si' : 'No',  // Convertir 1 a "Si" y 0 a "No"
                    item.FechaSoporte,
                    item.SoporteDetalle,
                    item.FechaGarantia,
                    item.GarantiaDetalle,
                    item.FechaEoL,
                    item.EolDetalle,
                    item.VrsFirmware,
                    item.NumPuertos,
                    item.idEstado,
                    item.Comentario,
                    item.FechaIngreso,
                    item.ActivoInactivo === 1 ? 'Si' : 'No'  // Convertir 1 a "Si" y 0 a "No"
                ])
            ]);

            // Agregar la hoja de "Equipos en Stock" al libro de trabajo
            workbook.SheetNames.push('Equipos en Stock');
            workbook.Sheets['Equipos en Stock'] = worksheetInventarioDisponibles;

            // Convertir el libro de trabajo a un buffer
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            // Guardar el archivo Excel
            saveAsExcelFile(excelBuffer, 'inventario_redes');
        });
    };


    // Guardar el archivo Excel
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
                    dataKey="NroSerial"

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
                    <Column field="Filial" header="Filial" filter="true" />
                    <Column field="Sede" header="Sede" filter="true" />
                    <Column field="UbicacionFisicaEquipo" header="Ubicación Física" filter="true" />
                    <Column field="CriticidadPrevia" header="Criticidad Previa" filter="true" />
                    <Column field="CriticidadActual" header="Criticidad Actual" filter="true" editor={(options) => criticidadEditor(options)} />

                    <Column
                        field="FechaModificacionIngreso"
                        header="Fecha Modificación"
                        sortable
                        filter
                        filterElement={fechaModificacionIngresoFilterTemplate} // Usar el filtro de fecha
                        body={FechaModificacionIngresoBodyTemplate} // Usar el template para formato
                    />
                    <Column field="TipoEquipo" header="Tipo de Equipo" filter="true" />
                    <Column field="Modelo" header="Modelo" filter="true" />
                    <Column field="Fabricante" header="Fabricante" filter="true" />
                    <Column field="TipoRed" header="Tipo de Red" filter="true" />
                    <Column field="DetalleServicio" header="Detalle Servicio" filter="true" />
                    <Column field="Observaciones" header="Observaciones" filter="true" />
                    <Column field="NombreEquipo" header="Nombre Equipo" filter="true" />
                    <Column field="IPEquipo" header="IP Equipo" filter="true" />
                    <Column field="NroSerial" header="Nro Serial" filter="true" />
                    <Column field="ActivoInactivo" header="Activo/Inactivo" filter="true" />

                    <Column field="EmpresaPropietariaEquipo" header="Empresa Propietaria" filter="true" />
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
                    <Column field="DescuentoRecargoVolumen" header="Descuento/recargo por volumen" filter="true" />
                    <Column field="DescuentoANS" header="Descuento ANS" filter="true" />
                    <Column field="TotalFacturarUSD" header="Total a Facturar (USD)" filter="true" />

                </DataTable>
            </div>
        </div>
    );


}
