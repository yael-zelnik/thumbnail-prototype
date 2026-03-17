/**
 * STUDIO PAGE - Recording Interface
 *
 * Recording studio interface with:
 * - Top bar with navigation, recording name, Co-Creator and Live Stream buttons
 * - Video stage with participant tiles
 * - Bottom dock with recording controls
 * - Right sidebar with tools
 *
 * Uses Riverstyle design system components and CSS variables.
 */

import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@riversidefm/riverstyle'
import { MediaBoardPanel, useMediaBoard, MediaBoardProvider } from '../components/media-board'

// Video tile background image - import for proper Vite handling
import videoTileImage from '../assets/c1283eb50eda812284e45b1be890bc81404f5735.png'

// Custom icons from Figma (not in riverstyle)
import shareScreenIcon from '../assets/29d6d730d7a73929d86c5a393db10079b97e421f.svg'
import reactFaceIcon from '../assets/99b5ee5be8fb1072775128059270bf799ad13b75.svg'

// ============================================================================
// EXPERIMENTAL CONTEXT
// ============================================================================

type MediaPanelLayout = 'tabs' | 'collapsible' | 'streamdeck'

const ExperimentalContext = createContext<{
  mediaPanelLayout: MediaPanelLayout
  setMediaPanelLayout: (layout: MediaPanelLayout) => void
}>({
  mediaPanelLayout: 'tabs',
  setMediaPanelLayout: () => {},
})

export const useExperimental = () => useContext(ExperimentalContext)

// ============================================================================
// TYPES
// ============================================================================

interface DockButton {
  id: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'record' | 'leave'
  hasChevron?: boolean
}

interface SidebarButton {
  id: string
  label: string
  icon: React.ReactNode
}

// ============================================================================
// DATA
// ============================================================================

const DOCK_BUTTONS: DockButton[] = [
  {
    id: 'record',
    label: 'Record',
    icon: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="7" fill="currentColor" />
      </svg>
    ),
    variant: 'record',
    hasChevron: true,
  },
  {
    id: 'mic',
    label: 'Mic',
    icon: <Icons.MediaDevices.Microphone02 style={{ width: 16, height: 16 }} />,
    hasChevron: true,
  },
  {
    id: 'cam',
    label: 'Cam',
    icon: <Icons.MediaDevices.VideoRecorder style={{ width: 16, height: 16 }} />,
    hasChevron: true,
  },
  {
    id: 'share',
    label: 'Share',
    icon: <img src={shareScreenIcon} alt="" style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'react',
    label: 'React',
    icon: <img src={reactFaceIcon} alt="" style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'script',
    label: 'Script',
    icon: <Icons.Editor.AlignCenter style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: <Icons.Layout.LayoutAlt04 style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: <Icons.General.LogIn03 style={{ width: 16, height: 16 }} />,
    variant: 'leave',
  },
]

const SIDEBAR_BUTTONS: SidebarButton[] = [
  {
    id: 'people',
    label: 'People',
    icon: <Icons.Users.UsersPlus style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <Icons.Communications.MessageChatCircle style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'brand',
    label: 'Brand',
    icon: <Icons.General.Brand style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'text',
    label: 'Text',
    icon: <Icons.Editor.Type01 style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'media',
    label: 'Media',
    icon: <Icons.MediaDevices.MusicNote01 style={{ width: 16, height: 16 }} />,
  },
]

const SIDEBAR_BOTTOM_BUTTONS: SidebarButton[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: <Icons.General.Settings02 style={{ width: 16, height: 16 }} />,
  },
  {
    id: 'help',
    label: 'Help',
    icon: <Icons.General.HelpCircle style={{ width: 16, height: 16 }} />,
  },
]

// ============================================================================
// COMPONENTS
// ============================================================================

function StudioTopBar() {
  const navigate = useNavigate()
  const { mediaPanelLayout, setMediaPanelLayout } = useExperimental()
  const [showExpDropdown, setShowExpDropdown] = useState(false)

  return (
    <div className="studio-top-bar">
      <div className="top-bar-left">
        <button className="icon-button" onClick={() => navigate('/dashboard')}>
          <Icons.General.Home05 style={{ width: 20, height: 20 }} />
        </button>
        <div className="recording-name">
          <span>Recording 01</span>
        </div>
      </div>

      <div className="top-bar-center">
        <button className="co-creator-button">
          <Icons.Weather.Stars01 style={{ width: 16, height: 16 }} />
          <span>Co-Creator</span>
        </button>
      </div>

      <div className="top-bar-right">
        {/* Experimental Dropdown */}
        <div className="experimental-dropdown-wrapper">
          <button 
            className="experimental-button"
            onClick={() => setShowExpDropdown(!showExpDropdown)}
          >
            <Icons.General.Settings02 style={{ width: 16, height: 16 }} />
            <span>Experimental</span>
            <Icons.Arrows.ChevronDown style={{ width: 14, height: 14 }} />
          </button>

          {showExpDropdown && (
            <div className="experimental-dropdown">
              <div className="exp-dropdown-header">Media Panel Layout</div>
              <button 
                className={`exp-dropdown-item ${mediaPanelLayout === 'tabs' ? 'active' : ''}`}
                onClick={() => { setMediaPanelLayout('tabs'); setShowExpDropdown(false) }}
              >
                <span className="exp-radio">{mediaPanelLayout === 'tabs' ? '●' : '○'}</span>
                <span>Tabs (Visuals / Audio)</span>
              </button>
              <button 
                className={`exp-dropdown-item ${mediaPanelLayout === 'collapsible' ? 'active' : ''}`}
                onClick={() => { setMediaPanelLayout('collapsible'); setShowExpDropdown(false) }}
              >
                <span className="exp-radio">{mediaPanelLayout === 'collapsible' ? '●' : '○'}</span>
                <span>Collapsible Sections</span>
              </button>
              <button 
                className={`exp-dropdown-item ${mediaPanelLayout === 'streamdeck' ? 'active' : ''}`}
                onClick={() => { setMediaPanelLayout('streamdeck'); setShowExpDropdown(false) }}
              >
                <span className="exp-radio">{mediaPanelLayout === 'streamdeck' ? '●' : '○'}</span>
                <span>Stream Deck</span>
              </button>
            </div>
          )}
        </div>

        <button className="live-stream-button">
          <Icons.MediaDevices.Signal01 style={{ width: 20, height: 20 }} />
          <span>Live Stream</span>
        </button>
      </div>
    </div>
  )
}

function VideoTile({ 
  name, 
  imageSrc,
  isSpotlighted,
  isMuted 
}: { 
  name: string
  imageSrc?: string
  isSpotlighted?: boolean
  isMuted?: boolean
}) {
  return (
    <div className={`video-tile ${isSpotlighted ? 'spotlighted' : ''}`}>
      <img src={imageSrc || videoTileImage} alt={name} className="video-tile-image" />
      <div className="video-tile-name">
        <span>{name}</span>
        {isMuted && <span className="muted-icon">🔇</span>}
      </div>
      {isSpotlighted && (
        <div className="spotlight-indicator">
          <Icons.Shapes.Star01 style={{ width: 14, height: 14 }} />
        </div>
      )}
    </div>
  )
}

