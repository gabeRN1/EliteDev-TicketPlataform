import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_URL } from '../config';
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
      const response = await fetch(`${API_URL}/ingressos/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: eventoId,
          qr_code: codigo
        })
      });

      const ticketData = await response.json(); 

      if (response.ok) {
        setResultadoValidacao({
          status: ticketData.status, // TicketStatus do backend
          titulo: ticketData.status === 'aprovado' ? 'Acesso Liberado' : 'Validação',
          mensagem: `Ingresso de ID #${ticketData.id}`,
          codigo: codigo,
          detalhes: ticketData
        });
      } else {
        setResultadoValidacao({
          status: 'invalido',
          titulo: 'Validação Falhou',
          mensagem: ticketData.detail || 'Código inválido ou não pertencente a este evento.',
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
        return { headerBg: '#064E3B', btnClass: 'is-success', title: 'Acesso Liberado' };
      case 'pendente':
        return { headerBg: '#78350F', btnClass: 'is-warning', title: 'Aguardando Pagamento' };
      case 'cancelado':
      case 'utilizado':
      default:
        return { headerBg: '#7F1D1D', btnClass: 'is-danger', title: 'Acesso Negado' };
    }
  };

  const modalConfig = getModalConfig(resultadoValidacao?.status);

  return (
    <div className="section pt-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container px-4" style={{ maxWidth: '680px' }}>
        
        <div className="box mb-4 p-4" style={{ backgroundColor: '#151B2B', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="is-flex is-align-items-center" style={{ gap: '15px' }}>
            <div className="is-flex is-align-items-center is-justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <h1 className="title is-5 mb-0 has-text-white">{porteiro.nome}</h1>
              <p className="is-size-7 has-text-grey-light">
                <span className="tag is-info is-light is-small mr-2">{porteiro.role}</span>
                {porteiro.email}
              </p>
            </div>
          </div>
        </div>

        <div className="box p-4" style={{ backgroundColor: '#151B2B', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-3">
            <div style={{ width: '100%', height: '320px', backgroundColor: '#0A0E17', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <div id="reader-container" style={{ width: '100%', height: '100%' }}></div>
              {erroCamera && <p className="has-text-danger is-size-7 p-4 text-center">{erroCamera}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmitManual}>
            <div className="field has-addons">
              <div className="control is-expanded">
                <input 
                  className="input" 
                  type="text" 
                  placeholder="Digite o QR Code..." 
                  value={codigoQr} 
                  onChange={(e) => setCodigoQr(e.target.value)} 
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
              </div>
              <div className="control">
                <button type="submit" className={`button is-link ${loading ? 'is-loading' : ''}`}>Validar</button>
              </div>
            </div>
          </form>
        </div>
      </div>


      <div className={`modal ${modalAberto ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={fecharModalEContinuar}></div>
        <div className="modal-card" style={{ maxWidth: '480px', width: '90%' }}>
          <header className="modal-card-head" style={{ backgroundColor: modalConfig.headerBg }}>
            <p className="modal-card-title has-text-white">{resultadoValidacao?.titulo}</p>
            <button className="delete" aria-label="close" onClick={fecharModalEContinuar}></button>
          </header>
          <section className="modal-card-body" style={{ backgroundColor: '#151B2B', color: '#F8FAFC' }}>
            <p className="is-size-6 mb-2">{resultadoValidacao?.mensagem}</p>
            <p className="is-size-7 has-text-grey">Código: <code>{resultadoValidacao?.codigo}</code></p>
          </section>
          <footer className="modal-card-foot" style={{ backgroundColor: '#151B2B' }}>
            <button className={`button is-fullwidth ${modalConfig.btnClass}`} onClick={fecharModalEContinuar}>
              Próximo Ingresso
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}