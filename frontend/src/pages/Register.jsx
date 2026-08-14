import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import Icon from '../components/Icon';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nome, 
          email, 
          senha,
          role: 'cliente' 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Erro ao criar a conta. Tente novamente.');
      }
      navigate('/login');
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="container px-4">
        <div className="tp-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 0 }}>

          <aside
            className="is-hidden-mobile is-flex is-flex-direction-column is-justify-content-space-between p-6"
            style={{ border: '1px solid var(--line)', borderRight: 0, background: 'var(--bg-inset)' }}
          >
            <p className="tp-eyebrow">Cadastro · 02</p>
            <div>
              <h2 className="title is-2 tp-display mb-4" style={{ maxWidth: '14ch' }}>
                Uma conta, todos os eventos.
              </h2>
              <ul className="tp-mono is-size-7 tp-muted" style={{ lineHeight: 2 }}>
                <li>— Compra em poucos passos</li>
                <li>— QR Code válido na portaria</li>
                <li>— Histórico completo de ingressos</li>
              </ul>
            </div>
            <div className="tp-mono is-size-7 tp-dim">TicketPlatform</div>
          </aside>

          <div
            className="p-6 is-flex is-flex-direction-column is-justify-content-center"
            style={{ border: '1px solid var(--line)', background: 'var(--bg-surface)' }}
          >
            <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
              <p className="tp-eyebrow mb-2">Criar conta</p>
              <h1 className="title is-3 tp-display mb-5">Comece agora</h1>

              {erro && (
                <div className="notification is-danger is-light mb-4 py-2 px-3 is-size-7 is-flex is-align-items-center" style={{ gap: '8px' }}>
                  <Icon name="alert" size={15} />
                  <span>{erro}</span>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="field tp-field">
                  <label className="label" htmlFor="reg-nome">Nome completo</label>
                  <div className="control">
                    <input
                      id="reg-nome"
                      className="input"
                      type="text"
                      placeholder="João da Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field tp-field">
                  <label className="label" htmlFor="reg-email">E-mail</label>
                  <div className="control">
                    <input
                      id="reg-email"
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
                  <label className="label" htmlFor="reg-senha">Senha</label>
                  <div className="control">
                    <input
                      id="reg-senha"
                      className="input"
                      type="password"
                      placeholder="Crie uma senha forte"
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
                  Cadastrar
                </button>
              </form>

              <hr className="tp-divider" />

              <p className="is-size-7 tp-muted">
                Já tem uma conta?{' '}
                <Link to="/login" className="has-text-weight-semibold" style={{ color: 'var(--accent-soft)' }}>
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
