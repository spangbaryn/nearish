"use client"

import { useState, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pipette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onOpenChange?: (open: boolean) => void
}

export function ColorPicker({ color, onChange, onOpenChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hexValue, setHexValue] = useState(color)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setHexValue(newColor)
    onChange(newColor)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (value.startsWith('#')) value = value.slice(1)
    value = value.slice(0, 6)
    setHexValue(`#${value}`)
    if (value.length === 6) {
      onChange(`#${value}`)
    }
  }

  const handleEyeDropper = async () => {
    // @ts-ignore - EyeDropper API is not in TypeScript yet
    const eyeDropper = new EyeDropper()
    try {
      const result = await eyeDropper.open()
      setHexValue(result.sRGBHex)
      onChange(result.sRGBHex)
    } catch (e) {
      console.log('User canceled the eye dropper')
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger asChild onClick={() => handleOpenChange(true)}>
        <Button 
          variant="outline" 
          size="icon"
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" onInteractOutside={(e) => {
        e.preventDefault()
        handleOpenChange(false)
      }}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="color"
              value={hexValue}
              onChange={handleColorChange}
              className="w-full h-8"
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={handleEyeDropper}
            >
              <Pipette className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={hexValue}
              onChange={handleHexInput}
              placeholder="#000000"
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => handleOpenChange(false)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 