import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquareText,
  RotateCw,
  PlusCircle,
  Clock,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { queriesApi } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import { Modal } from '../components/Modal';

export const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (sourceFilter) params.source_type = sourceFilter;
      if (search.trim()) params.search = search.trim();

      const res = await queriesApi.list(params);
      setQueries(res.data);
    } catch (err) {
      console.error("Failed to load queries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueries();
  };

  const openDetail = (q) => {
    setSelectedQuery(q);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mait-navy-900 tracking-tight">
            Student Query Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of student interactions, verified retrievals, and AI fallbacks
          </p>
        </div>
        <button
          type="button"
          onClick={fetchQueries}
          className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search query text or assistant responses..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            >
              <option value="">All Response Types</option>
              <option value="MAIT_VERIFIED">✓ MAIT Verified Only</option>
              <option value="AI_GENERATED">✨ AI Generated (Fallbacks)</option>
            </select>
          </div>

        </form>
      </div>

      {/* Queries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4">Student Query</th>
                <th className="py-3.5 px-4">Response Preview</th>
                <th className="py-3.5 px-4 text-center">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading query logs...</span>
                    </div>
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No student queries found matching filters.
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(q.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-mait-navy-900 max-w-xs truncate">
                      "{q.user_query}"
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate text-xs">
                      {q.response}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <SourceBadge source={q.source_type} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetail(q)}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-mait-navy-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Full Query & Response"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Query Interaction Record"
      >
        {selectedQuery && (
          <div className="space-y-4 text-sm text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Log ID: #{selectedQuery.id} • {new Date(selectedQuery.created_at).toLocaleString()}
              </span>
              <SourceBadge source={selectedQuery.source_type} />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Student Natural Language Query
              </span>
              <p className="font-bold text-base text-mait-navy-900 mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                "{selectedQuery.user_query}"
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                AI Assistant Response
              </span>
              <div className="mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap leading-relaxed">
                {selectedQuery.response}
              </div>
            </div>

            {selectedQuery.matched_entry_id && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-emerald-700 block">
                  Matched Knowledge Entry ID: #{selectedQuery.matched_entry_id}
                </span>
              </div>
            )}

            {selectedQuery.source_type === 'AI_GENERATED' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between gap-3 mt-4">
                <div>
                  <span className="font-bold block">Improve Knowledge Base</span>
                  <span>This query was answered via AI fallback. You can add verified institutional data for it.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false);
                    navigate('/admin/knowledge');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mait-navy-800 text-white rounded-lg text-xs font-semibold hover:bg-mait-navy-900 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Knowledge</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
