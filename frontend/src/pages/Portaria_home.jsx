import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_URL } from '../config';
import Icon from '../components/Icon';

export default function PortariaHome({ usuario, eventoId = 1 }) {
  const porteiro = usuario || {
    id: 0,
    nome: 'Operador de Portaria',
    email: '',
    role: 'portaria'
  };

  const [codigoQr, setCodigoQr] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroCamera, setErroCamera] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [resultadoValidacao, setResultadoValidacao] = useState(null);

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const iniciarCamera = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader-container");
        html5QrCodeRef.current = html5QrCode;

        const config = { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => processarValidacao(decodedText),
          () => {}
        );

        if (isMounted) setErroCamera('');
      } catch (err) {
        console.error("Erro ao iniciar câmera:", err);
        if (isMounted) setErroCamera("Não foi possível acessar a câmera. Utilize o campo manual.");
      }
    };

    iniciarCamera();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((err) => console.error("Erro ao parar câmera:", err));
      }
    };
  }, []);

  const processarValidacao = async (codigo) => {
    if (!codigo || loading || modalAberto) return;
    setLoading(true);

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try { await html5QrCodeRef.current.pause(true); } catch (e) {}
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/eventos/portaria/validar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          evento_id: Number(eventoId),
          qr_code: codigo
        })
      });

      const ticketData = await response.json(); 

      if (response.ok) {
        setResultadoValidacao({
          status: 'aprovado',
          titulo: ticketData.mensagem || 'Acesso Liberado', 
          mensagem: `Ingresso de ID #${ticketData.ticket_id} validado com sucesso!`,
          codigo: codigo,
          detalhes: ticketData
        });
      } else {
        const errorMessage = Array.isArray(ticketData.detail)
          ? ticketData.detail[0].msg
          : ticketData.detail || 'Código inválido ou não pertencente a este evento.';

        setResultadoValidacao({
          status: 'invalido',
          titulo: 'Validação Falhou',
          mensagem: errorMessage,
          codigo: codigo
        });
      }
    } catch (error) {
      setResultadoValidacao({
        status: 'invalido',
        titulo: 'Erro de Conexão',
        mensagem: 'Não foi possível conectar ao servidor backend.',
        codigo: codigo
      });
    } finally {
      setLoading(false);
      setModalAberto(true);
      setCodigoQr('');
    }
  };

  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (codigoQr.trim()) processarValidacao(codigoQr.trim());
  };

  const fecharModalEContinuar = () => {
    setModalAberto(false);
    setResultadoValidacao(null);
    if (html5QrCodeRef.current) {
      try { html5QrCodeRef.current.resume(); } catch (e) {}
    }
  };

  const getModalConfig = (status) => {
    switch (status) {
      case 'aprovado':
      case 'pago':
        return { accent: 'var(--green)', icon: 'check', title: 'Acesso Liberado' };
      case 'pendente':
        return { accent: 'var(--amber)', icon: 'alert', title: 'Aguardando Pagamento' };
      case 'cancelado':
      case 'utilizado':
      case 'invalido':
      default:
        return { accent: 'var(--red)', icon: 'close', title: 'Acesso Negado' };
    }
  };

  const modalConfig = getModalConfig(resultadoValidacao?.status);

  return (
    <div className="section pt-5" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="container px-4" style={{ maxWidth: '700px' }}>

        <header
          className="is-flex is-align-items-center is-justify-content-space-between pb-4 mb-5"
          style={{ borderBottom: '1px solid var(--line)', gap: '16px', flexWrap: 'wrap' }}
        >
          <div className="is-flex is-align-items-center" style={{ gap: '14px' }}>
            <span
              className="is-flex is-align-items-center is-justify-content-center"
              style={{ width: '42px', height: '42px', border: '1px solid var(--line-strong)', color: 'var(--accent-soft)' }}
            >
              <Icon name="shield" size={20} />
            </span>
            <div>
              <p className="tp-eyebrow mb-1">Controle de acesso</p>
              <h1 className="title is-5 mb-0" style={{ letterSpacing: '-0.02em' }}>{porteiro.nome}</h1>
            </div>
          </div>

          <div className="has-text-right">
            <span className="tp-tag tp-tag-accent">{porteiro.role}</span>
            {porteiro.email && <p className="tp-mono is-size-7 tp-dim mt-2">{porteiro.email}</p>}
          </div>
        </header>

        <div className="tp-rule">
          <span className="tp-eyebrow">Leitor de QR Code</span>
        </div>

        <div className="tp-panel p-4">
          <div className="tp-scanner">
            <div id="reader-container" style={{ width: '100%', height: '100%' }}></div>
            <div className="tp-scanner-frame" aria-hidden="true">
              <span /><span /><span /><span />
            </div>

            {erroCamera && (
              <div
                className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center p-5 has-text-centered"
                style={{ position: 'absolute', inset: 0, background: 'var(--bg-inset)', gap: '12px' }}
              >
                <span style={{ color: 'var(--red)' }}><Icon name="camera" size={26} /></span>
                <p className="tp-mono is-size-7 tp-muted" style={{ maxWidth: '34ch' }}>{erroCamera}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitManual} className="mt-4">
            <label className="label mb-2" htmlFor="codigo-manual">Validação manual</label>
            <div className="is-flex" style={{ gap: '0' }}>
              <input
                id="codigo-manual"
                className="input tp-mono"
                type="text"
                placeholder="Digite o código do ingresso"
                value={codigoQr}
                onChange={(e) => setCodigoQr(e.target.value)}
                style={{ height: '44px', borderRight: 0 }}
              />
              <button
                type="submit"
                className={`button tp-btn-primary tp-btn-label px-5 ${loading ? 'is-loading' : ''}`}
                style={{ height: '44px' }}
              >
                Validar
              </button>
            </div>
          </form>
        </div>

        <p className="tp-mono is-size-7 tp-dim mt-4">
          Evento monitorado: #{String(eventoId).padStart(4, '0')}
        </p>
      </div>

      <div className={`modal ${modalAberto ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={fecharModalEContinuar}></div>
        <div className="modal-content px-4" style={{ maxWidth: '460px' }}>
          <div className="tp-panel" style={{ borderTop: `3px solid ${modalConfig.accent}` }}>

            <div className="p-5" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="is-flex is-align-items-center" style={{ gap: '14px' }}>
                <span
                  className="is-flex is-align-items-center is-justify-content-center"
                  style={{ width: '40px', height: '40px', border: `1px solid ${modalConfig.accent}`, color: modalConfig.accent }}
                >
                  <Icon name={modalConfig.icon} size={20} />
                </span>
                <div>
                  <p className="tp-eyebrow mb-1" style={{ color: modalConfig.accent }}>Resultado</p>
                  <h2 className="title is-5 mb-0">{resultadoValidacao?.titulo}</h2>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="mb-3">{resultadoValidacao?.mensagem}</p>
              <p className="tp-mono is-size-7 tp-dim" style={{ wordBreak: 'break-all' }}>
                Código: {resultadoValidacao?.codigo}
              </p>
            </div>

            <div className="p-4" style={{ borderTop: '1px solid var(--line)' }}>
              <button
                className="button tp-btn-invert tp-btn-label is-fullwidth is-flex is-align-items-center is-justify-content-center"
                style={{ gap: '10px', height: '44px' }}
                onClick={fecharModalEContinuar}
              >
                Próximo ingresso
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        </div>
        <button className="modal-close is-large" aria-label="Fechar" onClick={fecharModalEContinuar}></button>
      </div>
    </div>
  );
}
