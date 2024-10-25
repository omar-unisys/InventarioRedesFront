import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Asegúrate de importar Swal
import InventarioRedesApi from '../services/InventarioRedesApi';

export const SelectMonth = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
            console.log("Archivo: ", selectedFile);
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
                text: 'Hubo un problema al subir el archivo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
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
