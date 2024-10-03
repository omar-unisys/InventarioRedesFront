import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { format, parse, isValid } from 'date-fns';
import InventarioRedesApi from '../services/InventarioRedesApi';

export const ExcelReader = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('No se ha seleccionado un archivo');
    const [toast, setToast] = useState(null);
    const toastRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setToast(toastRef.current);
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : 'No se ha seleccionado un archivo');
    };

    const handleSelectFileClick = () => {
        fileInputRef.current.click(); // Simula un clic en el input de archivo
    };

    const handleFileUpload = async () => {
        if (!file) {
            toast.show({ severity: 'error', summary: 'Error', detail: 'Por favor, selecciona un archivo.' });
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const startRow = 9;  // Fila 10 en 0-indexado
            const endRow = 12;   // Fila 13 en 0-indexado
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            
            const headers = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { r: startRow - 1, c: 0 }, e: { r: startRow - 1, c: range.e.c } }
            })[0];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: headers,
                range: { s: { r: startRow, c: 0 }, e: { r: endRow, c: range.e.c } }
            });

            const convertDate = (date) => {
                // Verifica si la fecha es inválida o está vacía
                if (!date || date === "" || date === "N/A" || (typeof date === 'string' && isNaN(Date.parse(date)))) {
                    return ""; // Retorna una cadena vacía en lugar de null
                }
            
                let parsedDate;
            
                // Maneja el caso en que date es un número (representación de fecha en Excel)
                if (typeof date === 'number') {
                    parsedDate = XLSX.SSF.parse_date_code(date);
                    if (!parsedDate) return ""; // Retorna una cadena vacía si no se puede parsear la fecha
                    parsedDate = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                } else {
                    // Maneja el caso en que date es una cadena de texto
                    parsedDate = parse(date, 'M/d/yyyy', new Date());
                }
            
                // Retorna la fecha en formato 'yyyy-MM-dd' si es válida, de lo contrario retorna una cadena vacía
                return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : "";
            };

            const convertYesNo = (value) => {
                if (value === "SI" || value === "Si" || value === "sí") return 1;
                if (value === "NO" || value === "No" || value === "no") return 0;
                return null;
            };

            // Función para convertir valores de criticidad
            const convertCriticidad = (value) => {
                const mapping = {
                    "Baja": "Baja",
                    "Media": "Media",
                    "Alta": "Alta",
                    "Muy Alta": "Muy Alta",
                    "Bajo": "Baja",
                    "Medio": "Media",
                    "Alto": "Alta",
                    "Muy Alto": "Muy Alta"
                };
                return mapping[value] || null;
            };

            const fieldMapping = {
                'Serial': 'idSerial',
                'Filial En Uso': 'idFilial',
                'Criticidad': 'idCriticidad',
                'Tipo Equipo': 'idTipoEquipo',
                'Propietario Equipo': 'idPropietarioFilial',
                'Empresa Pago': 'idFilialPago',
                'Marca': 'Marca',
                'Modelo': 'Modelo',
                'Nombre Equipo': 'NombreEquipo',
                'Dirección IP': 'DireccionIp',
                'Tipo Red': 'TipoRed',
                'País': 'Pais',
                'Sede': 'Sede',
                'Edificio Sede': 'Edificio',
                'Piso Sede': 'Piso',
                'Ubicación': 'Ubicacion',
                'Tipo Servicio': 'TipoServicio',
                'Detalle Servicio': 'DetalleServicio',
                'Administrable': 'Administrable',
                'Fecha vencimiento Soporte': 'FechaSoporte',
                'SoporteDetalle': 'SoporteDetalle',
                'Fecha Vencimiento Garantia': 'FechaGarantia',
                'GarantiaDetalle': 'GarantiaDetalle',
                'EoL': 'FechaEoL',
                'EolDetalle': 'EolDetalle',
                'Versión Firmware': 'VrsFirmware',
                'Numero Puertos': 'NumPuertos',
                'Estado': 'idEstado',
                'FechaIngreso': 'FechaIngreso',
                'Comentario': 'Comentario',
                'Conectado': 'Conectado',
                'InStock': 'InStock'
            };

            const currentDate = format(new Date(), 'yyyy-MM-dd');

            const mappedData = jsonData.map(row => {
                const transformedRow = {};
                for (const [header, field] of Object.entries(fieldMapping)) {
                    if (row[header] !== undefined) {
                        if (field.includes('Fecha')) {
                            transformedRow[field] = convertDate(row[header]) || "";
                        } else if (field === 'Administrable') {
                            transformedRow[field] = convertYesNo(row[header]) || "";
                        } else if (field === 'idCriticidad') {
                            transformedRow[field] = convertCriticidad(row[header]) || "";
                        } else {
                            transformedRow[field] = row[header] || "";
                        }
                    } else {
                        // Asignar un valor predeterminado de "" para columnas faltantes
                        transformedRow[field] = "";
                    }
                }
                transformedRow['FechaModificacion'] = currentDate;
                return transformedRow;
            });

            console.log('Mapped Data:', mappedData);

            try {
                for (const item of mappedData) {
                    await InventarioRedesApi.createInventarioRedes(item);
                }

                toast.show({ severity: 'success', summary: 'Éxito', detail: 'Datos importados correctamente' });
            } catch (error) {
                toast.show({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al importar los datos.' });
                console.error('Error al importar los datos:', error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <Toast ref={toastRef} />
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
                ref={fileInputRef}
            />
            <Button label="Seleccionar Archivo" icon="pi pi-upload" className="p-button-secondary" onClick={handleSelectFileClick} style={{ background: 'Blue', padding: '2px', marginTop: '10px' }} />
            <span style={{ marginLeft: '10px' }}>{fileName}</span>
            <Button label="Subir e Importar" onClick={handleFileUpload} style={{ background: 'cornflowerblue', padding: '2px', marginTop: '10px', marginLeft:'10px' }} />
        </div>
    );
};

export default ExcelReader;