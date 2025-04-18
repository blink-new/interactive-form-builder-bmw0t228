
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { supabase, type Form, type Question, handleSupabaseError } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Label } from '../components/ui/label'
import { QuestionEditor } from '../components/QuestionEditor'
import { FormPreview } from '../components/FormPreview'
import { Save, Eye, Plus, ArrowLeft, Share2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function FormBuilder() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const isEditing = !!formId
  
  const [form, setForm] = useState<Form>({
    id: formId || uuidv4(),
    title: 'Untitled Form',
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published: false,
    public_url: null,
  })
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState('edit')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Check Supabase connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Load form data if editing
  useEffect(() => {
    if (isEditing) {
      loadForm()
    }
  }, [formId])

  // Check Supabase connection
  async function checkConnection() {
    try {
      const { error } = await supabase.from('forms').select('id').limit(1);
      if (error) {
        console.error('Connection check failed:', error);
        setConnectionError(`Database connection error: ${error.message}`);
        toast.error('Failed to connect to the database');
      } else {
        setConnectionError(null);
      }
    } catch (err) {
      console.error('Connection check exception:', err);
      setConnectionError('Failed to connect to the database');
      toast.error('Failed to connect to the database');
    }
  }

  async function loadForm() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading form with ID:', formId);
      
      // Load form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single()
      
      if (formError) {
        console.error('Form load error:', formError)
        throw formError
      }
      
      console.log('Form data loaded:', formData);
      
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_number', { ascending: true })
      
      if (questionsError) {
        console.error('Questions load error:', questionsError)
        throw questionsError
      }
      
      console.log('Questions loaded:', questionsData);
      
      setForm(formData)
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error loading form:', error)
      const errorMessage = handleSupabaseError(error)
      setError(errorMessage)
      toast.error(`Failed to load form: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  async function saveForm() {
    try {
      setSaving(true)
      setError(null)
      
      console.log('Saving form:', form)
      
      // Update form with current timestamp
      const formToSave = {
        ...form,
        updated_at: new Date().toISOString()
      };
      
      // Insert or update the form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .upsert(formToSave)
        .select()
      
      if (formError) {
        console.error('Form save error:', formError)
        throw formError
      }
      
      console.log('Form saved successfully:', formData)
      
      // Save each question
      for (const question of questions) {
        console.log('Saving question:', question)
        
        const questionToSave = {
          ...question,
          form_id: form.id,
          updated_at: new Date().toISOString()
        };
        
        const { error: questionError } = await supabase
          .from('questions')
          .upsert(questionToSave)
        
        if (questionError) {
          console.error('Question save error:', questionError)
          throw questionError
        }
      }
      
      // Handle deleted questions if we're editing an existing form
      if (isEditing && questions.length > 0) {
        const questionIds = questions.map(q => q.id)
        
        console.log('Current question IDs:', questionIds)
        
        // Delete questions that are no longer in the form
        if (questionIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('form_id', form.id)
            .not('id', 'in', `(${questionIds.join(',')})`)
          
          if (deleteError) {
            console.error('Question delete error:', deleteError)
            throw deleteError
          }
        }
      }
      
      toast.success('Form saved successfully')
      
      if (!isEditing) {
        navigate(`/forms/${form.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      const errorMessage = handleSupabaseError(error)
      setError(errorMessage)
      toast.error(`Failed to save form: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  function addQuestion(type: Question['question_type']) {
    const newQuestion: Question = {
      id: uuidv4(),
      form_id: form.id,
      question_text: 'New Question',
      question_type: type,
      required: false,
      order_number: questions.length,
      options: type === 'short_text' ? null : ['Option 1', 'Option 2', 'Option 3'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    setQuestions([...questions, newQuestion])
  }

  function updateQuestion(id: string, data: Partial<Question>) {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...data, updated_at: new Date().toISOString() } : q
    ))
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter(q => q.id !== id))
  }

  function reorderQuestions(reorderedQuestions: Question[]) {
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order_number: index,
      updated_at: new Date().toISOString()
    }))
    
    setQuestions(updatedQuestions)
  }

  async function publishForm() {
    try {
      setSaving(true)
      setError(null)
      
      // Generate a public URL if not already set
      const publicUrl = form.public_url || uuidv4().substring(0, 8);
      
      const { error } = await supabase
        .from('forms')
        .update({ 
          published: true,
          public_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', form.id)
      
      if (error) {
        console.error('Form publish error:', error)
        throw error
      }
      
      // Update local state
      setForm({
        ...form,
        published: true,
        public_url: publicUrl
      });
      
      toast.success('Form published successfully')
    } catch (error) {
      console.error('Error publishing form:', error)
      const errorMessage = handleSupabaseError(error)
      setError(errorMessage)
      toast.error(`Failed to publish form: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  function copyShareLink() {
    if (form.public_url) {
      const url = `${window.location.origin}/f/${form.public_url}`
      navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            {isEditing ? 'Edit Form' : 'Create Form'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {form.published && form.public_url && (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          
          {isEditing && !form.published && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={publishForm}
              disabled={saving || questions.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          
          <Button 
            onClick={saveForm} 
            disabled={saving || !!connectionError}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {connectionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Database Connection Error</p>
            <p className="text-sm">{connectionError}</p>
            <p className="text-sm mt-1">
              Please check your Supabase connection and make sure the database is properly set up.
              <Button 
                variant="link" 
                size="sm" 
                className="text-red-700 p-0 h-auto font-medium" 
                onClick={checkConnection}
              >
                Retry Connection
              </Button>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter form title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter form description"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            {activeTab === 'edit' && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => addQuestion('short_text')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('multiple_choice')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Multiple Choice
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('dropdown')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dropdown
                </Button>
              </div>
            )}
          </div>
          
          <TabsContent value="edit" className="space-y-4">
            {questions.length === 0 ? (
              <Card className="border-dashed border-2 p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No questions yet</h3>
                  <p className="text-sm text-gray-500">
                    Add your first question to get started
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => addQuestion('short_text')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    updateQuestion={(data) => updateQuestion(question.id, data)}
                    removeQuestion={() => removeQuestion(question.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview">
            <FormPreview form={form} questions={questions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}