"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ColorSwatchProps {
  className: string
  label: string
  hslValue?: string
  showShades?: boolean
}

function ColorSwatch({ className, label, hslValue, showShades = false }: ColorSwatchProps) {
  const opacityValues = [
    { value: 100, class: "opacity-100" },
    { value: 75, class: "opacity-75" },
    { value: 50, class: "opacity-50" },
    { value: 25, class: "opacity-25" },
    { value: 10, class: "opacity-10" },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-1.5">
        <div className={`h-24 w-24 rounded-md ${className}`} />
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          {hslValue && (
            <p className="text-xs text-muted-foreground font-mono">
              hsl({hslValue})
            </p>
          )}
        </div>
      </div>
      
      {showShades && (
        <div className="flex gap-1">
          {opacityValues.map(({ value, class: opacityClass }) => (
            <TooltipProvider key={value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`${className} h-6 w-6 rounded-md ${opacityClass}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Opacity: {value}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UIKitPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">UI Kit</h1>
        <p className="text-muted-foreground">Design system and component library</p>
      </div>

      {/* Color Palette Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <ColorSwatch 
            className="bg-primary" 
            label="primary" 
            hslValue="var(--primary)"
            showShades 
          />
          <ColorSwatch 
            className="bg-secondary" 
            label="secondary" 
            hslValue="var(--secondary)"
            showShades 
          />
          <ColorSwatch 
            className="bg-accent" 
            label="accent" 
            hslValue="var(--accent)"
            showShades 
          />
          <ColorSwatch 
            className="bg-muted" 
            label="muted" 
            hslValue="var(--muted)"
            showShades 
          />
          <ColorSwatch 
            className="bg-destructive" 
            label="destructive" 
            hslValue="var(--destructive)"
            showShades 
          />
          <ColorSwatch 
            className="bg-background border" 
            label="background" 
            hslValue="var(--background)"
            showShades 
          />
          <ColorSwatch 
            className="bg-foreground" 
            label="foreground" 
            hslValue="var(--foreground)"
            showShades 
          />
          <ColorSwatch 
            className="bg-card border" 
            label="card" 
            hslValue="var(--card)"
            showShades 
          />
        </div>
      </Card>

      {/* Components Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Components</h2>
        <Accordion type="single" collapsible className="w-full">
          
          {/* Buttons */}
          <AccordionItem value="buttons">
            <AccordionTrigger>Buttons</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Alerts */}
          <AccordionItem value="alerts">
            <AccordionTrigger>Alerts</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Default Alert</AlertTitle>
                  <AlertDescription>
                    This is a default alert message.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Destructive Alert</AlertTitle>
                  <AlertDescription>
                    This is a destructive alert message.
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Form Elements */}
          <AccordionItem value="form">
            <AccordionTrigger>Form Elements</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" placeholder="Email" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>

                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Badges */}
          <AccordionItem value="badges">
            <AccordionTrigger>Badges</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </Card>
    </div>
  )
} 