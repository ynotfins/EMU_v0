/**
 * Email Service Implementation
 * 
 * Handles sending emails via Firebase Functions or external service.
 * Can be swapped for SendGrid, AWS SES, etc.
 */

import { injectable } from 'inversify';
import { IEmailService } from '@application/shared/interfaces/services.interface';
import { Either, left, right } from '@domain/shared/errors';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@injectable()
export class EmailService implements IEmailService {
  private readonly fromEmail = process.env.EMAIL_FROM || 'noreply@emuaremotealerts.com';
  private readonly fromName = 'EMU Alerts';

  /**
   * Sends a welcome email to new users
   */
  async sendWelcomeEmail(email: string, displayName: string): Promise<Either<Error, void>> {
    try {
      const template = this.getWelcomeTemplate(displayName);
      
      await this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return right(undefined);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return left(new Error('Failed to send welcome email'));
    }
  }

  /**
   * Sends a password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<Either<Error, void>> {
    try {
      const template = this.getPasswordResetTemplate(resetLink);
      
      await this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return right(undefined);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return left(new Error('Failed to send password reset email'));
    }
  }

  /**
   * Sends an incident notification email
   */
  async sendIncidentNotification(email: string, incident: any): Promise<Either<Error, void>> {
    try {
      const template = this.getIncidentNotificationTemplate(incident);
      
      await this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return right(undefined);
    } catch (error) {
      console.error('Failed to send incident notification:', error);
      return left(new Error('Failed to send incident notification'));
    }
  }

  /**
   * Core email sending logic
   * In production, this would integrate with SendGrid, AWS SES, etc.
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    // In production, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Firebase Extensions (Trigger Email)

    // For development, log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        preview: options.text?.substring(0, 100),
      });
      return;
    }

    // Example SendGrid implementation:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: this.fromEmail,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });

    // For now, simulate sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(displayName: string): EmailTemplate {
    return {
      subject: 'Welcome to EMU Alerts!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Welcome to EMU Alerts!</h1>
          <p>Hi ${displayName},</p>
          <p>Thank you for joining EMU Alerts. Your account has been created successfully.</p>
          <p>As a member of our emergency response team, you'll be able to:</p>
          <ul>
            <li>Receive real-time incident alerts</li>
            <li>Respond to emergencies in your area</li>
            <li>Coordinate with other team members</li>
            <li>Track incident history and responses</li>
          </ul>
          <p>Please verify your email address to get started.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Stay safe,<br>The EMU Alerts Team</p>
        </div>
      `,
      text: `Welcome to EMU Alerts!

Hi ${displayName},

Thank you for joining EMU Alerts. Your account has been created successfully.

As a member of our emergency response team, you'll be able to:
- Receive real-time incident alerts
- Respond to emergencies in your area
- Coordinate with other team members
- Track incident history and responses

Please verify your email address to get started.

If you have any questions, feel free to reach out to our support team.

Stay safe,
The EMU Alerts Team`,
    };
  }

  /**
   * Password reset email template
   */
  private getPasswordResetTemplate(resetLink: string): EmailTemplate {
    return {
      subject: 'Reset Your EMU Alerts Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Password Reset Request</h1>
          <p>Hi,</p>
          <p>We received a request to reset your EMU Alerts password.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The EMU Alerts Team</p>
        </div>
      `,
      text: `Password Reset Request

Hi,

We received a request to reset your EMU Alerts password.

Click the following link to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The EMU Alerts Team`,
    };
  }

  /**
   * Incident notification email template
   */
  private getIncidentNotificationTemplate(incident: any): EmailTemplate {
    const priorityColors: Record<string, string> = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };

    return {
      subject: `[${incident.priority.toUpperCase()}] New Incident Alert - ${incident.type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${priorityColors[incident.priority] || '#ef4444'};">
            New ${incident.type} Incident
          </h1>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Incident Details</h2>
            <p><strong>Type:</strong> ${incident.type}</p>
            <p><strong>Priority:</strong> ${incident.priority}</p>
            <p><strong>Location:</strong> ${incident.location.address}</p>
            <p><strong>Description:</strong> ${incident.description}</p>
            <p><strong>Reported:</strong> ${new Date(incident.createdAt).toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/incidents/${incident.id}" 
               style="background-color: ${priorityColors[incident.priority] || '#ef4444'}; 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              View Incident Details
            </a>
          </div>
          <p>Please respond as soon as possible if you're available to assist.</p>
          <p>Stay safe,<br>The EMU Alerts Team</p>
        </div>
      `,
      text: `New ${incident.type} Incident

Type: ${incident.type}
Priority: ${incident.priority}
Location: ${incident.location.address}
Description: ${incident.description}
Reported: ${new Date(incident.createdAt).toLocaleString()}

View details at: ${process.env.NEXT_PUBLIC_APP_URL}/incidents/${incident.id}

Please respond as soon as possible if you're available to assist.

Stay safe,
The EMU Alerts Team`,
    };
  }
}
