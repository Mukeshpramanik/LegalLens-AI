'use client';

import React, { useEffect, useState } from 'react';
import { checkBackendHealth, apiClient } from '../../services/api';
import DocumentUpload from '../../components/Documents/DocumentUpload';
import { LegalDocument, ComparisonResult } from '../../../../shared/types';
import { FileText, Clock, CheckCircle, ShieldAlert, Loader2, ArrowRight, Scale } from 'lucide-react';

export default function DashboardPage() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [isError, setIsError] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    checkBackendHealth()
      .then((res) => {
        setBackendStatus(res.status === 'healthy' ? 'Connected' : 'Degraded');
        setIsError(res.status !== 'healthy');
      })
      .catch((err) => {
        setBackendStatus('Backend Offline');
        setIsError(true);
      });
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await apiClient<{ success: boolean; data: LegalDocument[] }>('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleUploadSuccess = (doc: LegalDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const completedDocs = documents.filter(d => d.status === 'complete');

  const handleCompare = async () => {
    if (!docAId || !docBId) {
      setCompareError('Please select both documents');
      return;
    }
    if (docAId === docBId) {
      setCompareError('Please select two different documents');
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setComparisonResult(null);

    try {
      const res = await apiClient<{ success: boolean; data: ComparisonResult }>('/api/documents/compare', {
        method: 'POST',
        body: JSON.stringify({ documentIdA: docAId, documentIdB: docBId }),
      });
      setComparisonResult(res.data);
    } catch (err: any) {
      setCompareError(err.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Legal Document Workspace</h1>
          <p className="text-slate-600 text-sm">Upload legal documents to analyze, ask grounded questions, and compare versions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Backend API:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isError ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'} border`}>
            <span className={`w-2 h-2 rounded-full ${isError ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            {backendStatus}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col justify-between h-full shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-lg mb-1">Compare Two Contracts</h2>
              <p className="text-slate-600 text-xs mb-4">Side-by-side clause revision & change detection.</p>
            </div>
            <button
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-colors"
              onClick={() => setIsCompareMode(!isCompareMode)}
            >
              {isCompareMode ? 'Close Comparison' : 'Select Documents to Compare'}
            </button>
          </div>
        </div>
      </div>

      {isCompareMode && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Compare Documents</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select className="p-3 border border-slate-300 rounded-lg text-sm bg-white" value={docAId} onChange={e => setDocAId(e.target.value)}>
              <option value="">Select Document A</option>
              {completedDocs.map(d => <option key={d.id} value={d.id}>{d.originalName}</option>)}
            </select>
            <select className="p-3 border border-slate-300 rounded-lg text-sm bg-white" value={docBId} onChange={e => setDocBId(e.target.value)}>
              <option value="">Select Document B</option>
              {completedDocs.map(d => <option key={d.id} value={d.id}>{d.originalName}</option>)}
            </select>
          </div>
          {compareError && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 flex items-start gap-2 text-sm shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block mb-0.5">
                  {compareError.includes('quota') || compareError.includes('rate limit') ? 'API Quota Exceeded' : 'Comparison Failed'}
                </strong>
                {compareError}
              </div>
            </div>
          )}
          <button
            onClick={handleCompare}
            disabled={isComparing || !docAId || !docBId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Compare Now
          </button>

          {comparisonResult && (
            <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <section>
                <h3 className="font-bold text-slate-900 mb-2">Summary</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{comparisonResult.summary}</p>
              </section>

              {comparisonResult.keyDifferences && comparisonResult.keyDifferences.length > 0 && (
                <section>
                  <h3 className="font-bold text-slate-900 mb-2">Key Differences</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {comparisonResult.keyDifferences.map((diff, i) => <li key={i}>{diff}</li>)}
                  </ul>
                </section>
              )}

              {comparisonResult.changes && comparisonResult.changes.length > 0 && (
                <section>
                  <h3 className="font-bold text-slate-900 mb-2">Clause Changes</h3>
                  <div className="space-y-4">
                    {comparisonResult.changes.map((change, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-slate-800 text-sm uppercase">{change.category}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${change.changeType === 'added' ? 'bg-emerald-100 text-emerald-800' : change.changeType === 'removed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {change.changeType}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border border-slate-200">
                            <div className="text-xs text-slate-500 font-medium mb-1">Doc A:</div>
                            <div className="text-slate-700 line-through opacity-70">{change.documentA || 'N/A'}</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-slate-200">
                            <div className="text-xs text-slate-500 font-medium mb-1">Doc B:</div>
                            <div className="text-slate-700">{change.documentB || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {comparisonResult.risks && comparisonResult.risks.length > 0 && (
                <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Risks Introduced</h3>
                  <ul className="space-y-3">
                    {comparisonResult.risks.map((risk, i) => (
                      <li key={i} className="text-sm bg-white p-3 rounded border border-amber-100">
                        <span className="font-semibold text-amber-900 block">{risk.title}</span>
                        <p className="text-amber-800 mt-1">{risk.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p className="text-[10px] text-slate-400 mt-4 border-t pt-4 text-center">{comparisonResult.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* Document List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-900 text-lg">Your Documents</h2>
          <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            {documents.length} document{documents.length !== 1 ? 's' : ''} stored
          </span>
        </div>

        {isLoadingDocs ? (
          <div className="p-12 text-center text-slate-500">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-700">No legal documents uploaded yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 bg-white">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className={`inline-flex items-center gap-1 font-medium ${doc.status === 'complete' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {doc.status === 'complete' ? <CheckCircle className="w-3 h-3" /> : null}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => window.location.href = `/dashboard/document/${doc.id}`}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                  >
                    View Analysis
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
