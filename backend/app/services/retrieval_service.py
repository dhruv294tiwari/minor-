import re
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.knowledge import KnowledgeEntry
from app.models.category import Category


import re
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.knowledge import KnowledgeEntry
from app.models.category import Category


# Common English and Hindi conversational filler words
STOPWORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was",
    "were", "am", "be", "been", "being", "what", "which", "who", "whom", "this", "that",
    "these", "those", "how", "when", "where", "why", "can", "could", "would", "should",
    "do", "does", "did", "and", "or", "but", "if", "so", "as", "about", "by", "from",
    "it", "its", "me", "my", "we", "our", "you", "your", "tell", "please", "give", "info",
    "information", "hai", "kya", "kab", "kaise", "kahan", "kitna", "kitni", "batao", "hoga", "honge",
    "apply", "get", "take", "know", "find", "check", "need", "want", "like"
}

# Generic institutional background terms that appear across almost all college records
GENERIC_INSTITUTIONAL_WORDS = {
    "college", "mait", "institute", "institution", "official", "delhi",
    "ggsipu", "ipu", "student", "students", "campus", "engineering"
}

# Normalization map for common texting abbreviations, colloquialisms, and typos
SLANG_MAP = {
    "cllg": "college",
    "clg": "college",
    "colg": "college",
    "collg": "college",
    "wht": "what",
    "wat": "what",
    "wt": "what",
    "offical": "official",
    "ofcl": "official",
    "abt": "about",
    "ans": "answer",
    "answere": "answer",
    "plz": "please",
    "pls": "please",
    "univ": "university",
    "uni": "university",
    "dept": "department",
    "amt": "amount",
    "sem": "semester",
    "admsn": "admission",
    "adm": "admission",
    "doc": "document",
    "docs": "documents",
    "ph": "phone",
    "no": "number",
}

# Synonyms and conceptual stems for collegiate queries
SYNONYMS = {
    "exam": ["exam", "examination", "datesheet", "schedule", "endsem", "midsem", "test"],
    "exams": ["exam", "examination", "datesheet", "schedule", "endsem", "midsem"],
    "examination": ["exam", "examination", "datesheet", "schedule"],
    "fee": ["fee", "fees", "tuition", "cost"],
    "fees": ["fee", "fees", "tuition", "cost"],
    "payment": ["payment", "pay", "challan", "erp", "portal", "submit", "deposit", "online payment"],
    "amount": ["amount", "structure", "kitna", "kitni", "total", "cost", "breakdown", "charges"],
    "admission": ["admission", "admissions", "eligibility", "jee", "counseling", "seat"],
    "admissions": ["admission", "admissions", "eligibility", "jee", "counseling"],
    "timetable": ["timetable", "schedule", "routine", "classes", "lecture"],
    "hostel": ["hostel", "accommodation", "residence", "room", "mess"],
    "scholarship": ["scholarship", "scholarships", "financial", "aid", "fee waiver", "concession"],
    "placement": ["placement", "placements", "package", "salary", "recruiter", "company", "companies", "tnp"],
    "placements": ["placement", "placements", "package", "salary", "recruiter", "company"],
    "attendance": ["attendance", "shortage", "detain", "75%", "percentage"],
    "library": ["library", "books", "issue", "return", "digital library"],
    "canteen": ["canteen", "cafeteria", "food", "mess"],
    "transport": ["transport", "bus", "metro", "route", "commute"],
    "department": ["department", "branch", "cse", "it", "ece", "eee", "mae", "mechanical"],
    "faculty": ["faculty", "teacher", "professor", "hod", "staff"],
    "notice": ["notice", "circular", "announcement", "update"],
    "result": ["result", "results", "marks", "grade", "sgpa", "cgpa", "backlog", "reappear"],
    "backlog": ["backlog", "supplementary", "reappear", "compartment", "fail"],
    "id": ["id", "code", "email", "identifier", "contact", "website"],
    "contact": ["contact", "phone", "number", "email", "helpline", "call", "directory"],
}


def normalize_query(text: str) -> str:
    """Normalize colloquial slang, common typos, and abbreviations."""
    if not text:
        return ""
    words = text.lower().split()
    corrected = [SLANG_MAP.get(w.strip(".,?!:;"), w.strip(".,?!:;")) for w in words]
    return " ".join(corrected)


def clean_tokens(text: str) -> List[str]:
    """Tokenize and clean text into normalized non-stopword tokens."""
    if not text:
        return []
    normalized = normalize_query(text)
    words = re.findall(r'[a-zA-Z0-9%]+', normalized)
    return [w for w in words if len(w) > 1 and w not in STOPWORDS]


def expand_query_tokens(tokens: List[str]) -> set:
    """Expand tokens with domain-specific collegiate synonyms."""
    expanded = set(tokens)
    for token in tokens:
        if token in SYNONYMS:
            expanded.update(SYNONYMS[token])
    return expanded


