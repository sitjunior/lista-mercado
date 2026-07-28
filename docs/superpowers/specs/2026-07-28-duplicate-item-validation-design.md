# Duplicate Item Validation

## Descrição

Impedir o cadastro de itens repetidos na lista de mercado, validando duplicidade no servidor e exibindo um modal de erro no cliente.

## Especificação

### API — `POST /api/items`

- Antes de inserir, executar `SELECT id FROM items WHERE LOWER(name) = LOWER(?)`
- Se já existir, retornar `{ error: "Item já cadastrado!" }` com status 409
- Se não existir, prosseguir com a inserção normalmente

### Componente — `GroceryList.tsx`

- Em `addItem()`, verificar `res.status === 409`
- Se for 409, exibir um modal com a mensagem de erro
- Modal: overlay fixo (inset-0) com fundo bg-black/50, caixa centralizada bg-white dark:bg-zinc-900 com padding, texto "Item já cadastrado!" e botão "OK" que fecha o modal

## Arquivos alterados

- `app/api/items/route.ts` — adicionar verificação de duplicidade no POST
- `components/GroceryList.tsx` — adicionar modal de erro

## Comportamento

- Comparação case-insensitive (LOWER)
- Modal não bloqueia o input — usuário pode corrigir e tentar novamente
- Apenas valida o nome, não considera outros campos
