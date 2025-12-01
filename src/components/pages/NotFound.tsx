import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-2xl">Sahifa topilmadi</p>
      <Link 
        to="/" 
        className="rounded-lg bg-primary px-8 py-4 text-lg text-primary-foreground hover:bg-primary/90"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}