## Context

O backend roda em Cloudflare Workers (Hono) com D1 (SQLite). A tabela `players` já existe com `id`, `name`, `created_at`. A tabela `match_entries` referencia `player_id` com FK, mas o endpoint atual de criação de entrada aceita `player_name` como string livre e faz um upsert implícito — isso cria jogadores duplicados quando o nome muda minimamente. O frontend de admin tem autenticação por token simples via `localStorage`.

Não há migrações de schema pendentes. Toda a mudança é de API e UI.

## Goals / Non-Goals

**Goals:**
- CRUD completo de jogadores via API admin + UI
- Fluxo de criação de entrada de partida passa a usar lookup de jogador cadastrado (por ID)
- Visualização de quem jogou por rodada (weekly roster) na UI de admin
- Estrutura que servirá de base para estatísticas individuais futuras

**Non-Goals:**
- Estatísticas avançadas por jogador (fora do escopo desta mudança)
- Autenticação de jogadores / perfis públicos
- Paginação ou busca full-text de jogadores (lista pequena, cabe tudo)
- Soft-delete / desativação de jogadores (delete simples, bloqueado se tiver entradas)

## Decisions

### 1. Players API em arquivo separado

Criar `apps/backend/src/routes/players.ts` em vez de expandir `admin.ts`.

**Alternativa considerada**: adicionar tudo em `admin.ts`.
**Rationale**: `admin.ts` já tem 150+ linhas. Separar por recurso mantém o arquivo gerenciável e segue o padrão de `matches.ts` (público) vs `admin.ts` (privado).

### 2. DELETE de jogador bloqueado se tiver entradas

`DELETE /api/admin/players/:id` retorna 409 se o jogador tiver qualquer `match_entry` associada.

**Alternativa considerada**: cascade delete (remove entradas junto).
**Rationale**: Perder histórico de partidas ao deletar um jogador seria destrutivo e difícil de reverter. O admin deve primeiro remover as entradas explicitamente. Mensagem de erro vai indicar quantas entradas existem.

### 3. Criação de entrada passa a receber `player_id` (não `player_name`)

`POST /api/admin/matches/:id/entries` muda de `{ player_name: string }` para `{ player_id: number }`.

**Alternativa considerada**: aceitar ambos (player_id ou player_name, com fallback de lookup por nome).
**Rationale**: Manter os dois cria ambiguidade e perpetua o problema de nomes duplicados. A UI já vai mostrar um dropdown de jogadores cadastrados, então `player_id` é o natural. A mudança é breaking, mas a UI de admin é o único cliente.

### 4. Weekly roster como view da match detail existente

A "lista de quem jogou na semana" não é um novo endpoint — é a tela de detalhe de partida (`/admin/matches/:id`) enriquecida com o roster de jogadores cadastrados. O admin seleciona a partida e vê/edita os participantes usando o dropdown de jogadores.

**Alternativa considerada**: endpoint dedicado `GET /api/admin/matches/:id/participants`.
**Rationale**: Os dados já existem em `GET /api/matches` (público) e na tela de detalhe. Criar outro endpoint seria redundante. O enriquecimento é de UX, não de API.

## Risks / Trade-offs

- **Breaking change no endpoint de criação de entrada** → Mitigation: a UI de admin é o único consumidor; sem integração externa documentada.
- **Jogadores com nomes duplicados criados antes desta mudança** → Mitigation: o seed local e os dados de produção são pequenos; o admin pode consolidar manualmente antes de ativar a nova UI.
- **Ausência de busca/filtro na lista de jogadores** → Mitigation: a lista é pequena (< 50 jogadores típico de grupo cEDH); se crescer, adicionar filtro é incremental.

## Migration Plan

1. Deploy do novo endpoint `players.ts` (additive — sem quebrar nada ainda)
2. Deploy da nova UI de participantes
3. Modificar `POST /matches/:id/entries` para exigir `player_id` (breaking)
4. Atualizar a UI de criação de entrada para usar dropdown de jogadores

Rollback: reverter o passo 3 restaura o comportamento anterior de `player_name` livre.
