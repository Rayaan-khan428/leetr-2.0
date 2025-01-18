"use client"

import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase/firebase"

export default function SettingsPage() {
  const { user } = useAuth();
  const auth = getAuth(app);
  const [theme, setTheme] = useState("system")
  const [notifications, setNotifications] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(!!user?.phoneVerified)
  const [showCodeInput, setShowCodeInput] = useState(false)

  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phoneNumber || "")
      setIsVerified(!!user.phoneVerified)
    }
  }, [user])

  const formatPhoneNumber = (number: string) => {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, '');
    // Add the + prefix if not present
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  };

  const sendVerificationCode = async () => {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      const response = await fetch("/api/twilio/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedNumber }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Verification code sent!");
        setShowCodeInput(true);
      } else {
        toast.error(data.error || "Failed to send verification code");
      }
    } catch (error) {
      toast.error("Error sending verification code");
      console.error(error);
    }
  };

  const verifyCode = async () => {
    try {
      setIsVerifying(true);
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      // Get the current Firebase user's token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch("/api/twilio/verify-code", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          phoneNumber: formattedNumber, 
          code: verificationCode 
        }),
      });

      const data = await response.json();
      
      if (data.success && data.valid) {
        toast.success("Phone number verified successfully!");
        setIsVerified(true);
        setShowCodeInput(false);
      } else {
        toast.error(data.error || "Invalid verification code");
        console.error('Verification failed:', data);
      }
    } catch (error) {
      toast.error("Error verifying code");
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
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
              {/* Appearance Section */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
                />
              </div>

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
                  onCheckedChange={setNotifications}
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
              <div className="space-y-4 rounded-lg bg-muted/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Phone Number Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Add your phone number to receive SMS notifications about your account.
                  </p>
                </div>
                
                {isVerified ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Phone number verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Current number:</span>
                      <span className="text-sm text-muted-foreground">{phoneNumber}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contact support if you need to change your verified phone number.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="+1 (234) 567-8900"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d\s()+\-]/g, '');
                          setPhoneNumber(value);
                        }}
                        className="max-w-[200px]"
                        type="tel"
                        pattern="[\d\s()+\-]+"
                      />
                      <Button 
                        variant="outline" 
                        onClick={sendVerificationCode}
                        disabled={!phoneNumber || showCodeInput}
                      >
                        Send Code
                      </Button>
                    </div>

                    {showCodeInput && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="max-w-[200px]"
                        />
                        <Button 
                          onClick={verifyCode}
                          disabled={!verificationCode || isVerifying}
                        >
                          {isVerifying ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                <Button className="mt-4 w-full sm:w-auto">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
} 