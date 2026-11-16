import React, { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { chatApi } from '../services/api';

const cleanThinkTags = (content) => {
  if (!content) return '';
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, '');
  if (cleaned.includes('<think>')) {
    cleaned = cleaned.split('<think>')[0];
  }
  return cleaned.trim();
};

const parseInlineText = (text) => {
  if (!text) return '';
  
  let tokens = [{ type: 'text', content: text }];

  // 1. Process Links: [text](url)
  tokens = tokens.flatMap(token => {
    if (token.type !== 'text') return token;
    const parts = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(token.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'link', label: match[1], url: match[2] });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < token.content.length) {
      parts.push({ type: 'text', content: token.content.substring(lastIndex) });
    }
    return parts;
  });

  // 2. Process Bold: **text**
  tokens = tokens.flatMap(token => {
    if (token.type !== 'text') return token;
    const parts = [];
    let lastIndex = 0;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldRegex.exec(token.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'bold', content: match[1] });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < token.content.length) {
      parts.push({ type: 'text', content: token.content.substring(lastIndex) });
    }
    return parts;
  });

  // 3. Process Inline Code: `code`
  tokens = tokens.flatMap(token => {
    if (token.type !== 'text') return token;
    const parts = [];
    let lastIndex = 0;
    const codeRegex = /`([^`]+)`/g;
    let match;
    while ((match = codeRegex.exec(token.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[1] });
      lastIndex = codeRegex.lastIndex;
    }
    if (lastIndex < token.content.length) {
      parts.push({ type: 'text', content: token.content.substring(lastIndex) });
    }
    return parts;
  });

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'bold':
        return <strong key={idx} className="font-semibold text-slate-900">{token.content}</strong>;
      case 'code':
        return <code key={idx} className="bg-slate-100 text-mait-crimson-600 px-1 py-0.5 rounded text-xs font-mono">{token.content}</code>;
      case 'link':
        return (
          <a
            key={idx}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mait-navy-700 hover:text-mait-crimson-600 font-semibold underline underline-offset-2"
          >
            {token.label}
          </a>
        );
      default:
        return token.content;
    }
  });
};

const parseMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' | 'ol' | null

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(<ul key={key} className="list-disc pl-5 mb-2">{...currentList}</ul>);
      } else if (listType === 'ol') {
        elements.push(<ol key={key} className="list-decimal pl-5 mb-2">{...currentList}</ol>);
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for bullet list item
    const bulletMatch = line.match(/^(\s*)(•|-|\*)\s+(.*)$/);
    // Check for numbered list item
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList(`list-before-${i}`);
        listType = 'ul';
      }
      currentList.push(
        <li key={`li-${i}`} className="mb-1">
          {parseInlineText(bulletMatch[3])}
        </li>
      );
    } else if (numberMatch) {
      if (listType !== 'ol') {
        flushList(`list-before-${i}`);
        listType = 'ol';
      }
      currentList.push(
        <li key={`li-${i}`} className="mb-1">
          {parseInlineText(numberMatch[3])}
        </li>
      );
    } else {
      flushList(`list-before-${i}`);
      if (trimmed) {
        // Check for headers
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = parseInlineText(headerMatch[2]);
          if (level === 1) elements.push(<h1 key={`h-${i}`} className="text-xl font-bold mt-3 mb-2">{content}</h1>);
          else if (level === 2) elements.push(<h2 key={`h-${i}`} className="text-lg font-bold mt-3 mb-2">{content}</h2>);
          else elements.push(<h3 key={`h-${i}`} className="text-md font-bold mt-2 mb-1">{content}</h3>);
        } else {
          elements.push(
            <p key={`p-${i}`} className="mb-2">
              {parseInlineText(line)}
            </p>
          );
        }
      } else {
        // Empty line
        elements.push(<div key={`br-${i}`} className="h-2" />);
      }
    }
  }
  flushList('list-final');
  return elements;
};


export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const [rating, setRating] = useState(null); // 'helpful' | 'unhelpful' | null
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const submitFeedback = async (commentText) => {
    if (!message.query_log_id || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await chatApi.sendFeedback({
        query_log_id: message.query_log_id,
        rating: rating,
        comment: commentText ? commentText.trim() : null,
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-mait-crimson-600 text-white'
            : 'bg-mait-navy-800 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Main Content Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-mait-navy-800 text-white rounded-tr-sm'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
          }`}
        >
          {/* Header row in Assistant Bubble */}
          {!isUser && (
            <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-mait-navy-900">
                  MAIT AI Assistant
                </span>
                {message.source && <SourceBadge source={message.source} />}
              </div>
              {message.timestamp && (
                <span className="text-[11px] text-slate-400">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
          )}

          {/* Text Content */}
          <div className="whitespace-pre-wrap chat-markdown">
            {isUser ? message.content : parseMarkdown(cleanThinkTags(message.content))}
          </div>

          {/* Source Citation for Verified Answers */}
          {!isUser && message.source === 'MAIT_VERIFIED' && (message.source_citation || message.source_url) && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Source:</span>
              <span>{message.source_citation || "Official MAIT Knowledge Base"}</span>
              {message.source_url && (
                <a
                  href={message.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-mait-navy-700 hover:text-mait-crimson-600 font-medium underline underline-offset-2 ml-auto"
                >
                  <span>Verify Online</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Message Footer / Feedback */}
        <div className="flex items-center gap-3 mt-1.5 px-1 w-full">
          {isUser && message.timestamp && (
            <span className="text-[11px] text-slate-400">
              {formatTimestamp(message.timestamp)}
            </span>
          )}

          {!isUser && message.query_log_id && (
            <div className="w-full text-xs text-slate-400">
              {!rating && !feedbackSubmitted && (
                <div className="flex items-center gap-2">
                  <span>Was this helpful?</span>
                  <button
                    type="button"
                    onClick={() => setRating('helpful')}
                    className="p-1 rounded-md transition-colors cursor-pointer hover:bg-slate-200 text-slate-500"
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating('unhelpful')}
                    className="p-1 rounded-md transition-colors cursor-pointer hover:bg-slate-200 text-slate-500"
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {rating && !feedbackSubmitted && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitFeedback(comment);
                  }}
                  className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-2 animate-fade-in max-w-sm"
                >
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>
                      {rating === 'helpful' ? '👍 Share why it was helpful' : '👎 Tell us what went wrong'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRating(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add an optional comment..."
                    disabled={feedbackLoading}
                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-mait-navy-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={feedbackLoading}
                      onClick={() => {
                        submitFeedback(null);
                      }}
                      className="px-2.5 py-1 rounded text-slate-500 hover:text-slate-700 bg-transparent text-[11px] font-semibold cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={feedbackLoading}
                      className="px-3 py-1 rounded bg-mait-navy-800 text-white hover:bg-mait-navy-900 text-[11px] font-semibold cursor-pointer"
                    >
                      {feedbackLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}

              {feedbackSubmitted && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  <span>Thanks for your feedback!</span>
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
