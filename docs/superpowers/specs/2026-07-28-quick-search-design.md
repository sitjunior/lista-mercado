# Quick Search — Busca rápida na lista de mercado

## Descrição

Adicionar um campo de busca textual que filtra itens no servidor via `LIKE` no banco de dados, com debounce de 300ms para feedback instantâneo.

## Especificação

### API — `GET /api/items`

- Adicionar parâmetro opcional `q` (query string)
- Se presente, a query SQL ganha um `WHERE name LIKE ?` com valor `%termo%`
- Ordenação inalterada: `ORDER BY acquired ASC, LOWER(name) ASC`
- Se `q` vazio ou ausente, retorna todos os itens (comportamento atual)

### Componente — `GroceryList.tsx`

- Novo estado `searchQuery` (`string`, default `''`)
- Input de busca posicionado entre o título "Mercado" e o bloco "Novo item"
- Ícone de lupa (SVG) dentro do campo à esquerda
- Placeholder: "Buscar…"
- `fetchItems` aceita parâmetro opcional `q`. Se fornecido, passa `?q=` na requisição.
- `useEffect` com `setTimeout`/`clearTimeout` (debounce de 300ms) observa `searchQuery` e chama `fetchItems(searchQuery)`
- Se `searchQuery` está vazio após debounce, chama `fetchItems()` sem parâmetro (todos itens)
- Resultados mantêm agrupamento existente: "Pendentes — N" e "Adquiridos — N"
- Se a busca retornar 0 resultados, exibir mensagem "Nenhum item encontrado" no lugar da lista

## Arquivos alterados

- `app/api/items/route.ts` — adicionar filtro `WHERE name LIKE`
- `components/GroceryList.tsx` — adicionar input de busca com debounce
