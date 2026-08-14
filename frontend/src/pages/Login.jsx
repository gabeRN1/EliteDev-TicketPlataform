import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

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

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
  };

  return (
    <div className="section is-flex is-align-items-center is-justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="card p-5">
          <div className="card-content">
            <h1 className="title is-4 has-text-centered mb-5">Bem-vindo de volta</h1>

            {erro && <div className="notification is-danger is-light mb-4 py-2 px-3 is-size-7">{erro}</div>}

            <form onSubmit={handleLogin}>
              <div className="field mb-4">
                <label className="label has-text-weight-normal is-size-7" style={{ color: 'var(--text-secondary)' }}>
                  E-mail
                </label>
                <div className="control">
                  <input
                    className="input is-rounded"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="field mb-5">
                <div className="is-flex is-justify-content-space-between is-align-items-center mb-1">
                  <label className="label has-text-weight-normal is-size-7 mb-0" style={{ color: 'var(--text-secondary)' }}>
                    Senha
                  </label>
                  <Link to="#" className="is-size-7 has-text-link">Esqueceu a senha?</Link>
                </div>
                <div className="control">
                  <input
                    className="input is-rounded"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={inputStyle}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="control mt-5">
                <button
                  type="submit"
                  className={`button is-warning is-rounded is-fullwidth has-text-weight-bold ${loading ? 'is-loading' : ''}`}
                  style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                  disabled={loading}
                >
                  Entrar
                </button>
              </div>
            </form>

            <div className="has-text-centered mt-5">
              <p className="is-size-7" style={{ color: 'var(--text-secondary)' }}>
                Ainda não tem uma conta? <Link to="/register" className="has-text-link has-text-weight-bold">Cadastre-se</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}