# Adição de campos Preço, Quantidade, Data e Local aos itens

## Schema do Banco

Nova migration `002_add_item_fields.sql`:

```sql
ALTER TABLE items
  ADD COLUMN price DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN quantity INT DEFAULT NULL,
  ADD COLUMN date DATE DEFAULT NULL,
  ADD COLUMN location VARCHAR(50) DEFAULT NULL;
```

Itens existentes ficam com NULL em todos os campos — compatível com dados atuais.

## API

### GET /api/items
- Adicionar `price, quantity, date, location` ao SELECT
- A ordem permanece `acquired ASC, LOWER(name) ASC`

### POST /api/items
- Body aceita campos opcionais: `name` (obrigatório), `price`, `quantity`, `date`, `location`

### PATCH /api/items/[id]
- Body aceita campos opcionais: `name`, `acquired`, `price`, `quantity`, `date`, `location`

## UI — GroceryList.tsx

### Type
```ts
type Item = {
  id: number
  name: string
  acquired: number
  created_at: string
  price: number | null
  quantity: number | null
  date: string | null
  location: string | null
}
```

### Layout de cada item (2 linhas)

**Linha 1**: checkbox circular + nome do item (flex-1), editável por double-click (mantendo comportamento atual)

**Linha 2**: grid 4 colunas com gap pequeno:

| Campo      | Controle              | Formato                            |
|------------|-----------------------|------------------------------------|
| Preço      | `<input>` com máscara | R$ 1.234,56 (formatação onChange)  |
| Quantidade | `<input type="number">` | Número inteiro                    |
| Data       | `<input type="date">`   | ISO date                          |
| Local      | `<select>`             | Gigante, Rio Verde, Max, Condor, Atacadão, Circuito, Carrefour |

### Máscara de Preço

- Implementação nativa (sem dependências)
- Armazena valor em `number | null` (reais, ex: 12.50)
- Exibe formatado como moeda brasileira
- onChange: limpa não-dígitos, divide por 100, formata com `toLocaleString('pt-BR', {minimumFractionDigits: 2})`
- Salva via PATCH no onBlur

### Edição dos novos campos

- Todos os campos da linha 2 são editáveis diretamente
- Salvam automaticamente no onBlur via chamada PATCH
- Não precisam do modo "editMode" — são sempre visíveis e editáveis

## Arquivos alterados

- `migrations/002_add_item_fields.sql` (novo)
- `app/api/items/route.ts`
- `app/api/items/[id]/route.ts`
- `components/GroceryList.tsx`
