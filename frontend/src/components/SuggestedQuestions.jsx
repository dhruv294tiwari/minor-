import React from 'react';
import { Sparkles, BookOpen, Clock, Calendar, Building, GraduationCap, DollarSign, Award } from 'lucide-react';

const SUGGESTIONS = [
  { text: "When are the semester exams?", icon: Calendar, label: "Exam Schedule" },
  { text: "How do I pay my semester fee?", icon: DollarSign, label: "Fee Payment" },
  { text: "What is the admission eligibility for B.Tech?", icon: GraduationCap, label: "Admissions" },
  { text: "What is the minimum attendance requirement?", icon: Clock, label: "Attendance Rule" },
  { text: "What are the Central Library timings?", icon: BookOpen, label: "Library Info" },
  { text: "Where is MAIT located and how to reach?", icon: Building, label: "Campus Location" },
  { text: "What is the difference between backlog and supplementary exam?", icon: Award, label: "Academic Guidance" },
];

export const SuggestedQuestions = ({ onSelectQuestion, disabled = false }) => {
  return (
    <div className="w-full my-4">
      <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-mait-crimson-600" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuestion(item.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs hover:border-mait-navy-400 hover:text-mait-navy-900 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
            >
              <Icon className="w-3.5 h-3.5 text-mait-navy-600 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
