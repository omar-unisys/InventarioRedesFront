import './App.css';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { IsVisibleMenu } from './components/IsVisibleMenu';
import { AuthProvider } from './context/AuthProvider';
import { useIdleTimer } from './hooks/useIdleTimer';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2'
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { Login } from './components/Login';
import { TableInventarioRedes } from  './components/TableInventarioRedes';  
import { RegistroInventarioForm } from './components/RegistroInventarioForm';
import { UpdateInventarioForm } from './components/UpdateInventarioForm'; 
import { ReemplazarInventarioForm } from './components/ReemplazarInventarioForm'; 
import { ExcelReader } from './components/ExcelReader'; 


function App() {
  const resetTimer = useIdleTimer(() => {
    const dateSession = Cookies.get('dateSession_fact');
    let finalizaSesion = false;
  
    if (dateSession !== 'null') {
      const fecha1 = Date.parse(dateSession);
      const fecha2 = Date.now();
      const minutos = (new Date(fecha2).getTime() - new Date(fecha1).getTime()) / 1000 / 60;
  
      if (minutos > parseInt(import.meta.env.VITE_TIMEOUT_SESSION)) {
        finalizaSesion = true;
      } else {
        resetTimer(); // Resetear el timer si la condición no se cumple
      }
  
      console.log(minutos);
    }

    console.log(currentLocation.pathname);
    console.log(finalizaSesion);
  
    if (currentLocation.pathname !== "/login" && finalizaSesion) { // Usar currentLocation en lugar de location
      const now = new Date();
      const time = now.getTime();
      const expireTime = time + 1000 * 60 * parseInt(import.meta.env.VITE_TIMEOUT_COOKIES);
      Cookies.set('user_fact', null, { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });
      Cookies.set('jwt_token_fact', null, { expires: (new Date(expireTime)), secure: true, sameSite: 'None' });
      Cookies.set('dateSession_fact', null, { expires: (new Date(expireTime)), secure: true, sameSite: 'None' })

      Swal.fire({
        title: '',
        text: 'Ha terminado la sesión, por favor ingrese de nuevo.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { replace: true });
        }
      });
    }
  });

  const navigate = useNavigate();
  const currentLocation = useLocation(); // Renombrar a currentLocation

  return (
    <>
      <AuthProvider>
        <IsVisibleMenu />
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/admin/aplicaciones" element={<AdminPage/>} />
          <Route path="/inventario/inventarioRedes/" element={<TableInventarioRedes/>} />
          <Route path="/inventario/RegistroInventarioForm/" element={<RegistroInventarioForm/>} />
          <Route path="/inventario/UpdateInventarioForm/:idInventarioRedes" element={<UpdateInventarioForm/>} />
          <Route path="/inventario/ReemplazarInventarioForm/:idInventarioRedes" element={<ReemplazarInventarioForm/>} />
          <Route path="/inventario/ExcelReader/" element={<ExcelReader/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
