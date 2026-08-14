import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import Icon from '../../components/Icon';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [assentosSelecionados, setAssentosSelecionados] = useState([]);

  const fileiras = ['A', 'B', 'C', 'D', 'E'];
  const colunas = [1, 2, 3, 4, 5, 6, 7, 8];
  const assentosOcupados = ['A2', 'A3', 'C5', 'D8', 'E1'];

  useEffect(() => {
    const buscarEvento = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/eventos/${id}`);

        if (!response.ok) throw new Error('Evento não encontrado.');

        const data = await response.json();
        setEvento(data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    buscarEvento();
  }, [id]);

  const toggleAssento = (assentoId) => {
    if (assentosOcupados.includes(assentoId)) return;
    setAssentosSelecionados(prev =>
      prev.includes(assentoId) ? prev.filter(a => a !== assentoId) : [...prev, assentoId]
    );
  };

  const irParaCheckout = () => {
    if (assentosSelecionados.length > 0 && evento) {
      navigate('/checkout', { 
        state: { evento, assentos: assentosSelecionados, total: assentosSelecionados.length * evento.preco } 
      });
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container px-4">
          <p className="tp-eyebrow mb-4">Carregando evento</p>
          <div className="tp-skeleton" style={{ height: '320px' }} />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="section">
        <div className="container px-4">
          <div className="tp-panel p-6 has-text-centered">
            <p className="tp-eyebrow mb-3" style={{ color: 'var(--red)' }}>Erro</p>
            <p className="title is-5 mb-0">{erro}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!evento) return null;

  const total = assentosSelecionados.length * evento.preco;

  return (
    <div className="section pt-5">
      <div className="container px-4">

        <div className="columns is-variable is-6">

          <div className="column is-5">
            <figure
              className="image is-4by3 mb-5"
              style={{ border: '1px solid var(--line)', overflow: 'hidden' }}
            >
              <img
                src={evento.imagem_url || ''}
                alt={evento.titulo}
                style={{ objectFit: 'cover', filter: 'saturate(0.9) contrast(1.05)' }}
              />
            </figure>

            <p className="tp-eyebrow mb-2">{evento.categoria || 'Evento'}</p>
            <h1 className="title is-2 tp-display mb-3">{evento.titulo}</h1>
            <p className="tp-mono is-size-7 tp-muted is-flex is-align-items-center mb-5" style={{ gap: '7px' }}>
              <Icon name="pin" size={14} /> {evento.local}
            </p>

            <dl className="tp-panel">
              {[
                ['Data', new Date(evento.data_evento).toLocaleString('pt-BR')],
                ['Valor unitário', formatadorMoeda.format(evento.preco)],
                ['Disponíveis', `${evento.ingressos_disponiveis} ingressos`],
              ].map(([rotulo, valor], i, arr) => (
                <div
                  key={rotulo}
                  className="is-flex is-justify-content-space-between is-align-items-center px-4 py-3"
                  style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--line)' }}
                >
                  <dt className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>{rotulo}</dt>
                  <dd className="tp-mono is-size-7">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="column is-7">
            <div className="tp-rule">
              <span className="tp-eyebrow">Selecione seus lugares</span>
            </div>

            <div className="tp-panel p-5">
              <div className="tp-stage mb-5" style={{ margin: '0 auto', width: '70%' }}>
                <span className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>Palco / Tela</span>
              </div>

              <div className="is-flex is-flex-direction-column is-align-items-center" style={{ gap: '8px' }}>
                {fileiras.map(fileira => (
                  <div key={fileira} className="is-flex is-align-items-center" style={{ gap: '8px' }}>
                    <span className="tp-index" style={{ width: '14px' }}>{fileira}</span>
                    {colunas.map(col => {
                      const assentoId = `${fileira}${col}`;
                      const isOcupado = assentosOcupados.includes(assentoId);
                      const isSelecionado = assentosSelecionados.includes(assentoId);

                      return (
                        <button
                          key={assentoId}
                          type="button"
                          className={`tp-seat ${isOcupado ? 'is-taken' : ''} ${isSelecionado ? 'is-picked' : ''}`}
                          onClick={() => toggleAssento(assentoId)}
                          disabled={isOcupado}
                          aria-pressed={isSelecionado}
                          title={isOcupado ? `Ocupado — ${assentoId}` : `Livre — ${assentoId}`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div
                className="is-flex is-justify-content-center mt-5 pt-4"
                style={{ gap: '20px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}
              >
                <span className="tp-tag">Livre</span>
                <span className="tp-tag tp-tag-accent">Selecionado</span>
                <span className="tp-tag" style={{ opacity: 0.55, textDecoration: 'line-through' }}>Ocupado</span>
              </div>
            </div>

            <div
              className="tp-panel p-4 mt-4 is-flex is-justify-content-space-between is-align-items-center"
              style={{ gap: '16px', flexWrap: 'wrap' }}
            >
              <div>
                <p className="tp-eyebrow mb-1" style={{ fontSize: '0.625rem' }}>
                  {assentosSelecionados.length > 0
                    ? `Assentos ${assentosSelecionados.join(' · ')}`
                    : 'Nenhum assento selecionado'}
                </p>
                <p className="tp-metric-value">{formatadorMoeda.format(total)}</p>
              </div>

              <button
                className="button tp-btn-primary tp-btn-label is-flex is-align-items-center px-5"
                style={{ gap: '10px', height: '46px' }}
                disabled={assentosSelecionados.length === 0 || evento.ingressos_disponiveis < assentosSelecionados.length}
                onClick={irParaCheckout}
              >
                Ir para o pagamento
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
