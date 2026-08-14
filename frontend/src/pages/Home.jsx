import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

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
    return <div className="section has-text-centered has-text-white">Carregando eventos...</div>;
  }

  return (
    <div className="home-container pb-6">
      <style>
        {`
          .marquee-container {
            overflow: hidden;
            width: 100%;
          }
          .marquee-track {
            display: flex;
            gap: 1rem;
            width: max-content;
            /* A animação dura 30s. Quanto menor, mais rápido */
            animation: scroll 30s linear infinite; 
          }
          .marquee-track:hover {
            animation-play-state: paused; /* Pausa ao passar o mouse por cima */
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 0.5rem)); }
          }
        `}
      </style>

      {/* Banner Principal */}
      {destaques.length > 0 ? (
        <section className="section pt-5">
          <div className="container">
            {termoBusca && (
              <h2 className="title is-4 has-text-white mb-4">
                Resultados para: "{termoBusca}"
              </h2>
            )}
            <div className="slider-container" style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem' }}>
              {destaques.map((ev) => (
                <div key={ev.id} className="slider-item" style={{ minWidth: '100%' }}>
                  <div 
                    className="hero-banner"
                    style={{ 
                      backgroundImage: `url(${ev.imagem_url || 'https://via.placeholder.com/1200x400'})`,
                      height: '350px', backgroundSize: 'cover', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', padding: '2rem'
                    }}
                  >
                    <div>
                      {ev.categoria && <span className="tag is-primary mb-2">{ev.categoria}</span>}
                      <h1 className="title is-2 has-text-white mb-2">{ev.titulo}</h1>
                      <p className="subtitle is-6 has-text-light mb-4">
                        {ev.local} • {new Date(ev.data_evento).toLocaleDateString('pt-BR')}
                      </p>
                      <Link to={`/evento/${ev.id}`} className="button is-link">Garantir Ingresso (R$ {ev.preco.toFixed(2)})</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section pt-5 has-text-centered">
          <div className="container">
            <h2 className="title is-4 has-text-white">Nenhum evento encontrado para "{termoBusca}"</h2>
            <Link to="/" className="button is-link mt-3">Limpar Busca</Link>
          </div>
        </section>
      )}

      {/* Slider Infinito de Eventos em Destaque */}
      {emAlta.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <h2 className="title is-4 mb-4 has-text-white">Eventos em Destaque</h2>
            
            <div className="marquee-container">
              <div className="marquee-track">
                {sliderInfinito.map((ev, index) => (
                  <Link 
                    to={`/evento/${ev.id}`} 
                    key={`${ev.id}-${index}`} 
                    className="card" 
                    style={{ width: '260px', flexShrink: 0, backgroundColor: '#151B2B', textDecoration: 'none', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={ev.imagem_url || 'https://via.placeholder.com/400x300'} alt={ev.titulo} style={{ objectFit: 'cover' }} />
                      </figure>
                    </div>
                    <div className="card-content p-3">
                      <span className="is-size-7 has-text-primary has-text-weight-bold">{ev.categoria || 'EVENTO'}</span>
                      <p className="title is-6 mt-1 mb-1 has-text-white">{ev.titulo}</p>
                      <p className="is-size-7 has-text-grey">{ev.local}</p>
                      <p className="has-text-success has-text-weight-bold mt-2">R$ {ev.preco.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
          </div>
        </section>
      )}
    </div>
  );
}