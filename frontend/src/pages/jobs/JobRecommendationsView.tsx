/**
 * Job Recommendations View
 * Premium UI that fetches real job listings from Adzuna API based on user profile skills.
 * All hardcoded data removed — jobs come exclusively from the API.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Globe,
  DollarSign,
  Calendar,
  Tag,
  Zap,
  RefreshCw,
  ArrowUpRight,
  X,
  Star,
  Layers,
  Users,
} from 'lucide-react';

/* ===========================
   Types
   =========================== */
interface AdzunaJobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: boolean;
  contract_time?: string;
  contract_type?: string;
  category: string;
  created: string;
  redirect_url: string;
}

interface JobRecommendationsViewProps {
  onPrepareForInterview: (job: any) => void;
  onNavigateToProfile: () => void;
}

/* ===========================
   CSS-in-JS Styles
   =========================== */
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
    padding: '0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#E2E8F0',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  meshGradientOrb1: {
    position: 'absolute' as const,
    top: '-120px',
    right: '-80px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none' as const,
  },
  meshGradientOrb2: {
    position: 'absolute' as const,
    bottom: '-100px',
    left: '-60px',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    pointerEvents: 'none' as const,
  },
  container: {
    maxWidth: '1380px',
    margin: '0 auto',
    padding: '24px 20px 40px',
    position: 'relative' as const,
    zIndex: 1,
  },

  // Hero Section
  hero: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '20px',
    padding: '32px 36px',
    marginBottom: '28px',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  heroIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 8px 25px rgba(99,102,241,0.3)',
  },
  heroTitle: {
    fontSize: '1.65rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    background: 'linear-gradient(135deg, #E2E8F0, #94A3B8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
  },
  heroSubtitle: {
    fontSize: '0.88rem',
    color: '#94A3B8',
    margin: 0,
  },
  statBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '12px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.25)',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#A5B4FC',
  },

  // Skills Display
  skillsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 24px',
    background: 'rgba(30,41,59,0.7)',
    border: '1px solid rgba(71,85,105,0.3)',
    borderRadius: '14px',
    marginBottom: '24px',
    backdropFilter: 'blur(12px)',
    overflowX: 'auto' as const,
    flexWrap: 'wrap' as const,
  },
  skillChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#C4B5FD',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s ease',
  },

  // Filters & Search Bar
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: 'rgba(30,41,59,0.6)',
    border: '1px solid rgba(71,85,105,0.3)',
    borderRadius: '14px',
    marginBottom: '20px',
    backdropFilter: 'blur(12px)',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px 10px 40px',
    borderRadius: '10px',
    border: '1px solid rgba(71,85,105,0.4)',
    background: 'rgba(15,23,42,0.5)',
    color: '#E2E8F0',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  filterSelect: {
    padding: '9px 32px 9px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(71,85,105,0.4)',
    background: 'rgba(15,23,42,0.5)',
    color: '#CBD5E1',
    fontSize: '0.82rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  },

  // Job Cards Grid
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '18px',
    marginBottom: '28px',
  },
  jobCard: {
    background: 'rgba(30,41,59,0.55)',
    border: '1px solid rgba(71,85,105,0.3)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(16px)',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  jobCardHover: {
    borderColor: 'rgba(99,102,241,0.5)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 40px rgba(99,102,241,0.12)',
  },
  companyAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
    letterSpacing: '-0.02em',
  },
  jobTitle: {
    fontSize: '1.02rem',
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: '2px',
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },
  jobCompany: {
    fontSize: '0.84rem',
    color: '#94A3B8',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.78rem',
    color: '#64748B',
  },
  jobDescription: {
    fontSize: '0.82rem',
    lineHeight: 1.55,
    color: '#94A3B8',
    marginTop: '10px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '12px',
  },
  tag: {
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
    background: 'rgba(99,102,241,0.12)',
    color: '#A5B4FC',
    border: '1px solid rgba(99,102,241,0.2)',
  },
  salaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    background: 'rgba(16,185,129,0.12)',
    color: '#6EE7B7',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  contractBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.76rem',
    fontWeight: 600,
    background: 'rgba(6,182,212,0.12)',
    color: '#67E8F9',
    border: '1px solid rgba(6,182,212,0.2)',
  },

  // Button Styles
  applyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
  },
  bookmarkBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid rgba(71,85,105,0.4)',
    background: 'rgba(15,23,42,0.4)',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    borderRadius: '10px',
    border: '1px solid rgba(99,102,241,0.3)',
    background: 'rgba(99,102,241,0.1)',
    color: '#A5B4FC',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Pagination
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 0',
  },
  pageBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid rgba(71,85,105,0.3)',
    background: 'rgba(30,41,59,0.5)',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  pageBtnActive: {
    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    color: '#fff',
    border: '1px solid rgba(99,102,241,0.5)',
    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
  },

  // States
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: 'rgba(30,41,59,0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(71,85,105,0.2)',
  },
  loadingOverlay: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '16px',
  },

  // Detail Modal
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalContent: {
    background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
    border: '1px solid rgba(71,85,105,0.4)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto' as const,
    position: 'relative' as const,
  },
  modalClose: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid rgba(71,85,105,0.3)',
    background: 'rgba(15,23,42,0.5)',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

