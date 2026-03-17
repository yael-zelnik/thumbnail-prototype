/**
 * EDITOR PAGE - Video Editor Interface
 *
 * Full-featured video editing interface with:
 * - Top bar with navigation, aspect ratio selector, and actions
 * - Transcript panel on the left
 * - Video canvas in the center
 * - Timeline at the bottom
 * - Tool sidebar on the right
 *
 * Uses Riverstyle design system components and CSS variables.
 * Supports both light and dark modes with a toggle.
 */

import { useState, useCallback, useEffect, useRef, useMemo, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Icons } from '@riversidefm/riverstyle'

// ============================================================================
// TYPES
// ============================================================================

// Drag and Drop Method Types
type DragDropMethod = 'easiest' | 'full' | 'hybrid'

interface DraggedMediaItem {
  id: string
  name: string
  type: 'video' | 'image' | 'audio' | 'recording' | 'edit'
  thumbnail?: string
  duration?: string
}

interface DragDropContextType {
  method: DragDropMethod
  setMethod: (method: DragDropMethod) => void
  draggedItem: DraggedMediaItem | null
  setDraggedItem: (item: DraggedMediaItem | null) => void
  isDragging: boolean
  dropTarget: 'canvas' | 'overlay-lane' | 'main-lane' | 'timeline-full' | null
  setDropTarget: (target: 'canvas' | 'overlay-lane' | 'main-lane' | 'timeline-full' | null) => void
  showToast: (message: string) => void
  addOverlay: (item: DraggedMediaItem) => void
  addTimelineSection: (item: DraggedMediaItem) => void
  addMediaSmart: (item: DraggedMediaItem) => void // Adds based on what's available, defaults to overlay
  canBeOverlay: (type: string) => boolean
  canBeTimelineSection: (type: string) => boolean
}

// Create context for drag and drop
const DragDropContext = createContext<DragDropContextType | null>(null)

function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

interface AspectRatio {
  id: string
  label: string
  sublabel: string
  icon: 'monitor' | 'square' | 'smartphone' | 'audio'
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface TranscriptBlock {
  time: string
  speaker?: string
  text: string
  isChapter?: boolean
}

interface TimelineSectionData {
  id: string
  name: string
  duration: string
  startPosition: number // percentage (0-100)
  width: number // percentage (0-100)
  thumbnails: string[]
  // Audio peaks data for waveform visualization (values between -1 and 1)
  peaks: number[]
  // Speaker segments for color coding [startPercent, endPercent, speaker][]
  speakerSegments: [number, number, 'primary' | 'secondary'][]
  // Trim positions as percentages of original content (0-1)
  trimStart: number // Where visible content starts (0 = beginning)
  trimEnd: number // Where visible content ends (1 = full length)
}

interface SceneData {
  id: string
  label: string
  startPosition: number // percentage (0-100)
  width: number // percentage (0-100)
  thumbnail: string
}

interface OverlayData {
  id: string
  type: 'image' | 'text' | 'audio' | 'video' | 'music'
  label: string
  startPosition: number // percentage (0-100)
  width: number // percentage (0-100)
  color: string
  lane: number // Lane index (0, 1, 2, etc.) for multiple overlay lanes
  thumbnail?: string // Optional thumbnail for image/video overlays
}

// ============================================================================
// DATA
// ============================================================================

const ASPECT_RATIOS: AspectRatio[] = [
  { id: '16:9', label: '16:9', sublabel: 'YouTube, Spotify', icon: 'monitor' },
  { id: '1:1', label: '1:1', sublabel: 'LinkedIn, X, Instagram', icon: 'square' },
  { id: '9:16', label: '9:16', sublabel: 'Shorts, Reels, TikToks', icon: 'smartphone' },
  { id: 'audio', label: 'Audio only', sublabel: 'YouTube, Spotify', icon: 'audio' },
]

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'co-creator', label: 'Co-Creator', icon: <Icons.Magic.CoCreator style={{ width: 16, height: 16 }} /> },
  { id: 'ai-tools', label: 'AI tools', icon: <Icons.Magic.MagicClips style={{ width: 16, height: 16 }} /> },
  { id: 'your-media', label: 'Your media', icon: <Icons.Files.Folder style={{ width: 16, height: 16 }} /> },
  { id: 'track', label: 'Track', icon: <Icons.Layout.Rows03 style={{ width: 16, height: 16 }} /> },
  { id: 'brand', label: 'Brand', icon: <Icons.General.Brand style={{ width: 16, height: 16 }} /> },
  { id: 'design', label: 'Design', icon: <Icons.Editor.PaintPour style={{ width: 16, height: 16 }} /> },
  { id: 'music', label: 'Music', icon: <Icons.MediaDevices.MusicNote01 style={{ width: 16, height: 16 }} /> },
  { id: 'captions', label: 'Captions', icon: <Icons.Magic.MagicCaptions style={{ width: 16, height: 16 }} /> },
  { id: 'uploads', label: 'Uploads', icon: <Icons.General.UploadCloud01 style={{ width: 16, height: 16 }} /> },
  { id: 'record', label: 'Record', icon: <Icons.MediaDevices.Recording01 style={{ width: 16, height: 16 }} /> },
  { id: 'images', label: 'Images', icon: <Icons.Images.Image01 style={{ width: 16, height: 16 }} /> },
  { id: 'text', label: 'Text', icon: <Icons.Editor.Type01 style={{ width: 16, height: 16 }} /> },
]

// Mock video frame image - podcast interview with two speakers (for recordings/edits)
const MOCK_VIDEO_FRAME = './assets/51e61f406af7e9fa4c10a1bb22b4321414fddb8f.png'

// Mock stock video thumbnail - different look for uploaded videos
const MOCK_STOCK_VIDEO = '/fda5f7e20d2dbecde1b354509985b9a06a89bf03.png'

// Mock image thumbnail - different from video frames
const MOCK_IMAGE_THUMBNAIL = '/c10b25bbe9931b11b8de9598b4caef5ec85b7cb1.png'

// Seeded random for consistent waveforms
function seededRandom(s: number): number {
  const x = Math.sin(s) * 10000
  return x - Math.floor(x)
}

// Generate realistic audio peaks data for wavesurfer (values between -1 and 1)
function generateRealisticPeaks(length: number, seed: number = 0): number[] {
  const peaks: number[] = []
  
  for (let i = 0; i < length; i++) {
    const s = seed + i * 0.01
    
    // Base wave components at different frequencies for organic look
    const wave1 = Math.sin(i * 0.05 + seed) * 0.3
    const wave2 = Math.sin(i * 0.12 + seed * 2) * 0.25
    const wave3 = Math.sin(i * 0.03 + seed * 0.5) * 0.4
    const wave4 = Math.sin(i * 0.2 + seed * 3) * 0.15
    
    // Combine waves
    let amplitude = (wave1 + wave2 + wave3 + wave4 + 1) / 2
    
    // Add high-frequency noise for texture
    const noise = seededRandom(s * 100) * 0.3
    amplitude = amplitude * 0.7 + noise
    
    // Create speech-like envelope with quiet sections
    const envelopeWave = Math.sin(i * 0.008 + seed * 0.1)
    const envelope = Math.max(0.1, (envelopeWave + 1) / 2)
    amplitude *= envelope
    
    // Occasional near-silence for speech pauses
    const pauseChance = seededRandom(s * 50)
    if (pauseChance > 0.92) {
      amplitude *= 0.15
    }
    
    // Scale to wavesurfer range (-1 to 1), using absolute value for symmetric waveform
    const peak = Math.max(0.05, Math.min(0.95, amplitude))
    peaks.push(peak)
  }
  
  return peaks
}

// Generate speaker segments based on transcript timing
// Transcript timestamps converted to percentages (assuming ~3:15 total = 195 seconds)
const PODCAST_SPEAKER_SEGMENTS: [number, number, 'primary' | 'secondary'][] = [
  // Intro silence / Marcus intro
  [0.00, 0.026, 'primary'],   // 0:00 - 0:05 (silence before Marcus)
  [0.026, 0.092, 'primary'],  // 0:05 - 0:18 Marcus
  [0.092, 0.164, 'secondary'], // 0:18 - 0:32 Sarah
  [0.164, 0.231, 'primary'],  // 0:32 - 0:45 Marcus
  [0.231, 0.323, 'secondary'], // 0:45 - 1:03 Sarah (until chapter)
  [0.323, 0.349, 'primary'],  // 1:03 - 1:08 (chapter gap, Marcus)
  [0.349, 0.400, 'primary'],  // 1:05 - 1:18 Marcus
  [0.400, 0.487, 'secondary'], // 1:18 - 1:35 Sarah
  [0.487, 0.554, 'primary'],  // 1:35 - 1:48 Marcus
  [0.554, 0.667, 'secondary'], // 1:48 - 2:10 Sarah (until chapter)
  [0.667, 0.705, 'primary'],  // 2:10 - 2:17 (chapter gap, Marcus)
  [0.705, 0.785, 'primary'],  // 2:15 - 2:28 Marcus
  [0.785, 0.872, 'secondary'], // 2:28 - 2:45 Sarah
  [0.872, 0.923, 'primary'],  // 2:45 - 3:00 Marcus
  [0.923, 1.00, 'secondary'],  // 3:00+ Sarah (final segment)
]

// Generate speaker segments as [startPercent, endPercent, speaker][]
function generateSpeakerSegments(seed: number = 0): [number, number, 'primary' | 'secondary'][] {
  // Use the podcast conversation segments
  return PODCAST_SPEAKER_SEGMENTS
}

// Sample timeline sections data with realistic waveforms
const TIMELINE_SECTIONS_DATA: TimelineSectionData[] = [
  {
    id: 'section-1',
    name: 'Marcus & Sarah',
    duration: '03:15',
    startPosition: 0,
    width: 45,
    thumbnails: Array(10).fill(MOCK_VIDEO_FRAME),
    peaks: generateRealisticPeaks(2000, 42),
    speakerSegments: generateSpeakerSegments(),
    trimStart: 0,
    trimEnd: 1,
  },
  {
    id: 'section-2',
    name: 'Marcus & Sarah',
    duration: '02:30',
    startPosition: 48,
    width: 30,
    thumbnails: Array(8).fill(MOCK_VIDEO_FRAME),
    peaks: generateRealisticPeaks(1500, 123),
    speakerSegments: generateSpeakerSegments(),
    trimStart: 0,
    trimEnd: 1,
  },
]

// Sample scenes data
const TIMELINE_SCENES_DATA: SceneData[] = [
  {
    id: 'scene-1',
    label: 'Grid',
    startPosition: 0,
    width: 40,
    thumbnail: MOCK_VIDEO_FRAME,
  },
]

// Sample overlays data
const TIMELINE_OVERLAYS_DATA: OverlayData[] = [
  {
    id: 'overlay-1',
    type: 'text',
    label: 'Title Card',
    startPosition: 5,
    width: 10,
    color: '#6366F1', // Purple for text
    lane: 0,
  },
]

const TRANSCRIPT_DATA: TranscriptBlock[] = [
  { time: '00:00', speaker: 'Introduction', text: '', isChapter: true },
  {
    time: '00:05',
    speaker: 'Marcus',
    text: "Welcome back to Tech Talk Weekly! I'm Marcus, and today we're diving deep into the world of AI and how it's reshaping the creative industries.",
  },
  {
    time: '00:18',
    speaker: 'Sarah',
    text: "Thanks Marcus! I'm Sarah, and I've been researching this topic for months. The changes we're seeing are absolutely unprecedented.",
  },
  {
    time: '00:32',
    speaker: 'Marcus',
    text: "So let's start with the big question everyone's asking—are AI tools going to replace human creativity, or enhance it?",
  },
  {
    time: '00:45',
    speaker: 'Sarah',
    text: "That's the million dollar question, isn't it? From what I've seen, the most successful creators are those who view AI as a collaborator, not a replacement.",
  },
  { time: '01:02', speaker: 'The Creative Process', text: '', isChapter: true },
  {
    time: '01:05',
    speaker: 'Marcus',
    text: "I love that framing. Can you give us some concrete examples of how creators are using these tools effectively?",
  },
  {
    time: '01:18',
    speaker: 'Sarah',
    text: "Absolutely. Take video editors for instance—they're using AI to handle tedious tasks like color correction and audio cleanup, which frees them up for the actual storytelling.",
  },
  {
    time: '01:35',
    speaker: 'Marcus',
    text: "That makes total sense. I've tried some of these tools myself, and the time savings are remarkable.",
  },
  {
    time: '01:48',
    speaker: 'Sarah',
    text: "Right! And musicians are using AI to generate backing tracks or explore new chord progressions they might never have considered.",
  },
  { time: '02:10', speaker: 'Industry Impact', text: '', isChapter: true },
  {
    time: '02:15',
    speaker: 'Marcus',
    text: "Let's talk about the business side. How are studios and production companies adapting to this shift?",
  },
  {
    time: '02:28',
    speaker: 'Sarah',
    text: "It's fascinating—some are going all-in on AI workflows, while others are doubling down on the 'handcrafted' angle as a premium offering.",
  },
  {
    time: '02:45',
    speaker: 'Marcus',
    text: "There's definitely a market for both approaches. What advice would you give to someone just starting out in creative fields?",
  },
  {
    time: '03:00',
    speaker: 'Sarah',
    text: "Learn the fundamentals first, always. AI is a powerful tool, but you need to understand the craft to use it effectively. The best results come from informed direction.",
  },
]

// ============================================================================
// COMPONENTS
// ============================================================================

// Aspect Ratio Icon Helper
function AspectIcon({ type }: { type: AspectRatio['icon'] }) {
  switch (type) {
    case 'monitor':
      return <Icons.MediaDevices.Monitor01 style={{ width: 16, height: 16 }} />
    case 'square':
      return <Icons.Shapes.Square style={{ width: 16, height: 16 }} />
    case 'smartphone':
      return <Icons.MediaDevices.Phone01 style={{ width: 16, height: 16 }} />
    case 'audio':
      return <Icons.Charts.BarChart07 style={{ width: 16, height: 16 }} />
    default:
      return null
  }
}

// Waveform colors by theme
const WAVEFORM_COLORS = {
  dark: {
    primary: '#C8E842',   // Neon green
    secondary: '#E961FF', // Pink/magenta
  },
  light: {
    primary: '#28BA00',   // Green
    secondary: '#E961FF', // Pink/magenta (same)
  },
}

// WaveformTrack Component using Canvas for multi-color speaker waveforms
function WaveformTrack({ 
  peaks, 
  speakerSegments, 
  trimStart, 
  trimEnd,
  theme = 'dark'
}: { 
  peaks: number[]
  speakerSegments: [number, number, 'primary' | 'secondary'][]
  trimStart: number
  trimEnd: number
  theme?: 'light' | 'dark'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Get colors based on theme
  const colors = WAVEFORM_COLORS[theme]
  
  // Calculate trimmed peaks and speaker info
  const { trimmedPeaks, speakerColors } = useMemo(() => {
    const startIndex = Math.floor(trimStart * peaks.length)
    const endIndex = Math.floor(trimEnd * peaks.length)
    const slicedPeaks = peaks.slice(startIndex, endIndex)
    
    // Map each peak to its speaker color
    const peakColors = slicedPeaks.map((_, i) => {
      const originalIndex = startIndex + i
      const position = originalIndex / peaks.length
      
      for (const [segStart, segEnd, speaker] of speakerSegments) {
        if (position >= segStart && position < segEnd) {
          return speaker === 'primary' ? colors.primary : colors.secondary
        }
      }
      return colors.primary
    })
    
    return { trimmedPeaks: slicedPeaks, speakerColors: peakColors }
  }, [peaks, speakerSegments, trimStart, trimEnd, colors])

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      drawWaveform(canvas, trimmedPeaks, speakerColors)
    })

    resizeObserver.observe(container)
    
    // Initial draw
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    drawWaveform(canvas, trimmedPeaks, speakerColors)

    return () => resizeObserver.disconnect()
  }, [trimmedPeaks, speakerColors])

  return (
    <div ref={containerRef} className="waveform-track-container">
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  )
}

// Draw waveform on canvas with speaker colors - continuous filled wave from bottom
function drawWaveform(
  canvas: HTMLCanvasElement, 
  peaks: number[], 
  colors: string[]
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const padding = 2
  const waveHeight = height - padding
  
  ctx.clearRect(0, 0, width, height)
  
  if (peaks.length === 0) return
  
  const stepWidth = width / peaks.length
  
  // Group consecutive peaks by color for continuous fill
  let segmentStart = 0
  let currentColor = colors[0]
  
  for (let i = 0; i <= peaks.length; i++) {
    const color = colors[i]
    
    // When color changes or we reach the end, draw the segment
    if (color !== currentColor || i === peaks.length) {
      if (i > segmentStart) {
        // Draw filled wave segment
        ctx.beginPath()
        ctx.fillStyle = currentColor
        
        // Start at bottom left of segment
        const startX = segmentStart * stepWidth
        ctx.moveTo(startX, height)
        
        // Draw the wave top edge - go up to each peak then back down
        for (let j = segmentStart; j < i; j++) {
          const x = j * stepWidth
          const nextX = (j + 1) * stepWidth
          const peakHeight = peaks[j] * waveHeight * 0.95
          const y = height - peakHeight
          
          // Draw vertical line up, then across to next sample
          ctx.lineTo(x, y)
          ctx.lineTo(nextX, y)
        }
        
        // Close the path back to bottom
        const endX = i * stepWidth
        ctx.lineTo(endX, height)
        ctx.closePath()
        ctx.fill()
      }
      
      // Start new segment
      segmentStart = i
      currentColor = color
    }
  }
}

