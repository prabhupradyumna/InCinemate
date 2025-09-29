"use client";
import { MovieBrowser } from "@/components/movie-browser"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MovieBrowser />
      </main>
      <Footer />
    </div>
  );
}
