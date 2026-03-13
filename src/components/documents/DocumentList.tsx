"use client";

import { useEffect, useState } from 'react';
import { FileText, Download, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewer_notes?: string;
  storage_path: string;
}

interface DocumentListProps {
  userId: string;
  applicationId: string;
}

export default function DocumentList({ userId, applicationId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [userId, applicationId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/documents?userId=${userId}&applicationId=${applicationId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh list
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doc.file_name}
              </p>
              {getStatusBadge(doc.status)}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="capitalize">{doc.type.replace(/_/g, ' ')}</span>
              <span>•</span>
              <span>{formatFileSize(doc.file_size)}</span>
              <span>•</span>
              <span>{formatDate(doc.uploaded_at)}</span>
            </div>
            {doc.reviewer_notes && (
              <p className="mt-1 text-xs text-gray-600 italic">
                Note: {doc.reviewer_notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Download via Supabase Storage public URL
                window.open(`/api/documents/download?id=${doc.id}`, '_blank');
              }}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
