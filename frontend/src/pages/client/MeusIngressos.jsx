import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import Icon from '../../components/Icon';

const classeDoStatus = (status) => {
  if (status === 'utilizado') return 'tp-tag';
  if (status === 'pendente') return 'tp-tag tp-tag-amber';
  return 'tp-tag tp-tag-green';
};

export default function MeusIngressos() {
  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [ingressoSelecionado, setIngressoSelecionado] = useState(null);
  const [mensagemCopiado, setMensagemCopiado] = useState('');

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

  const abrirModal = (ingresso) => {
    setIngressoSelecionado(ingresso);
    setMensagemCopiado('');
  };

  const fecharModal = () => {
    setIngressoSelecionado(null);
    setMensagemCopiado('');
  };

  const compartilharIngresso = async () => {
    if (!ingressoSelecionado) return;

    const linkCompartilhamento = `${window.location.origin}/ingresso/${ingressoSelecionado.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Ingresso - TicketPlatform',
          text: `Olha o meu ingresso para o evento ${ingressoSelecionado.evento_detalhe.titulo}!`,
          url: linkCompartilhamento,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado ou falhou', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(linkCompartilhamento);
        setMensagemCopiado('Link copiado com sucesso!');
        setTimeout(() => {
          setMensagemCopiado('');
        }, 3000);
      } catch (err) {
        console.error('Falha ao copiar texto: ', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container px-4">
          <p className="tp-eyebrow mb-4">Carregando ingressos</p>
          <div className="tp-grid tp-grid-2">
            <div className="tp-skeleton" style={{ height: '120px' }} />
            <div className="tp-skeleton" style={{ height: '120px' }} />
          </div>
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

  return (
    <div className="section pt-5" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="container px-4">

        <div className="is-flex is-justify-content-space-between is-align-items-flex-end mb-5" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p className="tp-eyebrow mb-2">Carteira · {String(ingressos.length).padStart(2, '0')} ingressos</p>
            <h1 className="title is-2 tp-display mb-0">Meus ingressos</h1>
          </div>
          <Link
            to="/"
            className="button tp-btn-ghost tp-btn-label is-flex is-align-items-center"
            style={{ gap: '8px', height: '38px' }}
          >
            Explorar eventos
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>

        {ingressos.length === 0 ? (
          <div className="tp-panel-inset p-6 has-text-centered">
            <p className="tp-eyebrow mb-3">Carteira vazia</p>
            <p className="tp-muted mb-4">Você ainda não possui ingressos comprados.</p>
            <Link to="/" className="button tp-btn-primary tp-btn-label">Ver programação</Link>
          </div>
        ) : (
          <div className="tp-grid tp-grid-2">
            {ingressos.map((ingresso) => {
              const isUtilizado = ingresso.status === 'utilizado';

              return (
                <button
                  key={ingresso.id}
                  type="button"
                  onClick={() => abrirModal(ingresso)}
                  className={`tp-stub ${isUtilizado ? 'tp-stub-used' : ''}`}
                  style={{ cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  <div className="p-4 is-flex-grow-1">
                    <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                      <span className={classeDoStatus(ingresso.status)}>
                        <span className="tp-dot" />
                        {ingresso.status}
                      </span>
                      <span className="tp-index">
                        #{String(ingresso.id).padStart(4, '0')}
                      </span>
                    </div>

                    <h2 className="title is-5 mb-2" style={{ letterSpacing: '-0.02em' }}>
                      {ingresso.evento_detalhe.titulo}
                    </h2>

                    {ingresso.evento_detalhe.local && (
                      <p className="tp-mono is-size-7 tp-muted is-flex is-align-items-center" style={{ gap: '7px' }}>
                        <Icon name="pin" size={13} /> {ingresso.evento_detalhe.local}
                      </p>
                    )}
                  </div>

                  {ingresso.qr_code && (
                    <>
                      <div className="tp-stub-perf" />
                      <div className="p-4 is-flex is-flex-direction-column is-align-items-center is-justify-content-center" style={{ gap: '8px' }}>
                        <span style={{ background: '#FFF', padding: '4px', display: 'block' }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ingresso.qr_code}`}
                            alt="QR Code do ingresso"
                            width="56"
                            height="56"
                            style={{ display: 'block', filter: isUtilizado ? 'grayscale(100%)' : 'none' }}
                          />
                        </span>
                        <span className="tp-eyebrow" style={{ fontSize: '0.5625rem' }}>Ampliar</span>
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {ingressoSelecionado && (
        <div className="modal is-active">
          <div className="modal-background" onClick={fecharModal}></div>
          <div className="modal-content px-4" style={{ maxWidth: '420px' }}>
            <div className="tp-panel has-text-centered" style={{ background: 'var(--bg-surface)' }}>

              <div className="p-5" style={{ borderBottom: '1px dashed var(--line-strong)' }}>
                <p className="tp-eyebrow mb-2">
                  Ingresso #{String(ingressoSelecionado.id).padStart(4, '0')}
                </p>
                <h2 className="title is-4 tp-display mb-0">
                  {ingressoSelecionado.evento_detalhe.titulo}
                </h2>
              </div>

              <div className="p-5">
                {ingressoSelecionado.qr_code ? (
                  <span style={{ background: '#FFF', padding: '14px', display: 'inline-block' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ingressoSelecionado.qr_code}`}
                      alt="QR Code ampliado do ingresso"
                      style={{
                        display: 'block',
                        width: '230px',
                        height: '230px',
                        filter: ingressoSelecionado.status === 'utilizado' ? 'grayscale(100%)' : 'none'
                      }}
                    />
                  </span>
                ) : (
                  <p className="tp-mono is-size-7" style={{ color: 'var(--amber)' }}>
                    QR Code indisponível para este status.
                  </p>
                )}

                {ingressoSelecionado.status === 'utilizado' && (
                  <div className="notification is-danger is-light mt-5 mb-0 py-2 is-size-7">
                    Este ingresso já foi utilizado na portaria.
                  </div>
                )}

                <div className="mt-5">
                  <button
                    className="button tp-btn-ghost tp-btn-label is-fullwidth is-flex is-align-items-center is-justify-content-center"
                    style={{ gap: '10px', height: '42px' }}
                    onClick={compartilharIngresso}
                  >
                    <Icon name="link" size={15} />
                    Compartilhar link
                  </button>

                  {mensagemCopiado && (
                    <p className="tp-mono is-size-7 mt-3" style={{ color: 'var(--green)' }}>
                      {mensagemCopiado}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="Fechar" onClick={fecharModal}></button>
        </div>
      )}
    </div>
  );
}
