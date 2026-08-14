import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const NAV_LINKS = [
  { to: '/filmes', label: 'Filmes' },
  { to: '/cinema', label: 'Cinemas' },
  { to: '/teatro', label: 'Teatro' },
  { to: '/eventos', label: 'Eventos' },
];

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

  const painelDoUsuario =
    usuario?.role === 'cliente' ? '/meus-ingressos' :
    usuario?.role === 'organizador' ? '/painel-organizador' : '/portaria';

  return (
    <nav className="navbar" role="navigation" aria-label="Navegação principal">
      <div className="container px-4">

        <div className="navbar-brand">
          <Link
            to="/"
            className="navbar-item is-flex is-align-items-center"
            style={{ gap: '10px', paddingLeft: 0 }}
          >
            <span
              className="is-flex is-align-items-center is-justify-content-center"
              style={{
                width: '26px',
                height: '26px',
                border: '1px solid var(--line-strong)',
                color: 'var(--accent-soft)'
              }}
            >
              <Icon name="ticket" size={15} />
            </span>
            <span
              className="has-text-weight-bold is-size-6"
              style={{ letterSpacing: '-0.03em' }}
            >
              TicketPlatform
            </span>
          </Link>
        </div>

        <div
          className="navbar-menu is-active is-shadowless"
          style={{ backgroundColor: 'transparent' }}
        >

          <div className="navbar-start is-align-items-center ml-5">

            <div className="navbar-item has-dropdown is-hoverable" style={{ padding: 0 }}>
              <a
                className="navbar-link is-arrowless tp-navlink is-flex is-align-items-center"
                style={{ cursor: 'pointer', gap: '6px' }}
              >
                <Icon name="pin" size={13} />
                São Paulo
                <Icon name="chevronDown" size={13} />
              </a>

              <div className="navbar-dropdown is-boxed">
                <a className="navbar-item">Rio de Janeiro</a>
                <a className="navbar-item">Belo Horizonte</a>
                <a className="navbar-item">Curitiba</a>
              </div>
            </div>

            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '16px',
                background: 'var(--line)',
                margin: '0 12px'
              }}
            />

            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`navbar-item tp-navlink ${location.pathname === item.to ? 'is-current' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="navbar-end is-align-items-center">

            <div className="navbar-item">
              <form onSubmit={fazerBusca}>
                <div
                  className="is-flex is-align-items-center"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--bg-inset)',
                    padding: '0 10px',
                    height: '34px',
                    minWidth: '220px'
                  }}
                >
                  <span className="tp-muted"><Icon name="search" size={14} /></span>
                  <input
                    className="input is-small tp-mono"
                    type="text"
                    aria-label="Buscar eventos"
                    placeholder="Buscar evento"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      boxShadow: 'none',
                      height: '32px',
                      fontSize: '0.75rem'
                    }}
                  />
                </div>
              </form>
            </div>

            {usuario ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <a
                  className="navbar-link is-arrowless is-flex is-align-items-center"
                  style={{ cursor: 'pointer', gap: '10px' }}
                >
                  <span
                    className="is-flex is-align-items-center is-justify-content-center"
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid var(--line-strong)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Icon name="user" size={15} />
                  </span>

                  <span className="is-block has-text-left">
                    <span
                      className="is-block has-text-weight-semibold is-size-7"
                      style={{ lineHeight: 1.1 }}
                    >
                      {usuario.nome}
                    </span>
                    <span className="is-block tp-eyebrow" style={{ fontSize: '0.625rem' }}>
                      {usuario.role}
                    </span>
                  </span>

                  <Icon name="chevronDown" size={13} />
                </a>

                <div className="navbar-dropdown is-right">
                  <Link to={painelDoUsuario} className="navbar-item">
                    Meu painel
                  </Link>
                  <hr className="navbar-divider" />
                  <a
                    className="navbar-item is-flex is-align-items-center"
                    style={{ gap: '8px', color: 'var(--red)' }}
                    onClick={handleLogout}
                  >
                    <Icon name="logout" size={14} />
                    Sair
                  </a>
                </div>
              </div>
            ) : (
              <div className="navbar-item">
                <Link
                  to="/login"
                  className="button is-small tp-btn-invert tp-btn-label px-4"
                  style={{ height: '34px' }}
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
