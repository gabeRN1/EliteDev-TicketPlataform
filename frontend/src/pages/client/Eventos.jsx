import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
    // Busca do evento pelo ID na API em FastAPI
    const buscarEvento = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/eventos/${id}`);
        
        if (!response.ok) {
          throw new Error('Evento não encontrado ou erro no servidor.');
        }
        
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
      prev.includes(assentoId)
        ? prev.filter(a => a !== assentoId)
        : [...prev, assentoId]
    );
  };

  const irParaCheckout = () => {
    if (assentosSelecionados.length > 0 && evento) {
      navigate('/checkout', { 
        state: { evento, assentos: assentosSelecionados, total: assentosSelecionados.length * evento.preco } 
      });
    }
  };

  if (loading) return <div className="section has-text-centered"><p>Carregando evento...</p></div>;
  if (erro) return <div className="section has-text-centered has-text-danger"><p>{erro}</p></div>;
  if (!evento) return null;

  return (
    <div className="section pt-5">
      <div className="container px-4">
        <div className="columns is-variable is-6">
          
     
          <div className="column is-5">
            <figure className="image is-4by3 mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <img src={evento.imagem_url} alt={evento.titulo} style={{ objectFit: 'cover' }} />
            </figure>
            <h1 className="title is-3 mb-2">{evento.titulo}</h1>
            <p className="subtitle is-5 has-text-grey mb-4">{evento.local}</p>
            <div className="box" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <p><strong>Data:</strong> {new Date(evento.data_evento).toLocaleString('pt-BR')}</p>
              <p><strong>Valor por ingresso:</strong> {formatadorMoeda.format(evento.preco)}</p>
            </div>
          </div>

          <div className="column is-7">
            <h2 className="title is-4 mb-5">Selecione seus lugares</h2>
            
            <div className="box has-text-centered pb-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div className="mb-5 p-2 has-text-grey-light is-size-7" style={{ borderBottom: '2px solid var(--border-color)', margin: '0 auto', width: '80%' }}>
                PALCO / TELA
              </div>

              <div className="is-inline-block has-text-left">
                {fileiras.map(fileira => (
                  <div key={fileira} className="is-flex is-align-items-center is-justify-content-center mb-2">
                    <span className="has-text-grey-light mr-3 is-size-7" style={{ width: '20px' }}>{fileira}</span>
                    {colunas.map(col => {
                      const assentoId = `${fileira}${col}`;
                      const isOcupado = assentosOcupados.includes(assentoId);
                      const isSelecionado = assentosSelecionados.includes(assentoId);
                      
                   
                      let btnClass = "button is-small mx-1 p-0 ";
                      if (isOcupado) btnClass += "is-static has-background-danger-light has-text-danger";
                      else if (isSelecionado) btnClass += "is-link";
                      else btnClass += "is-light";

                      return (
                        <button
                          key={assentoId}
                          className={btnClass}
                          style={{ width: '36px', height: '36px', borderRadius: '8px' }}
                          onClick={() => toggleAssento(assentoId)}
                          disabled={isOcupado}
                          title={isOcupado ? 'Ocupado' : `Livre - ${assentoId}`}
                        >
                          <span className="is-size-7">{col}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              

              <div className="is-flex is-justify-content-center mt-5" style={{ gap: '15px' }}>
                <span className="is-size-7 is-flex is-align-items-center"><div className="has-background-light mr-2" style={{width:'12px', height:'12px', borderRadius:'2px'}}></div> Livre</span>
                <span className="is-size-7 is-flex is-align-items-center"><div className="has-background-link mr-2" style={{width:'12px', height:'12px', borderRadius:'2px'}}></div> Selecionado</span>
                <span className="is-size-7 is-flex is-align-items-center"><div className="has-background-danger mr-2" style={{width:'12px', height:'12px', borderRadius:'2px'}}></div> Ocupado</span>
              </div>
            </div>

            
            <div className="is-flex is-justify-content-space-between is-align-items-center">
              <div>
                <p className="is-size-7 has-text-grey">Total a pagar:</p>
                <p className="title is-4 mb-0 has-text-link">{formatadorMoeda.format(assentosSelecionados.length * evento.preco)}</p>
              </div>
              <button 
                className="button is-link is-medium" 
                disabled={assentosSelecionados.length === 0}
                onClick={irParaCheckout}
              >
                Ir para o Pagamento
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}