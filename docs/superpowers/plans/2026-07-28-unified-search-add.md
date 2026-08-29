# Plano de Implementação: Unificação dos Campos de Busca e Adição

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIO: Use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam sintaxe de checkbox (`- [ ]`) para rastreamento.

**Objetivo:** Unificar os campos de "Buscar" e "Novo item" em um único campo no componente GroceryList, mantendo a busca existente e adicionando capacidade de adicionar itens.

**Arquitetura:** Adicionar novo estado `inputValue` para controlar o campo unificado, manter `searchQuery` para a busca com debounce, e modificar a UI para exibir botão "Adicionar" condicionalmente.

**Tech Stack:** React, TypeScript, Next.js, Tailwind CSS

---

## Mapeamento de Arquivos

- **Modificar:** `components/GroceryList.tsx` (componente principal)
- **Não criar:** Novos arquivos
- **Não modificar:** API, banco de dados, estilos globais

## Tarefas

### Task 1: Adicionar estado inputValue

**Arquivos:**
- Modificar: `components/GroceryList.tsx:54-68`

- [ ] **Step 1: Adicionar novo estado inputValue**

Após a linha 64 (`const [priceInputs, setPriceInputs] = useState<Record<number, string>>({})`), adicionar:

```typescript
const [inputValue, setInputValue] = useState('')
```

- [ ] **Step 2: Verificar que o estado foi adicionado**

Executar: `grep -n "inputValue" components/GroceryList.tsx`
Esperado: Linha com a declaração do estado

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: add inputValue state for unified search/add field"
```

### Task 2: Modificar campo de busca para usar inputValue

**Arquivos:**
- Modificar: `components/GroceryList.tsx:253-278`

- [ ] **Step 1: Atualizar input de busca para usar inputValue**

Substituir o bloco do input de busca (linhas 260-267) por:

```tsx
<input
  type="search"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  placeholder="Buscar…"
  suppressHydrationWarning
  className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-700 outline-hidden placeholder-zinc-400 focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:border-blue-500"
/>
```

- [ ] **Step 2: Verificar que o input está usando o novo estado**

Executar: `grep -n "inputValue" components/GroceryList.tsx`
Esperado: Input de busca usando `value={inputValue}` e `onChange={(e) => setInputValue(e.target.value)}`

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: update search input to use inputValue state"
```

### Task 3: Atualizar debounce para sincronizar inputValue com searchQuery

**Arquivos:**
- Modificar: `components/GroceryList.tsx:100-105`

- [ ] **Step 1: Modificar useEffect para sincronizar inputValue com searchQuery**

Substituir o bloco do useEffect (linhas 100-105) por:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setSearchQuery(inputValue)
  }, 300)
  return () => clearTimeout(timer)
}, [inputValue, fetchItems])
```

- [ ] **Step 2: Verificar que o debounce está funcionando**

Executar: `grep -n "setSearchQuery(inputValue)" components/GroceryList.tsx`
Esperado: Linha com a sincronização

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: sync inputValue with searchQuery using debounce"
```

### Task 4: Adicionar botão X para limpar campo

**Arquivos:**
- Modificar: `components/GroceryList.tsx:268-277`

- [ ] **Step 1: Modificar botão X para usar inputValue**

Substituir o bloco do botão X (linhas 268-277) por:

```tsx
{inputValue && (
  <button
    onClick={() => {
      setInputValue('')
      setSearchQuery('')
    }}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
  >
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
)}
```

- [ ] **Step 2: Verificar que o botão X está usando inputValue**

Executar: `grep -n "setInputValue('')" components/GroceryList.tsx`
Esperado: Botão X limpando inputValue

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: add clear button that resets inputValue and searchQuery"
```

### Task 5: Adicionar botão Adicionar condicional

**Arquivos:**
- Modificar: `components/GroceryList.tsx:268-278`

- [ ] **Step 1: Adicionar botão Adicionar após botão X**

Após o bloco do botão X, adicionar:

```tsx
{inputValue.trim() && (
  <button
    onClick={() => {
      addItem()
      setInputValue('')
    }}
    className="absolute right-12 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
  >
    Adicionar
  </button>
)}
```

- [ ] **Step 2: Verificar que o botão Adicionar está presente**

Executar: `grep -n "Adicionar" components/GroceryList.tsx`
Esperado: Botão Adicionar com onClick chamando addItem()

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: add conditional Adicionar button for unified field"
```

### Task 6: Remover campo de adição antigo

**Arquivos:**
- Modificar: `components/GroceryList.tsx:280-309`

- [ ] **Step 1: Remover toda a div do campo de adição**

Remover as linhas 280-309 (div com borda tracejada e input "Novo item"):

