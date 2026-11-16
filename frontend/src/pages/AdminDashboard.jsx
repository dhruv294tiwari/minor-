import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FolderTree,
  MessageSquareText,
  CheckCircle2,
  Sparkles,
  RotateCw,
  ArrowRight,
  TrendingUp,
  ThumbsUp
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
      setError("Unable to fetch dashboard statistics from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading live database statistics...</span>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={fetchStats}
          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mait-navy-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verified knowledge base & query analytics
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Knowledge Entries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Knowledge Entries
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-mait-navy-900">
              {stats?.total_entries || 0}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              ({stats?.total_verified_entries || 0} verified)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Verified Knowledge Items</span>
            <Link to="/admin/knowledge" className="text-mait-navy-700 font-semibold hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* Categories Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Categories
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-mait-navy-900">
              {stats?.total_categories || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">categories</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Departmental Taxonomies</span>
            <Link to="/admin/categories" className="text-mait-navy-700 font-semibold hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* Total Student Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student Queries
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MessageSquareText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-mait-navy-900">
              {stats?.total_queries || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">total requests</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total logged chats</span>
            <Link to="/admin/queries" className="text-mait-navy-700 font-semibold hover:underline">
              Inspect →
            </Link>
          </div>
        </div>

        {/* Verified Coverage Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified Resolution
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {stats?.verified_percentage || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats?.verified_queries_count || 0} verified)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{stats?.ai_generated_queries_count || 0} AI Fallbacks</span>
            <Link to="/admin/feedback" className="text-mait-navy-700 font-semibold hover:underline">
              Feedback →
            </Link>
          </div>
        </div>

      </div>

      {/* Query Breakdown Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-mait-navy-900">
            Assistant Answer Source Distribution
          </h2>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              MAIT Verified: {stats?.verified_queries_count || 0} ({stats?.verified_percentage || 0}%)
            </span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              AI Generated: {stats?.ai_generated_queries_count || 0}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-l-full"
            style={{ width: `${stats?.verified_percentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Three Column Section: Recent Queries, Recent Knowledge Updates, and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Student Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-mait-navy-900">
              Recent Student Queries
            </h2>
            <Link to="/admin/queries" className="text-xs font-semibold text-mait-navy-700 hover:underline">
              View All →
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
            {stats?.recent_queries?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No student queries recorded yet.
              </p>
            ) : (
              stats?.recent_queries?.slice(0, 5).map((q) => (
                <div key={q.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      "{q.user_query}"
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {q.response.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="shrink-0">
                    <SourceBadge source={q.source_type} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Knowledge Updates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-mait-navy-900">
              Recent Knowledge Updates
            </h2>
            <Link to="/admin/knowledge" className="text-xs font-semibold text-mait-navy-700 hover:underline">
              View All →
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
            {stats?.recent_knowledge_updates?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No knowledge base updates yet.
              </p>
            ) : (
              stats?.recent_knowledge_updates?.slice(0, 5).map((k) => (
                <div key={k.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {k.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Category: {k.category_name} • {new Date(k.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      k.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {k.verified ? 'Verified' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Knowledge Distribution by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-mait-navy-900">
              Knowledge by Category
            </h2>
            <Link to="/admin/categories" className="text-xs font-semibold text-mait-navy-700 hover:underline">
              Manage Categories →
            </Link>
          </div>

          <div className="flex-1 space-y-2.5 overflow-hidden">
            {stats?.category_breakdown?.map((cat) => (
              <div key={cat.category_id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700 truncate">
                  {cat.category_name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {cat.entries_count} entries
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
