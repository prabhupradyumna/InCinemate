"use client";

import { ReactNode } from "react";
import { MobileHeader } from "@/components/customer/mobile-header";
import { MobileBottomNav } from "@/components/customer/mobile-bottom-nav";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      {/* Main Content */}
      <main className={`container mx-auto px-4 py-8 ${showBottomNav ? 'pb-20 md:pb-8' : 'pb-8'}`}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}
