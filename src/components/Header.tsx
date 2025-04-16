
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { PlusCircle } from 'lucide-react'

export function Header() {
  const location = useLocation()
  const isFormBuilder = location.pathname.includes('/forms/') && location.pathname.includes('/edit')
  const isNewForm = location.pathname === '/forms/new'
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="text-xl font-bold text-primary">
          FormFlow
        </Link>
        
        <div className="flex items-center gap-4">
          {!isFormBuilder && !isNewForm && (
            <Link to="/forms/new">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Form
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}