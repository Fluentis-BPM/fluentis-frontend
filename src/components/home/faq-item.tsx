import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"


interface FaqItemProps {
  question: string
  answer: string
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="overflow-hidden transition-all">
      <CardContent className="p-0">
        <button
          className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-lg font-medium">{question}</h3>
          {isOpen ? (
            <ChevronUp className={`h-5 w-5 text-primary`} />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <div
          className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <p className="text-gray-600">{answer}</p>
        </div>
      </CardContent>
    </Card>
  )
}