function MediaVideoTile({ videoId }: { videoId: string }) {
  const { 
    mediaLibrary, 
    playingState, 
    playVideo, 
    pauseVideo, 
    setVideoVolume, 
    toggleVideoMute,
    toggleVideoVisibility,
    setVideoTime
  } = useMediaBoard()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // Find the video item
  const video = [...mediaLibrary.video.session, ...mediaLibrary.video.generic].find(v => v.id === videoId)
  const videoState = playingState.videos.find(v => v.id === videoId)
  
  const isPlaying = videoState?.isPlaying ?? false
  const muted = videoState?.muted ?? false
  const volume = videoState?.volume ?? 80

  // Control video playback
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    el.volume = volume / 100
    el.muted = muted

    if (isPlaying) {
      el.play().catch((err) => {
        console.log('Autoplay blocked, trying muted:', err)
        el.muted = true
        el.play().catch(() => {})
      })
    } else {
      el.pause()
    }
  }, [isPlaying, muted, volume])

  // Track video time and sync to context
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const handleTimeUpdate = () => {
      setCurrentTime(el.currentTime)
      setVideoTime(videoId, el.currentTime, el.duration || 0)
    }
    const handleLoadedMetadata = () => {
      setDuration(el.duration)
      setVideoTime(videoId, el.currentTime, el.duration)
    }

    el.addEventListener('timeupdate', handleTimeUpdate)
    el.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate)
      el.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [videoId, setVideoTime])

  if (!video) return null

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseVideo(videoId)
    } else {
      playVideo(videoId)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoVolume(videoId, parseInt(e.target.value))
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = videoRef.current
    if (el) {
      el.currentTime = parseFloat(e.target.value)
      setCurrentTime(el.currentTime)
    }
  }

  const handleHide = () => {
    pauseVideo(videoId)
    toggleVideoVisibility(videoId)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div 
      className="video-tile media-video-tile"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {video.videoUrl ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="video-tile-video"
          loop
          playsInline
          poster={video.thumbnail}
        />
      ) : (
        <img src={video.thumbnail || videoTileImage} alt={video.name} className="video-tile-image" />
      )}
      
      {/* Video name */}
      <div className="video-tile-name">
        <span>{video.name}</span>
      </div>

      {/* Playing badge */}
      {isPlaying && (
        <div className="video-tile-playing-badge">
          <span className="pulse" />
          PLAYING
        </div>
      )}

      {/* Hover Controls - YouTube style */}
      <div className={`stage-video-controls ${showControls ? 'visible' : ''}`}>
        {/* Seek bar row */}
        <div className="stage-seek-row">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="stage-seek-slider"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        {/* Controls row */}
        <div className="stage-controls-row">
          {/* Left side: Play + Volume + Time */}
          <div className="stage-controls-left">
            {/* Play/Pause */}
            <button 
              className="stage-control-btn"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Icons.MediaDevices.Pause style={{ width: 26, height: 26 }} />
              ) : (
                <Icons.MediaDevices.PlayFill style={{ width: 26, height: 26 }} />
              )}
            </button>

            {/* Volume with horizontal hover slider */}
            <div className="stage-volume-wrapper">
              <button 
                className={`stage-control-btn ${muted ? 'muted' : ''}`}
                onClick={() => toggleVideoMute(videoId)}
                title={muted ? 'Unmute' : 'Mute'}
              >
                <Icons.MediaDevices.VolumeMax style={{ width: 24, height: 24 }} />
              </button>
              <div className="stage-volume-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="stage-volume-slider"
                  style={{ '--volume': `${muted ? 0 : volume}%` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Time display */}
            <span className="stage-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right side: Close */}
          <div className="stage-controls-right">
            <button 
              className="stage-control-btn hide-btn"
              onClick={handleHide}
              title="Hide from stage"
            >
              <Icons.General.XClose style={{ width: 22, height: 22 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MainStage() {
  const { playingState, stageControl, mediaLibrary, hideImage } = useMediaBoard()
  const visibleVideo = playingState.videos.find(v => v.visible)
  const presentingImage = playingState.images.find(img => img.isPresenting)
  
  // Get the actual image data if presenting
  const presentedImageData = presentingImage 
    ? mediaLibrary.images.session.find(img => img.id === presentingImage.id)
    : undefined
  
  const onStageParticipants = stageControl.participants.filter(p => p.isOnStage)
  const spotlightedParticipant = onStageParticipants.find(p => p.isSpotlighted)
  
  // Determine grid layout class based on layout and participant count
  const getLayoutClass = () => {
    if (visibleVideo || presentedImageData) return 'layout-solo'
    if (stageControl.isScreenSharing) return 'layout-pip'
    
    const count = onStageParticipants.length
    
    switch (stageControl.layout) {
      case 'solo':
        return 'layout-solo'
      case 'split':
        return 'layout-split'
      case 'grid':
        // Dynamic grid based on participant count
        if (count <= 1) return 'layout-grid-1'
        if (count === 2) return 'layout-grid-2'
        if (count === 3) return 'layout-grid-3'
        return 'layout-grid-4'
      case 'pip':
        return 'layout-pip'
      default:
        return 'layout-split'
    }
  }

  return (
    <div className="main-stage">
      {/* Branding overlay */}
      {stageControl.showBranding && (
        <div className="stage-branding-overlay">
          <div className="branding-logo">STUDIO</div>
        </div>
      )}
      
      {/* Banner overlay */}
      {stageControl.showBanner && (
        <div className="stage-banner-overlay">
          <div className="banner-content">
            <span className="banner-text">Welcome to the Show!</span>
          </div>
        </div>
      )}
      
      {/* Screen share indicator */}
      {stageControl.isScreenSharing && (
        <div className="screen-share-indicator">
          <Icons.MediaDevices.Monitor01 style={{ width: 16, height: 16 }} />
          <span>Screen Sharing</span>
        </div>
      )}
      
      <div className={`tile-grid ${getLayoutClass()}`}>
        {/* Screen Share takes priority */}
        {stageControl.isScreenSharing ? (
          <>
            <div className="video-tile screen-share-tile">
              <img 
                className="video-tile-image" 
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop" 
                alt="Screen Share"
              />
              <div className="screen-share-overlay">
                <Icons.MediaDevices.Monitor01 style={{ width: 32, height: 32 }} />
                <span>Screen Share</span>
              </div>
            </div>
            {onStageParticipants.slice(0, 1).map(p => (
              <VideoTile 
                key={p.id} 
                name={p.name}
                imageSrc={p.avatar}
                isSpotlighted={p.isSpotlighted}
                isMuted={p.isMuted}
              />
            ))}
          </>
        ) : presentedImageData ? (
          <div className="video-tile presented-image-tile" onClick={() => hideImage(presentedImageData.id)}>
            <img 
              className="video-tile-image" 
              src={presentedImageData.thumbnail} 
              alt={presentedImageData.name}
            />
            <div className="presented-image-label">
              <Icons.Images.Image01 style={{ width: 16, height: 16 }} />
              <span>{presentedImageData.name}</span>
            </div>
          </div>
        ) : visibleVideo ? (
          <MediaVideoTile videoId={visibleVideo.id} />
        ) : stageControl.layout === 'solo' && spotlightedParticipant ? (
          <VideoTile 
            name={spotlightedParticipant.name} 
            imageSrc={spotlightedParticipant.avatar}
            isSpotlighted={true}
            isMuted={spotlightedParticipant.isMuted}
          />
        ) : (
          onStageParticipants.map(p => (
            <VideoTile 
              key={p.id} 
              name={p.name}
              imageSrc={p.avatar}
              isSpotlighted={p.isSpotlighted}
              isMuted={p.isMuted}
            />
          ))
        )}
      </div>
    </div>
  )
}

function DockButtonComponent({ button }: { button: DockButton }) {
  const variantClass = button.variant === 'record' ? 'dock-button-record' : 
                       button.variant === 'leave' ? 'dock-button-leave' : ''

  return (
    <button className={`dock-button ${variantClass}`}>
      {button.icon}
      <span className="dock-button-label">{button.label}</span>
      {button.hasChevron && (
        <div className="dock-button-chevron">
          <Icons.Arrows.ChevronUp style={{ width: 12, height: 12 }} />
        </div>
      )}
    </button>
  )
}

function BottomDock() {
  return (
    <div className="bottom-dock">
      <div className="dock-handle" />
      <div className="dock-buttons">
        {DOCK_BUTTONS.map((button) => (
          <DockButtonComponent key={button.id} button={button} />
        ))}
      </div>
    </div>
  )
}

function SidebarButtonComponent({ 
  button, 
  isActive,
  onClick 
}: { 
  button: SidebarButton
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <button 
      className={`sidebar-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {button.icon}
      <span className="sidebar-button-label">{button.label}</span>
    </button>
  )
}

function RightSidebar({ 
  activePanel, 
  onTogglePanel 
}: { 
  activePanel: string | null
  onTogglePanel: (panelId: string) => void
}) {
  return (
    <div className="right-sidebar">
      <button className="sidebar-collapse-button">
        <Icons.Arrows.ChevronRight style={{ width: 15, height: 15 }} />
      </button>

      <div className="sidebar-buttons">
        {SIDEBAR_BUTTONS.map((button) => (
          <SidebarButtonComponent 
            key={button.id} 
            button={button}
            isActive={activePanel === button.id}
            onClick={() => onTogglePanel(button.id)}
          />
        ))}

        <div className="sidebar-divider" />

        {SIDEBAR_BOTTOM_BUTTONS.map((button) => (
          <SidebarButtonComponent key={button.id} button={button} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StudioPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [mediaPanelLayout, setMediaPanelLayout] = useState<MediaPanelLayout>('tabs')

  const handleTogglePanel = (panelId: string) => {
    setActivePanel(prev => prev === panelId ? null : panelId)
  }

  return (
    <ExperimentalContext.Provider value={{ mediaPanelLayout, setMediaPanelLayout }}>
      <MediaBoardProvider>
        <div className="studio-root">
          <div className="studio-main-view">
            <StudioTopBar />
            <MainStage />
            <BottomDock />
          </div>
          
          {/* Media Board Panel */}
          {activePanel === 'media' && (
            <MediaBoardPanel onClose={() => setActivePanel(null)} layout={mediaPanelLayout} />
          )}
      
      <RightSidebar 
        activePanel={activePanel} 
        onTogglePanel={handleTogglePanel} 
      />

      <style>{`
        .studio-root {
          display: flex;
          min-height: 100vh;
          background: var(--color-secondary-c1100);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .studio-main-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 8px 8px 16px;
        }

        /* ============================================
           TOP BAR
           ============================================ */
        .studio-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 8px;
        }

        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .top-bar-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: flex-end;
        }

        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: background 0.2s;
        }

        .icon-button:hover {
          background: var(--color-secondary-c800);
        }

        .recording-name {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .recording-name span {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
        }

        .co-creator-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 8px;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: background 0.2s;
        }

        .co-creator-button:hover {
          background: var(--color-secondary-c700);
        }

        .co-creator-button span {
          font: var(--font-label-medium);
          font-weight: 600;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
        }

        .live-stream-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 8px;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: background 0.2s;
        }

        .live-stream-button:hover {
          background: var(--color-secondary-c700);
        }

        .live-stream-button span {
          font: var(--font-label-medium);
          font-weight: 600;
        }

        /* Experimental Dropdown */
        .experimental-dropdown-wrapper {
          position: relative;
        }

        .experimental-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-secondary-c800);
          border: 1px dashed var(--color-secondary-c600);
          border-radius: 8px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.2s;
        }

        .experimental-button:hover {
          background: var(--color-secondary-c700);
          color: var(--color-primary-c100);
        }

        .experimental-button span {
          font: var(--font-label-medium);
          font-weight: 500;
        }

        .experimental-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 1000;
          min-width: 220px;
          background: var(--color-secondary-c800);
          border: 1px solid var(--color-secondary-c600);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .exp-dropdown-header {
          padding: 8px 12px;
          font: var(--font-label-small);
          font-weight: 600;
          color: var(--color-secondary-c400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .exp-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c200);
          font: var(--font-label-medium);
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
        }

        .exp-dropdown-item:hover {
          background: var(--color-secondary-c700);
        }

        .exp-dropdown-item.active {
          background: var(--color-secondary-c700);
          color: var(--color-primary-c100);
        }

        .exp-radio {
          font-size: 10px;
          color: var(--color-brand-primary, #6366f1);
        }

        /* ============================================
           MAIN STAGE
           ============================================ */
        .main-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: stretch;
          padding: 0;
          overflow: hidden;
          position: relative;
          min-height: 0;
        }

        .tile-grid {
          display: grid;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding: 12px;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }

        .video-tile {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-tile-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .video-tile-name {
          position: absolute;
          bottom: 8px;
          left: 8px;
          padding: 8px;
        }

        .video-tile-name span {
          font: var(--font-heading-xsmall);
          font-weight: 700;
          font-size: 18px;
          color: var(--color-primary-c100);
          text-shadow: 0 0 8px rgba(17, 17, 17, 0.5);
        }
        
        /* Screen Share Tile */
        .screen-share-tile {
          background: #1a1a2e;
        }
        
        .screen-share-tile .video-tile-image {
          object-fit: cover;
          filter: brightness(0.9);
        }
        
        .screen-share-overlay {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(0, 122, 255, 0.85);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }
        
        /* Presented Image */
        .presented-image-tile {
          cursor: pointer;
        }
        
        .presented-image-tile .video-tile-image {
          object-fit: contain;
          background: #1c1c1e;
        }
        
        .presented-image-label {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(88, 86, 214, 0.85);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        /* ============================================
           BOTTOM DOCK
           ============================================ */
        .bottom-dock {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .dock-handle {
          width: 76px;
          height: 4px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
        }

        .dock-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dock-button {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 68px;
          height: 68px;
          padding: 12px 4px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--primary-c100);
          cursor: pointer;
          transition: background 0.2s;
        }

        .dock-button:hover {
          background: var(--color-secondary-c800);
        }

        .dock-button-record {
          background: var(--color-studio-red-dark, #ee0000);
          color: var(--color-primary-c100);
        }

        .dock-button-record:hover {
          background: #cc0000;
        }

        .dock-button-leave {
          color: var(--color-secondary-c200);
        }

        .dock-button-leave svg {
          color: #ff0000;
        }

        .dock-button-label {
          font: var(--font-tiny-label);
          color: var(--color-secondary-c200);
          font-size: 10px;
          font-weight: 500;
          text-align: center;
        }

        .dock-button-chevron {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ============================================
           RIGHT SIDEBAR
           ============================================ */
        .right-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-radius: 8px;
          backdrop-filter: blur(100px);
        }

        .sidebar-collapse-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: background 0.2s;
        }

        .sidebar-collapse-button:hover {
          background: var(--color-secondary-c800);
        }

        .sidebar-collapse-button svg {
          transform: rotate(180deg);
        }

        .sidebar-buttons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .sidebar-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 68px;
          height: 68px;
          padding: 12px 4px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: background 0.2s;
        }

        .sidebar-button:hover {
          background: var(--color-secondary-c800);
        }

        .sidebar-button-label {
          font: var(--font-tiny-label);
          font-size: 10px;
          font-weight: 500;
          color: var(--color-secondary-c200);
          text-align: center;
        }

        .sidebar-divider {
          width: 20px;
          height: 1px;
          background: var(--color-secondary-c600);
          margin: 8px 0;
        }

        .sidebar-button.active {
          background: var(--color-secondary-c700);
        }

        /* ============================================
           MEDIA BOARD PANEL
           ============================================ */
          .media-board-panel {
            display: flex;
            flex-direction: column;
            width: 360px;
            height: 100%;
            margin: 0;
            background: #151515;
            border: 1px solid #222222;
            border-radius: 12px;
            box-shadow: 0px 8px 20px 0px rgba(17, 17, 17, 0.25);
            animation: slideIn 0.2s ease-out;
            overflow: hidden;
          }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .media-board-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-secondary-c700);
        }

        /* ================================================================
           MEDIABOARD PANEL - New Figma Design
           ================================================================ */
        
        .media-panel-editor-style,
        .media-board-panel {
          display: flex;
          flex-direction: column;
          background: #151515;
        }

        /* Panel Header */
        .media-panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 16px 8px 16px;
          flex-shrink: 0;
          position: relative;
        }

        .media-panel-title {
          font-size: 16px;
          font-weight: 800;
          color: #fafafa;
        }

        .media-panel-header-actions {
          position: absolute;
          right: 16px;
          top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .media-panel-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 4px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #dbdbdb;
          cursor: pointer;
          transition: all 0.15s;
        }

        .media-panel-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Search Bar */
        .media-panel-search {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 12px;
          padding: 6px 12px;
          background: #222222;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .media-panel-search svg {
          color: #888888;
          flex-shrink: 0;
        }

        .media-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          line-height: 24px;
          color: #fafafa;
        }

        .media-search-input::placeholder {
          color: #888888;
        }

        /* Tabs */
        .media-panel-tabs {
          display: flex;
          gap: 0;
          padding: 0 12px;
          border-bottom: 1px solid #222222;
          flex-shrink: 0;
          margin-bottom: 16px;
        }

        .media-panel-tab {
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          color: #888888;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: -1px;
        }

        .media-panel-tab:hover {
          color: #FAFAFA;
        }

        .media-panel-tab.active {
          color: #FAFAFA;
          font-weight: 700;
          border-bottom-color: #FAFAFA;
        }

        /* See All Button */
        .see-all-btn {
          background: transparent;
          border: none;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-primary-c500, #875EFF);
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .see-all-btn:hover {
          opacity: 0.8;
        }

        /* Audio Controls */
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          margin-bottom: 8px;
        }

        .audio-control-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #2b2b2b;
          border: none;
          border-radius: 8px;
          color: #FAFAFA;
          cursor: pointer;
          transition: all 0.15s;
        }

        .audio-control-btn:hover {
          background: #3b3b3b;
        }

        .audio-control-btn.active {
          background: var(--color-primary-c20, rgba(135, 94, 255, 0.2));
          color: var(--color-primary-c500, #875EFF);
        }

        .audio-control-btn.muted {
          color: #888888;
        }

        .audio-control-btn .mute-line {
          position: absolute;
          width: 2px;
          height: 24px;
          background: #FF3B30;
          transform: rotate(-45deg);
          border-radius: 1px;
        }

        .audio-control-btn.icon-btn {
          width: 36px;
          height: 36px;
        }

        .audio-volume-slider {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .audio-volume-slider .volume-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(
            to right,
            var(--color-primary-c500, #875EFF) 0%,
            var(--color-primary-c500, #875EFF) var(--volume-progress, 50%),
            #3b3b3b var(--volume-progress, 50%),
            #3b3b3b 100%
          );
          border-radius: 4px;
          cursor: pointer;
        }

        .audio-volume-slider .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #FAFAFA;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: transform 0.1s;
        }

        .audio-volume-slider .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .audio-volume-slider .volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #FAFAFA;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Scrollable Content */
        .media-panel-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .media-panel-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-bottom: 16px;
        }

        /* Collapsible Section */
        .media-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .media-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          cursor: pointer;
        }

        .media-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #FAFAFA;
          letter-spacing: 0.2px;
          margin: 0;
        }

        .media-section-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          color: #FAFAFA;
          transition: transform 0.2s;
        }

        .media-section.collapsed .media-section-chevron {
          transform: rotate(180deg);
        }
        
        /* Upload Row - Full Width Below Header */
        .media-section-upload-row {
          padding: 8px 16px 12px;
        }
        
        .upload-split-btn {
          display: flex;
          width: 100%;
          position: relative;
        }
        
        .upload-btn-main {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-secondary-c800, #3a3a3c);
          border: none;
          border-radius: 8px 0 0 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .upload-btn-main:hover {
          background: var(--color-secondary-c700, #48484a);
        }
        
        .upload-btn-main:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .upload-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .upload-btn-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          background: var(--color-secondary-c900, #2c2c2e);
          border: none;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0 8px 8px 0;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .upload-btn-chevron:hover {
          background: var(--color-secondary-c800, #3a3a3c);
          color: #ffffff;
        }
        
        .upload-btn-chevron.open {
          background: var(--color-secondary-c700, #48484a);
        }
        
        .upload-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--color-background-secondary, #2c2c2e);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 100;
          overflow: hidden;
        }
        
        .upload-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 14px;
          background: transparent;
          border: none;
          color: var(--color-text-primary, rgba(255, 255, 255, 0.9));
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s ease;
        }
        
        .upload-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        
        .upload-dropdown-item.selected {
          color: var(--color-primary-action, #007AFF);
          background: rgba(0, 122, 255, 0.08);
        }
        
        .upload-dropdown-item span {
          flex: 1;
        }
        
        .upload-dropdown-item:first-child {
          border-radius: 8px 8px 0 0;
        }
        
        .upload-dropdown-item:last-child {
          border-radius: 0 0 8px 8px;
        }
        
        /* Upload Dropdown using Popover */
        .upload-dropdown-popover {
          display: flex;
          flex-direction: column;
          min-width: 180px;
          padding: 6px;
          background: var(--color-secondary-c700);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .upload-dropdown-popover .upload-dropdown-item {
          border-radius: 6px;
          padding: 10px 12px;
        }
        
        .upload-dropdown-popover .upload-dropdown-item:first-child,
        .upload-dropdown-popover .upload-dropdown-item:last-child {
          border-radius: 6px;
        }

        .media-section-content {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 0 15px;
        }

        .media-section.collapsed .media-section-content {
          display: none;
        }

        /* Media Card (Images/Videos) */
        .mediaboard-card {
          display: flex;
          flex-direction: column;
          width: calc(33.333% - 8px);
          border-radius: 8px;
          overflow: visible;
          cursor: pointer;
        }

        .mediaboard-card.playing .mediaboard-card-thumbnail {
          outline: 2px solid var(--color-primary-c500, #875EFF);
          outline-offset: 0px;
        }

        .mediaboard-card.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .mediaboard-card[draggable="true"] {
          cursor: grab;
        }

        .mediaboard-card[draggable="true"]:active {
          cursor: grabbing;
        }

        .mediaboard-card-thumbnail {
          position: relative;
          aspect-ratio: 160 / 90;
          background: #1d1d1d;
          border-radius: 8px;
          overflow: hidden;
        }

        .mediaboard-card-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mediaboard-card-menu {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 4px;
          background: rgba(19, 19, 19, 0.5);
          backdrop-filter: blur(2px);
          border: none;
          border-radius: 6px;
          color: #fafafa;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .mediaboard-card:hover .mediaboard-card-menu {
          opacity: 1;
        }
        
        /* Card Popover Menu */
        .mediaboard-card-popover {
          display: flex;
          flex-direction: column;
          min-width: 140px;
          padding: 6px;
          background: var(--color-secondary-c700);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .mediaboard-card-popover-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--color-secondary-c100);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        
        .mediaboard-card-popover-item:hover {
          background: var(--color-secondary-c600);
        }
        
        .mediaboard-card-popover-item svg {
          color: var(--color-secondary-c300);
        }
        
        .mediaboard-card-popover-item.delete {
          color: #ff6b6b;
        }
        
        .mediaboard-card-popover-item.delete svg {
          color: #ff6b6b;
        }
        
        .mediaboard-card-popover-item.delete:hover {
          background: rgba(255, 107, 107, 0.15);
        }
        
        /* Rename Input */
        .mediaboard-card-rename-input {
          width: 100%;
          padding: 4px 8px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-primary-c600);
          border-radius: 4px;
          color: var(--color-secondary-c100);
          font-size: 11px;
          font-weight: 500;
          outline: none;
        }
        
        .mediaboard-card-rename-input:focus {
          border-color: var(--color-primary-c500);
        }

        .mediaboard-card-duration {
          position: absolute;
          bottom: 4px;
          left: 4px;
          padding: 4px 8px;
          background: rgba(19, 19, 19, 0.75);
          backdrop-filter: blur(2px);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #fafafa;
          line-height: 16px;
        }

        .mediaboard-card-name {
          display: flex;
          align-items: center;
          height: 28px;
          padding: 4px 0 0 0;
          background: transparent;
        }

        .mediaboard-card-name span {
          font-size: 12px;
          font-weight: 600;
          color: #bbbbbb;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* BGM Item */
        .mediaboard-bgm-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px 8px 8px;
          background: #1d1d1d;
          border-radius: 8px;
          transition: outline 0.15s;
        }

        .mediaboard-bgm-item.playing {
          outline: 2px solid var(--color-primary-c500, #875EFF);
          outline-offset: 0px;
        }

        .mediaboard-bgm-item.dragging {
          opacity: 0.5;
          transform: scale(0.98);
        }

        .mediaboard-bgm-item[draggable="true"] {
          cursor: grab;
        }

        .mediaboard-bgm-item[draggable="true"]:active {
          cursor: grabbing;
        }

        .mediaboard-bgm-play {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #2b2b2b;
          border: none;
          border-radius: 100px;
          color: #fafafa;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }

        .mediaboard-bgm-play:hover {
          background: #3b3b3b;
        }

        .mediaboard-bgm-info {
          flex: 1;
          min-width: 0;
        }

        .mediaboard-bgm-name {
          font-size: 12px;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mediaboard-bgm-duration {
          font-size: 11px;
          font-weight: 500;
          color: #888888;
          letter-spacing: 0.2px;
        }
        
        /* BGM Item Rename Input */
        .mediaboard-item-rename-input {
          flex: 1;
          padding: 4px 8px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-primary-c600);
          border-radius: 4px;
          color: var(--color-secondary-c100);
          font-size: 12px;
          font-weight: 600;
          outline: none;
        }
        
        .mediaboard-item-rename-input:focus {
          border-color: var(--color-primary-c500);
        }

        .mediaboard-bgm-menu {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 4px;
          background: #2b2b2b;
          border: none;
          border-radius: 6px;
          color: #fafafa;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .mediaboard-bgm-item:hover .mediaboard-bgm-menu {
          opacity: 1;
        }

        /* SFX Button */
        .mediaboard-sfx-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 16px;
        }

        .mediaboard-sfx-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: calc(33.333% - 5.33px);
          height: 95px;
          padding: 8px;
          background: #2b2b2b;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.1s;
        }

        .mediaboard-sfx-btn:hover {
          transform: scale(1.02);
        }

        .mediaboard-sfx-btn:active {
          transform: scale(0.98);
        }

        .mediaboard-sfx-bg {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          opacity: 0.8;
        }

        .mediaboard-sfx-name {
          position: relative;
          font-size: 12px;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: 0.2px;
          text-align: center;
          z-index: 1;
        }
        
        /* SFX Button Wrapper for menu support */
        .mediaboard-sfx-btn-wrapper {
          position: relative;
          width: calc(33.333% - 5.33px);
        }

        .mediaboard-sfx-btn-wrapper.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .mediaboard-sfx-btn-wrapper[draggable="true"] {
          cursor: grab;
        }

        .mediaboard-sfx-btn-wrapper[draggable="true"]:active {
          cursor: grabbing;
        }
        
        .mediaboard-sfx-btn-wrapper .mediaboard-sfx-btn {
          width: 100%;
        }
        
        .mediaboard-sfx-menu {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 4px;
          background: rgba(19, 19, 19, 0.6);
          backdrop-filter: blur(2px);
          border: none;
          border-radius: 6px;
          color: #fafafa;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 2;
        }
        
        .mediaboard-sfx-btn-wrapper:hover .mediaboard-sfx-menu {
          opacity: 1;
        }
        
        .mediaboard-sfx-rename-input {
          position: relative;
          width: calc(100% - 16px);
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--color-primary-c600);
          border-radius: 4px;
          color: var(--color-secondary-c100);
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          outline: none;
          z-index: 1;
        }
        
        .mediaboard-sfx-rename-input:focus {
          border-color: var(--color-primary-c500);
        }

        /* SFX Gradient backgrounds */
        .sfx-gradient-1 { background: radial-gradient(circle at center, #504dc7, #3c399e 50%, #282675); }
        .sfx-gradient-2 { background: radial-gradient(circle at center, #d0a892, #d69674 50%, #dc8557); }
        .sfx-gradient-3 { background: radial-gradient(circle at center, #a883ff, #9073d5 50%, #7963ab); }
        .sfx-gradient-4 { background: radial-gradient(circle at center, #d6a2d3, #b56fb2); }
        .sfx-gradient-5 { background: radial-gradient(circle at center, #6fa497, #428576 50%, #146655); }
        .sfx-gradient-6 { background: radial-gradient(circle at center, #cfbf94, #c0a869 50%, #b0913e); }
        .sfx-gradient-7 { background: radial-gradient(circle at center, #ca7075, #ad5257 50%, #90343a); }
        .sfx-gradient-8 { background: radial-gradient(circle at center, #b48158, #9f6c42 50%, #8a562c); }
        .sfx-gradient-9 { background: radial-gradient(circle at center, #5a8fd4, #4a7fc4 50%, #3a6fb4); }

        /* Audio Preview List (for All tab) */
        .audio-preview-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .audio-preview-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px 8px 8px;
          background: #1d1d1d;
          border-radius: 8px;
        }

        .audio-preview-play {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #2b2b2b;
          border: none;
          border-radius: 100px;
          color: #fafafa;
          cursor: pointer;
          flex-shrink: 0;
        }

        .audio-preview-info {
          flex: 1;
          min-width: 0;
        }

        .audio-preview-name {
          font-size: 12px;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: 0.2px;
        }

        .audio-preview-duration {
          font-size: 11px;
          font-weight: 500;
          color: #888888;
        }

        /* Empty State */
        .media-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: #888888;
          gap: 8px;
        }

        .media-empty-state p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #bbbbbb;
        }

        .media-empty-state .empty-hint {
          font-size: 12px;
          color: #888888;
        }


        .media-board-tabs {
          display: flex;
          gap: 4px;
        }

        .media-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-secondary-c400);
          font: var(--font-label-medium);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .media-tab:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c200);
        }

        .media-tab.active {
          background: var(--color-secondary-c700);
          color: var(--color-primary-c100);
        }

        .media-board-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: background 0.2s;
        }

        .media-board-close:hover {
          background: var(--color-secondary-c700);
        }

        .media-board-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
        }

        .media-board-content.scrollable-layout {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 24px;
        }

        .media-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Scrollable Sections Layout */
        .collapsible-section {
          background: var(--color-secondary-c850, #1f1f1f);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .collapsible-section.open {
          overflow: hidden;
        }

        .collapsible-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 16px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 10px;
          color: var(--color-primary-c100);
          font: var(--font-label-medium);
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .collapsible-section.open .collapsible-header {
          border-radius: 10px 10px 0 0;
        }

        .collapsible-header:hover {
          background: var(--color-secondary-c750, #2a2a2a);
        }

        .collapsible-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .collapsible-header-left span {
          white-space: nowrap;
        }

        .collapsible-content {
          padding: 12px;
        }

        .collapsible-content .media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .collapsible-content .bgm-list,
        .collapsible-content .sfx-grid {
          max-height: none;
        }

        .media-board-title {
          font: var(--font-heading-xsmall);
          color: var(--color-primary-c100);
          margin: 0;
        }

        .category-button:hover {
          background: var(--color-secondary-c800);
        }

        .category-button.selected {
          background: var(--color-secondary-c700);
          color: var(--color-primary-c100);
        }

        .category-icon {
          display: flex;
          align-items: center;
        }

        .subcategory-list {
          padding-left: 24px;
          margin-top: 4px;
        }

        .subcategory-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-secondary-c400);
          font: var(--font-label-small);
          font-size: 12px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .subcategory-button:hover {
          background: var(--color-secondary-c800);
          color: var(--color-secondary-c200);
        }

        .subcategory-button.selected {
          background: var(--color-secondary-c700);
          color: var(--color-primary-c100);
        }

        /* Main Content Area */
        .media-board-main {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .media-board-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        /* Upload Bar */
        .upload-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-secondary-c700);
          transition: background 0.2s;
        }

        .upload-bar.drag-over {
          background: var(--color-secondary-c700);
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--color-brand-primary, #6366f1);
          border: none;
          border-radius: 6px;
          color: white;
          font: var(--font-label-small);
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .upload-button:hover {
          background: var(--color-brand-primary-dark, #5558e3);
        }

        .upload-dropzone {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          border: 1px dashed var(--color-secondary-c600);
          border-radius: 6px;
          color: var(--color-secondary-c500);
          font: var(--font-label-small);
          font-size: 12px;
        }

        /* Media Grid */
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .media-grid-empty,
        .sfx-grid-empty,
        .bgm-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: var(--color-secondary-c400);
        }

        .media-grid-empty .hint,
        .sfx-grid-empty .hint,
        .bgm-list-empty .hint {
          font-size: 12px;
          color: var(--color-secondary-c500);
          margin-top: 8px;
        }

        /* Media Card */
        .media-card {
          display: flex;
          flex-direction: column;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          overflow: hidden;
          cursor: grab;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .media-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .media-card.playing {
          box-shadow: 0 0 0 2px var(--color-brand-primary, #6366f1);
        }

        .media-card-thumbnail {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--color-secondary-c700);
          cursor: pointer;
        }

        .media-card-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-card-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: var(--color-secondary-c500);
        }

        .media-card-play {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          border: none;
          color: white;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .media-card-thumbnail:hover .media-card-play {
          opacity: 1;
        }

        .media-card-duration {
          position: absolute;
          bottom: 4px;
          right: 4px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          font-size: 10px;
          color: white;
        }

        .media-card-info {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
        }

        .media-card-drag-handle {
          display: flex;
          color: var(--color-secondary-c500);
          cursor: grab;
        }

        .media-card-type-icon {
          display: flex;
          color: var(--color-secondary-c400);
        }

        .media-card-name {
          flex: 1;
          font-size: 12px;
          color: var(--color-primary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .media-card-name-input {
          flex: 1;
          padding: 2px 4px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-secondary-c500);
          border-radius: 4px;
          font-size: 12px;
          color: var(--color-primary-c100);
          outline: none;
        }

        .media-card-menu-wrapper {
          position: relative;
        }

        .media-card-menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: background 0.2s;
        }

        .media-card-menu-button:hover {
          background: var(--color-secondary-c600);
        }

        .media-card-menu {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 100;
          min-width: 120px;
          padding: 4px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-secondary-c600);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .media-card-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-secondary-c200);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .media-card-menu button:hover {
          background: var(--color-secondary-c600);
        }

        .media-card-menu button.delete {
          color: #ef4444;
        }

        /* Video Card Controls */
        .video-card {
          display: flex;
          flex-direction: column;
        }

        .video-card.visible-on-stream {
          box-shadow: 0 0 0 2px var(--color-brand-primary, #6366f1);
        }

        .video-card .media-card-thumbnail {
          position: relative;
        }

        .media-card-live-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 2px 8px;
          background: #ef4444;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .video-card-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c700);
        }

        .video-control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          background: var(--color-secondary-c700);
          border: none;
          border-radius: 6px;
          color: var(--color-secondary-c300);
          cursor: pointer;
          transition: all 0.15s;
        }

        .video-control-btn:hover {
          background: var(--color-secondary-c600);
          color: var(--color-primary-c100);
        }

        .video-control-btn.active {
          background: var(--color-brand-primary, #6366f1);
          color: white;
        }

        .video-control-btn.muted {
          color: #ef4444;
        }

        .video-volume-slider {
          flex: 1;
          height: 4px;
          min-width: 40px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--color-secondary-c600);
          border-radius: 2px;
          cursor: pointer;
        }

        .video-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--color-primary-c100);
          border-radius: 50%;
          cursor: pointer;
        }

        .video-card-progress-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c700);
        }

        .video-card-time {
          font-size: 10px;
          font-weight: 500;
          color: var(--color-secondary-c400);
          min-width: 32px;
          font-variant-numeric: tabular-nums;
        }

        .video-card-time:last-child {
          text-align: right;
        }

        .video-card-progress-bar {
          flex: 1;
          height: 3px;
          background: var(--color-secondary-c600);
          border-radius: 2px;
          overflow: hidden;
        }

        .video-card-progress-fill {
          height: 100%;
          background: var(--color-brand-primary, #6366f1);
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .video-card-name-row {
          padding: 8px 10px;
          background: var(--color-secondary-c800);
          border-top: 1px solid var(--color-secondary-c700);
        }

        .video-card-name-row .media-card-name {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-primary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-card-name-row .media-card-name-input {
          width: 100%;
          padding: 4px 8px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-secondary-c500);
          border-radius: 4px;
          font-size: 13px;
          color: var(--color-primary-c100);
          outline: none;
        }

        /* SFX Grid */
        .sfx-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sfx-grid-hint {
          font-size: 12px;
          color: var(--color-secondary-c500);
          text-align: center;
        }

        .sfx-launchpad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .sfx-button {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          aspect-ratio: 1;
          padding: 16px;
          background: var(--color-secondary-c800);
          border: 2px solid var(--color-secondary-c600);
          border-radius: 12px;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: all 0.15s;
        }

        .sfx-button:hover {
          background: var(--color-secondary-c700);
          border-color: var(--color-secondary-c500);
        }

        .sfx-button:active,
        .sfx-button.playing {
          background: var(--color-brand-primary, #6366f1);
          border-color: var(--color-brand-primary, #6366f1);
          transform: scale(0.95);
        }

        .sfx-button-icon {
          display: flex;
        }

        .sfx-button-name {
          font-size: 12px;
          font-weight: 500;
        }

        .sfx-button-shortcut {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary-c600);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-secondary-c300);
        }

        .sfx-extra {
          margin-top: 16px;
        }

        .sfx-extra h4 {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-secondary-c400);
          margin: 0 0 12px 0;
        }

        .sfx-extra-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        /* BGM List */
        .bgm-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bgm-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          cursor: grab;
          transition: background 0.2s;
        }

        .bgm-item:hover {
          background: var(--color-secondary-c750, #3a3a3a);
        }

        .bgm-item.playing {
          background: var(--color-secondary-c700);
          box-shadow: inset 0 0 0 1px var(--color-brand-primary, #6366f1);
        }

        .bgm-drag-handle {
          display: flex;
          flex-shrink: 0;
          color: var(--color-secondary-c500);
          cursor: grab;
        }

        .bgm-play-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: var(--color-primary-c100);
          cursor: pointer;
          transition: color 0.2s;
        }

        .bgm-play-button:hover {
          color: var(--color-brand-primary, #6366f1);
        }

        .bgm-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 80px;
        }

        .bgm-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-primary-c100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bgm-name-input {
          padding: 4px 8px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-secondary-c500);
          border-radius: 4px;
          font-size: 14px;
          color: var(--color-primary-c100);
          outline: none;
        }

        .bgm-duration {
          font-size: 12px;
          color: var(--color-secondary-c400);
        }

        .bgm-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .bgm-control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          background: var(--color-secondary-c700);
          border: none;
          border-radius: 6px;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: all 0.2s;
        }

        .bgm-control-button:hover {
          background: var(--color-secondary-c600);
          color: var(--color-secondary-c200);
        }

        .bgm-control-button.active {
          background: var(--color-brand-primary, #6366f1);
          color: white;
        }

        .bgm-control-button:has(.fade-label) {
          width: auto;
          padding: 0 12px;
        }

        .fade-label {
          font-size: 11px;
          font-weight: 600;
        }

        .bgm-volume {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          color: var(--color-secondary-c400);
          margin-left: 8px;
          padding-left: 12px;
          border-left: 1px solid var(--color-secondary-c600);
        }

        .bgm-volume-slider {
          width: 80px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--color-secondary-c600);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .bgm-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: var(--color-primary-c100);
          border-radius: 50%;
          cursor: pointer;
        }

        .bgm-volume-value {
          font-size: 12px;
          min-width: 36px;
          text-align: right;
        }

        .bgm-menu-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .bgm-menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-secondary-c400);
          cursor: pointer;
          transition: background 0.2s;
        }

        .bgm-menu-button:hover {
          background: var(--color-secondary-c600);
        }

        .bgm-menu {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 100;
          min-width: 120px;
          padding: 4px;
          background: var(--color-secondary-c700);
          border: 1px solid var(--color-secondary-c600);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .bgm-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-secondary-c200);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .bgm-menu button:hover {
          background: var(--color-secondary-c600);
        }

        .bgm-menu button.delete {
          color: #ef4444;
        }

        /* ================================================================
           STREAM DECK - Apple Launchpad Style
           ================================================================ */
        
        /* Segmented Control Tabs */
        .stream-deck-tabs {
          display: flex;
          gap: 2px;
          margin: 0 12px 12px 12px;
          padding: 2px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
        }

        .stream-deck-tab {
          flex: 1;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stream-deck-tab:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .stream-deck-tab.active {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-weight: 600;
        }

        /* ========================================
           STAGE CONTROL STYLES - Stream Deck Style
           ======================================== */
        
        .stage-control {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
        }
        
        .stage-control-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .stage-control-title {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stage-control-live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #FF3B30;
          background: rgba(255, 59, 48, 0.15);
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        
        .live-dot {
          width: 6px;
          height: 6px;
          background: #FF3B30;
          border-radius: 50%;
          animation: live-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .stage-section {
          margin-bottom: 12px;
        }
        
        .stage-section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stage-action-mini {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.15s;
        }
        
        .stage-action-mini:hover {
          background: rgba(52, 199, 89, 0.3);
          color: #34C759;
        }
        
        /* Stage Deck Grid - Stream Deck Style Buttons */
        .stage-deck-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        
        .stage-deck-grid.participants {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .stage-deck-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.15s;
        }
        
        .stage-deck-btn:hover {
          transform: scale(1.05);
        }
        
        .stage-deck-btn:active {
          transform: scale(0.95);
        }
        
        .stage-deck-btn-icon {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          transition: all 0.15s;
        }
        
        .stage-deck-btn.active .stage-deck-btn-icon {
          box-shadow: 
            0 0 0 2px var(--btn-color),
            0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .stage-deck-btn-label {
          font-size: 9px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .stage-key-hint {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 0.7);
          font-size: 9px;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 3px;
          text-transform: uppercase;
        }
        
        .stage-deck-btn.triggered {
          transform: scale(0.95);
        }
        
        .stage-deck-btn.triggered .stage-deck-btn-icon {
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
        }
        
        /* Participant-specific styles */
        .stage-deck-btn.participant .participant-icon {
          position: relative;
        }
        
        .stage-deck-btn.participant .participant-initial {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }
        
        .stage-deck-btn.participant .participant-muted-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 10px;
        }
        
        .stage-deck-btn.participant .stage-deck-btn-icon {
          border: 2px solid rgba(52, 199, 89, 0.6);
        }
        
        .stage-deck-btn.participant.backstage .stage-deck-btn-icon {
          border: 2px dashed rgba(255, 255, 255, 0.2) !important;
          box-shadow: none;
          filter: grayscale(0.5) brightness(0.7);
        }
        
        .stage-deck-btn.participant.backstage .participant-initial {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .stage-deck-btn.participant.backstage:hover .stage-deck-btn-icon {
          border-color: rgba(52, 199, 89, 0.5) !important;
          filter: grayscale(0) brightness(1);
        }
        
        .stage-deck-btn.participant.backstage .participant-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: inherit;
        }
        
        .stage-deck-btn.participant.backstage:hover .participant-avatar-overlay {
          background: rgba(0, 0, 0, 0.2);
        }
        
        .stage-empty-message {
          grid-column: 1 / -1;
          padding: 16px;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
        }
        
        .stage-deck-btn.participant.spotlighted .stage-deck-btn-icon {
          box-shadow: 
            0 0 0 2px #FFCC00,
            0 4px 12px rgba(255, 204, 0, 0.3);
        }
        
        .stage-deck-btn.participant.muted .stage-deck-btn-icon {
          opacity: 0.6;
        }
        
        .participant-quick-actions {
          position: absolute;
          top: 2px;
          right: 2px;
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        
        .stage-deck-btn.participant:hover .participant-quick-actions {
          opacity: 1;
        }
        
        .pq-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
          transition: all 0.15s;
        }
        
        .pq-action:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        
        .pq-action.remove:hover {
          background: rgba(255, 59, 48, 0.8);
        }
        
        /* Divider between Stage Control and Media Deck */
        .stage-deck-divider {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .stage-deck-divider span {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Main Stage Layout Classes */
        .tile-grid.layout-solo {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }
        
        /* Split: One large tile on left, others stacked on right */
        .tile-grid.layout-split {
          grid-template-columns: 3fr 1fr;
          grid-template-rows: repeat(4, 1fr);
        }
        
        .tile-grid.layout-split .video-tile:first-child {
          grid-column: 1;
          grid-row: 1 / -1;
        }
        
        .tile-grid.layout-split .video-tile:nth-child(2) {
          grid-column: 2;
          grid-row: 1;
        }
        
        .tile-grid.layout-split .video-tile:nth-child(3) {
          grid-column: 2;
          grid-row: 2;
        }
        
        .tile-grid.layout-split .video-tile:nth-child(4) {
          grid-column: 2;
          grid-row: 3;
        }
        
        .tile-grid.layout-split .video-tile:nth-child(5) {
          grid-column: 2;
          grid-row: 4;
        }
        
        /* Grid: Dynamic based on participant count */
        
        /* 1 participant - full screen */
        .tile-grid.layout-grid-1 {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }
        
        /* 2 participants - side by side full height */
        .tile-grid.layout-grid-2 {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: 1fr;
        }
        
        /* 3 participants - 2 on top, 1 on bottom centered */
        .tile-grid.layout-grid-3 {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
        }
        
        .tile-grid.layout-grid-3 .video-tile:nth-child(3) {
          grid-column: 1 / -1;
          max-width: 50%;
          justify-self: center;
        }
        
        /* 4 participants - 2x2 grid */
        .tile-grid.layout-grid-4 {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
        }
        
        /* PiP: Main tile with small overlay */
        .tile-grid.layout-pip {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          position: relative;
        }
        
        .tile-grid.layout-pip .video-tile:first-child {
          grid-column: 1;
          grid-row: 1;
        }
        
        .tile-grid.layout-pip .video-tile:not(:first-child) {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 20%;
          height: auto;
          aspect-ratio: 16/9;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        /* Video Tile Spotlighted State */
        .video-tile.spotlighted {
          box-shadow: 0 0 0 3px #FFCC00, 0 8px 24px rgba(255, 204, 0, 0.3);
        }
        
        .video-tile .spotlight-indicator {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #FFCC00;
          color: #000;
          padding: 4px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .video-tile .muted-icon {
          margin-left: 6px;
          font-size: 12px;
        }
        
        /* Stage Overlays */
        .stage-branding-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
        }
        
        .branding-logo {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
          padding: 6px 12px;
          border-radius: 6px;
          letter-spacing: 1px;
        }
        
        .stage-banner-overlay {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        
        .banner-content {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
          padding: 12px 24px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .banner-text {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .screen-share-indicator {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 122, 255, 0.9);
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* ========================================
           STREAM DECK STYLES
           ======================================== */

        .stream-deck-container {
          display: flex;
          flex-direction: column;
          padding: 16px 16px;
          gap: 12px;
        }

        .stream-deck-preset-bar {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .stream-deck-preset-select {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 13px;
          color: #ffffff;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 32px;
          transition: all 0.15s;
        }

        .stream-deck-preset-select:hover {
          background-color: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .stream-deck-preset-select:focus {
          border-color: #007AFF;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .stream-deck-preset-select option {
          background: #2c2c2e;
          color: #ffffff;
        }

        .stream-deck-clear-btn {
          padding: 8px 12px;
          background: rgba(255, 59, 48, 0.15);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #FF3B30;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .stream-deck-clear-btn:hover {
          background: rgba(255, 59, 48, 0.25);
          border-color: rgba(255, 59, 48, 0.5);
        }

        .stream-deck-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px 8px;
        }

        .stream-deck-button {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s ease;
          width: 100%;
        }

        .stream-deck-button:hover {
          transform: scale(1.05);
        }

        .stream-deck-button:active {
          transform: scale(0.95);
        }

        .stream-deck-button.dragging {
          opacity: 0.5;
        }

        .stream-deck-button.triggered {
          transform: scale(0.92);
        }

        .stream-deck-button.playing .sd-button-icon-wrapper {
          box-shadow: 
            0 0 0 2px transparent,
            0 0 0 4px color-mix(in srgb, var(--button-color, #007AFF) 80%, transparent),
            0 4px 16px color-mix(in srgb, var(--button-color, #007AFF) 40%, transparent),
            inset 0 0 0 1px rgba(255, 255, 255, 0.15);
        }
        
        /* Active state for toggle buttons (like layout) - no audio bars */
        .stream-deck-button.active-state .sd-button-icon-wrapper {
          box-shadow: 
            0 0 0 2px #1c1c1e,
            0 0 0 4px color-mix(in srgb, var(--button-color, #007AFF) 80%, transparent),
            0 4px 16px color-mix(in srgb, var(--button-color, #007AFF) 30%, transparent),
            inset 0 0 0 1px rgba(255, 255, 255, 0.15);
        }

        .sd-button-playing {
          position: absolute;
          top: 6px;
          left: 6px;
          z-index: 3;
        }

        .sd-playing-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
          padding: 3px 5px;
          background: var(--button-color, #007AFF);
          border-radius: 4px;
        }

        .sd-playing-bars span {
          width: 3px;
          background: white;
          border-radius: 1px;
          animation: playing-bar 0.8s ease-in-out infinite;
        }

        .sd-playing-bars span:nth-child(1) {
          height: 40%;
          animation-delay: 0s;
        }

        .sd-playing-bars span:nth-child(2) {
          height: 80%;
          animation-delay: 0.2s;
        }

        .sd-playing-bars span:nth-child(3) {
          height: 60%;
          animation-delay: 0.4s;
        }

        @keyframes playing-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }

        .sd-button-icon-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 8px;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }

        .stream-deck-button:hover .sd-button-icon-wrapper {
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.35),
            inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        .stream-deck-button.has-thumbnail .sd-button-icon-wrapper {
          background-size: cover;
          background-position: center;
        }

        .sd-button-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .stream-deck-button.has-thumbnail .sd-button-overlay {
          opacity: 1;
        }

        .sd-button-icon {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.95);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .sd-button-name {
          position: absolute;
          bottom: 6px;
          left: 4px;
          right: 4px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 1);
          text-align: center;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.1px;
          z-index: 2;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .sd-button-key {
          position: absolute;
          top: 4px;
          left: 4px;
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 6px;
          border-radius: 6px;
          z-index: 3;
          backdrop-filter: blur(4px);
        }

        .sd-button-media-hint {
          display: none;
        }

        .sd-button-edit {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(60, 60, 60, 0.95);
          border: none;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          z-index: 4;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .stream-deck-button:hover .sd-button-edit {
          opacity: 1;
        }

        .sd-button-edit:hover {
          transform: scale(1.1);
          background: rgba(80, 80, 80, 0.95);
        }

        /* Add Button - Apple Style */
        .stream-deck-add {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
          width: 100%;
        }

        .stream-deck-add:hover {
          transform: scale(1.05);
        }

        .stream-deck-add-icon {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
        }

        .stream-deck-add:hover .stream-deck-add-icon {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.35);
          color: rgba(255, 255, 255, 0.7);
        }

        .stream-deck-add-icon span {
          position: absolute;
          bottom: 6px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stream-deck-add:hover .stream-deck-add-icon span {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Stream Deck Editor Modal - Apple Style */
        .sd-editor-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(20px);
        }

        .sd-editor-modal {
          width: 360px;
          background: rgba(30, 30, 30, 0.95);
          border-radius: 14px;
          box-shadow: 
            0 24px 80px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .sd-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sd-editor-header h3 {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .sd-editor-header button {
          background: none;
          border: none;
          color: var(--color-secondary-c400);
          cursor: pointer;
          padding: 4px;
        }

        .sd-editor-header button:hover {
          color: var(--color-primary-c100);
        }

        .sd-editor-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sd-editor-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sd-editor-field label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
        }

        .sd-editor-field input,
        .sd-editor-field select {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          transition: all 0.15s;
        }

        .sd-editor-field input:focus,
        .sd-editor-field select:focus {
          border-color: #007AFF;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
        }

        .sd-editor-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .sd-editor-field select option {
          background: #2c2c2e;
          color: #ffffff;
        }

        .sd-key-recorder {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 14px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 44px;
          user-select: none;
        }

        .sd-key-recorder:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .sd-key-recorder.recording {
          border-color: #007AFF;
          background: rgba(0, 122, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
        }

        .sd-key-recorder.recording::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #FF3B30;
          border-radius: 50%;
          animation: pulse-recording 1s ease-in-out infinite;
        }

        @keyframes pulse-recording {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(0.8); }
        }

        .sd-key-display {
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
          font-weight: 500;
          color: #ffffff;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .sd-key-placeholder {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        .sd-key-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.15s;
        }

        .sd-key-clear:hover {
          background: rgba(255, 59, 48, 0.2);
          color: #FF3B30;
        }
        
        .sd-action-select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .sd-action-select:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .sd-action-select:focus {
          outline: none;
          border-color: #007AFF;
        }
        
        .sd-action-select option {
          background: #2c2c2e;
          color: #ffffff;
        }

        .sd-color-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sd-color-option {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .sd-color-option:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .sd-color-option.selected {
          border-color: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .sd-icon-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sd-icon-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 2px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          color: rgba(255, 255, 255, 0.9);
        }

        .sd-icon-option svg {
          color: inherit;
        }

        .sd-icon-option:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: scale(1.05);
        }

        .sd-icon-option.selected {
          border-color: #007AFF;
          background: rgba(0, 122, 255, 0.15);
        }

        .sd-editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sd-delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255, 59, 48, 0.12);
          border: none;
          border-radius: 8px;
          color: #FF3B30;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sd-delete-btn:hover {
          background: rgba(255, 59, 48, 0.2);
        }

        .sd-editor-actions {
          display: flex;
          gap: 8px;
        }

        .sd-cancel-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sd-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .sd-save-btn {
          padding: 8px 20px;
          background: #007AFF;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sd-save-btn:hover {
          background: #0066D6;
        }

        /* Video Preview Modal */
        .video-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .video-preview-modal {
          position: relative;
          width: 90%;
          max-width: 800px;
          background: var(--color-secondary-c900);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .video-preview-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .video-preview-close:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .video-preview-player {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--color-secondary-c1000);
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .video-preview-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        .video-preview-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 100%;
          color: var(--color-secondary-c500);
        }

        .video-preview-placeholder span {
          font-size: 14px;
        }

        .video-preview-no-source {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: var(--color-secondary-c400);
        }

        .video-preview-no-source span {
          font-size: 13px;
        }

        .video-preview-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--color-secondary-c800);
          border-radius: 0 0 8px 8px;
        }

        .video-preview-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-primary-c100);
        }

        .video-preview-duration {
          font-size: 13px;
          color: var(--color-secondary-c400);
        }

        /* Media Video Tile */
        .media-video-tile {
          position: relative;
        }

        .video-tile-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .video-tile-playing-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(239, 68, 68, 0.9);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .video-tile-playing-badge .pulse {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        /* Stage Video Hover Controls - YouTube Style */
        .stage-video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .stage-video-controls.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .stage-seek-row {
          padding: 0 12px;
        }

        .stage-seek-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(
            to right, 
            #ff0000 0%, 
            #ff0000 var(--progress, 0%), 
            rgba(255, 255, 255, 0.3) var(--progress, 0%), 
            rgba(255, 255, 255, 0.3) 100%
          );
          border-radius: 0;
          cursor: pointer;
          transition: height 0.1s;
        }

        .stage-seek-slider:hover {
          height: 6px;
        }

        .stage-seek-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #ff0000;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.1s;
        }

        .stage-seek-slider:hover::-webkit-slider-thumb {
          opacity: 1;
        }

        .stage-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px 12px;
        }

        .stage-controls-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stage-controls-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stage-control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
        }

        .stage-control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .stage-control-btn.muted {
          color: #ff4444;
        }

        .stage-control-btn.hide-btn {
          color: white;
        }

        .stage-control-btn.hide-btn:hover {
          background: rgba(255, 68, 68, 0.3);
        }

        .stage-time-display {
          font-size: 13px;
          font-weight: 400;
          color: white;
          margin-left: 8px;
          font-variant-numeric: tabular-nums;
        }

        /* Volume with horizontal slider on hover */
        .stage-volume-wrapper {
          display: flex;
          align-items: center;
        }

        .stage-volume-slider-wrapper {
          width: 0;
          overflow: hidden;
          transition: width 0.2s ease;
        }

        .stage-volume-wrapper:hover .stage-volume-slider-wrapper {
          width: 60px;
          margin-right: 4px;
        }

        .stage-volume-slider {
          width: 52px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(
            to right,
            white 0%,
            white var(--volume, 80%),
            rgba(255, 255, 255, 0.3) var(--volume, 80%),
            rgba(255, 255, 255, 0.3) 100%
          );
          border-radius: 2px;
          cursor: pointer;
          margin-left: 4px;
        }

        .stage-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
        </div>
      </MediaBoardProvider>
    </ExperimentalContext.Provider>
  )
}
