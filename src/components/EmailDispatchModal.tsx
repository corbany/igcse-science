import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Settings,
  FileText,
  BookOpen,
  RefreshCw,
  Copy,
  ExternalLink,
  Key,
  Sparkles,
  Trash2
} from 'lucide-react';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  senderName: string;
  testRecipient?: string;
}

export interface DeliveryLogItem {
  id: string;
  timestamp: string;
  taskTitle: string;
  recipientName: string;
  recipientEmail: string;
  status: 'sent' | 'fallback_ready' | 'failed';
  method: 'emailjs' | 'gmail_1click' | 'mailto_1click' | 'smtp';
  info?: string;
  error?: string;
}

export interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
  };
  currentTask?: {
    id: string;
    title: string;
    type?: string;
    subtopicCode?: string;
    topicCode?: string;
    dueDate?: string;
    instructions?: string;
  } | null;
  studentRecipients?: { studentName: string; studentEmail: string }[];
}

const LOCAL_EMAILJS_CONFIG_KEY = 'igcse_emailjs_config';
const LOCAL_DELIVERY_LOGS_KEY = 'igcse_email_delivery_logs';

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTask,
  studentRecipients = []
}) => {
  const [activeTab, setActiveTab] = useState<'emailjs' | 'fallback' | 'logs' | 'guide'>('emailjs');

  // EmailJS Credentials state
  const [emailJsConfig, setEmailJsConfig] = useState<EmailJSConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    senderName: currentUser.displayName || 'Mr. Corban',
    testRecipient: currentUser.email || 'corbanb@gisboyshigh.net'
  });

  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Delivery logs state
  const [logs, setLogs] = useState<DeliveryLogItem[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBody, setCopiedBody] = useState<boolean>(false);

  // Load saved credentials & logs from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(LOCAL_EMAILJS_CONFIG_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setEmailJsConfig(prev => ({
          ...prev,
          serviceId: parsed.serviceId || '',
          templateId: parsed.templateId || '',
          publicKey: parsed.publicKey || '',
          senderName: parsed.senderName || currentUser.displayName || 'Mr. Corban',
          testRecipient: parsed.testRecipient || currentUser.email || 'corbanb@gisboyshigh.net'
        }));
      }

      const savedLogs = localStorage.getItem(LOCAL_DELIVERY_LOGS_KEY);
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (err) {
      console.warn('Failed to parse saved EmailJS config or logs:', err);
    }
  }, [currentUser]);

  // Check whether EmailJS credentials are fully populated
  const isEmailJsConfigured = Boolean(
    emailJsConfig.serviceId.trim() &&
    emailJsConfig.templateId.trim() &&
    emailJsConfig.publicKey.trim()
  );

  // Add delivery log entry helper
  const addLogEntry = (entry: Omit<DeliveryLogItem, 'id' | 'timestamp'>) => {
    const newLog: DeliveryLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    setLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 49)];
      try {
        localStorage.setItem(LOCAL_DELIVERY_LOGS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
    try {
      localStorage.removeItem(LOCAL_DELIVERY_LOGS_KEY);
    } catch {}
  };

  // Save EmailJS settings to localStorage
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(LOCAL_EMAILJS_CONFIG_KEY, JSON.stringify(emailJsConfig));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save EmailJS credentials:', err);
    }
  };

  // Browser-Direct EmailJS Connection Test
  const handleTestConnection = async () => {
    setTestResult(null);

    // Validate presence of credentials
    if (!emailJsConfig.serviceId.trim()) {
      setTestResult({
        type: 'error',
        message: 'Missing EmailJS Service ID',
        details: 'Please provide your EmailJS Service ID (e.g. "service_xxxx") found in your EmailJS dashboard.'
      });
      return;
    }
    if (!emailJsConfig.templateId.trim()) {
      setTestResult({
        type: 'error',
        message: 'Missing EmailJS Template ID',
        details: 'Please provide your EmailJS Template ID (e.g. "template_xxxx") created in EmailJS.'
      });
      return;
    }
    if (!emailJsConfig.publicKey.trim()) {
      setTestResult({
        type: 'error',
        message: 'Missing EmailJS Public Key',
        details: 'Please enter your EmailJS Public Key (Account > General > Public Key).'
      });
      return;
    }

    const recipient = emailJsConfig.testRecipient?.trim() || currentUser.email || 'corbanb@gisboyshigh.net';
    setTestingConnection(true);

    try {
      // Direct client-side EmailJS send with all standard variable aliases
      const templateParams = {
        to_email: recipient,
        recipient_email: recipient,
        to_name: currentUser.displayName || 'Instructor',
        recipient_name: currentUser.displayName || 'Instructor',
        from_name: emailJsConfig.senderName || 'Cambridge Science Hub',
        subject: '[Test Connection] Cambridge IGCSE 0653 Science Hub Email Notification',
        task_title: 'Sample Revision Task: B13 Drugs & Antibiotic Resistance',
        task_details: 'This is a live connection test verifying that browser-direct email delivery works perfectly from your Cambridge IGCSE 0653 Science Hub.',
        instructions: 'Log in to your portal to review and complete tasks.',
        due_date: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
        portal_link: typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fezihukeplecjbhmw6fblt-840997730911.asia-southeast1.run.app',
        message: 'Your EmailJS credentials have been verified successfully. Students will now receive task notifications directly from your browser without requiring a backend SMTP server.'
      };

      const response = await emailjs.send(
        emailJsConfig.serviceId.trim(),
        emailJsConfig.templateId.trim(),
        templateParams,
        emailJsConfig.publicKey.trim()
      );

      // Save valid credentials to localStorage
      localStorage.setItem(LOCAL_EMAILJS_CONFIG_KEY, JSON.stringify(emailJsConfig));

      setTestResult({
        type: 'success',
        message: `Connection Verified! Status: ${response.status} (${response.text})`,
        details: `A live test email was successfully dispatched directly from your browser to "${recipient}".`
      });

      addLogEntry({
        taskTitle: 'EmailJS Connection Verification Test',
        recipientName: currentUser.displayName || 'Instructor',
        recipientEmail: recipient,
        status: 'sent',
        method: 'emailjs',
        info: `Response ${response.status}: ${response.text}. Sent directly from client via @emailjs/browser.`
      });
    } catch (err: any) {
      console.error('EmailJS direct test error:', err);
      const errMsg = err?.text || err?.message || 'Unknown error occurred during EmailJS dispatch.';
      setTestResult({
        type: 'error',
        message: 'EmailJS Direct Dispatch Failed',
        details: `${errMsg}. (Check that your Service ID, Template ID, and Public Key are active and match your EmailJS account).`
      });

      addLogEntry({
        taskTitle: 'EmailJS Connection Test Failed',
        recipientName: currentUser.displayName || 'Instructor',
        recipientEmail: recipient,
        status: 'failed',
        method: 'emailjs',
        error: errMsg
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Compute 1-Click Fallback URLs for immediate zero-config teacher sending
  const targetTaskTitle = currentTask?.title || 'Cambridge 0653 Science Assignment';
  const targetTaskType = currentTask?.type === 'slides' 
    ? 'Lesson Slide Deck & Traffic Light Rating' 
    : currentTask?.type === 'quiz' 
    ? 'Practice Quiz Challenge' 
    : 'Exam Paper / Revision Exercise';
  const targetDueDate = currentTask?.dueDate || new Date(Date.now() + 86400000 * 3).toLocaleDateString();
  const targetInstructions = currentTask?.instructions || 'Please log in to your Cambridge 0653 revision hub and complete the assigned task before the deadline.';
  
  const portalOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fezihukeplecjbhmw6fblt-840997730911.asia-southeast1.run.app';
  const portalUrl = currentTask?.id 
    ? `${portalOrigin}/?tab=assignments&taskId=${encodeURIComponent(currentTask.id)}`
    : portalOrigin;

  // Prepare student recipients list (defaulting to GIS Boys High sample if none provided)
  const effectiveRecipients = studentRecipients.length > 0
    ? studentRecipients
    : [
        { studentName: 'Hamdan Al-Nuaimi', studentEmail: 'hamdan@gisboyshigh.net' },
        { studentName: 'Sultan Bin Thani', studentEmail: 'sultan@gisboyshigh.net' },
        { studentName: 'Rashid Al-Falasi', studentEmail: 'rashid@gisboyshigh.net' },
        { studentName: 'Zayed Al-Maktoum', studentEmail: 'zayed@gisboyshigh.net' }
      ];

  const bccString = effectiveRecipients.map(r => r.studentEmail).join(',');
  const fallbackSubject = `[Cambridge 0653 Science] New Assignment: ${targetTaskTitle}`;
  const fallbackEmailBody = `Dear Students,

A new assignment has been assigned for Cambridge IGCSE Combined Science (0653):

• Task: ${targetTaskTitle}
• Assignment Type: ${targetTaskType}
• Topic Code: ${currentTask?.subtopicCode || currentTask?.topicCode || 'B13 Drugs'}
• Due Date: ${targetDueDate}

Instructions:
${targetInstructions}

Direct Portal Assignment Link:
${portalUrl}

Please complete this task on your revision portal before the due date.

Best regards,
${emailJsConfig.senderName || currentUser.displayName || 'Mr. Corban'}
Cambridge IGCSE Combined Science Faculty`;

  const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccString)}&subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(fallbackEmailBody)}`;
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&bcc=${encodeURIComponent(bccString)}&su=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(fallbackEmailBody)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(portalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEmailBody = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Subject: ${fallbackSubject}\n\n${fallbackEmailBody}`);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleRecord1ClickDispatch = (methodName: 'gmail_1click' | 'mailto_1click') => {
    addLogEntry({
      taskTitle: targetTaskTitle,
      recipientName: `${effectiveRecipients.length} Students (BCC)`,
      recipientEmail: bccString,
      status: 'fallback_ready',
      method: methodName,
      info: `Opened via ${methodName === 'gmail_1click' ? 'Gmail Composer' : 'Default Mail Client'} with pre-filled BCC for privacy.`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b-2 border-black dark:border-white flex items-center justify-between bg-[#FDFBF7] dark:bg-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                <span>Task Email Dispatch & Direct Browser Delivery</span>
                {isEmailJsConfigured ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                    EmailJS Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-400">
                    1-Click Fallback Ready
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dispatch task alerts to students directly from your browser via EmailJS or with 1-Click pre-filled Gmail.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              setTestResult(null);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b-2 border-black dark:border-white bg-[#FDFBF7] dark:bg-black text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('emailjs')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'emailjs'
                ? 'border-black dark:border-white text-[#1E293B] dark:text-white bg-white dark:bg-black'
                : 'border-transparent text-slate-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>EmailJS Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fallback')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'fallback'
                ? 'border-black dark:border-white text-[#1E293B] dark:text-white bg-white dark:bg-black'
                : 'border-transparent text-slate-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Zero-Config Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'logs'
                ? 'border-black dark:border-white text-[#1E293B] dark:text-white bg-white dark:bg-black'
                : 'border-transparent text-slate-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Delivery Logs</span>
            {logs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-800 text-black dark:text-white font-mono">
                {logs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'guide'
                ? 'border-black dark:border-white text-[#1E293B] dark:text-white bg-white dark:bg-black'
                : 'border-transparent text-slate-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quick Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs bg-white dark:bg-black flex-1">
          {/* TAB 1: EmailJS Configuration */}
          {activeTab === 'emailjs' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                  isEmailJsConfigured
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isEmailJsConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {isEmailJsConfigured
                        ? `EmailJS Direct Client Dispatch: Active (${emailJsConfig.serviceId})`
                        : 'EmailJS Not Configured — 1-Click Fallback Active'}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {isEmailJsConfigured
                        ? `Emails are dispatched directly from the browser using @emailjs/browser without server dependencies.`
                        : 'Provide your EmailJS Service, Template, and Public Key below, or use the 1-Click Gmail tab for instant zero-config sending.'}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service ID */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                      <span>EmailJS Service ID</span>
                      <span className="text-[10px] text-slate-500 font-mono">e.g. service_xxxx</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailJsConfig.serviceId}
                      onChange={e => setEmailJsConfig({ ...emailJsConfig, serviceId: e.target.value.trim() })}
                      placeholder="service_xxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none"
                    />
                  </div>

                  {/* Template ID */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                      <span>EmailJS Template ID</span>
                      <span className="text-[10px] text-slate-500 font-mono">e.g. template_xxxx</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailJsConfig.templateId}
                      onChange={e => setEmailJsConfig({ ...emailJsConfig, templateId: e.target.value.trim() })}
                      placeholder="template_xxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Public Key */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                      <span>EmailJS Public Key</span>
                      <span className="text-[10px] text-slate-500 font-mono">Account &gt; Public Key</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailJsConfig.publicKey}
                      onChange={e => setEmailJsConfig({ ...emailJsConfig, publicKey: e.target.value.trim() })}
                      placeholder="f9X_xxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none"
                    />
                  </div>

                  {/* Sender Name */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1E293B] dark:text-slate-200">
                      Instructor / Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={emailJsConfig.senderName}
                      onChange={e => setEmailJsConfig({ ...emailJsConfig, senderName: e.target.value })}
                      placeholder="Mr. Corban"
                      className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Test Recipient Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B] dark:text-slate-200 flex items-center justify-between">
                    <span>Test Recipient Email (For &quot;Test Connection&quot;)</span>
                    <span className="text-[10px] text-slate-500">Defaults to your logged-in email</span>
                  </label>
                  <input
                    type="email"
                    value={emailJsConfig.testRecipient || ''}
                    onChange={e => setEmailJsConfig({ ...emailJsConfig, testRecipient: e.target.value.trim() })}
                    placeholder={currentUser.email || 'corbanb@gisboyshigh.net'}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none"
                  />
                </div>

                {/* Helpful Note about Browser Direct Sending */}
                <div className="p-3.5 rounded-xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white text-[#1E293B] dark:text-slate-200 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-black dark:text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>How Browser-Direct Email Works:</span>
                  </div>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                    Unlike traditional SMTP sockets which require a Node.js server, <strong>EmailJS</strong> connects directly from the browser over HTTPS via <code>@emailjs/browser</code>. You don&apos;t need an SMTP server, open ports, or backend nodemailer.
                  </p>
                </div>

                {/* Test Result Message Box */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border-2 flex items-start gap-2.5 ${
                      testResult.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {testResult.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold">{testResult.message}</div>
                      {testResult.details && (
                        <div className="text-[11px] leading-relaxed opacity-90">{testResult.details}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t-2 border-black dark:border-white flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    disabled={testingConnection}
                    onClick={handleTestConnection}
                    className="px-4 py-2 rounded-xl bg-[#FDFBF7] dark:bg-black hover:bg-white text-[#1E293B] dark:text-slate-200 border-2 border-black dark:border-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <div className="w-3.5 h-3.5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {testingConnection ? 'Testing Connection...' : `Test Connection (${emailJsConfig.testRecipient || currentUser.email || 'Email'})`}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black border-2 border-black font-bold text-xs shadow-xs transition"
                    >
                      Save Credentials
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: 1-Click Fallback Dispatch */}
          {activeTab === 'fallback' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Zero-Config 1-Click Dispatch</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400">
                    Always Works
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  No API keys, server tokens, or configurations required! Click either button below to immediately launch your email client with <strong>all student recipients in BCC</strong>, assignment details, and direct student portal links pre-populated.
                </p>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleRecord1ClickDispatch('gmail_1click')}
                  className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white shadow-xs transition flex items-center gap-3 group"
                >
                  <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Open in Gmail (1-Click)</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pre-fills Gmail compose window with {effectiveRecipients.length} students in BCC
                    </div>
                  </div>
                </a>

                <a
                  href={mailtoUrl}
                  onClick={() => handleRecord1ClickDispatch('mailto_1click')}
                  className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 text-[#1E293B] dark:text-white border-2 border-black dark:border-white shadow-xs transition flex items-center gap-3 group"
                >
                  <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Open in Mail App (1-Click)</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Launches Outlook, Apple Mail, or default system client
                    </div>
                  </div>
                </a>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1E293B] dark:text-white">
                    Pre-Formatted Task Email Preview:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-black hover:bg-slate-50 text-[#1E293B] dark:text-slate-200 border border-black dark:border-white font-medium text-[11px] flex items-center gap-1 transition"
                    >
                      {copiedLink ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmailBody}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-black hover:bg-slate-50 text-[#1E293B] dark:text-slate-200 border border-black dark:border-white font-medium text-[11px] flex items-center gap-1 transition"
                    >
                      {copiedBody ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBody ? 'Copied All' : 'Copy Email Body'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 space-y-1.5 font-mono text-[11px]">
                  <div>
                    <strong className="text-black dark:text-white">Subject:</strong> {fallbackSubject}
                  </div>
                  <div>
                    <strong className="text-black dark:text-white">BCC:</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-400 truncate block">
                      {bccString}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {fallbackEmailBody}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Delivery Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1E293B] dark:text-slate-200">
                  Recent Email Dispatch Records ({logs.length})
                </span>
                <div className="flex items-center gap-2">
                  {logs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-800 dark:text-rose-300 font-medium text-xs border border-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border-2 border-black dark:border-white text-center space-y-2">
                  <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-semibold text-[#1E293B] dark:text-white text-sm">No delivery logs recorded yet</div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs max-w-sm mx-auto">
                    When you test your EmailJS connection, dispatch an assignment, or click 1-Click Gmail, records will appear here with delivery timestamps.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border-2 space-y-1 ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700'
                          : log.status === 'failed'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700'
                          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#1E293B] dark:text-white text-xs">{log.taskTitle}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            log.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : log.status === 'failed'
                              ? 'bg-rose-100 text-rose-800 border-rose-400'
                              : 'bg-amber-100 text-amber-800 border-amber-400'
                          }`}
                        >
                          {log.status === 'sent'
                            ? '✓ Delivered via EmailJS'
                            : log.status === 'failed'
                            ? '✕ Failed'
                            : '1-Click Dispatched'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>
                          Recipient: <strong className="text-black dark:text-white">{log.recipientName}</strong>{' '}
                          <span className="font-mono text-[10px]">({log.recipientEmail})</span>
                        </span>
                        <span className="font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>

                      {log.info && (
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{log.info}</div>
                      )}

                      {log.error && (
                        <div className="text-[11px] text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-300 dark:border-rose-800 mt-1">
                          <strong>Error:</strong> {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Quick Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed text-[#1E293B] dark:text-slate-200">
              <div className="p-4 rounded-2xl bg-[#EBF3F5] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-2">
                <h4 className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>How Email Notification Works Without a Server</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                  Because this application runs client-side in the browser, traditional Node.js nodemailer / SMTP socket connections fail with &quot;Unexpected end of JSON input&quot;. We provide two 100% reliable solutions:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-2">
                  <div className="flex items-center gap-2 font-bold text-black dark:text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <span>Option 1: 1-Click Gmail &amp; Mail App (Fastest, Zero-Config)</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-7 text-xs">
                    No keys to configure! Clicking <strong>&quot;Open in Gmail (1-Click)&quot;</strong> opens your personal or school Gmail compose tab with:
                  </p>
                  <ul className="list-disc pl-11 text-slate-600 dark:text-slate-400 space-y-1 text-xs">
                    <li>All assigned students pre-filled in <strong>BCC</strong> for student data privacy.</li>
                    <li>The assignment title, subtopics, due date, and direct portal link already formatted.</li>
                    <li>You simply hit Send in Gmail!</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-900 border-2 border-black dark:border-white space-y-2">
                  <div className="flex items-center gap-2 font-bold text-black dark:text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <span>Option 2: Browser-Direct EmailJS (Automated Delivery)</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-7 text-xs">
                    If you prefer emails to send automatically without opening your mail app:
                  </p>
                  <ol className="list-decimal pl-11 text-slate-700 dark:text-slate-300 space-y-1 text-xs">
                    <li>
                      Create a free account at{' '}
                      <a
                        href="https://www.emailjs.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-black dark:text-white underline font-bold"
                      >
                        emailjs.com
                      </a>{' '}
                      (free tier includes 200 emails/month).
                    </li>
                    <li>Add an Email Service (connect your Gmail or school email). Copy your <strong>Service ID</strong>.</li>
                    <li>Create an Email Template with variables like <code>&#123;&#123;to_email&#125;&#125;</code> and <code>&#123;&#123;message&#125;&#125;</code>. Copy your <strong>Template ID</strong>.</li>
                    <li>Go to Account &gt; General and copy your <strong>Public Key</strong>.</li>
                    <li>Paste these 3 values into the <strong>EmailJS Setup</strong> tab and click <strong>&quot;Test Connection&quot;</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-black dark:border-white bg-[#FDFBF7] dark:bg-black flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Cambridge 0653 Science Revision Hub • Direct Email Dispatch Engine
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setTestResult(null);
            }}
            className="px-4 py-1.5 rounded-xl bg-white dark:bg-black hover:bg-slate-50 text-[#1E293B] dark:text-slate-200 font-semibold text-xs border-2 border-black dark:border-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
