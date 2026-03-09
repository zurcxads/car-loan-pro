"use client";

import { useState, useRef } from 'react';

interface DocSlot {
  type: string;
  status: 'not_uploaded' | 'uploaded' | 'verified';
  fileName?: string;
  fileSize?: number;
}

interface DocumentUploadCenterProps {
  conditions: string[];
  appId: string;
  onAllUploaded?: () => void;
}

export default function DocumentUploadCenter({ conditions, appId, onAllUploaded }: DocumentUploadCenterProps) {
  const [docs, setDocs] = useState<DocSlot[]>(
    conditions.map(c => ({ type: c, status: 'not_uploaded' }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number>(-1);

  const handleFileSelect = (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Store in localStorage
      localStorage.setItem(`doc_${appId}_${docs[index].type}`, base64);

      const updated = [...docs];
      updated[index] = {
        ...updated[index],
        status: 'uploaded',
        fileName: file.name,
        fileSize: file.size,
      };
      setDocs(updated);

      // Check if all uploaded
      if (updated.every(d => d.status !== 'not_uploaded')) {
        onAllUploaded?.();
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (index: number) => {
    localStorage.removeItem(`doc_${appId}_${docs[index].type}`);
    const updated = [...docs];
    updated[index] = { type: updated[index].type, status: 'not_uploaded' };
    setDocs(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const allUploaded = docs.every(d => d.status !== 'not_uploaded');

  if (conditions.length === 0) {
    return (
      <div className="rounded-2xl surface p-8">
        <h2 className="text-sm font-semibold mb-4">Document Upload</h2>
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">No documents required -- ready to fund</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl surface p-8">
      <h2 className="text-sm font-semibold mb-6">Upload Required Documents</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeSlot >= 0) {
            handleFileSelect(activeSlot, file);
          }
          e.target.value = '';
        }}
      />

      <div className="space-y-3">
        {docs.map((doc, i) => (
          <div key={i} className="rounded-xl bg-zinc-800/50 border border-white/[0.06] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {doc.status === 'not_uploaded' ? (
                  <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">{doc.type}</div>
                  {doc.fileName && (
                    <div className="text-[10px] text-zinc-500 mt-0.5">{doc.fileName} ({formatSize(doc.fileSize || 0)})</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  doc.status === 'not_uploaded' ? 'bg-zinc-700 text-zinc-400' :
                  doc.status === 'uploaded' ? 'bg-green-500/15 text-green-400' :
                  'bg-blue-500/15 text-blue-400'
                }`}>
                  {doc.status === 'not_uploaded' ? 'Not Uploaded' : doc.status === 'uploaded' ? 'Uploaded' : 'Verified'}
                </span>
                {doc.status === 'not_uploaded' ? (
                  <button
                    onClick={() => { setActiveSlot(i); fileInputRef.current?.click(); }}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors duration-200 cursor-pointer font-medium"
                  >
                    Upload
                  </button>
                ) : (
                  <button
                    onClick={() => removeDoc(i)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-red-400 rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {docs.length > 0 && (
        <button
          disabled={!allUploaded}
          onClick={() => {
            localStorage.setItem('clp_conditions_met', 'true');
            onAllUploaded?.();
          }}
          className={`w-full mt-6 py-3 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer ${
            allUploaded ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Submit Documents
        </button>
      )}
    </div>
  );
}
