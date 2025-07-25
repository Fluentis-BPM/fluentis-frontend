
import React from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  delay?: number
}

export function StatsCard({ title, value, description, icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3, scale: 1.02 }}
    >
      <Card className="h-full transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-600">{title}</h3>
            {icon}
          </div>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
