
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { supabase, type Form, type Question } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { QuestionEditor } from '../components/QuestionEditor'
import { FormPreview } from '../components/FormPreview'
import { Save, Eye, Plus, ArrowLeft, Share2 } from 'lucide-react'
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

  useEffect(() => {
    if (isEditing) {
      loadForm()
    }
  }, [formId])

  async function loadForm() {
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
      
      setForm(formData)
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error loading form:', error)
      toast.error('Failed to load form')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  async function saveForm() {
    try {
      setSaving(true)
      
      // Update form
      const { error: formError } = await supabase
        .from('forms')
        .upsert({
          ...form,
          updated_at: new Date().toISOString()
        })
      
      if (formError) throw formError
      
      // Update questions
      for (const question of questions) {
        const { error: questionError } = await supabase
          .from('questions')
          .upsert({
            ...question,
            form_id: form.id,
            updated_at: new Date().toISOString()
          })
        
        if (questionError) throw questionError
      }
      
      // Delete removed questions
      if (isEditing) {
        const questionIds = questions.map(q => q.id)
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('form_id', form.id)
          .not('id', 'in', `(${questionIds.join(',')})`)
        
        if (deleteError && questionIds.length > 0) throw deleteError
      }
      
      toast.success('Form saved successfully')
      
      if (!isEditing) {
        navigate(`/forms/${form.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('Failed to save form')
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
      
      const { error } = await supabase
        .from('forms')
        .update({ 
          published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', form.id)
      
      if (error) throw error
      
      // Reload form to get the public_url
      const { data, error: loadError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', form.id)
        .single()
      
      if (loadError) throw loadError
      
      setForm(data)
      toast.success('Form published successfully')
    } catch (error) {
      console.error('Error publishing form:', error)
      toast.error('Failed to publish form')
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
            disabled={saving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

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