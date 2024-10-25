import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';



export const SelectMonth = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Por defecto, el año actual
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

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // Últimos 10 años

    const handleSubmit = () => {
        if (selectedMonth !== null) {
            // Redirigir a la pantalla del reporte de disponibilidad con el mes y año seleccionados
            navigate(`/inventario/reporteDisponibilidad/ver?month=${selectedMonth}&year=${selectedYear}`);
        }
    };

    return (
        <div>
            <h3>Seleccione mes y año del reporte de disponibilidad</h3>
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
            <Button label="Ver Reporte" onClick={handleSubmit}  className={"btn btn-secondary"}/>
            <Button label="Crear Reporte" onClick={handleSubmit}  className={"btn btn-primary"}/>
        </div>
    );
};
