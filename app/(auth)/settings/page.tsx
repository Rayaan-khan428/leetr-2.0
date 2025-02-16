"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useDebouncedCallback } from "use-debounce"
import { usePhoneVerification } from "@/hooks/use-phone-verification"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"
import { CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const auth = getAuth(app)
  const [notifications, setNotifications] = useState(false)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [friendActivitySMS, setFriendActivitySMS] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const { isSendingCode, isVerifying, sendVerificationCode, verifyCode, resetState } = usePhoneVerification()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

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
          setFriendActivitySMS(settings.friendActivitySMS);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [user, auth.currentUser]);

  const saveSettings = useDebouncedCallback(async (newSettings: { 
    emailNotifications?: boolean;
    smsEnabled?: boolean;
    friendActivitySMS?: boolean;
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
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  }, 500);

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    saveSettings({ emailNotifications: checked });
    toast({
      title: "Success",
      description: "Notification preference saved",
    });
  };

  const handleSMSChange = (checked: boolean) => {
    if (!user?.phoneVerified) {
      toast({
        title: "Error",
        description: "Please verify your phone number first",
        variant: "destructive"
      });
      return;
    }
    setSmsEnabled(checked);
    saveSettings({ smsEnabled: checked });
    toast({
      title: "Success",
      description: "SMS notification preference saved",
    });
  };

  const handleFriendActivitySMSChange = (checked: boolean) => {
    if (!user?.phoneVerified) {
      toast({
        title: "Error",
        description: "Please verify your phone number first",
        variant: "destructive"
      });
      return;
    }
    setFriendActivitySMS(checked);
    saveSettings({ friendActivitySMS: checked });
    toast({
      title: "Success",
      description: "Friend activity notification preference saved",
    });
  };

  const handleSendCode = async () => {
    const success = await sendVerificationCode(phoneNumber);
    if (!success) {
      setPhoneNumber("");
    }
  };

  const handleVerifyCode = async () => {
    const success = await verifyCode(phoneNumber, verificationCode);
    if (success) {
      resetState();
      setVerificationCode("");
      setPhoneNumber("");
      window.location.reload();
    }
  };

  const renderPhoneVerificationSection = () => (
    <div className="space-y-4 rounded-lg bg-muted/50 p-4 sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Phone Number Verification</p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Add your phone number to receive SMS notifications about your account.
        </p>
      </div>
      
      {user?.phoneVerified ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm font-medium">Phone number verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium">Current number:</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{user.phoneNumber}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Contact support if you need to change your verified phone number.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {!isVerifying ? (
            <div className="space-y-4">
              <PhoneInput
                defaultCountry="us"
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
                className="!w-full"
                style={{
                  '--react-international-phone-border-radius': '0.5rem',
                  '--react-international-phone-border-color': 'hsl(var(--input))',
                  '--react-international-phone-background-color': 'hsl(var(--background))',
                  '--react-international-phone-text-color': 'hsl(var(--foreground))',
                  '--react-international-phone-selected-dropdown-item-background-color': 'hsl(var(--accent))',
                  '--react-international-phone-dropdown-item-hover-background-color': 'hsl(var(--accent))',
                  '--react-international-phone-country-selector-background-color': 'hsl(var(--background))',
                  '--react-international-phone-country-selector-border-color': 'hsl(var(--input))',
                } as React.CSSProperties}
              />
              <Button 
                onClick={handleSendCode}
                disabled={isSendingCode || !phoneNumber}
                className="w-full sm:w-auto"
              >
                {isSendingCode ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={!verificationCode}
                  className="w-full sm:w-auto"
                >
                  Verify Code
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => resetState()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:py-10">
      <div className="space-y-0.5 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue={tab || "general"} className="space-y-6 sm:space-y-8">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full gap-2 sm:gap-4 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="general" className="w-full rounded-md">General</TabsTrigger>
          <TabsTrigger value="sms" className="w-full rounded-md">SMS Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="w-full rounded-md">Billing</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-xl sm:text-2xl">Account Preferences</CardTitle>
              <CardDescription className="text-sm">
                Customize your account settings and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Email Notifications Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
              <div className="space-y-4 sm:space-y-6">
                {/* SMS Enable/Disable Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={smsEnabled}
                    onCheckedChange={handleSMSChange}
                    disabled={!user?.phoneVerified}
                  />
                </div>

                {/* Add Friend Activity Toggle */}
                {smsEnabled && user?.phoneVerified && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Friend Activity Notifications</label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get notified when friends complete problems
                      </p>
                    </div>
                    <Switch
                      checked={friendActivitySMS}
                      onCheckedChange={handleFriendActivitySMSChange}
                      disabled={!user?.phoneVerified}
                    />
                  </div>
                )}

                {/* Phone Verification Section */}
                {renderPhoneVerificationSection()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-xl sm:text-2xl">Billing Information</CardTitle>
              <CardDescription className="text-sm">
                Manage your billing information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 rounded-lg bg-muted/50 p-4 sm:p-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Plan</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No active subscription
                  </p>
                </div>
                <Button 
                  className="w-full sm:w-auto text-sm"
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