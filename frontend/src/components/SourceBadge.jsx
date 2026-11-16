import React from 'react';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export const SourceBadge = ({ source, size = "md" }) => {
  if (source === "MAIT_VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>MAIT Verified</span>
      </span>
    );
  }

  if (source === "AI_GENERATED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span>AI Generated</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span>General Info</span>
    </span>
  );
};
