'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/api';
import { AnalysisResult, LegalDocument, QAPair } from '../../../../shared/types';
import {
  ArrowLeft, Loader2, AlertCircle, FileText, CheckCircle,
  ShieldAlert, FileSearch, Send, MessageSquare, Briefcase,
  DollarSign, Gavel, FileX, Info, ListChecks, Calendar, Sparkles
} from 'lucide-react';

export default function DocumentAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [questionInput, setQuestionInput] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      fetchDocumentAndAnalysis();
      fetchQAPairs();
    }
  }, [documentId]);

  const fetchDocumentAndAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docRes = await apiClient<{ success: boolean; data: LegalDocument }>(`/api/documents/${documentId}`);
      setDocument(docRes.data);

      try {
        const analysisRes = await apiClient<{ success: boolean; data: AnalysisResult }>(`/api/documents/${documentId}/analyze`, { method: 'GET' });
        if (analysisRes.data) {
          setAnalysis(analysisRes.data);
        }
      } catch (err: any) {
        if (!err.message?.includes('404')) {
          console.error('Failed to fetch analysis', err);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQAPairs = async () => {
    try {
      const res = await apiClient<{ success: boolean; data: QAPair[] }>(`/api/documents/${documentId}/ask`, { method: 'GET' });
      if (res.data) setQaPairs(res.data);
    } catch (err) {
      console.error('Failed to fetch QA pairs', err);
    }
  };

  const triggerAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await apiClient<{ success: boolean; data: AnalysisResult }>(`/api/documents/${documentId}/analyze`, { method: 'POST' });
      setAnalysis(res.data);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isAsking) return;

    setIsAsking(true);
    const q = questionInput.trim();
    setQuestionInput('');
    setQaError(null);
    try {
      const res = await apiClient<{ success: boolean; data: QAPair }>(`/api/documents/${documentId}/ask`, {
        method: 'POST',
        body: JSON.stringify({ question: q }),
      });
      if (res.data) {
        setQaPairs(prev => [...prev, res.data]);
      }
    } catch (err: any) {
      setQaError(err.message || 'Failed to ask question');
      setQuestionInput(q);
    } finally {
      setIsAsking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading workspace...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3 max-w-2xl">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg mb-1">{error?.includes('found') ? 'Document Not Found' : 'Error Loading Document'}</h3>
            <p className="text-sm">{error || 'Document not found'}</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Area */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{document.originalName}</h1>
          <p className="text-sm text-slate-500 mt-1">Uploaded {new Date(document.uploadedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Action / Error Banner Area */}
      {!analysis && !isAnalyzing && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <FileSearch className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ready for Analysis</h2>
          <p className="text-slate-500 max-w-md">
            Unleash Gemini AI to instantly extract obligations, highlight risks, and summarize this legal document.
          </p>

          {analysisError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm w-full max-w-lg mt-4 text-left">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {analysisError.includes('quota') || analysisError.includes('rate limit') || analysisError.includes('429') ? 'API Quota Exceeded' : 'Analysis Failed'}
                </h3>
                <p className="text-sm">{analysisError}</p>
              </div>
            </div>
          )}

          <button
            onClick={triggerAnalysis}
            disabled={isAnalyzing}
            className="mt-6 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            ✨ Analyze with Gemini
          </button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="p-16 bg-white rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white rounded-full p-4 shadow-sm border border-slate-100">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AI is reviewing your document</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2 mx-auto leading-relaxed">
              Gemini 3.6 Flash is currently extracting clauses, identifying risks, and mapping obligations...
            </p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {analysis && !isAnalyzing && (
        <div className="grid lg:grid-cols-3 gap-6 mt-6">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Executive Summary
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{analysis.summary}</p>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" /> Key Clauses
              </h2>
              {analysis.keyClauses?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.keyClauses.map((clause) => (
                    <div key={clause.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                      <h3 className="font-semibold text-slate-800 mb-2">{clause.title}</h3>
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{clause.summary}</p>
                      {clause.location && (
                         <span className="inline-block px-2.5 py-1 bg-slate-200/70 text-slate-600 text-[10px] rounded font-mono uppercase tracking-wider font-medium">
                           Source: {clause.location.section || 'Unknown'}
                         </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No key clauses identified.</p>
              )}
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Rights & Obligations
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-emerald-700">Rights</h3>
                  {analysis.rights?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.rights.map((r, i) => (
                        <li key={i} className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">{r.description}</li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-slate-500">None detected</p>}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-indigo-700">Obligations</h3>
                  {analysis.obligations?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.obligations.map((o, i) => (
                        <li key={i} className="text-sm text-slate-700 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">{o.description}</li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-slate-500">None detected</p>}
                </div>
              </div>
            </section>

            {/* Q&A Section - Appears below main analysis for flow */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Ask LegalLens AI
              </h2>

              <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {qaPairs.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Ask a question about this document.</p>
                    <p className="text-xs text-slate-400 mt-1">Answers are grounded in the extracted text.</p>
                  </div>
                ) : (
                  qaPairs.map(qa => (
                    <div key={qa.id} className="space-y-4">
                      {/* User Chat Bubble */}
                      <div className="flex gap-3 justify-end">
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%] shadow-sm">
                          {qa.question}
                        </div>
                      </div>

                      {/* AI Chat Bubble */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 p-4.5 rounded-2xl rounded-tl-sm flex-1 space-y-3 shadow-sm max-w-[95%]">
                          <p className="text-slate-800 text-sm leading-relaxed">{qa.answer}</p>

                          {qa.sources && qa.sources.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-blue-100/50 text-xs text-slate-600 shadow-sm">
                              <span className="font-semibold block mb-2 text-slate-700">Sources:</span>
                              <div className="space-y-2">
                                {qa.sources.map((s, idx) => (
                                  <div key={idx} className="flex gap-2 items-start">
                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">{s.section}</span>
                                    <span className="italic text-slate-500">"{s.excerpt}"</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                            <span>Confidence: <strong className="uppercase">{qa.confidence}</strong></span>
                            {qa.grounded && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3"/> Grounded</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {qaError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 flex items-start gap-2 text-sm shadow-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong className="block mb-0.5">
                      {qaError.includes('quota') || qaError.includes('rate limit') || qaError.includes('429') ? 'API Quota Exceeded' : 'Question Failed'}
                    </strong>
                    {qaError}
                  </div>
                </div>
              )}

              <form onSubmit={handleAskQuestion} className="relative">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={questionInput}
                  onChange={e => setQuestionInput(e.target.value)}
                  disabled={isAsking}
                  className="w-full pl-5 pr-32 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-800 shadow-sm disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={isAsking || !questionInput.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Ask
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">

            {/* Risks Card */}
            <section className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Risks & Issues
              </h2>
              {analysis.risks?.length > 0 ? (
                <ul className="space-y-4">
                  {analysis.risks.map(r => (
                    <li key={r.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <span className="font-semibold text-amber-900 text-sm block">{r.title}</span>
                      <p className="text-amber-800/80 text-xs mt-1.5 leading-relaxed">{r.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No significant risks detected.</p>
                </div>
              )}
            </section>

            {/* Missing Info Card */}
            {analysis.missingInformation?.length > 0 && (
              <section className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2 border-b border-orange-100 pb-3">
                  <FileX className="w-5 h-5 text-orange-500" /> Missing Information
                </h2>
                <ul className="space-y-3">
                  {analysis.missingInformation.map(m => (
                    <li key={m.id} className="text-sm bg-orange-50 p-3 rounded-lg border border-orange-100 text-orange-800">
                      <span className="block font-medium mb-1 capitalize text-orange-900">Impact: {m.impact}</span>
                      {m.description}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Payment & Termination Card */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Payment Terms
                </h2>
                {analysis.paymentTerms?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.paymentTerms.map(p => (
                      <li key={p.id} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100"><strong>{p.amount}</strong>: {p.condition}</li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-500">Not specified.</p>}
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Gavel className="w-4 h-4 text-rose-600" /> Termination
                </h2>
                {analysis.terminationTerms?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.terminationTerms.map(t => (
                      <li key={t.id} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">{t.condition} {t.noticePeriod ? `(Notice: ${t.noticePeriod})` : ''}</li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-500">Not specified.</p>}
              </div>
            </section>

            {/* Parties Card */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Key Parties</h2>
              <ul className="space-y-3">
                {analysis.keyParties?.map(p => (
                  <li key={p.id} className="text-sm flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-900">{p.name}</span>
                    <span className="text-slate-500 text-xs mt-0.5">{p.role}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Dates Card */}
            {analysis.importantDates?.length > 0 && (
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Key Dates
                </h2>
                <ul className="space-y-3">
                  {analysis.importantDates.map(d => (
                    <li key={d.id} className="text-sm flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-900">{d.date}</span>
                      <span className="text-slate-600 text-xs mt-1">{d.event}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="p-4 bg-slate-50 rounded-lg flex gap-3 text-xs text-slate-500 border border-slate-200 shadow-inner">
              <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <p>This analysis is AI-generated for informational purposes only. Do not use this as a substitute for professional legal counsel.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
