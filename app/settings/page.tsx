"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user } = useAuth();
  const auth = getAuth(app);
  const [notifications, setNotifications] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch('/api/user-settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const settings = await response.json();
          setNotifications(settings.emailNotifications);
          setSmsEnabled(settings.smsEnabled);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [user, auth.currentUser]);

  // Update saveSettings to handle both email and SMS notifications
  const saveSettings = useDebouncedCallback(async (newSettings: { 
    emailNotifications?: boolean;
    smsEnabled?: boolean;
  }) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  }, 500);

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    saveSettings({ emailNotifications: checked });
    toast.success('Notification preference saved');
  };

  const handleSMSChange = (checked: boolean) => {
    if (!user?.phoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }
    setSmsEnabled(checked);
    saveSettings({ smsEnabled: checked });
    toast.success('SMS notification preference saved');
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="space-y-0.5 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 gap-4 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="general" className="rounded-md">General</TabsTrigger>
          <TabsTrigger value="sms" className="rounded-md">SMS Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-md">Billing</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Customize your account settings and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications Section */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Notifications</CardTitle>
              <CardDescription>
                Set up SMS notifications for important updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* SMS Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={smsEnabled}
                    onCheckedChange={handleSMSChange}
                    disabled={!user?.phoneVerified}
                  />
                </div>

                {/* Phone Verification Section */}
                <div className="space-y-4 rounded-lg bg-muted/50 p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Phone Number Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Add your phone number to receive SMS notifications about your account.
                    </p>
                  </div>
                  
                  {user?.phoneVerified ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Phone number verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Current number:</span>
                        <span className="text-sm text-muted-foreground">{user.phoneNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contact support if you need to change your verified phone number.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => toast.info('SMS verification coming soon!')}
                      >
                        Verify Phone Number
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your billing information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 rounded-lg bg-muted/50 p-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    No active subscription
                  </p>
                </div>
                <Button 
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 