import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import Icon from '../components/Icon';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (valor) => {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch(`${API_URL}/eventos/`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => response.text());
          console.error(`Erro ${response.status} retornado pelo servidor:`, errorData);
          return;
        }

        const data = await response.json();
        setEventos(data);

      } catch (error) {
        console.error("Erro de rede/conexão ao buscar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const termoBusca = queryParams.get('q')?.toLowerCase() || '';

  const eventosFiltrados = eventos.filter(ev => {
    if (!termoBusca) return true;
    return ev.titulo.toLowerCase().includes(termoBusca) ||
           (ev.categoria && ev.categoria.toLowerCase().includes(termoBusca));
  });

  const destaques = eventosFiltrados.slice(0, 3);
  const emAlta = eventosFiltrados.filter(ev => ev.ingressos_disponiveis > 0);

  const sliderInfinito = [...emAlta, ...emAlta];

  if (loading) {
    return (
      <div className="section">
        <div className="container px-4">
          <p className="tp-eyebrow mb-4">Carregando programação</p>
          <div className="tp-grid tp-grid-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="tp-skeleton" style={{ height: '220px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const principal = destaques[0];
  const secundarios = destaques.slice(1);

  return (
    <div className="pb-6">

      <section className="section pt-5 pb-4">
        <div className="container px-4">

          <div className="is-flex is-align-items-flex-end is-justify-content-space-between mb-5">
            <div>
              <p className="tp-eyebrow mb-2">
                {termoBusca ? `Busca — ${termoBusca}` : 'Programação · São Paulo'}
              </p>
              <h1 className="title is-1 tp-display mb-0">
                {termoBusca ? 'Resultados' : 'O que está acontecendo'}
              </h1>
            </div>
            <p className="tp-mono is-size-7 tp-dim is-hidden-mobile">
              {String(eventosFiltrados.length).padStart(2, '0')} eventos
            </p>
          </div>

          {principal ? (
            <div className="tp-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>

              <article className="tp-hero" style={{ minHeight: '400px', display: 'flex' }}>
                <div
                  className="tp-hero-media"
                  style={{ backgroundImage: `url(${principal.imagem_url || ''})` }}
                />
                <div className="tp-hero-scrim" />
                <div className="tp-hero-body is-flex is-flex-direction-column is-justify-content-flex-end" style={{ width: '100%' }}>
                  {principal.categoria && (
                    <span className="tp-tag tp-tag-accent mb-4" style={{ alignSelf: 'flex-start' }}>
                      {principal.categoria}
                    </span>
                  )}
                  <h2 className="title is-2 tp-display mb-3" style={{ maxWidth: '18ch' }}>
                    {principal.titulo}
                  </h2>

                  <div className="is-flex is-align-items-center tp-mono is-size-7 tp-muted mb-5" style={{ gap: '18px', flexWrap: 'wrap' }}>
                    <span className="is-flex is-align-items-center" style={{ gap: '7px' }}>
                      <Icon name="pin" size={14} /> {principal.local}
                    </span>
                    <span className="is-flex is-align-items-center" style={{ gap: '7px' }}>
                      <Icon name="calendar" size={14} /> {formatarData(principal.data_evento)}
                    </span>
                  </div>

                  <div className="is-flex is-align-items-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/evento/${principal.id}`}
                      className="button tp-btn-primary tp-btn-label is-flex is-align-items-center px-5"
                      style={{ gap: '10px', height: '46px' }}
                    >
                      Garantir ingresso
                      <Icon name="arrowRight" size={15} />
                    </Link>
                    <span className="tp-mono is-size-6">
                      {formatadorMoeda.format(principal.preco)}
                    </span>
                  </div>
                </div>
              </article>

              <div className="tp-grid" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
                {secundarios.map((ev, i) => (
                  <Link
                    key={ev.id}
                    to={`/evento/${ev.id}`}
                    className="tp-panel is-flex is-flex-direction-column is-justify-content-space-between p-4"
                    style={{ textDecoration: 'none', color: 'inherit', minHeight: '190px' }}
                  >
                    <div className="is-flex is-justify-content-space-between">
                      <span className="tp-eyebrow">{ev.categoria || 'Evento'}</span>
                      <span className="tp-index">{String(i + 2).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <h3 className="title is-5 mb-2" style={{ letterSpacing: '-0.02em' }}>{ev.titulo}</h3>
                      <p className="tp-mono is-size-7 tp-muted">
                        {ev.local} — {formatarData(ev.data_evento)}
                      </p>
                    </div>
                    <div className="is-flex is-align-items-center is-justify-content-space-between">
                      <span className="tp-mono is-size-7">{formatadorMoeda.format(ev.preco)}</span>
                      <Icon name="arrowRight" size={16} />
                    </div>
                  </Link>
                ))}

                {secundarios.length === 0 && (
                  <div className="tp-panel-inset p-4 is-flex is-align-items-center">
                    <p className="tp-mono is-size-7 tp-dim">Sem eventos secundários no momento.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="tp-panel p-6 has-text-centered">
              <p className="tp-eyebrow mb-3">Nenhum resultado</p>
              <h2 className="title is-4 mb-4">
                {termoBusca
                  ? `Nada encontrado para “${termoBusca}”`
                  : 'Nenhum evento disponível no momento.'}
              </h2>
              {termoBusca && (
                <Link to="/" className="button tp-btn-ghost tp-btn-label">Limpar busca</Link>
              )}
            </div>
          )}
        </div>
      </section>

      {emAlta.length > 0 && (
        <section className="section pt-4">
          <div className="container px-4">
            <div className="tp-rule">
              <span className="tp-eyebrow">Em alta agora</span>
            </div>
          </div>

          <div className="tp-marquee">
            <div className="tp-marquee-track">
              {sliderInfinito.map((ev, index) => (
                <Link
                  to={`/evento/${ev.id}`}
                  key={`${ev.id}-${index}`}
                  className="tp-event-card"
                  style={{ width: '250px', flexShrink: 0 }}
                >
                  <div className="tp-event-media" style={{ height: '150px' }}>
                    <img src={ev.imagem_url || ''} alt={ev.titulo} loading="lazy" />
                  </div>
                  <div className="p-3">
                    <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
                      <span className="tp-eyebrow" style={{ fontSize: '0.625rem' }}>
                        {ev.categoria || 'Evento'}
                      </span>
                      <span className="tp-index">
                        {String((index % emAlta.length) + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="has-text-weight-semibold mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {ev.titulo}
                    </p>
                    <p className="tp-mono is-size-7 tp-muted mb-3">{ev.local}</p>
                    <p className="tp-mono is-size-7">{formatadorMoeda.format(ev.preco)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="tp-footer mt-6">
        <div className="container px-4 is-flex is-justify-content-space-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <span className="tp-mono is-size-7">TicketPlatform</span>
          <span className="tp-mono is-size-7">Ingressos · Cinema · Teatro · Shows</span>
        </div>
      </footer>
    </div>
  );
}
