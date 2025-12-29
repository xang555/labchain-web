import nodemailer from 'nodemailer';
import { getEmailSettings } from './data';
import type { NodeRequest, TokenRequest } from './db';

export interface EmailResult {
  success: boolean;
  error?: string;
}

function getTransporter() {
  const settings = getEmailSettings();

  if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: settings.smtp_host,
    port: parseInt(settings.smtp_port),
    secure: settings.smtp_secure === 'true',
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass,
    },
  });
}

function getFromAddress(): string {
  const settings = getEmailSettings();
  return `"${settings.smtp_from_name}" <${settings.smtp_from}>`;
}

const nodeTypeLabels: Record<string, string> = {
  rpc: 'RPC Endpoint',
  bootnode: 'Boot Node',
  beacon: 'Beacon Node'
};

export async function sendApprovalEmail(request: NodeRequest): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, error: 'Email not configured' };
  }

  if (!request.contact_email) {
    return { success: false, error: 'No contact email provided' };
  }

  const nodeType = nodeTypeLabels[request.node_type] || request.node_type;
  const contactName = request.contact_name || 'there';

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: request.contact_email,
      subject: `Your ${nodeType} has been approved - LAB Chain`,
      text: `
Hello ${contactName},

Great news! Your ${nodeType} submission has been approved and is now listed on the LAB Chain network.

Submission Details:
- Name: ${request.name}
- Type: ${nodeType}
- Endpoint: ${request.endpoint}
- Tracking ID: ${request.tracking_id}

Your node is now visible on the LAB Chain website and can be used by the community.

Thank you for contributing to the LAB Chain network!

Best regards,
The LAB Chain Team

---
LAB Chain - The Native Blockchain of Laos
https://labchain.la
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, rgb(20, 137, 213) 0%, rgb(16, 110, 170) 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">LAB Chain</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <span style="color: #22c55e; font-size: 32px;">&#10004;</span>
      <h2 style="color: #15803d; margin: 8px 0 0 0; font-size: 18px;">Your Node Has Been Approved!</h2>
    </div>

    <p style="margin-bottom: 16px;">Hello ${contactName},</p>

    <p style="margin-bottom: 24px;">Great news! Your <strong>${nodeType}</strong> submission has been approved and is now listed on the LAB Chain network.</p>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Submission Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 120px;">Name:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${request.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Type:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${nodeType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Endpoint:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; word-break: break-all; font-family: monospace; font-size: 12px;">${request.endpoint}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tracking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; color: rgb(20, 137, 213);">${request.tracking_id}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 24px;">Your node is now visible on the LAB Chain website and can be used by the community.</p>

    <p style="margin-bottom: 8px;">Thank you for contributing to the LAB Chain network!</p>

    <p style="margin-bottom: 0;">Best regards,<br><strong>The LAB Chain Team</strong></p>
  </div>

  <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">LAB Chain - The Native Blockchain of Laos</p>
    <a href="https://labchain.la" style="color: rgb(20, 137, 213); font-size: 12px;">labchain.la</a>
  </div>
</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendRejectionEmail(request: NodeRequest, reason: string): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, error: 'Email not configured' };
  }

  if (!request.contact_email) {
    return { success: false, error: 'No contact email provided' };
  }

  const nodeType = nodeTypeLabels[request.node_type] || request.node_type;
  const contactName = request.contact_name || 'there';

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: request.contact_email,
      subject: `Update on your ${nodeType} submission - LAB Chain`,
      text: `
Hello ${contactName},

Thank you for your interest in contributing to the LAB Chain network. Unfortunately, your ${nodeType} submission could not be approved at this time.

Submission Details:
- Name: ${request.name}
- Type: ${nodeType}
- Endpoint: ${request.endpoint}
- Tracking ID: ${request.tracking_id}

Reason:
${reason}

If you believe this decision was made in error or if you've resolved the issues mentioned, please feel free to submit a new request.

Best regards,
The LAB Chain Team

---
LAB Chain - The Native Blockchain of Laos
https://labchain.la
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, rgb(20, 137, 213) 0%, rgb(16, 110, 170) 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">LAB Chain</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <span style="color: #ef4444; font-size: 32px;">&#10006;</span>
      <h2 style="color: #dc2626; margin: 8px 0 0 0; font-size: 18px;">Submission Not Approved</h2>
    </div>

    <p style="margin-bottom: 16px;">Hello ${contactName},</p>

    <p style="margin-bottom: 24px;">Thank you for your interest in contributing to the LAB Chain network. Unfortunately, your <strong>${nodeType}</strong> submission could not be approved at this time.</p>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Submission Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 120px;">Name:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${request.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Type:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${nodeType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Endpoint:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; word-break: break-all; font-family: monospace; font-size: 12px;">${request.endpoint}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tracking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; color: rgb(20, 137, 213);">${request.tracking_id}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 14px;">Reason:</h4>
      <p style="margin: 0; color: #92400e;">${reason}</p>
    </div>

    <p style="margin-bottom: 24px;">If you believe this decision was made in error or if you've resolved the issues mentioned, please feel free to submit a new request.</p>

    <p style="margin-bottom: 0;">Best regards,<br><strong>The LAB Chain Team</strong></p>
  </div>

  <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">LAB Chain - The Native Blockchain of Laos</p>
    <a href="https://labchain.la" style="color: rgb(20, 137, 213); font-size: 12px;">labchain.la</a>
  </div>
