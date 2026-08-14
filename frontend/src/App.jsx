import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navabar'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizadorHome from './pages/Organizador_home';
import PortariaHome from './pages/Portaria_home';
import MeusIngressos from './pages/client/MeusIngressos';
import ProtectedRoute from './components/ProtectedRoute';
import EventoDetalhe from './pages/EventoDetalhe'; 

function App() {
  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/evento/:id" element={<EventoDetalhe />} />

        <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
          <Route path="/meus-ingressos" element={<MeusIngressos />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['organizador']} />}>
          <Route path="/painel-organizador" element={<OrganizadorHome />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['portaria', 'organizador']} />}>
          <Route path="/portaria" element={<PortariaHome />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;