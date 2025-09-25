"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Mail, Shield, Globe } from "lucide-react"

export function PlatformSettings() {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "ScreenLease",
    supportEmail: "support@screenlease.com",
    platformFee: 5.0,
    maxVenuesPerAdmin: 3,
    allowNewVenueRegistration: true,
    requireVenueApproval: true,
    maintenanceMode: false,
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.screenlease.com",
    smtpPort: 587,
    smtpUsername: "noreply@screenlease.com",
    enableBookingConfirmations: true,
    enableMarketingEmails: false,
    enableSystemNotifications: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordComplexity: true,
  })

  const handleSavePlatformSettings = () => {
    console.log("Saving platform settings:", platformSettings)
  }

  const handleSaveEmailSettings = () => {
    console.log("Saving email settings:", emailSettings)
  }

  const handleSaveSecuritySettings = () => {
    console.log("Saving security settings:", securitySettings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Configure global platform settings and policies</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Email
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={platformSettings.platformName}
                    onChange={(e) => setPlatformSettings((prev) => ({ ...prev, platformName: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformSettings.supportEmail}
                    onChange={(e) => setPlatformSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Venue Management</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">Allow New Venue Registration</div>
                      <div className="text-sm text-muted-foreground">Allow new venues to register on the platform</div>
                    </div>
                    <Switch
                      checked={platformSettings.allowNewVenueRegistration}
                      onCheckedChange={(checked) =>
                        setPlatformSettings((prev) => ({ ...prev, allowNewVenueRegistration: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">Require Venue Approval</div>
                      <div className="text-sm text-muted-foreground">
                        New venues require admin approval before activation
                      </div>
                    </div>
                    <Switch
                      checked={platformSettings.requireVenueApproval}
                      onCheckedChange={(checked) =>
                        setPlatformSettings((prev) => ({ ...prev, requireVenueApproval: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Temporarily disable public access to the platform
                      </div>
                    </div>
                    <Switch
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setPlatformSettings((prev) => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePlatformSettings} className="cinema-glow">
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing & Revenue Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    step="0.1"
                    value={platformSettings.platformFee}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({ ...prev, platformFee: Number.parseFloat(e.target.value) }))
                    }
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">Percentage fee charged to venues per transaction</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxVenues">Max Venues per Admin</Label>
                  <Input
                    id="maxVenues"
                    type="number"
                    value={platformSettings.maxVenuesPerAdmin}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({ ...prev, maxVenuesPerAdmin: Number.parseInt(e.target.value) }))
                    }
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">Maximum venues one admin can manage</p>
                </div>
              </div>

              <Button onClick={handleSavePlatformSettings} className="cinema-glow">
                Save Billing Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">SMTP Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpHost: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings((prev) => ({ ...prev, smtpPort: Number.parseInt(e.target.value) }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpUsername: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">Booking Confirmations</div>
                      <div className="text-sm text-muted-foreground">Send email confirmations for bookings</div>
                    </div>
                    <Switch
                      checked={emailSettings.enableBookingConfirmations}
                      onCheckedChange={(checked) =>
                        setEmailSettings((prev) => ({ ...prev, enableBookingConfirmations: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">Send promotional and marketing emails</div>
                    </div>
                    <Switch
                      checked={emailSettings.enableMarketingEmails}
                      onCheckedChange={(checked) =>
                        setEmailSettings((prev) => ({ ...prev, enableMarketingEmails: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <div className="font-medium">System Notifications</div>
                      <div className="text-sm text-muted-foreground">Send system alerts and notifications</div>
                    </div>
                    <Switch
                      checked={emailSettings.enableSystemNotifications}
                      onCheckedChange={(checked) =>
                        setEmailSettings((prev) => ({ ...prev, enableSystemNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveEmailSettings} className="cinema-glow">
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Authentication</h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="space-y-1">
                    <div className="font-medium">Require Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Require 2FA for all admin accounts</div>
                  </div>
                  <Switch
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({ ...prev, requireTwoFactor: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Session & Password Policies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({ ...prev, sessionTimeout: Number.parseInt(e.target.value) }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({ ...prev, maxLoginAttempts: Number.parseInt(e.target.value) }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({ ...prev, passwordMinLength: Number.parseInt(e.target.value) }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="space-y-1">
                    <div className="font-medium">Require Password Complexity</div>
                    <div className="text-sm text-muted-foreground">
                      Require uppercase, lowercase, numbers, and special characters
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.requirePasswordComplexity}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({ ...prev, requirePasswordComplexity: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecuritySettings} className="cinema-glow">
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
