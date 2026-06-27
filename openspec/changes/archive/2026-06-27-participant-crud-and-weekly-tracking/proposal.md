## Why

O sistema já registra partidas e entradas, mas não existe uma forma de gerenciar o cadastro de jogadores (players) pela interface de administração — eles só existem como subproduto da criação de entradas. Adicionar um CRUD completo de participantes permite que o administrador mantenha a lista de jogadores ativos e, a partir dessa lista, monte quem jogou em cada semana para começar a acumular estatísticas individuais.

## What Changes

- Novos endpoints de API para criar, listar, editar e remover jogadores (`/api/admin/players`)
- Nova seção "Participantes" na UI de admin com tabela e formulários CRUD
- Endpoint para listar jogadores que participaram de uma partida específica (`/api/admin/matches/:id/participants`)
- UI para visualizar e editar quem jogou em cada rodada semanal, vinculando jogadores cadastrados às partidas existentes
- Base de dados já suporta a relação (tabela `players` + `match_entries`) — sem migrações necessárias

## Capabilities

### New Capabilities

- `player-management`: CRUD completo de jogadores — criar, listar, editar nome, desativar/remover — gerenciado pelo admin
- `weekly-roster`: Visualização e gestão de quem jogou em uma partida/rodada: lista de participantes por partida com status e resultado, base para estatísticas futuras

### Modified Capabilities

- `match-management`: Ao criar entradas de uma partida, o fluxo passa a selecionar jogadores já cadastrados (lookup) em vez de digitar `player_name` livremente — garante consistência referencial

## Impact

- **Backend**: Novos handlers em `apps/backend/src/routes/admin.ts` (ou arquivo separado `players.ts`)
- **Frontend**: Nova aba/seção em `apps/frontend/src/routes/admin/` e componentes em `src/components/admin/`
- **Schema**: Sem alteração no schema D1 — a tabela `players` já existe com `id`, `name`, `created_at`
- **API contract**: O campo `player_name` livre em `POST /matches/:id/entries` passa a exigir que o jogador já exista em `players` (breaking change no fluxo de criação de entrada)
