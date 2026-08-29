# Design: Unificação dos Campos de Busca e Adição

## Visão Geral

Unificar os campos de "Buscar" e "Novo item" em um único campo no componente `GroceryList`. O campo busca enquanto digita (com debounce) e exibe um botão "Adicionar" quando há texto, permitindo cadastrar novos itens.

## Objetivo

- Simplificar a interface removendo um campo separado
- Manter a funcionalidade de busca existente
- Adicionar capacidade de adicionar itens diretamente do campo de busca
- Melhorar a experiência do usuário em dispositivos móveis

## Escopo

- Componente: `components/GroceryList.tsx`
- Estado: Adicionar `inputValue`, remover `newName`
- UI: Remover campo "Novo item", modificar campo de busca

## Design Detalhado

### Estados do Campo

#### Estado 1: Campo vazio
- Exibe placeholder "Buscar…"
- Apenas busca está ativa
- Botão "Adicionar" não aparece

#### Estado 2: Campo com texto
- Exibe texto digitado
- Busca é executada com debounce de 300ms
- Botão "Adicionar" aparece ao lado direito
- Botão X para limpar aparece entre o texto e o botão

#### Estado 3: Após adicionar
- Campo é limpo (`inputValue` = '')
- Resultados da busca são mantidos
- Foco retorna ao campo

### Fluxo de Dados

```
inputValue → estado do campo (o que o usuário digita)
searchQuery → estado da busca (atualizado com debounce)

1. Usuário digita → inputValue atualiza
2. Debounce 300ms → searchQuery = inputValue
3. Clica "Adicionar" → addItem(inputValue)
4. Após adicionar → inputValue = ''
```

### Mudanças no Código

#### Adições
- Novo estado: `inputValue` (string)
- Botão "Adicionar" condicional (aparece quando `inputValue.trim()`)
- Função `handleAdd()` separada de `addItem()`

#### Remoções
- Campo "Novo item" inteiro (div com borda tracejada)
- Estado `newName`
- Borda tracejada do campo de adição

#### Modificações
- Campo de busca: adicionar botão "Adicionar" e botão X
- Lógica de busca: usar `inputValue` em vez de `searchQuery` para o input
- Função `addItem()`: aceitar parâmetro de nome (senão usar `inputValue`)

### Comportamento

#### Busca
- Enquanto o usuário digita, `inputValue` é atualizado
- A cada 300ms (debounce), `searchQuery` é atualizado com o valor de `inputValue`
- Resultados são filtrados no servidor via GET /api/items?q=term

#### Adição
- Botão "Adicionar" só aparece quando `inputValue.trim()` não está vazio
- Ao clicar, chama `addItem()` com o valor de `inputValue`
- Após adicionar, `inputValue` é limpo
- Se o item já existir (409), exibe modal de erro

#### Limpeza
- Botão X aparece quando `inputValue` não está vazio
- Ao clicar, limpa `inputValue` e `searchQuery`
- Remove resultados de busca

### Acessibilidade

- Campo mantém `type="search"` para acessibilidade
- Botões têm `aria-label` apropriados
- Foco manageado corretamente (após adicionar, retorna ao campo)

### Responsividade

- Campo funciona bem em telas pequenas
- Botões não ultrapassam os limites do container
- Texto não é truncado em telas estreitas

## Critérios de Aceite

1. Campo de busca e adição são unificados em um só componente
2. Busca funciona com debounce de 300ms (comportamento existente)
3. Botão "Adicionar" aparece apenas quando há texto no campo
4. Adicionar item limpa o campo após sucesso
5. Erro de item duplicado continua exibindo modal
6. Botão X limpa o campo e resultados de busca
7. Funciona em modo escuro e claro
8. Responsivo em dispositivos móveis

## Fora do Escopo

- Alterações na API existente
- Modificação no schema do banco de dados
- Adição de novos campos ao formulário de item
- Alterações no comportamento de edição/exclusão