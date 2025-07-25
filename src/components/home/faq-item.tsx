import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FaqItemProps {
  question: string
  answer: string
  delay?: number
}

export function FaqItem({ question, answer, delay = 0 }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="overflow-hidden transition-all">
        <CardContent className="p-0">
          <motion.button
            className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.99 }}
          >
            <h3 className="text-lg font-medium">{question}</h3>
            {isOpen ? (
              <ChevronUp className={`h-5 w-5 text-primary`} />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </motion.button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="px-4 pb-4"
              >
                <p className="text-gray-600">{answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
