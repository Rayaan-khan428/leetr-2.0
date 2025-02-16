"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePhoneVerification } from '@/hooks/use-phone-verification'

interface PhoneVerificationPromptProps {
  open: boolean
  onClose: () => void
}

export function PhoneVerificationPrompt({ open, onClose }: PhoneVerificationPromptProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const { isSendingCode, isVerifying, sendVerificationCode, verifyCode, resetState } = usePhoneVerification()

  const handleSendCode = async () => {
    const success = await sendVerificationCode(phoneNumber)
    if (!success) {
      setPhoneNumber("")
    }
  }

  const handleVerifyCode = async () => {
    const success = await verifyCode(phoneNumber, verificationCode)
    if (success) {
      handleClose()
      // Refresh the page to update the UI
      window.location.reload()
    }
  }

  const handleClose = () => {
    resetState()
    setVerificationCode("")
    setPhoneNumber("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isVerifying ? (
            <>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button 
                onClick={handleSendCode}
                disabled={isSendingCode || !phoneNumber}
                className="w-full"
              >
                {isSendingCode ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button 
                onClick={handleVerifyCode}
                disabled={!verificationCode}
                className="w-full"
              >
                Verify Code
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 