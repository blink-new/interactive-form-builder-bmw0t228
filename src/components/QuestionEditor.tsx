
import { useState } from 'react'
import { Question } from '../lib/supabase'
import { Card, CardContent, CardFooter } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Grip, Trash2, Plus, Minus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface QuestionEditorProps {
  question: Question
  index: number
  updateQuestion: (data: Partial<Question>) => void
  removeQuestion: () => void
}

export function QuestionEditor({ question, index, updateQuestion, removeQuestion }: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(true)

  function handleTypeChange(type: Question['question_type']) {
    updateQuestion({ 
      question_type: type,
      options: type === 'short_text' ? null : (question.options || ['Option 1', 'Option 2', 'Option 3'])
    })
  }

  function handleOptionChange(index: number, value: string) {
    if (!question.options) return
    
    const newOptions = [...question.options]
    newOptions[index] = value
    updateQuestion({ options: newOptions })
  }

  function addOption() {
    if (!question.options) return
    
    updateQuestion({ 
      options: [...question.options, `Option ${question.options.length + 1}`] 
    })
  }

  function removeOption(index: number) {
    if (!question.options || question.options.length <= 1) return
    
    const newOptions = question.options.filter((_, i) => i !== index)
    updateQuestion({ options: newOptions })
  }

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6 pb-2">
        <div className="flex items-start gap-2">
          <div className="mt-2 cursor-move">
            <Grip className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{index + 1}</span>
              </div>
              
              <Input
                value={question.question_text}
                onChange={(e) => updateQuestion({ question_text: e.target.value })}
                placeholder="Question text"
                className="flex-1 text-lg font-medium"
              />
              
              <Select
                value={question.question_type}
                onValueChange={(value) => handleTypeChange(value as Question['question_type'])}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_text">Short Text</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {expanded && (
              <div className="pl-10 space-y-4">
                {(question.question_type === 'multiple_choice' || question.question_type === 'dropdown') && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options?.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(i)}
                          disabled={question.options?.length === 1}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion({ required: checked })}
                  />
                  <Label htmlFor={`required-${question.id}`}>Required</Label>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={removeQuestion}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}