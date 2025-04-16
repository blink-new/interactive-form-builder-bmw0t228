
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Form, type Question } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function FormView() {
  const { publicUrl } = useParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadForm()
  }, [publicUrl])

  async function loadForm() {
    try {
      setLoading(true)
      
      // Load form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('public_url', publicUrl)
        .eq('published', true)
        .single()
      
      if (formError) throw formError
      
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formData.id)
        .order('order_number', { ascending: true })
      
      if (questionsError) throw questionsError
      
      setForm(formData)
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error loading form:', error)
      toast.error('Form not found or not published')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswerChange(questionId: string, value: any) {
    setAnswers({
      ...answers,
      [questionId]: value
    })
  }

  function nextStep() {
    const currentQuestion = questions[currentStep]
    
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast.error('This question is required')
      return
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleSubmit() {
    if (!form) return
    
    // Validate all required questions
    const missingRequired = questions.filter(q => 
      q.required && !answers[q.id]
    )
    
    if (missingRequired.length > 0) {
      toast.error('Please answer all required questions')
      // Go to the first unanswered required question
      setCurrentStep(questions.findIndex(q => q.id === missingRequired[0].id))
      return
    }
    
    try {
      setSubmitting(true)
      
      const { error } = await supabase
        .from('responses')
        .insert({
          form_id: form.id,
          response_data: answers
        })
      
      if (error) throw error
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your response has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Form Not Found</CardTitle>
            <CardDescription>
              This form doesn't exist or hasn't been published.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg transition-all duration-300 ease-in-out">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">
                Question {currentStep + 1} of {questions.length}
              </div>
              <div className="text-sm font-medium">
                {Math.round(((currentStep + 1) / questions.length) * 100)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            
            {currentStep === 0 && (
              <>
                <CardTitle className="text-2xl mt-4">{form.title}</CardTitle>
                {form.description && (
                  <CardDescription className="mt-2">{form.description}</CardDescription>
                )}
              </>
            )}
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="text-lg font-medium">
                {currentQuestion.question_text}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              
              {currentQuestion.question_type === 'short_text' && (
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px]"
                />
              )}
              
              {currentQuestion.question_type === 'multiple_choice' && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${currentQuestion.id}-${i}`} />
                      <Label htmlFor={`option-${currentQuestion.id}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion.question_type === 'dropdown' && (
                <Select
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((option, i) => (
                      <SelectItem key={i} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={nextStep} disabled={submitting}>
              {isLastStep ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}