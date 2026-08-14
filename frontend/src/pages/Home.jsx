import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    console.log("URL da API:", API_URL);
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
  const destaques = eventos.slice(0, 3);
  const emAlta = eventos.filter(ev => ev.ingressos_disponiveis > 0);

  if (loading) {
    return <div className="section has-text-centered has-text-white">Carregando eventos...</div>;
  }

  return (
    <div className="home-container pb-6">
      {destaques.length > 0 && (
        <section className="section pt-5">
          <div className="container">
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
      )}
      <section className="section pt-0">
        <div className="container">
          <h2 className="title is-4 mb-4 has-text-white">Eventos em Destaque</h2>
          <div className="slider-container" style={{ display: 'flex', overflowX: 'auto', gap: '1rem' }}>
            {emAlta.map((ev) => (
              <div key={ev.id} className="card" style={{ width: '260px', flexShrink: 0, backgroundColor: '#151B2B' }}>
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}