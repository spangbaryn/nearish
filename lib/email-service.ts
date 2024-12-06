import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { supabase } from '@/lib/supabase';

const mailgun = new Mailgun(formData);

console.log('Email service config:', {
  hasApiKey: !!process.env.MAILGUN_API_KEY,
  hasDomain: !!process.env.MAILGUN_DOMAIN,
  hasFromAddress: !!process.env.EMAIL_FROM_ADDRESS,
  isDevelopment: process.env.NODE_ENV === 'development'
});

const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

export class EmailServiceError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

export async function sendTestEmail(
  subject: string,
  htmlContent: string,
) {
  try {
    if (!process.env.MAILGUN_API_KEY) {
      throw new EmailServiceError('MAILGUN_API_KEY is not configured');
    }
    if (!process.env.MAILGUN_DOMAIN) {
      throw new EmailServiceError('MAILGUN_DOMAIN is not configured');
    }
    if (!process.env.EMAIL_FROM_ADDRESS) {
      throw new EmailServiceError('EMAIL_FROM_ADDRESS is not configured');
    }

    const domain = process.env.NODE_ENV === 'development' 
      ? 'sandbox' + process.env.MAILGUN_DOMAIN
      : process.env.MAILGUN_DOMAIN;

    const fromAddress = process.env.NODE_ENV === 'development'
      ? `test@${domain}`
      : process.env.EMAIL_FROM_ADDRESS || 'default@example.com';

    console.log('Attempting to send email:', {
      domain,
      from: fromAddress,
      to: 'espangenberg@gmail.com',
      subject: subject,
      environment: process.env.NODE_ENV
    });

    const response = await client.messages.create(domain, {
      from: fromAddress,
      to: 'espangenberg@gmail.com',
      subject: subject,
      html: htmlContent,
    });

    console.log('Mailgun response:', response);

    if (!response) {
      throw new EmailServiceError('No response from email service');
    }

    return response;
  } catch (error: any) {
    console.error('Email service detailed error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error.details || 'No additional details'
    });
    throw new EmailServiceError(
      `Failed to send email: ${error.message}`,
      error.code
    );
  }
}

export async function sendCampaignEmail(
  campaignId: string,
  subject: string,
  htmlContent: string,
  recipientEmails: string[]
) {
  try {
    if (!process.env.MAILGUN_API_KEY) {
      throw new EmailServiceError('MAILGUN_API_KEY is not configured');
    }
    if (!process.env.MAILGUN_DOMAIN) {
      throw new EmailServiceError('MAILGUN_DOMAIN is not configured');
    }
    if (!process.env.EMAIL_FROM_ADDRESS) {
      throw new EmailServiceError('EMAIL_FROM_ADDRESS is not configured');
    }

    const domain = process.env.MAILGUN_DOMAIN;

    const fromAddress = process.env.NODE_ENV === 'development'
      ? `test@${domain}`
      : process.env.EMAIL_FROM_ADDRESS || 'default@example.com';

    console.log('Attempting to send campaign email:', {
      domain,
      from: fromAddress,
      recipientCount: recipientEmails.length,
      subject,
      environment: process.env.NODE_ENV,
      apiKey: process.env.MAILGUN_API_KEY?.substring(0, 5) + '...'
    });

    const response = await client.messages.create(domain, {
      from: fromAddress,
      to: recipientEmails,
      subject,
      html: htmlContent,
    });

    if (!response) {
      throw new EmailServiceError('No response from email service');
    }

    console.log('Mailgun response:', response);

    return {
      response,
      recipientCount: recipientEmails.length
    };
  } catch (error: any) {
    console.error('Email service detailed error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error.details || 'No additional details'
    });
    throw new EmailServiceError(
      `Failed to send email: ${error.message}`,
      error.code
    );
  }
} 