import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import Icon from '../components/Icon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'E-mail ou senha incorretos');
      }

      const data = await response.json();
      const token = data.access_token;

      localStorage.setItem('token', token);

      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userRole = decodedPayload.role ;

        switch (userRole) {
          case 'cliente':
            navigate('/meus-ingressos', { replace: true });
            break;
          case 'organizador':
            navigate('/painel-organizador', { replace: true });
            break;
          case 'portaria':
            navigate('/portaria', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
            break;
        }
      } catch (decodeError) {
        console.error("Erro ao ler a role do token:", decodeError);
        navigate('/', { replace: true });
      }

    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="container px-4">
        <div className="tp-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'stretch', gap: 0 }}>

          <aside
            className="is-hidden-mobile is-flex is-flex-direction-column is-justify-content-space-between p-6"
            style={{ border: '1px solid var(--line)', borderRight: 0, background: 'var(--bg-inset)' }}
          >
            <p className="tp-eyebrow">Acesso · 01</p>
            <div>
              <h2 className="title is-2 tp-display mb-4" style={{ maxWidth: '14ch' }}>
                Seus ingressos, sempre à mão.
              </h2>
              <p className="tp-muted is-size-6" style={{ maxWidth: '38ch' }}>
                Entre para acompanhar compras, abrir o QR Code na portaria e gerenciar seus eventos.
              </p>
            </div>
            <div className="tp-mono is-size-7 tp-dim">TicketPlatform</div>
          </aside>

          <div
            className="p-6 is-flex is-flex-direction-column is-justify-content-center"
            style={{ border: '1px solid var(--line)', background: 'var(--bg-surface)' }}
          >
            <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
              <p className="tp-eyebrow mb-2">Entrar</p>
              <h1 className="title is-3 tp-display mb-5">Bem-vindo de volta</h1>

              {erro && (
                <div className="notification is-danger is-light mb-4 py-2 px-3 is-size-7 is-flex is-align-items-center" style={{ gap: '8px' }}>
                  <Icon name="alert" size={15} />
                  <span>{erro}</span>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="field tp-field">
                  <label className="label" htmlFor="login-email">E-mail</label>
                  <div className="control">
                    <input
                      id="login-email"
                      className="input"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field tp-field">
                  <div className="is-flex is-justify-content-space-between is-align-items-baseline mb-2">
                    <label className="label mb-0" htmlFor="login-senha">Senha</label>
                    <Link to="#" className="tp-mono is-size-7 tp-muted">Esqueceu?</Link>
                  </div>
                  <div className="control">
                    <input
                      id="login-senha"
                      className="input"
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`button tp-btn-primary tp-btn-label is-fullwidth mt-5 ${loading ? 'is-loading' : ''}`}
                  style={{ height: '46px' }}
                  disabled={loading}
                >
                  Entrar
                </button>
              </form>

              <hr className="tp-divider" />

              <p className="is-size-7 tp-muted">
                Ainda não tem uma conta?{' '}
                <Link to="/register" className="has-text-weight-semibold" style={{ color: 'var(--accent-soft)' }}>
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
