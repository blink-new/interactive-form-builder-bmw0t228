
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, type Form, type Question, type Response } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { ArrowLeft, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

export function FormResponses() {
  const { formId } = useParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (formId) {
      loadFormAndResponses()
    }
  }, [formId])

  async function loadFormAndResponses() {
    try {
      setLoading(true)
      
      // Load form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single()
      
      if (formError) throw formError
      
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_number', { ascending: true })
      
      if (questionsError) throw questionsError
      
      // Load responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false })
      
      if (responsesError) throw responsesError
      
      setForm(formData)
      setQuestions(questionsData || [])
      setResponses(responsesData || [])
    } catch (error) {
      console.error('Error loading form and responses:', error)
      toast.error('Failed to load responses')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  function exportToCsv() {
    if (!form || !questions.length || !responses.length) return
    
    // Create CSV header row
    const headers = ['Submission Date', ...questions.map(q => q.question_text)]
    
    // Create CSV rows for each response
    const rows = responses.map(response => {
      const row = [format(new Date(response.created_at), 'yyyy-MM-dd HH:mm:ss')]
      
      questions.forEach(question => {
        const answer = response.response_data[question.id] || ''
        row.push(answer)
      })
      
      return row
    })
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <p className="mt-2 text-gray-500">The form you're looking for doesn't exist</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Go back to dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Responses: {form.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {form.published && form.public_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/f/${form.public_url}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                View Form
              </a>
            </Button>
          )}
          
          {responses.length > 0 && (
            <Button size="sm" onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Summary</CardTitle>
          <CardDescription>
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No responses yet</h3>
              <p className="mt-2 text-gray-500">
                Share your form to start collecting responses
              </p>
              {form.published && form.public_url && (
                <Button className="mt-4" asChild>
                  <a href={`/f/${form.public_url}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View Form
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {questions.map(question => (
                      <TableHead key={question.id}>{question.question_text}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map(response => (
                    <TableRow key={response.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(response.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      {questions.map(question => (
                        <TableCell key={question.id}>
                          {response.response_data[question.id] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}