// lib/email-service.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SentMessageInfo, Options } from "nodemailer/lib/smtp-transport";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// for testing purposes !
//private transporter!: nodemailer.Transporter;
// const testAccount = await nodemailer.createTestAccount();
// const testAccountConfigs = {
//   host: testAccount.smtp.host,
//   port: testAccount.smtp.port,
//   secure: testAccount.smtp.secure,
//   auth: {
//     user: testAccount.user,
//     pass: testAccount.pass,
//   },
// };

// configs for production
const accountConfigs = {
  host: process.env.EMAIL_HOST!,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  pool: true,
  maxConnections: 5, // Maximum number of simultaneous connections (default: 5)
  maxMessages: 100, // Messages per connection before reconnecting (default: 100)
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
};

let transporter: nodemailer.Transporter<SentMessageInfo, Options> | null = null;
export class EmailService {
  async init() {
    try {
      // for testing : this.transporter = nodemailer.createTransport(testAccountConfigs)
      transporter = nodemailer.createTransport(accountConfigs);

      // Verify the connection
      await transporter.verify();
    } catch (error) {
      return NextResponse.json({ message: `Transporter initialization failed: ${error}` }, { status: 500 });
    }
  }

  async sendVerificationCode(
    email: string,
    code: string,
  ): Promise<NextResponse | undefined> {
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
                Need help? Contact our support team at ${process.env.EMAIL_USER}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!transporter) {
      return NextResponse.json({ status: 500 });
    }
    const sent = await transporter.sendMail({
      from: `"Seb from Chat" <${"test@expandNextJsTemplate.com"}>`,
      to: email,
      subject: "Verify Your Email - Welcome aboard !",
      html,
    });

    if (sent) return NextResponse.json({ status: 200 });
  }
}

export const emailService = new EmailService();
