import Image from "next/image"

export function Logo() {
  return (
    <Image
      src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
      alt="Nearish Logo"
      width={180}
      height={52}
      className="h-11 w-auto"
      priority
    />
  )
} 