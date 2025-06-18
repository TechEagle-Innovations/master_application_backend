import { Injectable } from "@nestjs/common";

// Email template interfaces
export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface AccountCreatedEmailData {
  username: string;
  useremail: string;
  verifyLink: string;
}

export interface PasswordChangeOTPEmailData {
  username: string;
  useremail: string;
  OTP: number;
}

export interface PasswordChangedEmailData {
  username: string;
  useremail: string;
}

@Injectable()
export class EmailTemplate {
  private readonly FROM_EMAIL = "donotreply@techeagle.in";
  private readonly LOGO_URL = "https://order.techeagle.in/TE-logoName.svg";
  private readonly WEBSITE_URL = "https://techeagle.in";
  private readonly SUPPORT_EMAIL = "shop.support@techeagle.in";

  /**
   * Get base CSS styles for all email templates
   */
  private getBaseStyles(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 20px;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .logo {
        width: 80px;
        height: auto;
        margin-bottom: 20px;
      }
      
      .content {
        margin-bottom: 30px;
      }
      
      .greeting {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      
      .message {
        margin-bottom: 20px;
        line-height: 1.8;
      }
      
      .highlight {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid #fd6125;
        margin: 20px 0;
      }
      
      .button {
        display: inline-block;
        background-color: #fd6125;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin: 10px 0;
      }
      
      .button:hover {
        background-color: #e55a1f;
      }
      
      .otp {
        font-size: 24px;
        font-weight: bold;
        color: #fd6125;
        text-align: center;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 5px;
        margin: 20px 0;
      }
      
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        color: #666;
      }
      
      .support-info {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 5px;
        padding: 15px;
        margin: 20px 0;
      }
    `;
  }

  /**
   * Get common footer HTML
   */
  private getFooterHTML(): string {
    return `
      <div class="footer">
        <p>Best regards,</p>
        <p><strong>TechEagle Innovations Pvt Ltd</strong></p>
        <a href="${this.WEBSITE_URL}" target="_blank" style="text-decoration: none;">
          <img class="logo" src="${this.LOGO_URL}" alt="TechEagle Logo" style="width: 80px; height: auto; display: block; margin: 10px auto;" />
        </a>
      </div>
    `;
  }

  /**
   * Generate account created email
   */
  public generateAccountCreatedEmail(data: AccountCreatedEmailData): EmailOptions {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Techeagle | Account Created</title>
        <style>${this.getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Techeagle!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${data.username},</div>
            
            <div class="message">
              <p>We are excited to welcome you to Techeagle! Thank you for registering with us.</p>
              
              <div class="highlight">
                <p><strong>To get started:</strong></p>
                <p>Please verify your email address to activate your account.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${data.verifyLink}" class="button" target="_blank">
                  Verify Email Address
                </a>
              </div>
            </div>
          </div>
          
          ${this.getFooterHTML()}
        </div>
      </body>
      </html>
    `;

    return {
      from: this.FROM_EMAIL,
      to: data.useremail,
      subject: "Welcome to Techeagle | Account Created | Verify Account",
      html
    };
  }

  /**
   * Generate password change OTP email
   */
  public generatePasswordChangeOTPEmail(data: PasswordChangeOTPEmailData): EmailOptions {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Techeagle Password | OTP</title>
        <style>${this.getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Dear ${data.username},</div>
            
            <div class="message">
              <p>We received a request to reset your password for your Techeagle account.</p>
              
              <div class="highlight">
                <p><strong>Your One-Time Password (OTP):</strong></p>
                <div class="otp">${data.OTP}</div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Enter this OTP on the password reset page</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <div class="support-info">
              <p><strong>Need help?</strong></p>
              <p>If you experience any issues or have questions, contact our support team at 
                <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a>
              </p>
            </div>
          </div>
          
          ${this.getFooterHTML()}
        </div>
      </body>
      </html>
    `;

    return {
      from: this.FROM_EMAIL,
      to: data.useremail,
      subject: "Reset Your Techeagle Password | One-Time Password (OTP)",
      html
    };
  }

  /**
   * Generate password changed confirmation email
   */
  public generatePasswordChangedEmail(data: PasswordChangedEmailData): EmailOptions {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>${this.getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Dear ${data.username},</div>
            
            <div class="message">
              <div class="highlight">
                <p><strong>✅ Confirmation:</strong></p>
                <p>Your password for Master App has been successfully changed.</p>
              </div>
              
              <div class="support-info">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>If you did not initiate this password change, please contact our support team immediately at 
                  <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a>
                </p>
              </div>
            </div>
          </div>
          
          ${this.getFooterHTML()}
        </div>
      </body>
      </html>
    `;

    return {
      from: this.FROM_EMAIL,
      to: data.useremail,
      subject: "Your shop.techeagle Password Has Been Successfully Changed",
      html
    };
  }

  // Legacy method names for backward compatibility
  public accountCreatedEmail = (username: string, useremail: string, verifyLink: string) => {
    return this.generateAccountCreatedEmail({ username, useremail, verifyLink });
  };

  public passwordChangeOTPEmail = (username: string, useremail: string, OTP: number) => {
    return this.generatePasswordChangeOTPEmail({ username, useremail, OTP });
  };

  public passwordChangedEmail = (username: string, useremail: string) => {
    return this.generatePasswordChangedEmail({ username, useremail });
  };
}

