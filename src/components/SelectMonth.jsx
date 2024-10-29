import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Asegúrate de importar Swal
import InventarioRedesApi from '../services/InventarioRedesApi';
import * as xlsx from 'xlsx';

export const SelectMonth = () => {
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
        // Validar que hay un mes y un año seleccionados antes de mostrar el formulario
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

    //función que consulta si ya hay registros para el mes y año seleccionados
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
            // Leer el archivo Excel
            const workbook = xlsx.read(await selectedFile.arrayBuffer());
            const sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheet_name];
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false }); // raw: false para leer fechas
    
            // Extraer las fechas
            const startDates = jsonData.map(row => new Date(row['Start Date']));
            const endDates = jsonData.map(row => new Date(row['End Date']));
    
            console.log('Start Dates:', startDates);
            console.log('End Dates:', endDates);
    
            // Obtener los meses
            const startMonths = startDates.map(date => date.getMonth());
            const endMonths = endDates.map(date => date.getMonth());
    
            // Comprobar si el mes seleccionado está en los meses extraídos
            if (!startMonths.includes(selectedMonth - 1) || !endMonths.includes(selectedMonth - 1)) {
                Swal.fire({
                    title: 'Mes no coincide',
                    text: 'El mes del archivo no coincide con el mes seleccionado.',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
    
            // Verificar si ya existen registros en la base de datos
            let overwrite = false; // Variable para saber si se debe sobrescribir
            try {
                const response = await checkExistingRecords(selectedMonth, selectedYear);
                console.log('Response from checkExistingRecords:', response);
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
    
            // Si el usuario ha decidido sobrescribir, proceder a cargar el archivo
            const result = await InventarioRedesApi.UploadExcelDisponibilidad(selectedFile);
            console.log('Archivo subido con éxito:', result);
    
            setSelectedFile(null);
            setShowUploadForm(false); // Cerrar el formulario después de la carga
            Swal.fire({
                title: 'Éxito',
                text: 'Archivo subido con éxito.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
    
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al subir el archivo. Por favor validar posibles registros duplicados en el archivo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            setIsLoading(false); // limpia el estado de carga
        }
    };
    
    
    
    const checkExistingRecords = async (month, year) => {
        const url = `${import.meta.env.VITE_URL_SERVICES}check-records?month=${month}&year=${year}`;
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error('Network response was not ok'); // Maneja errores de red
        }
        
        const data = await res.json();
        console.log('Check records response:', data); 
        return data.exists; // Asumiendo que el API devuelve { exists: true/false }
    };
    

    return (
        <div className="select-month-container">
            <h3>Reporte de disponibilidad</h3>
            <h5 style={{margin: '20px'}}>Seleccione mes y año del reporte de disponibilidad</h5>
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
                <Button label="Ver Reporte" onClick={handleSubmit}    severity="secondary" text raised />
                <Button label="Cargar Reporte" onClick={handleUploadToggle} severity="info" text raised />
            </div>
            {/* Formulario de carga de archivo */}
            {showUploadForm && (
    <div className="button-container">
        <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xlsb"
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
