import GroceryList from '@/components/GroceryList'

export default async function ListPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4">
        <h1 className="mb-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Lista de Mercado
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Acesso restrito
        </p>
      </div>
    )
  }

  return <GroceryList />
}
