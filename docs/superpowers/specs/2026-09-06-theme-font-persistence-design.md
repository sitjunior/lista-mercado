# Design: Persistência de Tema e Tamanho de Fonte

## Visão Geral

Adicionar controle de tamanho de fonte (A+/A-) ao lado do toggle dark mode e persistir ambas as preferências (tema e fonte) em cookies, eliminando flashes de tema ao carregar a página.

## Funcionalidades

### 1. Controle de Tamanho de Fonte

- Dois botões `A-` e `A+` posicionados à esquerda do toggle dark mode no header
- 4 níveis de escala: `0.85` (pequeno), `1.0` (padrão), `1.15` (grande), `1.3` (extra grande)
- Estado: `fontScale` (number), inicializado a partir do cookie `font-scale`
- A CSS variable `--font-scale` é aplicada no elemento `<html>` e usada para escalar o `font-size` base

### 2. Persistência em Cookies

| Cookie       | Valor              | Default  | Leitura              |
|--------------|--------------------|----------|----------------------|
| `theme`      | `dark` ou `light`  | (system) | layout.tsx + client  |
| `font-scale` | `0.85`/`1.0`/`1.15`/`1.3` | `1.0` | layout.tsx + client  |

- Cookies são definidos com `path=/`, `max-age=31536000` (1 ano), `SameSite=Lax`
- No **layout.tsx** (server component): lê cookies via `cookies()`, aplica classe `dark` no `<body>` e CSS variable `--font-scale` via `style`
- No **GroceryList.tsx** (client): lê cookies no `useEffect` inicial, sincroniza estado com DOM e cookies ao alterar

### 3. Resolução de Preferência

Ordem de prioridade para tema:
1. Cookie `theme` (se existir)
2. Preferência do sistema (`prefers-color-scheme`)

Ordem de prioridade para fonte:
1. Cookie `font-scale` (se existir)
2. `1.0` (padrão)

## Arquivos Afetados

- `app/layout.tsx` — Lê cookies no server, aplica classe `dark` e `--font-scale` no `<html>`
- `components/GroceryList.tsx` — Adiciona botões A+/A-, gerencia estado `fontScale`, lê/escreve cookies
- `app/globals.css` (opcional) — Adiciona CSS variable base se necessário

## UX

Header atual:
```
[☀️/🌙] [Editar]
```

Header proposto:
```
[A-] [A+] [☀️/🌙] [Editar]
```

- Botões de fonte seguem o mesmo estilo visual do toggle dark (rounded-full, p-2, mesmas cores)
- Ícones: `A-` com `text-xs`, `A+` com `text-lg` para diferenciar visualmente
- Desabilitar `A-` no menor nível e `A+` no maior nível (opacity reduzida, cursor not-allowed)

## Restrições

- Não usar localStorage (cookie é melhor para SSR sem flash)
- Não exceder 4 níveis de fonte (manter simples)
- Manter compatibilidade com dark mode existente
- Mobile-first: botões devem ser tocáveis (min 44px tap target)
