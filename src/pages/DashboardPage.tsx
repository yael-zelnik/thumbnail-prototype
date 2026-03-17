/**
 * DASHBOARD PAGE - Platform Layout
 * 
 * Main platform layout with sidebar navigation based on Figma design.
 * Uses Riverstyle components and the PlatformSidebar custom component.
 */

import { useState, useRef, useEffect } from 'react'
import { Typography, Icons, Button } from '@riversidefm/riverstyle'
import { PlatformSidebar } from '../components/my-components'

export function DashboardPage() {
  const [activeNav, setActiveNav] = useState('home')
  const [chatInput, setChatInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [chatInput])

  const suggestions = [
    { icon: Icons.MediaDevices.Microphone01, label: 'Record a podcast' },
    { icon: Icons.MediaDevices.VideoRecorder, label: 'Start a video call' },
    { icon: Icons.Magic.MagicClips, label: 'Create clips from video' },
    { icon: Icons.Editor.PencilLine, label: 'Edit my latest recording' },
  ]

  const handleSubmit = () => {
    if (chatInput.trim()) {
      console.log('Creating:', chatInput)
      setChatInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="dashboard-root">
      {/* Platform Sidebar */}
      <PlatformSidebar 
        activeNavId={activeNav}
        onNavChange={setActiveNav}
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

        {/* Content Panel */}
        <div className="content-panel">
          {/* Welcome + Chat Box Section */}
          <div className="chat-section">
            <div className="welcome-text">
              <Typography variant="headingLarge">
                What will you create today?
              </Typography>
              <Typography variant="bodyMedium" color="secondary.c300">
                Describe what you want to make and let AI help you get started
              </Typography>
            </div>

            {/* Big Chat Box */}
            <div className={`chat-box ${isFocused ? 'focused' : ''}`}>
              <div className="chat-box-glow" />
              <div className="chat-input-wrapper">
                <div className="chat-icon">
                  <Icons.General.Stars02 style={{ width: 24, height: 24 }} />
                </div>
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Start typing... e.g., &quot;Record a podcast interview&quot; or &quot;Create clips from my latest video&quot;"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button 
                  className={`send-button ${chatInput.trim() ? 'active' : ''}`}
                  onClick={handleSubmit}
                  disabled={!chatInput.trim()}
                >
                  <Icons.Arrows.ArrowUp style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => setChatInput(suggestion.label)}
                >
                  <suggestion.icon style={{ width: 16, height: 16 }} />
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="recent-section">
            <Typography variant="headingXSmall" style={{ marginBottom: '16px' }}>
              Recent Activity
            </Typography>
            <div className="recent-empty">
              <Icons.Time.Clock style={{ width: 32, height: 32, color: 'var(--color-secondary-c500)' }} />
              <Typography variant="bodySmall" color="secondary.c400">
                Your recent projects will appear here
              </Typography>
            </div>
          </div>

          {/* Help Button */}
          <button className="help-btn" title="Help">
            <Icons.General.HelpCircle style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      <style>{`
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: var(--color-secondary-c1100);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        /* Main Area */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 8px 8px 0;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          justify-content: center;
          padding: 8px 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          padding: 4px 180px;
          max-width: 480px;
          width: 360px;
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

        /* Content Panel */
        .content-panel {
          flex: 1;
          background: var(--color-secondary-c1000);
          border: 1px solid var(--color-secondary-c800);
          border-radius: 12px;
          padding: 48px 32px 32px;
          position: relative;
          overflow-y: auto;
        }

        /* Chat Section */
        .chat-section {
          max-width: 720px;
          margin: 0 auto 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-text > *:first-child {
          margin-bottom: 8px;
        }

        /* Chat Box */
        .chat-box {
          width: 100%;
          position: relative;
          border-radius: 20px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          transition: all 0.3s ease;
        }

        .chat-box:hover {
          border-color: var(--color-secondary-c600);
        }

        .chat-box.focused {
          border-color: var(--color-primary-c700);
          box-shadow: 0 0 0 3px var(--color-transparent-p10);
        }

        .chat-box-glow {
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--color-primary-c800), var(--color-pink), var(--color-light-blue));
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
          filter: blur(8px);
        }

        .chat-box.focused .chat-box-glow {
          opacity: 0.15;
        }

        .chat-input-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
        }

        .chat-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary-c800), var(--color-primary-c600));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font: var(--font-body-large);
          color: var(--color-secondary-c100);
          resize: none;
          min-height: 40px;
          line-height: 1.5;
          padding: 8px 0;
        }

        .chat-input::placeholder {
          color: var(--color-secondary-c400);
        }

        .send-button {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--color-secondary-c700);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-secondary-c400);
          cursor: not-allowed;
          transition: all 0.2s ease;
        }

        .send-button.active {
          background: var(--color-primary-c800);
          color: var(--color-white);
          cursor: pointer;
        }

        .send-button.active:hover {
          background: var(--color-primary-c700);
          transform: scale(1.05);
        }

        /* Suggestions */
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 20px;
        }

        .suggestion-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 100px;
          font: var(--font-body-small);
          color: var(--color-secondary-c200);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestion-chip:hover {
          background: var(--color-secondary-c800);
          border-color: var(--color-secondary-c600);
          color: var(--color-secondary-c100);
        }

        .suggestion-chip svg {
          color: var(--color-primary-c600);
        }

        .suggestion-chip:hover svg {
          color: var(--color-primary-c500);
        }

        /* Recent Section */
        .recent-section {
          max-width: 900px;
          margin: 0 auto;
        }

        .recent-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px;
          background: var(--color-secondary-c900);
          border: 1px dashed var(--color-secondary-c700);
          border-radius: 12px;
        }

        /* Help Button */
        .help-btn {
          position: absolute;
          bottom: 19px;
          right: 19px;
          width: 36px;
          height: 36px;
          border-radius: 50px;
          background: var(--color-secondary-c800);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          transition: all 0.2s ease;
        }

        .help-btn:hover {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
        }
      `}</style>
    </div>
  )
}
