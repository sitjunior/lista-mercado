# Persistência de Tema e Tamanho de Fonte — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar botões A+/A- para controle de tamanho de fonte e persistir tema (dark/light) e escala de fonte em cookies, eliminando flash de tema ao carregar.

**Architecture:** CSS variable `--font-scale` no `<html>` controla o tamanho base da fonte. Cookies `theme` e `font-scale` são lidos no `layout.tsx` (server component) antes do render, aplicando classe `dark` e estilo `--font-scale` diretamente no HTML. O componente `GroceryList.tsx` gerencia o estado local e sincroniza com cookies ao alterar.

**Tech Stack:** Next.js 16 (server components), React 19, Tailwind CSS v4, cookies API do Next.js

---

## Arquivos Afetados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/globals.css` | Adicionar CSS variable `--font-scale` com valor padrão |
| `app/layout.tsx` | Ler cookies `theme` e `font-scale`, aplicar classe `dark` + `style` no `<html>` |
| `components/GroceryList.tsx` | Adicionar botões A+/A-, estado `fontScale`, ler/escrever cookies |

---

### Task 1: Adicionar CSS variable `--font-scale` no globals.css

**Files:**
- Modify: `app/globals.css:11-14`

- [ ] **Step 1: Adicionar `--font-scale` ao `:root`**

No `app/globals.css`, adicionar `--font-scale: 1;` dentro de `:root`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --font-scale: 1;
}
```

- [ ] **Step 2: Aplicar `--font-scale` no `body`**

No mesmo arquivo, adicionar `font-size: calc(16px * var(--font-scale));` na regra `body`:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  font-size: calc(16px * var(--font-scale));
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 2: Modificar `layout.tsx` para ler cookies e aplicar tema + fonte

**Files:**
- Modify: `app/layout.tsx:27-40`

- [ ] **Step 1: Importar `cookies` do `next/headers`**

Adicionar import no topo do arquivo:

```typescript
import { cookies } from "next/headers";
```

- [ ] **Step 2: Ler cookies e aplicar no `<html>`**

Substituir a função `RootLayout` para ler cookies e aplicar classe `dark` + estilo `--font-scale`:

```typescript
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  const fontScaleCookie = cookieStore.get("font-scale");

  const isDark = themeCookie?.value === "dark";
  const fontScale = fontScaleCookie?.value || "1";

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
      style={{ "--font-scale": fontScale } as React.CSSProperties}
    >
      <body className="min-h-full bg-white dark:bg-zinc-900 font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 3: Adicionar estado `fontScale` e botões A+/A- no GroceryList

**Files:**
- Modify: `components/GroceryList.tsx:62-83` (declaração de estado + useEffect)
- Modify: `components/GroceryList.tsx:220-247` (header com botões)

- [ ] **Step 1: Adicionar estado `fontScale`**

Após a linha 62 (`const [dark, setDark] = useState(false)`), adicionar:

```typescript
const [fontScale, setFontScale] = useState(1)
```

- [ ] **Step 2: Modificar `useEffect` inicial para ler cookies**

Substituir o `useEffect` nas linhas 76-83 para também ler o cookie `font-scale` e aplicar:

```typescript
useEffect(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const hasClass = document.documentElement.classList.contains('dark')

  const storedTheme = document.cookie.split('; ').find(c => c.startsWith('theme='))
  const storedFont = document.cookie.split('; ').find(c => c.startsWith('font-scale='))

  const shouldDark = storedTheme
    ? storedTheme.split('=')[1] === 'dark'
    : hasClass || prefersDark

  if (shouldDark !== hasClass) {
    document.documentElement.classList.toggle('dark', shouldDark)
  }
  setDark(shouldDark)

  const scale = storedFont ? parseFloat(storedFont.split('=')[1]) : 1
  document.documentElement.style.setProperty('--font-scale', String(scale))
  setFontScale(scale)
}, [])
```

- [ ] **Step 3: Modificar `toggleDark` para persistir cookie**

Substituir a função `toggleDark` (linhas 85-91):

```typescript
function toggleDark() {
  setDark((prev) => {
    const next = !prev
    document.documentElement.classList.toggle('dark', next)
    document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`
    return next
  })
}
```

- [ ] **Step 4: Adicionar funções `increaseFont` e `decreaseFont`**

Após a função `toggleDark`, adicionar:

```typescript
const FONT_SCALES = [0.85, 1.0, 1.15, 1.3]

function changeFont(delta: number) {
  setFontScale((prev) => {
    const idx = FONT_SCALES.indexOf(prev)
    const nextIdx = idx + delta
    if (nextIdx < 0 || nextIdx >= FONT_SCALES.length) return prev
    const next = FONT_SCALES[nextIdx]
    document.documentElement.style.setProperty('--font-scale', String(next))
    document.cookie = `font-scale=${next}; path=/; max-age=31536000; SameSite=Lax`
    return next
  })
}
```

- [ ] **Step 5: Adicionar botões A+/A- no header**

No `return` do componente, localizar o `<div className="flex items-center gap-2">` (linha 220) e adicionar os botões de fonte **antes** do botão dark mode:

```tsx
<div className="flex items-center gap-2">
  <button
    onClick={() => changeFont(-1)}
    disabled={fontScale <= 0.85}
    className={`rounded-full p-2 text-sm font-bold transition-colors ${
      fontScale <= 0.85
        ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
    }`}
    aria-label="Diminuir fonte"
  >
    A-
  </button>
  <button
    onClick={() => changeFont(1)}
    disabled={fontScale >= 1.3}
    className={`rounded-full p-2 text-lg font-bold transition-colors ${
      fontScale >= 1.3
        ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
    }`}
    aria-label="Aumentar fonte"
  >
    A+
  </button>
  <button
    onClick={toggleDark}
    className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    aria-label="Alternar modo escuro/claro"
  >
```

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 4: Verificação final

- [ ] **Step 1: Build completo**

Run: `npm run build`
Expected: Build succeeds sem erros

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: Sem erros
