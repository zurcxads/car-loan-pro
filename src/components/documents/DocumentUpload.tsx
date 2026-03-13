"use client";

import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  applicationId: string;
  userId: string;
  documentType: string;
  onUploadSuccess?: (document: unknown) => void;
}

export default function DocumentUpload({
  applicationId,
  userId,
  documentType,
  onUploadSuccess,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.';
    }

    if (file.size > maxSize) {
      return 'File too large. Maximum size is 10MB.';
    }

    return null;
  };

  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('userId', userId);
      formData.append('type', documentType);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadedFile({ name: file.name, size: file.size });

      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setProgress(0);
    }
  }, [applicationId, userId, documentType, onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${uploading ? 'pointer-events-none' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
        `}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            <p className="text-xs text-green-600 font-medium">Upload complete</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, or PNG • Max 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
