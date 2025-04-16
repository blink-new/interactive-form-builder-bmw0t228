
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 border-t">
        <p>© {new Date().getFullYear()} Interactive Form Builder</p>
      </footer>
    </div>
  )
}