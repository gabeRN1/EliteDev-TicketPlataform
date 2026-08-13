import React, { useState, useEffect } from 'react';

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
  const [buscaEvento, setBuscaEvento] = useState('');

  const carregarDados = async () => {
    try {
      const [resEventos, resUsuarios] = await Promise.all([
        fetch('/api/eventos'),
        fetch('/api/usuarios')
      ]);

      if (resEventos.ok) setEventos(await resEventos.json());
      if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAlterarRole = async (userId, novaRole) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: novaRole })
      });
      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, role: novaRole } : u));
      }
    } catch (err) {
      console.error("Erro ao alterar role:", err);
    }
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    const payload = {
      ...eventoForm,
      preco: parseFloat(eventoForm.preco),
      capacidade_total: parseInt(eventoForm.capacidade_total),
      ingressos_disponiveis: parseInt(eventoForm.ingressos_disponiveis),
      data_evento: new Date(eventoForm.data_evento).toISOString()
    };

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Evento cadastrado com sucesso!');
        setModalAberto(false);
        setEventoForm(eventoSchemaInicial);
        carregarDados(); 
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

  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' };

  return (
    <div className="section pt-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container px-4">
        
        <div className="box mb-5 p-4" style={{ backgroundColor: '#151B2B', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="is-flex is-align-items-center is-justify-content-space-between">
            <div>
              <h1 className="title is-4 mb-0 has-text-white">{perfil?.nome || 'Organizador'}</h1>
              <p className="is-size-7 has-text-grey-light">{perfil?.email}</p>
            </div>
            <div className="buttons">
              <button className={`button is-small ${abaAtiva === 'dashboard' ? 'is-link' : 'is-dark'}`} onClick={() => setAbaAtiva('dashboard')}>Dashboard</button>
              <button className={`button is-small ${abaAtiva === 'eventos' ? 'is-link' : 'is-dark'}`} onClick={() => setAbaAtiva('eventos')}>Eventos</button>
              <button className={`button is-small ${abaAtiva === 'usuarios' ? 'is-link' : 'is-dark'}`} onClick={() => setAbaAtiva('usuarios')}>Usuários</button>
            </div>
          </div>
        </div>

        {abaAtiva === 'dashboard' && (
          <div className="columns mb-5">
            <div className="column">
              <div className="box has-text-centered" style={{ backgroundColor: '#151B2B' }}>
                <p className="is-size-7 has-text-grey">RECEITA TOTAL</p>
                <p className="title is-3 has-text-success">R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="column">
              <div className="box has-text-centered" style={{ backgroundColor: '#151B2B' }}>
                <p className="is-size-7 has-text-grey">VENDIDOS</p>
                <p className="title is-3 has-text-info">{totalIngressosVendidos}</p>
              </div>
            </div>
            <div className="column">
              <div className="box has-text-centered" style={{ backgroundColor: '#151B2B' }}>
                <p className="is-size-7 has-text-grey">ESTOQUE DISPONÍVEL</p>
                <p className="title is-3 has-text-warning">{totalEstoqueDisponivel}</p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'eventos' && (
          <div>
            <div className="is-flex is-justify-content-space-between mb-4">
              <h2 className="title is-4 has-text-white">Meus Eventos</h2>
              <button className="button is-primary" onClick={() => setModalAberto(true)}>+ Novo Evento</button>
            </div>

            <div className="box" style={{ backgroundColor: '#151B2B' }}>
              <table className="table is-fullwidth" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr>
                    <th className="has-text-grey">Evento</th>
                    <th className="has-text-grey">Preço</th>
                    <th className="has-text-grey">Vendas</th>
                    <th className="has-text-grey">Disponíveis</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map(ev => (
                    <tr key={ev.id}>
                      <td className="has-text-white">{ev.titulo}</td>
                      <td className="has-text-white">R$ {ev.preco.toFixed(2)}</td>
                      <td className="has-text-white">{ev.capacidade_total - ev.ingressos_disponiveis} / {ev.capacidade_total}</td>
                      <td className="has-text-white">{ev.ingressos_disponiveis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === 'usuarios' && (
          <div className="box" style={{ backgroundColor: '#151B2B' }}>
            <table className="table is-fullwidth" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th className="has-text-grey">ID</th>
                  <th className="has-text-grey">Nome</th>
                  <th className="has-text-grey">E-mail</th>
                  <th className="has-text-grey">Role</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td className="has-text-grey">#{u.id}</td>
                    <td className="has-text-white">{u.nome}</td>
                    <td className="has-text-grey-light">{u.email}</td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleAlterarRole(u.id, e.target.value)}
                        style={{ backgroundColor: '#151B2B', color: 'white' }}
                      >
                        <option value="cliente">cliente</option>
                        <option value="portaria">portaria</option>
                        <option value="organizador">organizador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`modal ${modalAberto ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => setModalAberto(false)}></div>
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <header className="modal-card-head" style={{ backgroundColor: '#151B2B' }}>
              <p className="modal-card-title has-text-white">Cadastrar Evento</p>
            </header>
            <section className="modal-card-body" style={{ backgroundColor: '#1A2133' }}>
              <form id="form-novo-evento" onSubmit={salvarEvento}>
                <div className="field">
                  <label className="label has-text-grey-light">Título</label>
                  <input className="input" type="text" name="titulo" value={eventoForm.titulo} onChange={handleFormChange} required style={inputStyle} />
                </div>
                <div className="field">
                  <label className="label has-text-grey-light">Descrição</label>
                  <textarea className="textarea" name="descricao" value={eventoForm.descricao} onChange={handleFormChange} required style={inputStyle} />
                </div>
                <div className="columns">
                  <div className="column field">
                    <label className="label has-text-grey-light">Local</label>
                    <input className="input" type="text" name="local" value={eventoForm.local} onChange={handleFormChange} required style={inputStyle} />
                  </div>
                  <div className="column field">
                    <label className="label has-text-grey-light">Data e Hora</label>
                    <input className="input" type="datetime-local" name="data_evento" value={eventoForm.data_evento} onChange={handleFormChange} required style={inputStyle} />
                  </div>
                </div>
                <div className="columns">
                  <div className="column field">
                    <label className="label has-text-grey-light">Preço (R$)</label>
                    <input className="input" type="number" step="0.01" name="preco" value={eventoForm.preco} onChange={handleFormChange} required style={inputStyle} />
                  </div>
                  <div className="column field">
                    <label className="label has-text-grey-light">Capacidade Total</label>
                    <input className="input" type="number" name="capacidade_total" value={eventoForm.capacidade_total} onChange={handleFormChange} required style={inputStyle} />
                  </div>
                </div>
              </form>
            </section>
            <footer className="modal-card-foot" style={{ backgroundColor: '#151B2B' }}>
              <button className="button is-success" type="submit" form="form-novo-evento">Salvar Evento</button>
              <button className="button is-dark" onClick={() => setModalAberto(false)}>Cancelar</button>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}