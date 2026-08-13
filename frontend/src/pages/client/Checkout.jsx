import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { evento, assentos, total } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [mensagemErro, setMensagemErro] = useState('');
  const [cvv, setCvv] = useState('');

  if (!evento) {
    navigate('/');
    return null;
  }

  const handlePagamento = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMensagemErro('');

    try {
      
      const response = await fetch('/api/ingressos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evento_id: evento.id,
          assentos: assentos,
          total_pago: total,
          cvv: cvv 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao processar o pagamento.');
      }

      setStatus('success');
    } catch (err) {
      setMensagemErro(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white'
  };

  
  if (status === 'success') {
    return (
      <div className="section has-text-centered pt-6">
        <div className="container" style={{ maxWidth: '500px' }}>
          <div className="box p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <span className="icon is-large has-text-success mb-4" style={{ transform: 'scale(3)' }}>✓</span>
            <h1 className="title is-3 mb-2 mt-4">Pagamento Aprovado!</h1>
            <p className="subtitle is-6 has-text-grey mb-5">
              Seus ingressos para <strong>{evento.titulo}</strong> foram reservados com sucesso.
            </p>
            <Link to="/ingressos" className="button is-link is-fullwidth">
              Ver Meus Ingressos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section pt-5">
      <div className="container px-4">
        <h1 className="title is-3 mb-5">Finalizar Compra</h1>
        
        <div className="columns is-variable is-6">
          <div className="column is-7">
            <div className="card p-5">
              <h2 className="title is-5 mb-4">Dados do Cartão</h2>
              
              {status === 'error' && (
                <div className="notification is-danger is-light mb-4">
                  {mensagemErro || "Pagamento recusado. Verifique os dados ou tente outro método."}
                </div>
              )}

              <form onSubmit={handlePagamento}>
                <div className="field mb-4">
                  <label className="label is-size-7" style={{ color: 'var(--text-secondary)' }}>Nome no Cartão</label>
                  <div className="control">
                    <input className="input" type="text" placeholder="JOÃO DA SILVA" style={inputStyle} required />
                  </div>
                </div>

                <div className="field mb-4">
                  <label className="label is-size-7" style={{ color: 'var(--text-secondary)' }}>Número do Cartão</label>
                  <div className="control">
                    <input className="input" type="text" placeholder="0000 0000 0000 0000" maxLength="16" style={inputStyle} required />
                  </div>
                </div>

                <div className="columns is-mobile">
                  <div className="column is-6 field">
                    <label className="label is-size-7" style={{ color: 'var(--text-secondary)' }}>Validade</label>
                    <div className="control">
                      <input className="input" type="text" placeholder="MM/AA" maxLength="5" style={inputStyle} required />
                    </div>
                  </div>
                  <div className="column is-6 field">
                    <label className="label is-size-7" style={{ color: 'var(--text-secondary)' }}>CVV</label>
                    <div className="control">
                      <input 
                        className="input" 
                        type="text" 
                        placeholder="123" 
                        maxLength="4" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        style={inputStyle} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`button is-warning is-fullwidth mt-4 has-text-weight-bold ${loading ? 'is-loading' : ''}`}
                  style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                  disabled={loading}
                >
                  Pagar {formatadorMoeda.format(total)}
                </button>
              </form>
            </div>
          </div>

          <div className="column is-5">
            <div className="box" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <h2 className="title is-5 mb-4">Resumo do Pedido</h2>
              
              <div className="is-flex mb-4" style={{ gap: '15px' }}>
                <figure className="image" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={evento.imagem_url || "https://via.placeholder.com/80"} alt={evento.titulo} style={{ objectFit: 'cover', height: '100%' }} />
                </figure>
                <div>
                  <p className="has-text-weight-bold">{evento.titulo}</p>
                  <p className="is-size-7 has-text-grey">{evento.local}</p>
                  <p className="is-size-7 has-text-grey mt-1">Assentos: {assentos.join(', ')}</p>
                </div>
              </div>

              <hr style={{ backgroundColor: 'var(--border-color)' }} />

              <div className="is-flex is-justify-content-space-between mb-2">
                <span className="has-text-grey">Ingressos ({assentos.length}x)</span>
                <span>{formatadorMoeda.format(total)}</span>
              </div>
              <div className="is-flex is-justify-content-space-between mb-4">
                <span className="has-text-grey">Taxa de serviço</span>
                <span className="has-text-success">Isento</span>
              </div>

              <hr style={{ backgroundColor: 'var(--border-color)' }} />

              <div className="is-flex is-justify-content-space-between is-align-items-center">
                <span className="has-text-weight-bold">Total</span>
                <span className="title is-4 mb-0 has-text-link">{formatadorMoeda.format(total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}