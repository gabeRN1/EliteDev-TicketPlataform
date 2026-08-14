import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
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

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white'
  };

  return (
    <div className="section is-flex is-align-items-center is-justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '400px' }}>
        
        <div className="card p-5">
          <div className="card-content">
            <h1 className="title is-4 has-text-centered mb-5">Criar Conta</h1>
            
            {erro && <div className="notification is-danger is-light mb-4 py-2 px-3 is-size-7">{erro}</div>}

            <form onSubmit={handleRegister}>
              
              <div className="field mb-4">
                <label className="label has-text-weight-normal is-size-7" style={{ color: 'var(--text-secondary)' }}>
                  Nome completo
                </label>
                <div className="control">
                  <input
                    className="input is-rounded"
                    type="text"
                    placeholder="João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={inputStyle}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
                <label className="label has-text-weight-normal is-size-7" style={{ color: 'var(--text-secondary)' }}>
                  Senha
                </label>
                <div className="control">
                  <input
                    className="input is-rounded"
                    type="password"
                    placeholder="Crie uma senha forte"
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
                  Cadastrar
                </button>
              </div>
            </form>

            <div className="has-text-centered mt-5">
              <p className="is-size-7" style={{ color: 'var(--text-secondary)' }}>
                Já tem uma conta? <Link to="/login" className="has-text-link has-text-weight-bold">Faça login</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}