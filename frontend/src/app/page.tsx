import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          NumerAI
        </h1>
        <p className="text-2xl text-center mb-12 text-muted-foreground">
          Discover Your Life Path Through AI-Powered Numerology
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" variant="default">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}