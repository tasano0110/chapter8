'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-100 p-4">
        <nav className="space-y-2">
          <Link 
            href="/admin/posts" 
            className={`block px-3 py-2 rounded hover:bg-gray-200 ${
              pathname.startsWith('/admin/posts') ? 'font-bold underline' : ''
            }`}
          >
            記事一覧
          </Link>
          <Link 
            href="/admin/categories" 
            className={`block px-3 py-2 rounded hover:bg-gray-200 ${
              pathname.startsWith('/admin/categories') ? 'font-bold underline' : ''
            }`}
          >
            カテゴリー一覧
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-white">
        <div className="text-xs text-gray-500 mb-4">
          {pathname}
        </div>
        {children}
      </main>
    </div>
  )
}