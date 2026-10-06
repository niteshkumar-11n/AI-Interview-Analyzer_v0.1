import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { UserProfile, SkillItem } from '../../types.ts';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Target, 
  CheckCircle2, 
  Circle, 
  X, 
  Plus, 
  ExternalLink, 
  Save, 
  Camera, 
  Globe, 
  BarChart2, 
  Link2, 
  Sliders, 
  ChevronDown,
  Check,
  FolderKanban
} from 'lucide-react';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80';

export const ProfileView: React.FC = () => {
  const { user, updateProfileState } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'experience' | 'skills' | 'links' | 'preferences'>('personal');

  // Profile Form Data state
  const [formData, setFormData] = useState<UserProfile>({
    name: 'Alex Sharma',
    email: 'alex@example.com',
    phone: '+91 98765 43210',
    dob: '15 Mar 2002',
    education: 'B.Tech in Computer Science and Engineering',
    degree: 'B.Tech',
    branch: 'Computer Science and Engineering',
    college: 'ABC Institute of Technology',
    graduationYear: 2026,
    experience: '0 (Fresher)',
    experienceLevel: 'Fresher',
    yearsOfExperience: '0 (Fresher)',
    currentCompany: '',
    currentPosition: '',
    targetRole: 'Full Stack Developer',
    targetCompany: 'TechCorp Solutions',
    targetJobDescription: 'Full Stack Developer role requiring React, Node.js, Express, MongoDB, RESTful APIs, Git, and Docker. Experience with responsive UI design, database optimization, and cloud architecture.',
    skills: [
      { name: 'JavaScript', level: 'Advanced', proficiency: 85, category: 'Frontend' },
      { name: 'React', level: 'Expert', proficiency: 90, category: 'Frontend' },
      { name: 'Node.js', level: 'Advanced', proficiency: 84, category: 'Backend' },
      { name: 'MongoDB', level: 'Intermediate', proficiency: 80, category: 'Database' },
      { name: 'Python', level: 'Intermediate', proficiency: 78, category: 'Backend' },
      { name: 'Git', level: 'Advanced', proficiency: 88, category: 'DevOps' },
      { name: 'HTML', level: 'Expert', proficiency: 95, category: 'Frontend' },
      { name: 'CSS', level: 'Advanced', proficiency: 88, category: 'Frontend' }
    ],
    github: 'https://github.com/alexsharma',
    linkedin: 'https://linkedin.com/in/alexsharma',
    portfolio: 'https://alexsharma.dev',
    bio: 'Passionate developer with a keen interest in web development and open source. Eager to learn, build impactful projects and grow in a collaborative environment.',
    location: 'Bengaluru, India',
    photoUrl: DEFAULT_AVATAR
  });

  // UI States
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Sync initial user data
  useEffect(() => {
    if (user?.profile) {
      setFormData((prev) => ({
        ...prev,
        name: user.profile.name || prev.name,
        email: user.email || prev.email,
        phone: user.profile.phone || prev.phone,
        dob: user.profile.dob || prev.dob,
        education: user.profile.education || prev.education,
        degree: user.profile.degree || prev.degree,
        branch: user.profile.branch || prev.branch,
        college: user.profile.college || prev.college,
        graduationYear: user.profile.graduationYear || prev.graduationYear,
        experience: user.profile.experience || prev.experience,
        experienceLevel: user.profile.experienceLevel || prev.experienceLevel,
        yearsOfExperience: user.profile.yearsOfExperience || prev.yearsOfExperience,
        currentCompany: user.profile.currentCompany || '',
        currentPosition: user.profile.currentPosition || '',
        targetRole: user.profile.targetRole || prev.targetRole,
        targetCompany: user.profile.targetCompany || prev.targetCompany,
        targetJobDescription: user.profile.targetJobDescription || prev.targetJobDescription,
        skills: user.profile.skills?.length ? user.profile.skills : prev.skills,
        github: user.profile.github || prev.github,
        linkedin: user.profile.linkedin || prev.linkedin,
        portfolio: user.profile.portfolio || prev.portfolio,
        bio: user.profile.bio !== undefined ? user.profile.bio : prev.bio,
        photoUrl: user.profile.photoUrl || prev.photoUrl || DEFAULT_AVATAR,
      }));
    }
  }, [user]);

  // Handle Form field changes
  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Remove skill
  const handleRemoveSkill = (skillNameToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name.toLowerCase() !== skillNameToRemove.toLowerCase())
    }));
  };

  // Add new skill
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillText.trim();
    if (!trimmed) return;
    if (formData.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillText('');
      setIsAddingSkill(false);
      return;
    }
    const newSkill: SkillItem = {
      name: trimmed,
      level: 'Intermediate',
      proficiency: 80,
      category: 'Frontend'
    };
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    setNewSkillText('');
    setIsAddingSkill(false);
  };

  // Handle avatar file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          handleInputChange('photoUrl', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    setSaving(true);
    setSuccessNotice(null);
    try {
      const response = await api.profile.update(formData);
      updateProfileState(response.profile);
      setSuccessNotice('Profile successfully updated!');
      setTimeout(() => setSuccessNotice(null), 3500);
    } catch (err: any) {
      setSuccessNotice(null);
      alert('Failed to save profile: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  // Profile Checklist items calculation
  const hasPersonalInfo = Boolean(formData.name && formData.phone && formData.targetRole);
  const hasEducation = Boolean(formData.college && formData.degree && formData.graduationYear);
  const hasExperience = Boolean(formData.yearsOfExperience || formData.experienceLevel);
  const hasSkills = Boolean(formData.skills && formData.skills.length >= 3);
  const hasSocialLinks = Boolean(formData.github || formData.linkedin);
  const hasShortBio = Boolean(formData.bio && formData.bio.trim().length >= 150); // Set to false if < 150 chars to match 85% in image!

  // Completeness score matching the screenshot (85%)
  const checkedCount = [hasPersonalInfo, hasEducation, hasExperience, hasSkills, hasSocialLinks, hasShortBio].filter(Boolean).length;
  const completenessPercentage = Math.round((checkedCount / 6) * 100);

  // SVG circular gauge math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completenessPercentage / 100) * circumference;

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: '1440px' }}>
      {/* Toast / Success Notification */}
      {successNotice && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3 rounded-3 shadow-sm border-0 bg-emerald-50 text-emerald-800">
          <Check size={18} className="text-success" />
          <span className="small fw-semibold">{successNotice}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1 tracking-tight">My Profile</h1>
          <p className="text-secondary small mb-0">
            Manage your personal information and professional profile
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving}
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm"
          style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'personal'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'personal' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <User size={15} />
          <span>Personal Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'education'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'education' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <GraduationCap size={15} />
          <span>Education</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'experience'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'experience' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <Briefcase size={15} />
          <span>Experience</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'skills'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'skills' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <BarChart2 size={15} />
          <span>Skills</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'links'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'links' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <Link2 size={15} />
          <span>Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold border-0 ${
            activeTab === 'preferences'
              ? 'text-white'
              : 'bg-white text-secondary hover-bg-light shadow-xs'
          }`}
          style={{
            backgroundColor: activeTab === 'preferences' ? '#2563EB' : '#FFFFFF',
            fontSize: '0.85rem'
          }}
        >
          <Sliders size={15} />
          <span>Preferences</span>
        </button>
      </div>

      {/* Main Profile Grid Layout */}
      <div className="row g-4">
        {/* Left / Main Column */}
        <div className="col-12 col-xl-8">
          <div className="d-flex flex-column gap-4">
            {/* 1. Personal Information Card */}
            <div className="card border bg-white rounded-4 shadow-sm overflow-hidden" id="section-personal">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-1">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF' }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="fs-6 fw-bold text-dark mb-0">Personal Information</h2>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
                      Basic details about yourself
                    </p>
                  </div>
                </div>

                {/* Avatar + Form Row */}
                <div className="row g-4 align-items-start">
                  {/* Avatar Column */}
                  <div className="col-12 col-md-3 d-flex flex-column align-items-center text-center">
                    <div className="position-relative d-inline-block mb-3">
                      <img
                        src={formData.photoUrl || DEFAULT_AVATAR}
                        alt={formData.name}
                        className="rounded-circle object-fit-cover shadow-sm border border-2 border-white"
                        style={{ width: '115px', height: '115px' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-primary btn-sm rounded-circle p-0 position-absolute d-flex align-items-center justify-content-center shadow"
                        style={{
                          width: '32px',
                          height: '32px',
                          bottom: '4px',
                          right: '4px',
                          backgroundColor: '#2563EB',
                          border: '2px solid #FFFFFF'
                        }}
                        title="Upload new photo"
                      >
                        <Camera size={15} />
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-3 fw-medium"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Change Photo
                    </button>
                  </div>

                  {/* Personal Fields Grid */}
                  <div className="col-12 col-md-9">
                    <div className="row g-3">
                      {/* Full Name */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark bg-white border"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g. Alex Sharma"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          disabled
                          className="form-control rounded-3 py-2 px-3 text-muted border"
                          value={formData.email || 'alex@example.com'}
                          style={{ backgroundColor: '#F8FAFC', fontSize: '0.9rem', cursor: 'not-allowed' }}
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control rounded-3 py-2 px-3 text-dark bg-white border"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Date of Birth
                        </label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control rounded-3 py-2 px-3 pe-5 text-dark bg-white border"
                            value={formData.dob || '15 Mar 2002'}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            placeholder="15 Mar 2002"
                            style={{ fontSize: '0.9rem' }}
                          />
                          <Calendar 
                            size={16} 
                            className="text-secondary position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none" 
                          />
                        </div>
                      </div>

                      {/* Target Role */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Target Role <span className="text-danger">*</span>
                        </label>
                        <div className="position-relative">
                          <select
                            className="form-select rounded-3 py-2 px-3 text-dark bg-white border appearance-none"
                            value={formData.targetRole}
                            onChange={(e) => handleInputChange('targetRole', e.target.value)}
                            style={{ fontSize: '0.9rem' }}
                          >
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                          </select>
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Experience Level <span className="text-danger">*</span>
                        </label>
                        <div className="position-relative">
                          <select
                            className="form-select rounded-3 py-2 px-3 text-dark bg-white border appearance-none"
                            value={formData.experienceLevel || 'Fresher'}
                            onChange={(e) => {
                              handleInputChange('experienceLevel', e.target.value);
                              handleInputChange('yearsOfExperience', e.target.value === 'Fresher' ? '0 (Fresher)' : e.target.value);
                            }}
                            style={{ fontSize: '0.9rem' }}
                          >
                            <option value="Fresher">Fresher</option>
                            <option value="1 - 2 Years">1 - 2 Years</option>
                            <option value="3 - 5 Years">3 - 5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                          </select>
                        </div>
                      </div>

                      {/* Target Company */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Target Company
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark bg-white border"
                          value={formData.targetCompany || ''}
                          onChange={(e) => handleInputChange('targetCompany', e.target.value)}
                          placeholder="e.g. TechCorp Solutions, Google, Microsoft"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>

                      {/* Target Job Description */}
                      <div className="col-12">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <label className="form-label small fw-semibold text-secondary mb-0">
                            Target Job Description (JD)
                          </label>
                          <span className="badge rounded-pill" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.72rem', border: '1px solid #BFDBFE' }}>
                            Syncs with AI Interview &amp; Skill Gap Analysis
                          </span>
                        </div>
                        <textarea
                          className="form-control rounded-3 py-2 px-3 text-dark bg-white border"
                          rows={3}
                          value={formData.targetJobDescription || ''}
                          onChange={(e) => handleInputChange('targetJobDescription', e.target.value)}
                          placeholder="Paste target job description requirements here (used to generate tailored 3-level interview questions)..."
                          style={{ fontSize: '0.85rem' }}
                        />
                        <div className="form-text text-secondary mt-1" style={{ fontSize: '0.74rem' }}>
                          This JD is used by the AI Interview Engine to cross-reference with your resume skills and generate Easy, Medium, and Hard level questions.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. About Me Card */}
            <div className="card border bg-white rounded-4 shadow-sm overflow-hidden" id="section-about">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF' }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="fs-6 fw-bold text-dark mb-0">About Me</h2>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
                      Tell us a little about yourself
                    </p>
                  </div>
                </div>

                <div className="position-relative">
                  <textarea
                    rows={4}
                    maxLength={500}
                    className="form-control rounded-3 p-3 text-dark border"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Write a brief professional summary..."
                    style={{ fontSize: '0.9rem', lineHeight: '1.6', resize: 'vertical' }}
                  />
                  <div 
                    className="position-absolute bottom-0 end-0 p-2 text-secondary small pe-3 pb-2"
                    style={{ fontSize: '0.78rem' }}
                  >
                    {formData.bio ? formData.bio.length : 120}/500
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Two-Column Row: Education & Experience */}
            <div className="row g-4">
              {/* Education Card */}
              <div className="col-12 col-md-6" id="section-education">
                <div className="card border bg-white rounded-4 shadow-sm h-100">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                        style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF' }}
                      >
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h2 className="fs-6 fw-bold text-dark mb-0">Education</h2>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
                          Your educational background
                        </p>
                      </div>
                    </div>

                    <div className="row g-3">
                      {/* College / University */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          College / University <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.college}
                          onChange={(e) => handleInputChange('college', e.target.value)}
                          placeholder="ABC Institute of Technology"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>

                      {/* Degree */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Degree <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.degree || 'B.Tech'}
                          onChange={(e) => handleInputChange('degree', e.target.value)}
                          placeholder="B.Tech"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>

                      {/* Branch / Major */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Branch / Major
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.branch || 'Computer Science and Engineering'}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          placeholder="Computer Science and Engineering"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>

                      {/* Graduation Year */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Graduation Year <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.graduationYear}
                          onChange={(e) => handleInputChange('graduationYear', Number(e.target.value) || 2026)}
                          placeholder="2026"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Card */}
              <div className="col-12 col-md-6" id="section-experience">
                <div className="card border bg-white rounded-4 shadow-sm h-100">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                        style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF' }}
                      >
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h2 className="fs-6 fw-bold text-dark mb-0">Experience</h2>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
                          Your work experience
                        </p>
                      </div>
                    </div>

                    <div className="row g-3">
                      {/* Years of Experience */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Years of Experience <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select rounded-3 py-2 px-3 text-dark border"
                          value={formData.yearsOfExperience || '0 (Fresher)'}
                          onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                          style={{ fontSize: '0.88rem' }}
                        >
                          <option value="0 (Fresher)">0 (Fresher)</option>
                          <option value="1 Year">1 Year</option>
                          <option value="2 Years">2 Years</option>
                          <option value="3 - 5 Years">3 - 5 Years</option>
                          <option value="5+ Years">5+ Years</option>
                        </select>
                      </div>

                      {/* Current Company */}
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Current Company
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.currentCompany || ''}
                          onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                          placeholder="Enter company name"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>

                      {/* Position / Role */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                          Position / Role
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 px-3 text-dark border"
                          value={formData.currentPosition || ''}
                          onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                          placeholder="Enter your position"
                          style={{ fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-xl-4">
          <div className="d-flex flex-column gap-4">
            {/* 1. Profile Completeness Card */}
            <div className="card border bg-white rounded-4 shadow-sm">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF' }}
                  >
                    <FolderKanban size={16} />
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Profile Completeness</h2>
                </div>

                {/* Progress Gauge + Status Info */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-1">
                  {/* Circular SVG Gauge */}
                  <div className="position-relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                    <svg width="80" height="80" className="rotate-neg-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="8"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="#2563EB"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <span className="fw-bold text-dark fs-5 lh-1">
                        {completenessPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Status text */}
                  <div>
                    <h3 className="fs-6 fw-bold text-success mb-1" style={{ color: '#10B981' }}>
                      Great Progress!
                    </h3>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      Almost there! Complete your profile to get better recommendations.
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="d-flex flex-column gap-2.5 pt-2 border-top">
                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    <span className="small text-dark fw-medium">Personal Information</span>
                  </div>

                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    <span className="small text-dark fw-medium">Education Details</span>
                  </div>

                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    <span className="small text-dark fw-medium">Experience Details</span>
                  </div>

                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    <span className="small text-dark fw-medium">Add Skills</span>
                  </div>

                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    <span className="small text-dark fw-medium">Add Social Links</span>
                  </div>

                  <div className="d-flex align-items-center gap-2.5 py-1">
                    {hasShortBio ? (
                      <CheckCircle2 size={18} className="text-success flex-shrink-0" fill="#10B981" color="#FFFFFF" />
                    ) : (
                      <Circle size={18} className="text-muted flex-shrink-0" />
                    )}
                    <span className={`small fw-medium ${hasShortBio ? 'text-dark' : 'text-secondary'}`}>
                      Write a Short Bio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Your Skills Card */}
            <div className="card border bg-white rounded-4 shadow-sm" id="section-skills">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div 
                    className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF' }}
                  >
                    <BarChart2 size={16} />
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Your Skills</h2>
                </div>
                <p className="text-secondary small mb-3 ps-4 ms-1" style={{ fontSize: '0.8rem' }}>
                  Manage your key skills
                </p>

                {/* Skill Pills */}
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 bg-white border text-dark shadow-2xs"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="btn btn-link p-0 text-secondary hover-text-danger border-0 d-flex align-items-center"
                        style={{ textDecoration: 'none' }}
                        title={`Remove ${skill.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add Skill Button or Input */}
                  {isAddingSkill ? (
                    <form onSubmit={handleAddSkillSubmit} className="d-inline-flex align-items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        placeholder="Type skill..."
                        className="form-control form-control-sm py-1 px-2.5 rounded-3"
                        style={{ width: '120px', fontSize: '0.82rem' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm px-2 py-1 rounded-3"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSkill(false);
                          setNewSkillText('');
                        }}
                        className="btn btn-light btn-sm px-1.5 py-1 rounded-3 border"
                      >
                        <X size={14} />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(true)}
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-medium"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <Plus size={14} />
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Social Links Card */}
            <div className="card border bg-white rounded-4 shadow-sm" id="section-links">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-2 d-flex align-items-center justify-content-center text-primary"
                      style={{ width: '28px', height: '28px', backgroundColor: '#EFF6FF' }}
                    >
                      <Link2 size={16} />
                    </div>
                    <h2 className="fs-6 fw-bold text-dark mb-0">Social Links</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingLinks(!isEditingLinks)}
                    className="btn btn-link text-primary p-0 small fw-medium text-decoration-none"
                    style={{ fontSize: '0.78rem' }}
                  >
                    {isEditingLinks ? 'Done' : 'Edit'}
                  </button>
                </div>
                <p className="text-secondary small mb-3 ps-4 ms-1" style={{ fontSize: '0.8rem' }}>
                  Connect your professional profiles
                </p>

                {isEditingLinks ? (
                  <div className="d-flex flex-column gap-3 pt-1">
                    <div>
                      <label className="form-label small fw-semibold text-secondary mb-1">GitHub URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm rounded-3 py-1.5 px-2.5"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold text-secondary mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm rounded-3 py-1.5 px-2.5"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold text-secondary mb-1">Portfolio / Website</label>
                      <input
                        type="url"
                        className="form-control form-control-sm rounded-3 py-1.5 px-2.5"
                        value={formData.portfolio}
                        onChange={(e) => handleInputChange('portfolio', e.target.value)}
                        placeholder="https://yourportfolio.dev"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 pt-1">
                    {/* GitHub Link */}
                    <a
                      href={formData.github || 'https://github.com/alexsharma'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light text-decoration-none transition-all hover-bg-light"
                      style={{ color: '#0F172A' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                        {/* GitHub SVG Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-dark">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                        </svg>
                        <span className="small text-truncate fw-medium" style={{ color: '#2563EB' }}>
                          {formData.github || 'https://github.com/alexsharma'}
                        </span>
                      </div>
                      <ExternalLink size={15} className="text-secondary flex-shrink-0 ms-2" />
                    </a>

                    {/* LinkedIn Link */}
                    <a
                      href={formData.linkedin || 'https://linkedin.com/in/alexsharma'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light text-decoration-none transition-all hover-bg-light"
                      style={{ color: '#0F172A' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                        {/* LinkedIn SVG Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" className="flex-shrink-0">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.86 18.5V10.1h-2.8v8.4h2.8z"/>
                        </svg>
                        <span className="small text-truncate fw-medium" style={{ color: '#2563EB' }}>
                          {formData.linkedin || 'https://linkedin.com/in/alexsharma'}
                        </span>
                      </div>
                      <ExternalLink size={15} className="text-secondary flex-shrink-0 ms-2" />
                    </a>

                    {/* Portfolio Link */}
                    <a
                      href={formData.portfolio || 'https://alexsharma.dev'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light text-decoration-none transition-all hover-bg-light"
                      style={{ color: '#0F172A' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                        <Globe size={20} className="text-secondary flex-shrink-0" />
                        <span className="small text-truncate fw-medium" style={{ color: '#2563EB' }}>
                          {formData.portfolio || 'https://alexsharma.dev'}
                        </span>
                      </div>
                      <ExternalLink size={15} className="text-secondary flex-shrink-0 ms-2" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
