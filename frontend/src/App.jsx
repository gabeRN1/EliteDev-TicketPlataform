import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes Globais
import Navbar from './components/Navabar';

// Páginas Gerais
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas do Cliente (Subpasta)
import Eventos from './pages/client/Eventos';
import Checkout from './pages/client/Checkout';
import MeusIngressos from './pages/client/MeusIngressos';
// Páginas de Perfis Específicos
import OrganizadorHome from './pages/Organizador_home';
import PortariaHome from './pages/Portaria_home';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas do Cliente */}
          <Route path="/evento/:id" element={<Eventos />} />
          <Route path="/checkout" element={<Checkout />} />
             <Route path="/meus-ingressos" element={<MeusIngressos />} />
          {/* Rotas do Organizador */}
          <Route path="/organizador" element={<OrganizadorHome />} />

          {/* Rotas da Portaria */}
          <Route path="/portaria" element={<PortariaHome />} />
        </Routes>
      </main>
    </>
  );
}