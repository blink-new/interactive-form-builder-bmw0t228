
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Form } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Pencil, Trash2, BarChart, Eye, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForms() {
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .order('updated_at', { ascending: false })
        
        if (error) throw error
        setForms(data || [])
      } catch (error) {
        console.error('Error loading forms:', error)
      } finally {
        setLoading(false)
      }
    }

    loadForms()
  }, [])

  async function deleteForm(id: string) {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setForms(forms.filter(form => form.id !== id))
    } catch (error) {
      console.error('Error deleting form:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
        <Link to="/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100 rounded-t-lg" />
              <CardContent className="h-20 mt-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card className="border-dashed border-2 p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No forms yet</CardTitle>
            <CardDescription>Create your first form to get started</CardDescription>
            <Link to="/forms/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Form
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="truncate">{form.title}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  Updated {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {form.description || 'No description'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/forms/${form.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/forms/${form.id}/responses`}>
                      <BarChart className="h-4 w-4 mr-1" />
                      Responses
                    </Link>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {form.published && form.public_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/f/${form.public_url}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteForm(form.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}