"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Film } from "lucide-react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/components/customer/auth-provider";
import { useRouter } from "next/navigation";
import { requestCustomerOtp, verifyCustomerOtp } from "@/lib/api";
import { useEffect } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [otpPhase, setOtpPhase] = useState<"request" | "verify">("request");
  const [otpForm, setOtpForm] = useState({
    email: "",
    phone: "",
    code: "",
    channel: "email" as "email" | "sms",
  });
  const [resendSeconds, setResendSeconds] = useState(0);
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    code?: string;
  }>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.role as any);
      if (formData.role === "super-admin") router.push("/super-admin");
      else if (formData.role === "admin") router.push("/admin");
      else router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // simple validation
      const nextErrors: typeof errors = {};
      if (otpForm.channel === "sms") {
        if (!otpForm.phone) nextErrors.phone = "Phone is required";
        else if (!/^\+?[0-9]{8,15}$/.test(otpForm.phone))
          nextErrors.phone = "Enter a valid phone (e.g. +91XXXXXXXXXX)";
      } else {
        if (!otpForm.email) nextErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpForm.email))
          nextErrors.email = "Enter a valid email";
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      await requestCustomerOtp({
        email: otpForm.channel === "email" ? otpForm.email : undefined,
        phone: otpForm.channel === "sms" ? otpForm.phone : undefined,
        channel: otpForm.channel,
        purpose: "login",
      });
      setOtpPhase("verify");
      setResendSeconds(30);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // validate code
      const nextErrors: typeof errors = {};
      if (!otpForm.code) nextErrors.code = "OTP is required";
      else if (!/^\d{6}$/.test(otpForm.code))
        nextErrors.code = "Enter 6-digit OTP";
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      await verifyCustomerOtp({
        email: otpForm.channel === "email" ? otpForm.email : undefined,
        phone: otpForm.channel === "sms" ? otpForm.phone : undefined,
        channel: otpForm.channel,
        code: otpForm.code,
      });
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setIsLoading(true);
    try {
      await requestCustomerOtp({
        email: otpForm.channel === "email" ? otpForm.email : undefined,
        phone: otpForm.channel === "sms" ? otpForm.phone : undefined,
        channel: otpForm.channel,
        purpose: "login",
      });
      setResendSeconds(30);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(
      () => setResendSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(t);
  }, [resendSeconds]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Film className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-foreground">BooknWatch</h1>
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="customer"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "customer" }))
                  }
                >
                  Customer
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "admin" }))
                  }
                >
                  Admin
                </TabsTrigger>
                <TabsTrigger
                  value="super-admin"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "super-admin" }))
                  }
                >
                  Super Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Sign in as customer with OTP
                </div>

                {otpPhase === "request" ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={
                          otpForm.channel === "email" ? "default" : "outline"
                        }
                        onClick={() =>
                          setOtpForm((p) => ({ ...p, channel: "email" }))
                        }
                      >
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={
                          otpForm.channel === "sms" ? "default" : "outline"
                        }
                        onClick={() =>
                          setOtpForm((p) => ({ ...p, channel: "sms" }))
                        }
                      >
                        SMS
                      </Button>
                    </div>
                    {otpForm.channel === "email" ? (
                      <div className="space-y-2">
                        <Label htmlFor="otp-email" className="text-foreground">
                          Email
                        </Label>
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="Enter your email"
                          value={otpForm.email}
                          onChange={(e) =>
                            setOtpForm((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          required
                          className="bg-background border-border/50 text-foreground"
                        />
                        {errors.email ? (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="otp-phone" className="text-foreground">
                          Phone
                        </Label>
                        <Input
                          id="otp-phone"
                          type="tel"
                          placeholder="e.g. +91XXXXXXXXXX"
                          value={otpForm.phone}
                          onChange={(e) =>
                            setOtpForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }))
                          }
                          required
                          className="bg-background border-border/50 text-foreground"
                        />
                        {errors.phone ? (
                          <p className="text-xs text-red-500">{errors.phone}</p>
                        ) : null}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code" className="text-foreground">
                        Enter OTP
                      </Label>
                      <Input
                        id="otp-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpForm.code}
                        onChange={(e) =>
                          setOtpForm((p) => ({ ...p, code: e.target.value }))
                        }
                        required
                        className="bg-background border-border/50 text-foreground"
                      />
                      {errors.code ? (
                        <p className="text-xs text-red-500">{errors.code}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        {resendSeconds > 0 ? (
                          <span>Resend OTP in {resendSeconds}s</span>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResend}
                            disabled={isLoading}
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="bg-background border-border/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                        className="bg-background border-border/50 text-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="super-admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="bg-background border-border/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                        className="bg-background border-border/50 text-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Demo Credentials:
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Customer:</strong> customer@demo.com / password
                  </p>
                  <p>
                    <strong>Admin:</strong> admin@demo.com / password
                  </p>
                  <p>
                    <strong>Super Admin:</strong> superadmin@demo.com / password
                  </p>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
