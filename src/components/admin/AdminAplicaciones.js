import './AdminAplicaciones.css';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from "../../hooks/useAuth";
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { MaterialReactTable } from 'material-react-table';
import { RiDeleteBin6Line, RiEdit2Fill } from "react-icons/ri";
import { VscNewFile } from "react-icons/vsc";
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import { createTheme, ThemeProvider, useTheme } from '@mui/material';

export const AdminAplicaciones = () => {

    const globalTheme = useTheme(); // (optional) if you already have a theme defined in your app root, you can import here

    const tableTheme = useMemo(
        () =>
        createTheme({
            palette: {
            mode: globalTheme.palette.mode, // let's use the same dark/light mode as the global theme
            info: {
                main: 'rgb(255,122,0)', // add in a custom color for the toolbar alert background stuff
            },
            background: {
                default:
                globalTheme.palette.mode === 'light'
                    ? 'rgb(254,255,244)' // random light yellow color for the background in light mode
                    : '#000', // pure black table in dark mode for fun
            },
            },
            typography: {
            button: {
                textTransform: 'none', // customize typography styles for all buttons in table by default
                fontSize: '1.2rem',
            },
            },
            components: {
            MuiTooltip: {
                styleOverrides: {
                tooltip: {
                    fontSize: '0.8rem', // override to make tooltip font size larger
                },
                },
            },
            MuiTableHeadCell: {
                styleOverrides: {
                root: {
                    backgroundColor: 'lightblue', // Change the background color of the header
                    textAlign: 'center', // Center the text in the header
                },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                root: {
                    color: 'white', // Change the color of the icons in the toolbar to red
                },
                },
            },
            },
        }),
        [globalTheme],
    );

    const [validated, setValidated] = useState(false);
    const [applications, setApplications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ apl_id: '', apl_nombre: '', apl_url: '', apl_interno: false, apl_imagen: null });
    const { token } = useAuth();
    const url = import.meta.env.VITE_URL_SEGURIDAD + 'aplicaciones';
    const [isEditMode, setIsEditMode] = useState(false);

    const aplIdRef = useRef(null);
    const aplNombreRef = useRef(null);
    const aplUrlRef = useRef(null);
    const aplInternoRef = useRef(null);
    const aplImagenRef = useRef(null);

    const fetchApplications = useCallback(async () => {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        // console.log(data);
        setApplications(data);
    }, [token, url]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        if (showModal && aplIdRef.current) {
            aplIdRef.current.value = modalData.apl_id;
            aplNombreRef.current.value = modalData.apl_nombre;
            aplUrlRef.current.value = modalData.apl_url;
            aplInternoRef.current.checked = modalData.apl_interno;
        }
    }, [showModal, modalData]);

    const handleShowModal = useCallback((data) => {
        setModalData(data || { apl_id: '', apl_nombre: '', apl_url: '', apl_interno: false, apl_imagen: null });
        setIsEditMode(!!data);
        setShowModal(true);
    }, []);

    const handleCloseModal = () => {
        setValidated(false);
        setShowModal(false);
    };

    const handleDelete = useCallback(async (id) => {
        Swal.fire({
            title: `Está seguro que desea eliminar la aplicación con id ${id}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "No",
            confirmButtonText: "Sí"
        }).then((result) => {
            if (result.isConfirmed) {
                
                fetch(`${url}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(async (response) => {
                    if(response.ok)
                        return response.json();
                    const res = await response.json();
                    throw new Error(res.message);
                })
                .then((responseJson) => {
                    Swal.fire({
                        title: '',
                        text: responseJson.message,
                        icon: 'success',
                        confirmButtonText: 'Ok'
                      });

                    fetchApplications()
                })
                .catch((error) => {
                    Swal.fire({
                        title: '',
                        text: error,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                      });
                });
            }
        });
    }, [token, url, fetchApplications]);

    const handleSave = async () => {

        const form = document.getElementById('frmAplicacion');

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const url2 = isEditMode ? `${url}/${modalData.apl_id}` : url;

        const modaldata2 = { 
            id: aplIdRef.current.value, 
            nombre: aplNombreRef.current.value, 
            interno: aplInternoRef.current.checked,
            url: aplUrlRef.current.value,
            imagen: modalData.apl_imagen
        };

        if (modalData.apl_imagen) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                modaldata2.imagen = reader.result.split(',')[1]; // Remove the base64 prefix
                await fetch(url2, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(modaldata2)
                }).then(async (response) => {
                    if(response.ok)
                        return response.json();
                    const res = await response.json();
                    throw new Error(res.message);
                })
                .then((responseJson) => {
                    Swal.fire({
                        title: '',
                        text: 'Se ha creado exitosamente la nueva aplicación ' + responseJson.id,
                        icon: 'success',
                        confirmButtonText: 'Ok'
                      });

                    fetchApplications()
                })
                .catch((error) => {
                    Swal.fire({
                        title: '',
                        text: error,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                      });
                });

                fetchApplications();
                handleCloseModal();
            };
            reader.readAsDataURL(modalData.apl_imagen);
        } else {
            await fetch(url2, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(modaldata2)
            });

            fetchApplications();
            handleCloseModal();
        }
    };

    const handleFileChange = (e) => {
        setModalData({ ...modalData, apl_imagen: e.target.files[0] });
    };

    const columns = useMemo(
        () => [
          {
            accessorKey: 'apl_id',
            header: 'ID',
            filterVariant: 'text',
            size: 200,
          },
          {
            accessorKey: 'apl_nombre',
            header: 'Nombre',
            filterVariant: 'text',
            size: 100,
          },
          {
            accessorKey: 'apl_url',
            header: 'URL',
            filterVariant: 'text',
            size: 100,
          },
          {
            accessorKey: 'apl_interno',
            header: 'Interno',
            filterVariant: 'checkbox',
            Cell: ({ cell }) => (cell.getValue() ? 
            <Form.Check
                checked
                readOnly
                type="switch"
                label=""
                onClick={event => event.preventDefault()}
            /> : 
            <Form.Check
                type="switch"
                readOnly
                label=""
                onClick={event => event.preventDefault()}
            />),
          },
          {
            header: 'Acciones',
            enableColumnActions: false,
            Cell: (originalRow) => (
                <div className='text-center'>
                    <Button variant="warning" onClick={() => handleShowModal(originalRow.row.original)}><RiEdit2Fill /></Button>{' '}
                    <Button variant="danger" onClick={() => handleDelete(originalRow.row.original.apl_id)}><RiDeleteBin6Line /></Button>
                </div>
            ),
          }
        ],
        [handleDelete, handleShowModal],
    );
    
    return (
        <div className="container-fluid">
            <h1 style={{ paddingTop: '14px', paddingBottom: '20px' }}>Gestionar Aplicaciones</h1>
            <Button variant="secondary" onClick={() => handleShowModal(null)}><VscNewFile /> Nueva Aplicación</Button>{' '}
            <br /><br />
            <ThemeProvider theme={tableTheme}>
                <MaterialReactTable 
                    columns={columns} 
                    data={applications} 
                    initialState={{ showColumnFilters: true, density: 'compact' }} 
                    localization={MRT_Localization_ES} 
                    muiTableHeadCellProps={{
                        sx: {
                            // backgroundColor: '#3366CC', // Change the background color of the header
                            // color: 'white',
                        },
                        // align: 'center'
                    }}
                    muiTopToolbarProps={{
                        sx: {
                            backgroundColor: '#3366CC', // Change the background color of the header
                        },
                        // align: 'center'
                    }}
                />
            </ThemeProvider>

            <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
                <Modal.Header closeButton closeVariant='white'>
                    <Modal.Title>{isEditMode ? 'Editar Aplicación' : 'Nueva Aplicación'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="frmAplicacion" noValidate validated={validated}>
                        <Form.Group controlId="formId">
                            <FloatingLabel label="ID" className="mb-2">
                                <Form.Control
                                    type="text"
                                    autoFocus
                                    required
                                    placeholder="Ingrese ID"
                                    ref={aplIdRef}
                                    disabled={isEditMode}
                                />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group controlId="formNombre">
                            <FloatingLabel label="Nombre" className="mb-2">
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Ingrese Nombre"
                                    ref={aplNombreRef}
                                />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group controlId="formUrl">
                            <FloatingLabel label="URL" className="mb-3">
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Ingrese URL"
                                    ref={aplUrlRef}
                                />
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group controlId="formImagen" className="mb-3">
                            <Form.Label>Imagen</Form.Label>
                            <Form.Control
                                type="file"
                                required
                                ref={aplImagenRef}
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formInterno">
                            <Form.Check
                                type="checkbox"
                                label="Interno"
                                ref={aplInternoRef}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
