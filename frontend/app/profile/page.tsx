"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/customer/mobile-header";
import { MobileBottomNav } from "@/components/customer/mobile-bottom-nav";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/customer/auth-provider";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Redirect non-logged in users
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
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
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
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
    );
  }

  // Don't render anything if user is not logged in (will redirect)
  if (!user) {
    return null;
  }

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
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">Hello Admin</p>
          </div>

          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6">
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
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
  );
}
