import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar, NavItemKey, ViewType } from './components/common/Sidebar.tsx';
import { TopHeader } from './components/common/TopHeader.tsx';
import { DashboardView } from './pages/dashboard/DashboardView.tsx';
import { ProfileView } from './pages/profile/ProfileView.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { MockInterviewModal } from './components/common/MockInterviewModal.tsx';
import { CodingInterviewModal } from './components/coding/CodingInterviewModal.tsx';
import { JobsExplorerModal } from './components/job/JobsExplorerModal.tsx';
import { ScorecardDetailsModal } from './components/interview/ScorecardDetailsModal.tsx';
import { PracticeRoadmapModal } from './components/interview/PracticeRoadmapModal.tsx';
import { OpenSourceModal } from './components/github/OpenSourceModal.tsx';
import { SettingsModal } from './components/common/SettingsModal.tsx';
import { SupportModal } from './components/common/SupportModal.tsx';
import { CreditWalletModal } from './components/payment/CreditWalletModal.tsx';
import { InterviewHistoryModal } from './components/interview/InterviewHistoryModal.tsx';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal.tsx';
import { JobMatchingView } from './pages/jobs/JobMatchingView.tsx';
import { JobRecommendationsView } from './pages/jobs/JobRecommendationsView.tsx';
import { AIInterviewView } from './pages/interview/AIInterviewView.tsx';
import { CodingPracticeView } from './pages/interview/CodingPracticeView.tsx';
import { InterviewReadinessView } from './pages/interview/InterviewReadinessView.tsx';
import { GitHubOpenSourceView } from './pages/github/GitHubOpenSourceView.tsx';
import { AnalyticsView } from './pages/analytics/AnalyticsView.tsx';
import { RecommendedJob, OpenSourceIssue } from './types.ts';
import { LandingPage } from './pages/landing/LandingPage.tsx';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  // Onboarding wizard opens automatically if authenticated candidate has incomplete profile
  const showOnboarding = Boolean(
    isAuthenticated &&
    user &&
    user.profile?.onboardingStatus?.isCompleted === false
  );
  // Default first view is dashboard
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Global Modals State
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isOpenSourceModalOpen, setIsOpenSourceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fallback lists for standalone modal opens
  const [modalJobs, setModalJobs] = useState<RecommendedJob[]>([
    {
      id: 'job-fe',
      title: 'Frontend Developer',
      company: 'Razorpay',
      location: 'Bengaluru, India (Hybrid)',
      type: 'Hybrid',
      salary: '₹18 - ₹24 LPA',
      matchScore: 91,
      matchedSkills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
      missingSkills: ['Next.js'],
      experienceRequired: '0 - 2 Years',
      description: 'Build fast, accessible, responsive frontend checkout flows and design systems.',
      postedDaysAgo: 1,
      url: 'https://razorpay.com/careers'
    },
    {
      id: 'job-fs',
      title: 'Full Stack Developer',
      company: 'Atlassian',
      location: 'Remote / Bengaluru',
      type: 'Remote',
      salary: '₹24 - ₹32 LPA',
      matchScore: 84,
      matchedSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
      missingSkills: ['Docker'],
      experienceRequired: '1 - 3 Years',
      description: 'Design and ship end-to-end cloud collaboration platforms.',
      postedDaysAgo: 2,
      url: 'https://atlassian.com/company/careers'
    },
    {
      id: 'job-se',
      title: 'Software Engineer',
      company: 'Stripe',
      location: 'Bengaluru, India',
      type: 'On-site',
      salary: '₹22 - ₹30 LPA',
      matchScore: 78,
      matchedSkills: ['JavaScript', 'Node.js', 'System Design'],
      missingSkills: ['Go'],
      experienceRequired: 'Fresher / Entry',
      description: 'Engineer high-reliability financial APIs and developer primitives.',
      postedDaysAgo: 3,
      url: 'https://stripe.com/jobs'
    }
  ]);

  const [modalIssues] = useState<OpenSourceIssue[]>([
    {
      id: 'issue-react',
      repo: 'facebook/react',
      issueNumber: 29140,
      title: 'React',
      labels: ['Good First Issue', '94% match'],
      difficulty: 'Good First Issue',
      stars: 228000,
      language: 'JavaScript',
      url: 'https://github.com/facebook/react/issues'
    },
    {
      id: 'issue-node',
      repo: 'nodejs/node',
      issueNumber: 52410,
      title: 'Node.js',
      labels: ['Bug Fix', '88% match'],
      difficulty: 'Intermediate',
      stars: 108000,
      language: 'JavaScript / C++',
      url: 'https://github.com/nodejs/node/issues'
    },
    {
      id: 'issue-tf',
      repo: 'tensorflow/tensorflow',
      issueNumber: 68120,
      title: 'TensorFlow',
      labels: ['Documentation', '82% match'],
      difficulty: 'Good First Issue',
      stars: 184000,
      language: 'Python / C++',
      url: 'https://github.com/tensorflow/tensorflow/issues'
    }
  ]);

  const handleApplyModalJob = (jobId: string) => {
    setModalJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applied: !j.applied } : j))
    );
  };

  const handleOpenModal = (
    modal: 'coding' | 'jobs' | 'github' | 'history' | 'settings' | 'support'
  ) => {
    if (modal === 'coding') setIsCodingModalOpen(true);
    else if (modal === 'jobs') setIsJobsModalOpen(true);
    else if (modal === 'github') setIsOpenSourceModalOpen(true);
    else if (modal === 'history') setIsScorecardModalOpen(true);
    else if (modal === 'settings') setIsSettingsModalOpen(true);
    else if (modal === 'support') setIsSupportModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthInitialMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthInitialMode('register');
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (view: ViewType, navKey: NavItemKey = 'dashboard') => {
    if (view === 'profile' && !isAuthenticated) {
      handleOpenLogin();
      return;
    }
    setCurrentView(view);
    setActiveNav(navKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated, render the public SkillNexus Landing Page
  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 bg-white">
        <LandingPage
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          isAuthenticated={false}
          onNavigateToDashboard={() => {
            handleNavigate('dashboard', 'dashboard');
          }}
        />

        {/* Auth Modal for Login & Register */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setCurrentView('dashboard');
            setActiveNav('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Dark Navy Sidebar on Left */}
      <Sidebar
        currentView={currentView}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenModal={handleOpenModal}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area on Right */}
      <div 
        className="d-flex flex-column flex-grow-1 min-vw-0 transition-all"
        style={{
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        <div className="d-none d-lg-block" style={{ width: '240px', flexShrink: 0 }} />
        
        <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: 0 }}>
          <div className="sidebar-offset-container" style={{ paddingLeft: '0px' }}>
            <div className="content-wrap d-flex flex-column min-vh-100">
              {/* Fixed/Sticky Top Header */}
              <TopHeader
                onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                onNavigateToProfile={() => handleNavigate('profile', 'profile')}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenMockTest={() => setIsMockModalOpen(true)}
                onOpenLogin={handleOpenLogin}
                onOpenRegister={handleOpenRegister}
                onOpenCreditModal={() => setIsCreditModalOpen(true)}
              />

              {/* Dynamic Screen View */}
              <main className="flex-grow-1">
                {currentView === 'analytics' ? (
                  <AnalyticsView
                    onNavigateToCoding={() => handleNavigate('coding-interview', 'coding-interview')}
                    onNavigateToInterviewReadiness={() => handleNavigate('interview-readiness', 'interview-readiness')}
                  />
                ) : currentView === 'github' ? (
                  <GitHubOpenSourceView
                    onNavigateToCoding={() => handleNavigate('coding-interview', 'coding-interview')}
                    onExploreIssues={() => handleNavigate('coding-interview', 'coding-interview')}
                  />
                ) : currentView === 'interview-readiness' ? (
                  <InterviewReadinessView
                    onNavigateToCoding={() => handleNavigate('coding-interview', 'coding-interview')}
                    onNavigateToAIInterview={() => handleNavigate('ai-interview', 'ai-interview')}
                  />
                ) : currentView === 'coding-interview' ? (
                  <CodingPracticeView
                    onOpenUpgradeModal={() => setIsSettingsModalOpen(true)}
                    onNavigateToDashboard={() => handleNavigate('dashboard', 'dashboard')}
                  />
                ) : currentView === 'ai-interview' ? (
                  <AIInterviewView
                    onOpenUpgradeModal={() => setIsSettingsModalOpen(true)}
                    onNavigateToProfile={() => handleNavigate('profile', 'profile')}
                    onOpenCreditModal={() => setIsCreditModalOpen(true)}
                    onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
                    onNavigateToDashboard={() => handleNavigate('dashboard', 'dashboard')}
                  />
                ) : currentView === 'dashboard' ? (
                  <DashboardView
                    onOpenMockTest={() => setIsMockModalOpen(true)}
                    onNavigateToProfile={() => handleNavigate('profile', 'profile')}
                    onOpenCreditModal={() => setIsCreditModalOpen(true)}
                    onNavigateToInterview={() => handleNavigate('ai-interview', 'ai-interview')}
                    onNavigateToCoding={() => handleNavigate('coding-interview', 'coding-interview')}
                  />
                ) : currentView === 'job-matching' ? (
                  <JobMatchingView
                    onOpenRoadmap={() => setIsPracticeModalOpen(true)}
                    onOpenSupport={() => setIsSupportModalOpen(true)}
                    onNavigateToJobs={() => handleNavigate('job-recommendations', 'job-recommendations')}
                    onNavigateToInterview={() => handleNavigate('ai-interview', 'ai-interview')}
                    onNavigateToCoding={() => handleNavigate('coding-interview', 'coding-interview')}
                    onNavigateToVoice={() => setIsMockModalOpen(true)}
                    onOpenMockTest={() => setIsMockModalOpen(true)}
                  />
                ) : currentView === 'job-recommendations' ? (
                  <JobRecommendationsView
                    onPrepareForInterview={() => {
                      setIsMockModalOpen(true);
                    }}
                    onNavigateToProfile={() => handleNavigate('profile', 'profile')}
                  />
                ) : (
                  <ProfileView />
                )}
              </main>

              {/* Footer */}
              <footer className="bg-white border-top py-3 px-4 text-secondary small mt-auto">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <strong className="text-dark">SkillNexus</strong> &bull; Build Skills. Ace Interviews. Grow Your Career.
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-muted border">MERN Stack</span>
                    <span className="badge bg-light text-muted border">MongoDB Atlas</span>
                    <span className="badge bg-light text-muted border">Judge0 CE</span>
                    <span className="badge bg-light text-muted border">Gemini AI</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal for Login & Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      {/* Candidate Profile Onboarding Wizard */}
      <OnboardingWizardModal
        isOpen={showOnboarding}
        onComplete={() => {
          handleNavigate('dashboard', 'dashboard');
        }}
      />

      {/* Global Modals */}
      <MockInterviewModal
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
        onAssessmentRecorded={() => {}}
        onOpenCoding={() => setIsCodingModalOpen(true)}
        onOpenVoice={() => setIsMockModalOpen(true)}
      />


      <CodingInterviewModal
        isOpen={isCodingModalOpen}
        onClose={() => setIsCodingModalOpen(false)}
      />

      <JobsExplorerModal
        isOpen={isJobsModalOpen}
        onClose={() => setIsJobsModalOpen(false)}
        jobs={modalJobs}
        onApplyJob={handleApplyModalJob}
      />

      <ScorecardDetailsModal
        isOpen={isScorecardModalOpen}
        onClose={() => setIsScorecardModalOpen(false)}
        interview={null}
      />

      <PracticeRoadmapModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        onStartCoding={() => {
          setIsPracticeModalOpen(false);
          setIsCodingModalOpen(true);
        }}
      />

      <OpenSourceModal
        isOpen={isOpenSourceModalOpen}
        onClose={() => setIsOpenSourceModalOpen(false)}
        issues={modalIssues}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Credit Wallet & Payment Modal */}
      <CreditWalletModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />

      {/* Past Technical Interviews & Report Inspector Modal */}
      <InterviewHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
