import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { feedbackApi } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';

export const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (ratingFilter) params.rating = ratingFilter;
      const res = await feedbackApi.list(params);
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [ratingFilter]);

  const helpfulCount = feedbacks.filter((f) => f.rating === 'helpful').length;
  const unhelpfulCount = feedbacks.filter((f) => f.rating === 'unhelpful').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mait-navy-900 tracking-tight">
            Student Feedback Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate student satisfaction and identify knowledge improvement opportunities
          </p>
        </div>
        <button
          type="button"
          onClick={fetchFeedbacks}
          className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feedbacks</span>
            <p className="text-2xl font-bold text-mait-navy-900 mt-1">{feedbacks.length}</p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Helpful Ratings</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{helpfulCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Improvement</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{unhelpfulCount}</p>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <ThumbsDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Filter by Rating</span>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="py-1.5 px-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
        >
          <option value="">All Ratings</option>
          <option value="helpful">Helpful (👍) Only</option>
          <option value="unhelpful">Unhelpful (👎) Only</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Rating</th>
                <th className="py-3.5 px-4">Student Query</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Comment</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading feedbacks...</span>
                    </div>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No student feedbacks submitted yet.
                  </td>
                </tr>
              ) : (
                feedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      {f.rating === 'helpful' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Helpful</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
                          <span>Unhelpful</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-mait-navy-900 max-w-xs truncate">
                      "{f.user_query || 'Query'}"
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SourceBadge source={f.source_type} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-sm truncate">
                      {f.comment || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs text-right whitespace-nowrap">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
