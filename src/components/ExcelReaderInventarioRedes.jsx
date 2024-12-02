import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { format, parse, isValid } from 'date-fns';
import InventarioRedesApi from '../services/InventarioRedesApi';

export const ExcelReaderInventarioRedes = () => {
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
            // Lee la primera hoja
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            
        // Lee la hoja "Equipos Disponibles"
        const thirdSheetName = "Equipos Disponibles";
        const thirdWorksheet = workbook.Sheets[thirdSheetName];

            const startRow = 9;  // Fila 10 en 0-indexado

            // Obtener el rango de la hoja para calcular la última fila
            const range = XLSX.utils.decode_range(worksheet['!ref']);
             // Determinar el endRow basado en la columna Serial
            let endRow = startRow; // Inicia con la fila de inicio
            for (let r = startRow; r <= range.e.r; r++) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: r, c: 0 })]; // Columna 0 es Serial
                if (!cell || !cell.v) { // Si la celda está vacía
                    break; // Sal del bucle si encuentras una fila en blanco
                }
                endRow = r; // Actualiza endRow si la fila tiene datos
            }

            
            
            const headers = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { r: startRow - 1, c: 0 }, e: { r: startRow - 1, c: range.e.c } }
            })[0].map(header => header.replace(/(\r\n|\n|\r)/gm, "").trim()); // Limpia los saltos de línea

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: headers,
                range: { s: { r: startRow, c: 0 }, e: { r: endRow, c: range.e.c } }
            });

            const convertDate = (date) => { 
                // Verifica si la fecha es inválida, está vacía, o es uno de los textos especiales
                const invalidTexts = ["N/A", "Sin Soporte", "Sin Garantía", "Sin Fecha"];
                
                if (!date || date === "" || invalidTexts.includes(date) || (typeof date === 'string' && isNaN(Date.parse(date)))) {
                    return ""; // Retorna una cadena vacía si el valor no es una fecha válida
                }
            
                let parsedDate;
            
                if (typeof date === 'number') {
                    // Fecha en formato numérico de Excel
                    parsedDate = XLSX.SSF.parse_date_code(date);
                    if (!parsedDate) return ""; 
                    parsedDate = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
                } else {
                    // Trata de convertir diferentes formatos de cadena
                    try {
                        parsedDate = parse(date, 'yyyy-MM-dd', new Date());
                    } catch (error) {
                        try {
                            parsedDate = parse(date, 'MM/dd/yyyy', new Date());
                        } catch (error) {
                            return ""; // Retorna cadena vacía si el formato no es válido
                        }
                    }
                }
            
                return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : "";
            };
            
            

            const convertYesNo = (value) => {
                const lowerValue = value.toLowerCase();
                if (lowerValue === "si" || lowerValue === "sí") return 1;
                if (lowerValue === "no") return 0;
                return null;
            };
            

            // Función para convertir valores de criticidad
            // Función para convertir valores de criticidad
