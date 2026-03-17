/**
 * MADE FOR YOU PAGE - Magic Episode with Personalization
 * 
 * Shows the "Made for You" tab with video preview, personalize panel,
 * Magic Clips section, and Co-Creator sidebar.
 * Based on Figma design: Made for You (node 468:155888)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Icons } from '@riversidefm/riverstyle'
import { PlatformSidebar } from '../components/my-components'

// Image assets - using existing files in public/icons
const imgVideoThumbnail = '/icons/070ad37fc6699b05b40d520cdb49690be17b4eb9.png'
const imgThemePreview = '/icons/8ecdd420a8ac4c22da13094aa9239e756b5a33e0.png'
const imgClipThumbnail = '/icons/517f7b3fbbfa69b577459f3e2b8468b25638c6cc.png'
const imgCoCreatorGlow = '/icons/1945633ae6ce19e6cab2e4ec9fb1fe4069d4764c.png'
const imgStars = '/icons/c5cf42f41fb296bf18c923965e8d56a6646d8069.svg'

// Tab definitions
const tabs = [
  { id: 'recordings', label: 'Recordings' },
  { id: 'made-for-you', label: 'Made for You' },
  { id: 'edits', label: 'Edits' },
  { id: 'exports', label: 'Exports' },
]

// Personalization toggles
interface PersonalizeSetting {
  id: string
  label: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  enabled: boolean
  hasImage?: boolean
  image?: string
}

const defaultPersonalizeSettings: PersonalizeSetting[] = [
  { id: 'brand', label: 'Brand', icon: Icons.Weather.Stars01, enabled: true },
  { id: 'theme', label: 'Theme', icon: Icons.Editor.Palette, enabled: true, hasImage: true, image: imgThemePreview },
  { id: 'smart-layouts', label: 'Smart Layouts', icon: Icons.Magic.SmartLayouts, enabled: true },
  { id: 'smart-mute', label: 'Smart Mute', icon: Icons.Magic.SmartMute, enabled: true },
  { id: 'magic-audio', label: 'Magic Audio', icon: Icons.Magic.MagicAudio, enabled: false },
]

// Magic Clips data
const magicClips = [
  { id: '1', title: 'VIP in Junior Motorsports: Wine, Cheese, and Racing', score: 95, duration: '01:00', editedAt: '28 mins ago' },
  { id: '2', title: 'The Art of Building Community Through Conversation', score: 95, duration: '01:15', editedAt: '1 hour ago' },
  { id: '3', title: 'Behind the Scenes of Podcast Production', score: 95, duration: '00:45', editedAt: '2 hours ago' },
  { id: '4', title: 'Creating Authentic Connections in Digital Spaces', score: 95, duration: '01:30', editedAt: '3 hours ago' },
]

// Co-Creator suggestions
const suggestions = [
  { id: '1', icon: 'pace', title: 'Remove unnecessary parts', description: 'Find fluff, cut out pauses and filler words' },
  { id: '2', icon: 'audio', title: 'Improve sound', description: 'Apply studio-quality sound' },
  { id: '3', icon: 'visual', title: 'Enhance visuals', description: 'Apply smart layouts and add captions' },
]

// Custom Toggle Switch component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      className={`toggle-switch ${checked ? 'on' : 'off'}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <div className="toggle-thumb" />
    </button>
  )
}

// Personalize Setting Row
function PersonalizeRow({ setting, onToggle }: { setting: PersonalizeSetting; onToggle: (id: string, enabled: boolean) => void }) {
  const Icon = setting.icon
  return (
    <div className="personalize-row">
      <div className="personalize-row-left">
        <Icon style={{ width: 20, height: 20, color: 'var(--color-secondary-c100)' }} />
        <span className="personalize-label">{setting.label}</span>
      </div>
      {setting.hasImage && setting.image ? (
        <div className="theme-preview">
          <img src={setting.image} alt="" />
        </div>
      ) : (
        <ToggleSwitch checked={setting.enabled} onChange={(val) => onToggle(setting.id, val)} />
      )}
    </div>
  )
}

// Video Preview with Controls
function VideoPreview() {
  return (
    <div style={{ width: '300px', height: '169px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0, minWidth: '300px', maxWidth: '300px' }}>
      <img src={imgVideoThumbnail} alt="" style={{ width: '300px', height: '169px', objectFit: 'cover' }} />
      <div className="video-controls">
        <div className="video-duration">25:00</div>
      </div>
    </div>
  )
}

// Personalize Sidebar Panel (next to video)
function PersonalizePanel({ settings, onToggle }: { settings: PersonalizeSetting[]; onToggle: (id: string, enabled: boolean) => void }) {
  return (
    <div className="personalize-panel">
      <div className="personalize-header">
        <Typography variant="headingXSmall">Personalize</Typography>
        <Icons.General.HelpCircle style={{ width: 16, height: 16, color: 'var(--color-secondary-c300)' }} />
      </div>
      <div className="personalize-list">
        {settings.map((setting) => (
          <PersonalizeRow key={setting.id} setting={setting} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

// Magic Clip Card
function MagicClipCard({ clip }: { clip: typeof magicClips[0] }) {
  return (
    <div className="magic-clip-card">
      <div className="clip-thumbnail">
        <img src={imgClipThumbnail} alt="" />
        <div className="clip-score">{clip.score}</div>
        <div className="clip-duration">{clip.duration}</div>
      </div>
      <div className="clip-actions">
        <button className="clip-action-btn">
          <Icons.Editor.Scissors01 style={{ width: 20, height: 20 }} />
          <span>Edit</span>
        </button>
        <button className="clip-action-btn">
          <Icons.General.Share07 style={{ width: 20, height: 20 }} />
          <span>Share</span>
        </button>
      </div>
      <div className="clip-info">
        <p className="clip-title">{clip.title}</p>
        <div className="clip-meta">
          <span>Edited {clip.editedAt}</span>
          <button className="clip-more-btn">
            <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Suggestion Row in Co-Creator
function SuggestionRow({ suggestion }: { suggestion: typeof suggestions[0] }) {
  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    pace: <Icons.Magic.CutFluff style={{ width: 20, height: 20, color: 'var(--color-secondary-c200)' }} />,
    audio: <Icons.MediaDevices.VolumeMax style={{ width: 20, height: 20, color: 'var(--color-secondary-c200)' }} />,
    visual: <Icons.Shapes.Star06 style={{ width: 20, height: 20, color: 'var(--color-secondary-c200)' }} />,
  }

  return (
    <div className="suggestion-row">
      <div className="suggestion-icon">
        {iconMap[suggestion.icon]}
      </div>
      <div className="suggestion-content">
        <span className="suggestion-title">{suggestion.title}</span>
        <span className="suggestion-desc">{suggestion.description}</span>
      </div>
    </div>
  )
}

// Co-Creator Right Panel
function CoCreatorPanel() {
  return (
    <div className="cocreator-panel">
      <div className="cocreator-header">
        <div className="cocreator-title">
          <button className="cocreator-sidebar-btn">
            <Icons.Layout.LayoutLeft style={{ width: 20, height: 20, color: 'var(--color-secondary-c300)' }} />
          </button>
          <span>Co-Creator</span>
        </div>
        <div className="cocreator-actions">
          <button className="cocreator-personalize-btn">
            <Icons.General.Edit04 style={{ width: 16, height: 16 }} />
            <span>Personalize</span>
          </button>
          <button className="cocreator-more-btn">
            <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Glow/Stars decoration */}
      <div className="cocreator-glow">
        <img src={imgCoCreatorGlow} alt="" className="glow-img" />
        <img src={imgStars} alt="" className="stars-img" />
      </div>

      {/* Suggestions */}
      <div className="cocreator-suggestions">
        {suggestions.map((suggestion) => (
          <SuggestionRow key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>

      {/* Prompt Input */}
      <div className="cocreator-prompt">
        <div className="prompt-input">
          <span className="prompt-cursor">|</span>
          <span className="prompt-placeholder">Ask Co-Creator</span>
        </div>
        <div className="prompt-actions">
          <div className="prompt-btns">
            <button className="prompt-tag-btn">
              <Icons.Weather.Stars01 style={{ width: 16, height: 16 }} />
              <span>AI tools</span>
            </button>
            <button className="prompt-tag-btn">
              <Icons.Layout.Grid01 style={{ width: 16, height: 16 }} />
              <span>Suggestions</span>
            </button>
          </div>
          <button className="prompt-send-btn">
            <Icons.Arrows.ArrowUp style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      <p className="cocreator-disclaimer">AI can make mistakes. Always check for accuracy.</p>
    </div>
  )
}

export function MadeForYouPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('made-for-you')
  const [personalizeSettings, setPersonalizeSettings] = useState(defaultPersonalizeSettings)
  const projectName = 'Science of Happiness'

  const handleToggle = (id: string, enabled: boolean) => {
    setPersonalizeSettings(prev => 
      prev.map(s => s.id === id ? { ...s, enabled } : s)
    )
  }

  return (
    <div className="made-for-you-root">
      {/* Platform Sidebar */}
      <PlatformSidebar 
        activeNavId="projects"
        onNavChange={() => {}}
      />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Top Bar with Search */}
        <div className="top-bar">
          <div className="search-container">
            <Icons.General.SearchMd style={{ width: 16, height: 16, color: 'var(--color-secondary-c300)' }} />
            <span className="search-text">Search</span>
          </div>
        </div>

        {/* Content with Co-Creator Panel */}
        <div className="mfy-content-wrapper">
          {/* Main Content Panel */}
          <div className="content-panel">
            {/* Header */}
            <div className="project-header">
              <div className="breadcrumb">
                <button 
                  className="breadcrumb-link"
                  onClick={() => navigate('/projects')}
                >
                  Projects
                </button>
                <Icons.Arrows.ChevronRight style={{ width: 16, height: 16, color: 'var(--color-secondary-c300)', flexShrink: 0 }} />
                <span className="breadcrumb-current">{projectName}</span>
              </div>

              <div className="header-right">
                <button className="icon-btn-header">
                  <Icons.General.DotsHorizontal style={{ width: 20, height: 20 }} />
                </button>
                <Button variant="primary-36" onClick={() => {}}>
                  <Icons.General.Plus style={{ width: 20, height: 20 }} />
                  Create
                  <Icons.Arrows.ChevronDown style={{ width: 20, height: 20 }} />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
              <div className="tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="scroll-content">
              {/* Video Preview Section */}
              <div className="video-section">
                <VideoPreview />
                <PersonalizePanel settings={personalizeSettings} onToggle={handleToggle} />
              </div>

              {/* Episode Info */}
              <div className="episode-info">
                <div className="episode-header">
                  <div className="episode-title-section">
                    <h1 className="episode-title">Diving Into The Science of Happiness</h1>
                    <div className="episode-meta">
                      <span className="episode-type">Magic Episode · Edited 1 hour ago</span>
                      <button className="meta-more-btn">
                        <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </div>
                  <div className="episode-actions">
                    <Button variant="secondary-36" onClick={() => {}}>
                      <div className="upgrade-badge">
                        <Icons.General.Zap style={{ width: 12, height: 12, color: 'var(--color-upgrade-c600)' }} />
                      </div>
                      Transcript
                    </Button>
                    <Button variant="secondary-36" onClick={() => {}}>
                      <Icons.Editor.Scissors01 style={{ width: 20, height: 20 }} />
                      Edit
                    </Button>
                    <Button variant="secondary-36" onClick={() => {}}>
                      <Icons.General.Share07 style={{ width: 20, height: 20 }} />
                      Share
                    </Button>
                  </div>
                </div>
                <div className="episode-description">
                  <span className="desc-text">
                    Understanding oneself is the gateway to banishing the echoes of loneliness and by exploring love's multi-dimensional essence, we will learn the three focal points that breed gr...{' '}
                  </span>
                  <button className="view-more-btn">View more</button>
                </div>
              </div>

              {/* Magic Clips Section */}
              <div className="magic-clips-section">
                <div className="magic-clips-header">
                  <div className="magic-clips-title">
                    <Typography variant="headingXSmall">Magic Clips</Typography>
                    <button className="personalize-chip">
                      <Icons.General.Settings04 style={{ width: 16, height: 16 }} />
                      <span>Personalize</span>
                    </button>
                  </div>
                  <p className="magic-clips-desc">AI-generated clips of your recording highlights based on your preferences.</p>
                </div>
                <div className="magic-clips-scroll">
                  <div className="magic-clips-list">
                    {magicClips.map((clip) => (
                      <MagicClipCard key={clip.id} clip={clip} />
                    ))}
                  </div>
                  <button className="scroll-right-btn">
                    <Icons.Arrows.ChevronRight style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Co-Creator Panel */}
          <CoCreatorPanel />
        </div>
      </div>

      <style>{`
        .made-for-you-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: var(--color-secondary-c1100);
          position: fixed;
          top: 0;
          left: 0;
        }

        /* Main Area */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          justify-content: center;
          padding: 8px 0;
          flex-shrink: 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          padding: 6px 180px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-container:hover {
          background: var(--color-secondary-c700);
        }

        .search-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        /* Content Wrapper */
        .mfy-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 320px;
          flex: 1;
          gap: 12px;
          padding: 0 12px 12px 0;
        }

        /* Content Panel */
        .content-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
          background: var(--color-secondary-c1000);
          border: 1px solid var(--color-secondary-c800);
          border-radius: 12px;
        }

        /* Project Header */
        .project-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 24px;
          flex-shrink: 0;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          padding: 0;
          font: var(--font-heading-small);
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .breadcrumb-link:hover {
          color: var(--color-secondary-c100);
        }

        .breadcrumb-current {
          font: var(--font-heading-small);
          color: var(--color-secondary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .icon-btn-header {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c100);
          transition: all 0.2s ease;
        }

        .icon-btn-header:hover {
          background: var(--color-secondary-c800);
        }

        /* Tabs */
        .tabs-container {
          padding: 0 20px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--color-secondary-c700);
        }

        .tabs {
          display: flex;
          gap: 24px;
        }

        .tab {
          background: none;
          border: none;
          padding: 0 0 12px;
          font: var(--font-link-medium);
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: color 0.2s ease;
          position: relative;
        }

        .tab:hover {
          color: var(--color-secondary-c200);
        }

        .tab.active {
          color: var(--color-secondary-c100);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-secondary-c100);
          border-radius: 1px;
        }

        /* Scroll Content */
        .scroll-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        /* Video Section */
        .video-section {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .video-preview {
          position: relative;
          width: 350px;
          height: 197px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-secondary-c800);
          flex-shrink: 0;
        }

        .video-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        }

        .video-duration {
          font: var(--font-body-small);
          color: var(--color-secondary-c100);
        }

        /* Personalize Panel */
        .personalize-panel {
          width: 240px;
          height: 197px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .personalize-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .personalize-list {
          display: flex;
          flex-direction: column;
        }

        .personalize-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          gap: 8px;
        }

        .personalize-row-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .personalize-label {
          font: var(--font-label-small);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .theme-preview {
          width: 38px;
          height: 24px;
          border-radius: 4px;
          overflow: hidden;
        }

        .theme-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Toggle Switch */
        .toggle-switch {
          width: 36px;
          height: 20px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s ease;
        }

        .toggle-switch.on {
          background: var(--color-primary-c800);
        }

        .toggle-switch.off {
          background: var(--color-secondary-c600);
        }

        .toggle-thumb {
          width: 12px;
          height: 12px;
          background: var(--color-secondary-c100);
          border-radius: 14px;
          position: absolute;
          top: 4px;
          transition: all 0.2s ease;
        }

        .toggle-switch.on .toggle-thumb {
          right: 4px;
        }

        .toggle-switch.off .toggle-thumb {
          left: 4px;
        }

        /* Episode Info */
        .episode-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .episode-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .episode-title-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .episode-title {
          font: var(--font-heading-small);
          color: var(--color-secondary-c100);
          margin: 0;
        }

        .episode-meta {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .episode-type {
          font: var(--font-label-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .meta-more-btn {
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          border-radius: 6px;
        }

        .meta-more-btn:hover {
          background: var(--color-secondary-c800);
        }

        .episode-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .upgrade-badge {
          width: 20px;
          height: 20px;
          background: rgba(214, 250, 139, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .episode-description {
          max-width: 656px;
        }

        .desc-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .view-more-btn {
          background: none;
          border: none;
          padding: 0;
          font: var(--font-link-medium);
          color: var(--color-secondary-c100);
          cursor: pointer;
        }

        .view-more-btn:hover {
          text-decoration: underline;
        }

        /* Magic Clips Section */
        .magic-clips-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .magic-clips-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .magic-clips-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .personalize-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .personalize-chip span {
          font: var(--font-label-small);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .personalize-chip svg {
          color: var(--color-secondary-c100);
        }

        .personalize-chip:hover {
          background: var(--color-secondary-c700);
        }

        .magic-clips-desc {
          font: var(--font-body-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
          margin: 0;
        }

        .magic-clips-scroll {
          position: relative;
        }

        .magic-clips-list {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .magic-clips-list::-webkit-scrollbar {
          display: none;
        }

        .scroll-right-btn {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c100);
          transition: all 0.2s ease;
        }

        .scroll-right-btn:hover {
          background: var(--color-secondary-c700);
        }

        /* Magic Clip Card */
        .magic-clip-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 196px;
          max-width: 228px;
          flex: 1;
        }

        .clip-thumbnail {
          position: relative;
          aspect-ratio: 225/400;
          border-radius: 12px;
          overflow: hidden;
        }

        .clip-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .clip-score {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 36px;
          height: 36px;
          background: linear-gradient(90deg, rgba(111, 207, 151, 0.12) 0%, rgba(111, 207, 151, 0.12) 100%), rgba(19, 19, 19, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font: var(--font-heading-xsmall);
          color: #6FCF97;
        }

        .clip-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(19, 19, 19, 0.6);
          padding: 2px 6px;
          border-radius: 6px;
          font: var(--font-tip);
          color: var(--color-secondary-c100);
        }

        .clip-actions {
          display: flex;
          gap: 8px;
        }

        .clip-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clip-action-btn span {
          font: var(--font-link-medium);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .clip-action-btn svg {
          color: var(--color-secondary-c100);
        }

        .clip-action-btn:hover {
          background: var(--color-secondary-c700);
        }

        .clip-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .clip-title {
          font: var(--font-heading-xxsmall);
          color: var(--color-secondary-c100);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: 0.2px;
        }

        .clip-meta {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .clip-meta span {
          font: var(--font-label-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .clip-more-btn {
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          border-radius: 6px;
        }

        .clip-more-btn:hover {
          background: var(--color-secondary-c800);
        }

        /* Co-Creator Panel */
        .cocreator-panel {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c600);
          border-radius: 12px;
          padding: 20px 8px 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cocreator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0 20px;
        }

        .cocreator-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cocreator-title span {
          font: var(--font-heading-xxsmall);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .cocreator-sidebar-btn {
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
        }

        .cocreator-sidebar-btn:hover {
          background: var(--color-secondary-c800);
        }

        .cocreator-actions {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .cocreator-personalize-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: 6px 10px;
          cursor: pointer;
          border-radius: 8px;
        }

        .cocreator-personalize-btn span {
          font: var(--font-label-small);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .cocreator-personalize-btn svg {
          color: var(--color-secondary-c100);
        }

        .cocreator-personalize-btn:hover {
          background: var(--color-secondary-c800);
        }

        .cocreator-more-btn {
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          border-radius: 8px;
        }

        .cocreator-more-btn:hover {
          background: var(--color-secondary-c800);
        }

        /* Co-Creator Glow */
        .cocreator-glow {
          position: relative;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .glow-img {
          width: 226px;
          height: 226px;
          object-fit: contain;
          opacity: 0.43;
          filter: blur(150px);
          position: absolute;
        }

        .stars-img {
          width: 36px;
          height: 36px;
          position: relative;
          z-index: 1;
        }

        /* Suggestions */
        .cocreator-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .suggestion-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 32px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .suggestion-row:hover {
          background: var(--color-secondary-c900);
        }

        .suggestion-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .suggestion-content {
          display: flex;
          flex-direction: column;
        }

        .suggestion-title {
          font: var(--font-link-small);
          color: var(--color-secondary-c200);
          letter-spacing: 0.2px;
        }

        .suggestion-desc {
          font: var(--font-body-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        /* Prompt */
        .cocreator-prompt {
          background: var(--color-secondary-c900);
          border-radius: 12px;
          padding: 16px;
          margin: 8px 0;
        }

        .prompt-input {
          min-height: 48px;
          margin-bottom: 16px;
        }

        .prompt-cursor {
          color: var(--color-primary-c500);
          font: var(--font-body-medium);
        }

        .prompt-placeholder {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .prompt-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .prompt-btns {
          display: flex;
          gap: 8px;
        }

        .prompt-tag-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-secondary-c700);
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prompt-tag-btn span {
          font: var(--font-label-small);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .prompt-tag-btn svg {
          color: var(--color-secondary-c100);
        }

        .prompt-tag-btn:hover {
          background: var(--color-secondary-c600);
        }

        .prompt-send-btn {
          width: 32px;
          height: 32px;
          background: var(--color-primary-c800);
          border: none;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prompt-send-btn svg {
          color: var(--color-secondary-c100);
        }

        .prompt-send-btn:hover {
          background: var(--color-primary-c700);
        }

        .cocreator-disclaimer {
          font: var(--font-tiny-label);
          color: var(--color-secondary-c300);
          text-align: center;
          letter-spacing: 0.2px;
          padding: 4px 0 8px;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .video-section {
            flex-direction: column;
          }

          .video-preview {
            flex: unset;
            width: 100%;
            max-width: 600px;
            height: auto;
            aspect-ratio: 16/9;
          }

          .personalize-panel {
            flex: unset;
            width: 100%;
            max-width: 600px;
            height: auto;
            max-height: 300px;
          }
        }

        /* Removed media query that hid cocreator-panel */
      `}</style>
    </div>
  )
}

