import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { theme } from "@/lib/theme"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className={`h-full transition-all ${theme.effects.cardHover}`}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className={`rounded-full bg-[${theme.colors.primary}]/10 p-3 w-fit mb-4`}>{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
