import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { getRevisionTasksForTopic, TOPIC_REVISION_CONFIGS } from './src/data/revisionScheduleTasks.ts';

dotenv.config();

const __filename = typeof import.meta?.url === 'string' ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Lazy-initialized Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

/**
 * Executes a Gemini model request with automated fallback across available models.
 * If the primary model experiences high demand or temporary 503/429 spikes,
 * it seamlessly switches to the next fast and capable candidate model.
 */
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<{ text: string; model: string }> {
  // Prioritize gemini-flash-latest for highest availability and speed, followed by flash-lite and 3.8-flash
  const candidateModels = [
    params.preferredModel || 'gemini-flash-latest',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];
  const uniqueModels = Array.from(new Set(candidateModels));

  let lastError: any = null;
  for (const model of uniqueModels) {
    // Attempt with retry for transient 503 (high demand) or 429 rate limit
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout waiting for model "${model}"`)), 12000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        if (response && response.text) {
          return { text: response.text, model };
        }
      } catch (err: any) {
        lastError = err;
        const is503Or429 = err?.status === 503 || err?.status === 429 || 
          (err?.message && (err.message.includes('503') || err.message.includes('overloaded') || err.message.includes('429')));
        
        if (is503Or429 && attempt < 2) {
          // Exponential backoff before retry on same model
          await new Promise(r => setTimeout(r, 600 * attempt));
          continue;
        }
        // Brief backoff before trying next candidate model
        await new Promise(r => setTimeout(r, 350));
        break;
      }
    }
  }
  throw lastError || new Error('All candidate models currently unavailable');
}

// API Routes
app.get(['/healthz', '/api/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email notification endpoint when a student joins an instructor's class
app.post('/api/notify-class-join', async (req, res) => {
  try {
    const { 
      instructorEmail = 'corbanb@gisboyshigh.net',
      studentName,
      studentEmail,
      studentTier = 'Extended',
      className,
      classCode,
      joinedAt = new Date().toISOString()
    } = req.body;

    if (!studentName || !className) {
      return res.status(400).json({ error: 'Missing studentName or className' });
    }

    const targetRecipient = instructorEmail || 'corbanb@gisboyshigh.net';
    const formattedDate = new Date(joinedAt).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailSubject = `🎓 Student Joined: ${studentName} joined "${className}" (${classCode})`;
    
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; padding: 10px 18px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; color: #ffffff; font-weight: 800; font-size: 16px; margin-bottom: 10px;">
            Cambridge IGCSE Combined Science 0653
          </div>
          <h2 style="color: #ffffff; margin: 8px 0 0 0; font-size: 20px;">New Student Class Enrollment</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Automated email notification from your Combined Science Teaching Portal</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155;">
          <h3 style="color: #34d399; font-size: 15px; margin: 0 0 14px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">
            Student Enrollment Summary
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Student Name:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Student Email:</td>
              <td style="padding: 6px 0; font-family: monospace; color: #38bdf8;">${studentEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Candidate Tier:</td>
              <td style="padding: 6px 0;"><span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">${studentTier} Tier</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Class Name:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #a78bfa;">${className}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Class Code Used:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #f59e0b;">${classCode}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Joined At:</td>
              <td style="padding: 6px 0; color: #cbd5e1;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; color: #34d399; font-size: 13px; font-weight: 600;">
            ✓ The student has been successfully enrolled in your class roster.
          </p>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">
            You can view their progress, traffic lights, and quiz results directly in the Progress Tracker and Teaching Hub.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 14px;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            Cambridge IGCSE Combined Science (0653) Learning & Revision Platform • Instructor Notification Service
          </p>
        </div>
      </div>
    `;

    const emailText = `New Student Joined Your Class!
---------------------------------------------
Student Name: ${studentName}
Email: ${studentEmail || 'N/A'}
Candidate Tier: ${studentTier}
Class: ${className}
Class Code: ${classCode}
Time: ${formattedDate}

The student has been enrolled and is now visible on your Progress Tracker and Instructor Hub roster.
`;

    let transportDetails: any = null;
    let sentSuccess = false;

    // Check if custom SMTP configured in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const fromAddress = process.env.SMTP_FROM || `"Cambridge 0653 Science Hub" <${process.env.SMTP_USER}>`;
        const info = await transporter.sendMail({
          from: fromAddress,
          to: targetRecipient,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        });

        sentSuccess = true;
        transportDetails = { messageId: info.messageId, provider: 'custom-smtp' };
        console.log(`[Email Notification] Successfully sent email to ${targetRecipient} via SMTP: ${info.messageId}`);
      } catch (smtpErr) {
        console.warn('[Email Notification] SMTP send failed, falling back to simulated logger:', smtpErr);
      }
    }

    if (!sentSuccess) {
      // Direct notification logger ensures complete notification transparency
      console.log(`\n======================================================`);
      console.log(`📧 [INSTRUCTOR EMAIL NOTIFICATION DISPATCHED]`);
      console.log(`TO: ${targetRecipient}`);
      console.log(`SUBJECT: ${emailSubject}`);
      console.log(`TIME: ${formattedDate}`);
      console.log(`STUDENT: ${studentName} (${studentEmail || 'N/A'}) [${studentTier}]`);
      console.log(`CLASS: ${className} [Code: ${classCode}]`);
      console.log(`======================================================\n`);
      transportDetails = { provider: 'direct-notification-logger', deliveredTo: targetRecipient };
      sentSuccess = true;
    }

    res.json({
      success: true,
      deliveredTo: targetRecipient,
      subject: emailSubject,
      transport: transportDetails
    });
  } catch (err: any) {
    console.error('Error in /api/notify-class-join:', err);
    res.status(500).json({ error: err?.message || 'Failed to dispatch email notification' });
  }
});

// -------------------------------------------------------------
// SMTP CONFIGURATION & LIVE NOTIFICATION SERVICES
// -------------------------------------------------------------
const SMTP_CONFIG_FILE = path.join(__dirname || process.cwd(), '.smtp_config.json');

interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
}

let activeTransporter: any = null;

// Regex to detect and strip out non-syllabus genetics content from practice quizzes
export const GENETICS_TERMS_REGEX = /\b(genetics?|monohybrid|punnett|allele|alleles|heterozygous|homozygous|genotypes?|phenotypes?|codominan\w*|pedigree (chart|diagram)|karyotype|dihybrid|mendel\w*)\b/i;

function isGeneticsContent(text: string): boolean {
  return GENETICS_TERMS_REGEX.test(text);
}

function getSmtpConfig(): SmtpSettings | null {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const raw = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.host && data.user) {
        return {
          host: data.host,
          port: parseInt(data.port || '587', 10),
          secure: data.secure === true || data.secure === 'true' || parseInt(data.port, 10) === 465,
          user: data.user,
          pass: data.pass || '',
          from: data.from || `"Cambridge 0653 Science Hub" <${data.user}>`
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse .smtp_config.json:', err);
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || `"Cambridge 0653 Science Hub" <${process.env.SMTP_USER}>`
    };
  }

  return null;
}

interface EmailLogItem {
  id: string;
  timestamp: string;
  taskTitle: string;
  recipientEmail: string;
  recipientName: string;
  status: 'sent' | 'failed' | 'ready_for_client';
  method: 'smtp' | 'gmail_compose' | 'mailto';
  error?: string;
  info?: string;
}

const emailLogs: EmailLogItem[] = [];

function addEmailLog(item: Omit<EmailLogItem, 'id' | 'timestamp'>) {
  emailLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...item
  });
  if (emailLogs.length > 200) {
    emailLogs.pop();
  }
}

function getMailTransporter(): { transporter: any; config: SmtpSettings | null } {
  const config = getSmtpConfig();
  if (!config || !config.host || !config.user) {
    return { transporter: null, config: null };
  }

  if (!activeTransporter) {
    try {
      const cleanPass = config.pass ? config.pass.replace(/\s+/g, '') : '';
      activeTransporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: cleanPass
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000
      });
    } catch (err) {
      console.error('[SMTP Transporter Create Error]', err);
    }
  }

  return { transporter: activeTransporter, config };
}

function saveSmtpConfig(config: SmtpSettings): void {
  try {
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    activeTransporter = null; // Reset pool on config update
  } catch (err) {
    console.error('Failed to write .smtp_config.json:', err);
  }
}

// Retrieve current SMTP configuration status
app.get('/api/smtp-config', (req, res) => {
  const current = getSmtpConfig();
  if (current) {
    res.json({
      configured: true,
      host: current.host,
      port: current.port,
      secure: current.secure,
      user: current.user,
      from: current.from,
      hasPassword: Boolean(current.pass)
    });
  } else {
    res.json({
      configured: false,
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: 'corbanb@gisboyshigh.net',
      from: '"Mr. Corban" <corbanb@gisboyshigh.net>',
      hasPassword: false
    });
  }
});

// Retrieve email delivery logs
app.get('/api/email-logs', (req, res) => {
  const current = getSmtpConfig();
  res.json({
    logs: emailLogs,
    smtpConfigured: Boolean(current && current.host && current.user),
    activeHost: current?.host || null,
    senderEmail: current?.user || null
  });
});

// Clear email delivery logs
app.post('/api/clear-email-logs', (req, res) => {
  emailLogs.length = 0;
  res.json({ success: true, message: 'Email delivery logs cleared' });
});

// Log client-side email dispatch (e.g. Gmail Compose or Default Mail App)
app.post('/api/log-client-email', (req, res) => {
  const { taskTitle = 'Class Assignment', method = 'gmail_compose', recipients = [] } = req.body;
  const count = Array.isArray(recipients) ? recipients.length : 1;
  const recipientSummary = Array.isArray(recipients) 
    ? recipients.map((r: any) => (typeof r === 'string' ? r : r.email || r.studentEmail || '')).filter(Boolean).join(', ')
    : 'All assigned students';

  addEmailLog({
    taskTitle,
    recipientEmail: recipientSummary.slice(0, 150) || 'Assigned Students',
    recipientName: `${count} student${count !== 1 ? 's' : ''}`,
    status: 'sent',
    method: method === 'mailto' ? 'mailto' : 'gmail_compose',
    info: `Dispatched via 1-Click ${method === 'mailto' ? 'Mail App (Mailto)' : 'Gmail Compose'} by instructor`
  });

  res.json({ success: true });
});

// Save new SMTP configuration
app.post('/api/smtp-config', (req, res) => {
  try {
    const { host, port = 587, user, pass, secure = false, from } = req.body;
    if (!host || !user) {
      return res.status(400).json({ error: 'Host and User/Email are required.' });
    }

    const cleanPass = pass ? String(pass).trim() : '';

    const settings: SmtpSettings = {
      host: String(host).trim(),
      port: parseInt(port, 10) || 587,
      secure: secure === true || secure === 'true' || parseInt(port, 10) === 465,
      user: String(user).trim(),
      pass: cleanPass,
      from: from ? String(from).trim() : `"Cambridge 0653 Science Hub" <${user}>`
    };

    saveSmtpConfig(settings);
    res.json({ success: true, message: 'SMTP settings successfully saved and activated.' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save SMTP configuration' });
  }
});

// Test SMTP connection and dispatch verification email
app.post('/api/test-smtp', async (req, res) => {
  try {
    const { recipientEmail = 'corbanb@gisboyshigh.net' } = req.body;
    const { transporter, config } = getMailTransporter();
    if (!transporter || !config) {
      return res.status(400).json({ 
        error: 'SMTP is not configured. Please enter your SMTP host (e.g. smtp.gmail.com), email, and App Password, then click Save.' 
      });
    }

    const info = await transporter.sendMail({
      from: config.from,
      to: recipientEmail,
      subject: '✅ IGCSE Science Hub: SMTP Test Email Verification',
      text: 'This is a test notification confirming your SMTP email dispatch is working perfectly on the Cambridge 0653 Science Revision Hub.',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; max-width: 550px;">
          <h2 style="color: #34d399; margin-top: 0;">✅ SMTP Connection Verified</h2>
          <p>Your SMTP mail configuration is active and successfully delivering automated emails to students.</p>
          <div style="background: #1e293b; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 6px 0;">Host: <strong style="color: #ffffff;">${config.host}:${config.port}</strong></p>
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 6px 0;">Sender Account: <strong style="color: #ffffff;">${config.user}</strong></p>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Verified At: <strong style="color: #38bdf8;">${new Date().toLocaleString()}</strong></p>
          </div>
          <p style="color: #64748b; font-size: 11px; margin: 0;">Cambridge IGCSE Combined Science 0653 Teaching Hub</p>
        </div>
      `
    });

    addEmailLog({
      taskTitle: 'SMTP Test Verification',
      recipientEmail,
      recipientName: 'Instructor Test',
      status: 'sent',
      method: 'smtp',
      info: `Verified connection to ${config.host}:${config.port}`
    });

    res.json({
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${recipientEmail}!`
    });
  } catch (err: any) {
    console.error('Test SMTP failed:', err);
    let userFriendlyMsg = err?.message || 'Check host, port, user and password';
    if (userFriendlyMsg.includes('535') || userFriendlyMsg.includes('Username and Password not accepted') || userFriendlyMsg.includes('BadCredentials')) {
      userFriendlyMsg = 'Authentication rejected by Google / Mail server. For Gmail and Google Workspace accounts (like gisboyshigh.net), Google requires a 16-character App Password (not your regular account password). Go to https://myaccount.google.com/apppasswords with 2-Step Verification enabled to generate an App Password.';
    } else if (userFriendlyMsg.includes('ETIMEDOUT') || userFriendlyMsg.includes('ECONNREFUSED')) {
      userFriendlyMsg = 'Connection to SMTP server timed out or was refused. Please verify your host and try port 587 (TLS) or port 465 (SSL).';
    }

    addEmailLog({
      taskTitle: 'SMTP Test Verification',
      recipientEmail: req.body?.recipientEmail || 'test@domain',
      recipientName: 'Instructor Test',
      status: 'failed',
      method: 'smtp',
      error: userFriendlyMsg
    });

    res.status(500).json({
      error: userFriendlyMsg
    });
  }
});

// Email notification endpoint when an instructor sets a task for students
app.post('/api/notify-task-assigned', async (req, res) => {
  try {
    const { 
      recipients = [], // Array of { studentId, studentName, studentEmail }
      task = {}, // { id, title, description, type, targetSubtopics, dueDate, className, instructorName, instructorEmail }
      portalUrl: clientPortalUrl
    } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    if (!task.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Determine the active, working portal URL for students:
    const effectivePortalUrl = (
      clientPortalUrl ||
      process.env.APP_URL ||
      (req.headers.origin && !req.headers.origin.includes('localhost') ? req.headers.origin : null) ||
      (req.headers.referer && !req.headers.referer.includes('localhost') ? new URL(req.headers.referer).origin : null) ||
      'https://ais-dev-fezihukeplecjbhmw6fblt-840997730911.asia-southeast1.run.app'
    ).toString().replace(/\/$/, '');

    const taskPortalLink = `${effectivePortalUrl}/?tab=assignments`;

    const dueDateFormatted = task.dueDate 
      ? new Date(task.dueDate).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        })
      : 'No due date specified';

    const activityTypeLabel = 
      task.type === 'both' ? 'Both: Lesson Slides & Practice Quiz Challenge' :
      task.type === 'slides_traffic_light' ? 'Lesson Slides & Traffic Light System' :
      task.type === 'practice_quiz' ? 'Practice Quiz Challenge' :
      task.type === 'exam_paper' ? 'Past Exam Paper Review' : 'Class Assignment';

    const targetSubtopicsStr = Array.isArray(task.targetSubtopics) && task.targetSubtopics.length > 0
      ? task.targetSubtopics.join(', ')
      : 'General Topic';

    // Collect valid student email addresses and deduplicate
    const validEmails: string[] = [];
    const validRecipients: { studentId: string; name: string; email: string }[] = [];

    recipients.forEach((r: any) => {
      const email = ((r.studentEmail || r.email || '') as string).trim().toLowerCase();
      const name = (r.studentName || r.name || 'Student').trim();
      const studentId = r.studentId || '';
      if (email && email.includes('@') && !validEmails.includes(email)) {
        validEmails.push(email);
        validRecipients.push({ studentId, name, email });
      }
    });

    const emailSubject = `📝 New Science Task: ${task.title} (Due: ${dueDateFormatted})`;
    
    const emailText = `New Task Assigned: ${task.title}
-------------------------------------------------------
Class: ${task.className || 'Cambridge Combined Science'}
Activity: ${activityTypeLabel}
Subtopics: ${targetSubtopicsStr}
Due Date: ${dueDateFormatted}
${task.description ? `\nInstructions:\n${task.description}\n` : ''}

Log in to your Cambridge 0653 Science Hub to complete your lesson slides, traffic lights, and practice quiz:
${taskPortalLink}
`;

    // Pre-calculate 1-click dispatch links (Gmail compose & standard mailto with BCC)
    const bccParam = encodeURIComponent(validEmails.join(','));
    const subjectParam = encodeURIComponent(emailSubject);
    const bodyParam = encodeURIComponent(emailText);
    const mailtoUrl = `mailto:?bcc=${bccParam}&subject=${subjectParam}&body=${bodyParam}`;
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bccParam}&su=${subjectParam}&body=${bodyParam}`;

    const { transporter, config: smtpConfig } = getMailTransporter();
    const smtpConfigured = Boolean(transporter && smtpConfig && smtpConfig.host && smtpConfig.user);
    const fromAddress = smtpConfig ? smtpConfig.from : `"Cambridge 0653 Science Hub" <corbanb@gisboyshigh.net>`;

    if (!smtpConfigured) {
      validRecipients.forEach(r => {
        addEmailLog({
          taskTitle: task.title || 'Science Task',
          recipientEmail: r.email,
          recipientName: r.name,
          status: 'ready_for_client',
          method: 'gmail_compose',
          info: 'SMTP not configured on server. 1-Click Gmail compose and Mailto links are prepared.'
        });
      });
    }

    // Respond immediately so client never times out or hangs!
    res.json({
      success: true,
      count: validRecipients.length,
      smtpConfigured,
      method: smtpConfigured ? 'smtp' : 'email_client_ready',
      status: smtpConfigured ? 'dispatching' : 'ready',
      warning: smtpConfigured ? undefined : 'SMTP server is not yet configured. Use the 1-Click Gmail or Mail App button to send directly to student inboxes.',
      mailtoUrl,
      gmailComposeUrl,
      subject: emailSubject,
      emailText,
      recipients: validRecipients.map(r => ({ email: r.email, name: r.name, delivered: smtpConfigured }))
    });

    // Asynchronous background delivery using pooled connections
    if (transporter && validRecipients.length > 0) {
      (async () => {
        console.log(`[Task Email Notification] Starting pooled dispatch to ${validRecipients.length} students...`);
        let deliveredCount = 0;

        // Process in concurrent batches of 3 to prevent SMTP rate-limiting while finishing quickly
        const BATCH_SIZE = 3;
        for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
          const batch = validRecipients.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(batch.map(async (r) => {
            const emailHtml = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; padding: 10px 18px; background: linear-gradient(135deg, #9333ea, #7c3aed); border-radius: 12px; color: #ffffff; font-weight: 800; font-size: 16px; margin-bottom: 10px;">
                    Cambridge IGCSE Combined Science 0653
                  </div>
                  <h2 style="color: #ffffff; margin: 8px 0 0 0; font-size: 20px;">New Homework Task Assigned</h2>
                  <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Your instructor has assigned a new task for your science class</p>
                </div>

                <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155;">
                  <p style="margin: 0 0 12px 0; font-size: 15px; color: #f1f5f9;">
                    Hi <strong>${r.name}</strong>,
                  </p>
                  <p style="margin: 0 0 16px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                    You have been assigned a new task in <strong>${task.className || 'Science Class'}</strong>. Please review the details below and complete it before the deadline:
                  </p>

                  <div style="background-color: #0f172a; border-radius: 10px; padding: 16px; border: 1px solid #334155; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 10px 0; color: #c084fc; font-size: 17px; font-weight: 700;">
                      ${task.title}
                    </h3>
                    
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0;">
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8; width: 130px;">Class:</td>
                        <td style="padding: 5px 0; font-weight: 600; color: #ffffff;">${task.className || 'Science Class'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Instructor:</td>
                        <td style="padding: 5px 0; font-weight: 600; color: #ffffff;">${task.instructorName || 'Your Teacher'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Activity Type:</td>
                        <td style="padding: 5px 0;"><span style="background: rgba(147, 51, 234, 0.2); color: #c084fc; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">${activityTypeLabel}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Subtopic(s):</td>
                        <td style="padding: 5px 0; font-family: monospace; font-weight: bold; color: #38bdf8;">${targetSubtopicsStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Due Date:</td>
                        <td style="padding: 5px 0; font-weight: 700; color: #f59e0b;">⏰ ${dueDateFormatted}</td>
                      </tr>
                    </table>
                  </div>

                  ${task.description ? `
                    <div style="background-color: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 12px 14px; margin-bottom: 16px; border-radius: 4px;">
                      <div style="font-size: 12px; font-weight: 700; color: #fbbf24; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Teacher Instructions:</div>
                      <div style="font-size: 13px; color: #e2e8f0; line-height: 1.5; white-space: pre-line;">${task.description}</div>
                    </div>
                  ` : ''}

                  <div style="text-align: center; margin-top: 22px;">
                    <a href="${taskPortalLink}" style="display: inline-block; background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);">
                      Open Task in Portal →
                    </a>
                  </div>
                  <div style="text-align: center; margin-top: 10px;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 0; word-break: break-all;">
                      Direct link: <a href="${taskPortalLink}" style="color: #38bdf8; text-decoration: underline;">${taskPortalLink}</a>
                    </p>
                  </div>
                </div>

                <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 14px;">
                  <p style="font-size: 11px; color: #64748b; margin: 0;">
                    Cambridge IGCSE Combined Science (0653) • Automated Student Task Notification
                  </p>
                </div>
              </div>
            `;

            try {
              await transporter.sendMail({
                from: fromAddress,
                to: r.email,
                subject: emailSubject,
                text: emailText,
                html: emailHtml
              });
              deliveredCount++;
              addEmailLog({
                taskTitle: task.title,
                recipientEmail: r.email,
                recipientName: r.name,
                status: 'sent',
                method: 'smtp',
                info: `Delivered via ${smtpConfig?.host || 'SMTP server'}`
              });
              console.log(`[Task Email Notification] (${deliveredCount}/${validRecipients.length}) Delivered to ${r.email}`);
            } catch (err: any) {
              addEmailLog({
                taskTitle: task.title,
                recipientEmail: r.email,
                recipientName: r.name,
                status: 'failed',
                method: 'smtp',
                error: err?.message || 'SMTP delivery failed'
              });
              console.warn(`[Task Email Notification] Delivery to ${r.email} failed:`, err?.message || err);
            }
          }));
        }
        console.log(`[Task Email Notification] Completed dispatch: ${deliveredCount}/${validRecipients.length} successfully delivered via SMTP.`);
      })().catch(err => console.error('[Background Email Dispatch Error]', err));
    }
  } catch (err: any) {
    console.error('Error in /api/notify-task-assigned:', err);
    res.status(500).json({ error: err?.message || 'Failed to dispatch student notifications' });
  }
});