const convertCriticidad = (value) => {
    if (typeof value !== 'string') {
        return null; // Si el valor no es una cadena, retornamos null
    }

    // Convertir a minúsculas y luego capitalizar la primera letra
    const normalizedValue = value.trim().toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());

    // Mapeo de valores aceptados
    const mapping = {
        "Baja": "Baja",
        "Media": "Media",
        "Alta": "Alta",
        "Muy Alta": "Muy Alta",
        "Bajo": "Baja",
        "Medio": "Media",
        "Alto": "Alta",
        "Muy Alto": "Muy Alta",
        "Muy alta": "Muy Alta",
    };

    // Devolvemos el valor mapeado, o null si no se encuentra
    return mapping[normalizedValue] || null;
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
                'InStock': 'InStock',
                'Activo':'Activo',
                'Placa': 'Placa'
            };

            const currentDate = format(new Date(), 'yyyy-MM-dd');

            const mappedData = jsonData.map(row => {
                const transformedRow = {};
                for (const [header, field] of Object.entries(fieldMapping)) {
                    if (row[header] !== undefined) {
                        let value = row[header];
            
                        // Remover saltos de línea si el valor es una cadena
                        if (typeof value === 'string') {
                            value = value.replace(/(\r\n|\n|\r)/gm, ""); // Elimina saltos de línea
                        }
                        // Limpieza específica para idSerial
                        if (field === 'idSerial' && typeof value === 'string') {
                            value = value.replace(/\s+/g, "").trim(); // Elimina todos los espacios en blanco
                        }
                        if (field.includes('Fecha')) {
                            transformedRow[field] = convertDate(value) || "0000-00-00"; // Ejemplo si no se permite null
                        } else if (field === 'Administrable') {
                            transformedRow[field] = convertYesNo(value) || 0; // Retorna 0 si no hay valor
                        } else if (field === 'idCriticidad') {
                            transformedRow[field] = convertCriticidad(value) || "";
                        } else {
                            transformedRow[field] = value || null; // Asigna null si no hay valor
                        }
                    } else {
                        // Asignar un valor predeterminado de "" para columnas faltantes
                        transformedRow[field] = "";
                    }
                }
                // Aplicar la lógica de "Criticidad" si es Comunicaciones y Filial En Uso es REP
                if (transformedRow['idTipoEquipo'] === 'Comunicaciones' && transformedRow['idFilial'] === 'REP' && transformedRow['idCriticidad']) {
                    //transformedRow['idCriticidad'] += '-REP';  // Agregar "-REP" al valor de criticidad
                }

                transformedRow['FechaModificacion'] = currentDate;
                transformedRow['InStock'] = 0; // Establece InStock en 0 para esta hoja
                transformedRow['Activo'] = 1; // Establece Activo en 1 para esta hoja
                return transformedRow;
            });
            

            console.log('Mapped Data:', mappedData);

            // Procesar la tercera hoja
        const thirdRange = XLSX.utils.decode_range(thirdWorksheet['!ref']);
        const thirdHeaders = XLSX.utils.sheet_to_json(thirdWorksheet, {
            header: 1,
            range: { s: { r: startRow - 1, c: 0 }, e: { r: startRow - 1, c: thirdRange.e.c } }
        })[0].map(header => header.replace(/(\r\n|\n|\r)/gm, "").trim()); // Limpia los saltos de línea
        
        

        // Determinar el endRow para la tercera hoja 
        let thirdEndRow = startRow;
        for (let r = startRow; r <= thirdRange.e.r; r++) {
            const cell = thirdWorksheet[XLSX.utils.encode_cell({ r: r, c: 0 })]; // Columna 0 es Serial
            if (!cell || !cell.v) {
                break; // Sal del bucle si encuentras una fila en blanco
            }
            thirdEndRow = r; // Actualiza thirdEndRow si la fila tiene datos
        }
        const thirdJsonData = XLSX.utils.sheet_to_json(thirdWorksheet, {
            header: thirdHeaders,
            range: { s: { r: startRow, c: 0 }, e: { r: thirdEndRow, c: thirdRange.e.c } }
        });

        const mappedThirdData = thirdJsonData.map(row => {
            const transformedRow = {};
            for (const [header, field] of Object.entries(fieldMapping)) {
                if (row[header] !== undefined) {
                    let value = row[header];
                    if (typeof value === 'string') {
                        value = value.replace(/(\r\n|\n|\r)/gm, "").trim(); // Elimina saltos de línea
                    }
        
                    // Limpieza específica para idSerial
                    if (field === 'idSerial' && typeof value === 'string') {
                        value = value.replace(/\s+/g, "").trim(); // Elimina todos los espacios en blanco
                    }
        
                    // Depuración de fecha
                    if (field.includes('Fecha')) {
                        const convertedDate = convertDate(value);
                        transformedRow[field] = convertedDate || "0000-00-00";
                    } else if (field === 'Administrable') {
                        transformedRow[field] = convertYesNo(value) || 0;
                    } else if (field === 'idCriticidad') {
                        transformedRow[field] = convertCriticidad(value) || "";
                    } else {
                        transformedRow[field] = value || null;
                    }
                } else {
                    transformedRow[field] = null; // Asignar null si el valor está indefinido
                }
                
                // Validación para idFilialPago, idFilial, idTipoEquipo (asegurarse de asignar valores predeterminados)
                if (field === 'idFilialPago' || field === 'idFilial') {
                    // Si es null o una cadena vacía, asignar "ISA"
                    if (!transformedRow[field]) {
                        transformedRow[field] = "ISA";
                    }else if(transformedRow[field] ==="ITX"){
                        transformedRow[field] = "INTERNEXA";
                    }
                }
                if (field === 'idEstado') {
                    // Si es null o una cadena vacía, asignar "Switche"
                    if (!transformedRow[field]) {
                        transformedRow[field] = "Disponible";
                    }
                }
                
                if (field === 'idTipoEquipo') {
                    // Si es null o una cadena vacía, asignar "Switche"
                    if (!transformedRow[field]) {
                        transformedRow[field] = "Switche";
                    }
                }
            }
        
            // Asignación de valores adicionales
            transformedRow['InStock'] = 1; // Establece InStock en 1 para esta hoja
            transformedRow['Activo'] = 0; // Establece Activo en 0 para esta hoja
            transformedRow['FechaModificacion'] = currentDate;
        
            return transformedRow;
        });
        
        
        
        console.log('Mapped Third Data:', mappedThirdData);
        

        //console.log('Mapped Third Data:', mappedThirdData);


        try {
            const batchSize = 100; // Cambia este valor según sea necesario
            // Procesar primera hoja
            await processBatch(mappedData);
            // Procesar tercera hoja
            await processBatch(mappedThirdData);

            toast.show({ severity: 'success', summary: 'Éxito', detail: 'Datos importados correctamente' });
        } catch (error) {
            toast.show({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al importar los datos.' });
            console.error('Error al importar los datos:', error);
        }
            
        };

        reader.readAsArrayBuffer(file);
    };

    // Función para procesar datos en lotes
    const processBatch = async (data) => {
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            for (let item of batch) {
                try {
                    await InventarioRedesApi.createInventarioRedes(item);
                } catch (err) {
                    console.error(`Error al procesar la fila ${i + 1}:`, err);
                    toast.show({ severity: 'error', summary: 'Error', detail: `Error en la fila ${i + 1}: ${err.message}` });
                }
            }
        }
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

export default ExcelReaderInventarioRedes;