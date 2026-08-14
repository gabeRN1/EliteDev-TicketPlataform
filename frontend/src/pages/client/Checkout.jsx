import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../config';
import Icon from '../../components/Icon';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { evento, assentos, total } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [mensagemErro, setMensagemErro] = useState('');

  const [dadosCartao, setDadosCartao] = useState({
    nome: '',
    numero: '',
    validade: '',
    cvv: ''
  });

  if (!evento) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosCartao(prev => ({ ...prev, [name]: value }));
  };

  const handlePagamento = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMensagemErro('');

    if (dadosCartao.cvv === '000') {
      setMensagemErro("Pagamento recusado pela operadora do cartão (CVV inválido).");
      setStatus('error');
      setLoading(false);
      return;
    }

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
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(dadosCartao)
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

  if (status === 'success') {
    return (
      <div className="section pt-6">
        <div className="container px-4" style={{ maxWidth: '520px' }}>
          <div className="tp-panel p-6 tp-hard">
            <span
              className="is-flex is-align-items-center is-justify-content-center mb-5"
              style={{
                width: '44px',
                height: '44px',
                border: '1px solid var(--green)',
                color: 'var(--green)'
              }}
            >
              <Icon name="check" size={22} />
            </span>

            <p className="tp-eyebrow mb-2" style={{ color: 'var(--green)' }}>Pagamento aprovado</p>
            <h1 className="title is-3 tp-display mb-3">Tudo certo.</h1>
            <p className="tp-muted mb-5">
              Seus ingressos para <strong style={{ color: 'var(--text-primary)' }}>{evento.titulo}</strong> foram confirmados
              e já estão disponíveis com QR Code.
            </p>

            <Link
              to="/meus-ingressos"
              className="button tp-btn-primary tp-btn-label is-fullwidth is-flex is-align-items-center is-justify-content-center"
              style={{ gap: '10px', height: '46px' }}
            >
              Ver meus ingressos
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section pt-5">
      <div className="container px-4">

        <p className="tp-eyebrow mb-2">Checkout · Pagamento</p>
        <h1 className="title is-2 tp-display mb-5">Finalizar compra</h1>

        <div className="columns is-variable is-6">

          <div className="column is-7">
            <div className="tp-panel p-5">
              <div className="tp-rule">
                <span className="tp-eyebrow">Dados do cartão</span>
              </div>

              {status === 'error' && (
                <div className="notification is-danger is-light mb-4 is-flex is-align-items-center" style={{ gap: '10px' }}>
                  <Icon name="alert" size={16} />
                  <span className="is-size-7">{mensagemErro}</span>
                </div>
              )}

              <form onSubmit={handlePagamento}>
                <div className="field tp-field">
                  <label className="label" htmlFor="ck-nome">Nome impresso no cartão</label>
                  <div className="control">
                    <input
                      id="ck-nome"
                      className="input tp-mono"
                      type="text"
                      name="nome"
                      placeholder="JOÃO DA SILVA"
                      required
                      value={dadosCartao.nome}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="field tp-field">
                  <label className="label" htmlFor="ck-numero">Número do cartão</label>
                  <div className="control">
                    <input
                      id="ck-numero"
                      className="input tp-mono"
                      type="text"
                      name="numero"
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      required
                      value={dadosCartao.numero}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="tp-grid tp-grid-2">
                  <div className="field mb-0">
                    <label className="label" htmlFor="ck-validade">Validade</label>
                    <div className="control">
                      <input
                        id="ck-validade"
                        className="input tp-mono"
                        type="text"
                        name="validade"
                        placeholder="MM/AA"
                        maxLength="5"
                        required
                        value={dadosCartao.validade}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="field mb-0">
                    <label className="label" htmlFor="ck-cvv">CVV</label>
                    <div className="control">
                      <input
                        id="ck-cvv"
                        className="input tp-mono"
                        type="text"
                        name="cvv"
                        placeholder="123"
                        maxLength="4"
                        required
                        value={dadosCartao.cvv}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`button tp-btn-primary tp-btn-label is-fullwidth mt-5 ${loading ? 'is-loading' : ''}`}
                  style={{ height: '48px' }}
                  disabled={loading}
                >
                  Pagar {formatadorMoeda.format(total)}
                </button>

                <p className="tp-mono is-size-7 tp-dim mt-3 is-flex is-align-items-center" style={{ gap: '8px' }}>
                  <Icon name="shield" size={14} />
                  Transação processada em ambiente seguro
                </p>
              </form>
            </div>
          </div>

          <div className="column is-5">
            <div className="tp-panel">
              <div className="p-4" style={{ borderBottom: '1px dashed var(--line-strong)' }}>
                <p className="tp-eyebrow mb-3">Resumo do pedido</p>
                <p className="title is-5 mb-2">{evento.titulo}</p>
                <p className="tp-mono is-size-7 tp-muted">{evento.local}</p>
              </div>

              <div className="p-4" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="is-flex is-justify-content-space-between mb-2">
                  <span className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>Assentos</span>
                  <span className="tp-mono is-size-7">{assentos.join(' · ')}</span>
                </div>
                <div className="is-flex is-justify-content-space-between">
                  <span className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>Quantidade</span>
                  <span className="tp-mono is-size-7">{String(assentos.length).padStart(2, '0')}</span>
                </div>
              </div>

              <div className="p-4 is-flex is-justify-content-space-between is-align-items-flex-end">
                <span className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>Total</span>
                <span className="tp-metric-value">{formatadorMoeda.format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