// Top Bar Component
function TopBar({
  selectedRatio,
  onRatioChange,
  theme,
  onThemeToggle,
  dragDropMethod,
  onDragDropMethodChange,
}: {
  selectedRatio: AspectRatio
  onRatioChange: (ratio: AspectRatio) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  dragDropMethod: DragDropMethod
  onDragDropMethodChange: (method: DragDropMethod) => void
}) {
  const navigate = useNavigate()
  const [showRatioMenu, setShowRatioMenu] = useState(false)
  const [showExperimentalMenu, setShowExperimentalMenu] = useState(false)

  return (
    <div className="editor-topbar">
      {/* Left: Navigation */}
      <div className="topbar-left">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <Icons.Arrows.ChevronLeft style={{ width: 20, height: 20 }} />
        </button>
        <div className="topbar-divider" />
        <button className="icon-btn">
          <Icons.Arrows.ReverseLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="icon-btn">
          <Icons.Arrows.ReverseRight style={{ width: 20, height: 20 }} />
        </button>
        <button className="icon-btn">
          <Icons.General.UploadCloud01 style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Center: Project Title & Aspect Ratio */}
      <div className="topbar-center">
        <div className="aspect-selector" onClick={() => setShowRatioMenu(!showRatioMenu)}>
          <AspectIcon type={selectedRatio.icon} />
          <span className="aspect-label">{selectedRatio.label}</span>
          {showRatioMenu && (
            <div className="aspect-menu">
              {ASPECT_RATIOS.map((ratio) => (
                <div
                  key={ratio.id}
                  className={`aspect-menu-item ${selectedRatio.id === ratio.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRatioChange(ratio)
                    setShowRatioMenu(false)
                  }}
                >
                  <AspectIcon type={ratio.icon} />
                  <div className="aspect-menu-text">
                    <span className="aspect-menu-label">{ratio.label}</span>
                    <span className="aspect-menu-sublabel">{ratio.sublabel}</span>
                  </div>
                  {selectedRatio.id === ratio.id && (
                    <Icons.General.Check style={{ width: 16, height: 16, color: 'var(--color-secondary-c100)' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="project-title">Five-Star Views & Finish Line Feels</span>
        <Icons.Arrows.ChevronDown style={{ width: 16, height: 16, color: 'var(--color-secondary-c400)' }} />
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        {/* Experimental Features Dropdown */}
        <div className="experimental-dropdown-wrapper">
          <button 
            className="experimental-dropdown-btn" 
            onClick={() => setShowExperimentalMenu(!showExperimentalMenu)}
            title="Experimental features"
          >
            <Icons.Development.CodeBrowser style={{ width: 18, height: 18 }} />
            <span>Experimental</span>
            <Icons.Arrows.ChevronDown style={{ width: 14, height: 14 }} />
          </button>
          {showExperimentalMenu && (
            <div className="experimental-menu">
              {/* Theme Toggle */}
              <div className="experimental-section">
                <span className="experimental-section-label">Theme</span>
                <div className="experimental-options">
                  <button 
                    className={`experimental-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => { onThemeToggle(); if (theme === 'light') setShowExperimentalMenu(false); }}
                  >
                    <Icons.Weather.Moon01 style={{ width: 14, height: 14 }} />
                    Dark
                  </button>
                  <button 
                    className={`experimental-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => { onThemeToggle(); if (theme === 'dark') setShowExperimentalMenu(false); }}
                  >
                    <Icons.Weather.Sun style={{ width: 14, height: 14 }} />
                    Light
                  </button>
                </div>
              </div>
              
              {/* Drag Method */}
              <div className="experimental-section">
                <span className="experimental-section-label">Drag & Drop Method</span>
                <div className="experimental-options vertical">
                  <button 
                    className={`experimental-option ${dragDropMethod === 'easiest' ? 'active' : ''}`}
                    onClick={() => { onDragDropMethodChange('easiest'); setShowExperimentalMenu(false); }}
                  >
                    1. Easiest
                    {dragDropMethod === 'easiest' && <Icons.General.Check style={{ width: 14, height: 14 }} />}
                  </button>
                  <button 
                    className={`experimental-option ${dragDropMethod === 'full' ? 'active' : ''}`}
                    onClick={() => { onDragDropMethodChange('full'); setShowExperimentalMenu(false); }}
                  >
                    2. Full
                    {dragDropMethod === 'full' && <Icons.General.Check style={{ width: 14, height: 14 }} />}
                  </button>
                  <button 
                    className={`experimental-option ${dragDropMethod === 'hybrid' ? 'active' : ''}`}
                    onClick={() => { onDragDropMethodChange('hybrid'); setShowExperimentalMenu(false); }}
                  >
                    3. Hybrid
                    {dragDropMethod === 'hybrid' && <Icons.General.Check style={{ width: 14, height: 14 }} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="feedback-btn-wrapper">
          <Button variant="ghost-36" onClick={() => {}} leftIcon={Icons.General.Heart}>
            Feedback
          </Button>
        </span>
        <Button variant="secondary-36" onClick={() => {}}>
          Share
        </Button>
        <Button variant="primary-36" onClick={() => {}}>
          Export
        </Button>
      </div>
    </div>
  )
}

// Transcript Block Component
// Primary speaker is first, secondary is second
const PRIMARY_SPEAKER = 'Marcus'
const SECONDARY_SPEAKER = 'Sarah'

function TranscriptBlockItem({ block }: { block: TranscriptBlock }) {
  const isChapter = block.isChapter || (!block.text && !!block.speaker)
  
  const getSpeakerClass = () => {
    if (isChapter) return 'chapter'
    if (block.speaker === SECONDARY_SPEAKER) return 'speaker-secondary'
    return 'speaker-primary'
  }

  return (
    <div className="transcript-block">
      <span className="transcript-time">{block.time}</span>
      <div className="transcript-content">
        {block.speaker && (
          <span className={`transcript-speaker ${getSpeakerClass()}`}>{block.speaker}</span>
        )}
        {block.text && <p className="transcript-text">{block.text}</p>}
      </div>
    </div>
  )
}

// Transcript Panel Component
function TranscriptPanel() {
  return (
    <div className="transcript-panel">
      {/* Header */}
      <div className="transcript-header">
        <div className="transcript-search">
          <Icons.General.SearchMd style={{ width: 16, height: 16, color: 'var(--color-secondary-c400)' }} />
          <input type="text" placeholder="Search" className="search-input" />
        </div>
        <div className="transcript-actions">
          <button className="icon-btn-sm">
            <Icons.General.FilterFunnel01 style={{ width: 16, height: 16 }} />
          </button>
          <button className="icon-btn-sm">
            <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="transcript-content-scroll">
        {[...TRANSCRIPT_DATA, ...TRANSCRIPT_DATA, ...TRANSCRIPT_DATA].map((block, idx) => (
          <TranscriptBlockItem key={idx} block={block} />
        ))}
      </div>
    </div>
  )
}

// Video Canvas Component
function VideoCanvas({ 
  aspectRatio,
  sections,
  overlays,
  currentTime,
  totalDuration,
}: { 
  aspectRatio: AspectRatio
  sections: TimelineSectionData[]
  overlays: OverlayData[]
  currentTime: number
  totalDuration: number
}) {
  const { isDragging, draggedItem, setDraggedItem, setDropTarget, addOverlay, addTimelineSection, canBeOverlay, canBeTimelineSection } = useDragDrop()
  const [isOver, setIsOver] = useState(false)

  // Get CSS aspect-ratio value based on selected ratio
  const getAspectRatioStyle = () => {
    switch (aspectRatio.id) {
      case '16:9':
        return '16 / 9'
      case '1:1':
        return '1 / 1'
      case '9:16':
        return '9 / 16'
      default:
        return '16 / 9'
    }
  }

  // Calculate playhead position as percentage
  const playheadPercent = (currentTime / totalDuration) * 100

  // Find the current background section (main timeline section under playhead)
  const currentSection = useMemo(() => {
    return sections.find(section => {
      const sectionEnd = section.startPosition + section.width
      return playheadPercent >= section.startPosition && playheadPercent < sectionEnd
    })
  }, [sections, playheadPercent])

  // Find active overlays (overlays that are currently visible at playhead position)
  const activeOverlays = useMemo(() => {
    return overlays.filter(overlay => {
      // Only show image and video overlays on canvas
      if (overlay.type !== 'image' && overlay.type !== 'video') return false
      const overlayEnd = overlay.startPosition + overlay.width
      return playheadPercent >= overlay.startPosition && playheadPercent < overlayEnd
    })
  }, [overlays, playheadPercent])

  // Get background image for current section
  // Show video thumbnail if section has thumbnails, otherwise show black (no section or audio section)
  const hasVideoBackground = currentSection && currentSection.thumbnails && currentSection.thumbnails.length > 0
  const backgroundImage = hasVideoBackground ? currentSection.thumbnails[0] : null

  // Check if item can be dropped on canvas (any valid media type)
  const canDropOnCanvas = draggedItem && (canBeOverlay(draggedItem.type) || canBeTimelineSection(draggedItem.type))

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggedItem) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsOver(true)
    setDropTarget('canvas')
  }

  const handleDragLeave = () => {
    setIsOver(false)
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    setDropTarget(null)
    
    if (draggedItem) {
      console.log('Media dropped on canvas:', draggedItem)
      
      // Recordings and Edits are added as inserts (timeline sections)
      if (draggedItem.type === 'recording' || draggedItem.type === 'edit') {
        addTimelineSection(draggedItem)
      }
      // Images, Videos, Audio are added as overlays
      else if (canBeOverlay(draggedItem.type)) {
        addOverlay(draggedItem)
      }
      
      setDraggedItem(null)
    }
  }

  // Show drop zone when dragging AND hovering AND item can be dropped
  const showDropZoneOnHover = isDragging && isOver && canDropOnCanvas

  return (
    <div 
      className={`video-canvas ${showDropZoneOnHover ? 'drop-zone-active drop-zone-hover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {/* Video Area */}
      <div className="canvas-area">
        {/* View Toggle */}
        <div className="canvas-toggle">
          <button className="toggle-btn active">Scenes</button>
          <button className="toggle-btn">Design</button>
        </div>
        
        <div 
          className={`video-placeholder ratio-${aspectRatio.id.replace(':', '-')} ${!backgroundImage ? 'no-content' : ''}`}
          style={{ aspectRatio: getAspectRatioStyle() }}
        >
          {/* Background - Main timeline section (full screen) */}
          {/* Show video thumbnail if available, otherwise black */}
          {backgroundImage ? (
            <img 
              src={backgroundImage} 
              alt="Video frame" 
              className="video-frame-image"
            />
          ) : (
            <div className="canvas-black-background" />
          )}
          
          {/* Overlays - Image/Video overlays (not full screen) */}
          {activeOverlays.map((overlay, index) => (
            <div 
              key={overlay.id}
              className="canvas-overlay-item"
              style={{
                // Position overlays in different spots based on index
                bottom: `${10 + (index * 5)}%`,
                right: `${5 + (index * 3)}%`,
              }}
            >
              {overlay.thumbnail ? (
                <img 
                  src={overlay.thumbnail} 
                  alt={overlay.label}
                  className="canvas-overlay-image"
                />
              ) : (
                <div 
                  className="canvas-overlay-placeholder"
                  style={{ backgroundColor: overlay.color }}
                >
                  {overlay.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zone Indicator - no text, just highlight */}
      {showDropZoneOnHover && (
        <div className={`canvas-drop-indicator ${isOver ? 'active' : ''}`} />
      )}
    </div>
  )
}

// Timeline Section Component
function TimelineSection({
  section,
  isSelected,
  onSelect,
  onDragStart,
  onTrimStart,
  theme = 'dark',
}: {
  section: TimelineSectionData
  isSelected: boolean
  onSelect: (id: string, e: React.MouseEvent) => void
  onDragStart?: (e: React.MouseEvent, id: string) => void
  onTrimStart?: (e: React.MouseEvent, id: string, handle: 'left' | 'right') => void
  theme?: 'light' | 'dark'
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on trim handles
    if ((e.target as HTMLElement).closest('.trim-handle')) return
    onSelect(section.id, e)
    onDragStart?.(e, section.id)
  }

  const handleTrimMouseDown = (e: React.MouseEvent, handle: 'left' | 'right') => {
    e.stopPropagation()
    onTrimStart?.(e, section.id, handle)
  }

  // Calculate visible portion of thumbnails based on trim
  const thumbnailLength = section.thumbnails.length
  const thumbStartIndex = Math.floor(section.trimStart * thumbnailLength)
  const thumbEndIndex = Math.ceil(section.trimEnd * thumbnailLength)
  const visibleThumbnails = section.thumbnails.slice(thumbStartIndex, thumbEndIndex)

  // Visual gap between sections (8px) - sections are logically sequential but visually separated
  const SECTION_VISUAL_GAP = 8
  
  return (
    <div
      className={`timeline-section ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        left: `${section.startPosition}%`,
        width: `calc(${section.width}% - ${SECTION_VISUAL_GAP}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Video Thumbnails Track */}
      <div className="section-thumbnails">
        {visibleThumbnails.map((thumb, i) => (
          <div key={i} className="section-thumbnail-item">
            <img src={thumb} alt={`Frame ${i + 1}`} className="section-thumbnail-img" />
          </div>
        ))}
      </div>

      {/* Audio Waveform Track using WaveSurfer.js */}
      <div className="section-waveform">
        <WaveformTrack
          peaks={section.peaks}
          speakerSegments={section.speakerSegments}
          trimStart={section.trimStart}
          trimEnd={section.trimEnd}
          theme={theme}
        />
      </div>

      {/* Labels - visible on hover or selected */}
      <div className={`section-labels ${isHovered || isSelected ? 'visible' : ''}`}>
        <span className="section-label-name">{section.name}</span>
        <span className="section-label-duration">{section.duration}</span>
      </div>

      {/* Left Trim Handle */}
      <div
        className={`trim-handle left ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'left')}
      >
        <div className="trim-handle-bar" />
      </div>

      {/* Right Trim Handle */}
      <div
        className={`trim-handle right ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'right')}
      >
        <div className="trim-handle-bar" />
      </div>

      {/* Selection Border */}
      {isSelected && <div className="section-selection-border" />}
      
      {/* Hover Border */}
      {isHovered && !isSelected && <div className="section-hover-border" />}
    </div>
  )
}

// Timeline Scene Component
function TimelineSceneClip({
  scene,
  isSelected,
  onSelect,
  onDragStart,
  onTrimStart,
}: {
  scene: SceneData
  isSelected: boolean
  onSelect: (id: string, e: React.MouseEvent) => void
  onDragStart?: (e: React.MouseEvent, id: string) => void
  onTrimStart?: (e: React.MouseEvent, id: string, handle: 'left' | 'right') => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.trim-handle')) return
    onSelect(scene.id, e)
    onDragStart?.(e, scene.id)
  }

  const handleTrimMouseDown = (e: React.MouseEvent, handle: 'left' | 'right') => {
    e.stopPropagation()
    onTrimStart?.(e, scene.id, handle)
  }

  return (
    <div
      className={`scene-clip ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        left: `${scene.startPosition}%`,
        width: `${scene.width}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      <img 
        src={scene.thumbnail} 
        alt="Scene thumbnail" 
        className="scene-thumbnail-img"
      />
      <span className="scene-label">{scene.label}</span>
      
      {/* Left Trim Handle */}
      <div
        className={`scene-trim-handle left ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'left')}
      />
      
      {/* Right Trim Handle */}
      <div
        className={`scene-trim-handle right ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'right')}
      />
      
      {/* Selection Border */}
      {isSelected && <div className="scene-selection-border" />}
      
      {/* Hover Border */}
      {isHovered && !isSelected && <div className="scene-hover-border" />}
    </div>
  )
}

// Timeline Overlay Component
function TimelineOverlayClip({
  overlay,
  isSelected,
  onSelect,
  onTrimStart,
  onLiftStart,
  isLifted,
}: {
  overlay: OverlayData
  isSelected: boolean
  onSelect: (id: string, e: React.MouseEvent) => void
  onTrimStart?: (e: React.MouseEvent, id: string, handle: 'left' | 'right') => void
  onLiftStart?: (id: string, e: React.MouseEvent) => void
  isLifted?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.overlay-trim-handle')) return
    
    // Start lifting (now the default behavior for dragging overlays)
    onSelect(overlay.id, e)
    onLiftStart?.(overlay.id, e)
  }

  const handleTrimMouseDown = (e: React.MouseEvent, handle: 'left' | 'right') => {
    e.stopPropagation()
    onTrimStart?.(e, overlay.id, handle)
  }

  // Check if this overlay should show a thumbnail
  const showThumbnail = (overlay.type === 'image' || overlay.type === 'video') && overlay.thumbnail

  return (
    <div
      className={`overlay-clip ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isLifted ? 'lifted' : ''} ${showThumbnail ? 'has-thumbnail' : ''}`}
      style={{
        left: `${overlay.startPosition}%`,
        width: `${overlay.width}%`,
        backgroundColor: showThumbnail ? 'transparent' : overlay.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Thumbnail background for image/video overlays */}
      {showThumbnail && (
        <div 
          className="overlay-thumbnail"
          style={{
            backgroundImage: `url(${overlay.thumbnail})`,
          }}
        />
      )}
      
      <span className="overlay-label">{overlay.label}</span>
      
      {/* Left Trim Handle */}
      <div
        className={`overlay-trim-handle left ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'left')}
      />
      
      {/* Right Trim Handle */}
      <div
        className={`overlay-trim-handle right ${isHovered ? 'visible' : ''}`}
        onMouseDown={(e) => handleTrimMouseDown(e, 'right')}
      />
      
      {/* Selection Border */}
      {isSelected && <div className="overlay-selection-border" />}
      
      {/* Hover Border */}
      {isHovered && !isSelected && <div className="overlay-hover-border" />}
    </div>
  )
}

// Timeline Component
function Timeline({ 
  theme = 'dark', 
  dragDropMethod,
  overlays,
  setOverlays,
  sections,
  setSections,
  currentTime,
  setCurrentTime,
  selectedIds,
  setSelectedIds,
  scrollToElementId,
  onScrollComplete,
}: { 
  theme?: 'light' | 'dark'
  dragDropMethod: DragDropMethod
  overlays: OverlayData[]
  setOverlays: React.Dispatch<React.SetStateAction<OverlayData[]>>
  sections: TimelineSectionData[]
  setSections: React.Dispatch<React.SetStateAction<TimelineSectionData[]>>
  currentTime: number
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  scrollToElementId: string | null
  onScrollComplete: () => void
}) {
  const { isDragging: isMediaDragging, draggedItem, setDraggedItem, setDropTarget, addOverlay, addTimelineSection, canBeOverlay, canBeTimelineSection } = useDragDrop()
  const [zoomLevel, setZoomLevel] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)
  const totalDuration = 45 * 60 // 45 minutes in seconds
  
  // Drop zone hover states for method 3
  const [overlayLaneHover, setOverlayLaneHover] = useState(false)
  const [mainLaneHover, setMainLaneHover] = useState(false)
  
  // Drop zone hover state for hybrid method (full timeline)
  const [hybridTimelineHover, setHybridTimelineHover] = useState(false)
  
  // State for overlay lane drag and drop (mouse-based lift and drop)
  const [liftedOverlay, setLiftedOverlay] = useState<{
    id: string
    startX: number
    startY: number
    currentX: number
    currentY: number
    originalLane: number
    originalPosition: number
  } | null>(null)
  const [overlayDropTarget, setOverlayDropTarget] = useState<{
    type: 'lane' | 'gap'
    laneIndex: number
    gapPosition?: 'above' | 'below' // For gap type: above means insert above this lane
  } | null>(null)
  const overlaysAreaRef = useRef<HTMLDivElement>(null)
  
  // Calculate how many overlay lanes we need
  const maxOverlayLane = useMemo(() => {
    if (overlays.length === 0) return 0
    return Math.max(...overlays.map(o => o.lane))
  }, [overlays])
  
  // Mouse move handler for lifted overlay
  useEffect(() => {
    if (!liftedOverlay) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setLiftedOverlay(prev => prev ? {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      } : null)
      
      // Determine drop target based on cursor position
      if (overlaysAreaRef.current && timelineLanesRef.current) {
        const areaRect = overlaysAreaRef.current.getBoundingClientRect()
        const relativeY = e.clientY - areaRect.top
        const laneHeight = 32
        const gap = 8
        const totalLanes = maxOverlayLane + 1
        
        // Calculate horizontal position change
        const lanesWidth = timelineLanesRef.current.offsetWidth
        const deltaX = e.clientX - liftedOverlay.startX
        const deltaPercent = (deltaX / lanesWidth) * 100
        const newPosition = Math.max(0, liftedOverlay.originalPosition + deltaPercent)
        
        // Update overlay position
        setOverlays(prev => prev.map(o => 
          o.id === liftedOverlay.id ? { ...o, startPosition: newPosition } : o
        ))
        
        // Check each lane and gap
        let currentY = 0
        for (let i = 0; i < totalLanes; i++) {
          // Check gap above this lane (except for first lane)
          if (i === 0 && relativeY < 0) {
            // Above first lane - gap to create new lane at top
            setOverlayDropTarget({ type: 'gap', laneIndex: 0, gapPosition: 'above' })
            return
          }
          
          // Check the lane itself
          const laneStart = currentY
          const laneEnd = laneStart + laneHeight
          
          if (relativeY >= laneStart && relativeY < laneEnd) {
            setOverlayDropTarget({ type: 'lane', laneIndex: i })
            return
          }
          
          currentY = laneEnd
          
          // Check gap after this lane
          const gapStart = currentY
          const gapEnd = gapStart + gap
          
          if (relativeY >= gapStart && relativeY < gapEnd) {
            // In the gap between lane i and lane i+1
            setOverlayDropTarget({ type: 'gap', laneIndex: i, gapPosition: 'below' })
            return
          }
          
          currentY = gapEnd
        }
        
        // Below all lanes - gap to create new lane at bottom
        if (relativeY >= currentY - gap) {
          setOverlayDropTarget({ type: 'gap', laneIndex: maxOverlayLane, gapPosition: 'below' })
          return
        }
        
        setOverlayDropTarget(null)
      }
    }
    
    const handleMouseUp = () => {
      if (liftedOverlay && overlayDropTarget) {
        if (overlayDropTarget.type === 'lane') {
          // Move to existing lane (position already updated during drag)
          setOverlays(prev => prev.map(o => 
            o.id === liftedOverlay.id ? { ...o, lane: overlayDropTarget.laneIndex } : o
          ))
        } else if (overlayDropTarget.type === 'gap') {
          if (overlayDropTarget.gapPosition === 'above' && overlayDropTarget.laneIndex === 0) {
            // Create new lane at top
            setOverlays(prev => prev.map(o => {
              if (o.id === liftedOverlay.id) {
                return { ...o, lane: 0 }
              }
              return { ...o, lane: o.lane + 1 }
            }))
          } else if (overlayDropTarget.gapPosition === 'below') {
            // Create new lane after the specified lane
            const newLane = overlayDropTarget.laneIndex + 1
            setOverlays(prev => prev.map(o => {
              if (o.id === liftedOverlay.id) {
                return { ...o, lane: newLane }
              }
              if (o.lane > overlayDropTarget.laneIndex && o.id !== liftedOverlay.id) {
                return { ...o, lane: o.lane + 1 }
              }
              return o
            }))
          }
        }
      }
      
      setLiftedOverlay(null)
      setOverlayDropTarget(null)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [liftedOverlay, overlayDropTarget, maxOverlayLane, setOverlays])
  
  // Start lifting an overlay (now the default behavior)
  const startLiftingOverlay = (overlayId: string, e: React.MouseEvent) => {
    const overlay = overlays.find(o => o.id === overlayId)
    if (!overlay) return
    
    e.preventDefault()
    e.stopPropagation()
    
    setLiftedOverlay({
      id: overlayId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      originalLane: overlay.lane,
      originalPosition: overlay.startPosition
    })
  }
  
  // Ref for measuring the timeline lanes container
  const timelineLanesRef = useRef<HTMLDivElement>(null)
  
  // Ref for the timeline lanes container (for pinch-to-zoom)
  const timelineLanesContainerRef = useRef<HTMLDivElement>(null)
  
  // Scenes state (local since we don't modify it from drag/drop)
  const [scenes, setScenes] = useState(TIMELINE_SCENES_DATA)

  // Scroll to element when scrollToElementId changes
  useEffect(() => {
    if (!scrollToElementId || !timelineLanesContainerRef.current || !timelineLanesRef.current) return
    
    // Find the element position
    let elementPosition: number | null = null
    
    // Check overlays
    const overlay = overlays.find(o => o.id === scrollToElementId)
    if (overlay) {
      elementPosition = overlay.startPosition
    }
    
    // Check sections
    const section = sections.find(s => s.id === scrollToElementId)
    if (section) {
      elementPosition = section.startPosition
    }
    
    // Check scenes
    const scene = scenes.find(s => s.id === scrollToElementId)
    if (scene) {
      elementPosition = scene.startPosition
    }
    
    if (elementPosition !== null) {
      const container = timelineLanesContainerRef.current
      const lanesWidth = timelineLanesRef.current.offsetWidth
      const containerWidth = container.offsetWidth
      
      // Calculate scroll position to center the element
      const elementPixelPosition = (elementPosition / 100) * lanesWidth
      const scrollTo = elementPixelPosition - containerWidth / 2
      
      container.scrollTo({
        left: Math.max(0, scrollTo),
        behavior: 'smooth'
      })
    }
    
    onScrollComplete()
  }, [scrollToElementId, overlays, sections, scenes, onScrollComplete])
  
  // Snapping configuration
  const SNAP_THRESHOLD_PERCENT = 0.5 // Snap threshold as percentage of timeline
  const [snapIndicatorPosition, setSnapIndicatorPosition] = useState<number | null>(null)
  
  // Track which type of element is being dragged/trimmed
  const [dragType, setDragType] = useState<'section' | 'scene' | 'overlay' | null>(null)
  
  // Marquee selection state
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
    isActive: boolean
  } | null>(null)
  
  // Drag/trim state
  const [isDragging, setIsDragging] = useState(false)
  const [isTrimming, setIsTrimming] = useState<{ id: string; handle: 'left' | 'right' } | null>(null)
  
  // Store original sections before drag/trim for ripple calculations
  const [originalSectionsBeforeDrag, setOriginalSectionsBeforeDrag] = useState<TimelineSectionData[]>([])
  
  // Playhead dragging state
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, number>>(new Map())
  const [trimStartWidth, setTrimStartWidth] = useState(0)
  const [trimStartPosition, setTrimStartPosition] = useState(0)
  const [initialTrimStart, setInitialTrimStart] = useState(0)
  const [initialTrimEnd, setInitialTrimEnd] = useState(1)

  // Handler for overlay lane drop (method 3)
  const handleOverlayLaneDragOver = (e: React.DragEvent) => {
    if (dragDropMethod !== 'full') return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setOverlayLaneHover(true)
    setDropTarget('overlay-lane')
  }

  const handleOverlayLaneDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setOverlayLaneHover(false)
    setDropTarget(null)
  }

  const handleOverlayLaneDrop = (e: React.DragEvent) => {
    if (dragDropMethod !== 'full') return
    e.preventDefault()
    e.stopPropagation()
    setOverlayLaneHover(false)
    setDropTarget(null)
    
    if (draggedItem) {
      console.log('Media dropped on overlay lane:', draggedItem)
      addOverlay(draggedItem)
      setDraggedItem(null)
    }
  }

  // Handler for main lane drop (method 3)
  const handleMainLaneDragOver = (e: React.DragEvent) => {
    if (dragDropMethod !== 'full') return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setMainLaneHover(true)
    setDropTarget('main-lane')
  }

  const handleMainLaneDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setMainLaneHover(false)
    setDropTarget(null)
  }

  const handleMainLaneDrop = (e: React.DragEvent) => {
    if (dragDropMethod !== 'full') return
    e.preventDefault()
    e.stopPropagation()
    setMainLaneHover(false)
    setDropTarget(null)
    
    if (draggedItem) {
      console.log('Media dropped on main timeline lane:', draggedItem)
      addTimelineSection(draggedItem)
      setDraggedItem(null)
    }
  }

  // Handler for hybrid method - full timeline drop (for inserts)
  const handleHybridTimelineDragOver = (e: React.DragEvent) => {
    if (dragDropMethod !== 'hybrid') return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setHybridTimelineHover(true)
    setDropTarget('timeline-full')
  }

  const handleHybridTimelineDragLeave = (e: React.DragEvent) => {
    if (dragDropMethod !== 'hybrid') return
    e.stopPropagation()
    setHybridTimelineHover(false)
    setDropTarget(null)
  }

  const handleHybridTimelineDrop = (e: React.DragEvent) => {
    if (dragDropMethod !== 'hybrid') return
    e.preventDefault()
    e.stopPropagation()
    setHybridTimelineHover(false)
    setDropTarget(null)
    
    if (draggedItem) {
      console.log('Media dropped on timeline (hybrid):', draggedItem)
      // Hybrid: Timeline only accepts insert types
      if (canBeTimelineSection(draggedItem.type)) {
        addTimelineSection(draggedItem)
      }
      // If not supported as insert, action is cancelled (do nothing)
      setDraggedItem(null)
    }
  }

  // For full method: only show drop zones when hovering over each lane AND item can be dropped there
  const itemCanBeOverlay = draggedItem ? canBeOverlay(draggedItem.type) : false
  const itemCanBeSection = draggedItem ? canBeTimelineSection(draggedItem.type) : false
  const showOverlayLaneDropZone = dragDropMethod === 'full' && isMediaDragging && overlayLaneHover && itemCanBeOverlay
  const showMainLaneDropZone = dragDropMethod === 'full' && isMediaDragging && mainLaneHover && itemCanBeSection
  
  // For hybrid method: show timeline drop zone only when hovering
  const showHybridTimelineDropZone = dragDropMethod === 'hybrid' && isMediaDragging && hybridTimelineHover
  
  // Handle element selection with shift-click support for multi-select (works for all element types)
  const handleElementSelect = useCallback((id: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Shift+click: toggle selection
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+click: add to selection
      setSelectedIds(prev => new Set(prev).add(id))
    } else {
      // Normal click: select only this item (unless already selected for drag)
      if (!selectedIds.has(id)) {
        setSelectedIds(new Set([id]))
      }
    }
  }, [selectedIds])
  
  // Helper to find element by id across all types
  const findElement = useCallback((id: string): { element: { startPosition: number; width: number; id: string }, type: 'section' | 'scene' | 'overlay' } | null => {
    const section = sections.find(s => s.id === id)
    if (section) return { element: section, type: 'section' }
    
    const scene = scenes.find(s => s.id === id)
    if (scene) return { element: scene, type: 'scene' }
    
    const overlay = overlays.find(o => o.id === id)
    if (overlay) return { element: overlay, type: 'overlay' }
    
    return null
  }, [sections, scenes, overlays])
  
  // ============================================================================
  // SEQUENTIAL TIMELINE WITH GAPS LOGIC
  // ============================================================================
  
  // Gap threshold - sections within this percentage are considered "touching"
  const GAP_THRESHOLD = 0.3
  
  // Calculate section groups (connected/sequential sections)
  // Returns array of groups, where each group is an array of section IDs in order
  const getSectionGroups = useCallback((currentSections: TimelineSectionData[]): string[][] => {
    if (currentSections.length === 0) return []
    
    // Sort sections by start position
    const sorted = [...currentSections].sort((a, b) => a.startPosition - b.startPosition)
    
    const groups: string[][] = []
    let currentGroup: string[] = [sorted[0].id]
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      
      // Check if current section is connected to previous (touching or overlapping)
      const prevEnd = prev.startPosition + prev.width
      const gap = curr.startPosition - prevEnd
      
      if (gap <= GAP_THRESHOLD) {
        // Connected - add to current group
        currentGroup.push(curr.id)
      } else {
        // Gap found - start new group
        groups.push(currentGroup)
        currentGroup = [curr.id]
      }
    }
    
    // Don't forget the last group
    groups.push(currentGroup)
    
    return groups
  }, [])
  
  // Magnetize sections within groups - make them truly sequential with no internal gaps
  const magnetizeSections = useCallback((
    currentSections: TimelineSectionData[],
    _draggedIds: Set<string> // Currently unused but kept for potential future enhancements
  ): TimelineSectionData[] => {
    if (currentSections.length === 0) return currentSections
    
    // Get the groups based on current positions
    const groups = getSectionGroups(currentSections)
    
    // Create a map for quick lookup
    const sectionMap = new Map(currentSections.map(s => [s.id, s]))
    
    // Process each group - magnetize sections within the group
    const updatedSections = new Map<string, TimelineSectionData>()
    
    for (const group of groups) {
      if (group.length === 0) continue
      
      // Get sections in this group sorted by position
      const groupSections = group
        .map(id => sectionMap.get(id)!)
        .sort((a, b) => a.startPosition - b.startPosition)
      
      // Find the anchor section for the group
      // If any dragged section is in this group, use the first section's position as anchor
      // Otherwise, keep the first section's position
      const firstSection = groupSections[0]
      let currentPosition = firstSection.startPosition
      
      // Magnetize: each section starts where the previous one ends
      for (const section of groupSections) {
        updatedSections.set(section.id, {
          ...section,
          startPosition: Math.max(0, currentPosition)
        })
        currentPosition += section.width
      }
    }
    
    // Return all sections with updated positions
    return currentSections.map(s => updatedSections.get(s.id) || s)
  }, [getSectionGroups])
  
  // Ripple delete: when sections are removed, close the gap within the same group
  // Returns sections with positions adjusted to fill the gap
  const rippleDeleteSections = useCallback((
    currentSections: TimelineSectionData[],
    deletedIds: Set<string>,
    originalSections: TimelineSectionData[]
  ): TimelineSectionData[] => {
    if (deletedIds.size === 0) return currentSections
    
    // Get groups BEFORE deletion (from original sections)
    const originalGroups = getSectionGroups(originalSections)
    
    // For each group, if any section was deleted, ripple the remaining sections
    const updatedSections = new Map<string, TimelineSectionData>()
    currentSections.forEach(s => updatedSections.set(s.id, s))
    
    for (const group of originalGroups) {
      // Find deleted sections in this group and remaining sections
      const deletedInGroup = group.filter(id => deletedIds.has(id))
      const remainingInGroup = group.filter(id => !deletedIds.has(id))
      
      if (deletedInGroup.length === 0 || remainingInGroup.length === 0) continue
      
      // Get the sections sorted by their original position
      const originalSorted = group
        .map(id => originalSections.find(s => s.id === id)!)
        .sort((a, b) => a.startPosition - b.startPosition)
      
      // Rebuild the group sequentially, skipping deleted sections
      let currentPosition = originalSorted[0].startPosition
      
      for (const origSection of originalSorted) {
        if (deletedIds.has(origSection.id)) {
          // Skip deleted section, don't advance position
          continue
        }
        
        const currentSection = updatedSections.get(origSection.id)
        if (currentSection) {
          updatedSections.set(origSection.id, {
            ...currentSection,
            startPosition: currentPosition
          })
          currentPosition += currentSection.width
        }
      }
    }
    
    return currentSections.map(s => updatedSections.get(s.id) || s)
  }, [getSectionGroups])
  
  // Ripple trim: when a section is trimmed, move sections after it within the same group
  const rippleTrimSections = useCallback((
    currentSections: TimelineSectionData[],
    trimmedId: string,
    originalSections: TimelineSectionData[],
    trimHandle: 'left' | 'right'
  ): TimelineSectionData[] => {
    // Get groups BEFORE trim
    const originalGroups = getSectionGroups(originalSections)
    
    // Find which group the trimmed section belongs to
    const groupWithTrimmed = originalGroups.find(g => g.includes(trimmedId))
    if (!groupWithTrimmed) return currentSections
    
    // Get the trimmed section (current and original)
    const currentTrimmed = currentSections.find(s => s.id === trimmedId)
    const originalTrimmed = originalSections.find(s => s.id === trimmedId)
    if (!currentTrimmed || !originalTrimmed) return currentSections
    
    // Calculate width change
    const widthDelta = currentTrimmed.width - originalTrimmed.width
    
    // If width increased or stayed same, no ripple needed
    if (widthDelta >= 0) return currentSections
    
    // Get sections in the group sorted by original position
    const groupSectionsSorted = groupWithTrimmed
      .map(id => originalSections.find(s => s.id === id)!)
      .sort((a, b) => a.startPosition - b.startPosition)
    
    // Find the index of trimmed section in the sorted group
    const trimmedIndex = groupSectionsSorted.findIndex(s => s.id === trimmedId)
    
    // Only ripple if trimming from the right (sections after should move left)
    if (trimHandle !== 'right') return currentSections
    
    // Move all sections AFTER the trimmed section by the width delta
    const updatedSections = new Map<string, TimelineSectionData>()
    currentSections.forEach(s => updatedSections.set(s.id, s))
    
    for (let i = trimmedIndex + 1; i < groupSectionsSorted.length; i++) {
      const sectionId = groupSectionsSorted[i].id
      const currentSection = updatedSections.get(sectionId)
      if (currentSection) {
        updatedSections.set(sectionId, {
          ...currentSection,
          startPosition: Math.max(0, currentSection.startPosition + widthDelta)
        })
      }
    }
    
    return currentSections.map(s => updatedSections.get(s.id) || s)
  }, [getSectionGroups])
  
  // Ripple drag: when sections are dragged out of a group, close the gap in the original group
  const rippleDragSections = useCallback((
    currentSections: TimelineSectionData[],
    draggedIds: Set<string>,
    originalSections: TimelineSectionData[]
  ): TimelineSectionData[] => {
    // Get groups BEFORE drag
    const originalGroups = getSectionGroups(originalSections)
    
    // For each original group, check if any dragged sections left a gap
    const updatedSections = new Map<string, TimelineSectionData>()
    currentSections.forEach(s => updatedSections.set(s.id, s))
    
    for (const group of originalGroups) {
      // Find dragged sections that were in this group
      const draggedInGroup = group.filter(id => draggedIds.has(id))
      const remainingInGroup = group.filter(id => !draggedIds.has(id))
      
      if (draggedInGroup.length === 0 || remainingInGroup.length === 0) continue
      
      // Check if dragged sections actually left the group (moved far enough)
      const currentGroups = getSectionGroups(currentSections)
      const draggedStillInSameGroup = draggedInGroup.some(draggedId => {
        const currentGroup = currentGroups.find(g => g.includes(draggedId))
        return currentGroup && remainingInGroup.some(id => currentGroup.includes(id))
      })
      
      // If dragged sections are still in the same group, no ripple needed for this group
      if (draggedStillInSameGroup) continue
      
      // Rebuild the remaining group sequentially
      const remainingSorted = remainingInGroup
        .map(id => updatedSections.get(id)!)
        .filter(Boolean)
        .sort((a, b) => a.startPosition - b.startPosition)
      
      if (remainingSorted.length === 0) continue
      
      // Start from the first remaining section's current position
      // (it anchors the group)
      let currentPosition = remainingSorted[0].startPosition
      
      for (const section of remainingSorted) {
        updatedSections.set(section.id, {
          ...section,
          startPosition: currentPosition
        })
        currentPosition += section.width
      }
    }
    
    return currentSections.map(s => updatedSections.get(s.id) || s)
  }, [getSectionGroups])
  
  // Check if dragged sections should create a gap or merge with another group
  const handleSectionDragEnd = useCallback((draggedIds: Set<string>, originalSections: TimelineSectionData[]) => {
    setSections(prev => {
      // First, ripple close gaps in original groups where sections were dragged out
      const rippled = rippleDragSections(prev, draggedIds, originalSections)
      // Then apply magnetization to ensure all groups are sequential
      const magnetized = magnetizeSections(rippled, draggedIds)
      return magnetized
    })
  }, [magnetizeSections, rippleDragSections])
  
  // Handle drag start - supports multi-selection drag for all element types
  const handleDragStart = useCallback((e: React.MouseEvent, id: string) => {
    const found = findElement(id)
    if (!found) return
    
    // Ensure the clicked item is selected
    let currentSelected = selectedIds
    if (!selectedIds.has(id)) {
      currentSelected = new Set([id])
      setSelectedIds(currentSelected)
    }
    
    // Store start positions for all selected items across all types
    const startPositions = new Map<string, number>()
    sections.forEach(s => {
      if (currentSelected.has(s.id)) {
        startPositions.set(s.id, s.startPosition)
      }
    })
    scenes.forEach(s => {
      if (currentSelected.has(s.id)) {
        startPositions.set(s.id, s.startPosition)
      }
    })
    overlays.forEach(o => {
      if (currentSelected.has(o.id)) {
        startPositions.set(o.id, o.startPosition)
      }
    })
    
    // Store original sections for ripple calculations
    setOriginalSectionsBeforeDrag([...sections])
    
    setIsDragging(true)
    setDragType(found.type)
    setDragStartX(e.clientX)
    setDragStartPositions(startPositions)
  }, [sections, scenes, overlays, selectedIds, findElement])
  
  // Handle trim start for all element types
  const handleTrimStart = useCallback((e: React.MouseEvent, id: string, handle: 'left' | 'right') => {
    const found = findElement(id)
    if (!found) return
    
    // Store original sections for ripple calculations
    setOriginalSectionsBeforeDrag([...sections])
    
    setIsTrimming({ id, handle })
    setDragType(found.type)
    setDragStartX(e.clientX)
    setTrimStartWidth(found.element.width)
    setTrimStartPosition(found.element.startPosition)
    
    // For sections, set trim values; for scenes/overlays, use 0 and 1
    if (found.type === 'section') {
      const section = found.element as TimelineSectionData
      setInitialTrimStart(section.trimStart)
      setInitialTrimEnd(section.trimEnd)
    } else {
      setInitialTrimStart(0)
      setInitialTrimEnd(1)
    }
  }, [findElement, sections])
  
  // Get all snap points (edges of sections, scenes, overlays, and playhead)
  const getSnapPoints = useCallback((excludeIds: Set<string>): number[] => {
    const points: number[] = []
    
    // Add section edges
    sections.forEach(section => {
      if (!excludeIds.has(section.id)) {
        points.push(section.startPosition) // Left edge
        points.push(section.startPosition + section.width) // Right edge
      }
    })
    
    // Add scene edges
    scenes.forEach(scene => {
      if (!excludeIds.has(scene.id)) {
        points.push(scene.startPosition) // Left edge
        points.push(scene.startPosition + scene.width) // Right edge
      }
    })
    
    // Add overlay edges
    overlays.forEach(overlay => {
      if (!excludeIds.has(overlay.id)) {
        points.push(overlay.startPosition) // Left edge
        points.push(overlay.startPosition + overlay.width) // Right edge
      }
    })
    
    // Add playhead position
    const playheadPercent = (currentTime / totalDuration) * 100
    points.push(playheadPercent)
    
    // Add timeline start
    points.push(0)
    
    return points
  }, [sections, scenes, overlays, currentTime, totalDuration])
  
  // Find nearest snap target within threshold
  const findSnapTarget = useCallback((position: number, snapPoints: number[]): number | null => {
    let nearestSnap: number | null = null
    let minDistance = SNAP_THRESHOLD_PERCENT
    
    for (const point of snapPoints) {
      const distance = Math.abs(position - point)
      if (distance < minDistance) {
        minDistance = distance
        nearestSnap = point
      }
    }
    
    return nearestSnap
  }, [SNAP_THRESHOLD_PERCENT])
  
  // Handle mouse move for drag/trim with snapping (supports all element types)
  useEffect(() => {
    if (!isDragging && !isTrimming) return
    
    const handleMouseMove = (e: MouseEvent) => {
      // Get actual container width from ref
      const containerWidth = timelineLanesRef.current?.offsetWidth || 1000
      const deltaX = e.clientX - dragStartX
      const deltaPercent = (deltaX / containerWidth) * 100
      
      if (isDragging && selectedIds.size > 0) {
        // Get snap points excluding selected items
        const snapPoints = getSnapPoints(selectedIds)
        let activeSnapPosition: number | null = null
        
        // Helper to update element with snapping
        const updateElementPosition = <T extends { id: string; startPosition: number; width: number }>(element: T): T => {
          if (!selectedIds.has(element.id)) return element
          
          const originalPosition = dragStartPositions.get(element.id) ?? element.startPosition
          let newPosition = Math.max(0, originalPosition + deltaPercent)
          
          // Check for snapping on left edge
          const leftSnap = findSnapTarget(newPosition, snapPoints)
          if (leftSnap !== null) {
            newPosition = leftSnap
            activeSnapPosition = leftSnap
          }
          
          // Check for snapping on right edge
          const rightEdge = newPosition + element.width
          const rightSnap = findSnapTarget(rightEdge, snapPoints)
          if (rightSnap !== null && (leftSnap === null || Math.abs(rightEdge - rightSnap) < Math.abs(newPosition - (leftSnap ?? newPosition)))) {
            newPosition = rightSnap - element.width
            activeSnapPosition = rightSnap
          }
          
          return { ...element, startPosition: Math.max(0, newPosition) }
        }
        
        // Update all element types
        setSections(prev => prev.map(updateElementPosition))
        setScenes(prev => prev.map(updateElementPosition))
        setOverlays(prev => prev.map(updateElementPosition))
        
        setSnapIndicatorPosition(activeSnapPosition)
      }
      
      if (isTrimming) {
        // Get snap points excluding the trimming item
        const snapPoints = getSnapPoints(new Set([isTrimming.id]))
        let activeSnapPosition: number | null = null
        
        // Helper for trimming elements (sections have trimStart/trimEnd, others just have width)
        const trimSection = (s: TimelineSectionData): TimelineSectionData => {
          if (s.id !== isTrimming.id) return s
          
          const currentTrimRange = initialTrimEnd - initialTrimStart
          
          if (isTrimming.handle === 'left') {
            let newPosition = Math.max(0, trimStartPosition + deltaPercent)
            const leftSnap = findSnapTarget(newPosition, snapPoints)
            if (leftSnap !== null) {
              newPosition = leftSnap
              activeSnapPosition = leftSnap
            }
            
            const positionDelta = newPosition - trimStartPosition
            const newWidth = Math.max(5, trimStartWidth - positionDelta)
            const adjustedTrimDelta = (positionDelta / trimStartWidth) * currentTrimRange
            const newTrimStart = Math.max(0, Math.min(initialTrimEnd - 0.05, initialTrimStart + adjustedTrimDelta))
            return { ...s, startPosition: newPosition, width: newWidth, trimStart: newTrimStart }
          } else {
            let newWidth = Math.max(5, trimStartWidth + deltaPercent)
            const rightEdge = s.startPosition + newWidth
            const rightSnap = findSnapTarget(rightEdge, snapPoints)
            if (rightSnap !== null) {
              newWidth = rightSnap - s.startPosition
              activeSnapPosition = rightSnap
            }
            
            const widthDelta = newWidth - trimStartWidth
            const adjustedTrimDelta = (widthDelta / trimStartWidth) * currentTrimRange
            const newTrimEnd = Math.max(initialTrimStart + 0.05, Math.min(1, initialTrimEnd + adjustedTrimDelta))
            return { ...s, width: Math.max(5, newWidth), trimEnd: newTrimEnd }
          }
        }
        
        const trimSimpleElement = <T extends { id: string; startPosition: number; width: number }>(element: T): T => {
          if (element.id !== isTrimming.id) return element
          
          if (isTrimming.handle === 'left') {
            let newPosition = Math.max(0, trimStartPosition + deltaPercent)
            const leftSnap = findSnapTarget(newPosition, snapPoints)
            if (leftSnap !== null) {
              newPosition = leftSnap
              activeSnapPosition = leftSnap
            }
            const positionDelta = newPosition - trimStartPosition
            const newWidth = Math.max(2, trimStartWidth - positionDelta)
            return { ...element, startPosition: newPosition, width: newWidth }
          } else {
            let newWidth = Math.max(2, trimStartWidth + deltaPercent)
            const rightEdge = element.startPosition + newWidth
            const rightSnap = findSnapTarget(rightEdge, snapPoints)
            if (rightSnap !== null) {
              newWidth = rightSnap - element.startPosition
              activeSnapPosition = rightSnap
            }
            return { ...element, width: Math.max(2, newWidth) }
          }
        }
        
        // Update the appropriate element type
        if (dragType === 'section') {
          setSections(prev => prev.map(trimSection))
        } else if (dragType === 'scene') {
          setScenes(prev => prev.map(trimSimpleElement))
        } else if (dragType === 'overlay') {
          setOverlays(prev => prev.map(trimSimpleElement))
        }
        
        setSnapIndicatorPosition(activeSnapPosition)
      }
    }
    
    const handleMouseUp = () => {
      // Apply sequential/magnetic behavior for sections after drag
      if (isDragging && dragType === 'section') {
        handleSectionDragEnd(selectedIds, originalSectionsBeforeDrag)
      }
      
      // Apply ripple behavior for sections after trim
      if (isTrimming && dragType === 'section') {
        setSections(prev => {
          const rippled = rippleTrimSections(prev, isTrimming.id, originalSectionsBeforeDrag, isTrimming.handle)
          // Then magnetize to ensure groups are sequential
          return magnetizeSections(rippled, new Set([isTrimming.id]))
        })
      }
      
      setIsDragging(false)
      setIsTrimming(null)
      setDragType(null)
      setSnapIndicatorPosition(null)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isTrimming, dragType, selectedIds, dragStartX, dragStartPositions, trimStartWidth, trimStartPosition, initialTrimStart, initialTrimEnd, getSnapPoints, findSnapTarget, handleSectionDragEnd, originalSectionsBeforeDrag, rippleTrimSections, magnetizeSections])
  
  // Generate timestamps for the ruler
  const generateTimestamps = () => {
    const timestamps = []
    const intervalSeconds = 60 // 1 minute intervals
    for (let i = 0; i <= Math.ceil(totalDuration / intervalSeconds); i++) {
      const seconds = i * intervalSeconds
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const displayMinutes = minutes % 60
      timestamps.push({
        time: hours > 0 ? `${hours}:${displayMinutes.toString().padStart(2, '0')}:00` : `${displayMinutes.toString().padStart(2, '0')}:00`,
        position: (seconds / totalDuration) * 100
      })
    }
    return timestamps
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle clicking on ruler to set playhead position
  const handleRulerClick = useCallback((e: React.MouseEvent) => {
    const rect = timelineLanesRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const containerWidth = rect.width
    const clickPercent = (x / containerWidth) * 100
    const newTime = (clickPercent / 100) * totalDuration
    setCurrentTime(Math.max(0, Math.min(totalDuration, newTime)))
  }, [totalDuration])
  
  // Handle playhead drag start
  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDraggingPlayhead(true)
  }, [])
  
  // Handle playhead dragging
  useEffect(() => {
    if (!isDraggingPlayhead) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineLanesRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const x = e.clientX - rect.left
      const containerWidth = rect.width
      const clickPercent = (x / containerWidth) * 100
      const newTime = (clickPercent / 100) * totalDuration
      setCurrentTime(Math.max(0, Math.min(totalDuration, newTime)))
    }
    
    const handleMouseUp = () => {
      setIsDraggingPlayhead(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingPlayhead, totalDuration])
  
  // Handle marquee selection start on empty area
  const handleLanesMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle if clicking directly on lanes container or lane-bg
    const target = e.target as HTMLElement
    if (!target.classList.contains('lane-bg') && !target.classList.contains('timeline-lanes')) return
    
    // Prevent default to avoid text selection during marquee drag
    e.preventDefault()
    
    const rect = timelineLanesRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Move playhead to click position
    const containerWidth = rect.width
    const clickPercent = (x / containerWidth) * 100
    const newTime = (clickPercent / 100) * totalDuration
    setCurrentTime(Math.max(0, Math.min(totalDuration, newTime)))
    
    // Start marquee selection
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isActive: true,
    })
    
    // Clear selection unless shift is held
    if (!e.shiftKey) {
      setSelectedIds(new Set())
    }
  }, [totalDuration])
  
  // Handle marquee selection drag
  useEffect(() => {
    if (!selectionBox?.isActive) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineLanesRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null)
      
      // Calculate selection box bounds
      const minX = Math.min(selectionBox.startX, x)
      const maxX = Math.max(selectionBox.startX, x)
      const minY = Math.min(selectionBox.startY, y)
      const maxY = Math.max(selectionBox.startY, y)
      
      // Find all elements that intersect with selection box
      const containerWidth = timelineLanesRef.current?.offsetWidth || 1000
      const newSelected = new Set<string>()
      
      // Check scenes (top lane after ruler)
      const scenesTop = 32 // After ruler
      const scenesBottom = scenesTop + 40
      scenes.forEach(scene => {
        const sceneLeft = (scene.startPosition / 100) * containerWidth
        const sceneRight = ((scene.startPosition + scene.width) / 100) * containerWidth
        if (sceneRight >= minX && sceneLeft <= maxX && scenesBottom >= minY && scenesTop <= maxY) {
          newSelected.add(scene.id)
        }
      })
      
      // Check overlays (after scenes)
      const overlaysTop = 32 + 40 + 8 // ruler + scenes + gap
      const overlaysBottom = overlaysTop + 32
      overlays.forEach(overlay => {
        const overlayLeft = (overlay.startPosition / 100) * containerWidth
        const overlayRight = ((overlay.startPosition + overlay.width) / 100) * containerWidth
        if (overlayRight >= minX && overlayLeft <= maxX && overlaysBottom >= minY && overlaysTop <= maxY) {
          newSelected.add(overlay.id)
        }
      })
      
      // Check sections (speakers lane - after overlays)
      const sectionTop = 32 + 40 + 8 + 32 + 8 // ruler + scenes + gap + overlays + gap
      const sectionBottom = sectionTop + 88
      sections.forEach(section => {
        const sectionLeft = (section.startPosition / 100) * containerWidth
        const sectionRight = ((section.startPosition + section.width) / 100) * containerWidth
        if (sectionRight >= minX && sectionLeft <= maxX && sectionBottom >= minY && sectionTop <= maxY) {
          newSelected.add(section.id)
        }
      })
      
      setSelectedIds(newSelected)
    }
    
    const handleMouseUp = () => {
      setSelectionBox(null)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectionBox, sections, scenes, overlays])
  
  // Generate unique ID for new elements
  const generateId = useCallback((prefix: string = 'element') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  // Handle split at playhead position (works for sections, scenes, and overlays)
  const handleSplit = useCallback(() => {
    if (selectedIds.size === 0) return
    
    const playheadPercent = (currentTime / totalDuration) * 100
    const newSelectedIds = new Set<string>()
    
    // Split sections
    const newSections: TimelineSectionData[] = []
    const sectionsToRemove = new Set<string>()
    
    sections.forEach(section => {
      if (!selectedIds.has(section.id)) return
      
      const sectionStart = section.startPosition
      const sectionEnd = section.startPosition + section.width
      
      if (playheadPercent > sectionStart && playheadPercent < sectionEnd) {
        sectionsToRemove.add(section.id)
        
        const splitPointInSection = (playheadPercent - sectionStart) / section.width
        const originalTrimRange = section.trimEnd - section.trimStart
        const splitTrimPoint = section.trimStart + (splitPointInSection * originalTrimRange)
        
        const leftId = generateId('section')
        const leftSection: TimelineSectionData = {
          ...section,
          id: leftId,
          width: playheadPercent - sectionStart,
          trimEnd: splitTrimPoint,
        }
        
        const rightId = generateId('section')
        const rightSection: TimelineSectionData = {
          ...section,
          id: rightId,
          startPosition: playheadPercent,
          width: sectionEnd - playheadPercent,
          trimStart: splitTrimPoint,
        }
        
        newSections.push(leftSection, rightSection)
        newSelectedIds.add(leftId)
        newSelectedIds.add(rightId)
      }
    })
    
    // Split scenes
    const newScenes: SceneData[] = []
    const scenesToRemove = new Set<string>()
    
    scenes.forEach(scene => {
      if (!selectedIds.has(scene.id)) return
      
      const sceneStart = scene.startPosition
      const sceneEnd = scene.startPosition + scene.width
      
      if (playheadPercent > sceneStart && playheadPercent < sceneEnd) {
        scenesToRemove.add(scene.id)
        
        const leftId = generateId('scene')
        const leftScene: SceneData = {
          ...scene,
          id: leftId,
          width: playheadPercent - sceneStart,
        }
        
        const rightId = generateId('scene')
        const rightScene: SceneData = {
          ...scene,
          id: rightId,
          startPosition: playheadPercent,
          width: sceneEnd - playheadPercent,
        }
        
        newScenes.push(leftScene, rightScene)
        newSelectedIds.add(leftId)
        newSelectedIds.add(rightId)
      }
    })
    
    // Split overlays
    const newOverlays: OverlayData[] = []
    const overlaysToRemove = new Set<string>()
    
    overlays.forEach(overlay => {
      if (!selectedIds.has(overlay.id)) return
      
      const overlayStart = overlay.startPosition
      const overlayEnd = overlay.startPosition + overlay.width
      
      if (playheadPercent > overlayStart && playheadPercent < overlayEnd) {
        overlaysToRemove.add(overlay.id)
        
        const leftId = generateId('overlay')
        const leftOverlay: OverlayData = {
          ...overlay,
          id: leftId,
          width: playheadPercent - overlayStart,
        }
        
        const rightId = generateId('overlay')
        const rightOverlay: OverlayData = {
          ...overlay,
          id: rightId,
          startPosition: playheadPercent,
          width: overlayEnd - playheadPercent,
        }
        
        newOverlays.push(leftOverlay, rightOverlay)
        newSelectedIds.add(leftId)
        newSelectedIds.add(rightId)
      }
    })
    
    // Apply updates
    if (sectionsToRemove.size > 0) {
      setSections(prev => [
        ...prev.filter(s => !sectionsToRemove.has(s.id)),
        ...newSections
      ])
    }
    
    if (scenesToRemove.size > 0) {
      setScenes(prev => [
        ...prev.filter(s => !scenesToRemove.has(s.id)),
        ...newScenes
      ])
    }
    
    if (overlaysToRemove.size > 0) {
      setOverlays(prev => [
        ...prev.filter(o => !overlaysToRemove.has(o.id)),
        ...newOverlays
      ])
    }
    
    if (newSelectedIds.size > 0) {
      setSelectedIds(newSelectedIds)
    }
  }, [selectedIds, currentTime, totalDuration, sections, scenes, overlays, generateId])
  
  // Clipboard state
  const [clipboard, setClipboard] = useState<TimelineSectionData[]>([])
  
  // Handle copy
  const handleCopy = useCallback(() => {
    if (selectedIds.size === 0) return
    const selectedSections = sections.filter(s => selectedIds.has(s.id))
    setClipboard(selectedSections)
  }, [selectedIds, sections])
  
  // Handle delete (works for all element types) with ripple behavior for sections
  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    
    // For sections, apply ripple delete (close gaps within groups)
    setSections(prev => {
      const originalSections = [...prev]
      const remaining = prev.filter(s => !selectedIds.has(s.id))
      // Apply ripple to close gaps within groups
      return rippleDeleteSections(remaining, selectedIds, originalSections)
    })
    
    setScenes(prev => prev.filter(s => !selectedIds.has(s.id)))
    setOverlays(prev => prev.filter(o => !selectedIds.has(o.id)))
    setSelectedIds(new Set())
  }, [selectedIds, rippleDeleteSections])
  
  // Handle cut (copy + delete)
  const handleCut = useCallback(() => {
    handleCopy()
    handleDelete()
  }, [handleCopy, handleDelete])
  
  // Handle paste at playhead
  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return
    
    const playheadPercent = (currentTime / totalDuration) * 100
    
    // Find the leftmost position in clipboard items
    const minPosition = Math.min(...clipboard.map(s => s.startPosition))
    const offset = playheadPercent - minPosition
    
    const newSections = clipboard.map(section => ({
      ...section,
      id: generateId(),
      startPosition: section.startPosition + offset,
    }))
    
    setSections(prev => [...prev, ...newSections])
    setSelectedIds(new Set(newSections.map(s => s.id)))
  }, [clipboard, currentTime, totalDuration, generateId])
  
  // Handle duplicate (copy in place with slight offset)
  const handleDuplicate = useCallback(() => {
    if (selectedIds.size === 0) return
    
    const selectedSections = sections.filter(s => selectedIds.has(s.id))
    const duplicatedSections = selectedSections.map(section => ({
      ...section,
      id: generateId('section'),
      startPosition: section.startPosition + 2, // Slight offset
    }))
    
    setSections(prev => [...prev, ...duplicatedSections])
    setSelectedIds(new Set(duplicatedSections.map(s => s.id)))
  }, [selectedIds, sections, generateId])
  
  // Handle separating audio from video in a track
  const handleSeparateAudioVideo = useCallback(() => {
    if (selectedIds.size === 0) return
    
    const selectedSections = sections.filter(s => selectedIds.has(s.id))
    if (selectedSections.length === 0) return
    
    const newOverlays: OverlayData[] = []
    const newSelectedIds = new Set<string>()
    
    selectedSections.forEach(section => {
      // Create an audio overlay for this section
      const audioId = generateId('audio-overlay')
      const audioOverlay: OverlayData = {
        id: audioId,
        type: 'audio',
        label: `${section.name} (Audio)`,
        startPosition: section.startPosition,
        width: section.width,
        color: '#10B981', // Green for audio
        lane: 0, // Add to first overlay lane
      }
      newOverlays.push(audioOverlay)
      newSelectedIds.add(section.id) // Keep original section selected
      newSelectedIds.add(audioId) // Also select the new audio overlay
    })
    
    // Add the audio overlays
    setOverlays(prev => [...prev, ...newOverlays])
    setSelectedIds(newSelectedIds)
  }, [selectedIds, sections, generateId])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      // Split: S key
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleSplit()
      }
      
      // Copy: Cmd/Ctrl + C
      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleCopy()
      }
      
      // Cut: Cmd/Ctrl + X
      if (e.key === 'x' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleCut()
      }
      
      // Paste: Cmd/Ctrl + V
      if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handlePaste()
      }
      
      // Duplicate: Cmd/Ctrl + D
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleDuplicate()
      }
      
      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDelete()
      }
      
      // Separate audio/video: E key (Extract)
      if (e.key === 'e' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleSeparateAudioVideo()
      }
      
      // Select all: Cmd/Ctrl + A
      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSelectedIds(new Set([
          ...sections.map(s => s.id),
          ...scenes.map(s => s.id),
          ...overlays.map(o => o.id)
        ]))
      }
      
      // Escape: Clear selection
      if (e.key === 'Escape') {
        setSelectedIds(new Set())
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSplit, handleCopy, handleCut, handlePaste, handleDuplicate, handleDelete, handleSeparateAudioVideo, sections, scenes, overlays])

  const timestamps = generateTimestamps()
  const playheadPosition = (currentTime / totalDuration) * 100
  
  // Pinch-to-zoom gesture handling and disable browser back gesture
  useEffect(() => {
    const container = timelineLanesContainerRef.current
    if (!container) return
    
    // Helper to calculate content width from zoom level
    const getContentWidth = (zoom: number) => container.clientWidth * (100 + zoom * 2) / 100
    
    // Handle wheel event for pinch-to-zoom (trackpad pinch triggers wheel with ctrlKey)
    const handleWheel = (e: WheelEvent) => {
      // Trackpad pinch-to-zoom triggers wheel events with ctrlKey
      if (e.ctrlKey) {
        e.preventDefault()
        
        // Get cursor position relative to container
        const containerRect = container.getBoundingClientRect()
        const cursorX = e.clientX - containerRect.left
        
        // Current scroll and content state
        const oldScrollLeft = container.scrollLeft
        const oldContentWidth = getContentWidth(zoomLevel)
        
        // Position in content that's under the cursor (as absolute pixel position)
        const cursorContentPos = oldScrollLeft + cursorX
        // As a ratio of total content width
        const cursorRatio = cursorContentPos / oldContentWidth
        
        // Calculate new zoom level
        const zoomDelta = -e.deltaY * 0.5
        const newZoom = Math.min(100, Math.max(10, zoomLevel + zoomDelta))
        
        if (newZoom !== zoomLevel) {
          // Calculate new content width and scroll position to keep cursor point stationary
          const newContentWidth = getContentWidth(newZoom)
          const newCursorContentPos = cursorRatio * newContentWidth
          const newScrollLeft = newCursorContentPos - cursorX
          
          setZoomLevel(newZoom)
          
          // Set scroll position after state update
          requestAnimationFrame(() => {
            container.scrollLeft = Math.max(0, newScrollLeft)
          })
        }
      }
    }
    
    // Handle touch events for true pinch gesture on touch devices
    let initialPinchDistance = 0
    let initialZoom = zoomLevel
    let initialScrollLeft = 0
    let pinchCenterX = 0
    let pinchCenterRatio = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy)
        initialZoom = zoomLevel
        initialScrollLeft = container.scrollLeft
        
        // Calculate pinch center relative to container
        const containerRect = container.getBoundingClientRect()
        pinchCenterX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - containerRect.left
        
        // Calculate the content position ratio at pinch center
        const oldContentWidth = getContentWidth(zoomLevel)
        const pinchContentPos = initialScrollLeft + pinchCenterX
        pinchCenterRatio = pinchContentPos / oldContentWidth
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const currentDistance = Math.sqrt(dx * dx + dy * dy)
        
        if (initialPinchDistance > 0) {
          const scale = currentDistance / initialPinchDistance
          const newZoom = Math.min(100, Math.max(10, initialZoom * scale))
          
          // Calculate new scroll position to keep pinch center stationary
          const newContentWidth = getContentWidth(newZoom)
          const newPinchContentPos = pinchCenterRatio * newContentWidth
          const newScrollLeft = newPinchContentPos - pinchCenterX
          
          setZoomLevel(newZoom)
          container.scrollLeft = Math.max(0, newScrollLeft)
        }
      }
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDistance = 0
      }
    }
    
    // Prevent browser back/forward gesture (two-finger horizontal swipe)
    const preventBrowserGesture = (e: WheelEvent) => {
      // Horizontal scroll with no ctrl key is the browser back gesture
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !e.ctrlKey) {
        // Only prevent if it looks like a swipe gesture (high deltaX, low deltaY)
        if (Math.abs(e.deltaX) > 10) {
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('wheel', preventBrowserGesture, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('wheel', preventBrowserGesture)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [zoomLevel])

  return (
    <div className="timeline">
      {/* Top Bar / Toolbar */}
      <div className="timeline-topbar">
        <div className="topbar-left-actions">
          <button className="icon-btn-toolbar" onClick={handleSplit} title="Split (S)">
            <Icons.Editor.Scissors01 style={{ width: 20, height: 20 }} />
          </button>
          <button className="icon-btn-toolbar" onClick={handleDelete} title="Delete (Del)">
            <Icons.General.Trash01 style={{ width: 20, height: 20 }} />
          </button>
          <button className="icon-btn-toolbar" onClick={handleCopy} title="Copy (Cmd+C)">
            <Icons.General.Copy01 style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="topbar-center-controls">
          <button className="speed-btn">
            1×
          </button>
          <IconButton
            variant="ghost-32"
            icon={Icons.MediaDevices.SkipBack}
            aria-label="Skip Back"
            onClick={() => {}}
            className="speed-btn"
          />
          <IconButton
            variant="round-secondary-32"
            icon={isPlaying ? Icons.MediaDevices.Pause : Icons.MediaDevices.PlayFill}
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="play-pause-btn"
          />
          <IconButton
            variant="ghost-32"
            icon={Icons.MediaDevices.SkipForward}
            aria-label="Skip Forward"
            onClick={() => {}}
            className="speed-btn"
          />
          <span>
          <span className="timecode-display">{formatTime(currentTime)}</span> / 
          <span className="timecode-display-dim">{formatTotalTime(totalDuration)}</span>
          </span>
        </div>

        <div className="topbar-right-controls">
          <button className="icon-btn-toolbar" onClick={() => setZoomLevel(Math.max(0, zoomLevel - 10))}>
            <Icons.General.MinusCircle style={{ width: 20, height: 20 }} />
          </button>
          <input
            type="range"
            min="10"
            max="100"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="zoom-slider"
          />
          <button className="icon-btn-toolbar" onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))}>
            <Icons.General.PlusCircle style={{ width: 20, height: 20 }} />
          </button>
          <button className="hide-timeline-btn">
            <Icons.Arrows.CornerDownRight style={{ width: 16, height: 16 }} />
            Hide timeline
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-body">
        {/* Left Fixed Buttons */}
        <div className="timeline-side-buttons">
          <div className="side-btn-spacer" /> {/* Spacer for ruler */}
          <div className="side-btn-spacer-small" /> {/* Spacer for scenes */}
          <div className="side-buttons-group">
            <button className="side-btn" title="Expand timeline">
              <Icons.Arrows.ChevronRight style={{ width: 20, height: 20 }} />
            </button>
            <button className="side-btn" title="Open tracks panel">
              <Icons.Layout.LayersTwo02 style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>

        {/* Timeline Lanes */}
        <div 
          ref={timelineLanesContainerRef} 
          className={`timeline-lanes-container ${showHybridTimelineDropZone ? 'hybrid-drop-zone' : ''} ${hybridTimelineHover ? 'hybrid-drop-zone-hover' : ''}`}
          onDragOver={handleHybridTimelineDragOver}
          onDragLeave={handleHybridTimelineDragLeave}
          onDrop={handleHybridTimelineDrop}
        >
          {/* Hybrid drop zone indicator - just highlight, no text */}
          {showHybridTimelineDropZone && (
            <div className={`hybrid-timeline-drop-indicator ${hybridTimelineHover ? 'active' : ''}`} />
          )}
          <div 
            ref={timelineLanesRef} 
            className="timeline-lanes" 
            style={{ width: `${100 + zoomLevel * 2}%` }}
            onMouseDown={handleLanesMouseDown}
          >
            {/* Marquee Selection Box */}
            {selectionBox && selectionBox.isActive && (
              <div 
                className="selection-marquee"
                style={{
                  left: Math.min(selectionBox.startX, selectionBox.endX),
                  top: Math.min(selectionBox.startY, selectionBox.endY),
                  width: Math.abs(selectionBox.endX - selectionBox.startX),
                  height: Math.abs(selectionBox.endY - selectionBox.startY),
                }}
              />
            )}
            
            {/* Snap Indicator */}
            {snapIndicatorPosition !== null && (
              <div 
                className="snap-indicator"
                style={{ left: `${snapIndicatorPosition}%` }}
              />
            )}
            
            {/* Playhead */}
            <div 
              className={`playhead ${isDraggingPlayhead ? 'dragging' : ''}`} 
              style={{ left: `${playheadPosition}%` }}
              onMouseDown={handlePlayheadMouseDown}
            >
              <div className="playhead-head" />
              <div className="playhead-line" />
            </div>

            {/* Ruler Lane */}
            <div className="timeline-ruler" onClick={handleRulerClick}>
              {timestamps.map((ts, i) => (
                <div key={i} className="ruler-time-unit" style={{ left: `${ts.position}%`, width: i < timestamps.length - 1 ? `${timestamps[i + 1].position - ts.position}%` : '12.5%' }}>
                  <div className="ruler-separator" />
                  <span className="ruler-time">{ts.time}</span>
                  <div className="ruler-minor-ticks">
                    {[...Array(10)].map((_, j) => (
                      <div key={j} className="ruler-minor-tick" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Scenes Lane */}
            <div className="timeline-lane scenes-lane">
              <div className="lane-bg" />
              {scenes.map((scene) => (
                <TimelineSceneClip
                  key={scene.id}
                  scene={scene}
                  isSelected={selectedIds.has(scene.id)}
                  onSelect={handleElementSelect}
                  onDragStart={handleDragStart}
                  onTrimStart={handleTrimStart}
                />
              ))}
            </div>

            {/* Overlays Area - Multiple Lanes */}
            <div className="overlays-area" ref={overlaysAreaRef}>
              {/* Render each overlay lane with gap indicators */}
              {Array.from({ length: maxOverlayLane + 1 }).map((_, laneIndex) => {
                const showGapAbove = laneIndex === 0 && liftedOverlay && overlayDropTarget?.type === 'gap' && overlayDropTarget.laneIndex === 0 && overlayDropTarget.gapPosition === 'above'
                const showGapBelow = liftedOverlay && overlayDropTarget?.type === 'gap' && overlayDropTarget.laneIndex === laneIndex && overlayDropTarget.gapPosition === 'below'
                const isLaneTarget = liftedOverlay && overlayDropTarget?.type === 'lane' && overlayDropTarget.laneIndex === laneIndex
                
                return (
                  <div key={`overlay-lane-wrapper-${laneIndex}`} className="overlay-lane-wrapper">
                    {/* Gap indicator above first lane (for creating new lane at top) */}
                    {showGapAbove && (
                      <div className="lane-gap-indicator active" />
                    )}
                    
                    {/* The lane itself */}
                    <div 
                      className={`timeline-lane overlays-lane ${
                        showOverlayLaneDropZone ? 'drop-zone-active drop-zone-hover' : ''
                      } ${isLaneTarget ? 'lane-drag-target' : ''}`}
                      onDragOver={handleOverlayLaneDragOver}
                      onDragLeave={handleOverlayLaneDragLeave}
                      onDrop={handleOverlayLaneDrop}
                    >
                      <div className="lane-bg" />
                      {overlays
                        .filter(overlay => overlay.lane === laneIndex)
                        .map((overlay) => (
                        <TimelineOverlayClip
                          key={overlay.id}
                          overlay={overlay}
                          isSelected={selectedIds.has(overlay.id)}
                          onSelect={handleElementSelect}
                          onTrimStart={handleTrimStart}
                          onLiftStart={startLiftingOverlay}
                          isLifted={liftedOverlay?.id === overlay.id}
                        />
                        ))}
                      {/* Drop indicator for overlay lane from external drag */}
                      {showOverlayLaneDropZone && (
                        <div className="lane-drop-indicator active" />
                      )}
                    </div>
                    
                    {/* Gap indicator after this lane (for creating new lane between lanes) */}
                    {showGapBelow && (
                      <div className="lane-gap-indicator active" />
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Main Speakers Lane (Storyline) */}
            <div 
              className={`timeline-lane speakers-lane ${showMainLaneDropZone ? 'drop-zone-active drop-zone-hover' : ''}`}
              onDragOver={handleMainLaneDragOver}
              onDragLeave={handleMainLaneDragLeave}
              onDrop={handleMainLaneDrop}
            >
              <div className="lane-bg" />
              {/* Timeline Sections */}
              {sections.map((section) => (
                <TimelineSection
                  key={section.id}
                  section={section}
                  isSelected={selectedIds.has(section.id)}
                  onSelect={handleElementSelect}
                  onDragStart={handleDragStart}
                  onTrimStart={handleTrimStart}
                  theme={theme}
                />
              ))}
              {/* Drop indicator for main lane - no text, just highlight */}
              {showMainLaneDropZone && (
                <div className="lane-drop-indicator active" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sidebar Item Component
function SidebarItemButton({
  item,
  active,
  onClick,
}: {
  item: SidebarItem
  active: boolean
  onClick: () => void
}) {
  return (
    <button className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
      {item.icon}
      <span className="sidebar-item-label">{item.label}</span>
    </button>
  )
}

// ============================================================================
// YOUR MEDIA PANEL
// ============================================================================

type MediaTab = 'all' | 'projects' | 'videos' | 'images' | 'audio'

// Mock data for recordings and edits
const MOCK_RECORDINGS = [
  { id: 'rec-1', name: 'Stephen, Kendall', duration: '45:33', thumbnail: MOCK_VIDEO_FRAME, type: 'Recording' as const },
  { id: 'rec-2', name: 'Stephen', duration: '45:33', thumbnail: MOCK_VIDEO_FRAME, type: 'Recording' as const },
]

const MOCK_EDITS = [
  { id: 'edit-1', name: 'Full episode 01', duration: '45:33', thumbnail: MOCK_VIDEO_FRAME, type: 'Edit' as const },
  { id: 'edit-2', name: 'Nothing Headphones On...', duration: '45:33', thumbnail: MOCK_VIDEO_FRAME, type: 'Edit' as const },
]

const MOCK_PROJECT_ITEMS = [
  { id: 'proj-1', name: 'Stephen & Kendall', duration: '52:42', thumbnail: MOCK_VIDEO_FRAME, type: 'Recording' as const },
  { id: 'proj-2', name: 'Stephen & Kendall Magic...', duration: '45:33', thumbnail: MOCK_VIDEO_FRAME, type: 'Magic episode' as const },
  { id: 'proj-3', name: 'AI Agents: Offloading Ta...', duration: '01:00', thumbnail: MOCK_VIDEO_FRAME, type: 'Magic Clip' as const },
  { id: 'proj-4', name: 'Intro v01', duration: '03:23', thumbnail: MOCK_VIDEO_FRAME, type: 'Edit' as const },
  { id: 'proj-5', name: 'The Evolution of Mobile...', duration: '00:55', thumbnail: MOCK_VIDEO_FRAME, type: 'Magic Clip' as const },
  { id: 'proj-6', name: "Crypto's Power Struggle...", duration: '00:58', thumbnail: MOCK_VIDEO_FRAME, type: 'Magic Clip' as const },
]

const MOCK_VIDEOS = [
  { id: 'vid-1', name: 'Vacation 01.mp4', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
  { id: 'vid-2', name: 'Vacation 02.mp4', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
  { id: 'vid-3', name: 'Uploaded video.mp4', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
  { id: 'vid-4', name: 'Uploaded video.mp4', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
  { id: 'vid-5', name: 'Stephen & Kendall', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
  { id: 'vid-6', name: 'Uploaded video.mp4', duration: '45:33', thumbnail: MOCK_STOCK_VIDEO },
]

const MOCK_IMAGES = [
  { id: 'img-1', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
  { id: 'img-2', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
  { id: 'img-3', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
  { id: 'img-4', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
  { id: 'img-5', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
  { id: 'img-6', name: 'Uploaded image.png', thumbnail: MOCK_IMAGE_THUMBNAIL },
]

const MOCK_AUDIO = [
  { id: 'aud-1', name: 'Intro.wav', duration: '45:33' },
  { id: 'aud-2', name: 'BG loop.mp3', duration: '45:33' },
  { id: 'aud-3', name: 'Intro.wav', duration: '45:33' },
  { id: 'aud-4', name: 'BG loop.mp3', duration: '45:33' },
  { id: 'aud-5', name: 'Intro.wav', duration: '45:33' },
  { id: 'aud-6', name: 'BG loop.mp3', duration: '45:33' },
]

// Media Item Card Component
function MediaItemCard({ 
  id,
  name, 
  duration, 
  thumbnail, 
  type,
  isAudio = false,
  mediaType = 'video',
}: { 
  id: string
  name: string
  duration?: string
  thumbnail?: string
  type?: string
  isAudio?: boolean
  mediaType?: 'video' | 'image' | 'audio' | 'recording' | 'edit'
}) {
  const { setDraggedItem, draggedItem } = useDragDrop()
  const [isDraggingThis, setIsDraggingThis] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDraggingThis(true)
    setDraggedItem({
      id,
      name,
      type: mediaType,
      thumbnail,
      duration,
    })
    // Set drag image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', id)
    }
  }

  const handleDragEnd = () => {
    setIsDraggingThis(false)
    setDraggedItem(null)
  }

  // Check if this specific item is being dragged
  const isBeingDragged = isDraggingThis && draggedItem?.id === id

  return (
    <div 
      className={`media-item-card ${isBeingDragged ? 'is-dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`media-item-thumbnail ${isAudio ? 'audio-thumbnail' : ''}`}>
        {isAudio ? (
          <div className="audio-waveform-icon">
            <Icons.MediaDevices.Recording02 style={{ width: 24, height: 24, color: 'var(--color-primary-c300)' }} />
          </div>
        ) : thumbnail ? (
          <img src={thumbnail} alt={name} draggable={false} />
        ) : (
          <div className="media-item-placeholder" />
        )}
        {duration && <span className="media-item-duration">{duration}</span>}
      </div>
      <div className="media-item-info">
        <span className="media-item-name">{name}</span>
        {type && <span className="media-item-type">{type}</span>}
      </div>
    </div>
  )
}

// Media Section Component
function MediaSection({ 
  title, 
  items, 
  onSeeAll,
  showType = false,
  isAudio = false,
  mediaType = 'video',
}: { 
  title: string
  items: Array<{ id: string; name: string; duration?: string; thumbnail?: string; type?: string }>
  onSeeAll?: () => void
  showType?: boolean
  isAudio?: boolean
  mediaType?: 'video' | 'image' | 'audio' | 'recording' | 'edit'
}) {
  return (
    <div className="media-section">
      <div className="media-section-header">
        <span className="media-section-title">{title}</span>
        {onSeeAll && (
          <button className="media-section-see-all" onClick={onSeeAll}>
            See all
          </button>
        )}
      </div>
      <div className="media-section-grid">
        {items.slice(0, 2).map((item) => (
          <MediaItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            duration={item.duration}
            thumbnail={item.thumbnail}
            type={showType ? item.type : undefined}
            isAudio={isAudio}
            mediaType={mediaType}
          />
        ))}
      </div>
    </div>
  )
}

// Dropdown Filter Button
function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="filter-dropdown">
      <span>{label}</span>
      <Icons.Arrows.ChevronDown style={{ width: 16, height: 16 }} />
    </button>
  )
}

// All Tab Content
function AllTabContent() {
  return (
    <div className="media-tab-content-all">
      <MediaSection title="Recordings" items={MOCK_RECORDINGS} onSeeAll={() => {}} showType mediaType="recording" />
      <MediaSection title="Edits" items={MOCK_EDITS} onSeeAll={() => {}} showType mediaType="edit" />
      <MediaSection title="Videos" items={MOCK_VIDEOS} onSeeAll={() => {}} mediaType="video" />
      <MediaSection title="Images" items={MOCK_IMAGES.map(img => ({ ...img, duration: '45:33' }))} onSeeAll={() => {}} mediaType="image" />
      <MediaSection title="Audio" items={MOCK_AUDIO} onSeeAll={() => {}} isAudio mediaType="audio" />
    </div>
  )
}

// Projects Tab Content
function ProjectsTabContent() {
  const getMediaType = (type: string): 'video' | 'recording' | 'edit' => {
    if (type === 'Recording') return 'recording'
    if (type === 'Edit' || type === 'Magic Clip' || type === 'Magic episode') return 'edit'
    return 'video'
  }

  return (
    <div className="media-tab-content">
      <div className="media-filters">
        <FilterDropdown label="All projects" />
        <FilterDropdown label="All files" />
      </div>
      <div className="media-grid-full">
        {MOCK_PROJECT_ITEMS.map((item) => (
          <MediaItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            duration={item.duration}
            thumbnail={item.thumbnail}
            type={item.type}
            mediaType={getMediaType(item.type)}
          />
        ))}
      </div>
    </div>
  )
}

// Videos Tab Content
function VideosTabContent() {
  return (
    <div className="media-tab-content">
      <div className="media-filters">
        <FilterDropdown label="All files" />
      </div>
      <div className="media-grid-full">
        {MOCK_VIDEOS.map((item) => (
          <MediaItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            duration={item.duration}
            thumbnail={item.thumbnail}
            mediaType="video"
          />
        ))}
      </div>
    </div>
  )
}

// Images Tab Content
function ImagesTabContent() {
  return (
    <div className="media-tab-content">
      <div className="media-filters">
        <FilterDropdown label="All files" />
      </div>
      <div className="media-grid-full">
        {MOCK_IMAGES.map((item) => (
          <MediaItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            thumbnail={item.thumbnail}
            mediaType="image"
          />
        ))}
      </div>
    </div>
  )
}

// Audio Tab Content
function AudioTabContent() {
  return (
    <div className="media-tab-content">
      <div className="media-filters">
        <FilterDropdown label="All files" />
      </div>
      <div className="media-grid-full">
        {MOCK_AUDIO.map((item) => (
          <MediaItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            duration={item.duration}
            isAudio
            mediaType="audio"
          />
        ))}
      </div>
    </div>
  )
}

// Your Media Panel Component
function YourMediaPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<MediaTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs: { id: MediaTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'projects', label: 'Projects' },
    { id: 'videos', label: 'Videos' },
    { id: 'images', label: 'Images' },
    { id: 'audio', label: 'Audio' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <AllTabContent />
      case 'projects':
        return <ProjectsTabContent />
      case 'videos':
        return <VideosTabContent />
      case 'images':
        return <ImagesTabContent />
      case 'audio':
        return <AudioTabContent />
      default:
        return <AllTabContent />
    }
  }

  return (
    <div className="sidebar-panel your-media-panel">
      {/* Header */}
      <div className="sidebar-panel-header">
        <span className="sidebar-panel-title">Your media</span>
        <button className="icon-btn-sm" onClick={onClose}>
          <Icons.General.XClose style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Upload Button */}
      <div className="your-media-upload">
        <Button variant="secondary-36" className="upload-button" leftIcon={Icons.General.UploadCloud01} onClick={() => {}}>
          Upload
        </Button>
      </div>

      {/* Search */}
      <div className="your-media-search">
        <Icons.General.SearchMd style={{ width: 16, height: 16, color: 'var(--color-secondary-c400)' }} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="your-media-search-input"
        />
      </div>

      {/* Tabs */}
      <div className="your-media-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`your-media-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="your-media-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Sidebar Panel Component
function SidebarPanel({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="sidebar-panel">
      <div className="sidebar-panel-header">
        <span className="sidebar-panel-title">{title}</span>
        <button className="icon-btn-sm" onClick={onClose}>
          <Icons.General.XClose style={{ width: 20, height: 20 }} />
        </button>
      </div>
      <div className="sidebar-panel-content">
        <span className="sidebar-panel-placeholder">{title} panel content goes here.</span>
      </div>
    </div>
  )
}

// Right Sidebar Component
function Sidebar({
  activeItem,
  onItemClick,
}: {
  activeItem: string | null
  onItemClick: (id: string) => void
}) {
  return (
    <div className="sidebar">
      {SIDEBAR_ITEMS.map((item) => (
        <SidebarItemButton
          key={item.id}
          item={item}
          active={activeItem === item.id}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  )
}

// ============================================================================
// DRAG DROP METHOD SELECTOR
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EditorPage() {
  const [transcriptWidth, setTranscriptWidth] = useState(540)
  const [isResizing, setIsResizing] = useState(false)
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(null)
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0])
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Drag and drop state
  const [dragDropMethod, setDragDropMethod] = useState<DragDropMethod>('easiest')
  const [draggedItem, setDraggedItem] = useState<DraggedMediaItem | null>(null)
  const [dropTarget, setDropTarget] = useState<'canvas' | 'overlay-lane' | 'main-lane' | 'timeline-full' | null>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  // Timeline state (lifted up for drag and drop to work)
  const [timelineOverlays, setTimelineOverlays] = useState<OverlayData[]>(TIMELINE_OVERLAYS_DATA)
  const [timelineSections, setTimelineSections] = useState<TimelineSectionData[]>(TIMELINE_SECTIONS_DATA)
  const [playheadPosition, setPlayheadPosition] = useState(15) // seconds
  const totalDuration = 45 * 60 // 45 minutes in seconds
  
  // Timeline selection state (lifted for drag and drop to select new elements)
  const [timelineSelectedIds, setTimelineSelectedIds] = useState<Set<string>>(new Set())
  
  // Track element to scroll to after adding
  const [scrollToElementId, setScrollToElementId] = useState<string | null>(null)

  // Toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast({ message, visible: true })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }, [])

  // Get overlay color based on media type
  const getOverlayColor = (type: string) => {
    switch (type) {
      case 'video': return '#8B5CF6' // Purple
      case 'image': return '#10B981' // Green
      case 'audio': return '#F59E0B' // Yellow
      case 'recording': return '#3B82F6' // Blue
      case 'edit': return '#EC4899' // Pink
      default: return '#6366F1'
    }
  }

  // Check if an item can be added as an overlay (canvas drop)
  // Text, Images, Music, Videos can be overlays
  // Recordings and Edits can ONLY go as main timeline section
  const canBeOverlay = (type: string) => {
    return type === 'video' || type === 'audio' || type === 'image' || type === 'text' || type === 'music'
  }

  // Check if an item can be added as a main timeline section (insert)
  // Music, Videos, Recordings, Edits can be inserts
  // Text and Images can ONLY be overlays
  const canBeTimelineSection = (type: string) => {
    return type === 'recording' || type === 'edit' || type === 'video' || type === 'audio' || type === 'music'
  }

  // Add an overlay at the playhead position
  const addOverlay = useCallback((item: DraggedMediaItem) => {
    // Check if this item type can be an overlay
    if (!canBeOverlay(item.type)) {
      // Recordings and Edits can only be timeline sections
      console.log(`"${item.name}" can only be added to the timeline`)
      return
    }
    
    const playheadPercent = (playheadPosition / totalDuration) * 100
    const newOverlayWidth = 8 // 8% width for new overlays
    
    // Find an available lane (one where the new overlay won't overlap with existing ones)
    const findAvailableLane = (overlays: OverlayData[], startPos: number, width: number): number => {
      const newEnd = startPos + width
      let lane = 0
      
      // Check each lane starting from 0
      while (true) {
        const overlapsInLane = overlays.some(overlay => {
          if (overlay.lane !== lane) return false
          const overlayEnd = overlay.startPosition + overlay.width
          // Check if they overlap
          return !(newEnd <= overlay.startPosition || startPos >= overlayEnd)
        })
        
        if (!overlapsInLane) {
          return lane
        }
        lane++
      }
    }
    
    const availableLane = findAvailableLane(timelineOverlays, playheadPercent, newOverlayWidth)
    
    const newOverlayId = `overlay-${Date.now()}`
    const newOverlay: OverlayData = {
      id: newOverlayId,
      type: item.type === 'audio' ? 'audio' : item.type === 'image' ? 'image' : 'video',
      label: item.name,
      startPosition: playheadPercent,
      width: newOverlayWidth,
      color: getOverlayColor(item.type),
      lane: availableLane,
      thumbnail: item.thumbnail, // Include thumbnail for image/video overlays
    }
    
    setTimelineOverlays(prev => [...prev, newOverlay])
    setTimelineSelectedIds(new Set([newOverlayId])) // Select the new overlay
    setScrollToElementId(newOverlayId) // Trigger scroll to new element
    // Move playhead to beginning of new overlay
    setPlayheadPosition((playheadPercent / 100) * totalDuration)
  }, [playheadPosition, totalDuration, timelineOverlays])

  // Gap threshold for determining if sections are connected (same as in Timeline component)
  const INSERT_GAP_THRESHOLD = 0.3
  
  // Add a timeline section at the playhead position, pushing connected sections to the right
  const addTimelineSection = useCallback((item: DraggedMediaItem) => {
    // Check if this item type can be a timeline section
    if (!canBeTimelineSection(item.type)) {
      // Images can only be overlays
      console.log(`"${item.name}" can only be added as an overlay`)
      return
    }
    
    const playheadPercent = (playheadPosition / totalDuration) * 100
    const newSectionWidth = 15 // 15% width for new sections
    
    // Sort sections by position
    const sortedSections = [...timelineSections].sort((a, b) => a.startPosition - b.startPosition)
    
    // Find where to insert the new section
    let insertPosition = playheadPercent
    
    // Check if playhead is inside an existing section - if so, insert after that section
    for (const section of sortedSections) {
      const sectionEnd = section.startPosition + section.width
      if (playheadPercent >= section.startPosition && playheadPercent < sectionEnd) {
        // Playhead is inside this section, insert after it
        insertPosition = sectionEnd
        break
      }
    }
    
    // Calculate how much to push sections
    const pushAmount = newSectionWidth
    
    // Update sections: push all connected sections to the right
    const updatedSections = timelineSections.map(section => {
      // Check if this section should be pushed
      if (section.startPosition >= insertPosition - INSERT_GAP_THRESHOLD) {
        return { ...section, startPosition: section.startPosition + pushAmount }
      }
      return section
    })
    
    // Create new section
    const newSectionId = `section-${Date.now()}`
    
    // Determine thumbnails based on media type
    const getThumbnailsForType = (type: string): string[] => {
      switch (type) {
        case 'recording':
        case 'edit':
          return Array(5).fill(MOCK_VIDEO_FRAME)
        case 'video':
          return Array(5).fill(MOCK_STOCK_VIDEO)
        case 'audio':
        case 'music':
          return [] // No thumbnails for audio - shows black on canvas
        default:
          return Array(5).fill(MOCK_VIDEO_FRAME)
      }
    }
    
    const newSection: TimelineSectionData = {
      id: newSectionId,
      name: item.name,
      duration: item.duration || '01:00',
      startPosition: insertPosition,
      width: newSectionWidth,
      thumbnails: getThumbnailsForType(item.type),
      peaks: generateRealisticPeaks(800, Date.now()),
      speakerSegments: [[0, 1, 'primary']],
      trimStart: 0,
      trimEnd: 1,
    }
    
    // Add the new section and update existing sections
    setTimelineSections([...updatedSections, newSection])
    setTimelineSelectedIds(new Set([newSectionId])) // Select the new section
    setScrollToElementId(newSectionId) // Trigger scroll to new element
    // Move playhead to beginning of new section
    setPlayheadPosition((insertPosition / 100) * totalDuration)
  }, [playheadPosition, totalDuration, timelineSections])

  // Smart add: adds based on what's available, defaults to overlay if both are possible
  const addMediaSmart = useCallback((item: DraggedMediaItem) => {
    const itemCanBeOverlay = canBeOverlay(item.type)
    const itemCanBeSection = canBeTimelineSection(item.type)
    
    if (itemCanBeOverlay) {
      // If can be overlay (videos, audio, images), add as overlay
      addOverlay(item)
    } else if (itemCanBeSection) {
      // If can only be section (recordings, edits), add to timeline
      addTimelineSection(item)
    }
  }, [addOverlay, addTimelineSection])

  const isDragging = draggedItem !== null

  // Track shift key state during drag using dragover events (more reliable than keyboard events during drag)
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      setIsShiftPressed(e.shiftKey)
    }

    if (isDragging) {
      // Use dragover on document to track shift key state
      document.addEventListener('dragover', handleDragOver)
    }

    return () => {
      document.removeEventListener('dragover', handleDragOver)
    }
  }, [isDragging])

  // Reset shift state when drag ends
  useEffect(() => {
    if (!isDragging) {
      setIsShiftPressed(false)
    }
  }, [isDragging])

  // Drag drop context value
  const dragDropContextValue: DragDropContextType = useMemo(() => ({
    method: dragDropMethod,
    setMethod: setDragDropMethod,
    draggedItem,
    setDraggedItem,
    isDragging,
    dropTarget,
    setDropTarget,
    showToast,
    addOverlay,
    addTimelineSection,
    addMediaSmart,
    canBeOverlay,
    canBeTimelineSection,
  }), [dragDropMethod, draggedItem, isDragging, dropTarget, showToast, addOverlay, addTimelineSection, addMediaSmart])

  // Handle drop for method 1 (easiest)
  const handleEasiestDrop = useCallback((shiftHeld: boolean) => {
    if (draggedItem) {
      const itemCanBeOverlay = canBeOverlay(draggedItem.type)
      const itemCanBeSection = canBeTimelineSection(draggedItem.type)
      
      // Smart handling based on what the item can be
      if (itemCanBeOverlay && itemCanBeSection) {
        // Item can be either - use shift to decide
        if (shiftHeld) {
          console.log('Media dropped to main timeline (Easiest method):', draggedItem)
          addTimelineSection(draggedItem)
        } else {
          console.log('Media dropped as overlay (Easiest method):', draggedItem)
          addOverlay(draggedItem)
        }
      } else if (itemCanBeSection) {
        // Recordings and Edits - can only be timeline sections
        console.log('Media dropped to main timeline (only option):', draggedItem)
        addTimelineSection(draggedItem)
      } else if (itemCanBeOverlay) {
        // Images - can only be overlays
        console.log('Media dropped as overlay (only option):', draggedItem)
        addOverlay(draggedItem)
      }
      
      setDraggedItem(null)
    }
  }, [draggedItem, addOverlay, addTimelineSection])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(200, Math.min(mouseMoveEvent.clientX, 800))
        setTranscriptWidth(newWidth)
      }
    },
    [isResizing]
  )

  const handleSidebarItemClick = useCallback((id: string) => {
    setActiveSidebarItem((prev) => (prev === id ? null : id))
  }, [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  return (
    <DragDropContext.Provider value={dragDropContextValue}>
      <div className={`editor-root ${theme === 'light' ? 'light-mode' : ''} ${isDragging ? 'is-dragging' : ''} drag-method-${dragDropMethod}`}>
        {/* Drag Method Selector */}
        {/* Top Bar */}
        <TopBar 
          selectedRatio={selectedRatio} 
          onRatioChange={setSelectedRatio} 
          theme={theme} 
          onThemeToggle={toggleTheme}
          dragDropMethod={dragDropMethod}
          onDragDropMethodChange={setDragDropMethod}
        />

        {/* Main Content */}
        <div className="editor-main">
          {/* Left + Center + Timeline Container */}
          <div className="editor-content">
            {/* Method 1: Easiest - Drop overlay over editor content */}
            {isDragging && dragDropMethod === 'easiest' && (() => {
              const itemCanBeOverlay = draggedItem ? canBeOverlay(draggedItem.type) : false
              const itemCanBeSection = draggedItem ? canBeTimelineSection(draggedItem.type) : false
              const canDoBoth = itemCanBeOverlay && itemCanBeSection
              
              // Determine what text to show
              let mainText = 'Add as overlay'
              let showShiftHint = false
              
              if (canDoBoth) {
                // Videos and Audio - can do both
                mainText = isShiftPressed ? 'Insert to timeline' : 'Add as overlay'
                showShiftHint = true
              } else if (itemCanBeSection) {
                // Recordings and Edits - only timeline
                mainText = 'Insert to timeline'
              } else if (itemCanBeOverlay) {
                // Images - only overlay
                mainText = 'Add as overlay'
              }
              
              return (
                <div 
                  className="drop-overlay-editor"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'copy'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleEasiestDrop(e.shiftKey)
                  }}
                >
                  <div className="drop-overlay-content">
                    {/* Media illustration */}
                    <div className="drop-overlay-illustration">
                      {/* Music card (back) */}
                      <div className="illust-card illust-card-music">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18V6.35537C9 5.87383 9 5.63306 9.0876 5.43778C9.16482 5.26565 9.28917 5.11887 9.44627 5.01424C9.62449 4.89549 9.86198 4.8568 10.337 4.77942L18.137 3.47942C18.7779 3.37247 19.0984 3.319 19.3482 3.40852C19.5674 3.4869 19.7511 3.6393 19.8686 3.8394C20.0018 4.06781 20.0018 4.39294 20.0018 5.04319V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM20 16C20 17.6569 18.6569 19 17 19C15.3431 19 14 17.6569 14 16C14 14.3431 15.3431 13 17 13C18.6569 13 20 14.3431 20 16Z" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {/* Image card (middle, rotated) */}
                      <div className="illust-card illust-card-image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 9V19.4C21 19.9601 21 20.2401 20.891 20.454C20.7951 20.6422 20.6422 20.7951 20.454 20.891C20.2401 21 19.9601 21 19.4 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V4.6C3 4.03995 3 3.75992 3.10899 3.54601C3.20487 3.35785 3.35785 3.20487 3.54601 3.10899C3.75992 3 4.03995 3 4.6 3H15M21 9L15 3M21 9H15.6C15.0399 9 14.7599 9 14.546 8.89101C14.3578 8.79513 14.2049 8.64215 14.109 8.45399C14 8.24008 14 7.96005 14 7.4V3M9 11.5C9 12.3284 8.32843 13 7.5 13C6.67157 13 6 12.3284 6 11.5C6 10.6716 6.67157 10 7.5 10C8.32843 10 9 10.6716 9 11.5ZM14.3636 14.5455L9.17469 19.7344C8.85295 20.0562 8.69208 20.217 8.5145 20.2709C8.35903 20.3181 8.19242 20.3115 8.04115 20.2522C7.86881 20.1846 7.71881 20.0123 7.41881 19.6677L5 17M14.3636 14.5455C14.6831 14.226 14.8428 14.0662 15.0283 14.008C15.1912 13.9566 15.3667 13.9611 15.5266 14.0208C15.7086 14.0887 15.8592 14.2567 16.1605 14.5928L19 17.7344L14.3636 14.5455Z" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {/* Video card (front, rotated opposite) */}
                      <div className="illust-card illust-card-video">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.5 8.96533C9.5 8.48805 9.5 8.24941 9.59974 8.11618C9.68666 8.00007 9.81971 7.92744 9.96438 7.9171C10.1304 7.90525 10.3311 8.03429 10.7326 8.29239L15.4532 11.3271C15.8016 11.551 15.9758 11.663 16.0359 11.8054C16.0885 11.9298 16.0885 12.0702 16.0359 12.1946C15.9758 12.337 15.8016 12.449 15.4532 12.6729L10.7326 15.7076C10.3311 15.9657 10.1304 16.0948 9.96438 16.0829C9.81971 16.0726 9.68666 15.9999 9.59974 15.8838C9.5 15.7506 9.5 15.512 9.5 15.0347V8.96533Z" fill="#FAFAFA" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span className="drop-overlay-text">
                      {mainText}
                    </span>
                    {showShiftHint && (
                      <div className="drop-overlay-hint">
                        <span>Hold</span>
                        <span className={`drop-overlay-key ${isShiftPressed ? 'active' : ''}`}>shift ⇧</span>
                        <span>to insert to timeline</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
            {/* Middle Area */}
            <div className={`editor-middle ${selectedRatio.id === 'audio' ? 'audio-only-mode' : ''}`}>
              {/* Transcript */}
              <div 
                className="transcript-wrapper" 
                style={{ width: selectedRatio.id === 'audio' ? '100%' : `${transcriptWidth}px` }}
              >
                <TranscriptPanel />
              </div>

              {/* Resizer - hidden in audio only mode */}
              {selectedRatio.id !== 'audio' && (
                <div
                  className={`resizer ${isResizing ? 'active' : ''}`}
                  onMouseDown={startResizing}
                />
              )}

              {/* Canvas - hidden in audio only mode */}
              {selectedRatio.id !== 'audio' && (
                <div className="canvas-wrapper">
                  <VideoCanvas 
                    aspectRatio={selectedRatio}
                    sections={timelineSections}
                    overlays={timelineOverlays}
                    currentTime={playheadPosition}
                    totalDuration={totalDuration}
                  />
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline-wrapper">
              <Timeline 
                theme={theme} 
                dragDropMethod={dragDropMethod}
                overlays={timelineOverlays}
                setOverlays={setTimelineOverlays}
                sections={timelineSections}
                setSections={setTimelineSections}
                currentTime={playheadPosition}
                setCurrentTime={setPlayheadPosition}
                selectedIds={timelineSelectedIds}
                setSelectedIds={setTimelineSelectedIds}
                scrollToElementId={scrollToElementId}
                onScrollComplete={() => setScrollToElementId(null)}
              />
            </div>
          </div>

          {/* Sidebar Panel */}
          {activeSidebarItem && (
            activeSidebarItem === 'your-media' ? (
              <YourMediaPanel onClose={() => setActiveSidebarItem(null)} />
            ) : (
              <SidebarPanel
                title={SIDEBAR_ITEMS.find((i) => i.id === activeSidebarItem)?.label || ''}
                onClose={() => setActiveSidebarItem(null)}
              />
            )
          )}

          {/* Right Sidebar */}
          <div className="sidebar-wrapper">
            <Sidebar activeItem={activeSidebarItem} onItemClick={handleSidebarItemClick} />
          </div>
        </div>

        {/* Toast Notification */}
        <div className={`toast-notification ${toast.visible ? 'visible' : ''}`}>
          <Icons.General.Check style={{ width: 16, height: 16 }} />
          <span>{toast.message}</span>
        </div>

      <style>{`
        /* ================================================================
           ROOT LAYOUT
           ================================================================ */
        .editor-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--color-secondary-c1100);
          overflow: hidden;
          position: fixed;
          inset: 0;
          
          /* Speaker colors matching waveform colors */
          --speaker-primary: #C8E842;
          --speaker-secondary: #E961FF;
        }

        /* ================================================================
           TOP BAR
           ================================================================ */
        .editor-topbar {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: var(--color-secondary-c1100);
          flex-shrink: 0;
        }

        .topbar-left,
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Experimental Features Dropdown */
        .experimental-dropdown-wrapper {
          position: relative;
          margin-right: 8px;
        }

        .experimental-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--color-secondary-c800);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 8px;
          color: var(--color-secondary-c200);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .experimental-dropdown-btn:hover {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
        }

        .experimental-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .experimental-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .experimental-section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-secondary-c400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .experimental-options {
          display: flex;
          gap: 4px;
        }

        .experimental-options.vertical {
          flex-direction: column;
        }

        .experimental-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding: 8px 12px;
          background: var(--color-secondary-c800);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 6px;
          color: var(--color-secondary-c300);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
        }

        .experimental-option:hover {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
        }

        .experimental-option.active {
          background: var(--color-p20-c600);
          border-color: var(--color-p20-c500);
          color: white;
        }

        .experimental-options.vertical .experimental-option {
          justify-content: flex-start;
        }

        .experimental-options.vertical .experimental-option.active {
          justify-content: space-between;
        }

        .topbar-divider {
          width: 1px;
          height: 24px;
          background: var(--color-secondary-c700);
          margin: 0 8px;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c100);
          cursor: pointer;
          transition: background 0.15s;
        }

        .icon-btn:hover {
          background: var(--color-secondary-c800);
        }

        .icon-btn-sm {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.15s;
        }

        .icon-btn-sm:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c100);
        }

        .topbar-center {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: center;
        }

        .aspect-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--color-secondary-c900);
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          position: relative;
          color: var(--color-secondary-c100);
          transition: background 0.15s;
        }

        .aspect-selector:hover {
          background: var(--color-secondary-c800);
        }

        .aspect-label {
          font: var(--font-label-small);
          font-weight: 500;
        }

        .aspect-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 8px;
          min-width: 240px;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .aspect-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .aspect-menu-item:hover {
          background: var(--color-secondary-c800);
        }

        .aspect-menu-item.selected {
          background: var(--color-secondary-c800);
        }

        .aspect-menu-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .aspect-menu-label {
          font: var(--font-body-medium);
          font-weight: 500;
          color: var(--color-secondary-c100);
        }

        .aspect-menu-sublabel {
          font: var(--font-helper);
          color: var(--color-secondary-c400);
        }

        .project-title {
          font: var(--font-body-medium);
          font-weight: 600;
          color: var(--color-secondary-c100);
        }

        /* ================================================================
           MAIN LAYOUT
           ================================================================ */
        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .editor-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .editor-middle {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ================================================================
           TRANSCRIPT PANEL
           ================================================================ */
        .transcript-wrapper {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .transcript-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-left: 8px;
          background: var(--color-secondary-c1000);
          border-radius: 12px 0 0 0;
          border-left: 1px solid var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c800);
        }

        .transcript-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 12px;
        }

        .transcript-search {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
          width: 100%;
        }

        .search-input::placeholder {
          color: var(--color-secondary-c400);
        }

        .transcript-actions {
          display: flex;
          gap: 4px;
        }

        .transcript-content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 20px;
        }

        .transcript-content-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .transcript-content-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .transcript-content-scroll::-webkit-scrollbar-thumb {
          background: var(--color-secondary-c700);
          border-radius: 2px;
        }

        .transcript-block {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .transcript-time {
          font: var(--font-label-small);
          color: var(--color-secondary-c400);
          width: 40px;
          flex-shrink: 0;
        }

        .transcript-content {
          display: flex;
          flex-direction: column;
        }

        .transcript-speaker {
          font: var(--font-label-small);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .transcript-speaker.chapter {
          color: var(--color-secondary-c100);
        }

        .transcript-speaker.speaker-primary {
          color: var(--speaker-primary);
        }

        .transcript-speaker.speaker-secondary {
          color: var(--speaker-secondary);
        }

        .transcript-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
          line-height: 24px;
          margin: 0;
        }

        /* ================================================================
           RESIZER
           ================================================================ */
        .resizer {
          width: 1px;
          cursor: col-resize;
          background: var(--color-secondary-c800);
          transition: background 0.2s;
          z-index: 1;
        }

        .resizer:hover,
        .resizer.active {
          background: var(--color-primary-c800);
        }

        /* ================================================================
           VIDEO CANVAS
           ================================================================ */
        .canvas-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .video-canvas {
          display: flex;
          flex-direction: column;
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .canvas-toggle {
          z-index: 10;
          display: flex;
          background: var(--color-secondary-c900);
          border-radius: 8px;
          padding: 4px;
        }

        .toggle-btn {
          padding: 6px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font: var(--font-label-small);
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: all 0.15s;
        }

        .toggle-btn:hover {
          color: var(--color-secondary-c200);
        }

        .toggle-btn.active {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c100);
        }

        .canvas-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary-c1000);
          border-radius: 0 12px 0 0;
          border-right: 1px solid var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c800);
          padding: 56px 32px;
          overflow: hidden;
          min-height: 0;
        }

        .video-placeholder {
          width: auto;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          background: var(--color-black);
          border-radius: 0;
          overflow: hidden;
          position: relative;
          flex-shrink: 1;
          /* aspect-ratio is set via inline style - width will be calculated from height */
        }

        /* Aspect ratio specific max-width constraints */
        .video-placeholder.ratio-16-9 {
          max-width: min(800px, 100%);
        }

        .video-placeholder.ratio-1-1 {
          max-width: min(600px, 100%);
        }

        .video-placeholder.ratio-9-16 {
          max-width: min(400px, 100%);
        }

        .video-frame-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Black background when no video content or audio-only */
        .canvas-black-background {
          width: 100%;
          height: 100%;
          background: #000000;
        }

        .video-placeholder.no-content {
          background: #000000;
        }

        /* Canvas overlay items (image/video overlays) */
        .canvas-overlay-item {
          position: absolute;
          width: 30%;
          max-width: 200px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: transform 0.2s ease;
        }

        .canvas-overlay-item:hover {
          transform: scale(1.02);
        }

        .canvas-overlay-image {
          width: 100%;
          height: auto;
          display: block;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .canvas-overlay-placeholder {
          width: 100%;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        /* Audio only mode - transcript takes full width */
        .editor-middle.audio-only-mode {
          flex-direction: column;
        }

        .editor-middle.audio-only-mode .transcript-wrapper {
          flex: 1;
        }

        .editor-middle.audio-only-mode .transcript-panel {
          border-radius: 12px 12px 0 0;
          border-right: 1px solid var(--color-secondary-c800);
        }

        /* ================================================================
           TIMELINE
           ================================================================ */
        .timeline-wrapper {
          min-height: 296px;
          border-top: 1px solid var(--color-secondary-c800);
          margin-left: 8px;
          flex-shrink: 0;
          border-left: 1px solid var(--color-secondary-c800);
          border-right: 1px solid var(--color-secondary-c800);
        }

        .timeline {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          background: var(--color-secondary-c1000);
          position: relative;
        }

        /* Timeline Top Bar */
        .timeline-topbar {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
          background: var(--color-secondary-c1000);
          border-bottom: 1px solid var(--color-secondary-c800);
        }

        .topbar-left-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn-toolbar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.15s;
        }

        .icon-btn-toolbar:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c100);
        }

        .topbar-center-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .speed-btn {
          padding: 4px 4px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 4px;
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c100);
          cursor: pointer;
          transition: background 0.15s;
          border-radius: 8px;
        }

        .speed-btn:hover {
          background: var(--color-secondary-c800);
        }

        .skip-btn {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.15s;
        }

        .skip-btn:hover {
          color: var(--color-secondary-c100);
        }

        .skip-label {
          position: absolute;
          font: var(--font-tiny-label);
          font-size: 8px;
          color: var(--color-secondary-c300);
        }

        .topbar-center-controls .icon-button--icon {
          width: 16px;
          height: 16px;
        }

        .play-pause-btn {
          width: 32px;
          height: 32px;
          padding-right: 5px;
        }

        .play-pause-btn .icon-button--icon {
          width: 12px;
          height: 12px;
        }

        .timecode-display {
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c100);
          font-variant-numeric: tabular-nums;
          margin-left: 8px;
        }

        .timecode-display-dim {
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c300);
          font-variant-numeric: tabular-nums;
          margin-left: 8px;
        }

        .topbar-right-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zoom-slider {
          width: 120px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--color-secondary-c700);
          border-radius: 2px;
          outline: none;
        }

        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-secondary-c100);
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.15s;
        }

        .zoom-slider::-webkit-slider-thumb:hover {
          background: var(--color-secondary-c200);
        }

        .hide-timeline-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font: var(--font-label-small);
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.15s;
        }

        .hide-timeline-btn:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c100);
        }

        /* Timeline Body */
        .timeline-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Side Buttons */
        .timeline-side-buttons {
          width: 48px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 0 8px;
          background: var(--color-secondary-c1000);
        }

        .side-btn-spacer {
          height: 32px; /* Ruler height */
          flex-shrink: 0;
        }

        .side-btn-spacer-small {
          height: 88px; /* Scenes (40px) + gap (8px) + Overlays (32px) + gap (8px) */
          flex-shrink: 0;
        }

        .side-buttons-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .side-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: all 0.15s;
        }

        .side-btn:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c100);
        }

        /* Timeline Lanes Container */
        .timeline-lanes-container {
          flex: 1;
          overflow-x: auto;
          overflow-y: visible;
          position: relative;
          /* Prevent browser back/forward gesture on overscroll */
          overscroll-behavior-x: contain;
          /* Allow pan and pinch-zoom touch gestures but prevent browser navigation */
          touch-action: pan-x pan-y;
          min-height: 0;
          /* Prevent text selection during marquee drag */
          user-select: none;
          -webkit-user-select: none;
        }

        /* Hybrid method timeline drop zone */
        .timeline-lanes-container.hybrid-drop-zone {
          position: relative;
        }

        .hybrid-timeline-drop-indicator {
          position: absolute;
          inset: 0;
          border: 2px solid var(--color-p20-c300, #A855F7);
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
          background: rgba(168, 85, 247, 0.05);
          transition: background 0.15s, border-color 0.15s;
        }

        .hybrid-timeline-drop-indicator.active {
          background: rgba(168, 85, 247, 0.1);
          border-color: var(--color-p20-c400, #9333EA);
        }

        .timeline-lanes-container::-webkit-scrollbar {
          height: 8px;
        }

        .timeline-lanes-container::-webkit-scrollbar-track {
          background: var(--color-secondary-c900);
        }

        .timeline-lanes-container::-webkit-scrollbar-thumb {
          background: var(--color-secondary-c700);
          border-radius: 4px;
        }

        .timeline-lanes {
          min-width: 100%;
          min-height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 8px;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Playhead */
        .playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 20px;
          margin-left: -10px;
          z-index: 20;
          pointer-events: auto;
          cursor: ew-resize;
        }

        .playhead-head {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 14px;
          background: var(--color-secondary-c100);
          clip-path: polygon(
            3px 0%, 
            calc(100% - 3px) 0%, 
            100% 3px, 
            100% 30%, 
            50% 100%, 
            0% 30%, 
            0% 3px
          );
        }

        .playhead:hover .playhead-head,
        .playhead.dragging .playhead-head {
          background: #FFFFFF;
        }

        .playhead-line {
          position: absolute;
          top: 18px;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          background: var(--color-secondary-c100);
        }

        .playhead:hover .playhead-line,
        .playhead.dragging .playhead-line {
          background: #FFFFFF;
        }

        /* Ruler */
        .timeline-ruler {
          height: 32px;
          position: relative;
          flex-shrink: 0;
          background: var(--color-secondary-c1000);
          display: flex;
          padding-top: 8px;
          cursor: pointer;
        }

        .ruler-time-unit {
          position: absolute;
          top: 8px;
          height: 24px;
          display: flex;
          align-items: flex-start;
          overflow: hidden;
        }

        .ruler-separator {
          width: 1px;
          height: 16px;
          background: var(--color-secondary-c500);
          border-radius: 100px;
          flex-shrink: 0;
        }

        .ruler-time {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 10px;
          line-height: 16px;
          letter-spacing: 0.2px;
          color: var(--color-secondary-c500);
          padding-left: 8px;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .ruler-minor-ticks {
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
        }

        .ruler-minor-tick {
          width: 1px;
          height: 3px;
          background: var(--color-secondary-c500);
        }

        /* Lane Shared Styles */
        .timeline-lane {
          position: relative;
          flex-shrink: 0;
        }

        .timeline-lane:hover .lane-bg {
          background: rgba(250, 250, 250, 0.03);
        }

        .lane-bg {
          position: absolute;
          inset: 0;
          background: #191919;
          transition: background 0.15s ease;
        }

        .lane-bg::after {
          content: '';
          position: absolute;
          inset: 0;
        }

        /* Scenes Lane */
        .scenes-lane {
          height: 40px;
        }

        .scene-clip {
          position: absolute;
          top: 0;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 2px 8px;
          background: var(--color-secondary-c900);
          border-radius: 4px;
          z-index: 1;
        }

        .scene-thumbnail {
          width: 56px;
          height: 32px;
          background: var(--color-secondary-c700);
          border-radius: 3px;
          flex-shrink: 0;
        }

        .scene-thumbnail-img {
          width: 56px;
          height: 32px;
          object-fit: cover;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .scene-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          line-height: 16px;
          color: var(--color-secondary-c200);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scene-clip {
          cursor: grab;
          user-select: none;
          transition: background 0.15s, box-shadow 0.15s;
        }

        .scene-clip:active {
          cursor: grabbing;
        }

        .scene-clip.hovered,
        .scene-clip:hover {
          z-index: 2;
          outline: 2px solid var(--color-secondary-c500);
          outline-offset: 2px;
        }

        .scene-clip.selected {
          z-index: 2;
          outline: 2px solid var(--color-primary-c700);
          outline-offset: 2px;
        }

        .scene-trim-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 8px;
          opacity: 0;
          transition: opacity 0.15s ease;
          cursor: ew-resize;
          z-index: 20;
          background: rgba(19, 19, 19, 0.5);
        }

        .scene-trim-handle.left {
          left: 0;
          border-radius: 4px 0 0 4px;
        }

        .scene-trim-handle.right {
          right: 0;
          border-radius: 0 4px 4px 0;
        }

        .scene-trim-handle.visible {
          opacity: 1;
        }

        .scene-selection-border {
          
        }

        .scene-hover-border {
          
        }

        /* Overlays Area - Container for multiple overlay lanes */
        .overlays-area {
          display: flex;
          flex-direction: column;
          position: relative;
          gap: 8px;
        }

        .overlay-lane-wrapper {
          display: flex;
          flex-direction: column;
        }

        /* Overlays Lane */
        .overlays-lane {
          height: 32px;
          flex-shrink: 0;
          position: relative;
        }

        /* Ensure lane background covers full area for drag events */
        .overlays-lane .lane-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .overlays-lane.lane-drag-target {
          background: rgba(168, 85, 247, 0.15);
          outline: 2px solid var(--color-p20-c600, #9333EA);
          outline-offset: -2px;
          border-radius: 4px;
        }

        /* Lane gap indicator - shows as 1px line in the 8px gap when hovering */
        .lane-gap-indicator {
          height: 1px;
          background: var(--color-p20-c600, #9333EA);
          margin: -4px 0; /* Center in the 8px gap */
          position: relative;
          z-index: 10;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
        }

        .lane-gap-indicator.active {
          height: 2px;
          margin: -5px 0;
        }

        /* Lifted overlay style (when being moved) */
        .overlay-clip.lifted {
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          cursor: grabbing;
        }

        .overlay-clip {
          position: absolute;
          top: 2px;
          bottom: 2px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          border-radius: 4px;
          z-index: 1;
          cursor: grab;
          user-select: none;
          transition: background 0.15s, box-shadow 0.15s;
          overflow: hidden;
        }

        .overlay-clip.has-thumbnail {
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .overlay-thumbnail {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: repeat-x;
          z-index: 0;
        }

        .overlay-clip.has-thumbnail .overlay-label {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .overlay-clip:active {
          cursor: grabbing;
        }

        .overlay-clip.hovered,
        .overlay-clip:hover {
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        .overlay-clip.selected {
          z-index: 2;
          outline: 2px solid var(--color-p20-c600, #9333EA);
          outline-offset: 2px;
        }

        .overlay-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          line-height: 14px;
          color: var(--color-secondary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .overlay-trim-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 6px;
          opacity: 0;
          transition: opacity 0.15s ease;
          cursor: ew-resize;
          z-index: 20;
          background: rgba(255, 255, 255, 0.3);
        }

        .overlay-trim-handle.left {
          left: 0;
          border-radius: 4px 0 0 4px;
        }

        .overlay-trim-handle.right {
          right: 0;
          border-radius: 0 4px 4px 0;
        }

        .overlay-trim-handle.visible {
          opacity: 1;
        }

        .overlay-selection-border {
          position: absolute;
          inset: -2px;
          border: 1.5px solid var(--color-primary-c800);
          border-radius: 6px;
          pointer-events: none;
        }

        .overlay-hover-border {
          position: absolute;
          inset: -1px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 5px;
          pointer-events: none;
        }

        /* Speakers Lane (Storyline) */
        .speakers-lane {
          height: 88px;
        }

        .storyline-clip {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          right: 0;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          overflow: hidden;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .video-thumbnails-track {
          position: relative;
          height: 40px;
          display: flex;
          z-index: 1;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .video-thumbnail-item {
          flex: 1;
          min-width: 60px;
          overflow: hidden;
          position: relative;
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .audio-waveform-track {
          position: relative;
          height: 40px;
          flex-shrink: 0;
          z-index: 1;
          overflow: hidden;
          border-radius: 0 0 8px 8px;
        }

        .waveform-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          gap: 1px;
          padding: 4px 0;
        }

        .waveform-bar {
          flex: 1;
          min-width: 2px;
          max-width: 4px;
          border-radius: 1px;
          transition: background 0.1s;
        }

        .waveform-bar.yellow {
          background: #C8E842;
        }

        .waveform-bar.magenta {
          background: #E961FF;
        }

        /* ================================================================
           TIMELINE SECTION COMPONENT
           ================================================================ */
        .timeline-section {
          position: absolute;
          top: 4px;
          bottom: 4px;
          background: var(--color-secondary-c900);
          border-radius: 8px;
          overflow: hidden;
          z-index: 1;
          display: flex;
          flex-direction: column;
          cursor: grab;
          user-select: none;
          transition: background 0.15s, box-shadow 0.15s;
        }

        .timeline-section:active {
          cursor: grabbing;
        }

        .timeline-section.hovered,
        .timeline-section:hover {
          z-index: 2;
          outline: 2px solid var(--color-secondary-c500);
          outline-offset: 2px;
        }

        .timeline-section.selected {
          z-index: 2;
          outline: 2px solid var(--color-primary-c700);
          outline-offset: 2px;
        }

        /* Section Thumbnails */
        .section-thumbnails {
          position: relative;
          height: 40px;
          display: flex;
          z-index: 1;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .section-thumbnail-item {
          flex: 1;
          min-width: 60px;
          overflow: hidden;
          position: relative;
        }

        .section-thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Section Waveform */
        .section-waveform {
          position: relative;
          height: 48px;
          flex-shrink: 0;
          z-index: 1;
          overflow: hidden;
          border-radius: 0 0 8px 8px;
          background: var(--color-secondary-c800);
        }

        /* WaveformTrack Component Styles */
        .waveform-track-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .waveform-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Section Labels */
        .section-labels {
          position: absolute;
          top: 2px;
          left: 12px;
          right: 2px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 10;
        }

        .section-labels.visible {
          opacity: 1;
        }

        .section-label-name,
        .section-label-duration {
          background: rgba(19, 19, 19, 0.6);
          padding: 0 4px;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          line-height: 18px;
          letter-spacing: 0.2px;
          color: var(--color-secondary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Trim Handles */
        .trim-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(19, 19, 19, 0.5);
          opacity: 0;
          transition: opacity 0.15s ease;
          cursor: ew-resize;
          z-index: 20;
          padding: 12px 4px;
        }

        .trim-handle.left {
          left: 0;
          border-radius: 8px 0 0 8px;
        }

        .trim-handle.right {
          right: 0;
          border-radius: 0 8px 8px 0;
        }

        .trim-handle.visible {
          opacity: 1;
        }

        .trim-handle:hover {
          background: rgba(19, 19, 19, 0.7);
        }

        .trim-handle-bar {
          width: 2px;
          height: 100%;
          min-height: 12px;
          max-height: 24px;
          background: var(--color-secondary-c100);
          border-radius: 100px;
        }

        /* Selection Border */
        .section-selection-border {
          position: absolute;
          inset: -2px;
          border: 1.5px solid var(--color-primary-c800);
          border-radius: 10px;
          pointer-events: none;
        }

        /* Hover Border */
        .section-hover-border {
          position: absolute;
          inset: -1px;
          border: 1px solid var(--color-secondary-c500);
          border-radius: 9px;
          pointer-events: none;
        }

        /* ================================================================
           MARQUEE SELECTION
           ================================================================ */
        .selection-marquee {
          position: absolute;
          border: 1px dashed var(--color-primary-c800);
          background: rgba(200, 232, 66, 0.1);
          pointer-events: none;
          z-index: 25;
          border-radius: 4px;
        }

        /* ================================================================
           SNAP INDICATOR
           ================================================================ */
        .snap-indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-primary-c800);
          z-index: 30;
          pointer-events: none;
        }

        /* ================================================================
           SIDEBAR
           ================================================================ */
        .sidebar-wrapper {
          width: 104px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--color-secondary-c1100);
        }

        .sidebar {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0 16px;
          gap: 4px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: var(--color-secondary-c700);
          border-radius: 2px;
        }

        .sidebar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 80px;
          height: 64px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c100);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .sidebar-item:hover {
          background: var(--color-secondary-c900);
        }

        .sidebar-item.active {
          background: var(--color-secondary-c800);
        }

        .sidebar-item-label {
          font: var(--font-tiny-label);
          text-align: center;
        }

        /* ================================================================
           SIDEBAR PANEL
           ================================================================ */
        .sidebar-panel {
          width: 360px;
          margin-left: 8px;
          height: 100%;
          background: var(--color-secondary-c1000);
          border-left: 1px solid var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c800);
          border-right: 1px solid var(--color-secondary-c800);
          border-radius: 12px 12px 0 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .sidebar-panel-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        .sidebar-panel-title {
          font: var(--font-heading-xsmall);
          font-weight: 600;
          color: var(--color-secondary-c100);
        }

        .sidebar-panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .sidebar-panel-placeholder {
          font: var(--font-body-medium);
          color: var(--color-secondary-c400);
        }

        /* ================================================================
           YOUR MEDIA PANEL
           ================================================================ */
        .your-media-panel {
          overflow: hidden;
        }

        .your-media-panel .sidebar-panel-header {
          flex-shrink: 0;
          height: 52px;
          padding: 0 16px;
        }

        .your-media-upload {
          padding: 0 16px;
          flex-shrink: 0;
        }

        .your-media-upload button {
          width: 100%;
        }

        .your-media-search {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 16px 16px 16px;
          padding: 8px 12px;
          background: var(--color-secondary-c900);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .your-media-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
        }

        .your-media-search-input::placeholder {
          color: var(--color-secondary-c500);
        }

        .your-media-tabs {
          display: flex;
          gap: 0;
          padding: 0 16px;
          border-bottom: 1px solid var(--color-secondary-c800);
          flex-shrink: 0;
        }

        .your-media-tab {
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font: var(--font-link-medium);
          font-weight: 500;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: -1px;
        }

        .your-media-tab:hover {
          color: var(--color-secondary-c100);
        }

        .your-media-tab.active {
          color: var(--color-secondary-c100);
          border-bottom-color: var(--color-secondary-c100);
        }

        .your-media-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .media-tab-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .media-tab-content-all {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 8px 0;
        }

        .media-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .media-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .media-section-title {
          font: var(--font-label-medium);
          font-weight: 600;
          color: var(--color-secondary-c100);
        }

        .media-section-see-all {
          background: transparent;
          border: none;
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-primary-c500);
          cursor: pointer;
          transition: color 0.15s;
        }

        .media-section-see-all:hover {
          color: var(--color-primary-c400);
        }

        .media-section-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .media-filters {
          display: flex;
          gap: 8px;
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 8px;
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c100);
          cursor: pointer;
          transition: all 0.15s;
        }

        .filter-dropdown:hover {
          background: var(--color-secondary-c800);
          border-color: var(--color-secondary-c600);
        }

        .media-grid-full {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .media-item-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          border-radius: 8px;
          transition: opacity 0.15s;
        }

        .media-item-card:hover {
          opacity: 0.85;
        }

        .media-item-thumbnail {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          overflow: hidden;
          background: var(--color-secondary-c900);
        }

        .media-item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-item-thumbnail.audio-thumbnail {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary-c900);
        }

        .audio-waveform-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .media-item-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          font: var(--font-helper);
          font-weight: 500;
          color: white;
        }

        .media-item-info {
          display: flex;
          flex-direction: column;
        }

        .media-item-name {
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .media-item-type {
          font: var(--font-helper);
          color: var(--color-secondary-c300);
        }

        .media-item-placeholder {
          width: 100%;
          height: 100%;
          background: var(--color-secondary-c800);
        }

        /* ================================================================
           DRAG AND DROP
           ================================================================ */

        /* Editor Content Drop Overlay (Method 1 - Easiest) */
        .drop-overlay-editor {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(19, 19, 19, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
          transition: background 0.15s;
        }

        .drop-overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--color-secondary-c100);
        }

        .drop-overlay-illustration {
          position: relative;
          width: 122px;
          height: 90px;
        }

        .illust-card {
          position: absolute;
          width: 66px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--color-secondary-c800);
        }

        /* Keyframe animations for card entrance */
        @keyframes cardEnterMusic {
          from {
            opacity: 0;
            top: 21px;
            left: 50%;
            transform: translateX(-50%) rotate(0deg);
          }
          to {
            opacity: 1;
            top: 0;
            left: 50%;
            transform: translateX(-50%) rotate(0deg);
          }
        }

        @keyframes cardEnterImage {
          from {
            opacity: 0;
            top: 21px;
            left: 28px;
            transform: rotate(0deg);
          }
          to {
            opacity: 1;
            top: 26px;
            left: 0;
            transform: rotate(8deg);
          }
        }

        @keyframes cardEnterVideo {
          from {
            opacity: 0;
            top: 21px;
            right: 28px;
            transform: rotate(0deg);
          }
          to {
            opacity: 1;
            top: 25px;
            right: 0;
            transform: rotate(-15deg);
          }
        }

        .illust-card-music {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, rgba(135, 94, 255, 0.15) 0%, rgba(135, 94, 255, 0.15) 100%), var(--color-secondary-c800);
          animation: cardEnterMusic 0.1s ease-out forwards;
        }

        .illust-card-image {
          top: 26px;
          left: 0;
          transform: rotate(8deg);
          box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.4);
          z-index: 1;
          animation: cardEnterImage 0.1s ease-out forwards;
        }

        .illust-card-video {
          top: 25px;
          right: 0;
          transform: rotate(-15deg);
          box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.4);
          z-index: 2;
          background: linear-gradient(90deg, rgba(135, 94, 255, 0.5) 0%, rgba(135, 94, 255, 0.5) 100%), var(--color-secondary-c800);
          animation: cardEnterVideo 0.1s ease-out forwards;
        }

        .drop-overlay-text {
          font: var(--font-heading-small);
          font-weight: 600;
          color: var(--color-secondary-c100);
        }

        .drop-overlay-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          font: var(--font-body-medium);
          color: var(--color-secondary-c200);
        }

        .drop-overlay-key {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--color-secondary-c800);
          border: 1px solid var(--color-secondary-c600);
          border-radius: 6px;
          font: var(--font-label-small);
          font-weight: 500;
          color: var(--color-secondary-c200);
          transition: all 0.15s;
        }

        .drop-overlay-key.active {
          background: var(--color-secondary-c100);
          border-color: var(--color-secondary-c300);
          color: var(--color-secondary-c1100);
        }

        /* Canvas Drop Zone (Methods 2 & 3) - Purple colors */
        .video-canvas.drop-zone-active {
          position: relative;
        }

        .video-canvas.drop-zone-active::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px dashed var(--color-p20-c300, #A855F7);
          border-radius: 12px;
          pointer-events: none;
          opacity: 0.6;
          z-index: 10;
        }

        .video-canvas.drop-zone-hover::after {
          border-style: solid;
          border-width: 3px;
          opacity: 1;
          background: rgba(168, 85, 247, 0.1);
        }

        .canvas-drop-indicator {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          z-index: 5;
          opacity: 0.8;
          pointer-events: none;
          color: var(--color-secondary-c300);
          font: var(--font-label-medium);
          font-weight: 500;
        }

        .canvas-drop-indicator.active {
          opacity: 1;
          background: rgba(168, 85, 247, 0.15);
          color: var(--color-p20-c300, #A855F7);
        }

        /* Timeline Lane Drop Zones (Method 3) - Purple colors */
        .timeline-lane.drop-zone-active {
          position: relative;
        }

        .timeline-lane.drop-zone-active::after {
          content: '';
          position: absolute;
          inset: 2px;
          border: 2px dashed var(--color-p20-c300, #A855F7);
          border-radius: 8px;
          pointer-events: none;
          opacity: 0.5;
          z-index: 10;
        }

        .timeline-lane.drop-zone-hover::after {
          border-style: solid;
          border-width: 2px;
          opacity: 1;
          background: rgba(168, 85, 247, 0.15);
        }

        .lane-drop-indicator {
          position: absolute;
          inset: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          z-index: 5;
          opacity: 0.6;
          pointer-events: none;
          color: var(--color-secondary-c400);
          font: var(--font-label-small);
          font-weight: 500;
        }

        .lane-drop-indicator.active {
          opacity: 1;
          background: rgba(168, 85, 247, 0.2);
          color: var(--color-p20-c300, #A855F7);
        }

        /* Media item drag styles */
        .media-item-card {
          cursor: grab;
        }

        .media-item-card:active {
          cursor: grabbing;
        }

        .editor-root.is-dragging .media-item-card {
          cursor: grabbing;
        }

        /* Hide the item being dragged so it looks like user picked it up */
        .media-item-card.is-dragging {
          opacity: 0.3;
        }

        /* ================================================================
           TOAST NOTIFICATION
           ================================================================ */
        .toast-notification {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          font: var(--font-label-medium);
          font-weight: 500;
          color: var(--color-secondary-c100);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease-out;
        }

        .toast-notification.visible {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .toast-notification svg {
          color: var(--color-primary-c300);
        }

        /* ================================================================
           LIGHT MODE OVERRIDES
           ================================================================ */
        .editor-root.light-mode {
          --editor-bg-primary: #FFFFFF;
          --editor-bg-secondary: #F7F7F8;
          --editor-bg-tertiary: #EEEFF1;
          --editor-border: #E0E1E4;
          --editor-text-primary: #1A1A1A;
          --editor-text-secondary: #6B6F76;
          --editor-text-tertiary: #9CA0A8;
          --editor-hover: #EEEFF1;
          --editor-active: #E0E1E4;
          --editor-neon: #28BA00;
          --editor-pink: #E961FF;
          
          /* Speaker colors matching waveform colors */
          --speaker-primary: #28BA00;
          --speaker-secondary: #E961FF;
        }

        }

        .editor-root.light-mode {
          background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .upload-button {
          background: transparent;
          border: 1px solid var(--color-secondary-c200);
          color: var(--color-secondary-c1100);
        }
        .editor-root.light-mode .upload-button:hover {
        }

        .editor-root.light-mode .editor-main {
         background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .editor-topbar {
          background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .icon-btn {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .icon-btn:hover {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .icon-btn-sm {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .icon-btn-sm:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .topbar-divider {
          background: var(--editor-border);
        }

        .editor-root.light-mode .aspect-selector {
          background: var(--editor-bg-primary);
          color: var(--editor-text-primary);
          border: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .aspect-selector:hover {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .aspect-menu {
          background: var(--editor-bg-primary);
          border: 1px solid var(--editor-border);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .editor-root.light-mode .aspect-menu-item:hover {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .aspect-menu-item.selected {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .aspect-menu-label {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .aspect-menu-sublabel {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .project-title {
          color: var(--editor-text-primary);
        }

        /* Experimental Dropdown - Light Mode */
        .editor-root.light-mode .experimental-dropdown-btn {
          background: var(--editor-bg-tertiary);
          border-color: var(--editor-border);
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .experimental-dropdown-btn:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .experimental-menu {
          background: white;
          border-color: var(--editor-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .editor-root.light-mode .experimental-option {
          background: var(--editor-bg-tertiary);
          border-color: var(--editor-border);
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .experimental-option:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .experimental-option.active {
          background: var(--color-p20-c600);
          border-color: var(--color-p20-c500);
          color: white;
        }

        /* Ghost Button - Light Mode */
        .editor-root.light-mode .feedback-btn-wrapper button {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .feedback-btn-wrapper button:hover {
          background: var(--editor-hover);
        }

        /* Transcript Panel - Light Mode */
        .editor-root.light-mode .transcript-panel {
          background: var(--editor-bg-primary);
          border-left: 1px solid var(--editor-border);
          border-top: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .search-input {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .search-input::placeholder {
          color: var(--editor-text-tertiary);
        }

        .editor-root.light-mode .transcript-time {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .timeline-ruler {
          background: var(--editor-bg-primary);
        }

        .editor-root.light-mode .ruler-separator {
          background: var(--editor-border);
        }

        .editor-root.light-mode .transcript-speaker.chapter {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .transcript-text {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .transcript-content-scroll::-webkit-scrollbar-thumb {
          background: var(--editor-border);
        }

        .editor-root.light-mode .section-waveform {
          background: var(--editor-bg-primary);
        }
        

        /* Resizer - Light Mode */
        .editor-root.light-mode .resizer {
          background: var(--editor-border);
        }

        /* Video Canvas - Light Mode */
        .editor-root.light-mode .canvas-area {
          background: var(--editor-bg-primary);
          border-right: 1px solid var(--editor-border);
          border-top: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .canvas-toggle {
          background: var(--editor-bg-tertiary);
        }

        .editor-root.light-mode .toggle-btn {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .toggle-btn:hover {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .toggle-btn.active {
          background: var(--editor-bg-primary);
          color: var(--editor-text-primary);
        }

        /* Timeline - Light Mode */
        .editor-root.light-mode .timeline-wrapper {
          border-top: 1px solid var(--editor-border);
          border-left: 1px solid var(--editor-border);
          border-right: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .timeline {
          background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .timeline-topbar {
          background: var(--editor-bg-primary);
          border-bottom: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .icon-btn-toolbar {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .icon-btn-toolbar:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .speed-btn {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .speed-btn:hover {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .skip-btn {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .skip-btn:hover {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .timecode-display {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .zoom-slider {
          background: var(--editor-border);
        }

        .editor-root.light-mode .zoom-slider::-webkit-slider-thumb {
          background: var(--editor-text-primary);
        }

        .editor-root.light-mode .zoom-slider::-webkit-slider-thumb:hover {
          background: var(--editor-text-secondary);
        }

        .editor-root.light-mode .hide-timeline-btn {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .hide-timeline-btn:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .timeline-body {
          background: var(--editor-bg-primary);
        }

        .editor-root.light-mode .timeline-side-buttons {
          background: var(--editor-bg-primary);
        }

        .editor-root.light-mode .side-btn {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .side-btn:hover {
          background: var(--editor-hover);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .timeline-lanes-container::-webkit-scrollbar-track {
          background: var(--editor-bg-tertiary);
        }

        .editor-root.light-mode .timeline-lanes-container::-webkit-scrollbar-thumb {
          background: var(--editor-border);
        }

        .editor-root.light-mode .playhead-head {
          background: var(--editor-text-primary);
        }

        .editor-root.light-mode .playhead:hover .playhead-head,
        .editor-root.light-mode .playhead.dragging .playhead-head {
          background: #1A1A1A;
        }

        .editor-root.light-mode .playhead-line {
          background: var(--editor-text-primary);
        }

        .editor-root.light-mode .playhead:hover .playhead-line,
        .editor-root.light-mode .playhead.dragging .playhead-line {
          background: #1A1A1A;
        }

        .editor-root.light-mode .ruler-time {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .ruler-minor-tick {
          background: var(--editor-border);
        }

        .editor-root.light-mode .lane-bg {
          background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .timeline-lane:hover .lane-bg {
          background: var(--editor-bg-tertiary);
        }

        .editor-root.light-mode .lane-bg::after {
          background: rgba(0, 0, 0, 0.02);
        }

        .editor-root.light-mode .scene-clip {
          background: #EAEAEA;
          border: 1px solid #B3B3B3;
        }

        .editor-root.light-mode .scene-clip.hovered,
        .editor-root.light-mode .scene-clip:hover {
          background: #E0E0E0;
          box-shadow: 0 0 0 1px #999999;
        }

        .editor-root.light-mode .scene-thumbnail {
          background: var(--editor-border);
        }

        .editor-root.light-mode .scene-thumbnail-img {
          border: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .scene-label {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .storyline-clip {
          background: #EAEAEA;
          border: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .video-thumbnail-item {
          background: var(--editor-bg-tertiary);
        }

        /* Timeline Section - Light Mode */
        .editor-root.light-mode .timeline-section {
          background: #EAEAEA;
          border: 1px solid #B3B3B3;
        }

        .editor-root.light-mode .timeline-section.hovered,
        .editor-root.light-mode .timeline-section:hover {
          background: #E0E0E0;
          box-shadow: 0 0 0 1px #999999;
        }

        .editor-root.light-mode .overlay-clip.hovered,
        .editor-root.light-mode .overlay-clip:hover {
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
        }

        .editor-root.light-mode .trim-handle {
          background: rgba(255, 255, 255, 0.7);
        }

        .editor-root.light-mode .trim-handle:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .editor-root.light-mode .trim-handle-bar {
          background: var(--editor-text-primary);
        }

        .editor-root.light-mode .section-hover-border {
          border-color: var(--editor-border);
        }

        /* Sidebar - Light Mode */
        .editor-root.light-mode .sidebar-wrapper {
          background: var(--editor-bg-secondary);
        }

        .editor-root.light-mode .sidebar::-webkit-scrollbar-thumb {
          background: var(--editor-border);
        }

        .editor-root.light-mode .sidebar-item {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .sidebar-item:hover {
          background: var(--editor-hover);
        }

        .editor-root.light-mode .sidebar-item.active {
          background: var(--editor-active);
        }

        /* Sidebar Panel - Light Mode */
        .editor-root.light-mode .sidebar-panel {
          background: var(--editor-bg-primary);
          border-left: 1px solid var(--editor-border);
          border-top: 1px solid var(--editor-border);
          border-right: 1px solid var(--editor-border);
        }

        .editor-root.light-mode .sidebar-panel-title {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .sidebar-panel-placeholder {
          color: var(--editor-text-secondary);
        }

        /* Your Media Panel - Light Mode */
        .editor-root.light-mode .your-media-search {
          background: var(--color-secondary-c100);
        }

        .editor-root.light-mode .your-media-search-input {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .your-media-search-input::placeholder {
          color: var(--color-secondary-c500);
        }

        .editor-root.light-mode .your-media-tabs {
          border-bottom-color: var(--editor-border);
        }

        .editor-root.light-mode .your-media-tab {
          color: var(--color-secondary-c500);
        }

        .editor-root.light-mode .your-media-tab:hover {
          color: var(--color-secondary-c700);
        }

        .editor-root.light-mode .your-media-tab.active {
          color: var(--editor-text-primary);
          border-bottom-color: var(--editor-text-primary);
        }

        .editor-root.light-mode .media-section-title {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .filter-dropdown {
          background: var(--color-secondary-c100);
          border-color: var(--editor-border);
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .filter-dropdown:hover {
          background: var(--color-secondary-c200);
        }

        .editor-root.light-mode .media-item-thumbnail {
          background: var(--color-secondary-c200);
        }

        .editor-root.light-mode .media-item-thumbnail.audio-thumbnail {
          background: var(--color-secondary-c200);
        }

        .editor-root.light-mode .media-item-name {
          color: var(--editor-text-primary);
        }

        .editor-root.light-mode .media-item-type {
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .media-item-placeholder {
          background: var(--color-secondary-c300);
        }

        /* Drag and Drop - Light Mode */
        .editor-root.light-mode .drop-overlay-editor {
          background: rgba(0, 0, 0, 0.65);
        }

        .editor-root.light-mode .drop-overlay-content {
          color: var(--color-secondary-c100);
        }

        .editor-root.light-mode .drop-overlay-hint {
          color: var(--color-secondary-c200);
        }

        .editor-root.light-mode .drop-overlay-key {
          background: var(--color-secondary-c800);
          border-color: var(--color-secondary-c600);
          color: var(--color-secondary-c200);
        }

        .editor-root.light-mode .drop-overlay-key.active {
          background: var(--color-p20-c400, #9333EA);
          border-color: var(--color-p20-c400, #9333EA);
          color: white;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
        }

        .editor-root.light-mode .canvas-drop-indicator {
          background: rgba(255, 255, 255, 0.8);
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .canvas-drop-indicator.active {
          background: rgba(168, 85, 247, 0.15);
          color: var(--color-p20-c400, #9333EA);
        }

        .editor-root.light-mode .lane-drop-indicator {
          background: rgba(255, 255, 255, 0.7);
          color: var(--editor-text-secondary);
        }

        .editor-root.light-mode .lane-drop-indicator.active {
          background: rgba(168, 85, 247, 0.2);
          color: var(--color-p20-c400, #9333EA);
        }

        .editor-root.light-mode .toast-notification {
          background: white;
          border-color: var(--editor-border);
          color: var(--editor-text-primary);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .editor-root.light-mode .toast-notification svg {
          color: var(--color-primary-c500);
        }

        /* Audio only mode - Light Mode */
        .editor-root.light-mode .editor-middle.audio-only-mode .transcript-panel {
          border-right: 1px solid var(--editor-border);
        }
      `}</style>
      </div>
    </DragDropContext.Provider>
  )
}
