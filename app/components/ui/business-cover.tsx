"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ColorPicker } from "./color-picker"

interface BusinessCoverProps {
  color?: string
  className?: string
  onColorChange?: (color: string) => void
}

export function BusinessCover({ color = "#000000", className, onColorChange }: BusinessCoverProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  return (
    <div 
      className={cn(
        "w-full h-16 relative overflow-hidden bg-white group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isColorPickerOpen && setIsHovered(false)}
    >
      <div 
        className="absolute inset-0 blur-3xl opacity-40"
        style={{
          backgroundColor: color,
          backgroundImage: `
            linear-gradient(45deg, ${color} 25%, transparent 25%),
            linear-gradient(-45deg, ${color} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${color} 75%),
            linear-gradient(-45deg, transparent 75%, ${color} 75%),
            radial-gradient(circle at 50% 50%, ${color}, transparent 70%)
          `,
          backgroundSize: '100px 100px, 100px 100px, 100px 100px, 100px 100px, cover',
          backgroundPosition: '0 0, 0 50px, 50px -50px, -50px 0px, center center',
          animation: 'gradient-shift 8s linear infinite'
        }}
      />
      {onColorChange && (isHovered || isColorPickerOpen) && (
        <div className="absolute top-4 right-4 transition-opacity duration-200 z-10">
          <ColorPicker 
            color={color}
            onChange={onColorChange}
            onOpenChange={setIsColorPickerOpen}
          />
        </div>
      )}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0 0, 0 50px, 50px -50px, -50px 0px, center center;
          }
          100% {
            background-position: 200px 200px, 200px 250px, 250px 150px, 150px 200px, center center;
          }
        }
      `}</style>
    </div>
  )
} 