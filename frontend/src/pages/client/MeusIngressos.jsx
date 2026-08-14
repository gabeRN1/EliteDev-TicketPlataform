import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

export default function MeusIngressos() {
  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ingressoSelecionado, setIngressoSelecionado] = useState(null);

  useEffect(() => {
    const buscarDados = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErro("Você precisa fazer login para ver seus ingressos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        
        const [resIngressos, resEventos] = await Promise.all([
          fetch(`${API_URL}/eventos/ingressos/meus-ingressos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/eventos/`)
        ]);
        
        if (!resIngressos.ok) throw new Error('Não foi possível carregar seus ingressos.');
        if (!resEventos.ok) throw new Error('Não foi possível carregar os detalhes dos eventos.');

        const dataIngressos = await resIngressos.json();
        const dataEventos = await resEventos.json();

        const mapaEventos = {};
        dataEventos.forEach(evento => {
          mapaEventos[evento.id] = evento;
        });

     
        const ingressosCompletos = dataIngressos.map(ingresso => ({
          ...ingresso,
          evento_detalhe: mapaEventos[ingresso.evento_id] || { titulo: 'Evento Indisponível' }
        }));

        setIngressos(ingressosCompletos);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, []);

  const abrirModal = (ingresso) => setIngressoSelecionado(ingresso);
  const fecharModal = () => setIngressoSelecionado(null);

  if (loading) return <div className="section has-text-centered pt-6"><p>Carregando ingressos...</p></div>;
  if (erro) return <div className="section has-text-centered pt-6 has-text-danger"><p>{erro}</p></div>;

  return (
    <div className="section pt-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container px-4">
        
        <div className="is-flex is-justify-content-space-between is-align-items-flex-end mb-5">
          <h1 className="title is-3 mb-0">Meus Ingressos</h1>
          <Link to="/" className="button is-light is-small is-rounded">Explorar Eventos</Link>
        </div>

        <div className="columns is-multiline">
          {ingressos.length === 0 ? (
            <div className="column is-12 has-text-centered mt-5">
              <p className="has-text-grey">Você ainda não possui ingressos comprados.</p>
            </div>
          ) : (
            ingressos.map((ingresso) => {
              const isUtilizado = ingresso.status === 'utilizado';

              return (
                <div key={ingresso.id} className="column is-12-mobile is-6-tablet is-6-desktop mb-4">
                  <div 
                    className="card is-flex is-flex-direction-row is-clickable" 
                    onClick={() => abrirModal(ingresso)}
                    style={{ 
                      backgroundColor: 'var(--bg-surface, #151B2B)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      opacity: isUtilizado ? 0.6 : 1,
                      cursor: 'pointer'
                    }}
                  >
                    <div className="p-4 is-flex-grow-1">
                      <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
                        <span className={`tag is-small ${isUtilizado ? 'is-dark' : ingresso.status === 'pendente' ? 'is-warning' : 'is-success is-light'}`}>
                          {ingresso.status.toUpperCase()}
                        </span>
                      </div>
                    
                      <h2 className="title is-5 mb-1 has-text-white">
                        {ingresso.evento_detalhe.titulo}
                      </h2>
                      <p className="is-size-7 has-text-grey-light mb-3">Ingresso #{ingresso.id}</p>
                    </div>
                    
                    {ingresso.qr_code && (
                      <div className="p-4 is-flex is-flex-direction-column is-align-items-center is-justify-content-center" style={{ borderLeft: '2px dashed rgba(255,255,255,0.1)' }}>
                        <figure className="image is-64x64 mb-2" style={{ backgroundColor: '#FFF', padding: '4px', borderRadius: '4px' }}>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ingresso.qr_code}`} 
                            alt="Mini QR Code" 
                            style={{ filter: isUtilizado ? 'grayscale(100%) blur(1px)' : 'none' }}
                          />
                        </figure>
                        <p className="is-size-7 has-text-centered has-text-link has-text-weight-bold">Ampliar QR</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {ingressoSelecionado && (
        <div className="modal is-active">
          <div className="modal-background" onClick={fecharModal} style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}></div>
          <div className="modal-content px-4">
            <div className="box has-text-centered" style={{ backgroundColor: 'var(--bg-surface, #151B2B)', borderRadius: '16px' }}>
              <h2 className="title is-4 mb-2 has-text-white">{ingressoSelecionado.evento_detalhe.titulo}</h2>
              <p className="has-text-grey-light mb-4">Ingresso #{ingressoSelecionado.id}</p>
              
              {ingressoSelecionado.qr_code ? (
                <figure className="image is-inline-block mb-5" style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '12px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ingressoSelecionado.qr_code}`} 
                    alt="QR Code Ampliado" 
                    style={{ width: '250px', height: '250px', filter: ingressoSelecionado.status === 'utilizado' ? 'grayscale(100%) blur(1px)' : 'none' }}
                  />
                </figure>
              ) : (
                <p className="has-text-warning mb-5">QR Code indisponível para este status.</p>
              )}
              
              {ingressoSelecionado.status === 'utilizado' && (
                <div className="notification is-danger is-light mt-5 mb-0 py-2">
                  Este ingresso já foi utilizado na portaria.
                </div>
              )}
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={fecharModal}></button>
        </div>
      )}
    </div>
  );
}