import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import Icon from '../components/Icon';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ABAS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'usuarios', label: 'Usuários' },
];

export default function OrganizadorHome({ perfil }) {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [eventos, setEventos] = useState([]);

  const eventoSchemaInicial = {
    titulo: '',
    descricao: '',
    local: '',
    data_evento: '',
    preco: '',
    capacidade_total: '',
    ingressos_disponiveis: '',
    imagem_url: '',
    categoria: '',
    external_id: ''
  };
  const [eventoForm, setEventoForm] = useState(eventoSchemaInicial);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarDados = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Ajustado para buscar na rota correta do backend e enviando o token
      const resEventos = await fetch(`${API_URL}/eventos/meus-eventos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resEventos.ok) {
        setEventos(await resEventos.json());
      } else {
        console.error("Erro ao buscar eventos:", await resEventos.text());
      }

      /* 
       * AVISO: A rota de listar usuários não existe no backend fornecido.
       * Estou deixando comentada para não gerar erro 404
       */
      /*
      const resUsuarios = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
      */
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const salvarEvento = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = {
      ...eventoForm,
      preco: parseFloat(eventoForm.preco),
      capacidade_total: parseInt(eventoForm.capacidade_total),
      ingressos_disponiveis: parseInt(eventoForm.ingressos_disponiveis),
      data_evento: new Date(eventoForm.data_evento).toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/eventos/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Evento cadastrado com sucesso!');
        setModalAberto(false);
        setEventoForm(eventoSchemaInicial);
        carregarDados(); 
      } else {
        alert('Erro ao salvar evento. Verifique os dados.');
      }
    } catch (err) {
      console.error("Erro ao criar evento:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventoForm(prev => {
      const atualizado = { ...prev, [name]: value };
      if (name === 'capacidade_total' && !prev.ingressos_disponiveis) {
        atualizado.ingressos_disponiveis = value;
      }
      return atualizado;
    });
  };

  const totalReceita = eventos.reduce((acc, ev) => acc + ((ev.capacidade_total - ev.ingressos_disponiveis) * ev.preco), 0);
  const totalIngressosVendidos = eventos.reduce((acc, ev) => acc + (ev.capacidade_total - ev.ingressos_disponiveis), 0);
  const totalEstoqueDisponivel = eventos.reduce((acc, ev) => acc + ev.ingressos_disponiveis, 0);

  return (
    <div className="section pt-5" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="container px-4">

        <header
          className="is-flex is-align-items-flex-end is-justify-content-space-between pb-4 mb-5"
          style={{ borderBottom: '1px solid var(--line)', gap: '20px', flexWrap: 'wrap' }}
        >
          <div className="is-flex is-align-items-center" style={{ gap: '14px' }}>
            <span
              className="is-flex is-align-items-center is-justify-content-center"
              style={{ width: '42px', height: '42px', border: '1px solid var(--line-strong)', color: 'var(--accent-soft)' }}
            >
              <Icon name="chart" size={20} />
            </span>
            <div>
              <p className="tp-eyebrow mb-1">Painel do organizador</p>
              <h1 className="title is-4 mb-0" style={{ letterSpacing: '-0.03em' }}>
                {perfil?.nome || 'Organizador'}
              </h1>
              {perfil?.email && <p className="tp-mono is-size-7 tp-dim mt-1">{perfil.email}</p>}
            </div>
          </div>

          <div className="tp-segment">
            {ABAS.map(aba => (
              <button
                key={aba.id}
                type="button"
                data-active={abaAtiva === aba.id}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </header>

        {abaAtiva === 'dashboard' && (
          <div className="tp-grid tp-grid-3">
            <div className="tp-metric">
              <p className="tp-eyebrow mb-2" style={{ fontSize: '0.625rem' }}>Receita total</p>
              <p className="tp-metric-value">{formatadorMoeda.format(totalReceita)}</p>
            </div>
            <div className="tp-metric is-alt">
              <p className="tp-eyebrow mb-2" style={{ fontSize: '0.625rem' }}>Ingressos vendidos</p>
              <p className="tp-metric-value">{totalIngressosVendidos}</p>
            </div>
            <div className="tp-metric is-warm">
              <p className="tp-eyebrow mb-2" style={{ fontSize: '0.625rem' }}>Estoque disponível</p>
              <p className="tp-metric-value">{totalEstoqueDisponivel}</p>
            </div>
          </div>
        )}

        {abaAtiva === 'eventos' && (
          <div>
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-4" style={{ gap: '16px', flexWrap: 'wrap' }}>
              <div className="tp-rule" style={{ flex: 1, marginBottom: 0 }}>
                <span className="tp-eyebrow">Meus eventos</span>
              </div>
              <button
                className="button tp-btn-primary tp-btn-label is-flex is-align-items-center"
                style={{ gap: '8px', height: '38px' }}
                onClick={() => setModalAberto(true)}
              >
                <Icon name="plus" size={14} />
                Novo evento
              </button>
            </div>

            <div className="tp-panel" style={{ overflowX: 'auto' }}>
              <table className="table is-fullwidth mb-0">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Preço</th>
                    <th>Vendas</th>
                    <th>Disponíveis</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.length > 0 ? (
                    eventos.map(ev => {
                      const vendidos = ev.capacidade_total - ev.ingressos_disponiveis;
                      const pct = ev.capacidade_total ? Math.round((vendidos / ev.capacidade_total) * 100) : 0;

                      return (
                        <tr key={ev.id}>
                          <td className="has-text-weight-semibold">{ev.titulo}</td>
                          <td className="tp-mono is-size-7">{formatadorMoeda.format(ev.preco)}</td>
                          <td>
                            <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
                              <span className="tp-mono is-size-7">{vendidos}/{ev.capacidade_total}</span>
                              <span style={{ width: '70px', height: '3px', background: 'var(--line)' }}>
                                <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
                              </span>
                            </div>
                          </td>
                          <td className="tp-mono is-size-7">{ev.ingressos_disponiveis}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="has-text-centered tp-muted py-5">
                        Nenhum evento encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === 'usuarios' && (
          <div className="tp-panel-inset p-6 has-text-centered">
            <p className="tp-eyebrow mb-3" style={{ color: 'var(--amber)' }}>Indisponível</p>
            <p className="tp-muted mb-0">
              A visualização de usuários não está disponível, pois a rota correspondente
              ainda não foi criada no backend.
            </p>
          </div>
        )}

        <div className={`modal ${modalAberto ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => setModalAberto(false)}></div>
          <div className="modal-card" style={{ maxWidth: '620px' }}>
            <header className="modal-card-head" style={{ borderBottom: '1px solid var(--line)' }}>
              <p className="modal-card-title">Cadastrar evento</p>
              <button className="delete" aria-label="Fechar" onClick={() => setModalAberto(false)}></button>
            </header>

            <section className="modal-card-body">
              <form id="form-novo-evento" onSubmit={salvarEvento}>
                <div className="field tp-field">
                  <label className="label" htmlFor="ev-titulo">Título</label>
                  <input id="ev-titulo" className="input" type="text" name="titulo" value={eventoForm.titulo} onChange={handleFormChange} required />
                </div>

                <div className="field tp-field">
                  <label className="label" htmlFor="ev-descricao">Descrição</label>
                  <textarea id="ev-descricao" className="textarea" rows="3" name="descricao" value={eventoForm.descricao} onChange={handleFormChange} required />
                </div>

                <div className="tp-grid tp-grid-2 mb-4">
                  <div className="field mb-0">
                    <label className="label" htmlFor="ev-local">Local</label>
                    <input id="ev-local" className="input" type="text" name="local" value={eventoForm.local} onChange={handleFormChange} required />
                  </div>
                  <div className="field mb-0">
                    <label className="label" htmlFor="ev-data">Data e hora</label>
                    <input id="ev-data" className="input tp-mono" type="datetime-local" name="data_evento" value={eventoForm.data_evento} onChange={handleFormChange} required />
                  </div>
                </div>

                <div className="tp-grid tp-grid-2">
                  <div className="field mb-0">
                    <label className="label" htmlFor="ev-preco">Preço (R$)</label>
                    <input id="ev-preco" className="input tp-mono" type="number" step="0.01" name="preco" value={eventoForm.preco} onChange={handleFormChange} required />
                  </div>
                  <div className="field mb-0">
                    <label className="label" htmlFor="ev-capacidade">Capacidade total</label>
                    <input id="ev-capacidade" className="input tp-mono" type="number" name="capacidade_total" value={eventoForm.capacidade_total} onChange={handleFormChange} required />
                  </div>
                </div>
              </form>
            </section>

            <footer className="modal-card-foot is-justify-content-flex-end" style={{ borderTop: '1px solid var(--line)', gap: '10px' }}>
              <button className="button tp-btn-quiet tp-btn-label" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className="button tp-btn-primary tp-btn-label" type="submit" form="form-novo-evento">Salvar evento</button>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}
