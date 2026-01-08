// lib/email-service.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
    private transporter!: nodemailer.Transporter;

    async init() {
    // for testing purposes !
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host, //process.env.EMAIL_HOST,
      port: testAccount.smtp.port, //parseInt(process.env.EMAIL_PORT || '587'),
      secure: testAccount.smtp.secure, // process.env.EMAIL_SECURE === 'true'
      auth: {
        user: testAccount.user, // process.env.EMAIL_USER,
        pass: testAccount.pass, // process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<NextResponse | undefined> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Verify Your Email</h1>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #333;">Hello!</h2>
            <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <div style="display: inline-block; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 12px; padding: 30px;">
                <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #667eea;">
                  ${code}
                </div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this email, please ignore it.
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                Need help? Contact our support team at support@yourapp.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const sent = await this.transporter.sendMail({
      from: `"Seb from Chat" <${'test@expandNextJsTemplate.com'}>`,
      to: email,
      subject: 'Verify Your Email - Welcome aboard !',
      html,
    });

    if (sent)

    return NextResponse.json({status: 200});
  }
}

export const emailService = new EmailService();