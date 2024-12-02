import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import InventarioRedesApi from '../services/InventarioRedesApi'; 

export const SelectMonthFacturasInventarioRed = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
            navigate(`/inventario/facturacionRedes/ver?month=${selectedMonth}&year=${selectedYear}`);
        }
    };

    // Función para actualizar los valores unitarios y luego recuperar los datos
    const handleCopyTable = async () => {
        if (!selectedMonth || !selectedYear) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección inválida',
                text: 'Por favor, seleccione un mes y un año antes de proceder.',
                showConfirmButton: true,
                timer: 8500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Cargando...',
                text: 'Estamos actualizando los datos...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            // Llamada al backend para actualizar los valores unitarios
            await InventarioRedesApi.actualizarValorUnitario(selectedMonth, selectedYear);

            // Luego, realiza la llamada para obtener los datos actualizados
           //await InventarioRedesApi.joinInventarioFactura(selectedMonth, selectedYear);

            Swal.fire({
                title: 'Facturación exitosa',
                text: `Los datos para el mes ${selectedMonth} y año ${selectedYear} han sido procesados correctamente.`,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: `Hubo un problema al procesar los datos: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    return (
        <div className="select-month-container">
            <h3>Facturación Inventario Redes</h3>
            <h5 style={{ margin: '20px' }}>Seleccione mes y año a facturar</h5>
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
                <Button label="Facturar" onClick={handleCopyTable} severity="info" text raised />
            </div>
        </div>
    );
};
