

import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className={`h-full transition-all card-hover-effect`}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className={`rounded-full bg-primary/10 p-3 w-fit mb-4`}>{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