def score_entry(query: str, query_tokens: set, raw_tokens: List[str], entry: KnowledgeEntry) -> float:
    """Calculate an accurate, discerning relevance score for a verified knowledge entry."""
    norm_query = normalize_query(query)
    query_lower = norm_query.strip()

    title_lower = (entry.title or "").lower()
    question_lower = (entry.question or "").lower()
    answer_lower = (entry.answer or "").lower()
    keywords_lower = (entry.keywords or "").lower()

    # 1. Exact or Substring match on Question/Title
    if query_lower == question_lower or (len(query_lower) > 6 and query_lower in question_lower):
        return 35.0
    if query_lower == title_lower or (len(query_lower) > 6 and query_lower in title_lower):
        return 30.0

    raw_set = set(raw_tokens)
    if not raw_set:
        return 0.0

    q_tokens = set(clean_tokens(question_lower))
    t_tokens = set(clean_tokens(title_lower))
    k_tokens = set(clean_tokens(keywords_lower))
    a_tokens = set(clean_tokens(answer_lower))

    # Core non-generic content tokens (exclude generic institutional background words)
    content_raw_tokens = [w for w in raw_tokens if w not in GENERIC_INSTITUTIONAL_WORDS]
    if content_raw_tokens:
        matched_content = set(content_raw_tokens).intersection(q_tokens.union(t_tokens).union(k_tokens))
        matched_syn_content = (query_tokens.intersection(q_tokens.union(t_tokens).union(k_tokens))) - GENERIC_INSTITUTIONAL_WORDS
        # If the user specified distinctive content words, at least one MUST match entry metadata
        if not matched_content and not matched_syn_content:
            return 0.0

    matched_raw_q = raw_set.intersection(q_tokens)
    matched_raw_t = raw_set.intersection(t_tokens)
    matched_raw_k = raw_set.intersection(k_tokens)
    matched_raw_a = raw_set.intersection(a_tokens)

    # Must match at least something in Question, Title, or Keywords (reject answer-body-only matches)
    if not matched_raw_q and not matched_raw_t and not matched_raw_k:
        syn_meta_match = (query_tokens.intersection(q_tokens.union(t_tokens).union(k_tokens))) - GENERIC_INSTITUTIONAL_WORDS
        if not syn_meta_match:
            return 0.0

    score = 0.0

    # 2. Match on keywords field
    if keywords_lower:
        kw_list = [k.strip().lower() for k in keywords_lower.split(",") if k.strip()]
        for kw in kw_list:
            if kw and (kw == query_lower or (len(kw) > 4 and kw in query_lower)):
                score += 15.0
            elif any(token == kw for token in raw_tokens):
                score += 5.0

    # 3. Token overlap scoring: non-generic tokens get full weight; generic background tokens get low weight
    for t in matched_raw_q:
        score += 1.0 if t in GENERIC_INSTITUTIONAL_WORDS else 6.0
    for t in matched_raw_t:
        score += 1.0 if t in GENERIC_INSTITUTIONAL_WORDS else 5.0
    for t in matched_raw_k:
        score += 1.0 if t in GENERIC_INSTITUTIONAL_WORDS else 4.0
    for t in matched_raw_a:
        if t not in GENERIC_INSTITUTIONAL_WORDS:
            score += 1.5

    # Synonyms / expanded tokens match with smaller weight
    exp_matched = (query_tokens.intersection(q_tokens.union(t_tokens).union(k_tokens)) - raw_set) - GENERIC_INSTITUTIONAL_WORDS
    score += len(exp_matched) * 2.5

    # Compute coverage of RAW query tokens
    all_matched_raw = matched_raw_q.union(matched_raw_t).union(matched_raw_k).union(matched_raw_a)
    coverage = len(all_matched_raw) / len(raw_set) if raw_set else 0

    # Strict coverage check for multi-word queries
    if len(content_raw_tokens) >= 2:
        content_matched = set(content_raw_tokens).intersection(all_matched_raw)
        if len(content_matched) / len(content_raw_tokens) < 0.50:
            return 0.0

    # Boost score by coverage
    score *= (0.5 + coverage)

    return score


def search_verified_knowledge(
    db: Session,
    query: str,
    limit: int = 3,
    threshold: float = 6.0
) -> List[Tuple[KnowledgeEntry, float]]:
    """
    Search the verified MAIT SQL database for relevant information.
    Returns a list of tuples: (KnowledgeEntry, score) sorted by score descending.
    Only entries with verified=True and score >= threshold are returned.
    """
    if not query or not query.strip():
        return []

    raw_tokens = clean_tokens(query)
    expanded_tokens = expand_query_tokens(raw_tokens)

    # Fetch all verified entries with their categories eager-loaded
    entries = db.query(KnowledgeEntry).options(
        joinedload(KnowledgeEntry.category)
    ).filter(KnowledgeEntry.verified == True).all()

    scored_entries: List[Tuple[KnowledgeEntry, float]] = []

    for entry in entries:
        score = score_entry(query, expanded_tokens, raw_tokens, entry)
        if score >= threshold:
            scored_entries.append((entry, score))

    # Sort descending by score
    scored_entries.sort(key=lambda x: x[1], reverse=True)

    return scored_entries[:limit]
