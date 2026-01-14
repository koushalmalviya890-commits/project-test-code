import nodemailer from 'nodemailer';
import ServiceProvider from '@/models/ServiceProvider'
import mongoose from 'mongoose'
import { fillContractTemplate } from '@/lib/utils/fillContractTemplate';
import { generatePdfFromHtml } from '@/lib/utils/generatePdfFromHtml';
import { uploadPdfToS3 } from '@/lib/utils/uploadPdfToS3';
// existing imports...
const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
export async function sendServiceProviderAgreementEmail({
  to,
  serviceProviderName,
  entityType,
  aadhaarNumber,
  residentialAddress,
  businessAddress,
  userId // 👈 Add this
}: {
  to: string;
  serviceProviderName: string;
  entityType: string;
  aadhaarNumber: string;
  residentialAddress: string;
  businessAddress: string;
  userId: string; // 👈 Add this
}) {
  const filledHtml = await fillContractTemplate({
    serviceProviderName,
    entityType,
    aadhaarNumber,
    residentialAddress,
    businessAddress
  });

  const pdfBuffer = await generatePdfFromHtml(filledHtml);
//  const htmlBuffer = Buffer.from(filledHtml, 'utf-8');
  const signedUrl = await uploadPdfToS3(pdfBuffer, `Cumma-Agreement-${serviceProviderName.replace(/\s+/g, '-')}`);

  // 💾 Store it in the service provider record
  await ServiceProvider.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { agreementUrl: signedUrl },
    { new: true }
  );

 const subject = 'Welcome to Cumma – Access Your Agreement';

const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F7FAFC;">
    <h2 style="color: #2D3748; margin-bottom: 20px;">Welcome to Cumma, ${serviceProviderName}!</h2>

    <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
      Thank you for registering as a service provider on <strong>Cumma</strong>. We’re excited to have you on board and look forward to working together to build a stronger ecosystem.
    </p>

    <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
      As part of the onboarding process, please download and review your Facility Provider Agreement using the button below:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${signedUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #2B6CB0; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px;">
        Download Agreement
      </a>
    </div>

    <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
      If you have any questions or need assistance, feel free to reach out to our support team.
    </p>

    <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
      Best regards,<br/>
      <strong>Team Cumma</strong>
    </p>
  </div>
`;

  await transporter.sendMail({
    from: `"Cumma" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html
  });

  return { signedUrl };
}
