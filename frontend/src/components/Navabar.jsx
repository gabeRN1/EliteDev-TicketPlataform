import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [termoBusca, setTermoBusca] = useState('');
  const navigate = useNavigate();

  const fazerBusca = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/?q=${encodeURIComponent(termoBusca.trim())}`);
    }
  };

  return (
    <nav className="navbar py-2" role="navigation" aria-label="Navegação principal">
      <div className="container px-4">
        
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="navbar-item has-text-weight-bold is-size-4 has-text-link">
            TicketPlatform.
          </Link>
        </div>

        {/* Menu (Centro e Direita) */}
        <div className="navbar-menu is-active is-shadowless" style={{ backgroundColor: 'transparent' }}>
          
          {/* Lado Esquerdo: Localização e Links */}
          <div className="navbar-start is-align-items-center ml-4">
            
            {/* 1. Localização */}
            <div className="navbar-item has-dropdown is-hoverable mr-3">
              <a className="navbar-link is-arrowless has-text-weight-medium">
                <span className="mr-1">📍</span> São Paulo <span className="is-size-7 ml-1">▼</span>
              </a>
              {/* Dropdown de cidades */}
              <div className="navbar-dropdown is-boxed" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <a className="navbar-item">Rio de Janeiro</a>
                <a className="navbar-item">Belo Horizonte</a>
                <a className="navbar-item">Curitiba</a>
              </div>
            </div>

            {/* 2. Categorias */}
            <Link to="/filmes" className="navbar-item is-uppercase is-size-7 has-text-weight-bold mr-2">
              Filmes
            </Link>
            <Link to="/cinema" className="navbar-item is-uppercase is-size-7 has-text-weight-bold mr-2">
              Cinemas
            </Link>
            <Link to="/teatro" className="navbar-item is-uppercase is-size-7 has-text-weight-bold mr-2">
              Teatro
            </Link>
            <Link to="/eventos" className="navbar-item is-uppercase is-size-7 has-text-weight-bold">
              Eventos
            </Link>
          </div>

          {/* Lado Direito: Busca e Login */}
          <div className="navbar-end is-align-items-center">
            
            {/* 3. Searchbar */}
            <div className="navbar-item">
              <form onSubmit={fazerBusca}>
                <div className="control">
                  <input
                    className="input is-rounded is-small"
                    type="text"
                    placeholder="Buscar..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      minWidth: '200px'
                    }}
                  />
                </div>
              </form>
            </div>

            {/* 4. Botão Entrar */}
            <div className="navbar-item">
              <Link 
                to="/login" 
                className="button is-warning is-rounded has-text-weight-bold px-5"
                style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
              >
                Entrar
              </Link>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}