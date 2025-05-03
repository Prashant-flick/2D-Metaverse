import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

// Email options interface
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email service result interface
interface EmailResult {
  messageId: string;
  envelope: { from: string; to: string[] };
  accepted: string[];
  rejected: string[];
  pending?: string[];
  response: string;
}

/**
 * Send email using nodemailer
 * @param options - Email options
 * @returns Promise resolving to info about sent email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // This should be an App Password for Gmail
      },
      tls: {
        rejectUnauthorized: true
      }
    });
    // Log email configuration for debugging (remove sensitive info in production

    // Set up email data
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_FROM_NAME
        ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`
        : process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      mailOptions.text = options.text;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions) as EmailResult;
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a batch of emails
 * @param emailsArray - Array of email objects with to, subject, html, and optional text
 * @returns Promise resolving when all emails are sent
 */
export async function sendBulkEmails(emailsArray: EmailOptions[]): Promise<EmailResult[]> {
  try {
    const promises = emailsArray.map(email => sendEmail(email));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
}

/**
 * Verify the nodemailer transport configuration
 * Useful for debugging connection issues
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // This should be an App Password for Gmail
      },
      tls: {
        rejectUnauthorized: true
      }
    });
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}
