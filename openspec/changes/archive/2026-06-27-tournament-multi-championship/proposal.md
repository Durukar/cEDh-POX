## Why

O sistema atual trata toda a plataforma como um único campeonato implícito, sem agrupamento de rodadas em eventos distintos. O grupo POX realiza múltiplos campeonatos ao longo do tempo e precisa de um modelo que reflita essa realidade — com rankings por campeonato, histórico de participação por jogador e visibilidade de desempenho ao longo das edições.

## What Changes

- **BREAKING** Introdução da entidade `Tournament` (campeonato): todas as `matches` passam a pertencer a um torneio específico
- **BREAKING** A rota pública `/api/leaderboard` passa a operar no contexto de um torneio (ou retornar ranking global entre campeonatos)
- Novo CRUD de torneios no painel admin (criar, editar, arquivar)
- Página pública de listagem de torneios
- Página pública de detalhe de torneio com ranking de jogadores e lista de rodadas
- Página pública de perfil de jogador: histórico de participação em torneios, comandantes usados, posicionamento por evento
- Admin passa a criar rodadas dentro do contexto de um torneio selecionado

## Capabilities

### New Capabilities
- `tournament-management`: CRUD de torneios no admin — criar, editar nome/descrição/status (ativo/encerrado), listar
- `tournament-standings`: Página pública de detalhe de torneio com ranking de jogadores (pontos, vitórias, rodadas jogadas) e lista de rodadas
- `player-profile`: Página pública do perfil de um jogador — estatísticas gerais, histórico de torneios com resultado, lista de comandantes utilizados

### Modified Capabilities
- `match-management`: Rodadas (matches) agora pertencem a um torneio — criação, listagem e detalhe no admin operam dentro do contexto `tournament_id`
- `leaderboard`: O leaderboard público passa a ser o ranking de um torneio específico (acessado via `/campeonatos/:id`); o leaderboard global é removido ou transformado em visão consolidada

## Impact

- **Schema**: nova tabela `tournaments`; coluna `tournament_id` adicionada em `matches` (breaking, requer migration)
- **Backend**: novas rotas `/api/tournaments` (público) e `/api/admin/tournaments` (admin); `/api/admin/matches` passa a exigir `tournament_id`; leaderboard refatorado para operar por torneio
- **Frontend**: nova rota `/campeonatos` (lista), `/campeonatos/:id` (detalhe + ranking), `/jogadores/:id` (perfil); admin recebe página de gerenciamento de torneios e fluxo de criação de rodada dentro de um torneio
- **Dados existentes**: migration deve associar matches existentes a um torneio padrão para não perder histórico
