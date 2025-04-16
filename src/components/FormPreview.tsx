
import { useState } from 'react'
import { Form, Question } from '../lib/supabase'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'

interface FormPreviewProps {
  form: Form
  questions: Question[]
}

export function FormPreview({ form, questions }: FormPreviewProps) {
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const sortedQuestions = [...questions].sort((a, b) => a.order_number - b.order_number)
  const currentQuestion = sortedQuestions[currentStep]
  const isLastStep = currentStep === sortedQuestions.length - 1
  const isFirstStep = currentStep === 0

  function handleInputChange(questionId: string, value: string) {
    setResponses({
      ...responses,
      [questionId]: value
    })
  }

  function handleNext() {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrevious() {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleSubmit() {
    console.log('Form responses:', responses)
    setSubmitted(true)
  }

  function handleReset() {
    setResponses({})
    setCurrentStep(0)
    setSubmitted(false)
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No questions added yet. Add some questions to preview your form.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-center">Thank You!</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-700 mb-6">Your response has been recorded.</p>
            <Button onClick={handleReset}>Submit Another Response</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="text-center">
          <h2 className="text-xl font-bold">{form.title}</h2>
          {form.description && (
            <p className="text-gray-500 mt-2">{form.description}</p>
          )}
        </div>
        <div className="w-full bg-gray-200 h-1 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-1 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / sortedQuestions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentQuestion && (
          <div className="py-4 space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                {currentQuestion.question_text}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              {currentQuestion.question_type === 'short_text' && (
                <Input
                  value={responses[currentQuestion.id] || ''}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder="Your answer"
                />
              )}
              
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                <RadioGroup
                  value={responses[currentQuestion.id] || ''}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                  className="space-y-2"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${currentQuestion.id}-${index}`} />
                      <Label htmlFor={`option-${currentQuestion.id}-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion.question_type === 'dropdown' && currentQuestion.options && (
                <Select
                  value={responses[currentQuestion.id] || ''}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option, index) => (
                      <SelectItem key={index} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={currentQuestion?.required && !responses[currentQuestion.id]}
        >
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}