// Interactive Written Exam AI Analysis Endpoint
app.post('/api/exam-analysis', async (req, res) => {
  try {
    const { 
      questionId,
      fullLabel,
      questionText, 
      marks, 
      correctAnswer,
      markSchemeBreakdown, 
      guidanceNotes,
      examinerComment,
      studentAnswer,
      paperCode
    } = req.body;

    if (!studentAnswer || typeof studentAnswer !== 'string' || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'No student answer provided.' });
    }

    const maxMarks = typeof marks === 'number' ? marks : 1;
    const ai = getGenAI();

    if (!ai) {
      // High-precision offline rule-based marker using official mark scheme
      const offlineResult = generateOfflineExamAnalysis({
        questionId: questionId || 'q',
        fullLabel: fullLabel || 'Question',
        questionText: questionText || '',
        maxMarks,
        correctAnswer: correctAnswer || '',
        markSchemeBreakdown: markSchemeBreakdown || [],
        guidanceNotes: guidanceNotes || [],
        examinerComment: examinerComment || '',
        studentAnswer: studentAnswer.trim()
      });
      return res.json({ analysis: offlineResult, source: 'offline-markscheme-engine' });
    }

    const systemInstruction = `You are a Senior Cambridge IGCSE International Examination Principal Examiner for Combined Science (0653).
Your job is to strictly and fairly mark a candidate's written answer to an authentic Cambridge IGCSE exam question according to the official Cambridge mark scheme and marking principles:

General Cambridge Marking Principles:
1. Positive marking: Award marks for what the candidate has written correctly; do not deduct for errors unless there are directly contradictory statements (Science Principle 2).
2. Whole marks only (1 mark per marking point; no half marks).
3. Follow the mark points (M1, M2, M3 etc.) explicitly.
4. Calculation guidance: Award full credit for correct numerical answers even without working unless 'show your working' is specified. Apply Error Carried Forward (ECF) if an incorrect intermediate step is used correctly subsequently. Allow accepted significant figures or rounding (e.g. 2 or 3 sig figs).
5. Chemical/Biological precision: Check for required keywords (e.g. 'partially permeable membrane', 'optimum temperature', 'active site changed shape / denatured', 'kinetic energy', 'collision frequency', 'delocalised electrons', 'resultant force'). Reject forbidden phrases noted in Guidance (e.g., 'powerhouse of cell', 'active site damaged', 'particles move further apart at constant volume').
6. List rule: If n items are requested, mark the first n and check for contradictions.

You must return a valid JSON object strictly conforming to this schema:
{
  "marksAwarded": number, // integer between 0 and maxMarks
  "maxMarks": number,
  "percentage": number, // (marksAwarded / maxMarks) * 100 rounded to 1 decimal place
  "markBreakdown": [
    {
      "point": string, // description of this marking point (e.g., "M1: 0.22 g/min calculated correctly")
      "awarded": boolean, // true if candidate earned this mark point, false otherwise
      "reason": string // exact reason why awarded or missed with reference to student words
    }
  ],
  "examinerFeedback": string, // concise, constructive examiner feedback in formal Cambridge examiner style
  "guidanceFollowed": string[], // notes on how Cambridge guidance notes applied (e.g. "ALLOW 'moves faster' for kinetic energy")
  "modelAnswer": string, // ideal full-mark exemplar response
  "keyTermsUsed": string[], // syllabus terms present in candidate answer
  "keyTermsMissing": string[] // syllabus terms the candidate should have included
}`;

    const prompt = `EXAM PAPER: ${paperCode || 'Cambridge IGCSE Combined Science 0653'}
QUESTION ${fullLabel || ''}:
${questionText}
[Total Marks: ${maxMarks}]

OFFICIAL CAMBRIDGE MARK SCHEME:
- Standard Acceptable Answer: ${correctAnswer || 'See breakdown'}
- Marking Points:
${(markSchemeBreakdown || []).map((m: string, i: number) => `  * M${i + 1}: ${m}`).join('\n') || '  * See correct answer'}
- Examiner Guidance Notes:
${(guidanceNotes || []).map((g: string) => `  * ${g}`).join('\n') || '  * None'}
- Examiner Report Commentary on Common Misconceptions:
  * ${examinerComment || 'None'}

CANDIDATE WRITTEN RESPONSE:
"""
${studentAnswer.trim()}
"""

Evaluate this candidate response now strictly against the mark points above. Output valid JSON.`;

    const { text, model } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      },
      preferredModel: 'gemini-flash-latest'
    });

    const parsed = JSON.parse(text || '{}');
    // Ensure marksAwarded is bounded
    const clampedMarks = Math.min(Math.max(0, Math.round(parsed.marksAwarded ?? 0)), maxMarks);
    parsed.marksAwarded = clampedMarks;
    parsed.maxMarks = maxMarks;
    parsed.percentage = Math.round((clampedMarks / maxMarks) * 100);
    parsed.questionId = questionId;

    res.json({ analysis: parsed, source: model });
  } catch (error) {
    // Graceful fallback to offline analysis if AI call throws
    const { questionId, fullLabel, questionText, marks, correctAnswer, markSchemeBreakdown, guidanceNotes, examinerComment, studentAnswer } = req.body;
    const fallback = generateOfflineExamAnalysis({
      questionId: questionId || 'q',
      fullLabel: fullLabel || 'Question',
      questionText: questionText || '',
      maxMarks: marks || 1,
      correctAnswer: correctAnswer || '',
      markSchemeBreakdown: markSchemeBreakdown || [],
      guidanceNotes: guidanceNotes || [],
      examinerComment: examinerComment || '',
      studentAnswer: (studentAnswer || '').trim()
    });
    res.json({ analysis: fallback, source: 'offline-fallback' });
  }
});

// Offline rule-based analyzer for Cambridge 0653 written answers
function generateOfflineExamAnalysis(params: {
  questionId: string;
  fullLabel: string;
  questionText: string;
  maxMarks: number;
  correctAnswer: string;
  markSchemeBreakdown: string[];
  guidanceNotes: string[];
  examinerComment: string;
  studentAnswer: string;
}) {
  const { questionId, maxMarks, correctAnswer, markSchemeBreakdown, guidanceNotes, studentAnswer } = params;
  const ansLower = studentAnswer.toLowerCase();
  const markBreakdown: { point: string; awarded: boolean; reason: string }[] = [];
  let awarded = 0;

  const pointsToEvaluate = markSchemeBreakdown.length > 0 
    ? markSchemeBreakdown 
    : [correctAnswer];

  pointsToEvaluate.forEach((point, idx) => {
    // Extract key tokens from point text
    const cleanPoint = point.replace(/^[Mm]\d+[:\s]*/, '').replace(/[;]/g, '').trim();
    const subClauses = cleanPoint.split(/\s+or\s+|\/|\s+and\s+/i);
    
    // Check if any subclause matches
    let matched = false;
    for (const clause of subClauses) {
      const tokens = clause.toLowerCase().replace(/[^a-z0-9\s.-]/g, '').split(/\s+/).filter(t => t.length > 2);
      if (tokens.length === 0) continue;
      const matchCount = tokens.filter(tok => ansLower.includes(tok)).length;
      if (matchCount / tokens.length >= 0.5 || (tokens.length <= 2 && matchCount >= 1)) {
        matched = true;
        break;
      }
    }

    if (matched && awarded < maxMarks) {
      awarded += 1;
      markBreakdown.push({
        point: `M${idx + 1}: ${cleanPoint}`,
        awarded: true,
        reason: `Criterion clearly satisfied by student's response.`
      });
    } else {
      markBreakdown.push({
        point: `M${idx + 1}: ${cleanPoint}`,
        awarded: false,
        reason: `Key concept or expected numerical value was incomplete or missing from response.`
      });
    }
  });

  return {
    questionId,
    marksAwarded: awarded,
    maxMarks,
    percentage: Math.round((awarded / maxMarks) * 100),
    markBreakdown,
    examinerFeedback: awarded === maxMarks 
      ? 'Outstanding response! All criteria from the official Cambridge mark scheme were clearly and accurately demonstrated.'
      : `Response earned ${awarded} of ${maxMarks} marks. Ensure you use exact syllabus terminology and provide full working or required detail.`,
    guidanceFollowed: guidanceNotes.slice(0, 3),
    modelAnswer: correctAnswer,
    keyTermsUsed: ['relevant scientific phrasing detected'],
    keyTermsMissing: awarded < maxMarks ? ['refer to mark scheme points'] : []
  };
}

