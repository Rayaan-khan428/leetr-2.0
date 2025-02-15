import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export function usePhoneVerification() {
  const { user } = useAuth();
  const auth = getAuth(app);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      setIsSendingCode(true);
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/twilio/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setIsVerifying(true);
      toast({
        title: "Success",
        description: "Verification code sent!"
      });
      return true;
    } catch (error) {
      console.error('Error sending code:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async (phoneNumber: string, code: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/twilio/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          code
        })
      });

      const data = await response.json();

      if (data.valid) {
        toast({
          title: "Success",
          description: "Phone number verified successfully!"
        });
        setIsVerifying(false);
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid verification code",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetState = () => {
    setIsVerifying(false);
    setIsSendingCode(false);
  };

  return {
    isSendingCode,
    isVerifying,
    sendVerificationCode,
    verifyCode,
    resetState
  };
} 