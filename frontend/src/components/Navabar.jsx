import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [termoBusca, setTermoBusca] = useState('');
  const [usuario, setUsuario] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && token.includes('.')) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        setUsuario({
          nome: decodedPayload.nome, 
          role: decodedPayload.role
        });
      } catch (error) {
        console.error("Erro ao decodificar token na Navbar:", error);
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  }, [location]);

  const fazerBusca = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/?q=${encodeURIComponent(termoBusca.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/login');
  };

  
  const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  return (
    <nav className="navbar py-2" role="navigation" aria-label="Navegação principal">
      <div className="container px-4">
      
        <div className="navbar-brand">
          <Link to="/" className="navbar-item has-text-weight-bold is-size-4 has-text-link">
            TicketPlatform.
          </Link>
        </div>

        
        <div className="navbar-menu is-active is-shadowless" style={{ backgroundColor: 'transparent' }}>
          
    
          <div className="navbar-start is-align-items-center ml-4">
            
  
            <div className="navbar-item has-dropdown is-hoverable mr-3">
              <a className="navbar-link is-arrowless has-text-weight-medium" style={{ cursor: 'pointer' }}>
                <span className="mr-1">📍</span> São Paulo <span className="is-size-7 ml-1">▼</span>
              </a>
        
              <div className="navbar-dropdown is-boxed" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <a className="navbar-item">Rio de Janeiro</a>
                <a className="navbar-item">Belo Horizonte</a>
                <a className="navbar-item">Curitiba</a>
              </div>
            </div>

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


          <div className="navbar-end is-align-items-center">
            
         
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


            {usuario ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link is-arrowless is-flex is-align-items-center" style={{ cursor: 'pointer' }}>
      
                  <div className="image is-32x32 mr-2 is-flex is-align-items-center is-justify-content-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }}>
                    <img 
                      src={defaultAvatar} 
                      alt="Avatar Padrão" 
                      style={{ height: '20px', width: '20px', maxHeight: 'none' }}
                    />
                  </div>
       
                  <div>
                    <div className="has-text-weight-bold is-size-6" style={{ color: 'white', lineHeight: '1' }}>
                      {usuario.nome}
                    </div>
                    <div className="is-size-7 is-capitalized" style={{ color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                      {usuario.role}
                    </div>
                  </div>
                </a>
                
               <div className="navbar-dropdown is-right" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <Link 
                    to={
                      usuario.role === 'cliente' ? '/meus-ingressos' : 
                      usuario.role === 'organizador' ? '/painel-organizador' : '/portaria'
                    } 
                    className="navbar-item"
                  >
                    Meu Painel
                  </Link>
                  <hr className="navbar-divider" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <a className="navbar-item has-text-danger" onClick={handleLogout}>
                    Sair
                  </a>
                </div>
              </div>
            ) : (
              <div className="navbar-item">
                <Link 
                  to="/login" 
                  className="button is-warning is-rounded has-text-weight-bold px-5"
                  style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                >
                  Entrar
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}