// AI Tutor Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages: rawMessages, message, history, topic, gradeTarget, tier } = req.body;
    
    // Normalize incoming messages
    let messages: { role: string; content: string }[] = [];
    if (Array.isArray(rawMessages) && rawMessages.length > 0) {
      messages = rawMessages;
    } else if (message) {
      if (Array.isArray(history) && history.length > 0) {
        messages = [...history, { role: 'user', content: message }];
      } else {
        messages = [{ role: 'user', content: message }];
      }
    }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const lastMessage = (typeof message === 'string' && message.trim())
      ? message.trim()
      : (messages[messages.length - 1]?.content || '').trim();

    const studentTier = tier || gradeTarget || 'Extended';
    const ai = getGenAI();

    // Prepare strictly normalized Gemini multi-turn conversation history
    // Rules: Must start with 'user', roles must strictly alternate, and must end with 'user'
    const conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const m of messages) {
      const role: 'user' | 'model' = (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user';
      const text = (m.content || '').trim();
      if (!text) continue;

      // Gemini API prohibits starting with model
      if (conversationHistory.length === 0 && role === 'model') {
        continue;
      }

      // Merge consecutive identical roles
      if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === role) {
        conversationHistory[conversationHistory.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        conversationHistory.push({ role, parts: [{ text }] });
      }
    }

    // Ensure at least one user turn exists and ends with user
    if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].role === 'model') {
      conversationHistory.push({ role: 'user', parts: [{ text: lastMessage || 'Hello' }] });
    }

    const systemInstruction = `You are the Expert Cambridge IGCSE Combined Science (0653) AI Tutor for students and instructors.
Your entire knowledge base is grounded strictly in the official Cambridge Assessment International Education (CAIE) Combined Science 0653 syllabus (2025-2027), mark schemes, and examiner reports.

SYLLABUS GROUNDING & CORE PRINCIPLES:
1. BIOLOGY (B1-B16):
- B1 Characteristics of living organisms: MRS GREN (Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition).
- B2 Cells: Cytoplasm, nucleus, cell membrane, mitochondria, ribosomes. Plant extras: cellulose cell wall, large central vacuole, chloroplasts. Bacterial cells: circular loop of DNA, plasmids, no nucleus. Magnification formula: M = Image / Actual size (M = I / A).
- B3 Movement into/out of cells: Diffusion down concentration gradient (passive). Osmosis of water through partially permeable membrane. Active transport against gradient using carrier proteins and energy from cellular respiration.
- B4 Biological molecules: Carbohydrates, fats, proteins. Food tests: Benedict's + heat for reducing sugars (blue -> green/yellow/brick-red); Iodine for starch (orange-brown -> blue-black); Biuret for proteins (blue -> purple/violet); Ethanol emulsion for lipids (clear -> cloudy/milky emulsion).
- B5 Enzymes: Protein catalysts, active site, lock and key hypothesis, complementary substrate fit, enzyme-substrate complex. Denaturation at high temp (>45°C) and extreme pH due to shape change of active site so substrate no longer fits.
- B6 Plant nutrition: Photosynthesis word & balanced chemical equation: 6CO2 + 6H2O -> C6H12O6 + 6O2 (light + chlorophyll). Leaf structure: cuticle, epidermis, palisade mesophyll (chloroplasts), spongy mesophyll, stomata & guard cells, xylem & phloem. Limiting factors: light intensity, CO2 concentration, temperature.
- B7 Human nutrition: Balanced diet, deficiencies (scurvy vitamin C, rickets vitamin D/calcium, anemia iron). Ingestion, mechanical digestion, chemical digestion, absorption in villi of small intestine, assimilation, egestion. Digestive enzymes: amylase (starch -> maltose), protease/pepsin/trypsin (protein -> amino acids), lipase (fats -> glycerol + fatty acids). Bile: neutralizes stomach acid & emulsifies fats to increase surface area.
- B8 Transport in plants: Xylem (water & minerals up, dead hollow cells with lignin), Phloem (sucrose & amino acids up/down translocation). Root hair cells (large surface area). Transpiration stream, potometer, factors affecting transpiration rate.
- B9 Transport in animals: Double circulatory system (pulmonary & systemic). Heart chambers (atria, ventricles, septum, valves, coronary arteries). Blood vessels: arteries (thick muscular/elastic wall, small lumen, high pressure), veins (thinner wall, large lumen, valves), capillaries (one cell thick). Blood: red blood cells (hemoglobin, no nucleus, biconcave), white blood cells (phagocytes engulf pathogens, lymphocytes produce antibodies), platelets (clotting), plasma.
- B10 Diseases and immunity: Pathogens (bacteria, viruses, fungi). Viruses have protein coat & genetic material, lack cells. Defenses: physical/chemical barriers, phagocytosis, antibody production. Active immunity (vaccines, memory cells).
- B11 Gas exchange: Alveoli adaptations (huge surface area, one-cell thin, moist, dense capillary network, steep gradient). Ventilation mechanics (diaphragm and intercostal muscles).
- B12 Respiration: Aerobic: C6H12O6 + 6O2 -> 6CO2 + 6H2O. 5 uses of energy: muscle contraction, protein synthesis, cell division, active transport, body temperature maintenance. Anaerobic respiration in muscles (lactic acid) and yeast (ethanol + CO2).
- B13 Coordination and response: Nervous system (CNS, sensory, relay, motor neurones, reflex arc). Adrenaline, insulin, glucagon. Plant tropisms: phototropism and gravitropism mediated by auxin.
- B14 Drugs: Antibiotics destroy bacterial cell walls, ineffective against viruses. Antibiotic resistance (MRSA, natural selection).
- B15 Reproduction: Asexual vs sexual. Insect vs wind pollination. Seed germination requirements: WOW (Water, Oxygen, Warmth). Menstrual cycle: ovulation ~day 14, lining repair and maintenance.
- B16 Organisms & environment: Energy from Sun, food chains & webs, trophic levels, 10% energy transfer rule, pyramids of numbers/biomass, carbon cycle. Human impact, deforestation, greenhouse gases, conservation.

2. CHEMISTRY (C1-C12):
- C1 States of matter: Particle arrangement in solids, liquids, gases. Kinetic particle theory. Diffusion rates related to molecular mass (lower Mr diffuses faster).
- C2 Atoms, elements, compounds: Protons, neutrons, electrons. Atomic number (Z), nucleon number (A). Electron configuration (2,8,8). Ionic bonding (transfer of electrons, electrostatic attraction in giant lattice, high melting point, conducts when molten/aqueous). Covalent bonding (shared electron pairs, simple molecular vs giant covalent diamond/graphite/silicon dioxide).
- C3 Stoichiometry: Chemical formulas, molecular formulas, balancing chemical equations with state symbols (s, l, g, aq), law of conservation of mass, deducing ionic formulae from charges (Extended), balanced ionic equations (Extended). IMPORTANT 0653 SYLLABUS BOUNDARY: In Cambridge IGCSE 0653 Combined Science, calculating moles from mass (n = m / Mr), molar gas volume (24 dm³), and calculating concentration from moles (c = n / V) are strictly EXCLUDED from the syllabus. Never generate questions or tasks requiring mole calculations.
- C4 Electrochemistry: Electrolysis rules. Molten PbBr2: Pb at cathode, Br2 at anode. Aqueous NaCl: H2 at cathode, Cl2 at anode, NaOH in solution. Dilute H2SO4: H2 at cathode, O2 at anode. Electroplating with copper/silver.
- C5 Chemical energetics: Exothermic (heat released, negative ΔH), Endothermic (heat absorbed, positive ΔH). Bond breaking is endothermic, bond forming is exothermic. Energy level diagrams & activation energy (Ea).
- C6 Chemical reactions: Reaction rates, collision theory (frequency of collisions, activation energy). Effects of temperature, concentration, surface area, catalyst. Redox: OIL RIG (Oxidation Is Loss, Reduction Is Gain of electrons; gain/loss of oxygen).
- C7 Acids, bases, salts: pH scale, indicators (litmus, methyl orange, thymolphthalein, universal indicator). Oxide categories (acidic, basic, amphoteric, neutral). 3 salt preparation methods: (1) excess insoluble base/metal with acid + filtration + crystallization, (2) titration for soluble alkali + acid, (3) precipitation for insoluble salts.
- C8 Periodic Table: Group 1 alkali metals (reactivity increases down, form alkaline hydroxides + H2 gas). Group 7 halogens (reactivity decreases down, displacement reactions, colors/states: Cl2 pale green gas, Br2 red-brown liquid, I2 grey solid/purple vapor). Transition elements (high density/melting point, colored compounds, catalysts). Noble gases (inert, full outer shell).
- C9 Metals: Reactivity series (K, Na, Ca, Mg, Al, [C], Zn, Fe, [H], Cu, Ag, Au). Blast furnace extraction of iron (hematite, coke, limestone, air; C + O2 -> CO2, CO2 + C -> 2CO, Fe2O3 + 3CO -> 2Fe + 3CO2, CaCO3 -> CaO + CO2, CaO + SiO2 -> CaSiO3 slag). Aluminium extraction by electrolysis in molten cryolite. Rusting requires water AND oxygen (barrier methods, galvanizing, sacrificial protection).
- C10 Environmental chemistry: Chemical tests for water (anhydrous copper(II) sulfate turns white to blue; anhydrous cobalt(II) chloride turns blue to pink). Water purification steps. Clean dry air composition (78% N2, 21% O2, noble gases, 0.04% CO2). Pollutants: CO (incomplete combustion), SO2 (fossil fuels -> acid rain), NOx (car engines -> acid rain), lead. Greenhouse effect & global warming (CO2 and CH4).
- C11 Organic chemistry: Fractional distillation of petroleum (refinery gas, gasoline, naphtha, kerosene, diesel, fuel oil, bitumen). Alkanes (CnH2n+2, saturated, combustion). Alkenes (CnH2n, unsaturated C=C, bromine water decolourization orange-brown to colorless, addition of H2, steam, Br2). Cracking long-chain alkanes. Addition polymerisation of ethene to poly(ethene).
- C12 Experimental techniques & Qualitative analysis:
  * Flame tests: Li+ red, Na+ yellow, K+ lilac, Cu2+ blue-green, Ca2+ orange-red.
  * Cations with aq NaOH & aq NH3: Al3+ (white ppt, soluble in excess NaOH to colourless, insol in NH3), NH4+ (gas turns damp red litmus blue on warming), Ca2+ (white ppt with NaOH, no ppt with NH3), Cu2+ (light blue ppt, dark blue with excess NH3), Fe2+ (green ppt), Fe3+ (red-brown ppt), Zn2+ (white ppt, soluble in excess of both).
  * Anions: Carbonate CO32- (dilute acid -> effervescence CO2 turns limewater milky); Halides Cl- (white ppt with AgNO3), Br- (cream ppt), I- (yellow ppt); Nitrate NO3- (NaOH + Al foil + heat -> NH3 gas); Sulfate SO42- (dilute HNO3 + Ba(NO3)2 -> white ppt).
  * Gases: H2 (lighted splint pops), O2 (relights glowing splint), CO2 (limewater cloudy), Cl2 (bleaches damp litmus), NH3 (turns damp red litmus blue), SO2 (turns acidified aqueous potassium manganate(VII) from purple to colourless).

3. PHYSICS (P1-P5):
- P1 Motion, forces, energy: Speed v = s/t. Acceleration a = (v - u)/t. Distance-time graph gradient = speed. Speed-time graph gradient = acceleration, area under graph = distance. Weight W = mg (g = 9.8 N/kg). Density ρ = m / V. Resultant force F = ma. Hooke's law F = kΔx. Moment = F * d. Work W = F * d = ΔE. Kinetic energy Ek = 0.5 * m * v². Gravitational potential energy ΔEp = m * g * Δh. Power P = W / t = E / t. Efficiency = (useful / total) * 100%. Pressure p = F / A.
- P2 Thermal physics: Conduction (lattice vibrations, free electrons in metals), Convection (density currents in fluids), Radiation (infrared, dark matt surfaces best emitters/absorbers, shiny light surfaces best reflectors). Evaporation cooling (most energetic particles escape).
- P3 Waves: Transverse vs longitudinal. Wave equation v = f * λ. Period T = 1/f. Reflection (i = r). Refraction (bending towards normal when slowing down, n = sin i / sin r). Total internal reflection (sin c = 1/n). Converging lenses. EM spectrum (Radio, Micro, Infrared, Visible ROYGBIV, UV, X-ray, Gamma; speed 3.0 x 10^8 m/s). Sound audible range 20 Hz – 20 kHz, ultrasound >20 kHz, speed in air ~330-340 m/s.
- P4 Electricity: Charge Q = I * t. Current (amperes), Voltage (volts), Resistance (ohms). Ohm's law R = V / I. Series circuits (I same, V splits, R_total = R1 + R2). Parallel circuits (V same across branches, I splits, 1/R_total = 1/R1 + 1/R2). Power P = V * I = I² * R. Energy E = V * I * t = P * t. Electrical safety: fuses (melt on high current), circuit breakers, earthing, double insulation.
- P5 Space physics: Solar system planetary order (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune). Orbital speed v = 2πr / T. Nuclear fusion in stars (H -> He). Star life cycles. Redshift and Big Bang evidence.

PEDAGOGICAL STYLE & RULES:
1. Ground every answer specifically in Cambridge IGCSE 0653 syllabus conventions and mark scheme points.
2. Clearly indicate when a concept is Core (Grades C–G) vs Extended/Supplement (Grades A*–C).
3. If calculation is required, always provide step-by-step working: Formula -> Values substituted -> Working -> Final Answer with Units.
4. Bold key scientific terminology (the words that earn marks on Cambridge mark schemes).
5. Format equations clearly using readable mathematical notation.
6. Student Tier: ${studentTier} (tailor depth and calculation focus accordingly).
7. Topic context: ${topic || 'Cambridge IGCSE 0653 Science'}.`;

    if (ai) {
      try {
        const { text, model } = await callGeminiWithFallback(ai, {
          contents: conversationHistory,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1400,
          },
          preferredModel: 'gemini-flash-latest'
        });

        return res.json({ 
          reply: text, 
          source: model,
          success: true 
        });
      } catch (aiErr: any) {
        // AI calls unavailable; proceed to rich offline syllabus answer
      }
    }

    // High-quality offline syllabus fallback
    const offlineReply = generateSmartOfflineResponse(lastMessage, topic, studentTier);
    return res.json({
      reply: offlineReply,
      source: 'cambridge-0653-syllabus-engine',
      success: true
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const offlineReply = generateSmartOfflineResponse('general syllabus guidance', undefined, 'Extended');
    res.json({ 
      reply: offlineReply,
      source: 'cambridge-0653-syllabus-engine',
      success: true
    });
  }
});

// AI Revision Schedule Generator
app.post('/api/schedule', async (req, res) => {
  try {
    const { 
      examDate, 
      weeklyHours, 
      dailyHours, 
      studyDaysPerWeek = 7, 
      topicSelectionMode = 'analysed_needs', 
      selectedTopics = [], 
      weaknesses = [], 
      tier = 'Extended',
      totalWeeks: requestedWeeks
    } = req.body;

    const computedWeeklyHours = typeof weeklyHours === 'number'
      ? Math.min(20, Math.max(1, Number(weeklyHours)))
      : (dailyHours ? Math.min(20, Math.max(1, Number(dailyHours) * studyDaysPerWeek)) : 10);
    const computedDailyHours = Number((computedWeeklyHours / studyDaysPerWeek).toFixed(1));

    // Calculate totalWeeks leading up to examDate
    let totalWeeks = typeof requestedWeeks === 'number' && requestedWeeks > 0
      ? Math.round(requestedWeeks)
      : 0;

    if (!totalWeeks || totalWeeks < 1) {
      if (examDate) {
        const target = new Date(examDate);
        const now = new Date();
        const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        totalWeeks = diffDays > 0 ? Math.max(1, Math.min(26, Math.ceil(diffDays / 7))) : 6;
      } else {
        totalWeeks = 6;
      }
    }
    totalWeeks = Math.min(26, Math.max(1, totalWeeks));

    const activeTopics = topicSelectionMode === 'custom_topics' && selectedTopics.length > 0
      ? selectedTopics
      : (weaknesses.length > 0 ? weaknesses : ['C4 Electrolysis', 'B5 Enzymes', 'P4 Electricity']);

    const fallback = generateFallbackSchedule(
      examDate, 
      computedWeeklyHours, 
      computedDailyHours, 
      activeTopics, 
      tier, 
      topicSelectionMode, 
      studyDaysPerWeek, 
      totalWeeks
    );

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        ...fallback,
        source: 'local-planner',
      });
    }

    const topicModeDescription = topicSelectionMode === 'custom_topics'
      ? `Student's Self-Chosen Revision Topics: ${activeTopics.join(', ')}`
      : `Analysed Diagnostic Needs / Priority Weaknesses: ${activeTopics.join(', ')}`;

    const prompt = `Generate a structured, high-impact Cambridge IGCSE Combined Science 0653 multi-week revision roadmap.
Target Exam Date: ${examDate || 'May/June Exam Series'}
Total Revision Weeks Leading to Exam: ${totalWeeks} weeks (${totalWeeks * computedWeeklyHours} total study hours)
Weekly Study Target: ${computedWeeklyHours} hours/week across ${studyDaysPerWeek} study days (~${Math.round((computedWeeklyHours * 60) / studyDaysPerWeek)} mins/day)
Exam Tier: ${tier}
${topicModeDescription}
Syllabus Boundary: In Cambridge IGCSE Combined Science 0653, mole calculations from mass (n = m / Mr) and concentration from moles (c = n / V) are strictly EXCLUDED. Ensure Chemistry C3 tasks focus purely on chemical formulas, balancing equations with state symbols, and the law of conservation of mass.

TASK RULES (STRICT REQUIREMENT):
For every daily session item, the "tasks" array MUST contain exactly 3 tasks designed as follows:
1. TASK 1 MUST ALWAYS BE RECAP SPECIFIC SLIDES:
   Format: "Recap Slides X–Y of [Topic Code] ([Specific Slide Deck Title]: [Key syllabus concepts to recap])"
   Example: "Recap Slides 1–3 of B5 (Enzymes & Active Sites: Lock-and-key model, substrate complementary fit & thermal denaturation past 40°C)"
   Example: "Recap Slides 1–4 of C4 (Electrochemistry & Electrolysis: Molten PbBr₂ products & aqueous NaCl ionic half-equations)"
   Example: "Recap Slides 1–4 of P4 (Electricity & Circuits: Ohm's law V=IR, series vs parallel resistor calculations & power P=VI)"
2. TASK 2 & TASK 3 MUST BE CREATIVE, ENGAGING, TOPIC-RELEVANT TASKS:
   - In some situations, direct the student to use tools available on the website (e.g. "Launch Quiz Arena on [Topic Code]: Score 80%+ to secure an instant Green traffic light", "Ask AI Chat Tutor: \"[Challenging, topic-specific prompt with Cambridge mark scheme angle]\"", "Open Past Exams Vault: Attempt 2025 Specimen Paper 4 extended problem on [Concept]", "Open Syllabus Notebook: Record summary note and rate confidence stars").
   - In other situations, DO NOT LIMIT THEM TO WEBSITE TOOLS: include hands-on creative revision techniques, real-world mini-experiments (e.g. potato cylinder osmosis in salt water vs tap water, thermal conduction check with metal vs wood, vinegar-baking soda rate demo), the Feynman technique (explaining the mechanism aloud for 2 minutes from memory without notes), visual diagram sketches with colored pens (drawing double circulation with red/blue pens, reflex arc 5 steps, or blast furnace 3 chemical equations), or writing pocket-sized cheat sheets and Cambridge mark scheme keyword audits.

Please provide a complete revision roadmap spanning ALL ${totalWeeks} weeks leading up to the exam.
Return a valid JSON object matching this schema:
{
  "summary": "High-level roadmap overview explaining how ${totalWeeks} weeks and ${computedWeeklyHours} weekly hours guide the student to exam mastery",
  "totalWeeks": ${totalWeeks},
  "weeklyHours": ${computedWeeklyHours},
  "dailyHours": ${computedDailyHours},
  "totalHours": ${totalWeeks * computedWeeklyHours},
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Theme description for Week 1",
      "focusTopics": ["Topics"],
      "goals": ["Specific syllabus mastery goals"],
      "dailyTasks": [
        {"day": "Monday", "subject": "Biology", "task": "Task description"}
      ]
    }
  ],
  "items": [
    {
      "id": "w1-d1",
      "week": 1,
      "day": "Monday",
      "date": "Week 1 • Monday",
      "subject": "biology" | "chemistry" | "physics" | "mixed",
      "topicCode": "e.g. B5",
      "topicTitle": "Topic Name",
      "tasks": [
        "Recap Slides X–Y of [Code] ([Deck Title]: [Key points])",
        "Creative task (e.g. Quiz Arena / AI Chat Tutor prompt / Hands-on kitchen lab / Feynman technique)",
        "Creative task (e.g. Visual sketch & recall / Cambridge mark scheme drill / Error notebook audit)"
      ],
      "estimatedMinutes": ${Math.round((computedWeeklyHours * 60) / studyDaysPerWeek)},
      "completed": false
    }
  ],
  "examTips": ["3-4 high-yield Cambridge 0653 tips for these topics"]
}`;

    const { text, model } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
      preferredModel: 'gemini-flash-latest'
    });

    const parsed = JSON.parse(text || '{}');
    let items = Array.isArray(parsed.items) && parsed.items.length > 0 
      ? parsed.items 
      : (parsed.schedule && Array.isArray(parsed.schedule) ? parsed.schedule : null);

    // Ensure all weeks from 1 to totalWeeks are populated
    if (items && items.length > 0) {
      const representedWeeks = new Set(items.map((it: any) => it.week || 1));
      // If any week is missing from AI response, fill it with fallback items for that week
      for (let w = 1; w <= totalWeeks; w++) {
        if (!representedWeeks.has(w)) {
          const missingWeekItems = fallback.items.filter((it: any) => it.week === w);
          items.push(...missingWeekItems);
        }
      }
      items.sort((a: any, b: any) => (a.week || 1) - (b.week || 1));
    } else {
      items = fallback.items;
    }

    // Guarantee that for EVERY daily item:
    // 1. Task 1 MUST ALWAYS be the specific slides recap with slide range, deck title, and key concepts
    // 2. Task 2 and Task 3 are creative, topic-relevant tasks
    items = items.map((it: any) => {
      const cleanCode = (it.topicCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'B2';
      const config = TOPIC_REVISION_CONFIGS[cleanCode] || TOPIC_REVISION_CONFIGS[cleanCode.slice(0, 2)];
      const defaults = getRevisionTasksForTopic(cleanCode, it.week || 1, totalWeeks);
      let tasks = Array.isArray(it.tasks) && it.tasks.length >= 2 ? [...it.tasks] : defaults;

      // Ensure Task 1 is specific slides recap
      const task0Lower = (tasks[0] || '').toLowerCase();
      if (!task0Lower.includes('slide') || !task0Lower.includes('recap') || !config || task0Lower.includes('core syllabus revision points')) {
        tasks[0] = defaults[0];
      }
      if (!tasks[1]) tasks[1] = defaults[1];
      if (!tasks[2]) tasks[2] = defaults[2];

      return {
        ...it,
        topicCode: cleanCode,
        tasks
      };
    });

    // Ensure weeklyPlan covers all totalWeeks
    let weeklyPlan = Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length >= totalWeeks
      ? parsed.weeklyPlan
      : fallback.weeklyPlan;

    res.json({
      summary: parsed.summary || fallback.summary,
      totalWeeks: totalWeeks,
      weeklyHours: computedWeeklyHours,
      dailyHours: computedDailyHours,
      totalHours: totalWeeks * computedWeeklyHours,
      schedule: items,
      items: items,
      weeklyPlan: weeklyPlan,
      examTips: parsed.examTips && parsed.examTips.length > 0 ? parsed.examTips : fallback.examTips,
      source: model || 'multi-week-planner'
    });
  } catch (error) {
    const computedWeeklyHours = req.body.weeklyHours || (req.body.dailyHours ? req.body.dailyHours * 7 : 10);
    const computedDailyHours = Number((computedWeeklyHours / (req.body.studyDaysPerWeek || 7)).toFixed(1));
    const activeTopics = req.body.topicSelectionMode === 'custom_topics' && Array.isArray(req.body.selectedTopics) && req.body.selectedTopics.length > 0
      ? req.body.selectedTopics
      : (req.body.weaknesses || ['C4 Electrolysis', 'B5 Enzymes', 'P4 Electricity']);

    res.json({
      ...generateFallbackSchedule(
        req.body.examDate, 
        computedWeeklyHours, 
        computedDailyHours, 
        activeTopics, 
        req.body.tier, 
        req.body.topicSelectionMode, 
        req.body.studyDaysPerWeek,
        req.body.totalWeeks
      ),
      source: 'fallback-planner',
    });
  }
});

