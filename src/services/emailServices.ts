import nodemailer from 'nodemailer';
import config from '@/config/envConfig';

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = config;

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT),
  secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error: any, _success: any) => {
  if (error) {
    console.log('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

class EmailService {
  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', options.to);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOTP(email: string, otp: string, username: string): Promise<boolean> {
    const subject = 'Reset Your RushBet Password';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #333; margin-bottom: 30px; }
          .otp-code { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #007bff; border: 2px dashed #007bff; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>We received a request to reset your password for your RushBet account. Use the OTP code below to reset your password:</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This OTP code will expire in 5 minutes. If you didn't request this password reset, please ignore this email.
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} RushBet. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${username},
      
      We received a request to reset your password for your RushBet account.
      
      Your OTP code is: ${otp}
      
      This code will expire in 5 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      © ${new Date().getFullYear()} RushBet. All rights reserved.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = 'Welcome to RushBet - Your Account is Ready!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to RushBet</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #333; margin-bottom: 30px; }
          .welcome-message { background-color: #d4edda; padding: 20px; border-radius: 5px; color: #155724; margin: 20px 0; text-align: center; }
          .features { margin: 20px 0; }
          .feature { display: flex; align-items: center; margin: 10px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to RushBet!</h1>
          </div>
          
          <div class="welcome-message">
            <h2>Account Created Successfully!</h2>
            <p>Hello <strong>${username}</strong>, welcome to the future of crypto sports betting and casino gaming!</p>
          </div>
          
          <p>Your account has been successfully created and you're now ready to:</p>
          
          <div class="features">
            <div class="feature">🏆 Place bets on your favorite sports</div>
            <div class="feature">🎰 Enjoy premium casino games</div>
            <div class="feature">💰 Make secure crypto transactions</div>
            <div class="feature">🎁 Access exclusive bonuses and promotions</div>
          </div>
          
          <p>Start your gaming journey today and experience the thrill of crypto betting!</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} RushBet. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to RushBet!
      
      Hello ${username},
      
      Your account has been successfully created and you're now ready to:
      - Place bets on your favorite sports
      - Enjoy premium casino games
      - Make secure crypto transactions
      - Access exclusive bonuses and promotions
      
      Start your gaming journey today!
      
      © ${new Date().getFullYear()} RushBet. All rights reserved.
    `;

    try {
      return this.sendEmail({
        to: email,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send email verification OTP
   */
  async sendEmailVerificationOTP(email: string, otp: string, username: string): Promise<boolean> {
    const subject = 'Verify Your RushBet Email Address';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #333; margin-bottom: 30px; }
          .otp-code { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #28a745; border: 2px dashed #28a745; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Email Verification</h1>
          </div>
          
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>Please verify your email address by entering the following OTP code:</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <p>This code will expire in 5 minutes.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} RushBet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

export default new EmailService();
