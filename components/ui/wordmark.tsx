import Image from "next/image"

export function Wordmark() {
  return (
    <Image
      src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/wordmark.svg"}
      alt="Nearish Wordmark"
      width={120}
      height={35}
      className="h-7 w-auto"
      priority
    />
  )
} 