"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from 'react-international-phone'
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"
import 'react-international-phone/style.css'

interface PhoneVerificationPromptProps {
  open: boolean
  onClose: () => void
}

export function PhoneVerificationPrompt({ open, onClose }: PhoneVerificationPromptProps) {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const auth = getAuth(app)

  useEffect(() => {
    if (user?.phoneVerified && open) {
      onClose()
    }
  }, [user?.phoneVerified, open, onClose])

  const sendVerificationCode = async () => {
    try {
      setIsSendingCode(true)
      const token = await auth.currentUser?.getIdToken()
      
      const response = await fetch('/api/twilio/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber })
      })

      if (!response.ok) {
        throw new Error('Failed to send verification code')
      }

      setIsVerifying(true)
      toast.success('Verification code sent!')
    } catch (error) {
      console.error('Error sending code:', error)
      toast.error('Failed to send verification code')
    } finally {
      setIsSendingCode(false)
    }
  }

  const verifyCode = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      
      const response = await fetch('/api/twilio/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode
        })
      })

      const data = await response.json()

      if (data.valid) {
        toast.success('Phone number verified successfully!')
        setIsVerifying(false)
        onClose()
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        toast.error('Invalid verification code')
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      toast.error('Failed to verify code')
    }
  }

  const handleClose = () => {
    setIsVerifying(false)
    setVerificationCode("")
    setPhoneNumber("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable SMS Notifications</DialogTitle>
          <DialogDescription>
            Verify your phone number to receive notifications when your friends complete problems and stay connected with their progress.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {!isVerifying ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
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
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  <p className="text-sm text-muted-foreground">
                    Get notified when friends solve problems
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤝</span>
                  <p className="text-sm text-muted-foreground">
                    Stay motivated with friend activity updates
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Maybe Later
                </Button>
                <Button 
                  onClick={sendVerificationCode}
                  disabled={!phoneNumber || isSendingCode}
                >
                  {isSendingCode ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to {phoneNumber}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsVerifying(false)}
                >
                  Back
                </Button>
                <Button 
                  onClick={verifyCode}
                  disabled={!verificationCode}
                >
                  Verify Code
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 