/* ===========================
   Gradient avatar colors (deterministic)
   =========================== */
const AVATAR_GRADIENTS = [
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#F43F5E'],
  ['#06B6D4', '#0EA5E9'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#EF4444'],
  ['#8B5CF6', '#EC4899'],
  ['#14B8A6', '#6366F1'],
  ['#F97316', '#F59E0B'],
];

function getAvatarGradient(company: string): string {
  const idx = Math.abs(company.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
  return `linear-gradient(135deg, ${AVATAR_GRADIENTS[idx][0]}, ${AVATAR_GRADIENTS[idx][1]})`;
}

function getCompanyInitials(company: string): string {
  return company
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function extractKeywords(desc: string): string[] {
  const techTerms = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Redis', 'GraphQL', 'REST', 'API', 'Microservices', 'CI/CD', 'DevOps', 'Agile',
    'HTML5', 'CSS3', 'SASS', 'Tailwind', 'Next.js', 'Express', 'Spring', 'Django',
    'Flask', 'Go', 'Rust', 'C++', 'C#', '.NET', 'Kafka', 'RabbitMQ', 'Machine Learning',
    'AI', 'Data Science', 'SQL', 'NoSQL', 'Git', 'Linux', 'Terraform', 'Jenkins',
    'Figma', 'Scrum', 'Jira', 'Redux', 'Webpack', 'Vite', 'Swift', 'Kotlin',
    'React Native', 'Flutter', 'iOS', 'Android', 'Mobile',
  ];
  const found: string[] = [];
  const lower = desc.toLowerCase();
  for (const term of techTerms) {
    if (lower.includes(term.toLowerCase()) && !found.includes(term)) {
      found.push(term);
    }
    if (found.length >= 6) break;
  }
  return found;
}

/* ===========================
   Component
   =========================== */
export const JobRecommendationsView: React.FC<JobRecommendationsViewProps> = ({
  onPrepareForInterview,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();

  // ── State ──
  const [jobs, setJobs] = useState<AdzunaJobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('in');
  const [contractFilter, setContractFilter] = useState('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<AdzunaJobResult | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const resultsPerPage = 12;

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Derive user skills ──
  const userSkills: string[] = user?.profile?.skills?.map(s => s.name) || [];

  // ── Fetch Jobs ──
  const fetchJobs = useCallback(async (page: number = 1) => {
    if (userSkills.length === 0) {
      setError('noSkills');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.job.getRecommendations({
        skills: userSkills,
        country: countryFilter,
        page,
        perPage: resultsPerPage,
      });

      if (response.success && response.data) {
        setJobs(response.data.results);
        setTotalCount(response.data.count);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to load job recommendations');
      }
    } catch (err: any) {
      console.error('[JobRecs] Fetch error:', err);
      setError(err.message || 'Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [userSkills.join(','), countryFilter]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // ── Handlers ──
  const handlePageChange = (page: number) => {
    fetchJobs(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Filtered Jobs ──
  const displayJobs = jobs.filter(j => {
    if (contractFilter !== 'all' && j.contract_time !== contractFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Pagination ──
  const totalPages = Math.ceil(totalCount / resultsPerPage);
  const pageNumbers: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  // ── Country labels ──
  const countries = [
    { code: 'in', label: '🇮🇳 India' },
    { code: 'gb', label: '🇬🇧 UK' },
    { code: 'us', label: '🇺🇸 USA' },
    { code: 'ca', label: '🇨🇦 Canada' },
    { code: 'au', label: '🇦🇺 Australia' },
    { code: 'de', label: '🇩🇪 Germany' },
    { code: 'sg', label: '🇸🇬 Singapore' },
  ];

  /* ==========================================
     RENDER
     ========================================== */
  return (
    <div style={styles.pageWrapper} ref={containerRef}>
      <div style={styles.meshGradientOrb1} />
      <div style={styles.meshGradientOrb2} />

      <div style={styles.container}>

        {/* ─── Hero Section ─── */}
        <div style={styles.hero}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={styles.heroIconBox}>
              <Briefcase size={26} />
            </div>
            <div>
              <h1 style={styles.heroTitle}>Job Recommendations</h1>
              <p style={styles.heroSubtitle}>
                Real-time opportunities matched to your skills via Adzuna
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {totalCount > 0 && (
              <div style={styles.statBadge}>
                <TrendingUp size={14} />
                {totalCount.toLocaleString()} jobs found
              </div>
            )}
            <div style={{ ...styles.statBadge, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6EE7B7' }}>
              <Zap size={14} />
              {userSkills.length} skills
            </div>
          </div>
        </div>

        {/* ─── Skills Bar ─── */}
        {userSkills.length > 0 && (
          <div style={styles.skillsBar}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: '#A5B4FC' }} />
              Your Skills:
            </span>
            {userSkills.map((skill, i) => (
              <span key={i} style={styles.skillChip}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ─── Controls Bar ─── */}
        <div style={styles.controlBar}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search titles, companies, locations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(71,85,105,0.4)'; }}
            />
          </div>

          {/* Country Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} style={{ color: '#64748B' }} />
            <select
              value={countryFilter}
              onChange={e => { setCountryFilter(e.target.value); setCurrentPage(1); }}
              style={styles.filterSelect}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contract Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: '#64748B' }} />
            <select
              value={contractFilter}
              onChange={e => setContractFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            style={styles.refreshBtn}
            onClick={() => fetchJobs(currentPage)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* ─── CONTENT ─── */}

        {/* Loading */}
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s infinite',
            }}>
              <Loader2 size={24} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', fontWeight: 500 }}>
              Searching jobs matching your skills…
            </p>
          </div>
        )}

        {/* No Skills Error */}
        {!loading && error === 'noSkills' && (
          <div style={styles.emptyState}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertCircle size={28} style={{ color: '#FBBF24' }} />
            </div>
            <h3 style={{ color: '#F1F5F9', fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              No Skills Found in Your Profile
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
              Add your technical skills in your profile so we can find the best job matches for you.
            </p>
            <button
              style={styles.applyBtn}
              onClick={onNavigateToProfile}
            >
              <Users size={16} />
              Go to Profile
            </button>
          </div>
        )}

        {/* API Error */}
        {!loading && error && error !== 'noSkills' && (
          <div style={styles.emptyState}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertCircle size={28} style={{ color: '#F87171' }} />
            </div>
            <h3 style={{ color: '#F1F5F9', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Could Not Load Jobs
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              {error}
            </p>
            <button style={styles.refreshBtn} onClick={() => fetchJobs(1)}>
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && displayJobs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Search size={28} style={{ color: '#A5B4FC' }} />
            </div>
            <h3 style={{ color: '#F1F5F9', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              No Jobs Found
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
              {searchQuery ? 'Try adjusting your search or filters.' : 'Try a different country or add more skills to your profile.'}
            </p>
          </div>
        )}

        {/* Job Cards Grid */}
        {!loading && !error && displayJobs.length > 0 && (
          <>
            <div style={styles.jobGrid}>
              {displayJobs.map((job) => {
                const isHovered = hoveredCard === job.id;
                const isSaved = savedIds.has(job.id);
                const salary = formatSalary(job.salary_min, job.salary_max);
                const keywords = extractKeywords(job.description);

                return (
                  <div
                    key={job.id}
                    style={{
                      ...styles.jobCard,
                      ...(isHovered ? styles.jobCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(job.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => setSelectedJob(job)}
                  >
                    {/* Shimmer effect on hover */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
                      }} />
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                      <div style={{ ...styles.companyAvatar, background: getAvatarGradient(job.company) }}>
                        {getCompanyInitials(job.company)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.jobTitle}>{job.title}</div>
                        <div style={styles.jobCompany}>
                          <Building2 size={13} />
                          {job.company}
                        </div>
                      </div>
                      <button
                        style={{
                          ...styles.bookmarkBtn,
                          ...(isSaved ? { background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.4)', color: '#A5B4FC' } : {}),
                        }}
                        onClick={(e) => handleToggleSave(job.id, e)}
                        title={isSaved ? 'Unsave' : 'Save'}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>

                    {/* Meta Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                      <div style={styles.jobMeta}>
                        <MapPin size={13} />
                        {job.location}
                      </div>
                      {job.contract_time && (
                        <div style={styles.jobMeta}>
                          <Clock size={13} />
                          {job.contract_time === 'full_time' ? 'Full Time' : job.contract_time === 'part_time' ? 'Part Time' : job.contract_time}
                        </div>
                      )}
                      <div style={styles.jobMeta}>
                        <Calendar size={13} />
                        {timeAgo(job.created)}
                      </div>
                    </div>

                    {/* Salary + Category */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      {salary && (
                        <span style={styles.salaryBadge}>
                          <DollarSign size={13} />
                          {salary}
                          {job.salary_is_predicted && <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>(est.)</span>}
                        </span>
                      )}
                      <span style={styles.contractBadge}>
                        <Layers size={13} />
                        {job.category}
                      </span>
                    </div>

                    {/* Description */}
                    <div style={styles.jobDescription}>
                      {job.description}
                    </div>

                    {/* Tags */}
                    {keywords.length > 0 && (
                      <div style={styles.tagContainer}>
                        {keywords.map((kw, i) => (
                          <span key={i} style={styles.tag}>{kw}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(71,85,105,0.2)' }}>
                      <button
                        style={styles.applyBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(job.redirect_url, '_blank', 'noopener');
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.25)'; }}
                      >
                        Apply Now
                        <ArrowUpRight size={14} />
                      </button>
                      <button
                        style={{ ...styles.refreshBtn, padding: '8px 14px', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.pageBtn, opacity: currentPage <= 1 ? 0.4 : 1 }}
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>

                {startPage > 1 && (
                  <>
                    <button style={styles.pageBtn} onClick={() => handlePageChange(1)}>1</button>
                    {startPage > 2 && <span style={{ color: '#64748B', fontSize: '0.85rem' }}>…</span>}
                  </>
                )}

                {pageNumbers.map(p => (
                  <button
                    key={p}
                    style={{ ...styles.pageBtn, ...(p === currentPage ? styles.pageBtnActive : {}) }}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <span style={{ color: '#64748B', fontSize: '0.85rem' }}>…</span>}
                    <button style={styles.pageBtn} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                  </>
                )}

                <button
                  style={{ ...styles.pageBtn, opacity: currentPage >= totalPages ? 0.4 : 1 }}
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>

                <span style={{ color: '#64748B', fontSize: '0.8rem', marginLeft: '8px' }}>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setSelectedJob(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelectedJob(null)}>
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ ...styles.companyAvatar, width: '56px', height: '56px', fontSize: '1.2rem', background: getAvatarGradient(selectedJob.company) }}>
                {getCompanyInitials(selectedJob.company)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                  {selectedJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.88rem' }}>
                  <Building2 size={14} />
                  {selectedJob.company}
                  <span style={{ color: '#475569' }}>•</span>
                  <MapPin size={14} />
                  {selectedJob.location}
                </div>
              </div>
            </div>

            {/* Badges Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {formatSalary(selectedJob.salary_min, selectedJob.salary_max) && (
                <span style={styles.salaryBadge}>
                  <DollarSign size={13} />
                  {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                  {selectedJob.salary_is_predicted && <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>(est.)</span>}
                </span>
              )}
              {selectedJob.contract_time && (
                <span style={styles.contractBadge}>
                  <Clock size={13} />
                  {selectedJob.contract_time === 'full_time' ? 'Full Time' : selectedJob.contract_time === 'part_time' ? 'Part Time' : selectedJob.contract_time}
                </span>
              )}
              <span style={styles.contractBadge}>
                <Layers size={13} />
                {selectedJob.category}
              </span>
              <span style={{ ...styles.contractBadge, background: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Calendar size={13} />
                Posted {timeAgo(selectedJob.created)}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} style={{ color: '#A5B4FC' }} />
                Job Description
              </h3>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.7, color: '#94A3B8' }}>
                {selectedJob.description}
              </p>
            </div>

            {/* Extracted Tech Tags */}
            {extractKeywords(selectedJob.description).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} style={{ color: '#A5B4FC' }} />
                  Technologies Mentioned
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {extractKeywords(selectedJob.description).map((kw, i) => {
                    const isMatch = userSkills.some(s => s.toLowerCase() === kw.toLowerCase());
                    return (
                      <span key={i} style={{
                        ...styles.tag,
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        ...(isMatch ? {
                          background: 'rgba(16,185,129,0.15)',
                          color: '#6EE7B7',
                          border: '1px solid rgba(16,185,129,0.3)',
                        } : {}),
                      }}>
                        {kw}
                        {isMatch && ' ✓'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{ ...styles.applyBtn, padding: '12px 28px', fontSize: '0.9rem' }}
                onClick={() => window.open(selectedJob.redirect_url, '_blank', 'noopener')}
              >
                Apply on Adzuna
                <ExternalLink size={16} />
              </button>
              <button
                style={{ ...styles.refreshBtn, padding: '12px 22px' }}
                onClick={() => {
                  onPrepareForInterview({
                    title: selectedJob.title,
                    company: selectedJob.company,
                  });
                  setSelectedJob(null);
                }}
              >
                <Sparkles size={14} />
                Prepare for Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Keyframe animations ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .job-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
