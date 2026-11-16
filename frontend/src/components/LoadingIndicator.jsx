import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingIndicator = () => {
  return (
    <div className="flex items-start gap-3 my-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-mait-navy-800 text-white flex items-center justify-center shrink-0 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-md">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5 items-center py-1 px-1">
            <div className="w-2 h-2 rounded-full bg-mait-navy-600 animate-typing-1"></div>
            <div className="w-2 h-2 rounded-full bg-mait-navy-600 animate-typing-2"></div>
            <div className="w-2 h-2 rounded-full bg-mait-navy-600 animate-typing-3"></div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Consulting verified database...
          </span>
        </div>
      </div>
    </div>
  );
};