```tsx
<div className="mb-6 flex items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
  <input
    ref={inputRef}
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Novo item…"
    suppressHydrationWarning
    className="flex-1 bg-transparent text-base text-zinc-800 placeholder-zinc-400 outline-hidden dark:text-zinc-100 dark:placeholder-zinc-500"
  />
  {newName.trim() && (
    <>
      <button
        onClick={() => setNewName('')}
        className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        onClick={addItem}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Adicionar
      </button>
    </>
  )}
</div>
```

- [ ] **Step 2: Verificar que o campo foi removido**

Executar: `grep -n "Novo item" components/GroceryList.tsx`
Esperado: Nenhuma ocorrência

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: remove old add item field"
```

### Task 7: Remover estado newName

**Arquivos:**
- Modificar: `components/GroceryList.tsx:56`

- [ ] **Step 1: Remover declaração do estado newName**

Remover a linha 56:
```typescript
const [newName, setNewName] = useState('')
```

- [ ] **Step 2: Verificar que o estado foi removido**

Executar: `grep -n "newName" components/GroceryList.tsx`
Esperado: Nenhuma ocorrência

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: remove newName state"
```

### Task 8: Atualizar função addItem para usar inputValue

**Arquivos:**
- Modificar: `components/GroceryList.tsx:116-133`

- [ ] **Step 1: Modificar função addItem para limpar inputValue**

Substituir a função addItem (linhas 116-133) por:

```typescript
async function addItem() {
  if (!inputValue.trim()) return
  const res = await api('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: inputValue.trim() }),
  })
  if (res.status === 409) {
    const data = await res.json()
    setErrorMessage(data.error)
    return
  }
  if (res.ok) {
    setInputValue('')
    setSearchQuery('')
    fetchItems('')
    inputRef.current?.focus()
  }
}
```

- [ ] **Step 2: Verificar que a função está usando inputValue**

Executar: `grep -n "inputValue.trim()" components/GroceryList.tsx`
Esperado: Função addItem verificando inputValue

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: update addItem to use inputValue and clear on success"
```

### Task 9: Atualizar handleKeyDown para usar inputValue

**Arquivos:**
- Modificar: `components/GroceryList.tsx:211-213`

- [ ] **Step 1: Verificar se handleKeyDown ainda é necessário**

A função handleKeyDown atual chama addItem() quando Enter é pressionado. Como o campo de busca não deve adicionar items ao pressionar Enter (só busca), esta função pode ser removida.

Remover a função handleKeyDown (linhas 211-213):
```typescript
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Enter') addItem()
}
```

- [ ] **Step 2: Verificar que a função foi removida**

Executar: `grep -n "handleKeyDown" components/GroceryList.tsx`
Esperado: Nenhuma ocorrência

- [ ] **Step 3: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: remove handleKeyDown function"
```

### Task 10: Remover referências a newName em outros lugares

**Arquivos:**
- Modificar: `components/GroceryList.tsx`

- [ ] **Step 1: Buscar todas as referências a newName**

Executar: `grep -n "newName" components/GroceryList.tsx`
Esperado: Nenhuma ocorrência (já removido na Task 7)

- [ ] **Step 2: Verificar se há referências a setNewName**

Executar: `grep -n "setNewName" components/GroceryList.tsx`
Esperado: Nenhuma ocorrência

- [ ] **Step 3: Commit (se necessário)**

Se houver referências restantes, remova-as e faça commit.

### Task 11: Teste manual completo

**Arquivos:**
- Nenhum arquivo modificado

- [ ] **Step 1: Iniciar servidor de desenvolvimento**

Executar: `npm run dev`

- [ ] **Step 2: Testar busca**

1. Digitar no campo de busca
2. Verificar que resultados são filtrados
3. Clicar no botão X
4. Verificar que campo e resultados são limpos

- [ ] **Step 3: Testar adição**

1. Digitar um nome de item novo
2. Verificar que botão "Adicionar" aparece
3. Clicar em "Adicionar"
4. Verificar que item é adicionado e campo é limpo

- [ ] **Step 4: Testar item duplicado**

1. Digitar nome de item existente
2. Clicar em "Adicionar"
3. Verificar que modal de erro aparece

- [ ] **Step 5: Testar modo escuro**

1. Alternar para modo escuro
2. Verificar que campo e botões funcionam corretamente

- [ ] **Step 6: Testar responsividade**

1. Redimensionar navegador para tamanho mobile
2. Verificar que campo e botões não ultrapassam limites

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "feat: complete unified search/add field implementation"
```

## Notas de Implementação

1. **Debounce:** Mantido em 300ms para evitar muitas requisições ao servidor
2. **Estado:** `inputValue` controla o campo visual, `searchQuery` controla a busca
3. **UX:** Botão "Adicionar" só aparece quando há texto, evitando confusão
4. **Limpeza:** Botão X limpa ambos os estados (inputValue e searchQuery)
5. **Foco:** Após adicionar, foco retorna ao campo para facilitar múltiplas adições