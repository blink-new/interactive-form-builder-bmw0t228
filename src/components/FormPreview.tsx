
import { useState } from 'react'
import { Form, Question } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FormPreviewProps {
  form: Form
  questions: Question[]
}

export function FormPreview({ form, questions }: FormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  function handleAnswerChange(questionId: string, value: any) {
    setAnswers({
      ...answers,
      [questionId]: value
    })
  }

  function nextStep() {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">Add questions to preview your form</p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1

  return (
    <Card className="max-w-2xl mx-auto">
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
        
        <Button onClick={nextStep}>
          {isLastStep ? 'Submit' : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}