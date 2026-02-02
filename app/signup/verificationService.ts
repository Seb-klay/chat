'use server';

// lib/verification-service.ts
import { emailService } from '@/app/service/emailService';
import { isAccountUsed, validateUser, verifySignupCode } from '../service';

  // Generate 6-digit code
  function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code to email
  export async function sendVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const code = generateCode();
      // 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store code in database
      const responseValidation = await validateUser(email, code, expiresAt);
      if (!responseValidation?.ok) {
        return { 
          success: false, 
          message: "An error occured while validating the user."
        };
      }

      // Send email
      await emailService.init();
      const responseEmail = await emailService.sendVerificationCode(email, code);
      if (!responseEmail?.ok) {
        return { 
          success: false, 
          message: "The email did not sent properly, retry."
        };
      }

      return { 
        success: true,
      };
    } catch (error) {
      return { 
        success: false, 
        message: "" + error
      };
    }
  }

  // Verify the code
  export async function verifyCode(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    try {
      const verifiedCode = await verifySignupCode(email, code);

      if (!verifiedCode?.ok) {
        return { 
          success: false, 
          message: 'Please, retry again.'
        };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to verify code' 
      };
    }
  }

  // Check if email is verified
  export async function isEmailVerified(email: string): Promise<boolean> {
    try {
      const result = await isAccountUsed(email);
      const isVerified = await result?.json();
      return isVerified[0]
    } catch (error) {
      throw new Error(String(error));
    }
  }

  // 123456789Aa@