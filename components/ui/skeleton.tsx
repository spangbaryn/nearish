import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-[pulse_1s_ease-in-out_infinite] rounded-md bg-gray-100/70", className)}
      {...props}
    />
  )
}

export { Skeleton }
