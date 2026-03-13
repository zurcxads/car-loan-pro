import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  [key: string]: string | number;
}

export const ApplicationSubmittedTemplate = ({ firstName, applicationId }: EmailTemplateProps & { applicationId: string }) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#1e40af', fontSize: '24px', marginBottom: '20px' }}>Application Received</h1>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {firstName},
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Thank you for applying with Auto Loan Pro! We've received your application and our lender network is reviewing it now.
    </p>
    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Application ID</p>
      <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>{applicationId}</p>
    </div>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      You'll receive an email as soon as lenders start sending offers. This typically happens within 1-2 hours.
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginTop: '24px' }}>
      Best regards,<br />
      The Auto Loan Pro Team
    </p>
    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' }} />
    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
      Auto Loan Pro is not a lender. All offers are subject to credit approval.
    </p>
  </div>
);

export const OffersReadyTemplate = ({ firstName, offerCount, dashboardUrl }: EmailTemplateProps & { offerCount: number; dashboardUrl: string }) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#1e40af', fontSize: '24px', marginBottom: '20px' }}>Your Offers Are Ready!</h1>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {firstName},
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Great news! We have {offerCount} {offerCount === 1 ? 'offer' : 'offers'} ready for you to review.
    </p>
    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0', textAlign: 'center' }}>
      <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6b7280' }}>Offers Available</p>
      <p style={{ margin: '0', fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>{offerCount}</p>
    </div>
    <div style={{ textAlign: 'center', margin: '32px 0' }}>
      <a href={dashboardUrl} style={{ display: 'inline-block', background: '#2563eb', color: '#ffffff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
        View My Offers
      </a>
    </div>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Compare rates, terms, and monthly payments to find the best deal for you.
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginTop: '24px' }}>
      Best regards,<br />
      The Auto Loan Pro Team
    </p>
    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' }} />
    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
      Auto Loan Pro is not a lender. All offers are subject to credit approval.
    </p>
  </div>
);

export const OfferSelectedTemplate = ({ firstName, lenderName, apr, monthlyPayment }: EmailTemplateProps & { lenderName: string; apr: number; monthlyPayment: number }) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#1e40af', fontSize: '24px', marginBottom: '20px' }}>Offer Selected</h1>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {firstName},
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Congratulations! You've selected an offer from {lenderName}.
    </p>
    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6b7280' }}>Your Selected Offer</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Lender</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{lenderName}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>APR</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{apr.toFixed(2)}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Monthly Payment</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>${monthlyPayment.toFixed(2)}</span>
      </div>
    </div>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      The lender will contact you shortly to complete the final steps.
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginTop: '24px' }}>
      Best regards,<br />
      The Auto Loan Pro Team
    </p>
    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' }} />
    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
      Auto Loan Pro is not a lender. All offers are subject to credit approval.
    </p>
  </div>
);

export const DocumentRequestedTemplate = ({ firstName, documentType }: EmailTemplateProps & { documentType: string }) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#1e40af', fontSize: '24px', marginBottom: '20px' }}>Document Requested</h1>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {firstName},
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      To proceed with your application, we need you to upload the following document:
    </p>
    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>{documentType}</p>
    </div>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Please log in to your dashboard to upload this document securely.
    </p>
    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginTop: '24px' }}>
      Best regards,<br />
      The Auto Loan Pro Team
    </p>
    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' }} />
    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
      Auto Loan Pro is not a lender. All offers are subject to credit approval.
    </p>
  </div>
);
