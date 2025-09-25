"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Film } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  })
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password, formData.role as any)
      if (formData.role === "super-admin") router.push("/super-admin")
      else if (formData.role === "admin") router.push("/admin")
      else router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Film className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-foreground">ScreenLease</h1>
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="customer" onClick={() => setFormData((prev) => ({ ...prev, role: "customer" }))}>Customer</TabsTrigger>
                <TabsTrigger value="admin" onClick={() => setFormData((prev) => ({ ...prev, role: "admin" }))}>Admin</TabsTrigger>
                <TabsTrigger value="super-admin" onClick={() => setFormData((prev) => ({ ...prev, role: "super-admin" }))}>Super Admin</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="bg-background border-border/50 text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required className="bg-background border-border/50 text-foreground pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (<EyeOff className="h-4 w-4 text-muted-foreground" />) : (<Eye className="h-4 w-4 text-muted-foreground" />)}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link></p>
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-2">Demo Credentials:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Customer:</strong> customer@demo.com / password</p>
                  <p><strong>Admin:</strong> admin@demo.com / password</p>
                  <p><strong>Super Admin:</strong> superadmin@demo.com / password</p>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
