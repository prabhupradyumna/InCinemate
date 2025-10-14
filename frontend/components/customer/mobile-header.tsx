"use client";

import { Search, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CITIES = [
  "Dubai",
];

export function MobileHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const router = useRouter();

  // Load city from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("app_city");
    if (savedCity && CITIES.includes(savedCity)) {
      setSelectedCity(savedCity);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("app_city", city);

    // Dispatch custom event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("city-change", {
          detail: city,
        })
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/BooknWatch - Icon.png"
              alt="BookNWatch Logo"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              BooknWatch
            </h1>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </form>

          {/* Location */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">
                {selectedCity}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {CITIES.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={
                    selectedCity === city
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