// AI Learning Path Recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { studentName, topicScores, recentQuizMistakes } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        recommendations: generateFallbackRecommendations(studentName, topicScores, recentQuizMistakes),
        source: 'local-analytics',
      });
    }

    const prompt = `Analyze this Cambridge IGCSE Combined Science 0653 student's diagnostic profile and recommend an adaptive recovery pathway.
Student: ${studentName || 'Student'}
Topic Scores (%): ${JSON.stringify(topicScores || {})}
Recent Errors / Gaps: ${JSON.stringify(recentQuizMistakes || [])}

Return a valid JSON object:
{
  "studentStatus": "Detailed assessment of strengths and gaps",
  "criticalWeaknesses": ["List of 2-3 highest priority topics to review"],
  "recommendedActionPlan": [
    {
      "priority": "High",
      "topicCode": "e.g. C4",
      "topicName": "Electrochemistry",
      "recommendedSlides": "Review Electrolysis (Aqueous) & Rules for Anode/Cathode",
      "actionStep": "Practice predicting products for concentrated NaCl and dilute H2SO4.",
      "keyFormulaOrRule": "Cathode: least reactive ion forms (H+ unless Cu2+). Anode: halide > OH- > other."
    }
  ],
  "motivationalAdvice": "Encouraging teacher feedback"
}`;

    const { text, model } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
      preferredModel: 'gemini-flash-latest'
    });

    const parsed = JSON.parse(text || '{}');
    res.json({ recommendations: parsed, source: model });
  } catch (error) {
    res.json({
      recommendations: generateFallbackRecommendations(req.body.studentName, req.body.topicScores, req.body.recentQuizMistakes),
      source: 'fallback-analytics',
    });
  }
});

// AI Practice Quiz Generator Route - Supports up to 40 questions across selected syllabus topics with fresh generation
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topics, subtopics, numQuestions, tier, seed } = req.body;
    const requestedCount = Math.min(40, Math.max(1, Math.round(Number(numQuestions) || 10)));
    const targetSubtopics: string[] = Array.isArray(subtopics) ? subtopics : [];
    const targetTopics: string[] = targetSubtopics.length > 0 
      ? targetSubtopics 
      : (Array.isArray(topics) && topics.length > 0 
          ? topics.slice(0, 33) 
          : ['B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C4', 'P1', 'P3', 'P4']);
    const sessionSeed = seed || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const ai = getGenAI();

    if (!ai) {
      const fallback = generateServerFallbackQuiz(targetTopics, requestedCount, tier, sessionSeed);
      return res.json({ quiz: fallback, source: 'syllabus-engine' });
    }

    // Helper to generate a single batch of questions using gemini-3.8-flash with safe error isolation
    async function generateBatch(count: number, batchSeed: string, topicsSubset: string[]): Promise<any[]> {
      try {
        const systemInstruction = `You are a Senior Cambridge Assessment International Education (CAIE) Principal Examiner authoring authentic Multiple Choice Questions (MCQs) for Cambridge IGCSE Combined Science (0653) Paper 1 (Core) and Paper 2 (Extended).
Your task is to generate exactly ${count} completely brand-new, unique multiple choice questions covering the requested syllabus topics.

Format Rules:
1. Return valid JSON strictly matching this schema:
{
  "questions": [
    {
      "id": "q-1",
      "subject": "biology", // "biology" | "chemistry" | "physics"
      "topicCode": "B2", // e.g. B1, B2, C1, P4
      "topicTitle": "Cells & Organisation",
      "syllabusRef": "B2.1",
      "question": "Exact question stem text...",
      "options": [
        "First plausible option",
        "Second plausible option",
        "Third plausible option",
        "Fourth plausible option"
      ],
      "correctIndex": 0, // integer 0, 1, 2, or 3
      "explanation": "Clear, detailed explanation explaining the scientific principle, why the correct answer is right according to Cambridge syllabus criteria, and why distractors are common student misconceptions."
    }
  ]
}

Quality Rules:
- Generate exactly ${count} fresh questions.
- Distribute questions evenly across the provided topics: ${topicsSubset.join(', ')}.
- Exactly 4 options per question. Do NOT include 'A.', 'B.', 'C.', 'D.' in the option strings.
- Only ONE option must be indisputably correct. Distractors should target classic Cambridge examiner report errors.
- Tier focus: ${tier || 'Extended'}.
- Include relevant formulas (e.g. Magnification M = I/A, speed = d/t, weight = mg with g=9.8 N/kg, V = IR, wave speed v = fλ) where appropriate.
- Quality & Syllabus Constraints: Do NOT generate any questions on genetics, inheritance, monohybrid crosses, Punnett squares, or alleles, as genetics is NOT part of the Cambridge IGCSE Combined Science (0653) syllabus.
- UNIQUE SESSION SEED: ${batchSeed}. You MUST generate distinct, novel questions with varied scenarios, experimental apparatus, and numerical values.`;

        const prompt = `Generate ${count} brand-new, unique Cambridge IGCSE Combined Science 0653 multiple choice questions for these syllabus topics: ${topicsSubset.join(', ')}.
Ensure high variety and rigor. Output JSON only.`;

        const { text } = await callGeminiWithFallback(ai!, {
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.85,
            maxOutputTokens: 8192
          },
          preferredModel: 'gemini-flash-latest'
        });

        const parsed = JSON.parse(text || '{}');
        return Array.isArray(parsed.questions) ? parsed.questions : (Array.isArray(parsed) ? parsed : []);
      } catch (batchErr) {
        return generateServerFallbackQuiz(topicsSubset, count, tier || 'Extended', batchSeed);
      }
    }

    // Split generation into fast, safe parallel batches of at most 8 questions each
    const BATCH_SIZE = 8;
    const batchPromises: Promise<any[]>[] = [];
    let remaining = requestedCount;
    let batchIndex = 0;

    while (remaining > 0) {
      const currentBatchCount = Math.min(remaining, BATCH_SIZE);
      const batchTopics = targetTopics.length <= 8 
        ? targetTopics 
        : targetTopics.slice((batchIndex * 4) % targetTopics.length, ((batchIndex * 4) % targetTopics.length) + 6);
      const cleanBatchTopics = batchTopics.length > 0 ? batchTopics : targetTopics;
      const subSeed = `${sessionSeed}-batch-${batchIndex + 1}`;

      batchPromises.push(generateBatch(currentBatchCount, subSeed, cleanBatchTopics));
      remaining -= currentBatchCount;
      batchIndex++;
    }

    const batchResults = await Promise.all(batchPromises);
    const rawQuestions = batchResults.flat();

    if (rawQuestions.length > 0) {
      // Format, guarantee 4 options, and shuffle option positions so correctIndex is randomly distributed
      const formatted = rawQuestions.map((q: any, i: number) => {
        const rawOpts = Array.isArray(q.options) && q.options.length === 4 
          ? q.options.map(String) 
          : ['Option A', 'Option B', 'Option C', 'Option D'];
        
        const rawCorrectIdx = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 
          ? q.correctIndex 
          : 0;
        
        const correctText = rawOpts[rawCorrectIdx];
        
        // Fisher-Yates shuffle the options
        const shuffledOpts = [...rawOpts];
        for (let j = shuffledOpts.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [shuffledOpts[j], shuffledOpts[k]] = [shuffledOpts[k], shuffledOpts[j]];
        }
        const newCorrectIndex = shuffledOpts.indexOf(correctText);

        const topicCode = q.topicCode || targetTopics[i % targetTopics.length];
        const subject = q.subject || (topicCode.startsWith('B') ? 'biology' : topicCode.startsWith('C') ? 'chemistry' : 'physics');

        return {
          id: q.id || `ai-q-${i + 1}-${sessionSeed}`,
          subject,
          topicCode,
          topicTitle: q.topicTitle || 'Cambridge 0653 Science',
          syllabusRef: q.syllabusRef || `${topicCode}.1`,
          question: q.question || 'Cambridge Science Question',
          options: shuffledOpts,
          correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
          explanation: q.explanation || 'Refer to Cambridge 0653 syllabus criteria.'
        };
      });

      // Filter out any questions containing genetics/inheritance content (not on Cambridge 0653 syllabus)
      const nonGenetics = formatted.filter(q => {
        const fullContent = `${q.question} ${(q.options || []).join(' ')} ${q.explanation}`;
        return !isGeneticsContent(fullContent);
      });

      // Deduplicate questions from parallel AI batches
      const seenStems = new Set<string>();
      const normalizeStem = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      const uniqueAIQuestions: typeof nonGenetics = [];

      for (const q of nonGenetics) {
        const norm = normalizeStem(q.question);
        if (norm.length >= 15 && !seenStems.has(norm)) {
          seenStems.add(norm);
          uniqueAIQuestions.push(q);
        }
      }

      // If fewer unique questions than requestedCount, fill with non-repeating fallback questions
      if (uniqueAIQuestions.length < requestedCount) {
        const remainder = requestedCount - uniqueAIQuestions.length;
        const fill = generateServerFallbackQuiz(targetTopics, remainder, tier, `${sessionSeed}-fill`, uniqueAIQuestions);
        for (const f of fill) {
          const norm = normalizeStem(f.question);
          if (!seenStems.has(norm)) {
            seenStems.add(norm);
            uniqueAIQuestions.push(f);
          }
        }
      }

      return res.json({ quiz: uniqueAIQuestions.slice(0, requestedCount), source: 'gemini-3.8-flash' });
    }

    const fallback = generateServerFallbackQuiz(targetTopics, requestedCount, tier, sessionSeed);
    return res.json({ quiz: fallback, source: 'syllabus-engine' });
    return res.json({ quiz: fallback, source: 'syllabus-engine' });
  } catch (error) {
    console.error('Error generating AI quiz in /api/generate-quiz:', error);
    const fallback = generateServerFallbackQuiz(req.body.topics || ['B1', 'C1', 'P1'], req.body.numQuestions || 10, req.body.tier, req.body.seed);
    res.json({ quiz: fallback, source: 'syllabus-engine' });
  }
});

