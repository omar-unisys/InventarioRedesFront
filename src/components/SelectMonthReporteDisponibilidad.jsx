import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import InventarioRedesApi from '../services/InventarioRedesApi';
import Swal from 'sweetalert2'; // Asegúrate de importar Swal
import * as Papa from 'papaparse'; // Importa la librería papaparse

export const SelectMonthReporteDisponibilidad = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const months = [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 }
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const handleSubmit = () => {
        if (selectedMonth !== null) {
            navigate(`/inventario/reporteDisponibilidad/ver?month=${selectedMonth}&year=${selectedYear}`);
        }
    };

    const handleUploadToggle = () => {
        if (selectedMonth !== null && selectedYear) {
            setShowUploadForm(!showUploadForm);
        } else {
            Swal.fire({
                icon: "warning",
                title: 'Selección inválida',
                text: 'Por favor, seleccione un mes y un año antes de cargar el reporte.',
                showConfirmButton: true,
                timer: 8500
            });
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Función para generar el periodo en formato YYYY-MM-01
    const getPeriodo = (month, year) => {
        // Asegurarse de que el mes tenga siempre dos dígitos
        const monthFormatted = month < 10 ? `0${month}` : month;
        return `${year}-${monthFormatted}-01`;  // Generamos el periodo en el formato correcto
    };


    // Función para procesar el archivo CSV
const handleUpload = async () => {
    if (!selectedFile) {
        Swal.fire({
            title: 'Archivo no seleccionado',
            text: 'Por favor, selecciona un archivo primero.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    try {
        setIsLoading(true); // Activar el estado de carga

        // Leer el archivo CSV con Papaparse
        Papa.parse(selectedFile, {
            complete: async (resultCsv) => {
                
                const csvData = resultCsv.data;

                
                // Función para formatear las fechas como cadenas en el formato adecuado
                function formatDate(dateStr) {
                    if (!dateStr) return null;
                
                    const [datePart, timePart = '00:00'] = dateStr.split(' ');  // Si no hay hora, usa 00:00
                    const [day, month, year] = datePart.split('/');  // Asumiendo formato DD/MM/YYYY
                
                    // Construir la fecha en formato YYYY-MM-DD HH:mm
                    return `${year}-${month}-${day} ${timePart}`;
                }

                  // Filtrar solo los registros con Testname: conn
                  const filteredData = csvData.filter(row => row['Testname'] === 'conn');
                  
  

                // Antes de llamar a parseDate, imprimimos la fecha original
                const startDates = filteredData.map(row => {
                    const formattedStartDate = formatDate(row['Start Date']); // Usamos formatDate en lugar de parseDate
                    if (!formattedStartDate) {
                        console.error("Fecha inválida en Start Date:", row['Start Date']);
                    }
                    // Convertimos la cadena formateada en un objeto Date
                    const dateObj = formattedStartDate ? new Date(formattedStartDate) : null;
                    return dateObj;
                });

                
                const endDates = filteredData.map(row => {
                    const formattedEndDate = formatDate(row['End Date']); // Usamos formatDate para End Date
                    if (!formattedEndDate) {
                        console.error("Fecha inválida en End Date:", row['End Date']);
                    }
                    // Convertimos la cadena formateada en un objeto Date
                    const dateObj = formattedEndDate ? new Date(formattedEndDate) : null;
                    return dateObj;
                });
                

                // Verificar si las fechas extraídas corresponden al mes seleccionado
                const startMonths = startDates.map(date => date ? date.getMonth() + 1 : null); // Meses en formato 1-12
const endMonths = endDates.map(date => date ? date.getMonth() + 1 : null); // Meses en formato 1-12


                if (!startMonths.includes(selectedMonth) || !endMonths.includes(selectedMonth)) {
                    Swal.fire({
                        title: 'Mes no coincide',
                        text: 'El mes del archivo no coincide con el mes seleccionado.',
                        icon: 'warning',
                        confirmButtonText: 'Aceptar'
                    });
                    return;
                }

              

                // Detectar duplicados de "Host" con "Testname: conn"
                const seenHostsWithConn = new Set();  // Para trackear los Hosts ya vistos
                const duplicateHostsWithConn = new Set();  // Para trackear los duplicados

                // Iteramos para encontrar los duplicados
                filteredData.forEach(row => {
                    const host = row['Host'];  // Obtener el Host de cada fila
                    if (seenHostsWithConn.has(host)) {
                        duplicateHostsWithConn.add(host);  // Si ya hemos visto este Host, es un duplicado
                    } else {
                        seenHostsWithConn.add(host);  // Si es el primero, lo agregamos al Set
                    }
                });

                // Si encontramos duplicados, mostramos los Hosts duplicados en un Swal
                if (duplicateHostsWithConn.size > 0) {
                    const duplicateList = [...duplicateHostsWithConn].join(', ');
                    const result = await Swal.fire({
                        title: 'Hosts duplicados con Testname "conn"',
                        text: `Los siguientes Hosts tienen duplicados con Testname "conn": \n${duplicateList}`,
                        icon: 'warning',
                        confirmButtonText: 'Aceptar'
                    });

                    // Después de que el usuario hace clic en 'Aceptar', continuamos con la carga
                    if (result.isConfirmed) {
                        // Continuamos con el proceso de eliminación de duplicados
                        const uniqueData = [];
                        const seenHosts = new Set();

                        // Iteramos sobre los registros filtrados para eliminar duplicados
                        filteredData.forEach(row => {
                            const host = row['Host'];
                            const formattedStartDate = formatDate(row['Start Date']);  // Usar la fecha formateada
    const formattedEndDate = formatDate(row['End Date']);      // Usar la fecha formateada
                            // Solo agregar el primer registro con un Host único y Testname: conn
                            if (!seenHosts.has(host)) {
                                seenHosts.add(host);

                                // Asegúrate de que todos los campos necesarios están incluidos
                                const dataToSend = {
                                    Client: row['Client'] || '',
                                    Host: row['Host'] || '',
                                    Testname: row['Testname'] || '',
                                    'Start Date': formattedStartDate,  // Asignamos la fecha formateada
                                    'End Date': formattedEndDate,   
                                    Availability: row['Availability(%)'] || null,
                                    Downtime: row['Downtime (h:m:s)'] || '',
                                    Type: row['Type'] || '',
                                    Page: row['Page'] || '',
                                    Group: row['Group'] || '',
                                    Comment: row['Comment'] || '',
                                    Name_Alias: row['Name Alias'] || '',
                                    Description_1: row['Description 1'] || '',
                                    Description_2: row['Description 2'] || '',
                                    Description_3: row['Description 3'] || '', 
                                    Periodo: getPeriodo(selectedMonth, selectedYear) // Añadimos el periodo
                                };
                                

                                // Verificamos que el objeto no esté vacío antes de agregarlo
                                if (Object.values(dataToSend).some(value => value !== '')) {
                                    uniqueData.push(dataToSend);  // Agregamos el registro filtrado y completo a la lista de datos únicos
                                }
                            }
                        });

                        // Verificar si hay datos después de filtrar
                        if (uniqueData.length === 0) {
                            Swal.fire({
                                title: 'No hay datos válidos',
                                text: 'No se encontraron registros con Testname: conn.',
                                icon: 'info',
                                confirmButtonText: 'Aceptar'
                            });
                            setIsLoading(false);
                            return;
                        }

                        // Verificar si ya existen registros en la base de datos
                        let overwrite = false; // Variable para saber si se debe sobrescribir
                        try {
                            const response = await checkExistingRecords(selectedMonth, selectedYear);
                            if (response) {
                                // Si existen registros, preguntar si se desea sobrescribir
                                const result = await Swal.fire({
                                    title: 'Registro existente',
                                    text: 'El mes que intenta cargar ya tiene registrado el Reporte de Disponibilidad. ¿Desea sobrescribir los datos existentes?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Sí, sobrescribir',
                                    cancelButtonText: 'No, cancelar'
                                });

                                // Si el usuario confirma, establecer overwrite en true
                                if (result.isConfirmed) {
                                    overwrite = true;

                                    // Eliminar los registros existentes antes de la carga
                                    await InventarioRedesApi.deleteExistingRecords(selectedMonth, selectedYear);
                                } else {
                                    return; // Cancelar la operación si el usuario no desea sobrescribir
                                }
                            }
                        } catch (error) {
                            console.error('Error checking existing records:', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'Hubo un problema al verificar los registros existentes.',
                                icon: 'error',
                                confirmButtonText: 'Aceptar'
                            });
                            return; // Salir de la función en caso de error
                        }

                        // Mostrar mensaje de carga
                        setIsLoading(true);
                        Swal.fire({
                            title: 'Cargando...',
                            text: 'Por favor, espere mientras se cargan los datos.',
                            allowOutsideClick: false,
                            showConfirmButton: false,
                            showCloseButton: false,
                            willOpen: () => {
                                Swal.showLoading(); // Mostrar el loader
                            }
                        });
                        
                        // Enviar los registros filtrados y sin duplicados al servidor
                        const result = await InventarioRedesApi.UploadReporteDisponibilidad(uniqueData, selectedMonth, selectedYear);

                        // Manejar la respuesta del servidor
                        setSelectedFile(null);
                        setShowUploadForm(false); // Cerrar el formulario después de la carga

                        Swal.fire({
                            title: 'Archivo cargado con éxito',
                            text: 'El reporte ha sido procesado correctamente.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        });
                    } else {
                        // Si el usuario no confirma, simplemente salimos
                        setIsLoading(false);  // Detener la carga
                    }
                }
            },
            header: true, // Esto asegura que la primera fila se use como encabezados
            skipEmptyLines: true, // Salta las líneas vacías
            delimiter: ';' // Especifica que el delimitador es ';'
        });

    } catch (error) {
        console.error('Error al procesar el archivo CSV:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al procesar el archivo. Asegúrate de que el formato sea correcto.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    } finally {
        setIsLoading(false); // Desactivar el estado de carga
    }
};



    const checkExistingRecords = async (month, year) => {
        const url = `${import.meta.env.VITE_URL_SERVICES}check-records?month=${month}&year=${year}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error('Network response was not ok'); // Maneja errores de red
        }

        const data = await res.json();
        return data.exists; // Asumiendo que el API devuelve { exists: true/false }
    };


    return (
        <div className="select-month-container">
            <h3>Reporte de disponibilidad</h3>
            <h5 style={{ margin: '20px' }}>Seleccione mes y año del reporte de disponibilidad</h5>
            <div className="dropdown-container">
                <Dropdown
                    value={selectedMonth}
                    options={months}
                    onChange={(e) => setSelectedMonth(e.value)}
                    placeholder="Seleccione un mes"
                />
                <Dropdown
                    value={selectedYear}
                    options={years.map(year => ({ label: year, value: year }))}
                    onChange={(e) => setSelectedYear(e.value)}
                    placeholder="Seleccione un año"
                />
            </div>
            <div className="button-container">
                <Button label="Ver Reporte" onClick={handleSubmit} severity="secondary" text raised />
                <Button label="Cargar Reporte" onClick={handleUploadToggle} severity="info" text raised />
            </div>
            {/* Formulario de carga de archivo */}
            {showUploadForm && (
                <div className="button-container">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv"
                        id="file-upload"
                        style={{ display: 'none' }} // Oculta el input
                    />
                    <label htmlFor="file-upload" className="custom-file-upload btn btn-success">
                        {selectedFile ? selectedFile.name : 'Seleccionar Archivo'}
                    </label>
                    <button onClick={handleUpload} className="btn btn-primary">Subir Archivo</button>
                </div>
            )}
        </div>
    );
};
