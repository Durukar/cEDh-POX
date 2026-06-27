## Context

O sistema atual tem uma única "arena" implícita: todas as rodadas (`matches`) pertencem a um campeonato global não-nomeado, e o leaderboard é global. O grupo POX realiza múltiplos campeonatos (temporadas) e precisa rastrear desempenho por evento, com histórico individual de jogadores cruzando edições.

Stack atual: Cloudflare Workers + Hono, D1 (SQLite), TanStack Router (flat route tree gerenciada manualmente), TanStack Query, Shadcn/Base UI.

## Goals / Non-Goals

**Goals:**
- Introduzir entidade `Tournament` com CRUD no admin
- Scoping de `matches` por torneio
- Página pública de listagem e detalhe de torneio (ranking + rodadas)
- Página pública de perfil de jogador com histórico cross-tournament
- Migrar dados existentes para um torneio padrão (sem perda de histórico)

**Non-Goals:**
- Suporte a múltiplos formatos de torneio (swiss, eliminatório, etc.)
- Sistema de convites ou inscrição de jogadores por torneio
- Autenticação de jogadores (apenas admin)
- Exportação de dados

## Decisions

### 1. `tournaments` como tabela nova com FK em `matches`

`matches` recebe coluna `tournament_id INTEGER NOT NULL REFERENCES tournaments(id)`. Migration cria torneio padrão "POX — Temporada 1" e associa todas as matches existentes a ele via `UPDATE matches SET tournament_id = 1`.

**Alternativa descartada:** campo opcional (`NULL` = global). Rejeitado porque cria dois estados para tratar e complica queries de leaderboard.

### 2. Leaderboard por torneio, sem leaderboard global

A rota `/api/leaderboard` é substituída por `/api/tournaments/:id/standings`. Não há ranking cross-tournament — o perfil do jogador exibe pontos/posição por torneio individualmente.

**Alternativa descartada:** leaderboard global acumulado. Rejeitado porque mistura torneios de tamanhos diferentes e distorce o ranking.

### 3. Rotas frontend flat (padrão do projeto)

Conforme o padrão existente (`getParentRoute: () => rootRoute`, caminhos absolutos), todas as novas rotas são siblings do rootRoute:
- `/campeonatos` — lista de torneios
- `/campeonatos/$tournamentId` — detalhe + standings
- `/jogadores/$playerId` — perfil do jogador
- `/admin/tournaments` — admin CRUD
- `/admin/tournaments/$tournamentId/matches` — rodadas do torneio (substitui `/admin/matches/$matchId`)

### 4. Admin com contexto de torneio selecionado

O dashboard admin exibe a lista de torneios. Clicar num torneio leva ao gerenciamento de suas rodadas. A criação de rodada sempre exige `tournament_id` explícito (passado via URL param).

### 5. Status do torneio: `active` | `finished`

Torneios `finished` são somente-leitura no admin (não aceita novas rodadas). A listagem pública mostra ambos, com badge de status.

## Risks / Trade-offs

- **Breaking migration**: coluna `tournament_id NOT NULL` em `matches` — a migration deve ser atômica (INSERT torneio padrão + UPDATE matches + ALTER TABLE ou recreate table, pois D1/SQLite não suporta ADD COLUMN NOT NULL sem default em tabelas com dados). Solução: usar `DEFAULT 1` temporariamente durante a migration.
- **Route tree manual**: o `routeTree.gen.ts` é gerenciado manualmente; cada nova rota precisa ser adicionada explicitamente.
- **Leaderboard atual quebra**: a rota `/api/leaderboard` sumirá — qualquer cliente externo que a consuma quebrará. Aceitável dado que não há API pública documentada.

## Migration Plan

1. Criar migration `0002_tournaments.sql`:
   - `CREATE TABLE tournaments (...)`
   - `ALTER TABLE matches ADD COLUMN tournament_id INTEGER REFERENCES tournaments(id) DEFAULT 1`
   - `INSERT INTO tournaments (id, name, status) VALUES (1, 'POX — Temporada 1', 'finished')`
   - `UPDATE matches SET tournament_id = 1` (garante consistência)
2. Atualizar `seed_local.sql` para incluir torneio padrão
3. Implementar backend → frontend em ordem: rotas de torneio → refatorar matches → perfil de jogador
4. Rollback: reverter migration e restaurar rota `/api/leaderboard`

## Open Questions

- O nome do torneio padrão criado pela migration ("POX — Temporada 1") está correto, ou o usuário prefere outro nome? (pode ser editado via admin após o deploy)
- Deseja ordenar a lista pública de torneios por data de criação (mais recente primeiro) ou por status (ativos no topo)?