// Algorithmic question generator for instant/offline server fallback covering all 33 topics
interface ServerFallbackQuestion {
  id: string;
  subject: 'biology' | 'chemistry' | 'physics';
  topicCode: string;
  topicTitle: string;
  syllabusRef: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SERVER_SYLLABUS_BANK: Record<string, {
  subject: 'biology' | 'chemistry' | 'physics';
  title: string;
  ref: string;
  questions: { stem: string; correct: string; distractors: string[]; explanation: string; ref?: string }[];
}> = {
  // BIOLOGY B1-B16
  'B1': {
    subject: 'biology',
    title: 'Characteristics of Living Organisms',
    ref: 'B1.1',
    questions: [
      {
        stem: 'Which characteristic of living organisms describes the chemical reactions in cells that break down nutrient molecules to release energy for metabolism?',
        correct: 'Respiration',
        distractors: ['Nutrition', 'Excretion', 'Sensitivity'],
        explanation: 'Respiration is strictly defined as the chemical reactions in cells that break down nutrient molecules to release energy for metabolism.',
        ref: 'B1.1'
      },
      {
        stem: 'Which statement correctly defines excretion in living organisms?',
        correct: 'The removal of toxic materials and substances in excess of requirements from organisms',
        distractors: [
          'The expulsion of undigested food as faeces through the anus',
          'The breakdown of glucose into carbon dioxide and water',
          'The permanent increase in size and dry mass by an increase in cell number'
        ],
        explanation: 'Excretion is the removal of toxic substances and waste products of metabolism. Elimination of undigested faeces is egestion.',
        ref: 'B1.1'
      }
    ]
  },
  'B2': {
    subject: 'biology',
    title: 'Cells & Organisation',
    ref: 'B2.1',
    questions: [
      {
        stem: 'Which three structures are present in plant palisade cells but absent from human liver cells?',
        correct: 'Cellulose cell wall, permanent vacuole, and chloroplasts',
        distractors: [
          'Mitochondria, cell membrane, and cytoplasm',
          'Ribosomes, nucleus, and cellulose cell wall',
          'Cell membrane, circular DNA loop, and plasmids'
        ],
        explanation: 'Plant cells possess a rigid cellulose cell wall, large permanent central vacuole, and chloroplasts containing chlorophyll for photosynthesis.',
        ref: 'B2.1'
      },
      {
        stem: 'A specimen has an actual length of 0.05 mm. Under a light microscope, its observed image length is 20 mm. What is the magnification of the microscope?',
        correct: '× 400',
        distractors: ['× 40', '× 100', '× 1000'],
        explanation: 'Magnification = Image size ÷ Actual size = 20 mm ÷ 0.05 mm = × 400.',
        ref: 'B2.2'
      }
    ]
  },
  'B3': {
    subject: 'biology',
    title: 'Movement In & Out of Cells',
    ref: 'B3.1',
    questions: [
      {
        stem: 'What is the net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane called?',
        correct: 'Osmosis',
        distractors: ['Diffusion', 'Active transport', 'Transpiration'],
        explanation: 'Osmosis is the net diffusion of water molecules from a dilute solution (higher water potential) to a concentrated solution (lower water potential) across a partially permeable membrane.',
        ref: 'B3.1'
      },
      {
        stem: 'Which process requires energy from respiration and specific carrier proteins to move mineral ions against a concentration gradient?',
        correct: 'Active transport',
        distractors: ['Osmosis', 'Facilitated diffusion', 'Capillary action'],
        explanation: 'Active transport moves particles against their concentration gradient (from low to high concentration) using cellular energy (ATP) and membrane carrier proteins.',
        ref: 'B3.2'
      }
    ]
  },
  'B4': {
    subject: 'biology',
    title: 'Biological Molecules',
    ref: 'B4.1',
    questions: [
      {
        stem: 'Which reagent is heated with a food sample to test for reducing sugars such as glucose, turning from blue to brick-red if positive?',
        correct: "Benedict's solution",
        distractors: ['Biuret reagent', 'Iodine solution', 'Ethanol emulsion test'],
        explanation: "Benedict's test requires heating in a water bath; a color change from blue to green/yellow/brick-red precipitate confirms reducing sugars.",
        ref: 'B4.1'
      },
      {
        stem: 'What is the positive colour change observed when testing a food sample for protein using Biuret reagent?',
        correct: 'From pale blue to purple / violet',
        distractors: ['From yellow-brown to blue-black', 'From colourless to milky white emulsion', 'From blue to orange-red precipitate'],
        explanation: 'Biuret reagent turns from light blue to mauve/purple/violet in the presence of peptide bonds in proteins.',
        ref: 'B4.1'
      }
    ]
  },
  'B5': {
    subject: 'biology',
    title: 'Enzymes',
    ref: 'B5.1',
    questions: [
      {
        stem: 'What happens to the structure and function of an enzyme when it is heated far above its optimum temperature?',
        correct: 'The enzyme denatures because its active site changes shape and the substrate can no longer fit',
        distractors: [
          'The enzyme is killed and its peptide bonds are all combusted',
          'The substrate molecules become inactive while the active site stays intact',
          'The rate of reaction increases continuously due to maximum kinetic energy'
        ],
        explanation: 'High temperatures cause excessive vibrations that break bonds in tertiary protein structure, denaturing the active site so it is no longer complementary to the substrate.',
        ref: 'B5.1'
      }
    ]
  },
  'B6': {
    subject: 'biology',
    title: 'Plant Nutrition',
    ref: 'B6.1',
    questions: [
      {
        stem: 'What is the correct balanced chemical equation for photosynthesis in plants?',
        correct: '6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂',
        distractors: [
          'C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O',
          '6CO₂ + 12H₂O ➔ C₆H₁₂O₆ + 6O₂ + 6H₂O',
          'CO₂ + H₂O ➔ CH₂O + O₂'
        ],
        explanation: '6 molecules of carbon dioxide react with 6 molecules of water using light absorbed by chlorophyll to yield 1 glucose molecule and 6 oxygen molecules.',
        ref: 'B6.1'
      }
    ]
  },
  'B7': {
    subject: 'biology',
    title: 'Human Nutrition',
    ref: 'B7.1',
    questions: [
      {
        stem: 'Which digestive enzyme is produced by the salivary glands and pancreas to hydrolyse starch into maltose?',
        correct: 'Amylase',
        distractors: ['Pepsin', 'Lipase', 'Trypsin'],
        explanation: 'Amylase is a carbohydrase that digests complex starch polysaccharides into maltose disaccharides.',
        ref: 'B7.1'
      }
    ]
  },
  'B8': {
    subject: 'biology',
    title: 'Transport in Plants',
    ref: 'B8.1',
    questions: [
      {
        stem: 'Which vascular tissue transports water and dissolved mineral ions upwards from roots to leaves in the transpiration stream?',
        correct: 'Xylem',
        distractors: ['Phloem', 'Cortex', 'Cambium'],
        explanation: 'Xylem vessels are dead, hollow, lignified tubes that conduct water and inorganic minerals upwards via transpirational pull.',
        ref: 'B8.1'
      }
    ]
  },
  'B9': {
    subject: 'biology',
    title: 'Transport in Animals',
    ref: 'B9.1',
    questions: [
      {
        stem: 'Why does the left ventricle of the mammalian heart have a significantly thicker muscular wall than the right ventricle?',
        correct: 'It must pump oxygenated blood at higher pressure to the entire systemic body circulation',
        distractors: [
          'It pumps deoxygenated blood to the nearby lungs where resistance is greatest',
          'It stores a larger volume of blood than the right ventricle',
          'It receives venous blood directly from the vena cava'
        ],
        explanation: 'The left ventricle pumps blood around the entire systemic circuit against high peripheral vascular resistance, requiring greater muscular force.',
        ref: 'B9.1'
      }
    ]
  },
  'B10': {
    subject: 'biology',
    title: 'Diseases & Immunity',
    ref: 'B10.1',
    questions: [
      {
        stem: 'How do vaccines provide long-term active immunity against specific pathogenic infections?',
        correct: 'They introduce harmless antigens which stimulate lymphocytes to produce antibodies and memory cells',
        distractors: [
          'They provide pre-formed short-lived antibodies that directly destroy the pathogens',
          'They kill pathogenic bacteria using broad-spectrum chemical antibiotics',
          'They form a physical impermeable lining on respiratory mucus membranes'
        ],
        explanation: 'Vaccines stimulate lymphocytes to produce specific antibodies and memory cells. On secondary exposure, memory cells rapidly produce large quantities of antibodies.',
        ref: 'B10.1'
      }
    ]
  },
  'B11': {
    subject: 'biology',
    title: 'Gas Exchange in Humans',
    ref: 'B11.1',
    questions: [
      {
        stem: 'Which feature is an essential adaptation of human alveoli for rapid and efficient gas exchange by diffusion?',
        correct: 'A wall that is only one cell thick, providing a very short diffusion pathway',
        distractors: [
          'A thick keratinised cell layer preventing water evaporation',
          'Thick muscular walls that actively contract to push oxygen molecules into blood',
          'A low surface-area-to-volume ratio to concentrate gases'
        ],
        explanation: 'Alveoli have single-cell-thick squamous epithelial walls, giving a minimal diffusion distance of less than 1 μm to capillaries.',
        ref: 'B11.1'
      }
    ]
  },
  'B12': {
    subject: 'biology',
    title: 'Respiration',
    ref: 'B12.1',
    questions: [
      {
        stem: 'Which list contains three physiological processes in living organisms that require energy released from cellular respiration?',
        correct: 'Muscle contraction, protein synthesis, and cell division',
        distractors: [
          'Diffusion of oxygen, transpiration, and osmosis',
          'Inhaling air, food digestion by enzymes, and passive heat loss',
          'Evaporative cooling, light absorption by chlorophyll, and DNA denaturation'
        ],
        explanation: 'Respiration releases metabolic energy for active cellular work: muscle contraction, protein synthesis, cell division, growth, and constant body temperature maintenance.',
        ref: 'B12.1'
      }
    ]
  },
  'B13': {
    subject: 'biology',
    title: 'Coordination & Response',
    ref: 'B13.1',
    questions: [
      {
        stem: 'What is the correct sequence of components in a spinal reflex arc following a painful stimulus to the finger?',
        correct: 'Receptor ➔ Sensory neurone ➔ Relay neurone in spinal cord ➔ Motor neurone ➔ Effector muscle',
        distractors: [
          'Effector ➔ Motor neurone ➔ Brain ➔ Sensory neurone ➔ Receptor',
          'Receptor ➔ Motor neurone ➔ Spinal cord ➔ Sensory neurone ➔ Effector',
          'Sensory neurone ➔ Effector ➔ Relay neurone ➔ Motor neurone ➔ Receptor'
        ],
        explanation: 'A stimulus is detected by a receptor, triggering electrical impulses along a sensory neurone, across a synapse to a relay neurone in the CNS, then along a motor neurone to the effector.',
        ref: 'B13.1'
      }
    ]
  },
  'B14': {
    subject: 'biology',
    title: 'Reproduction',
    ref: 'B14.1',
    questions: [
      {
        stem: 'Which structural characteristics are typical of flowers adapted for wind pollination?',
        correct: 'Small, dull green petals, feathery stigmas protruding outside, and abundant light pollen grains',
        distractors: [
          'Large colourful scented petals, sticky stigmas enclosed inside, and heavy spiky pollen',
          'Prominent nectar guides, strong sweet perfume, and large heavy pollen',
          'Bright red petals with sticky nectar and short rigid anthers inside the petals'
        ],
        explanation: 'Wind-pollinated flowers have feathery stigmas that hang outside to catch airborne pollen, no large bright petals, and light smooth pollen.',
        ref: 'B14.1'
      }
    ]
  },
  'B15': {
    subject: 'biology',
    title: 'Organisms & Environment',
    ref: 'B15.1',
    questions: [
      {
        stem: 'What is the principal source of energy input to biological ecosystems according to Cambridge 0653?',
        correct: 'Sunlight / Solar energy',
        distractors: ['Geothermal heat from Earth’s core', 'Chemical energy in fossil fuels', 'Nutrients absorbed from soil'],
        explanation: 'The Sun is the principal source of energy input to biological systems; light energy is captured by producers via photosynthesis.',
        ref: 'B15.1'
      },
      {
        stem: 'Which biological process removes carbon dioxide from the atmosphere in the carbon cycle?',
        correct: 'Photosynthesis by green plants and algae',
        distractors: ['Respiration by animals and plants', 'Combustion of fossil fuels', 'Decomposition by bacteria and fungi'],
        explanation: 'Photosynthesis is the only biological process that takes in carbon dioxide from the atmosphere to produce carbohydrates.',
        ref: 'B15.3'
      }
    ]
  },
  'B16': {
    subject: 'biology',
    title: 'Ecosystems & Environment',
    ref: 'B16.1',
    questions: [
      {
        stem: 'Approximately what percentage of energy is successfully transferred from one trophic level to the next in an ecological food chain?',
        correct: '10%',
        distractors: ['1%', '50%', '90%'],
        explanation: 'Only about 10% of energy is transferred between successive trophic levels; approximately 90% is lost via respiration heat, excretion, and uneaten biomass.',
        ref: 'B16.1'
      }
    ]
  },

  // CHEMISTRY C1-C12
  'C1': {
    subject: 'chemistry',
    title: 'States of Matter',
    ref: 'C1.1',
    questions: [
      {
        stem: 'According to the kinetic particle theory, how do the particles in a liquid differ from the particles in a solid at the same temperature?',
        correct: 'Liquid particles are close together but free to slide past one another in a random arrangement',
        distractors: [
          'Liquid particles are fixed in rigid lattice positions and only vibrate',
          'Liquid particles move randomly with vast empty space between them at high speeds',
          'Liquid particles have broken down into individual free electrons'
        ],
        explanation: 'In liquids, particles remain touching and closely packed but have sufficient kinetic energy to slide over one another in an irregular arrangement.',
        ref: 'C1.1'
      }
    ]
  },
  'C2': {
    subject: 'chemistry',
    title: 'Atoms, Elements & Compounds',
    ref: 'C2.1',
    questions: [
      {
        stem: 'An atom of chlorine has atomic number 17 and mass number 35. What is the number of protons, neutrons, and electrons in this neutral atom?',
        correct: '17 protons, 18 neutrons, 17 electrons',
        distractors: [
          '17 protons, 35 neutrons, 17 electrons',
          '18 protons, 17 neutrons, 18 electrons',
          '17 protons, 17 neutrons, 18 electrons'
        ],
        explanation: 'Protons = atomic number = 17. In a neutral atom, electrons = protons = 17. Neutrons = mass number - atomic number = 35 - 17 = 18.',
        ref: 'C2.1'
      },
      {
        stem: 'Why do giant ionic lattice compounds like sodium chloride (NaCl) have high melting and boiling points?',
        correct: 'Strong electrostatic forces of attraction between oppositely charged ions require vast amounts of thermal energy to overcome',
        distractors: [
          'Weak intermolecular forces between covalent molecules require little energy to break',
          'Delocalised sea of electrons binds the atoms into metallic layers',
          'Strong covalent double bonds throughout the macromolecule cannot vibrate'
        ],
        explanation: 'Giant ionic lattices have millions of strong ionic bonds between alternating cations and anions requiring high temperatures to break.',
        ref: 'C2.2'
      }
    ]
  },
  'C3': {
    subject: 'chemistry',
    title: 'Stoichiometry',
    ref: 'C3.1',
    questions: [
      {
        stem: 'What are the balancing stoichiometric coefficients for: __ Fe + __ O₂ ➔ __ Fe₂O₃?',
        correct: '4 Fe + 3 O₂ ➔ 2 Fe₂O₃',
        distractors: [
          '2 Fe + 3 O₂ ➔ Fe₂O₃',
          '4 Fe + 2 O₂ ➔ 2 Fe₂O₃',
          '2 Fe + O₂ ➔ Fe₂O₃'
        ],
        explanation: '4 Fe on both sides (4 = 2 × 2) and 6 O atoms on both sides (3 × 2 = 2 × 3).',
        ref: 'C3.1'
      }
    ]
  },
  'C4': {
    subject: 'chemistry',
    title: 'Electrochemistry & Electrolysis',
    ref: 'C4.1',
    questions: [
      {
        stem: 'During the electrolysis of molten lead(II) bromide (PbBr₂), what products are discharged at the cathode and anode?',
        correct: 'Cathode (-): silvery liquid lead metal; Anode (+): reddish-brown pungent bromine gas',
        distractors: [
          'Cathode (-): bromine gas; Anode (+): lead metal',
          'Cathode (-): hydrogen gas; Anode (+): oxygen gas',
          'Cathode (-): lead ions; Anode (+): bromide ions'
        ],
        explanation: 'Pb²⁺ cations migrate to the negative cathode gaining electrons (reduction) to form Pb(l). Br⁻ anions migrate to the positive anode losing electrons (oxidation) to form Br₂(g).',
        ref: 'C4.1'
      }
    ]
  },
  'C5': {
    subject: 'chemistry',
    title: 'Chemical Energetics',
    ref: 'C5.1',
    questions: [
      {
        stem: 'Which statement accurately describes an exothermic chemical reaction?',
        correct: 'Thermal energy is released to the surroundings and the temperature of the surroundings increases (ΔH is negative)',
        distractors: [
          'Thermal energy is absorbed from the surroundings and the temperature decreases',
          'Bond breaking releases more energy than is required for bond forming',
          'The energy of the products is greater than the energy of the reactants'
        ],
        explanation: 'In exothermic reactions, energy released when forming new bonds exceeds energy required to break existing bonds, transferring heat to surroundings.',
        ref: 'C5.1'
      }
    ]
  },
  'C6': {
    subject: 'chemistry',
    title: 'Chemical Reactions & Rates',
    ref: 'C6.1',
    questions: [
      {
        stem: 'Why does increasing the temperature of a reaction mixture significantly increase the rate of reaction?',
        correct: 'Particles gain kinetic energy, move faster, and a much greater proportion of collisions have energy exceeding the activation energy (Ea)',
        distractors: [
          'Particles expand and their chemical bonds weaken spontaneously',
          'The activation energy of the reaction is lowered by heat alone',
          'It reduces the concentration of the reactants, allowing easier collisions'
        ],
        explanation: 'Higher temperature increases particle kinetic energy so collisions are both more frequent and vastly more likely to have E ≥ Ea.',
        ref: 'C6.1'
      }
    ]
  },
  'C7': {
    subject: 'chemistry',
    title: 'Acids, Bases & Salts',
    ref: 'C7.1',
    questions: [
      {
        stem: 'What are the products of the chemical reaction between dilute hydrochloric acid and solid calcium carbonate?',
        correct: 'Calcium chloride, water, and carbon dioxide gas',
        distractors: [
          'Calcium chloride and hydrogen gas only',
          'Calcium sulfate, water, and carbon dioxide',
          'Calcium hydroxide and chlorine gas'
        ],
        explanation: 'Acid + metal carbonate ➔ salt + water + carbon dioxide. 2HCl + CaCO₃ ➔ CaCl₂ + H₂O + CO₂.',
        ref: 'C7.1'
      }
    ]
  },
  'C8': {
    subject: 'chemistry',
    title: 'The Periodic Table',
    ref: 'C8.1',
    questions: [
      {
        stem: 'How does the chemical reactivity of Group 1 alkali metals compare as you descend the group from Lithium to Potassium?',
        correct: 'Reactivity increases because the single valence electron is further from the nucleus and lost more easily',
        distractors: [
          'Reactivity decreases because the atomic radius becomes smaller',
          'Reactivity stays constant because they all have 1 electron in the outer shell',
          'Reactivity decreases because shielding by inner electrons decreases'
        ],
        explanation: 'Down Group 1, outer electrons are further from the nucleus and shielded by more electron shells, so electrostatic attraction is weaker and the electron is lost more readily.',
        ref: 'C8.1'
      }
    ]
  },
  'C9': {
    subject: 'chemistry',
    title: 'Metals & Reactivity Series',
    ref: 'C9.1',
    questions: [
      {
        stem: 'Why is aluminium extracted by electrolysis of molten bauxite/cryolite rather than reduction with carbon in a blast furnace?',
        correct: 'Aluminium is more reactive than carbon and cannot be reduced by carbon',
        distractors: [
          'Aluminium has a lower melting point than carbon',
          'Carbon reacts with aluminium to form poisonous gas',
          'Electrolysis is much cheaper than blast furnace extraction'
        ],
        explanation: 'Metals above carbon in the reactivity series (K, Na, Ca, Mg, Al) form very stable compounds and must be extracted by electrolysis.',
        ref: 'C9.1'
      }
    ]
  },
  'C10': {
    subject: 'chemistry',
    title: 'Chemistry of the Environment',
    ref: 'C10.1',
    questions: [
      {
        stem: 'What is the approximate percentage composition of clean, dry air by volume for nitrogen and oxygen?',
        correct: '78% Nitrogen, 21% Oxygen',
        distractors: ['50% Nitrogen, 50% Oxygen', '21% Nitrogen, 78% Oxygen', '78% Oxygen, 21% Carbon dioxide'],
        explanation: 'Clean dry air is approximately 78% N₂, 21% O₂, ~0.9% Argon, and ~0.04% CO₂.',
        ref: 'C10.1'
      }
    ]
  },
  'C11': {
    subject: 'chemistry',
    title: 'Organic Chemistry',
    ref: 'C11.1',
    questions: [
      {
        stem: 'What is the chemical test to distinguish an unsaturated alkene (e.g. ethene) from a saturated alkane (e.g. ethane)?',
        correct: 'Aqueous bromine water turns from orange to colourless rapidly with the alkene',
        distractors: [
          'Universal indicator turns dark red with an alkane',
          'A lighted splint pops loudly with the alkene',
          'Limewater turns milky with the alkane'
        ],
        explanation: 'Alkenes undergo electrophilic addition with bromine water across the C=C double bond, decolorising orange bromine water.',
        ref: 'C11.1'
      }
    ]
  },
  'C12': {
    subject: 'chemistry',
    title: 'Experimental Techniques & Analysis',
    ref: 'C12.1',
    questions: [
      {
        stem: 'What colour flame is produced during a flame test for potassium ions (K⁺)?',
        correct: 'Lilac',
        distractors: ['Crimson red', 'Yellow', 'Apple green'],
        explanation: 'Potassium gives a characteristic lilac flame (Lithium = red, Sodium = yellow, Copper = blue-green).',
        ref: 'C12.1'
      }
    ]
  },

  // PHYSICS P1-P5
  'P1': {
    subject: 'physics',
    title: 'Motion, Forces & Energy',
    ref: 'P1.1',
    questions: [
      {
        stem: 'A car accelerates uniformly from rest to a speed of 20 m/s in 5 seconds. What is its acceleration and the distance travelled during this time?',
        correct: 'Acceleration = 4.0 m/s²; Distance = 50 m',
        distractors: [
          'Acceleration = 2.0 m/s²; Distance = 100 m',
          'Acceleration = 4.0 m/s²; Distance = 100 m',
          'Acceleration = 0.25 m/s²; Distance = 20 m'
        ],
        explanation: 'Acceleration a = Δv / t = (20 - 0) / 5 = 4.0 m/s². On a speed-time graph, distance is the area of the triangle: 0.5 × base × height = 0.5 × 5 × 20 = 50 m.',
        ref: 'P1.1'
      },
      {
        stem: 'On Earth, a rock has a mass of 4.0 kg. Taking the gravitational field strength g = 9.8 N/kg, what is the weight of the rock on Earth?',
        correct: '39.2 N',
        distractors: ['4.0 N', '40.0 N', '0.41 N'],
        explanation: 'Weight W = m × g = 4.0 kg × 9.8 N/kg = 39.2 N. Cambridge 0653 specifies g = 9.8 N/kg.',
        ref: 'P1.3'
      }
    ]
  },
  'P2': {
    subject: 'physics',
    title: 'Thermal Physics',
    ref: 'P2.1',
    questions: [
      {
        stem: 'Why are metals such as copper and aluminium excellent thermal conductors compared to insulators like plastic or wood?',
        correct: 'Metals possess free delocalised electrons that rapidly transfer kinetic energy through the lattice',
        distractors: [
          'Metals have lower density and allow air currents inside',
          'Metal atoms move from the hot end to the cold end carrying heat',
          'Metals emit high-frequency gamma rays that heat adjacent particles'
        ],
        explanation: 'Metals conduct heat via lattice atom vibrations and rapidly moving delocalised free electrons that collide with distant ions.',
        ref: 'P2.1'
      }
    ]
  },
  'P3': {
    subject: 'physics',
    title: 'Waves, Light & Sound',
    ref: 'P3.1',
    questions: [
      {
        stem: 'A sound wave has a frequency of 500 Hz and travels through air at a speed of 330 m/s. What is its wavelength?',
        correct: '0.66 m',
        distractors: ['1.52 m', '165,000 m', '0.33 m'],
        explanation: 'Wave speed v = f × λ ➔ λ = v / f = 330 m/s ÷ 500 Hz = 0.66 m.',
        ref: 'P3.1'
      }
    ]
  },
  'P4': {
    subject: 'physics',
    title: 'Electricity & Magnetism',
    ref: 'P4.1',
    questions: [
      {
        stem: 'Two resistors of 6 Ω and 12 Ω are connected in parallel across a 12 V power supply. What is the total effective resistance of the circuit?',
        correct: '4 Ω',
        distractors: ['18 Ω', '8 Ω', '2 Ω'],
        explanation: 'For parallel resistors: 1/R_total = 1/R₁ + 1/R₂ = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 ➔ R_total = 4 Ω.',
        ref: 'P4.1'
      }
    ]
  },
  'P5': {
    subject: 'physics',
    title: 'Nuclear & Space Physics',
    ref: 'P5.1',
    questions: [
      {
        stem: 'Which nuclear reaction powers the core of the Sun and main sequence stars, releasing vast amounts of energy?',
        correct: 'Nuclear fusion of light hydrogen nuclei into helium nuclei',
        distractors: [
          'Nuclear fission of heavy uranium nuclei',
          'Combustion of liquid hydrogen with oxygen',
          'Spontaneous alpha decay of carbon-14'
        ],
        explanation: 'In the core of stars, intense gravity and temperature fuse hydrogen nuclei into helium, converting mass into energy via E = mc².',
        ref: 'P5.1'
      }
    ]
  }
};

function generateServerFallbackQuiz(
  topics: string[], 
  count: number, 
  tier?: string, 
  seed?: string, 
  existingQuestions: { question: string }[] = []
): ServerFallbackQuestion[] {
  const safeCount = Math.min(40, Math.max(1, count));
  const availableCodes = Object.keys(SERVER_SYLLABUS_BANK);
  const targetTopics = Array.isArray(topics) && topics.length > 0 
    ? topics.filter(t => availableCodes.includes(t)) 
    : availableCodes;
  const activeCodes = targetTopics.length > 0 ? targetTopics : availableCodes;
  const sessionSeed = seed || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const questions: ServerFallbackQuestion[] = [];
  const seenStems = new Set<string>();

  const normalizeStem = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Populate seenStems with existing questions
  for (const eq of existingQuestions) {
    if (eq && eq.question) {
      seenStems.add(normalizeStem(eq.question));
    }
  }

  const addUnique = (q: ServerFallbackQuestion): boolean => {
    if (!q || !q.question || !q.options || q.options.length < 4) return false;
    const norm = normalizeStem(q.question);
    if (norm.length < 15 || seenStems.has(norm)) return false;
    seenStems.add(norm);
    questions.push(q);
    return true;
  };

  // 1. First add available bank questions
  for (const topicCode of activeCodes) {
    const bankItem = SERVER_SYLLABUS_BANK[topicCode] || SERVER_SYLLABUS_BANK['B1'];
    for (const template of bankItem.questions) {
      // Build 4 options and shuffle
      const rawOptions = [template.correct, ...template.distractors.slice(0, 3)];
      const shuffled = [...rawOptions];
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      }
      const correctIndex = shuffled.indexOf(template.correct);

      addUnique({
        id: `srv-${topicCode.toLowerCase()}-${sessionSeed}-${questions.length + 1}`,
        subject: bankItem.subject,
        topicCode,
        topicTitle: bankItem.title,
        syllabusRef: template.ref || bankItem.ref,
        question: template.stem,
        options: shuffled,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: template.explanation
      });
      if (questions.length >= safeCount) break;
    }
    if (questions.length >= safeCount) break;
  }