</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function isEmailConfigured(): boolean {
  const settings = getEmailSettings();
  return !!(settings.smtp_host && settings.smtp_user && settings.smtp_pass && settings.smtp_from);
}

// Token Request Email Functions

export async function sendTokenApprovalEmail(request: TokenRequest, transferredAmount: string): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, error: 'Email not configured' };
  }

  if (!request.email) {
    return { success: false, error: 'No email address provided' };
  }

  const fullName = `${request.first_name} ${request.last_name}`;

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: request.email,
      subject: `Your LAB Token Request Has Been Approved - LAB Chain`,
      text: `
Hello ${request.first_name},

Great news! Your LAB token request has been approved and the tokens have been transferred to your wallet.

Request Details:
- Tracking ID: ${request.tracking_id}
- Requested Amount: ${request.requested_amount}
- Transferred Amount: ${transferredAmount} LAB
- Wallet Address: ${request.wallet_address}

The tokens should now be visible in your wallet. If you don't see them immediately, please wait a few minutes for the transaction to be confirmed on the network.

Thank you for being part of the LAB Chain community!

Best regards,
The LAB Chain Team

---
LAB Chain - The Native Blockchain of Laos
https://labchain.la
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, rgb(20, 137, 213) 0%, rgb(16, 110, 170) 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">LAB Chain</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <span style="color: #22c55e; font-size: 32px;">&#10004;</span>
      <h2 style="color: #15803d; margin: 8px 0 0 0; font-size: 18px;">Token Request Approved!</h2>
    </div>

    <p style="margin-bottom: 16px;">Hello ${request.first_name},</p>

    <p style="margin-bottom: 24px;">Great news! Your LAB token request has been approved and the tokens have been transferred to your wallet.</p>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Request Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 140px;">Tracking ID:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-family: monospace; color: rgb(20, 137, 213);">${request.tracking_id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Requested Amount:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${request.requested_amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Transferred Amount:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #22c55e;">${transferredAmount} LAB</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Wallet Address:</td>
          <td style="padding: 8px 0; word-break: break-all; font-family: monospace; font-size: 12px;">${request.wallet_address}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 24px;">The tokens should now be visible in your wallet. If you don't see them immediately, please wait a few minutes for the transaction to be confirmed on the network.</p>

    <p style="margin-bottom: 8px;">Thank you for being part of the LAB Chain community!</p>

    <p style="margin-bottom: 0;">Best regards,<br><strong>The LAB Chain Team</strong></p>
  </div>

  <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">LAB Chain - The Native Blockchain of Laos</p>
    <a href="https://labchain.la" style="color: rgb(20, 137, 213); font-size: 12px;">labchain.la</a>
  </div>
</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendTokenRejectionEmail(request: TokenRequest, reason: string): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, error: 'Email not configured' };
  }

  if (!request.email) {
    return { success: false, error: 'No email address provided' };
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: request.email,
      subject: `Update on Your LAB Token Request - LAB Chain`,
      text: `
Hello ${request.first_name},

Thank you for your interest in LAB Chain. Unfortunately, your token request could not be approved at this time.

Request Details:
- Tracking ID: ${request.tracking_id}
- Requested Amount: ${request.requested_amount}
- Wallet Address: ${request.wallet_address}

${reason ? `Reason:\n${reason}` : ''}

If you believe this decision was made in error or if you have any questions, please feel free to submit a new request with additional information.

Best regards,
The LAB Chain Team

---
LAB Chain - The Native Blockchain of Laos
https://labchain.la
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, rgb(20, 137, 213) 0%, rgb(16, 110, 170) 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">LAB Chain</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <span style="color: #ef4444; font-size: 32px;">&#10006;</span>
      <h2 style="color: #dc2626; margin: 8px 0 0 0; font-size: 18px;">Request Not Approved</h2>
    </div>

    <p style="margin-bottom: 16px;">Hello ${request.first_name},</p>

    <p style="margin-bottom: 24px;">Thank you for your interest in LAB Chain. Unfortunately, your token request could not be approved at this time.</p>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Request Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 140px;">Tracking ID:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-family: monospace; color: rgb(20, 137, 213);">${request.tracking_id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Requested Amount:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${request.requested_amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Wallet Address:</td>
          <td style="padding: 8px 0; word-break: break-all; font-family: monospace; font-size: 12px;">${request.wallet_address}</td>
        </tr>
      </table>
    </div>

    ${reason ? `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 14px;">Reason:</h4>
      <p style="margin: 0; color: #92400e;">${reason}</p>
    </div>
    ` : ''}

    <p style="margin-bottom: 24px;">If you believe this decision was made in error or if you have any questions, please feel free to submit a new request with additional information.</p>

    <p style="margin-bottom: 0;">Best regards,<br><strong>The LAB Chain Team</strong></p>
  </div>

  <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">LAB Chain - The Native Blockchain of Laos</p>
    <a href="https://labchain.la" style="color: rgb(20, 137, 213); font-size: 12px;">labchain.la</a>
  </div>
</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
