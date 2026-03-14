"use client";

import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const templates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Auto Loan Pro',
    trigger: 'After application submission',
    preview: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Auto Loan Pro!</h1>
        <p>Hi [First Name],</p>
        <p>Thank you for submitting your auto loan application. We've received it and our lending partners are already reviewing your information.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our lending partners will review your application</li>
          <li>You'll receive loan offers within 2-15 minutes</li>
          <li>Compare offers and select your pre-approval</li>
          <li>Take your pre-approval letter to any dealership</li>
        </ul>
        <p>Track your application status: <a href="[Dashboard Link]" style="color: #2563eb;">View Dashboard</a></p>
        <p>Best regards,<br>The Auto Loan Pro Team</p>
      </div>
    `,
  },
  {
    id: 'offers-ready',
    name: 'Offers Ready',
    subject: 'Your Loan Offers Are Ready!',
    trigger: 'When offers are generated',
    preview: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981; margin-bottom: 20px;">Great News! Your Offers Are Ready</h1>
        <p>Hi [First Name],</p>
        <p>We have <strong>[Number] loan offers</strong> waiting for you from our lending partners.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Best Rate:</strong> [Lowest APR]%</p>
          <p style="margin: 10px 0 0 0;"><strong>Approved Amount:</strong> Up to $[Max Amount]</p>
        </div>
        <p><a href="[Offers Link]" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Offers</a></p>
        <p>These offers expire in 30 days, so don't wait to review them!</p>
      </div>
    `,
  },
  {
    id: 'pre-approval',
    name: 'Pre-Approval Letter',
    subject: 'Your Auto Loan Pre-Approval Letter',
    trigger: 'After selecting an offer',
    preview: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Congratulations! You're Pre-Approved</h1>
        <p>Hi [First Name],</p>
        <p>Your pre-approval letter is ready! You've been pre-approved by <strong>[Lender Name]</strong>.</p>
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Approved Amount:</strong> $[Amount]</p>
          <p style="margin: 10px 0 0 0;"><strong>APR:</strong> [APR]%</p>
          <p style="margin: 10px 0 0 0;"><strong>Monthly Payment:</strong> $[Payment]</p>
        </div>
        <p><a href="[Letter Link]" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Pre-Approval Letter</a></p>
        <p>Take this letter to any dealership to shop for your vehicle with confidence!</p>
      </div>
    `,
  },
  {
    id: 'document-request',
    name: 'Document Request',
    subject: 'Action Required: Documents Needed',
    trigger: 'When lender requests documents',
    preview: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b; margin-bottom: 20px;">Documents Required</h1>
        <p>Hi [First Name],</p>
        <p>To finalize your loan approval, we need the following documents:</p>
        <ul>
          <li>[Document 1]</li>
          <li>[Document 2]</li>
          <li>[Document 3]</li>
        </ul>
        <p><a href="[Upload Link]" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upload Documents</a></p>
        <p>Please upload these documents within the next 7 days to avoid delaying your approval.</p>
      </div>
    `,
  },
  {
    id: 'deal-funded',
    name: 'Deal Funded',
    subject: 'Congratulations! Your Loan Is Funded',
    trigger: 'When deal is marked as funded',
    preview: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981; margin-bottom: 20px;">Congratulations on Your New Vehicle!</h1>
        <p>Hi [First Name],</p>
        <p>Your auto loan has been funded! Here are your loan details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Loan Amount:</strong> $[Amount]</p>
          <p style="margin: 10px 0 0 0;"><strong>APR:</strong> [APR]%</p>
          <p style="margin: 10px 0 0 0;"><strong>Monthly Payment:</strong> $[Payment]</p>
          <p style="margin: 10px 0 0 0;"><strong>First Payment Due:</strong> [Date]</p>
        </div>
        <p>You'll receive more information from [Lender Name] about setting up your account and payment schedule.</p>
        <p>Thank you for choosing Auto Loan Pro. Enjoy your new ride!</p>
      </div>
    `,
  },
];

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Email Templates</h1>
          <p className="text-sm text-gray-600">Preview automated emails sent to users</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Template List */}
          <div className="col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Templates</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedTemplate.id === template.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.trigger}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedTemplate.name}</h2>
                <p className="text-sm text-gray-600">Trigger: {selectedTemplate.trigger}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Subject:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedTemplate.subject}</span>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTemplate.preview) }} />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                    Send Test Email
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors">
                    Edit Template
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Variables available: [First Name], [Last Name], [Email], [Application ID], [Amount], [APR], [Payment], [Dashboard Link], [Offers Link], [Letter Link]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
