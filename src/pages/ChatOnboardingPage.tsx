/**
 * CHAT-BASED ONBOARDING - Co-Creator Guided Flow
 *
 * A conversational onboarding that uses the Co-Creator chat agent
 * to guide new users through a 3-turn bounded conversation:
 *
 * Turn 1: Intent — "What are you here to make?"
 * Turn 2: Experience — calibrated to their intent
 * Turn 3: Personalized launch — concrete offer based on both answers
 *
 * Design: matches Co-Creator chat UI (dark, purple accents, chat bubbles)
 */

import { useState, useEffect, useRef } from 'react'
import { Icons } from '@riversidefm/riverstyle'

// ─── Types ───────────────────────────────────────────────────────────

type Intent = 'podcast' | 'interview' | 'social' | 'upload'
type Experience = 'beginner' | 'intermediate' | 'advanced'

interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
  options?: QuickReply[]
  /** Rich content shown below the text */
  features?: Feature[]
}

interface QuickReply {
  label: string
  value: string
  icon?: 'mic' | 'video' | 'social' | 'upload' | 'record' | 'guest' | 'tour' | 'solo'
}

interface Feature {
  icon: 'audio' | 'captions' | 'clips' | 'eye' | 'layout' | 'brand'
  text: string
}

// ─── Content data ────────────────────────────────────────────────────

const INTENT_OPTIONS: QuickReply[] = [
  { label: 'Podcast episodes', value: 'podcast', icon: 'mic' },
  { label: 'Video interviews', value: 'interview', icon: 'video' },
  { label: 'Short-form social content', value: 'social', icon: 'social' },
  { label: 'I have content to edit', value: 'upload', icon: 'upload' },
]

const EXPERIENCE_OPTIONS: Record<Intent, QuickReply[]> = {
  podcast: [
    { label: 'First time — guide me', value: 'beginner' },
    { label: 'A few episodes in', value: 'intermediate' },
    { label: 'Experienced — set me up fast', value: 'advanced' },
  ],
  interview: [
    { label: 'First time — guide me', value: 'beginner' },
    { label: 'Done a few', value: 'intermediate' },
    { label: 'Pro — just set it up', value: 'advanced' },
  ],
  social: [
    { label: 'New to video content', value: 'beginner' },
    { label: 'I post occasionally', value: 'intermediate' },
    { label: 'I create regularly', value: 'advanced' },
  ],
  upload: [], // fast lane — no experience question
}

const INTENT_RESPONSES: Record<Intent, string> = {
  podcast:
    "Great choice! I can help you set up a studio-quality podcast with auto-leveled audio, chapters, and clips for social. Have you recorded a podcast before?",
  interview:
    "Love it! I'll set you up with separate audio tracks, smart layouts, and AI-powered editing for crisp interviews. Have you recorded interviews before?",
  social:
    "Nice — short-form is where it's at. I'll help you record, auto-caption, and resize for any platform. How much video content have you created?",
  upload:
    "Let's work with what you've got! Drop your file and I'll enhance the audio, add captions, and cut highlights. What kind of content is it?",
}

const UPLOAD_OPTIONS: QuickReply[] = [
  { label: 'Podcast episode', value: 'podcast', icon: 'mic' },
  { label: 'Interview / conversation', value: 'interview', icon: 'video' },
  { label: 'Presentation or talk', value: 'social', icon: 'social' },
]

interface LaunchContent {
  text: string
  features: Feature[]
  options: QuickReply[]
}

