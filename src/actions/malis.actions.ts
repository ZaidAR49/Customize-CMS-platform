'use server';

import nodemailer from 'nodemailer';
import { requireAdmin } from '@/lib/auth';
import {
  generateOtpEmail,
  generateRoleAssignmentEmail,
  generateContactUsEmail,
} from '@/templates/mail-body.template';

const ROLE_ASSIGNMENT_SUBJECT =
  'تم تعيين دور جديد لحسابك على منصة جمعية حماية الأسرة والطفولة';

export async function sendMails(
  userEMAIL: string | undefined,
  subject: string | undefined,
  message: string | undefined,
  name: string | undefined,
  role: string | undefined,
  opt: string | undefined
) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const from = process.env.EMAIL_USER;
    const adminInbox = process.env.EMAIL_USER;

    if (opt && subject) {
      await transporter.sendMail({
        from,
        to: adminInbox,
        subject,
        html: generateOtpEmail(opt),
      });
    } else if (role && userEMAIL && name) {
      await transporter.sendMail({
        from,
        replyTo: adminInbox,
        to: userEMAIL,
        subject: subject ?? 'تم تعيين دور جديد لحسابك',
        html: generateRoleAssignmentEmail(name, userEMAIL, role),
      });
    } else if (subject && message && userEMAIL && name) {
      await transporter.sendMail({
        from,
        replyTo: userEMAIL,
        to: adminInbox,
        subject: `رسالة تواصل: ${subject}`,
        html: generateContactUsEmail(name, userEMAIL, subject, message),
      });
    } else {
      return { success: false, error: 'Invalid email parameters' };
    }

    return { success: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errMessage };
  }
}

export async function submitContactFormAction(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { name, email, subject, message } = data;
  return sendMails(email, subject, message, name, undefined, undefined);
}

export async function sendRoleAssignmentEmailAction(data: {
  name: string;
  email: string;
  role: string;
}) {
  try {
    await requireAdmin();
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const role = data.role.trim();
    if (!name || !email || !role) {
      return { success: false, error: 'بيانات المستخدم غير مكتملة.' };
    }
    return sendMails(email, ROLE_ASSIGNMENT_SUBJECT, undefined, name, role, undefined);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errMessage };
  }
}
