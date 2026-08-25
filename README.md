# Serviços TI Web — Versão 2

Protótipo avançado feito com **HTML5, CSS3 e JavaScript puro**.

## Contas demo

- Administrador: `admin@servicosti.local` / `admin123`
- Técnico: `tecnico@servicosti.local` / `tec123`
- Empresa: `empresa@cliente.local` / `empresa123`
- Cliente: `cliente@local.test` / `cliente123`

## Funcionalidades desta versão

- Login, cadastro, sessão e logout.
- Perfis: administrador, técnico, empresa e cliente.
- Dashboard com métricas.
- Catálogo e tabela de preços autônomo/empresarial.
- Carrinho de serviços.
- Mini-carrinho na área de serviços com quantidade, total e pop-up detalhado.
- Checkout demonstrativo.
- Histórico financeiro e status de pagamento.
- Chamados com prioridade, SLA, filtros e pesquisa.
- Detalhes do chamado, técnico responsável, histórico e comentários.
- Anexos locais via IndexedDB (até 5 MB por arquivo).
- Cadastro de empresas, CNPJ, centro de custo, contrato e plano de SLA.
- Feedbacks.
- Notificações.
- Relatório TXT geral.
- Relatório TXT individual por chamado.
- CSV de chamados.
- Backup JSON da base local.
- Base de demonstração pré-carregada.
- Responsividade para desktop e celular.

## Execução

Como o projeto usa módulos ES e IndexedDB, rode com um servidor local.

### VS Code
Use a extensão **Live Server** no `index.html`.

### Alternativa
```bash
python -m http.server 5500
```
O Python, nesse caso, só serve os arquivos. O sistema continua sendo JavaScript.

## Limites desta versão

Para uso real em produção ainda seriam necessários:

- Backend/API.
- Banco de dados remoto.
- Sessão/autorização validada pelo servidor.
- Multi-tenancy real.
- Gateway de pagamento para PIX/cartão/boleto.
- Upload remoto para storage.
- Logs/auditoria do servidor.
- LGPD operacional completa.

A versão atual é apropriada para **demonstração acadêmica e MVP local avançado**.