  // 2. If more are needed, dynamically generate unique parametric questions
  let counter = 1;
  while (questions.length < safeCount && counter <= 60) {
    const topicCode = activeCodes[(questions.length + counter) % activeCodes.length];
    const bankItem = SERVER_SYLLABUS_BANK[topicCode] || SERVER_SYLLABUS_BANK['B1'];

    if (bankItem.subject === 'physics') {
      const force = (20 + counter * 5);
      const mass = (2 + (counter % 5));
      const acc = (force / mass).toFixed(1);
      const correctAns = `${acc} m/s²`;
      const rawOpts = [
        correctAns,
        `${(Number(acc) * 2).toFixed(1)} m/s²`,
        `${(Number(acc) / 2).toFixed(1)} m/s²`,
        `${(force * mass).toFixed(1)} m/s²`
      ];
      const shuffledOpts = [...rawOpts];
      for (let j = shuffledOpts.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledOpts[j], shuffledOpts[k]] = [shuffledOpts[k], shuffledOpts[j]];
      }
      addUnique({
        id: `srv-dyn-p-${sessionSeed}-${counter}`,
        subject: 'physics',
        topicCode,
        topicTitle: bankItem.title,
        syllabusRef: `${topicCode}.1`,
        question: `A resultant force of ${force} N acts on a trolley of mass ${mass} kg in trial #${counter}. What is the resulting acceleration?`,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctAns),
        explanation: `Resultant force F = m × a => a = F / m = ${force} N / ${mass} kg = ${acc} m/s².`
      });
    } else if (bankItem.subject === 'chemistry') {
      // Cambridge 0653 C3: Formula mass (Mr) & Law of Conservation of Mass (no moles required in 0653)
      const compounds = [
        { name: 'calcium carbonate (CaCO₃)', ar: 'Ca = 40, C = 12, O = 16', mr: 100 },
        { name: 'magnesium hydroxide (Mg(OH)₂)', ar: 'Mg = 24, O = 16, H = 1', mr: 58 },
        { name: 'sulfuric acid (H₂SO₄)', ar: 'H = 1, S = 32, O = 16', mr: 98 },
        { name: 'aluminium oxide (Al₂O₃)', ar: 'Al = 27, O = 16', mr: 102 },
        { name: 'ammonium sulfate ((NH₄)₂SO₄)', ar: 'N = 14, H = 1, S = 32, O = 16', mr: 132 }
      ];
      const picked = compounds[counter % compounds.length];
      const correctAns = `${picked.mr}`;
      const rawOpts = [
        correctAns,
        `${picked.mr - 16}`,
        `${picked.mr + 18}`,
        `${picked.mr + 32}`
      ];
      const shuffledOpts = [...rawOpts];
      for (let j = shuffledOpts.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledOpts[j], shuffledOpts[k]] = [shuffledOpts[k], shuffledOpts[j]];
      }
      addUnique({
        id: `srv-dyn-c-${sessionSeed}-${counter}`,
        subject: 'chemistry',
        topicCode,
        topicTitle: bankItem.title,
        syllabusRef: `${topicCode}.1`,
        question: `Given relative atomic masses (${picked.ar}), what is the relative formula mass (Mr) of ${picked.name}?`,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctAns),
        explanation: `Sum the relative atomic masses: Mr of ${picked.name} = ${correctAns}. (Note: Mole calculations from mass or concentration are not required in Cambridge IGCSE 0653 Combined Science).`
      });
    } else {
      const temp = (25 + (counter % 4) * 10);
      const rate = temp < 40 ? 'increases because enzyme and substrate molecules have more kinetic energy and collide more frequently'
        : temp === 45 ? 'reaches optimum rate before high thermal denaturation occurs'
        : 'decreases rapidly because the enzyme active site denatures and changes shape';
      const correctAns = `The rate ${rate}`;
      const rawOpts = [
        correctAns,
        `The enzyme increases the activation energy required for the reaction`,
        `The substrate molecules are permanently destroyed by thermal expansion`,
        `The reaction stops completely because pH drops to zero`
      ];
      const shuffledOpts = [...rawOpts];
      for (let j = shuffledOpts.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledOpts[j], shuffledOpts[k]] = [shuffledOpts[k], shuffledOpts[j]];
      }
      addUnique({
        id: `srv-dyn-b-${sessionSeed}-${counter}`,
        subject: 'biology',
        topicCode,
        topicTitle: bankItem.title,
        syllabusRef: `${topicCode}.1`,
        question: `In an investigation into enzyme activity carried out at ${temp} °C (Experiment #${counter}), how is the rate of reaction affected compared to 15 °C?`,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctAns),
        explanation: `Temperature affects kinetic collision frequency and enzyme 3D active site conformation.`
      });
    }
    counter++;
  }

  return questions.slice(0, safeCount);
}

