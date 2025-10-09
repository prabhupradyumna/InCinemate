"use client";
import { MobileMovieBrowser } from "@/components/customer/mobile-movie-browser"
import { MovieBrowser } from "@/components/customer/movie-browser"
import { MobileHeader } from "@/components/customer/mobile-header"
import { MobileBottomNav } from "@/components/customer/mobile-bottom-nav"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Mobile Movie Browser */}
        <div className="md:hidden">
          <MobileMovieBrowser />
        </div>
        
        {/* Desktop Movie Browser */}
        <div className="hidden md:block">
          <MovieBrowser />
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
      
      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}