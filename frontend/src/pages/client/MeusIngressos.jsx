import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MeusIngressos() {
  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ingressoSelecionado, setIngressoSelecionado] = useState(null);

  useEffect(() => {
    const buscarMeusIngressos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/meus-ingressos');
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar seus ingressos.');
        }

        const data = await response.json();

        setIngressos(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarMeusIngressos();
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
          <Link to="/" className="button is-light is-small is-rounded">Comprar mais ingressos</Link>
        </div>

        <div className="columns is-multiline">
          {ingressos.map((ingresso) => {
            const isUtilizado = ingresso.status?.toLowerCase() === 'utilizado';

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
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--link)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none' }}
                >
                  
                  <div 
                    className="is-hidden-mobile"
                    style={{ 
                      width: '120px', 
                      backgroundImage: `url(${ingresso.evento?.imagem_url || 'https://via.placeholder.com/120'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>

                  <div className="p-4 is-flex-grow-1">
                    <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
                      <span className={`tag is-small ${isUtilizado ? 'is-dark' : 'is-success is-light'}`}>
                        {ingresso.status || 'Válido'}
                      </span>
                    </div>
                    
                    <h2 className="title is-5 mb-1 has-text-white">{ingresso.evento?.titulo}</h2>
                    <p className="is-size-7 has-text-grey-light mb-1">📅 {ingresso.evento?.data_evento ? new Date(ingresso.evento.data_evento).toLocaleString('pt-BR') : 'Data não informada'}</p>
                    <p className="is-size-7 has-text-grey-light mb-3">📍 {ingresso.evento?.local}</p>
                    
                    <div className="box p-2 mb-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: 'none' }}>
                      <p className="is-size-7 has-text-white"><strong>Assento(s):</strong> {ingresso.assentos}</p>
                    </div>
                  </div>

                  <div 
                    className="p-4 is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
                    style={{ borderLeft: '2px dashed rgba(255,255,255,0.1)' }}
                  >
                    <figure className="image is-64x64 mb-2" style={{ backgroundColor: '#FFF', padding: '4px', borderRadius: '4px' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ingresso.id}`} 
                        alt="Mini QR Code" 
                        style={{ filter: isUtilizado ? 'grayscale(100%) blur(1px)' : 'none' }}
                      />
                    </figure>
                    <p className="is-size-7 has-text-centered has-text-link has-text-weight-bold">
                      Ampliar QR
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {ingressos.length === 0 && (
          <div className="has-text-centered py-6">
            <p className="has-text-grey mb-4">Você ainda não possui ingressos.</p>
            <Link to="/" className="button is-link">Explorar Eventos</Link>
          </div>
        )}

      </div>

      {ingressoSelecionado && (
        <div className="modal is-active">
          <div className="modal-background" onClick={fecharModal} style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}></div>
          
          <div className="modal-content px-4">
            <div className="box has-text-centered" style={{ backgroundColor: 'var(--bg-surface, #151B2B)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              
              <h2 className="title is-4 mb-2 has-text-white">{ingressoSelecionado.evento?.titulo}</h2>
              <p className="subtitle is-6 has-text-grey-light mb-5">
                {ingressoSelecionado.evento?.data_evento ? new Date(ingressoSelecionado.evento.data_evento).toLocaleString('pt-BR') : ''} 
                {ingressoSelecionado.evento?.local ? ` • ${ingressoSelecionado.evento.local}` : ''}
              </p>

              <figure className="image is-inline-block mb-5" style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '12px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ingressoSelecionado.id}`} 
                  alt="QR Code Ampliado" 
                  style={{ 
                    width: '250px', 
                    height: '250px',
                    filter: ingressoSelecionado.status?.toLowerCase() === 'utilizado' ? 'grayscale(100%) blur(1px)' : 'none' 
                  }}
                />
              </figure>

              <div>
                <p className="is-size-7 has-text-grey mb-2 is-uppercase">Ou digite o código abaixo na catraca:</p>
                <div 
                  className="is-inline-block p-3" 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    minWidth: '200px'
                  }}
                >
                  <span className="is-size-4 has-text-weight-bold has-text-white" style={{ letterSpacing: '2px' }}>
                    {ingressoSelecionado.id}
                  </span>
                </div>
              </div>
              
              {ingressoSelecionado.status?.toLowerCase() === 'utilizado' && (
                <div className="notification is-danger is-light mt-5 mb-0 py-2">
                  Este ingresso já foi utilizado.
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