"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, ShieldCheck, Home } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: string;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { key: 'drivers_license', label: 'Driver\'s License', Icon: CreditCard },
  { key: 'proof_of_income', label: 'Proof of Income', Icon: DollarSign },
  { key: 'proof_of_insurance', label: 'Proof of Insurance', Icon: ShieldCheck },
  { key: 'proof_of_address', label: 'Proof of Address', Icon: Home },
];

function DocumentsContent() {
  const router = useRouter();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user and documents
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.application) {
          router.push('/apply');
          return;
        }
        setUserId(data.application.user_id);
        return fetch(`/api/documents?userId=${data.application.user_id}`);
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.documents) {
          setDocuments(data.documents);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleFileSelect = async (type: string, file: File | null) => {
    if (!file || !userId) return;

    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('userId', userId);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(`Upload failed: ${data.error}`);
      } else {
        setDocuments(prev => [data.document, ...prev]);
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents?id=${docId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        alert('Failed to delete document');
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  const getDocumentsForType = (type: string) => {
    return documents.filter(d => d.type === type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusColors: Record<string, string> = {
    uploaded: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-gray-900">
            Auto Loan Pro
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Upload Center</h1>
            <p className="text-gray-500">Upload required documents to complete your application. Max file size: 10MB. Accepted formats: PDF, JPG, PNG.</p>
          </div>

          <div className="space-y-6">
            {DOCUMENT_TYPES.map(docType => {
              const typeDocuments = getDocumentsForType(docType.key);
              const isUploading = uploading === docType.key;
              const hasDocument = typeDocuments.length > 0;

              return (
                <div key={docType.key} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <docType.Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{docType.label}</h3>
                        {hasDocument ? (
                          <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[typeDocuments[0].status]}`}>
                            {typeDocuments[0].status}
                          </span>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">No document uploaded</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        ref={el => { fileInputRefs.current[docType.key] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFileSelect(docType.key, e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[docType.key]?.click()}
                        disabled={isUploading}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                          isUploading
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                        }`}
                      >
                        {isUploading ? 'Uploading...' : hasDocument ? 'Replace' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {typeDocuments.map(doc => (
                    <div key={doc.id} className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">{doc.file_name}</div>
                          <div className="text-[10px] text-gray-500">
                            {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Document Requirements</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Documents must be clear and readable</li>
                  <li>• All four corners must be visible</li>
                  <li>• Income documents should be recent paystubs or tax returns</li>
                  <li>• Insurance documents must show current coverage</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <DocumentsContent />
    </Suspense>
  );
}