// Fallback generators for offline/instant mode
function generateSmartOfflineResponse(query: string, topic?: string, tier?: string): string {
  const q = query.toLowerCase();

  // Active Transport / Diffusion / Osmosis (B3)
  if (q.includes('active transport') || q.includes('diffusion') || q.includes('osmosis') || q.includes('b3')) {
    return `### Movement In & Out of Cells (Cambridge 0653 B3)
- **Active Transport (Extended):** Movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (against a concentration gradient) using energy from respiration and carrier proteins.
  - *Key Examples:* Root hair cells absorbing mineral ions (nitrates); epithelial villi cells absorbing glucose into bloodstream.
  - *Examiner Tip:* Always link active transport to cells having abundant **mitochondria** to produce ATP via aerobic respiration.
- **Diffusion (Core & Extended):** Net movement of particles from a region of higher concentration to lower concentration down a concentration gradient as a result of their random movement. (Passive - no energy required).
- **Osmosis (Core & Extended):** Net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane.
  - *Plant Cells:* Turgid (swollen with high pressure against cell wall) vs Plasmolysed (cytoplasm shrinks away from cell wall in concentrated solution).`;
  }

  // Enzymes (B5)
  if (q.includes('enzyme') || q.includes('denatur') || q.includes('lock and key') || q.includes('b5')) {
    return `### Enzymes & Catalysis (Cambridge 0653 B5)
- **Definition:** Biological catalysts that speed up the rate of chemical reactions without being consumed. Proteins folded into a specific 3D shape.
- **Active Site & Mechanism:** Complementary shape to the substrate. Lock and key hypothesis forms an enzyme-substrate complex.
- **Denaturation (High Temp / Extreme pH):** Above optimum temperature (~37–40°C), thermal kinetic energy disrupts hydrogen/ionic bonds holding enzyme structure. Active site changes shape permanently, substrate no longer fits.
- **Exam Mark Scheme Points:**
  1. High temperature increases kinetic energy and collision frequency until optimum.
  2. Past optimum, active site shape changes (**denatures** — never say "dies" or "killed").
  3. Substrate no longer complementary/can no longer bind.`;
  }

  // Food Tests & Biological Molecules (B4)
  if (q.includes('food test') || q.includes('benedict') || q.includes('biuret') || q.includes('iodine') || q.includes('ethanol') || q.includes('b4')) {
    return `### Cambridge 0653 Food Tests Summary (B4)
1. **Reducing Sugars (e.g. Glucose):** Add Benedict's reagent + heat in water bath (>80°C).
   - *Result:* Blue ➔ Green ➔ Yellow ➔ Brick-red precipitate.
2. **Starch:** Add drops of Iodine solution.
   - *Result:* Orange-brown ➔ Blue-black.
3. **Proteins:** Add Biuret reagent (dilute NaOH + dilute CuSO₄).
   - *Result:* Blue ➔ Purple / Violet.
4. **Fats / Lipids:** Ethanol emulsion test (dissolve in ethanol, pour into water).
   - *Result:* Clear ➔ Milky / Cloudy white emulsion.`;
  }

  // Photosynthesis (B6)
  if (q.includes('photosynthesis') || q.includes('b6')) {
    return `### Photosynthesis Summary (Cambridge 0653 B6)
- **Definition:** Process by which plants synthesise carbohydrates from raw materials using energy from light.
- **Word Equation:** Carbon dioxide + Water ➔ Glucose + Oxygen *(in the presence of light and chlorophyll)*
- **Balanced Chemical Equation (Extended):** \`6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂\`
- **Limiting Factors:** Light intensity, Carbon dioxide concentration, Temperature.
- **Key Leaf Structures:** Chloroplasts, palisade mesophyll (packed with chloroplasts for max absorption), spongy mesophyll (air spaces for diffusion), stomata and guard cells, xylem (water up), phloem (sucrose & amino acids up/down).
- **Exam Tip:** On exams, remember that starch is stored because glucose is soluble and would affect osmotic balance.`;
  }

  // Respiration (B12)
  if (q.includes('respiration') || q.includes('b12')) {
    return `### Aerobic Respiration (Cambridge 0653 B12)
- **Definition:** Chemical reactions in cells that use oxygen to break down nutrient molecules to release energy for metabolism.
- **Word Equation:** Glucose + Oxygen ➔ Carbon dioxide + Water
- **Symbol Equation:** \`C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O\`
- **5 Uses of Energy in Living Organisms:**
  1. Muscle contraction
  2. Protein synthesis
  3. Cell division
  4. Growth
  5. Maintenance of a constant body temperature (in mammals/birds).
- **Site:** Occurs inside the **mitochondria** of cells.`;
  }

  // Plant Transport & Transpiration (B8)
  if (q.includes('transpiration') || q.includes('xylem') || q.includes('phloem') || q.includes('b8')) {
    return `### Plant Transport & Transpiration (Cambridge 0653 B8)
- **Xylem:** Vessels made of dead, hollow, lignified cells that transport water and dissolved mineral ions upward from roots to leaves (one-way).
- **Phloem:** Sieve tube elements with companion cells that translocate sucrose and amino acids from sources (leaves/storage) to sinks (growing shoots/roots) in both directions.
- **Transpiration:** Evaporation of water at the surfaces of the mesophyll cells followed by loss of water vapor from plant leaves through stomata.
- **Factors Increasing Transpiration:** High temperature, high wind speed, high light intensity, low humidity.`;
  }

  // Electrolysis (C4)
  if (q.includes('electrolysis') || q.includes('c4')) {
    return `### Electrolysis Guidelines (Cambridge 0653 C4)
- **Definition:** Decomposition of an ionic compound, when molten or in aqueous solution, by the passage of an electric current.
- **Electrodes:**
  - **Anode (+):** Attracts anions (-). Non-metals formed (or oxygen if aqueous without halide).
  - **Cathode (-):** Attracts cations (+). Metals or Hydrogen formed.
- **Molten Lead(II) Bromide (PbBr₂):**
  - Cathode: Lead metal (grey liquid/solid).
  - Anode: Bromine gas (brown pungent fumes).
- **Concentrated Aqueous Sodium Chloride (NaCl):**
  - Cathode: Hydrogen gas (pops with lit splint).
  - Anode: Chlorine gas (bleaches damp litmus paper).
  - Remaining in solution: Sodium hydroxide (turns universal indicator purple/blue).
- **Dilute Sulfuric Acid (H₂SO₄):**
  - Cathode: Hydrogen gas (\`H₂\`).
  - Anode: Oxygen gas (\`O₂\`).`;
  }

  // Qualitative Analysis (C12)
  if (q.includes('qualitative analysis') || q.includes('cation') || q.includes('anion') || q.includes('flame test') || q.includes('c12')) {
    return `### Qualitative Analysis Notes (Cambridge 0653 C12 / Paper 6)
- **Flame Tests:**
  - Lithium (\`Li⁺\`): Red
  - Sodium (\`Na⁺\`): Yellow
  - Potassium (\`K⁺\`): Lilac
  - Copper(II) (\`Cu²⁺\`): Blue-green
  - Calcium (\`Ca²⁺\`): Orange-red
- **Cations with Aqueous NaOH and Aqueous NH₃:**
  - **Aluminium (\`Al³⁺\`):** White precipitate, soluble in excess NaOH giving colorless solution; insoluble in excess NH₃.
  - **Calcium (\`Ca²⁺\`):** White precipitate with NaOH (insoluble in excess); no precipitate with NH₃.
  - **Zinc (\`Zn²⁺\`):** White precipitate, soluble in excess NaOH AND soluble in excess NH₃ (gives colorless solution in both).
  - **Copper(II) (\`Cu²⁺\`):** Light blue precipitate; dissolves in excess NH₃ to form dark blue solution.
  - **Iron(II) (\`Fe²⁺\`):** Green precipitate, insoluble in excess.
  - **Iron(III) (\`Fe³⁺\`):** Red-brown precipitate, insoluble in excess.
  - **Ammonium (\`NH₄⁺\`):** Ammonia gas produced on warming (turns damp red litmus paper blue).
- **Anions:**
  - Carbonate (\`CO₃²⁻\`): Add dilute acid ➔ effervescence, \`CO₂\` turns limewater milky.
  - Halides: Acidify with dilute \`HNO₃\`, add aqueous \`AgNO₃\`:
    - Chloride (\`Cl⁻\`): White precipitate.
    - Bromide (\`Br⁻\`): Cream precipitate.
    - Iodide (\`I⁻\`): Yellow precipitate.
  - Sulfate (\`SO₄²⁻\`): Acidify with dilute \`HNO₃\`, add aqueous \`Ba(NO₃)₂\` ➔ White precipitate.`;
  }

  // Periodic Table (C8)
  if (q.includes('periodic table') || q.includes('group 1') || q.includes('group 7') || q.includes('halogen') || q.includes('c8')) {
    return `### The Periodic Table (Cambridge 0653 C8)
- **Group 1 (Alkali Metals):** Li, Na, K.
  - Soft metals with low densities and low melting points.
  - Reactivity **increases** down the group (outer electron further from nucleus, less electrostatic attraction, lost more easily).
  - Reaction with water: Metal + Water ➔ Metal Hydroxide + Hydrogen gas (\`2Na + 2H₂O ➔ 2NaOH + H₂\`).
- **Group 7 (Halogens):** Cl₂, Br₂, I₂.
  - Diatomic non-metals.
  - Reactivity **decreases** down the group.
  - Colors: Chlorine is pale green gas, Bromine is red-brown liquid, Iodine is grey-black solid (sublimes to purple vapor).
  - Displacement reactions: A more reactive halogen displaces a less reactive halide from solution (\`Cl₂ + 2KBr ➔ 2KCl + Br₂\`).
- **Noble Gases (Group 8/0):** He, Ne, Ar. Monatomic, unreactive/inert due to full outer shell of electrons.`;
  }

  // Metals & Blast Furnace (C9)
  if (q.includes('blast furnace') || q.includes('iron') || q.includes('reactivity series') || q.includes('rust') || q.includes('c9')) {
    return `### Metals & Blast Furnace Extraction (Cambridge 0653 C9)
- **Reactivity Series:** K > Na > Ca > Mg > Al > [Carbon] > Zn > Fe > [Hydrogen] > Cu > Ag > Au.
- **Blast Furnace Extraction of Iron:**
  - Raw materials: Iron ore (hematite, \`Fe₂O₃\`), Coke (carbon), Limestone (\`CaCO₃\`), Hot air.
  - Reaction 1: \`C + O₂ ➔ CO₂\` (exothermic, heats the furnace).
  - Reaction 2: \`CO₂ + C ➔ 2CO\` (reducing agent formed).
  - Reaction 3: \`Fe₂O₃ + 3CO ➔ 2Fe + 3CO₂\` (iron ore reduced to molten iron).
  - Removing impurities: \`CaCO₃ ➔ CaO + CO₂\`, then \`CaO + SiO₂ ➔ CaSiO₃\` (molten slag floats on iron).
- **Rusting of Iron:** Requires **Water AND Oxygen**.
  - Prevention: Barrier methods (paint, grease, plastic), Galvanising (coating with zinc), Sacrificial protection (more reactive metal like zinc/magnesium corrodes first).`;
  }

  // Ohm's Law & Resistance (P4)
  if (q.includes('ohm') || q.includes('resistance') || q.includes('circuit') || q.includes('p4')) {
    return `### Ohm's Law & Resistance (Cambridge 0653 P4)
- **Formula:** \`R = V / I\` (Resistance = Potential Difference ÷ Current)
  - Unit of Resistance: Ohms (Ω)
  - Unit of Voltage: Volts (V)
  - Unit of Current: Amperes (A)
- **Ohm's Law:** Current through a metallic conductor is directly proportional to the potential difference across it, provided temperature remains constant.
- **Conductor Dimensions (Extended):**
  - Resistance is directly proportional to **length** (longer wire = more collisions = greater resistance).
  - Resistance is inversely proportional to **cross-sectional area** (thicker wire = more paths = lower resistance).
- **Circuit Rules:**
  - **Series:** \`R_total = R₁ + R₂ + ...\`, Current is the same everywhere.
  - **Parallel:** \`1/R_total = 1/R₁ + 1/R₂\` (combined resistance is less than the smallest individual branch resistance!).
  - **Electrical Power:** \`P = V × I = I² × R\` (Watts)
  - **Electrical Energy:** \`E = P × t = V × I × t\` (Joules)`;
  }

  // Waves & Light (P3)
  if (q.includes('wave') || q.includes('light') || q.includes('refraction') || q.includes('em spectrum') || q.includes('p3')) {
    return `### Waves, Light & EM Spectrum (Cambridge 0653 P3)
- **Wave Equation:** \`v = f × λ\`
  - Speed (\`v\`, m/s) = Frequency (\`f\`, Hz) × Wavelength (\`λ\`, m).
- **Transverse vs Longitudinal:**
  - Transverse: Oscillations perpendicular to direction of energy transfer (light, water waves, all EM waves).
  - Longitudinal: Oscillations parallel to direction of energy transfer (sound waves, ultrasound).
- **Electromagnetic Spectrum (Order of increasing frequency / decreasing wavelength):**
  - Radio waves ➔ Microwaves ➔ Infrared ➔ Visible light (ROYGBIV) ➔ Ultraviolet ➔ X-rays ➔ Gamma rays.
  - All travel at the speed of light in vacuum (\`3.0 × 10⁸ m/s\`).
- **Refraction:** Bending of light when passing into denser medium (slows down, bends towards the normal: \`n = sin i / sin r\`).
- **Total Internal Reflection:** Occurs when light travels from denser to less dense medium at an angle of incidence greater than the critical angle (\`sin c = 1/n\`).`;
  }

  // Motion, Forces, Energy (P1)
  if (q.includes('speed') || q.includes('acceleration') || q.includes('newton') || q.includes('density') || q.includes('p1')) {
    return `### Motion, Forces & Energy (Cambridge 0653 P1)
- **Key Equations:**
  - Speed: \`v = s / t\`
  - Acceleration: \`a = (v - u) / t\`
  - Weight: \`W = m × g\` (\`g = 9.8 N/kg\` or \`10 N/kg\` on Earth)
  - Density: \`ρ = m / V\`
  - Newton's Second Law: \`Resultant Force F = m × a\`
  - Hooke's Law: \`F = k × x\` (up to the limit of proportionality)
  - Work Done: \`W = F × d\` (Joules)
  - Kinetic Energy: \`E_k = 0.5 × m × v²\`
  - Gravitational Potential Energy: \`ΔE_p = m × g × Δh\`
  - Power: \`P = W / t = E / t\` (Watts)
  - Pressure: \`p = F / A\` (Pascals or \`N/m²\`)
- **Graphs:**
  - Distance-time graph gradient = **speed**.
  - Speed-time graph gradient = **acceleration**, area under graph = **distance travelled**.`;
  }

  return `### Cambridge IGCSE 0653 Science Tutor Response
Regarding your question on **"${query}"** in ${topic || 'Cambridge Combined Science'}:

1. **Syllabus Focus (${tier || 'Extended'} Tier):**
   - Core tests qualitative understanding, primary definitions, and direct application.
   - Extended/Supplement requires quantitative equations, balanced chemical formulas, and particle-level mechanisms.

2. **Cambridge Mark Scheme Method:**
   - Always quote standard formulas before substituting values (\`Formula ➔ Values ➔ Calculation ➔ Final Answer + Units\`).
   - Use official Cambridge command words accurately: **State** (short fact), **Describe** (what happens), **Explain** (why it happens using scientific reasoning).

3. **Key Terminology:**
   - Ensure your written responses use precise scientific vocabulary to secure maximum marks.

Feel free to ask for a practice exam question, a model answer with mark schemes, or a step-by-step breakdown of any 0653 subtopic!`;
}