const LAUNCH_CONTENT: Record<Intent, Record<Experience, LaunchContent>> = {
  podcast: {
    beginner: {
      text: "Here's what I'll do for your first episode:",
      features: [
        { icon: 'audio', text: 'Pro audio settings — sound great on any mic' },
        { icon: 'captions', text: 'Auto-remove filler words and silences' },
        { icon: 'clips', text: 'AI-generated clips for social media' },
      ],
      options: [
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    intermediate: {
      text: "I'll level up your workflow:",
      features: [
        { icon: 'audio', text: 'Studio-quality audio enhancement' },
        { icon: 'clips', text: 'Smart highlights for social clips' },
        { icon: 'brand', text: 'Brand kit — consistent look across episodes' },
      ],
      options: [
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    advanced: {
      text: "Your studio is ready — optimized for speed:",
      features: [
        { icon: 'audio', text: 'Separate tracks, lossless quality' },
        { icon: 'layout', text: 'Smart layout switching between speakers' },
        { icon: 'clips', text: 'One-click publishing to all platforms' },
      ],
      options: [
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Invite a guest', value: 'guest', icon: 'guest' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
      ],
    },
  },
  interview: {
    beginner: {
      text: "I've set up everything for a great first interview:",
      features: [
        { icon: 'layout', text: 'Auto speaker-view switching' },
        { icon: 'audio', text: 'Separate audio tracks per guest' },
        { icon: 'captions', text: 'Live transcription + captions' },
      ],
      options: [
        { label: 'Record a solo test first', value: 'solo', icon: 'solo' },
        { label: 'Invite a guest & record', value: 'guest', icon: 'guest' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    intermediate: {
      text: "Your interview studio is ready:",
      features: [
        { icon: 'audio', text: 'AI noise removal + audio leveling' },
        { icon: 'eye', text: 'Eye contact correction for natural look' },
        { icon: 'clips', text: 'Auto-generated highlight clips' },
      ],
      options: [
        { label: 'Invite a guest & record', value: 'guest', icon: 'guest' },
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload an existing interview', value: 'upload', icon: 'upload' },
      ],
    },
    advanced: {
      text: "Pro interview setup — separate tracks, smart layouts:",
      features: [
        { icon: 'audio', text: 'Lossless separate tracks per participant' },
        { icon: 'layout', text: 'Dynamic layout switching' },
        { icon: 'brand', text: 'Brand overlay + custom intros' },
      ],
      options: [
        { label: 'Invite a guest & record', value: 'guest', icon: 'guest' },
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
      ],
    },
  },
  social: {
    beginner: {
      text: "I'll make your first video look polished:",
      features: [
        { icon: 'captions', text: 'Auto-captions in trending styles' },
        { icon: 'clips', text: 'AI resizes for TikTok, Reels & Shorts' },
        { icon: 'audio', text: 'Background noise removal' },
      ],
      options: [
        { label: 'Record my first video', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    intermediate: {
      text: "Let's speed up your content pipeline:",
      features: [
        { icon: 'clips', text: 'Record once, get clips for every platform' },
        { icon: 'brand', text: 'Brand templates for consistent style' },
        { icon: 'captions', text: 'Animated captions that boost engagement' },
      ],
      options: [
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    advanced: {
      text: "Power setup for high-volume creators:",
      features: [
        { icon: 'clips', text: 'AI finds your best moments automatically' },
        { icon: 'brand', text: 'Brand kit + template library' },
        { icon: 'layout', text: 'Batch export for all platforms at once' },
      ],
      options: [
        { label: 'Start recording', value: 'record', icon: 'record' },
        { label: 'Upload a file', value: 'upload', icon: 'upload' },
      ],
    },
  },
  // Upload fast-lane doesn't use experience, so just one entry
  upload: {
    beginner: {
      text: "Upload your file and I'll take it from here:",
      features: [
        { icon: 'audio', text: 'AI audio enhancement' },
        { icon: 'captions', text: 'Auto-generated captions' },
        { icon: 'clips', text: 'Smart highlight clips' },
      ],
      options: [
        { label: 'Upload my file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    intermediate: {
      text: "Upload your file and I'll take it from here:",
      features: [
        { icon: 'audio', text: 'AI audio enhancement' },
        { icon: 'captions', text: 'Auto-generated captions' },
        { icon: 'clips', text: 'Smart highlight clips' },
      ],
      options: [
        { label: 'Upload my file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
    advanced: {
      text: "Upload your file and I'll take it from here:",
      features: [
        { icon: 'audio', text: 'AI audio enhancement' },
        { icon: 'captions', text: 'Auto-generated captions' },
        { icon: 'clips', text: 'Smart highlight clips' },
      ],
      options: [
        { label: 'Upload my file', value: 'upload', icon: 'upload' },
        { label: 'Show me around first', value: 'tour', icon: 'tour' },
      ],
    },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────

let msgId = 0
const nextId = () => `msg-${++msgId}`

function FeatureIcon({ icon }: { icon: Feature['icon'] }) {
  const s = { width: 18, height: 18, color: '#b18cff' }
  if (icon === 'audio') return <Icons.Magic.MagicAudio style={s} />
  if (icon === 'captions') return <Icons.Magic.MagicClips style={s} />
  if (icon === 'clips') return <Icons.Magic.MagicClips style={s} />
  if (icon === 'eye') return <Icons.Users.User01 style={s} />
  if (icon === 'layout') return <Icons.MediaDevices.Monitor01 style={s} />
  if (icon === 'brand') return <Icons.Shapes.Star01 style={s} />
  return <Icons.General.Zap style={s} />
}

function ChipIcon({ icon }: { icon: QuickReply['icon'] }) {
  const s = { width: 16, height: 16 }
  if (icon === 'mic') return <Icons.MediaDevices.Microphone01 style={s} />
  if (icon === 'video') return <Icons.MediaDevices.VideoRecorder style={s} />
  if (icon === 'social') return <Icons.Users.Users01 style={s} />
  if (icon === 'upload') return <Icons.Arrows.ArrowRight style={s} />
  if (icon === 'record') return <Icons.MediaDevices.Recording01 style={s} />
  if (icon === 'guest') return <Icons.Users.Users01 style={s} />
  if (icon === 'tour') return <Icons.General.Zap style={s} />
  if (icon === 'solo') return <Icons.Users.User01 style={s} />
  return null
}

// ─── Component ───────────────────────────────────────────────────────

export function ChatOnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [activeOptions, setActiveOptions] = useState<QuickReply[] | null>(null)
  const [intent, setIntent] = useState<Intent | null>(null)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [step, setStep] = useState(0) // 0=not started, 1=asked intent, 2=asked exp, 3=launch
  const [uploadSubtype, setUploadSubtype] = useState<Intent | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing, activeOptions])

  // --- Flow engine ---

  const addBotMessage = (text: string, options?: QuickReply[], features?: Feature[]) => {
    return new Promise<void>((resolve) => {
      setTyping(true)
      setActiveOptions(null)
      setTimeout(() => {
        setTyping(false)
        setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text, features }])
        if (options) {
          setTimeout(() => setActiveOptions(options), 300)
        }
        resolve()
      }, 800 + Math.random() * 600)
    })
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    setActiveOptions(null)
  }

  // Kick off the conversation (ref guard prevents StrictMode double-fire)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    setStep(1)
    addBotMessage(
      "Hey! I'm Co-Creator \u2014 I'll help you record, edit, and publish. What are you here to make?",
      INTENT_OPTIONS,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle intent selection
  const handleIntentSelect = async (option: QuickReply) => {
    addUserMessage(option.label)
    const selectedIntent = option.value as Intent
    setIntent(selectedIntent)

    if (selectedIntent === 'upload') {
      // Upload fast-lane: ask content type instead of experience
      setStep(2)
      await addBotMessage(INTENT_RESPONSES[selectedIntent], UPLOAD_OPTIONS)
    } else {
      // Normal path: ask experience
      setStep(2)
      await addBotMessage(INTENT_RESPONSES[selectedIntent], EXPERIENCE_OPTIONS[selectedIntent])
    }
  }

  // Handle experience selection (or upload subtype)
  const handleExperienceSelect = async (option: QuickReply) => {
    addUserMessage(option.label)

    if (intent === 'upload') {
      // Upload fast-lane: got the subtype, go straight to launch
      const subtype = option.value as Intent
      setUploadSubtype(subtype)
      setExperience('beginner') // default for upload path
      setStep(3)
      const launch = LAUNCH_CONTENT.upload.beginner
      await addBotMessage(launch.text, launch.options, launch.features)
    } else {
      const selectedExp = option.value as Experience
      setExperience(selectedExp)
      setStep(3)
      const launch = LAUNCH_CONTENT[intent!][selectedExp]
      await addBotMessage(launch.text, launch.options, launch.features)
    }
  }

  // Handle launch action
  const handleLaunchSelect = (option: QuickReply) => {
    addUserMessage(option.label)
    setActiveOptions(null)

    // In a real app these would navigate. For the prototype, show a confirmation.
    setTimeout(() => {
      let destination = ''
      switch (option.value) {
        case 'record':
        case 'solo':
          destination = '/studio'
          break
        case 'guest':
          destination = '/studio'
          break
        case 'upload':
          destination = '/editor'
          break
        case 'tour':
          destination = '/dashboard'
          break
      }
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text:
            option.value === 'tour'
              ? "Let me show you around! I'll be right here if you need anything."
              : option.value === 'guest'
                ? "Let's invite your guest! I'll set up the studio while you send the invite."
                : "Let's do this! Setting up your studio now...",
        },
      ])

      // Navigate after a beat
      setTimeout(() => {
        window.location.href = destination
      }, 1500)
    }, 600)
  }

  // Route option clicks to the right handler
  const handleOptionClick = (option: QuickReply) => {
    if (step === 1) handleIntentSelect(option)
    else if (step === 2) handleExperienceSelect(option)
    else if (step === 3) handleLaunchSelect(option)
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="chat-onboarding-root">
      {/* Background gradient */}
      <div className="chat-bg-gradient" />

      {/* Header */}
      <header className="chat-header">
        <div className="chat-logo">
          <img src="/riverside-icon.svg" alt="Riverside" style={{ width: 28, height: 28 }} />
          <span className="chat-logo-text">Riverside</span>
        </div>
        <div className="chat-progress">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`chat-progress-dot ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}
            />
          ))}
        </div>
        <button
          className="chat-skip"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Skip
        </button>
      </header>

      {/* Chat area */}
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-messages">
          {/* Co-Creator identity */}
          <div className="chat-identity">
            <div className="chat-avatar">
              <Icons.General.Zap style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <span className="chat-identity-name">Co-Creator</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                <span>{msg.text}</span>

                {msg.features && (
                  <div className="chat-features">
                    {msg.features.map((f, i) => (
                      <div key={i} className="chat-feature-item">
                        {<FeatureIcon icon={f.icon} />}
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="chat-bubble-row bot">
              <div className="chat-bubble bot typing-bubble">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick-reply chips */}
      <div className="chat-footer">
        {activeOptions && (
          <div className="chat-chips">
            {activeOptions.map((opt) => (
              <button
                key={opt.value}
                className="chat-chip"
                onClick={() => handleOptionClick(opt)}
              >
                {opt.icon && <ChipIcon icon={opt.icon} />}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Subtle input hint — visual only, chips are the primary interaction */}
        <div className="chat-input-bar">
          <div className="chat-input-placeholder">
            {activeOptions ? 'Choose an option above or type...' : '...'}
          </div>
          <div className="chat-send-btn">
            <Icons.Arrows.ArrowRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>

        <div className="chat-trust">
          Trusted by 50,000+ creators  &middot;  4.8 on G2
        </div>
      </div>

      <style>{`
        /* ── Root ────────────────────────────── */
        .chat-onboarding-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        .chat-bg-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(120, 72, 255, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 100%, rgba(80, 201, 255, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Header ─────────────────────────── */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          position: relative;
          z-index: 10;
        }

        .chat-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-logo-text {
          font: var(--font-heading-xsmall);
          color: #fff;
          letter-spacing: -0.02em;
        }

        .chat-progress {
          display: flex;
          gap: 6px;
        }

        .chat-progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.4s ease;
        }

        .chat-progress-dot.active {
          width: 24px;
          border-radius: 4px;
          background: linear-gradient(90deg, #7848ff, #b43dff);
        }

        .chat-progress-dot.done {
          background: #7848ff;
        }

        .chat-skip {
          font: var(--font-link-small);
          color: rgba(255,255,255,0.4);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .chat-skip:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
        }

        /* ── Chat scroll area ───────────────── */
        .chat-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        .chat-messages {
          max-width: 560px;
          margin: 0 auto;
          padding-bottom: 24px;
        }

        /* ── Co-Creator identity ────────────── */
        .chat-identity {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-top: 12px;
        }

        .chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7848ff, #b43dff);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-identity-name {
          font: var(--font-label-medium);
          color: rgba(255,255,255,0.7);
        }

        /* ── Message bubbles ────────────────── */
        .chat-bubble-row {
          display: flex;
          margin-bottom: 12px;
          animation: bubbleIn 0.35s ease;
        }

        .chat-bubble-row.bot {
          justify-content: flex-start;
        }

        .chat-bubble-row.user {
          justify-content: flex-end;
        }

        @keyframes bubbleIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-bubble {
          max-width: 420px;
          padding: 14px 18px;
          border-radius: 18px;
          font: var(--font-body-medium);
          line-height: 1.6;
        }

        .chat-bubble.bot {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          border-bottom-left-radius: 6px;
        }

        .chat-bubble.user {
          background: linear-gradient(135deg, #7848ff, #6535e0);
          color: #fff;
          border-bottom-right-radius: 6px;
        }

        /* ── Features list inside bubble ───── */
        .chat-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .chat-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font: var(--font-body-small);
          color: rgba(255,255,255,0.75);
        }

        /* ── Typing indicator ───────────────── */
        .typing-bubble {
          padding: 16px 22px;
        }

        .typing-dots {
          display: flex;
          gap: 5px;
        }

        .typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }

        /* ── Footer (chips + input) ─────────── */
        .chat-footer {
          position: relative;
          z-index: 10;
          padding: 0 24px 20px;
          max-width: 608px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Quick-reply chips ──────────────── */
        .chat-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          animation: chipsIn 0.4s ease;
        }

        @keyframes chipsIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          color: rgba(255,255,255,0.85);
          font: var(--font-label-small);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .chat-chip:hover {
          background: rgba(120, 72, 255, 0.15);
          border-color: #7848ff;
          color: #fff;
          transform: translateY(-1px);
        }

        .chat-chip:active {
          transform: translateY(0);
        }

        /* ── Input bar (visual only for prototype) ── */
        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
        }

        .chat-input-placeholder {
          flex: 1;
          font: var(--font-body-medium);
          color: rgba(255,255,255,0.25);
        }

        .chat-send-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Trust line ─────────────────────── */
        .chat-trust {
          text-align: center;
          font: var(--font-body-xsmall);
          color: rgba(255,255,255,0.25);
          margin-top: 12px;
        }
      `}</style>
    </div>
  )
}
