/**
 * MADE FOR YOU TAB CONTENT
 * 
 * Reusable component for the "Made for You" tab content
 * Includes video preview, personalize panel, episode info, and magic clips
 */

import { useState } from 'react'
import { Typography, Button, Icons } from '@riversidefm/riverstyle'

// Image assets
const imgVideoThumbnail = '/icons/070ad37fc6699b05b40d520cdb49690be17b4eb9.png'
const imgThemePreview = '/icons/8ecdd420a8ac4c22da13094aa9239e756b5a33e0.png'
const imgClipThumbnail = '/icons/517f7b3fbbfa69b577459f3e2b8468b25638c6cc.png'

// Personalization setting type
interface PersonalizeSetting {
  id: string
  label: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  enabled: boolean
  hasImage?: boolean
  image?: string
}

// Default settings
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

// Toggle Switch
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      className={`mfy-toggle-switch ${checked ? 'on' : 'off'}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <div className="mfy-toggle-thumb" />
    </button>
  )
}

// Personalize Row
function PersonalizeRow({ setting, onToggle }: { setting: PersonalizeSetting; onToggle: (id: string, enabled: boolean) => void }) {
  const Icon = setting.icon
  return (
    <div className="mfy-personalize-row">
      <div className="mfy-personalize-row-left">
        <Icon style={{ width: 20, height: 20, color: 'var(--color-secondary-c100)' }} />
        <span className="mfy-personalize-label">{setting.label}</span>
      </div>
      {setting.hasImage && setting.image ? (
        <div className="mfy-theme-preview">
          <img src={setting.image} alt="" />
        </div>
      ) : (
        <ToggleSwitch checked={setting.enabled} onChange={(val) => onToggle(setting.id, val)} />
      )}
    </div>
  )
}

// Video Preview
function VideoPreview() {
  return (
    <div className="mfy-video-preview">
      <img src={imgVideoThumbnail} alt="" className="mfy-video-thumbnail" />
      <div className="mfy-video-controls">
        <div className="mfy-video-duration">25:00</div>
      </div>
    </div>
  )
}

// Personalize Panel
function PersonalizePanel({ settings, onToggle }: { settings: PersonalizeSetting[]; onToggle: (id: string, enabled: boolean) => void }) {
  return (
    <div className="mfy-personalize-panel">
      <div className="mfy-personalize-header">
        <Typography variant="headingXSmall">Personalize</Typography>
        <Icons.General.HelpCircle style={{ width: 16, height: 16, color: 'var(--color-secondary-c300)' }} />
      </div>
      <div className="mfy-personalize-list">
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
    <div className="mfy-magic-clip-card">
      <div className="mfy-clip-thumbnail">
        <img src={imgClipThumbnail} alt="" />
        <div className="mfy-clip-score">{clip.score}</div>
        <div className="mfy-clip-duration">{clip.duration}</div>
      </div>
      <div className="mfy-clip-actions">
        <button className="mfy-clip-action-btn">
          <Icons.Editor.Scissors01 style={{ width: 20, height: 20 }} />
          <span>Edit</span>
        </button>
        <button className="mfy-clip-action-btn">
          <Icons.General.Share07 style={{ width: 20, height: 20 }} />
          <span>Share</span>
        </button>
      </div>
      <div className="mfy-clip-info">
        <p className="mfy-clip-title">{clip.title}</p>
        <div className="mfy-clip-meta">
          <span>Edited {clip.editedAt}</span>
          <button className="mfy-clip-more-btn">
            <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Tab Content
export function MadeForYouTabContent() {
  const [personalizeSettings, setPersonalizeSettings] = useState(defaultPersonalizeSettings)

  const handleToggle = (id: string, enabled: boolean) => {
    setPersonalizeSettings(prev => 
      prev.map(s => s.id === id ? { ...s, enabled } : s)
    )
  }

  return (
    <>
      {/* Video Preview Section */}
      <div className="mfy-video-section">
        <VideoPreview />
        <PersonalizePanel settings={personalizeSettings} onToggle={handleToggle} />
      </div>

      {/* Episode Info */}
      <div className="mfy-episode-info">
        <div className="mfy-episode-header">
          <div className="mfy-episode-title-section">
            <h1 className="mfy-episode-title">Diving Into The Science of Happiness</h1>
            <div className="mfy-episode-meta">
              <span className="mfy-episode-type">Magic Episode · Edited 1 hour ago</span>
              <button className="mfy-meta-more-btn">
                <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
          <div className="mfy-episode-actions">
            <Button variant="secondary-36" onClick={() => {}}>
              <div className="mfy-upgrade-badge">
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
        <div className="mfy-episode-description">
          <span className="mfy-desc-text">
            Understanding oneself is the gateway to banishing the echoes of loneliness and by exploring love's multi-dimensional essence, we will learn the three focal points that breed gr...{' '}
          </span>
          <button className="mfy-view-more-btn">View more</button>
        </div>
      </div>

      {/* Magic Clips Section */}
      <div className="mfy-magic-clips-section">
        <div className="mfy-magic-clips-header">
          <div className="mfy-magic-clips-title">
            <Typography variant="headingXSmall">Magic Clips</Typography>
            <button className="mfy-personalize-chip">
              <Icons.General.Settings04 style={{ width: 16, height: 16 }} />
              <span>Personalize</span>
            </button>
          </div>
          <p className="mfy-magic-clips-desc">AI-generated clips of your recording highlights based on your preferences.</p>
        </div>
        <div className="mfy-magic-clips-scroll">
          <div className="mfy-magic-clips-list">
            {magicClips.map((clip) => (
              <MagicClipCard key={clip.id} clip={clip} />
            ))}
          </div>
          <button className="mfy-scroll-right-btn">
            <Icons.Arrows.ChevronRight style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      <style>{`
        /* Video Section */
        .mfy-video-section {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .mfy-video-preview {
          position: relative;
          width: 350px;
          height: 197px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-secondary-c800);
          flex-shrink: 0;
        }

        .mfy-video-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mfy-video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        }

        .mfy-video-duration {
          font: var(--font-body-small);
          color: var(--color-secondary-c100);
        }

        /* Personalize Panel */
        .mfy-personalize-panel {
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

        .mfy-personalize-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mfy-personalize-list {
          display: flex;
          flex-direction: column;
        }

        .mfy-personalize-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          gap: 8px;
        }

        .mfy-personalize-row-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mfy-personalize-label {
          font: var(--font-label-small);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .mfy-theme-preview {
          width: 38px;
          height: 24px;
          border-radius: 4px;
          overflow: hidden;
        }

        .mfy-theme-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Toggle Switch */
        .mfy-toggle-switch {
          width: 36px;
          height: 20px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s ease;
        }

        .mfy-toggle-switch.on {
          background: var(--color-primary-c800);
        }

        .mfy-toggle-switch.off {
          background: var(--color-secondary-c600);
        }

        .mfy-toggle-thumb {
          width: 12px;
          height: 12px;
          background: var(--color-secondary-c100);
          border-radius: 14px;
          position: absolute;
          top: 4px;
          transition: all 0.2s ease;
        }

        .mfy-toggle-switch.on .mfy-toggle-thumb {
          right: 4px;
        }

        .mfy-toggle-switch.off .mfy-toggle-thumb {
          left: 4px;
        }

        /* Episode Info */
        .mfy-episode-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mfy-episode-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .mfy-episode-title-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mfy-episode-title {
          font: var(--font-heading-small);
          color: var(--color-secondary-c100);
          margin: 0;
        }

        .mfy-episode-meta {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mfy-episode-type {
          font: var(--font-label-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .mfy-meta-more-btn {
          width: 20px;
          height: 20px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          border-radius: 4px;
        }

        .mfy-meta-more-btn:hover {
          background: var(--color-secondary-c800);
        }

        .mfy-episode-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .mfy-upgrade-badge {
          width: 16px;
          height: 16px;
          background: var(--color-upgrade-c500);
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mfy-episode-description {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .mfy-desc-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .mfy-view-more-btn {
          background: transparent;
          border: none;
          font: var(--font-link-medium);
          color: var(--color-secondary-c100);
          cursor: pointer;
          padding: 0;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .mfy-view-more-btn:hover {
          color: var(--color-primary-c800);
        }

        /* Magic Clips Section */
        .mfy-magic-clips-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mfy-magic-clips-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mfy-magic-clips-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mfy-personalize-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: transparent;
          border: 1px solid var(--color-secondary-c600);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mfy-personalize-chip span {
          font: var(--font-label-small);
          color: var(--color-secondary-c200);
          letter-spacing: 0.2px;
        }

        .mfy-personalize-chip svg {
          color: var(--color-secondary-c200);
        }

        .mfy-personalize-chip:hover {
          background: var(--color-secondary-c800);
          border-color: var(--color-secondary-c500);
        }

        .mfy-magic-clips-desc {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
          margin: 0;
        }

        .mfy-magic-clips-scroll {
          position: relative;
        }

        .mfy-magic-clips-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: thin;
        }

        .mfy-scroll-right-btn {
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

        .mfy-scroll-right-btn:hover {
          background: var(--color-secondary-c700);
        }

        /* Magic Clip Card */
        .mfy-magic-clip-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 196px;
          max-width: 228px;
          flex: 1;
        }

        .mfy-clip-thumbnail {
          position: relative;
          aspect-ratio: 225/400;
          border-radius: 12px;
          overflow: hidden;
        }

        .mfy-clip-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mfy-clip-score {
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

        .mfy-clip-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(19, 19, 19, 0.6);
          padding: 2px 6px;
          border-radius: 6px;
          font: var(--font-tip);
          color: var(--color-secondary-c100);
        }

        .mfy-clip-actions {
          display: flex;
          gap: 8px;
        }

        .mfy-clip-action-btn {
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

        .mfy-clip-action-btn span {
          font: var(--font-link-medium);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        .mfy-clip-action-btn svg {
          color: var(--color-secondary-c100);
        }

        .mfy-clip-action-btn:hover {
          background: var(--color-secondary-c700);
        }

        .mfy-clip-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mfy-clip-title {
          font: var(--font-heading-xxsmall);
          color: var(--color-secondary-c100);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: 0.2px;
        }

        .mfy-clip-meta {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mfy-clip-meta span {
          font: var(--font-label-small);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        .mfy-clip-more-btn {
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

        .mfy-clip-more-btn:hover {
          background: var(--color-secondary-c800);
        }
      `}</style>
    </>
  )
}

