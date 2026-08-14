# Plataforma de Eventos e Ingressos - Desafio Elite Dev

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</div>

<br>

> Sistema de gerenciamento de eventos e ingressos desenvolvido para o Desafio Elite Dev. A plataforma permite a criação de eventos via API externa, compra de ingressos com mapa de assentos ou quantidade, e validacao via QR Code na portaria.

---

## Telas do Sistema

### Acesso e Navegação Geral
<img width="1366" height="695" alt="login" src="https://github.com/user-attachments/assets/ebe21fb8-1a35-478c-bff4-ad640e3bda9f" />
<img width="1366" height="696" alt="Home" src="https://github.com/user-attachments/assets/651e058d-8f7e-4ad7-9515-e365cacfc06c" />
<img width="1366" height="697" alt="resultados" src="https://github.com/user-attachments/assets/26930434-a01e-4ec0-bc77-844831461bc3" />
<img width="1366" height="697" alt="resultadosfail" src="https://github.com/user-attachments/assets/bca6ba92-8444-446f-bbfe-9c4f84b2cb81" />

---

### Área do Organizador e Administração
<img width="1366" height="698" alt="Dashboard_organizador" src="https://github.com/user-attachments/assets/442b5cc5-4ccb-4621-89c4-93661b6b0226" />
<img width="1366" height="698" alt="cadastro_evento" src="https://github.com/user-attachments/assets/d831c2be-adfd-4315-b254-2a218720a7ad" />
<img width="1366" height="695" alt="evento_organizador" src="https://github.com/user-attachments/assets/df6edc65-3568-4059-9f44-27b6db7660cf" />
<img width="1366" height="696" alt="rota_users" src="https://github.com/user-attachments/assets/e5170e37-25ef-4011-928d-c0b0639e891e" />

---

### Fluxo do Cliente: Compra e Ingressos
<img width="1366" height="695" alt="compra_ingresso" src="https://github.com/user-attachments/assets/0563b7f1-9e90-4f35-86e0-37b99b9f07e4" />
<img width="1366" height="694" alt="compra_card" src="https://github.com/user-attachments/assets/04bb5e43-3e95-4887-9703-c699a652bb0b" />
<img width="1366" height="697" alt="aprovado" src="https://github.com/user-attachments/assets/f7c9f3c6-a1cd-4970-b572-05fb769e6f77" />
<img width="1366" height="695" alt="compra_recusada" src="https://github.com/user-attachments/assets/26bf3b91-4dda-426c-b30f-31407711a433" />
<img width="1366" height="694" alt="meus-ingressos" src="https://github.com/user-attachments/assets/5db07587-2369-442c-be8a-9529aff93917" />
<img width="1366" height="694" alt="ingresso" src="https://github.com/user-attachments/assets/7ecaafd8-7fda-48ed-bc79-3a6ce70201a8" />

---

### Portaria e Validação
<img width="1366" height="695" alt="portaria" src="https://github.com/user-attachments/assets/7e7d1496-72c4-4410-9073-4e0492212348" />
<img width="1366" height="696" alt="confirma_qrcode" src="https://github.com/user-attachments/assets/5ff4b444-8af4-47ec-9b2d-50ef33fa3e0d" />
<img width="1366" height="696" alt="ingressoinvalido" src="https://github.com/user-attachments/assets/bf8158f0-c68f-42f7-a2db-1e04a745db00" />

---

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
- [x] Configuracao do ambiente Python e instalacao do FastAPI, SQLAlchemy e Alembic.
- [x] Modelagem e criacao das tabelas via Alembic: Usuarios, Eventos, Ingressos/Reservas.
- [x] Implementacao da Autenticacao via JWT, separando os acessos para Organizador, Cliente e Portaria.
- [x] Criacao do script de Seed para popular o banco com os usuarios obrigatorios para teste.

### Fase 2: Integracao e Logica de Negocio (Backend)
- [x] Integracao com a API externa escolhida (TMDb ou Ticketmaster) para popular o formulario de criacao de eventos.
- [x] Implementacao do endpoint de criacao de eventos (exclusivo para o papel Organizador).
- [x] Criacao da logica de reserva de assentos com trava de concorrencia (prevencao de dupla venda).
- [x] Implementacao do endpoint de checkout simulado (aprovacao/recusa).
- [x] Geracao segura do hash para o QR Code do ingresso (inforjavel).
- [x] Endpoint de validacao para o papel Portaria, verificando se o ingresso ja foi usado, se e invalido ou do evento errado.

### Fase 3: Estruturacao Basica do Front-End (React)
- [x] Configuracao do projeto (Vite + React) e roteamento basico.
- [x] Criacao das telas de Login e redirecionamento baseado em papel.
- [x] Tela do Cliente: Catalogo de eventos, fluxo de compra simples (selecao de assento e checkout simulado).
- [x] Tela "Meus Ingressos": Renderizacao do ingresso comprado e do QR Code na tela com link de compartilhamento.
- [x] Tela do Organizador: Formulario simples buscando dados da API externa.
- [x] Tela da Portaria: Input para digitar o codigo e componente de leitura de camera, consumindo a API de validacao.

## Pre-requisitos

Antes de comecar, verifique se voce atendeu aos seguintes requisitos:
* Python `> 3.10`
* Node.js `> 18`
* Chaves de API validas para o `TMDb` ou `Ticketmaster`.

## Uso de Inteligencia Artificial

Em alinhamento com as diretrizes do desafio, o uso de ferramentas de Inteligencia Artificial foi focado na otimizacao de tempo e auxilio em tarefas repetitivas. Todas as decisoes arquiteturais foram tomadas manualmente para evitar solucoes genericas.

* **Ferramentas utilizadas:** Gemini
* **O que foi feito com IA:** Criação base do README utilizando o Template de projetos do IuriCode(Link para o Repo de Referencia:https://github.com/iuricode/readme-template), ajuda no desenvolvimento de front-end(sinceramente gostaria de ter dado um pouco mais de atenção no design e na construção do front, mas to com um computador provisório, então demorei pra desenvolver o sistema todo) e alinhamento com o backend.
* **O que foi feito sem IA:** A estrutura de backend, utilizei o padrão dos meus projetos, visei manter a segurança por minha conta já que a IA tende a falhar bastante nisso, como proteger os .env, schemas e modelos, tambem foquei bastante na restrutura de prompts e da funções, pensando bem nas regras de negócio, o desenvolvimento de funções no backend, padronização de dados do backend, deploy no vercel, configuração do supabase(tenho preferencia por DB como Mysql, mas tava ficando com tempo curto kkkkk), pytest desenvolvido para testar as funções no backend e rotas.

* *Observação acho que mesmo depois de acabar esse projeto eu dê um pouco mais de atenção e carinho no projeto, priorizei entregar algo sólido no praso do que fazer algo bonito e rebuscado e não entregar dentro do prazo, se te interessou da um follow e uma estrela que vou ir fazendo updates com o que eu achar melhor*

## Licenca

Esse projeto esta sob licenca MIT. Veja o arquivo `LICENSE.md` para mais detalhes.
