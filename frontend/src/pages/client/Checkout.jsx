import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../config';
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { evento, assentos, total } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [mensagemErro, setMensagemErro] = useState('');

  if (!evento) {
    navigate('/');
    return null;
  }

  const handlePagamento = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMensagemErro('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      setMensagemErro("Você precisa estar logado para comprar ingressos.");
      setStatus('error');
      setLoading(false);
      return;
    }

    try {
      const ingressosComprados = [];

      for (let assento of assentos) {
  
        const resReserva = await fetch(`${API_URL}/eventos/${evento.id}/reservar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resReserva.ok) {
          const errData = await resReserva.json();
          throw new Error(errData.detail || "Erro ao reservar ingresso.");
        }

        const ticketReservado = await resReserva.json();

        const resCheckout = await fetch(`${API_URL}/eventos/ingressos/${ticketReservado.id}/checkout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resCheckout.ok) {
          const errData = await resCheckout.json();
          throw new Error(errData.detail || "Erro no checkout.");
        }

        const ticketComprado = await resCheckout.json();
        
        if (ticketComprado.status === "recusado") {
          throw new Error(`O pagamento do assento ${assento} foi recusado pela operadora.`);
        }

        ingressosComprados.push(ticketComprado);
      }

      setStatus('success');
    } catch (err) {
      setMensagemErro(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white' };

  if (status === 'success') {
    return (
      <div className="section has-text-centered pt-6">
        <div className="container" style={{ maxWidth: '500px' }}>
          <div className="box p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <span className="icon is-large has-text-success mb-4" style={{ transform: 'scale(3)' }}>✓</span>
            <h1 className="title is-3 mb-2 mt-4">Pagamento Aprovado!</h1>
            <p className="subtitle is-6 has-text-grey mb-5">
              Seus ingressos para <strong>{evento.titulo}</strong> foram confirmados.
            </p>
            <Link to="/meus-ingressos" className="button is-link is-fullwidth">
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
                  {mensagemErro}
                </div>
              )}

              <form onSubmit={handlePagamento}>
                <div className="field mb-4">
                  <label className="label is-size-7" style={{ color: 'var(--text-secondary)' }}>Nome no Cartão</label>
                  <div className="control">
                    <input className="input" type="text" placeholder="JOÃO DA SILVA" style={inputStyle} required />
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
              <p className="has-text-weight-bold">{evento.titulo}</p>
              <p className="is-size-7 has-text-grey mt-1">Assentos simulados: {assentos.join(', ')}</p>
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