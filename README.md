# Plataforma de Eventos e Ingressos - Desafio Elite Dev

![GitHub repo size](https://img.shields.io/github/repo-size/seu-usuario/seu-repositorio?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/gabeRN1/seu-repositorio?style=for-the-badge)

<img src="imagem.png" alt="Exemplo imagem do projeto"> 

> Sistema de gerenciamento de eventos e ingressos desenvolvido para o Desafio Elite Dev. A plataforma permite a criação de eventos via API externa, compra de ingressos com mapa de assentos ou quantidade, e validacao via QR Code na portaria.

## Visao Geral do Projeto

O projeto e uma aplicacao full-stack que resolve o fluxo completo de um evento. O sistema e dividido em tres papeis de usuario distintos:
* **Organizador**: Cria e gerencia eventos buscando dados em catalogos externos.
* **Cliente**: Navega pelos eventos, reserva assentos, realiza pagamento simulado e recebe seu ingresso.
* **Portaria**: Valida os ingressos na entrada do evento.

## Requisitos do Sistema

### Requisitos Funcionais

**Front-End:**
* Navegacao e busca pelos eventos publicados com informacoes de data, local e preco.
* Criacao e gerenciamento dos eventos (area restrita ao organizador).
* Fluxo de reserva com selecao de lugar em um mapa de assentos ou selecao de quantidade de ingressos.
* Simulacao de pagamento, contemplando fluxos de confirmacao e de recusa.
* Area de "Meus ingressos" para o cliente, exibindo o ingresso gerado e seu codigo em QR.
* Tela de portaria para validacao do ingresso, com retornos claros de status: valido, invalido, ja utilizado ou evento errado.
* Suporte para leitura do QR Code pela camera ou digitacao manual do codigo.

**Back-End:**
* Gestao e integracao com a API externa (Ticketmaster Discovery ou TMDb) para buscar dados do catalogo.
* Sistema de autenticacao e autorizacao com tres papeis: Organizador, Cliente e Portaria.
* Armazenamento persistente de eventos, reservas e ingressos.
* Controle de concorrencia rigoroso para garantir que o mesmo lugar nao seja vendido duas vezes.
* Geracao de ingresso com um codigo em QR inforjavel.
* Logica para compartilhamento do ingresso pelo cliente via link gerado pela aplicacao.
* Endpoint de validacao na portaria para garantir que o ingresso nao seja validado mais de uma vez.
* Simulacao de cobranca sem transacoes financeiras reais.

### Requisitos Nao Funcionais
* O projeto deve incluir um README detalhado com instrucoes de configuracao.
* A base de dados deve conter dados de teste (seed) com: um organizador, dois clientes, um usuario de portaria e ao menos um evento com ingressos disponiveis.
* O desenvolvimento deve documentar o uso de IA, detalhando quais ferramentas foram utilizadas e as decisoes tomadas.

## Tecnologias Utilizadas

* **Frontend:** React (Vite / Next.js)
* **Backend:** Python com FastAPI
* **Banco de Dados:** SQLite (Desenvolvimento) / PostgreSQL (Producao)
* **ORM e Migracoes:** SQLAlchemy e Alembic

## Etapas de Desenvolvimento

A construcao da aplicacao foi dividida em fases para garantir que o fluxo de ponta a ponta seja estabelecido de forma estruturada, comecando pelo backend.

### Fase 1: Estruturacao do Banco e Autenticacao (Backend)
- [ ] Configuracao do ambiente Python e instalacao do FastAPI, SQLAlchemy e Alembic.
- [ ] Modelagem e criacao das tabelas via Alembic: Usuarios, Eventos, Ingressos/Reservas.
- [ ] Implementacao da Autenticacao via JWT, separando os acessos para Organizador, Cliente e Portaria.
- [ ] Criacao do script de Seed para popular o banco com os usuarios obrigatorios para teste.

### Fase 2: Integracao e Logica de Negocio (Backend)
- [ ] Integracao com a API externa escolhida (TMDb ou Ticketmaster) para popular o formulario de criacao de eventos.
- [ ] Implementacao do endpoint de criacao de eventos (exclusivo para o papel Organizador).
- [ ] Criacao da logica de reserva de assentos com trava de concorrencia (prevencao de dupla venda).
- [ ] Implementacao do endpoint de checkout simulado (aprovacao/recusa).
- [ ] Geracao segura do hash para o QR Code do ingresso (inforjavel).
- [ ] Endpoint de validacao para o papel Portaria, verificando se o ingresso ja foi usado, se e invalido ou do evento errado.

### Fase 3: Estruturacao Basica do Front-End (React)
- [ ] Configuracao do projeto (Vite + React) e roteamento basico.
- [ ] Criacao das telas de Login e redirecionamento baseado em papel.
- [ ] Tela do Cliente: Catalogo de eventos, fluxo de compra simples (selecao de assento e checkout simulado).
- [ ] Tela "Meus Ingressos": Renderizacao do ingresso comprado e do QR Code na tela com link de compartilhamento.
- [ ] Tela do Organizador: Formulario simples buscando dados da API externa.
- [ ] Tela da Portaria: Input para digitar o codigo e componente de leitura de camera, consumindo a API de validacao.

## Pre-requisitos

Antes de comecar, verifique se voce atendeu aos seguintes requisitos:
* Python `> 3.10`
* Node.js `> 18`
* Chaves de API validas para o `TMDb` ou `Ticketmaster`.



## Uso de Inteligencia Artificial

Em alinhamento com as diretrizes do desafio, o uso de ferramentas de Inteligencia Artificial foi focado na otimizacao de tempo e auxilio em tarefas repetitivas. Todas as decisoes arquiteturais foram tomadas manualmente para evitar solucoes genericas.

* **Ferramentas utilizadas:** Gemini
* **O que foi feito com IA:** Criação base do README utilizando o Template de projetos do IuriCode(Link para o Repo de Referencia:https://github.com/iuricode/readme-template)
* **O que foi feito sem IA:** [Preencher posteriormente]

## Licenca

Esse projeto esta sob licenca MIT. Veja o arquivo `LICENSE.md` para mais detalhes.