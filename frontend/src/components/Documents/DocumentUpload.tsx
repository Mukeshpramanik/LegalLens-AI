'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { apiClient } from '../../services/api';
import { LegalDocument } from '../../shared/types';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_EXTENSIONS } from '../../shared/constants';

interface DocumentUploadProps {
  onUploadSuccess: (document: LegalDocument) => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_FILE_EXTENSIONS.includes(ext as any)) {
      return `Unsupported file format. Please upload PDF, DOCX, or TXT.`;
    }
    return null;
  };

  const processUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Using fetch directly since apiClient expects JSON body by default in our current setup,
      // but we need to send multipart/form-data. We can adapt apiClient or just use raw fetch + token.
      // Wait, apiClient accepts custom config. Let's use apiClient and omit Content-Type so browser sets it with boundary.
      const response = await apiClient<{ success: boolean; data: LegalDocument }>('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove default Content-Type so browser sets multipart boundary
          'Content-Type': '',
        },
      });

      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        isDragging ? 'border-cyan-400 bg-cyan-50/50' : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        accept=".pdf,.docx,.txt"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-700 font-medium">Uploading and processing document...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center shadow-sm text-blue-600 mb-2 border border-blue-100">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-700 font-medium text-lg">
              Drag & drop your legal document here
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Supports PDF, DOCX, or TXT up to 10 MB
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Browse Files
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start text-left">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