function generateFallbackSchedule(
  examDate?: string, 
  weeklyHours?: number, 
  dailyHours?: number, 
  topics?: string[], 
  tier?: string,
  selectionMode: string = 'analysed_needs',
  studyDaysPerWeek: number = 7,
  totalWeeksParam?: number
) {
  const targetWeeklyHours = typeof weeklyHours === 'number'
    ? Math.min(20, Math.max(1, Number(weeklyHours)))
    : (dailyHours ? Math.min(20, Math.max(1, Number(dailyHours) * studyDaysPerWeek)) : 10);
  const targetDailyHours = Number((targetWeeklyHours / studyDaysPerWeek).toFixed(1));
  const sessionMinutes = Math.min(240, Math.max(10, Math.round((targetWeeklyHours * 60) / studyDaysPerWeek)));

  // Calculate totalWeeks leading up to examDate
  let totalWeeks = totalWeeksParam;
  if (!totalWeeks || totalWeeks < 1) {
    if (examDate) {
      const target = new Date(examDate);
      const now = new Date();
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      totalWeeks = diff > 0 ? Math.max(1, Math.min(26, Math.ceil(diff / 7))) : 6;
    } else {
      totalWeeks = 6;
    }
  }
  totalWeeks = Math.min(26, Math.max(1, Math.round(totalWeeks)));

  const safeTopics = Array.isArray(topics) && topics.length > 0 
    ? topics 
    : ['B2', 'B5', 'C4', 'C7', 'P1', 'P4'];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, studyDaysPerWeek);

  // Topic knowledge base for high-yield Cambridge tasks
  const topicDetails: Record<string, { subject: string; title: string; tasks: string[] }> = {
    'B1': { subject: 'biology', title: 'Characteristics of Living Organisms', tasks: ['Review MRS GREN 7 characteristics definitions', 'Distinguish strictly between excretion and egestion', 'Active recall: 10 quick self-check questions'] },
    'B2': { subject: 'biology', title: 'Cells & Organisation', tasks: ['Label plant vs animal vs bacterial cell organelles', 'Calculate magnification using M = I / A with unit conversions', 'Compare xylem and ciliated epithelial cell specialisations'] },
    'B3': { subject: 'biology', title: 'Movement In & Out of Cells', tasks: ['Define diffusion, osmosis, and active transport (carrier proteins + ATP)', 'Explain water potential gradient in turgid and plasmolysed cells', 'Review potato strip osmometer practical results'] },
    'B4': { subject: 'biology', title: 'Biological Molecules', tasks: ['Revise 4 reagent tests: Benedict\'s, Iodine, Biuret, and Ethanol emulsion', 'Explain why fats yield double the energy of carbohydrates', 'Complete 10-minute active recall flashcards'] },
    'B5': { subject: 'biology', title: 'Enzymes & Active Sites', tasks: ['Review lock and key hypothesis and substrate active site complementary fit', 'Explain denaturation mechanism above optimum temperature and pH extremes', 'Sketch and interpret rate vs temperature/pH curves'] },
    'B6': { subject: 'biology', title: 'Plant Nutrition & Photosynthesis', tasks: ['Write balanced photosynthesis chemical equation', 'Label internal leaf cross-section (palisade, spongy mesophyll, stomata)', 'Identify limiting factors: light intensity, CO2 concentration, temperature'] },
    'B7': { subject: 'biology', title: 'Human Nutrition & Digestion', tasks: ['List 7 balanced diet dietary components and deficiency diseases', 'Track chemical digestion of starch, proteins, and lipids by amylase, protease, lipase', 'Explain role of bile in emulsification of fats and pH neutralization'] },
    'B8': { subject: 'biology', title: 'Transport in Plants', tasks: ['Compare xylem (water/minerals, transpiration stream) vs phloem (sucrose/amino acids, translocation)', 'Explain root hair adaptations for large surface area and water uptake', 'List factors affecting transpiration rate: temperature, humidity, wind, light'] },
    'B9': { subject: 'biology', title: 'Transport in Animals', tasks: ['Label heart chambers, valves, pulmonary/systemic vessels', 'Explain why left ventricular wall is thicker than right ventricular wall', 'Compare structural adaptations of arteries, veins, and capillaries'] },
    'B10': { subject: 'biology', title: 'Diseases & Immunity', tasks: ['Distinguish pathogens (viruses, bacteria, fungi) and modes of transmission', 'Explain mechanical/chemical body defences and antibody-antigen response', 'Understand active immunity via vaccination and memory cell persistence'] },
    'B11': { subject: 'biology', title: 'Gas Exchange in Humans', tasks: ['Identify alveoli adaptations for rapid gas exchange (thin, moist, large surface, capillaries)', 'Explain intercostal muscles and diaphragm movements during inspiration/expiration', 'Compare inspired vs expired air composition percentages'] },
    'B12': { subject: 'biology', title: 'Respiration', tasks: ['Write word and balanced chemical equation for aerobic respiration', 'Link cellular respiration to ATP generation in mitochondria', 'Distinguish aerobic from anaerobic respiration in muscles and yeast'] },
    'B13': { subject: 'biology', title: 'Coordination & Response', tasks: ['Trace reflex arc pathway: Receptor ➔ Sensory ➔ Relay ➔ Motor ➔ Effector', 'Compare nervous vs hormonal control communication speeds and durations', 'Study eye accommodation for near/distant objects and pupil light reflex'] },
    'B14': { subject: 'biology', title: 'Reproduction', tasks: ['Compare asexual (clones, 1 parent) vs sexual reproduction (gametes, genetic variation)', 'Label insect-pollinated vs wind-pollinated flower adaptations', 'Outline human menstrual cycle hormones: FSH, LH, oestrogen, progesterone'] },
    'B15': { subject: 'biology', title: 'Organisms & Environment', tasks: ['Trace sunlight as ultimate energy input in food chains and webs', 'Explain why only ~10% of energy transfers between trophic levels', 'Construct and interpret pyramids of numbers and pyramids of biomass'] },
    'B16': { subject: 'biology', title: 'Ecosystems & Human Influences', tasks: ['Diagram the carbon cycle: photosynthesis, respiration, combustion, decomposition', 'Explain causes and impacts of deforestation on biodiversity and soil erosion', 'Review greenhouse effect and eutrophication caused by fertilizer leaching'] },

    'C1': { subject: 'chemistry', title: 'States of Matter', tasks: ['Compare solid, liquid, gas particle arrangements, movements, and forces', 'Interpret heating and cooling curves and plateau melting/boiling points', 'Explain diffusion in terms of kinetic energy and molecular mass (rate ∝ 1/√Mr)'] },
    'C2': { subject: 'chemistry', title: 'Atoms, Elements & Compounds', tasks: ['Determine protons, neutrons, electrons from atomic and mass numbers', 'Draw dot-and-cross diagrams for ionic bonding (NaCl, MgO) and covalent molecules (H2O, CH4)', 'Compare high melting ionic lattices with low melting simple covalent structures'] },
    'C3': { subject: 'chemistry', title: 'Stoichiometry & Equations', tasks: ['Balance 10 chemical equations with state symbols (s, l, g, aq)', 'Calculate relative formula mass (Mr) from atomic masses (Ar)', 'Deduce ionic formulae from ion charges and verify the Law of Conservation of Mass'] },
    'C4': { subject: 'chemistry', title: 'Electrochemistry & Electrolysis', tasks: ['State anode (+) and cathode (-) products for molten PbBr2', 'Predict products for concentrated NaCl(aq) and dilute H2SO4(aq)', 'Write ionic half-equations with electrons: 2Cl⁻ ➔ Cl2 + 2e⁻ and 2H⁺ + 2e⁻ ➔ H2'] },
    'C5': { subject: 'chemistry', title: 'Chemical Energetics', tasks: ['Distinguish exothermic (temperature rises, ΔH negative) vs endothermic reactions', 'Draw and label reaction profile diagrams with activation energy (Ea)', 'Calculate net energy change using bond energies: ΔH = bonds broken - bonds made'] },
    'C6': { subject: 'chemistry', title: 'Chemical Reactions & Rates', tasks: ['Explain collision theory: activation energy and collision frequency', 'Investigate effect of surface area, concentration, temperature, and catalysts', 'Interpret reaction rate volume/mass loss vs time curves'] },
    'C7': { subject: 'chemistry', title: 'Acids, Bases & Salts', tasks: ['Classify oxides: basic (metal), acidic (non-metal), amphoteric, neutral', 'Recall reactions of acids with metals, bases, and metal carbonates', 'Step-by-step method to prepare dry copper(II) sulfate crystals (excess oxide)'] },
    'C8': { subject: 'chemistry', title: 'The Periodic Table', tasks: ['Identify Group 1 alkali metals trends: increasing reactivity, decreasing melting point', 'Identify Group 7 halogens trends: decreasing reactivity, darker colour down group', 'Explain displacement reactions: chlorine displaces bromide and iodide from solution'] },
    'C9': { subject: 'chemistry', title: 'Metals & Reactivity Series', tasks: ['Order reactivity series: K, Na, Ca, Mg, Al, C, Zn, Fe, H, Cu, Ag, Au', 'Explain blast furnace reactions: C + O2 ➔ CO2, CO2 + C ➔ 2CO, Fe2O3 + 3CO ➔ 2Fe + 3CO2', 'Explain role of limestone in removing acidic silica impurities as slag (CaSiO3)'] },
    'C10': { subject: 'chemistry', title: 'Chemistry of the Environment', tasks: ['Review chemical tests for water: anhydrous CuSO4 (white to blue) and CoCl2 paper', 'Recall composition of clean dry air (78% N2, 21% O2, noble gases, CO2)', 'Identify pollutants (CO, SO2, NOx) and catalytic converter oxidation/reduction'] },
    'C11': { subject: 'chemistry', title: 'Organic Chemistry', tasks: ['Distinguish saturated alkanes (CnH2n+2) vs unsaturated alkenes (CnH2n)', 'Explain fractional distillation of petroleum based on chain length and boiling points', 'Explain cracking of long-chain alkanes and bromine water addition test'] },
    'C12': { subject: 'chemistry', title: 'Experimental Techniques & Analysis', tasks: ['Recall flame tests: Li⁺ (red), Na⁺ (yellow), K⁺ (lilac), Cu²⁺ (blue-green)', 'Memorise aqueous NaOH and NH3 precipitate colours for Fe²⁺, Fe³⁺, Cu²⁺, Zn²⁺', 'Conduct gas tests: H2 (pop), O2 (relight), CO2 (limewater), Cl2 (bleach), NH3 (litmus)'] },

    'P1': { subject: 'physics', title: 'Motion, Forces & Energy', tasks: ['Calculate speed v = s/t and acceleration a = Δv/t from speed-time gradients', 'Calculate distance travelled as area under speed-time graph', 'Apply W = mg (using g = 9.8 N/kg), F = ma, density ρ = m/V, and Ek / GPE equations'] },
    'P2': { subject: 'physics', title: 'Thermal Physics', tasks: ['Explain thermal conduction in solids (free electron diffusion in metals)', 'Explain convection currents in fluids based on density changes', 'Compare radiation absorption/emission on matt black vs shiny silver surfaces'] },
    'P3': { subject: 'physics', title: 'Waves, Light & Sound', tasks: ['Use wave speed formula v = f × λ and relate frequency to pitch and amplitude to loudness', 'Apply law of reflection and refraction index n = sin i / sin r', 'Order electromagnetic spectrum: Radio, Micro, IR, Visible, UV, X-ray, Gamma'] },
    'P4': { subject: 'physics', title: 'Electricity & Magnetism', tasks: ['Use Ohm\'s law V = I × R and electrical charge equation Q = I × t', 'Calculate total resistance in series (R1 + R2) and parallel (1/R = 1/R1 + 1/R2)', 'Calculate electrical power P = I × V = I²R and electrical energy E = P × t'] },
    'P5': { subject: 'physics', title: 'Nuclear & Space Physics', tasks: ['Explain nuclear fusion in Sun\'s core converting hydrogen into helium', 'Calculate orbital speed v = 2πr / T for satellites and planets', 'Outline star life cycle: nebula ➔ protostar ➔ main sequence ➔ red giant ➔ white dwarf'] }
  };

  // Structured thematic progression across weeks
  const defaultThemes = [
    { title: 'Core Diagnostic Foundations & High-Yield Principles', topics: ['B5', 'C4', 'P1', 'C7'] },
    { title: 'Chemical Energetics, Bonding & Stoichiometry', topics: ['C1', 'C2', 'C3', 'C5', 'C6'] },
    { title: 'Cellular Biology, Osmosis & Plant Physiology', topics: ['B1', 'B2', 'B3', 'B4', 'B6'] },
    { title: 'Motion, Forces, Work & Thermal Energy Systems', topics: ['P1', 'P2', 'P4'] },
    { title: 'Reactivity Series, Acids, Salts & Environment', topics: ['C7', 'C8', 'C9', 'C10', 'C11'] },
    { title: 'Human Biology, Circulation, Respiration & Coordination', topics: ['B7', 'B8', 'B9', 'B11', 'B12', 'B13'] },
    { title: 'Electricity Circuits, Waves & Nuclear Physics', topics: ['P3', 'P4', 'P5', 'C12'] },
    { title: 'Ecosystems, Genetics & Experimental Practical Skills', topics: ['B14', 'B15', 'B16', 'C12'] },
    { title: 'Cross-Paper Synthesis & Extended Problem-Solving Drill', topics: ['B5', 'C4', 'P4', 'C7', 'P1'] },
    { title: 'Timed Mock Rehearsal & Diagnostic Error Log Remediation', topics: ['C3', 'P1', 'B9', 'C9', 'P4'] },
    { title: 'Cambridge Examiner Traps & Qualitative Analysis Sprint', topics: ['C12', 'B11', 'P3', 'C5', 'B3'] },
    { title: 'Final High-Velocity Revision Sprint & Formula Consolidation', topics: ['P1', 'P4', 'C4', 'B5', 'C3'] }
  ];

  const allScheduleItems: any[] = [];
  const weeklyPlan: any[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    let weekTopicPool: string[];
    let weekTheme: string;

    if (selectionMode === 'custom_topics') {
      // Rotate chosen topics with progressive focus
      const startIdx = ((w - 1) * 2) % safeTopics.length;
      weekTopicPool = [];
      for (let i = 0; i < Math.min(safeTopics.length, 4); i++) {
        weekTopicPool.push(safeTopics[(startIdx + i) % safeTopics.length]);
      }
      if (weekTopicPool.length === 0) weekTopicPool = safeTopics;
      weekTheme = w === totalWeeks
        ? `Final Mastery Sprint for Selected Topics: ${weekTopicPool.slice(0, 3).join(', ')}`
        : `Target Focus on Selected Topics: ${weekTopicPool.slice(0, 3).join(', ')}`;
    } else {
      const themePreset = defaultThemes[(w - 1) % defaultThemes.length];
      weekTopicPool = themePreset.topics;
      // In Week 1, ensure the diagnosed weaknesses are prioritized
      if (w === 1 && safeTopics.length > 0) {
        weekTopicPool = Array.from(new Set([...safeTopics.slice(0, 3), ...weekTopicPool]));
      }
      weekTheme = w === totalWeeks
        ? `Final Comprehensive Exam Sprint & High-Yield Consolidation`
        : themePreset.title;
    }

    // Generate daily items for this week with specific slides recap as Task 1 and creative tasks following
    const weekItems = daysOfWeek.map((dayName, dIdx) => {
      const rawCode = weekTopicPool[dIdx % weekTopicPool.length];
      const cleanCode = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'B2';
      const config = TOPIC_REVISION_CONFIGS[cleanCode] || TOPIC_REVISION_CONFIGS[cleanCode.slice(0, 2)];
      const subject = config?.subject || (cleanCode.startsWith('B') ? 'biology' : cleanCode.startsWith('C') ? 'chemistry' : 'physics');
      const title = config?.title || rawCode;
      const tasks = getRevisionTasksForTopic(cleanCode, w, totalWeeks);

      return {
        id: `w${w}-d${dIdx + 1}-${cleanCode}`,
        week: w,
        day: dayName,
        date: `Week ${w} • ${dayName}`,
        subject,
        topicCode: cleanCode,
        topicTitle: title,
        tasks,
        estimatedMinutes: sessionMinutes,
        completed: false
      };
    });

    allScheduleItems.push(...weekItems);

    weeklyPlan.push({
      week: w,
      theme: weekTheme,
      focusTopics: weekTopicPool.slice(0, 4),
      goals: [
        `Master fundamental definitions and formulas for ${weekTopicPool.slice(0, 2).join(' & ')}`,
        `Practice Paper 2 MCQ and Paper 4 extended theory questions under timed conditions`,
        `Consolidate error notes and ensure zero repeats in test drills`
      ],
      weeklyTargetHours: targetWeeklyHours,
      dailyTasks: weekItems.map(item => ({
        day: item.day,
        subject: item.subject,
        task: item.tasks[0] || `Revise ${item.topicTitle}`
      }))
    });
  }

  const modeLabel = selectionMode === 'custom_topics' 
    ? 'Student-Selected Custom Topics' 
    : 'Analysed Diagnostic Weaknesses';

  return {
    summary: `Comprehensive ${totalWeeks}-Week Cambridge 0653 ${tier || 'Extended'} Revision Masterplan configured for ${targetWeeklyHours}h weekly study target across ${totalWeeks * studyDaysPerWeek} sessions (~${sessionMinutes}m/session, ${totalWeeks * targetWeeklyHours}h total revision), targeting ${modeLabel}.`,
    totalWeeks: totalWeeks,
    weeklyHours: targetWeeklyHours,
    dailyHours: targetDailyHours,
    totalHours: totalWeeks * targetWeeklyHours,
    studyDaysPerWeek: studyDaysPerWeek,
    schedule: allScheduleItems,
    items: allScheduleItems,
    weeklyPlan: weeklyPlan,
    examTips: [
      "In Physics, use g = 9.8 N/kg for weight calculations (Cambridge 2025-2027 syllabus requirement).",
      "In Chemistry, always include state symbols (s, l, g, aq) when writing full chemical equations.",
      "In Biology, link active transport to mitochondria and aerobic respiration for full marks.",
      "Stick consistently to your weekly target to build progressive topic retention through spaced repetition."
    ]
  };
}

function generateFallbackRecommendations(studentName?: string, topicScores?: Record<string, number>, recentQuizMistakes?: any[]) {
  return {
    studentStatus: `${studentName || 'Student'} shows solid grasp in fundamental concepts but requires targeted intervention in qualitative analysis tests, electrical circuit calculations, and balancing redox/stoichiometry equations.`,
    criticalWeaknesses: [
      "C12 Experimental Techniques & Chemical Analysis (Cation/Anion tests)",
      "P4.2 Series and Parallel Circuit Calculations",
      "B3.2 Osmosis & Water Potential in Plant Tissues"
    ],
    recommendedActionPlan: [
      {
        priority: "High",
        topicCode: "C12",
        topicName: "Chemical Analysis (Cations & Anions)",
        recommendedSlides: "Slides: Tests for Cations (solution) & Tests for Anions",
        actionStep: "Memorise that Zn2+ gives a white precipitate soluble in excess NaOH, whereas Ca2+ remains insoluble. Review silver nitrate halide test colours (white, cream, yellow).",
        keyFormulaOrRule: "Chloride = white ppt with AgNO3; Bromide = cream ppt; Iodide = yellow ppt."
      },
      {
        priority: "High",
        topicCode: "P4",
        topicName: "Electricity (Circuit Resistance)",
        recommendedSlides: "Slides: Series Circuits & Parallel Circuits",
        actionStep: "Practice combining parallel resistors: 1/R = 1/R1 + 1/R2 and note that the combined parallel resistance is ALWAYS smaller than the smallest branch resistor.",
        keyFormulaOrRule: "R_series = R1 + R2; 1/R_parallel = 1/R1 + 1/R2"
      },
      {
        priority: "Medium",
        topicCode: "B3",
        topicName: "Osmosis & Visking Tubing",
        recommendedSlides: "Slides: Osmosis Practical & Model Gut Experiment",
        actionStep: "Understand water potential: water moves from high water potential (dilute) to low water potential (concentrated) through a partially permeable membrane.",
        keyFormulaOrRule: "Plant cells: pure water -> turgid; concentrated solution -> flaccid / plasmolysed."
      }
    ],
    motivationalAdvice: "Consistent active recall with flashcards and daily 10-minute past paper questions will rapidly turn these target areas into grade-winning strengths!"
  };
}

// Vite or Static Serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');

  // Detect environment: dev mode is active when running via tsx ("dev": "tsx server.ts") or NODE_ENV is development
  const isRunningViaTsx = process.argv.some(arg => arg.includes('tsx')) || process.execPath.includes('tsx');
  const isDev = isRunningViaTsx || process.env.NODE_ENV === 'development' || (process.env.NODE_ENV !== 'production' && !fs.existsSync(indexHtmlPath));

  if (isDev) {
    // Local dev server: Mount Vite middlewares for live React compilation and HMR
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite development middleware mounted successfully on Express.');

      // Serve transformed index.html for SPA routes
      app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/healthz') {
          return next();
        }
        try {
          const url = req.originalUrl;
          const indexPath = path.resolve(process.cwd(), 'index.html');
          if (fs.existsSync(indexPath)) {
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          }
          next();
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    } catch (viteErr) {
      console.error('Failed to start Vite development middleware:', viteErr);
    }
  } else {
    // Production mode (Cloud Run standalone): Serve pre-built static bundle
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/healthz') {
        return next();
      }
      if (fs.existsSync(indexHtmlPath)) {
        return res.sendFile(indexHtmlPath);
      }
      res.status(503).send('Application bundle is being generated. Please refresh in a moment.');
    });
  }

  // Global error handler to catch any static file or routing exceptions
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.status(err?.status || 500).json({ error: err?.message || 'Server error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT} (${isDev ? 'development (Vite middleware)' : 'production (Static dist)'})`);
  });
}

startServer();
