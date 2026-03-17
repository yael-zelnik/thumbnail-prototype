/**
 * MEDIA BOARD PANEL
 * 
 * Main container for the Media Board that opens from the Studio sidebar.
 * Supports three layouts:
 * - tabs: Horizontal tabs for Visuals/Audio
 * - collapsible: All sections in one scrollable panel with collapsible headers
 * - streamdeck: Stream Deck style with customizable buttons + Assets tab
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Icons, Popover } from '@riversidefm/riverstyle'
import { useMediaBoard, StreamDeckButton, MediaItem, STREAM_DECK_PRESETS, StageLayout } from './MediaBoardContext'
import { UploadBar } from './UploadBar'
import { MediaGrid } from './MediaGrid'
import { SoundEffectsGrid } from './SoundEffectsGrid'
import { BgmList } from './BgmList'

interface MediaBoardPanelProps {
  onClose: () => void
  layout?: 'tabs' | 'collapsible' | 'streamdeck'
}

// ===========================================
// AUDIO CONTROLS COMPONENT
// ===========================================

function AudioControls({ 
  type,
  volume,
  isMuted,
  isLooping,
  isFading,
  onVolumeChange,
  onMuteToggle,
  onLoopToggle,
  onFadeToggle
}: {
  type: 'bgm' | 'sfx'
  volume: number
  isMuted: boolean
  isLooping: boolean
  isFading: boolean
  onVolumeChange: (value: number) => void
  onMuteToggle: () => void
  onLoopToggle: () => void
  onFadeToggle: () => void
}) {
  return (
    <div className="audio-controls">
      <button 
        className={`audio-control-btn ${isMuted ? 'muted' : ''}`}
        onClick={onMuteToggle}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icons.MediaDevices.VolumeMax style={{ width: 18, height: 18 }} />
        {isMuted && <div className="mute-line" />}
      </button>
      
      <div className="audio-volume-slider">
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="volume-slider"
          style={{ 
            '--volume-progress': `${isMuted ? 0 : volume}%` 
          } as React.CSSProperties}
        />
      </div>

      <button 
        className={`audio-control-btn icon-btn ${isFading ? 'active' : ''}`}
        onClick={onFadeToggle}
        title={isFading ? 'Disable Fade In/Out' : 'Enable Fade In/Out'}
      >
        <Icons.MediaDevices.Recording01 style={{ width: 18, height: 18 }} />
      </button>

      <button 
        className={`audio-control-btn icon-btn ${isLooping ? 'active' : ''}`}
        onClick={onLoopToggle}
        title={isLooping ? 'Disable Loop' : 'Enable Loop'}
      >
        <Icons.Arrows.ReverseLeft style={{ width: 18, height: 18 }} />
      </button>
    </div>
  )
}

// Simplified audio controls for SFX (volume only, no loop/fade)
function SfxAudioControls({ 
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: {
  volume: number
  isMuted: boolean
  onVolumeChange: (value: number) => void
  onMuteToggle: () => void
}) {
  return (
    <div className="audio-controls">
      <button 
        className={`audio-control-btn ${isMuted ? 'muted' : ''}`}
        onClick={onMuteToggle}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icons.MediaDevices.VolumeMax style={{ width: 18, height: 18 }} />
        {isMuted && <div className="mute-line" />}
      </button>
      
      <div className="audio-volume-slider">
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="volume-slider"
          style={{ 
            '--volume-progress': `${isMuted ? 0 : volume}%` 
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

// ===========================================
// TABS LAYOUT (with All, Images, Videos, Audio tabs)
// ===========================================

type MediaTab = 'all' | 'images' | 'videos' | 'bgm' | 'sfx'

// SFX gradient colors matching Figma
const SFX_GRADIENTS = [
  'sfx-gradient-1', 'sfx-gradient-2', 'sfx-gradient-3',
  'sfx-gradient-4', 'sfx-gradient-5', 'sfx-gradient-6',
  'sfx-gradient-7', 'sfx-gradient-8', 'sfx-gradient-9'
]

function TabsLayout({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<MediaTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  
  const { 
    mediaLibrary, 
    playingState, 
    triggerSfx, 
    playBgm, 
    pauseBgm, 
    playVideo, 
    triggerSfxByShortcut,
    // Global audio controls
    globalBgmVolume,
    globalBgmMuted,
    globalBgmLooping,
    globalBgmFading,
    setGlobalBgmVolume,
    setGlobalBgmMuted,
    setGlobalBgmLooping,
    setGlobalBgmFading,
    globalSfxVolume,
    globalSfxMuted,
    setGlobalSfxVolume,
    setGlobalSfxMuted,
  } = useMediaBoard()
  
  // SFX doesn't have looping/fading at global level, use local state
  const [sfxLooping, setSfxLooping] = useState(false)
  const [sfxFading, setSfxFading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 9) {
        triggerSfxByShortcut(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerSfxByShortcut])

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Get media items
  const allVideos = [...mediaLibrary.video.session, ...mediaLibrary.video.generic]
  const allImages = mediaLibrary.images.session
  const allBgm = mediaLibrary.audio.bgm
  const allSfx = mediaLibrary.audio.sfx

  // Filter by search
  const filterBySearch = (items: MediaItem[]) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredImages = filterBySearch(allImages)
  const filteredVideos = filterBySearch(allVideos)
  const filteredBgm = filterBySearch(allBgm)
  const filteredSfx = filterBySearch(allSfx)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <div className="media-panel-sections">
            {/* Videos Preview */}
            {filteredVideos.length > 0 && (
              <div className="media-section">
                <div className="media-section-header" style={{ cursor: 'default' }}>
                  <h3 className="media-section-title">Recent Videos</h3>
                  {filteredVideos.length > 2 && (
                    <button className="see-all-btn" onClick={() => setActiveTab('videos')}>
                      See all
                    </button>
                  )}
                </div>
                <div className="media-section-content">
                  {filteredVideos.slice(0, 2).map(item => {
                    const videoState = playingState.videos.find(v => v.id === item.id)
                    const isVideoPlaying = videoState?.isPlaying && videoState?.visible
                    return (
                      <MediaboardCard 
                        key={item.id} 
                        item={item} 
                        showDuration
                        isPlaying={isVideoPlaying}
                        onClick={() => playVideo(item.id)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Images Preview */}
            {filteredImages.length > 0 && (
              <div className="media-section">
                <div className="media-section-header" style={{ cursor: 'default' }}>
                  <h3 className="media-section-title">Recent Images</h3>
                  {filteredImages.length > 2 && (
                    <button className="see-all-btn" onClick={() => setActiveTab('images')}>
                      See all
                    </button>
                  )}
                </div>
                <div className="media-section-content">
                  {filteredImages.slice(0, 2).map(item => (
                    <MediaboardCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Background Music Preview */}
            {filteredBgm.length > 0 && (
              <div className="media-section">
                <div className="media-section-header" style={{ cursor: 'default' }}>
                  <h3 className="media-section-title">Recent Background Music</h3>
                  {filteredBgm.length > 2 && (
                    <button className="see-all-btn" onClick={() => setActiveTab('bgm')}>
                      See all
                    </button>
                  )}
                </div>
                <AudioControls
                  type="bgm"
                  volume={globalBgmVolume}
                  isMuted={globalBgmMuted}
                  isLooping={globalBgmLooping}
                  isFading={globalBgmFading}
                  onVolumeChange={setGlobalBgmVolume}
                  onMuteToggle={() => setGlobalBgmMuted(!globalBgmMuted)}
                  onLoopToggle={() => setGlobalBgmLooping(!globalBgmLooping)}
                  onFadeToggle={() => setGlobalBgmFading(!globalBgmFading)}
                />
                <div className="media-section-content" style={{ flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
                  {filteredBgm.slice(0, 2).map(item => {
                    const isPlaying = playingState.bgm.some(b => b.id === item.id && b.isPlaying)
                    return (
                      <MediaboardBgmItem 
                        key={item.id} 
                        item={item}
                        isPlaying={isPlaying}
                        onPlay={() => isPlaying ? pauseBgm(item.id) : playBgm(item.id)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sound FX Preview */}
            {filteredSfx.length > 0 && (
              <div className="media-section">
                <div className="media-section-header" style={{ cursor: 'default' }}>
                  <h3 className="media-section-title">Recent Sound FX</h3>
                  {filteredSfx.length > 3 && (
                    <button className="see-all-btn" onClick={() => setActiveTab('sfx')}>
                      See all
                    </button>
                  )}
                </div>
                <AudioControls
                  type="sfx"
                  volume={globalSfxVolume}
                  isMuted={globalSfxMuted}
                  isLooping={sfxLooping}
                  isFading={sfxFading}
                  onVolumeChange={setGlobalSfxVolume}
                  onMuteToggle={() => setGlobalSfxMuted(!globalSfxMuted)}
                  onLoopToggle={() => setSfxLooping(!sfxLooping)}
                  onFadeToggle={() => setSfxFading(!sfxFading)}
                />
                <div className="mediaboard-sfx-grid">
                  {filteredSfx.slice(0, 3).map((item, index) => (
                    <button 
                      key={item.id} 
                      className="mediaboard-sfx-btn"
                      onClick={() => triggerSfx(item.id)}
                    >
                      <div className={`mediaboard-sfx-bg ${SFX_GRADIENTS[index % SFX_GRADIENTS.length]}`} />
                      <span className="mediaboard-sfx-name">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredVideos.length === 0 && filteredImages.length === 0 && filteredBgm.length === 0 && filteredSfx.length === 0 && (
              <div className="media-empty-state">
                <Icons.Files.Folder style={{ width: 32, height: 32 }} />
                <p>No media found</p>
              </div>
            )}
          </div>
        )

      case 'images':
        return (
          <div className="media-panel-sections">
            {filteredImages.length > 0 ? (
              <div className="media-section-content" style={{ padding: '0 15px' }}>
                {filteredImages.map(item => (
                  <MediaboardCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="media-empty-state">
                <Icons.Images.Image01 style={{ width: 32, height: 32 }} />
                <p>No images</p>
              </div>
            )}
          </div>
        )

      case 'videos':
        return (
          <div className="media-panel-sections">
            {filteredVideos.length > 0 ? (
              <div className="media-section-content" style={{ padding: '0 15px' }}>
                {filteredVideos.map(item => {
                  const videoState = playingState.videos.find(v => v.id === item.id)
                  const isVideoPlaying = videoState?.isPlaying && videoState?.visible
                  return (
                    <MediaboardCard 
                      key={item.id} 
                      item={item} 
                      showDuration
                      isPlaying={isVideoPlaying}
                      onClick={() => playVideo(item.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="media-empty-state">
                <Icons.MediaDevices.VideoRecorder style={{ width: 32, height: 32 }} />
                <p>No videos</p>
              </div>
            )}
          </div>
        )

      case 'bgm':
        return (
          <div className="media-panel-sections">
            <AudioControls
              type="bgm"
              volume={globalBgmVolume}
              isMuted={globalBgmMuted}
              isLooping={globalBgmLooping}
              isFading={globalBgmFading}
              onVolumeChange={setGlobalBgmVolume}
              onMuteToggle={() => setGlobalBgmMuted(!globalBgmMuted)}
              onLoopToggle={() => setGlobalBgmLooping(!globalBgmLooping)}
              onFadeToggle={() => setGlobalBgmFading(!globalBgmFading)}
            />
            {filteredBgm.length > 0 ? (
              <div className="media-section-content" style={{ flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
                {filteredBgm.map(item => {
                  const isPlaying = playingState.bgm.some(b => b.id === item.id && b.isPlaying)
                  return (
                    <MediaboardBgmItem 
                      key={item.id} 
                      item={item}
                      isPlaying={isPlaying}
                      onPlay={() => isPlaying ? pauseBgm(item.id) : playBgm(item.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="media-empty-state">
                <Icons.MediaDevices.MusicNote01 style={{ width: 32, height: 32 }} />
                <p>No background music</p>
              </div>
            )}
          </div>
        )

      case 'sfx':
        return (
          <div className="media-panel-sections">
            <AudioControls
              type="sfx"
              volume={globalSfxVolume}
              isMuted={globalSfxMuted}
              isLooping={sfxLooping}
              isFading={sfxFading}
              onVolumeChange={setGlobalSfxVolume}
              onMuteToggle={() => setGlobalSfxMuted(!globalSfxMuted)}
              onLoopToggle={() => setSfxLooping(!sfxLooping)}
              onFadeToggle={() => setSfxFading(!sfxFading)}
            />
            {filteredSfx.length > 0 ? (
              <div className="mediaboard-sfx-grid">
                {filteredSfx.map((item, index) => (
                  <button 
                    key={item.id} 
                    className="mediaboard-sfx-btn"
                    onClick={() => triggerSfx(item.id)}
                  >
                    <div className={`mediaboard-sfx-bg ${SFX_GRADIENTS[index % SFX_GRADIENTS.length]}`} />
                    <span className="mediaboard-sfx-name">{item.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="media-empty-state">
                <Icons.MediaDevices.VolumeMax style={{ width: 32, height: 32 }} />
                <p>No sound effects</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="media-board-panel media-panel-editor-style">
      {/* Header */}
      <div className="media-panel-header">
        <span className="media-panel-title">Mediaboard</span>
        <div className="media-panel-header-actions">
          <button className="media-panel-icon-btn">
            <Icons.General.UploadCloud01 style={{ width: 16, height: 16 }} />
          </button>
          <button className="media-panel-icon-btn" onClick={onClose}>
            <Icons.General.XClose style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="media-panel-search">
        <Icons.General.SearchMd style={{ width: 16, height: 16 }} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="media-search-input"
        />
      </div>

      {/* Tabs */}
      <div className="media-panel-tabs">
        <button 
          className={`media-panel-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`media-panel-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button 
          className={`media-panel-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
        <button 
          className={`media-panel-tab ${activeTab === 'bgm' ? 'active' : ''}`}
          onClick={() => setActiveTab('bgm')}
        >
          BGM
        </button>
        <button 
          className={`media-panel-tab ${activeTab === 'sfx' ? 'active' : ''}`}
          onClick={() => setActiveTab('sfx')}
        >
          SFX
        </button>
      </div>

      {/* Content */}
      <div className="media-panel-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Upload mode type
type UploadMode = 'upload-play' | 'upload-only'
type MediaCategory = 'video' | 'bgm' | 'sfx' | 'image'

// Reusable Section Component with Upload Button
function MediaboardSection({ 
  title, 
  collapsed = false, 
  onToggle, 
  children,
  showUpload = true,
  mediaCategory,
  onFileUpload
}: { 
  title: string
  collapsed?: boolean
  onToggle: () => void
  children: React.ReactNode
  showUpload?: boolean
  mediaCategory?: MediaCategory
  onFileUpload?: (file: File, mode: UploadMode, category: MediaCategory) => void
}) {
  const [uploadMode, setUploadMode] = useState<UploadMode>('upload-play')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const chevronButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !mediaCategory) return
    
    setIsUploading(true)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onFileUpload?.(file, uploadMode, mediaCategory)
    setIsUploading(false)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleModeSelect = (mode: UploadMode) => {
    setUploadMode(mode)
    setDropdownOpen(false)
  }
  
  const uploadLabel = uploadMode === 'upload-play' ? 'Upload & Play' : 'Upload'
  
  // Accept types based on category
  const getAcceptTypes = () => {
    switch (mediaCategory) {
      case 'video': return 'video/*'
      case 'bgm': 
      case 'sfx': return 'audio/*'
      case 'image': return 'image/*'
      default: return '*/*'
    }
  }
  
  return (
    <div className={`media-section ${collapsed ? 'collapsed' : ''}`}>
      <div className="media-section-header" onClick={onToggle}>
        <h3 className="media-section-title">{title}</h3>
        <div className="media-section-chevron">
          <Icons.Arrows.ChevronUp style={{ width: 20, height: 20 }} />
        </div>
      </div>
      
      {!collapsed && showUpload && (
        <div className="media-section-upload-row">
          <input 
            ref={fileInputRef}
            type="file" 
            accept={getAcceptTypes()}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="upload-split-btn">
            <button 
              className="upload-btn-main" 
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="upload-spinner" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Icons.General.UploadCloud01 style={{ width: 16, height: 16 }} />
                  <span>{uploadLabel}</span>
                </>
              )}
            </button>
            <button 
              ref={chevronButtonRef}
              className={`upload-btn-chevron ${dropdownOpen ? 'open' : ''}`}
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
            >
              <Icons.Arrows.ChevronDown style={{ width: 14, height: 14 }} />
            </button>
            <Popover
              opened={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              reference={chevronButtonRef}
              placement="bottom-end"
            >
              <div className="upload-dropdown-popover">
                <button 
                  className="upload-dropdown-item"
                  onClick={() => handleModeSelect('upload-play')}
                >
                  <span>Upload & Play</span>
                  {uploadMode === 'upload-play' && <Icons.General.Check style={{ width: 16, height: 16 }} />}
                </button>
                <button 
                  className="upload-dropdown-item"
                  onClick={() => handleModeSelect('upload-only')}
                >
                  <span>Upload Only</span>
                  {uploadMode === 'upload-only' && <Icons.General.Check style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </Popover>
          </div>
        </div>
      )}
      
      {!collapsed && children}
    </div>
  )
}

// Card Component for Images/Videos
function MediaboardCard({ 
  item, 
  showDuration = false,
  isPlaying = false,
  onClick,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDragEnd
}: { 
  item: MediaItem
  showDuration?: boolean
  isPlaying?: boolean
  onClick?: () => void
  isDragging?: boolean
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
}) {
  const { deleteMedia, renameMedia } = useMediaBoard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])
  
  const handleRename = () => {
    setMenuOpen(false)
    setIsRenaming(true)
    setNewName(item.name)
  }
  
  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== item.name) {
      renameMedia(item.id, newName.trim())
    }
    setIsRenaming(false)
  }
  
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setIsRenaming(false)
      setNewName(item.name)
    }
  }
  
  const handleDelete = () => {
    setMenuOpen(false)
    deleteMedia(item.id)
  }
  
  return (
    <div 
      className={`mediaboard-card ${isPlaying ? 'playing' : ''} ${isDragging ? 'dragging' : ''}`} 
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.() }}
      onDragEnd={onDragEnd}
    >
      <div className="mediaboard-card-thumbnail">
        {item.thumbnail && <img src={item.thumbnail} alt={item.name} />}
        <button 
          ref={menuButtonRef}
          className="mediaboard-card-menu" 
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        >
          <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
        </button>
        <Popover
          opened={menuOpen}
          onClose={() => setMenuOpen(false)}
          reference={menuButtonRef}
          placement="bottom-end"
        >
          <div className="mediaboard-card-popover">
            <button className="mediaboard-card-popover-item" onClick={handleRename}>
              <Icons.General.Edit02 style={{ width: 16, height: 16 }} />
              <span>Rename</span>
            </button>
            <button className="mediaboard-card-popover-item delete" onClick={handleDelete}>
              <Icons.General.Trash01 style={{ width: 16, height: 16 }} />
              <span>Delete</span>
            </button>
          </div>
        </Popover>
        {showDuration && item.duration && (
          <div className="mediaboard-card-duration">{item.duration}</div>
        )}
      </div>
      <div className="mediaboard-card-name">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="mediaboard-card-rename-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{item.name}</span>
        )}
      </div>
    </div>
  )
}

// BGM Item Component
function MediaboardBgmItem({ 
  item, 
  isPlaying,
  onPlay,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDragEnd
}: { 
  item: MediaItem
  isPlaying: boolean
  onPlay: () => void
  isDragging?: boolean
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
}) {
  const { deleteMedia, renameMedia } = useMediaBoard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])
  
  const handleRename = () => {
    setMenuOpen(false)
    setIsRenaming(true)
    setNewName(item.name)
  }
  
  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== item.name) {
      renameMedia(item.id, newName.trim())
    }
    setIsRenaming(false)
  }
  
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setIsRenaming(false)
      setNewName(item.name)
    }
  }
  
  const handleDelete = () => {
    setMenuOpen(false)
    deleteMedia(item.id)
  }
  
  return (
    <div 
      className={`mediaboard-bgm-item ${isPlaying ? 'playing' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.() }}
      onDragEnd={onDragEnd}
    >
      <button className="mediaboard-bgm-play" onClick={onPlay}>
        {isPlaying ? (
          <Icons.MediaDevices.Pause style={{ width: 12, height: 12 }} />
        ) : (
          <Icons.MediaDevices.PlayFill style={{ width: 12, height: 12 }} />
        )}
      </button>
      <div className="mediaboard-bgm-info">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="mediaboard-item-rename-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
          />
        ) : (
          <div className="mediaboard-bgm-name">{item.name}</div>
        )}
        <div className="mediaboard-bgm-duration">{item.duration}</div>
      </div>
      <button 
        ref={menuButtonRef}
        className="mediaboard-bgm-menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
      </button>
      <Popover
        opened={menuOpen}
        onClose={() => setMenuOpen(false)}
        reference={menuButtonRef}
        placement="bottom-end"
      >
        <div className="mediaboard-card-popover">
          <button className="mediaboard-card-popover-item" onClick={handleRename}>
            <Icons.General.Edit02 style={{ width: 16, height: 16 }} />
            <span>Rename</span>
          </button>
          <button className="mediaboard-card-popover-item delete" onClick={handleDelete}>
            <Icons.General.Trash01 style={{ width: 16, height: 16 }} />
            <span>Delete</span>
          </button>
        </div>
      </Popover>
    </div>
  )
}

// SFX Item Component with menu
function MediaboardSfxItem({ 
  item, 
  gradientClass,
  onTrigger,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDragEnd
}: { 
  item: MediaItem
  gradientClass: string
  onTrigger: () => void
  isDragging?: boolean
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
}) {
  const { deleteMedia, renameMedia } = useMediaBoard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])
  
  const handleRename = () => {
    setMenuOpen(false)
    setIsRenaming(true)
    setNewName(item.name)
  }
  
  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== item.name) {
      renameMedia(item.id, newName.trim())
    }
    setIsRenaming(false)
  }
  
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setIsRenaming(false)
      setNewName(item.name)
    }
  }
  
  const handleDelete = () => {
    setMenuOpen(false)
    deleteMedia(item.id)
  }
  
  return (
    <div 
      className={`mediaboard-sfx-btn-wrapper ${isDragging ? 'dragging' : ''}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.() }}
      onDragEnd={onDragEnd}
    >
      <button 
        className="mediaboard-sfx-btn"
        onClick={onTrigger}
      >
        <div className={`mediaboard-sfx-bg ${gradientClass}`} />
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="mediaboard-sfx-rename-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="mediaboard-sfx-name">{item.name}</span>
        )}
      </button>
      <button 
        ref={menuButtonRef}
        className="mediaboard-sfx-menu"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
      >
        <Icons.General.DotsHorizontal style={{ width: 14, height: 14 }} />
      </button>
      <Popover
        opened={menuOpen}
        onClose={() => setMenuOpen(false)}
        reference={menuButtonRef}
        placement="bottom-end"
      >
        <div className="mediaboard-card-popover">
          <button className="mediaboard-card-popover-item" onClick={handleRename}>
            <Icons.General.Edit02 style={{ width: 16, height: 16 }} />
            <span>Rename</span>
          </button>
          <button className="mediaboard-card-popover-item delete" onClick={handleDelete}>
            <Icons.General.Trash01 style={{ width: 16, height: 16 }} />
            <span>Delete</span>
          </button>
        </div>
      </Popover>
    </div>
  )
}

// ===========================================
// COLLAPSIBLE SECTIONS LAYOUT
// ===========================================

function ScrollableLayout({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  
  // Video control states (local for now)
  const [videoVolume, setVideoVolume] = useState(80)
  const [videoMuted, setVideoMuted] = useState(false)
  const [videoLooping, setVideoLooping] = useState(false)
  const [videoFading, setVideoFading] = useState(false)
  
  // Drag state for each section
  const [visualsDragIndex, setVisualsDragIndex] = useState<number | null>(null)
  const [visualsDragOverIndex, setVisualsDragOverIndex] = useState<number | null>(null)
  const [bgmDragIndex, setBgmDragIndex] = useState<number | null>(null)
  const [bgmDragOverIndex, setBgmDragOverIndex] = useState<number | null>(null)
  const [sfxDragIndex, setSfxDragIndex] = useState<number | null>(null)
  const [sfxDragOverIndex, setSfxDragOverIndex] = useState<number | null>(null)
  
  const { 
    mediaLibrary, 
    playingState, 
    triggerSfx, 
    playBgm, 
    pauseBgm, 
    playVideo,
    uploadMedia,
    triggerSfxByShortcut,
    presentImage,
    deleteMedia,
    renameMedia,
    reorderMedia,
    // Global audio controls
    globalBgmVolume,
    globalBgmMuted,
    globalBgmLooping,
    globalBgmFading,
    setGlobalBgmVolume,
    setGlobalBgmMuted,
    setGlobalBgmLooping,
    setGlobalBgmFading,
    globalSfxVolume,
    globalSfxMuted,
    setGlobalSfxVolume,
    setGlobalSfxMuted,
  } = useMediaBoard()
  
  // Handle file upload with optional auto-play
  const handleFileUpload = useCallback((file: File, mode: UploadMode, category: MediaCategory) => {
    let mediaType: 'video' | 'audio' | 'image'
    let categoryPath: string
    
    switch (category) {
      case 'video':
        mediaType = 'video'
        categoryPath = 'session'
        break
      case 'bgm':
        mediaType = 'audio'
        categoryPath = 'bgm'
        break
      case 'sfx':
        mediaType = 'audio'
        categoryPath = 'sfx'
        break
      case 'image':
        mediaType = 'image'
        categoryPath = 'session'
        break
      default:
        return
    }
    
    const newId = uploadMedia(mediaType, categoryPath, file)
    
    // If upload & play mode, auto-play the media
    if (mode === 'upload-play') {
      setTimeout(() => {
        if (category === 'video') {
          playVideo(newId)
        } else if (category === 'bgm') {
          playBgm(newId)
        } else if (category === 'sfx') {
          triggerSfx(newId)
        }
      }, 100)
    }
  }, [uploadMedia, playVideo, playBgm, triggerSfx])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 9) {
        triggerSfxByShortcut(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerSfxByShortcut])

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Drag end handlers for each section
  const handleVisualsDragEnd = useCallback(() => {
    if (visualsDragIndex !== null && visualsDragOverIndex !== null && visualsDragIndex !== visualsDragOverIndex) {
      // Determine if it's an image or video based on the index
      const imagesCount = mediaLibrary.images.session.length
      const sessionVideosCount = mediaLibrary.video.session.length
      
      // Handle reordering within the same category
      if (visualsDragIndex < imagesCount && visualsDragOverIndex < imagesCount) {
        // Both are images
        reorderMedia('images.session', visualsDragIndex, visualsDragOverIndex)
      } else if (visualsDragIndex >= imagesCount && visualsDragOverIndex >= imagesCount) {
        // Both are videos - determine which video category
        const videoFromIndex = visualsDragIndex - imagesCount
        const videoToIndex = visualsDragOverIndex - imagesCount
        if (videoFromIndex < sessionVideosCount && videoToIndex < sessionVideosCount) {
          reorderMedia('video.session', videoFromIndex, videoToIndex)
        } else if (videoFromIndex >= sessionVideosCount && videoToIndex >= sessionVideosCount) {
          reorderMedia('video.generic', videoFromIndex - sessionVideosCount, videoToIndex - sessionVideosCount)
        }
      }
    }
    setVisualsDragIndex(null)
    setVisualsDragOverIndex(null)
  }, [visualsDragIndex, visualsDragOverIndex, mediaLibrary.images.session.length, mediaLibrary.video.session.length, reorderMedia])

  const handleBgmDragEnd = useCallback(() => {
    if (bgmDragIndex !== null && bgmDragOverIndex !== null && bgmDragIndex !== bgmDragOverIndex) {
      reorderMedia('audio.bgm', bgmDragIndex, bgmDragOverIndex)
    }
    setBgmDragIndex(null)
    setBgmDragOverIndex(null)
  }, [bgmDragIndex, bgmDragOverIndex, reorderMedia])

  const handleSfxDragEnd = useCallback(() => {
    if (sfxDragIndex !== null && sfxDragOverIndex !== null && sfxDragIndex !== sfxDragOverIndex) {
      reorderMedia('audio.sfx', sfxDragIndex, sfxDragOverIndex)
    }
    setSfxDragIndex(null)
    setSfxDragOverIndex(null)
  }, [sfxDragIndex, sfxDragOverIndex, reorderMedia])

  const allImages = mediaLibrary.images.session
  const allVideos = [...mediaLibrary.video.session, ...mediaLibrary.video.generic]

  // Filter by search
  const filterBySearch = (items: MediaItem[]) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="media-board-panel media-panel-editor-style">
      {/* Header */}
      <div className="media-panel-header">
        <span className="media-panel-title">Mediaboard</span>
        <div className="media-panel-header-actions">
          <button className="media-panel-icon-btn">
            <Icons.General.UploadCloud01 style={{ width: 16, height: 16 }} />
          </button>
          <button className="media-panel-icon-btn" onClick={onClose}>
            <Icons.General.XClose style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="media-panel-search">
        <Icons.General.SearchMd style={{ width: 16, height: 16 }} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="media-search-input"
        />
      </div>

      {/* Content */}
      <div className="media-panel-content">
        <div className="media-panel-sections">
          {/* Visuals (Images + Videos) - hide section if searching and no results */}
          {(!searchQuery || filterBySearch(allImages).length > 0 || filterBySearch(allVideos).length > 0) && (
            <MediaboardSection
              title="Visuals"
              collapsed={collapsedSections.visuals}
              onToggle={() => toggleSection('visuals')}
              mediaCategory="video"
              onFileUpload={handleFileUpload}
            >
              <AudioControls
                type="bgm"
                volume={videoVolume}
                isMuted={videoMuted}
                isLooping={videoLooping}
                isFading={videoFading}
                onVolumeChange={setVideoVolume}
                onMuteToggle={() => setVideoMuted(!videoMuted)}
                onLoopToggle={() => setVideoLooping(!videoLooping)}
                onFadeToggle={() => setVideoFading(!videoFading)}
              />
              <div className="media-section-content">
                {filterBySearch(allImages).map((item, index) => {
                  const isPresenting = playingState.images.some(img => img.id === item.id && img.isPresenting)
                  return (
                    <MediaboardCard 
                      key={item.id} 
                      item={item} 
                      isPlaying={isPresenting}
                      onClick={() => presentImage(item.id)}
                      isDragging={visualsDragIndex === index}
                      onDragStart={() => setVisualsDragIndex(index)}
                      onDragOver={() => setVisualsDragOverIndex(index)}
                      onDragEnd={handleVisualsDragEnd}
                    />
                  )
                })}
                {filterBySearch(allVideos).map((item, index) => {
                  const videoState = playingState.videos.find(v => v.id === item.id)
                  const isVideoPlaying = videoState?.isPlaying && videoState?.visible
                  const visualIndex = filterBySearch(allImages).length + index
                  return (
                    <MediaboardCard 
                      key={item.id} 
                      item={item} 
                      showDuration
                      isPlaying={isVideoPlaying}
                      onClick={() => playVideo(item.id)}
                      isDragging={visualsDragIndex === visualIndex}
                      onDragStart={() => setVisualsDragIndex(visualIndex)}
                      onDragOver={() => setVisualsDragOverIndex(visualIndex)}
                      onDragEnd={handleVisualsDragEnd}
                    />
                  )
                })}
              </div>
            </MediaboardSection>
          )}

          {/* Background Music - hide section if searching and no results */}
          {(!searchQuery || filterBySearch(mediaLibrary.audio.bgm).length > 0) && (
            <MediaboardSection
              title="Background Music"
              collapsed={collapsedSections.bgm}
              onToggle={() => toggleSection('bgm')}
              mediaCategory="bgm"
              onFileUpload={handleFileUpload}
            >
              <AudioControls
                type="bgm"
                volume={globalBgmVolume}
                isMuted={globalBgmMuted}
                isLooping={globalBgmLooping}
                isFading={globalBgmFading}
                onVolumeChange={setGlobalBgmVolume}
                onMuteToggle={() => setGlobalBgmMuted(!globalBgmMuted)}
                onLoopToggle={() => setGlobalBgmLooping(!globalBgmLooping)}
                onFadeToggle={() => setGlobalBgmFading(!globalBgmFading)}
              />
              <div className="media-section-content" style={{ flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
                {filterBySearch(mediaLibrary.audio.bgm).map((item, index) => {
                  const isPlaying = playingState.bgm.some(b => b.id === item.id && b.isPlaying)
                  return (
                    <MediaboardBgmItem 
                      key={item.id} 
                      item={item}
                      isPlaying={isPlaying}
                      onPlay={() => isPlaying ? pauseBgm(item.id) : playBgm(item.id)}
                      isDragging={bgmDragIndex === index}
                      onDragStart={() => setBgmDragIndex(index)}
                      onDragOver={() => setBgmDragOverIndex(index)}
                      onDragEnd={handleBgmDragEnd}
                    />
                  )
                })}
              </div>
            </MediaboardSection>
          )}

          {/* Sound FX - hide section if searching and no results */}
          {(!searchQuery || filterBySearch(mediaLibrary.audio.sfx).length > 0) && (
            <MediaboardSection
              title="Sound FX"
              collapsed={collapsedSections.sfx}
              onToggle={() => toggleSection('sfx')}
              mediaCategory="sfx"
              onFileUpload={handleFileUpload}
            >
              <SfxAudioControls
                volume={globalSfxVolume}
                isMuted={globalSfxMuted}
                onVolumeChange={setGlobalSfxVolume}
                onMuteToggle={() => setGlobalSfxMuted(!globalSfxMuted)}
              />
              <div className="mediaboard-sfx-grid">
                {filterBySearch(mediaLibrary.audio.sfx).map((item, index) => (
                  <MediaboardSfxItem 
                    key={item.id} 
                    item={item}
                    gradientClass={SFX_GRADIENTS[index % SFX_GRADIENTS.length]}
                    onTrigger={() => triggerSfx(item.id)}
                    isDragging={sfxDragIndex === index}
                    onDragStart={() => setSfxDragIndex(index)}
                    onDragOver={() => setSfxDragOverIndex(index)}
                    onDragEnd={handleSfxDragEnd}
                  />
                ))}
              </div>
            </MediaboardSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// STREAM DECK LAYOUT
// ===========================================

type StreamDeckTab = 'deck' | 'assets'

// Apple-style gradient colors
const BUTTON_COLORS = [
  'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', // Blue to Purple
  'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', // Purple to Magenta
  'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)', // Pink to Orange
  'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', // Orange to Yellow
  'linear-gradient(135deg, #34C759 0%, #30D158 100%)', // Green
  'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', // Teal to Blue
  'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)', // Light Blue
  'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)', // Magenta to Pink
  'linear-gradient(135deg, #8E8E93 0%, #636366 100%)', // Gray
  'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)', // Dark
]

// Icon options for stream deck buttons - using only verified Riverstyle icons
const BUTTON_ICON_OPTIONS: { id: string; icon: React.ReactNode; label: string }[] = [
  // Media controls - verified working
  { id: 'play', icon: <Icons.MediaDevices.Play style={{ width: 24, height: 24 }} />, label: 'Play' },
  { id: 'pause', icon: <Icons.MediaDevices.Pause style={{ width: 24, height: 24 }} />, label: 'Pause' },
  { id: 'stop', icon: <Icons.MediaDevices.Stop style={{ width: 24, height: 24 }} />, label: 'Stop' },
  { id: 'clapperboard', icon: <Icons.MediaDevices.Clapperboard style={{ width: 24, height: 24 }} />, label: 'Clapperboard' },
  { id: 'music', icon: <Icons.MediaDevices.MusicNote01 style={{ width: 24, height: 24 }} />, label: 'Music' },
  { id: 'bell', icon: <Icons.AlertsFeedback.BellRinging01 style={{ width: 24, height: 24 }} />, label: 'Bell' },
  { id: 'thumbs', icon: <Icons.AlertsFeedback.ThumbsUp style={{ width: 24, height: 24 }} />, label: 'Thumbs Up' },
  { id: 'disc', icon: <Icons.MediaDevices.Disc01 style={{ width: 24, height: 24 }} />, label: 'Disc' },
  { id: 'tv', icon: <Icons.MediaDevices.Tv02 style={{ width: 24, height: 24 }} />, label: 'TV' },
  { id: 'mic', icon: <Icons.MediaDevices.Microphone01 style={{ width: 24, height: 24 }} />, label: 'Mic' },
  { id: 'mic-off', icon: <Icons.MediaDevices.Microphone02 style={{ width: 24, height: 24 }} />, label: 'Mic Alt' },
  { id: 'lightbulb', icon: <Icons.MediaDevices.Lightbulb02 style={{ width: 24, height: 24 }} />, label: 'Lightbulb' },
  { id: 'star', icon: <Icons.Shapes.Star01 style={{ width: 24, height: 24 }} />, label: 'Star' },
  { id: 'volume', icon: <Icons.MediaDevices.VolumeMax style={{ width: 24, height: 24 }} />, label: 'Volume' },
  { id: 'video', icon: <Icons.MediaDevices.VideoRecorder style={{ width: 24, height: 24 }} />, label: 'Video' },
  { id: 'film', icon: <Icons.MediaDevices.Film01 style={{ width: 24, height: 24 }} />, label: 'Film' },
  { id: 'podcast', icon: <Icons.MediaDevices.Podcast style={{ width: 24, height: 24 }} />, label: 'Podcast' },
  { id: 'recording', icon: <Icons.MediaDevices.Recording01 style={{ width: 24, height: 24 }} />, label: 'Recording' },
  // Participants - verified working
  { id: 'user', icon: <Icons.Users.UserPlus01 style={{ width: 24, height: 24 }} />, label: 'Add User' },
  { id: 'users', icon: <Icons.Users.UsersPlus style={{ width: 24, height: 24 }} />, label: 'Users' },
  // Screen & Layout - verified working
  { id: 'monitor', icon: <Icons.MediaDevices.Monitor01 style={{ width: 24, height: 24 }} />, label: 'Monitor' },
  { id: 'fullscreen', icon: <Icons.Shapes.Square style={{ width: 24, height: 24 }} />, label: 'Full Screen' },
  { id: 'grid', icon: <Icons.Layout.LayoutGrid01 style={{ width: 24, height: 24 }} />, label: 'Grid' },
  { id: 'split', icon: <Icons.Layout.LayoutLeft style={{ width: 24, height: 24 }} />, label: 'Split Screen' },
  { id: 'layout', icon: <Icons.Layout.LayoutAlt04 style={{ width: 24, height: 24 }} />, label: 'Layout' },
  { id: 'pip', icon: <Icons.Layout.LayoutBottom style={{ width: 24, height: 24 }} />, label: 'PiP' },
  { id: 'image', icon: <Icons.Images.Image01 style={{ width: 24, height: 24 }} />, label: 'Image' },
  { id: 'folder', icon: <Icons.Files.Folder style={{ width: 24, height: 24 }} />, label: 'Folder' },
  // Navigation - verified working
  { id: 'up', icon: <Icons.Arrows.ChevronUp style={{ width: 24, height: 24 }} />, label: 'Up' },
  { id: 'down', icon: <Icons.Arrows.ChevronDown style={{ width: 24, height: 24 }} />, label: 'Down' },
  { id: 'right', icon: <Icons.Arrows.ChevronRight style={{ width: 24, height: 24 }} />, label: 'Right' },
  { id: 'refresh', icon: <Icons.Arrows.ReverseLeft style={{ width: 24, height: 24 }} />, label: 'Refresh' },
  // Communication - verified working
  { id: 'message', icon: <Icons.Communications.MessageChatCircle style={{ width: 24, height: 24 }} />, label: 'Message' },
  // General - verified working
  { id: 'check', icon: <Icons.General.Check style={{ width: 24, height: 24 }} />, label: 'Check' },
  { id: 'x', icon: <Icons.General.XClose style={{ width: 24, height: 24 }} />, label: 'Close' },
  { id: 'settings', icon: <Icons.General.Settings02 style={{ width: 24, height: 24 }} />, label: 'Settings' },
  { id: 'home', icon: <Icons.General.Home05 style={{ width: 24, height: 24 }} />, label: 'Home' },
  { id: 'help', icon: <Icons.General.HelpCircle style={{ width: 24, height: 24 }} />, label: 'Help' },
  { id: 'upload', icon: <Icons.General.UploadCloud01 style={{ width: 24, height: 24 }} />, label: 'Upload' },
  { id: 'search', icon: <Icons.General.SearchMd style={{ width: 24, height: 24 }} />, label: 'Search' },
  { id: 'brand', icon: <Icons.General.Brand style={{ width: 24, height: 24 }} />, label: 'Brand' },
  { id: 'signal', icon: <Icons.MediaDevices.Signal01 style={{ width: 24, height: 24 }} />, label: 'Signal' },
  { id: 'sparkles', icon: <Icons.Weather.Stars01 style={{ width: 24, height: 24 }} />, label: 'Sparkles' },
]

// Helper to get icon component by id
function getButtonIcon(iconId: string | undefined): React.ReactNode {
  const iconOption = BUTTON_ICON_OPTIONS.find(opt => opt.id === iconId)
  return iconOption?.icon || BUTTON_ICON_OPTIONS[0].icon
}

function StreamDeckButtonComponent({ 
  button, 
  onTrigger, 
  onEdit,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isTriggered,
  isPlaying
}: { 
  button: StreamDeckButton
  onTrigger: () => void
  onEdit: () => void
  onDragStart: () => void
  onDragOver: () => void
  onDragEnd: () => void
  isDragging: boolean
  isTriggered: boolean
  isPlaying: boolean
}) {
  const { getMediaById } = useMediaBoard()
  const media = button.mediaId ? getMediaById(button.mediaId) : undefined
  
  // Check if media is a video with a thumbnail
  const isVideo = media?.type === 'video'
  const hasThumbnail = isVideo && media?.thumbnail
  
  // Only show audio bars for media buttons, not state buttons
  const isMediaButton = Boolean(button.mediaId)
  const isStateButton = Boolean(button.action)

  // Extract primary color from gradient for playing indicator
  const extractPrimaryColor = (colorStr: string): string => {
    // Match hex colors in the gradient
    const hexMatch = colorStr.match(/#[0-9A-Fa-f]{6}/)
    if (hexMatch) return hexMatch[0]
    // Match rgb/rgba colors
    const rgbMatch = colorStr.match(/rgb\([^)]+\)/)
    if (rgbMatch) return rgbMatch[0]
    return '#007AFF' // fallback
  }
  
  const primaryColor = extractPrimaryColor(button.color)

  const iconWrapperStyle: React.CSSProperties = hasThumbnail
    ? {
        backgroundImage: `url(${media.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: button.color,
      }

  const buttonClasses = [
    'stream-deck-button',
    isDragging ? 'dragging' : '',
    hasThumbnail ? 'has-thumbnail' : '',
    isTriggered ? 'triggered' : '',
    isPlaying ? 'playing' : '',
    isStateButton && isPlaying ? 'active-state' : ''
  ].filter(Boolean).join(' ')

  const buttonStyle = {
    '--button-color': primaryColor,
  } as React.CSSProperties

  return (
    <div 
      className={buttonClasses}
      style={buttonStyle}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragEnd={onDragEnd}
      onClick={onTrigger}
      onContextMenu={(e) => { e.preventDefault(); onEdit() }}
    >
      <div className="sd-button-icon-wrapper" style={iconWrapperStyle}>
        {/* Overlay for video thumbnails */}
        {hasThumbnail && <div className="sd-button-overlay" />}
        
        <div className="sd-button-icon">{getButtonIcon(button.icon)}</div>
        
        <div className="sd-button-name">{button.name}</div>
        
        {button.keyBinding && (
          <div className="sd-button-key">{button.keyBinding}</div>
        )}
        
        {/* Playing indicator - only show bars for media buttons */}
        {isPlaying && isMediaButton && (
          <div className="sd-button-playing">
            <div className="sd-playing-bars">
              <span /><span /><span />
            </div>
          </div>
        )}
        
        <button 
          className="sd-button-edit"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
        >
          <Icons.General.DotsHorizontal style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  )
}

// Action options for stage control
const ACTION_TYPE_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: '', label: 'None (Media Only)', icon: 'play' },
  { value: 'layout-solo', label: 'Layout: Solo', icon: 'layout' },
  { value: 'layout-split', label: 'Layout: Split', icon: 'layout' },
  { value: 'layout-grid', label: 'Layout: Grid', icon: 'grid' },
  { value: 'layout-pip', label: 'Layout: PiP', icon: 'monitor' },
  { value: 'screen-share', label: 'Screen Share', icon: 'monitor' },
  { value: 'banner', label: 'Toggle Banner', icon: 'text' },
  { value: 'branding', label: 'Toggle Branding', icon: 'star' },
  { value: 'mute-all', label: 'Mute All', icon: 'mic-off' },
]

function StreamDeckButtonEditor({
  button,
  onClose,
  onSave,
  onDelete
}: {
  button: StreamDeckButton
  onClose: () => void
  onSave: (updates: Partial<StreamDeckButton>) => void
  onDelete: () => void
}) {
  const { mediaLibrary } = useMediaBoard()
  const [name, setName] = useState(button.name)
  const [color, setColor] = useState(button.color)
  const [icon, setIcon] = useState(button.icon || 'play')
  const [keyBinding, setKeyBinding] = useState(button.keyBinding || '')
  const [mediaId, setMediaId] = useState(button.mediaId || '')
  const [mediaType, setMediaType] = useState<'video' | 'audio' | undefined>(button.mediaType as 'video' | 'audio' | undefined)
  const [action, setAction] = useState(button.action || '')
  
  // Key recording state
  const [isRecording, setIsRecording] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const keyInputRef = useRef<HTMLDivElement>(null)

  // Format key for display
  const formatKey = useCallback((key: string): string => {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'Control': 'Ctrl',
      'Meta': 'Cmd',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
    }
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }, [])

  // Handle key recording
  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.add(e.key)
        return newSet
      })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      // When a key is released, save the current combination
      if (pressedKeys.size > 0) {
        const modifiers = ['Control', 'Alt', 'Shift', 'Meta']
        const modifierKeys = Array.from(pressedKeys).filter(k => modifiers.includes(k))
        const regularKeys = Array.from(pressedKeys).filter(k => !modifiers.includes(k))
        
        // Build the key combination string
        const parts = [...modifierKeys.map(formatKey), ...regularKeys.map(formatKey)]
        const binding = parts.join('+')
        
        setKeyBinding(binding)
        setPressedKeys(new Set())
        setIsRecording(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [isRecording, pressedKeys, formatKey])

  // Click outside to stop recording
  useEffect(() => {
    if (!isRecording) return

    const handleClickOutside = (e: MouseEvent) => {
      if (keyInputRef.current && !keyInputRef.current.contains(e.target as Node)) {
        setIsRecording(false)
        setPressedKeys(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isRecording])

  // Get all media for selection
  const allMedia: MediaItem[] = [
    ...mediaLibrary.video.session,
    ...mediaLibrary.video.generic,
    ...mediaLibrary.audio.bgm,
    ...mediaLibrary.audio.sfx,
  ]

  const handleSave = () => {
    onSave({ 
      name, 
      color, 
      icon, 
      keyBinding: keyBinding || undefined, 
      mediaId: action ? undefined : (mediaId || undefined),  // Clear media if action is set
      mediaType: action ? undefined : mediaType,
      action: action || undefined 
    })
    onClose()
  }

  const handleMediaSelect = (id: string) => {
    const media = allMedia.find(m => m.id === id)
    setMediaId(id)
    setMediaType(media?.type as 'video' | 'audio' | undefined)
  }

  return (
    <div className="sd-editor-overlay" onClick={onClose}>
      <div className="sd-editor-modal" onClick={e => e.stopPropagation()}>
        <div className="sd-editor-header">
          <h3>Edit Button</h3>
          <button onClick={onClose}>
            <Icons.General.XClose style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="sd-editor-content">
          <div className="sd-editor-field">
            <label>Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Button name"
            />
          </div>

          <div className="sd-editor-field">
            <label>Color</label>
            <div className="sd-color-picker">
              {BUTTON_COLORS.map(c => (
                <button
                  key={c}
                  className={`sd-color-option ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="sd-editor-field">
            <label>Icon</label>
            <div className="sd-icon-picker">
              {BUTTON_ICON_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`sd-icon-option ${icon === opt.id ? 'selected' : ''}`}
                  onClick={() => setIcon(opt.id)}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="sd-editor-field">
            <label>Keyboard Shortcut</label>
            <div 
              ref={keyInputRef}
              className={`sd-key-recorder ${isRecording ? 'recording' : ''}`}
              onClick={() => {
                setIsRecording(true)
                setPressedKeys(new Set())
              }}
              tabIndex={0}
            >
              {isRecording ? (
                pressedKeys.size > 0 ? (
                  <span className="sd-key-display">
                    {Array.from(pressedKeys).map(formatKey).join(' + ')}
                  </span>
                ) : (
                  <span className="sd-key-placeholder">Press any key combination...</span>
                )
              ) : (
                keyBinding ? (
                  <span className="sd-key-display">{keyBinding}</span>
                ) : (
                  <span className="sd-key-placeholder">Click to record shortcut</span>
                )
              )}
              {keyBinding && !isRecording && (
                <button 
                  className="sd-key-clear"
                  onClick={(e) => {
                    e.stopPropagation()
                    setKeyBinding('')
                  }}
                >
                  <Icons.General.XClose style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
          </div>

          <div className="sd-editor-field">
            <label>Button Action</label>
            <select 
              value={action} 
              onChange={e => setAction(e.target.value)}
              className="sd-action-select"
            >
              {ACTION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {!action && (
          <div className="sd-editor-field">
            <label>Assigned Media</label>
            <select 
              value={mediaId} 
              onChange={e => handleMediaSelect(e.target.value)}
            >
              <option value="">-- Select Media --</option>
              <optgroup label="Videos">
                {[...mediaLibrary.video.session, ...mediaLibrary.video.generic].map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Background Music">
                {mediaLibrary.audio.bgm.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Sound Effects">
                {mediaLibrary.audio.sfx.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          )}
        </div>

        <div className="sd-editor-footer">
          <button className="sd-delete-btn" onClick={onDelete}>
            <Icons.General.Trash01 style={{ width: 16, height: 16 }} />
            Delete
          </button>
          <div className="sd-editor-actions">
            <button className="sd-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="sd-save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================
// STAGE CONTROL COMPONENT (Participants Only)
// ===========================================

function StageControl() {
  const { 
    stageControl, 
    toggleParticipantStage,
    toggleParticipantMute,
    toggleParticipantSpotlight,
  } = useMediaBoard()
  
  return (
    <div className="stage-control">
      <div className="stage-control-header">
        <span className="stage-control-title">Participants</span>
        <span className="stage-control-live-badge">
          <span className="live-dot" />
          LIVE
        </span>
      </div>
      
      {/* All Participants in one grid */}
      <div className="stage-deck-grid participants">
        {stageControl.participants.map(p => (
          <div
            key={p.id}
            className={`stage-deck-btn participant ${p.isOnStage ? '' : 'backstage'} ${p.isSpotlighted ? 'spotlighted' : ''} ${p.isMuted ? 'muted' : ''}`}
            onClick={() => p.isOnStage ? toggleParticipantSpotlight(p.id) : toggleParticipantStage(p.id)}
            onContextMenu={(e) => { e.preventDefault(); toggleParticipantStage(p.id) }}
          >
            <div 
              className={`stage-deck-btn-icon participant-icon ${p.isOnStage ? '' : 'backstage'}`}
              style={p.avatar ? { 
                backgroundImage: `url(${p.avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {
                background: !p.isOnStage 
                  ? 'rgba(255,255,255,0.08)'
                  : p.isSpotlighted 
                    ? 'linear-gradient(135deg, #FFCC00 0%, #FF9500 100%)' 
                    : 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
              }}
            >
              {!p.avatar && <span className="participant-initial">{p.name.charAt(0)}</span>}
              {p.isMuted && p.isOnStage && <span className="participant-muted-badge">🔇</span>}
              {p.avatar && !p.isOnStage && <div className="participant-avatar-overlay" />}
            </div>
            <span className="stage-deck-btn-label">{p.name}</span>
            {p.isOnStage && (
              <div className="participant-quick-actions">
                <div 
                  className="pq-action"
                  onClick={(e) => { e.stopPropagation(); toggleParticipantMute(p.id) }}
                >
                  <Icons.MediaDevices.Microphone01 style={{ width: 10, height: 10 }} />
                </div>
                <div 
                  className="pq-action remove"
                  onClick={(e) => { e.stopPropagation(); toggleParticipantStage(p.id) }}
                >
                  <Icons.General.XClose style={{ width: 10, height: 10 }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ===========================================
// STREAM DECK GRID
// ===========================================

function StreamDeckGrid() {
  const { 
    streamDeckButtons, 
    addStreamDeckButton, 
    removeStreamDeckButton,
    updateStreamDeckButton,
    reorderStreamDeckButtons,
    triggerStreamDeckButton,
    loadStreamDeckPreset,
    clearStreamDeck,
    playingState
  } = useMediaBoard()
  
  const [editingButton, setEditingButton] = useState<StreamDeckButton | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [triggeredButtons, setTriggeredButtons] = useState<Set<string>>(new Set())

  // Get stage control state for checking action button states
  const { stageControl } = useMediaBoard()
  
  // Check if a button's media is currently playing or action is active
  const isButtonPlaying = useCallback((button: StreamDeckButton): boolean => {
    // Check for stage control actions
    if (button.action) {
      switch (button.action) {
        case 'layout-solo': return stageControl.layout === 'solo'
        case 'layout-split': return stageControl.layout === 'split'
        case 'layout-grid': return stageControl.layout === 'grid'
        case 'layout-pip': return stageControl.layout === 'pip'
        case 'screen-share': return stageControl.isScreenSharing
        case 'banner': return stageControl.showBanner
        case 'branding': return stageControl.showBranding
        default: return false
      }
    }
    
    if (!button.mediaId || !button.mediaType) return false
    
    if (button.mediaType === 'video') {
      const videoState = playingState.videos.find(v => v.id === button.mediaId)
      return videoState?.isPlaying ?? false
    } else if (button.mediaType === 'audio') {
      // Check BGM
      const bgmState = playingState.bgm.find(b => b.id === button.mediaId)
      if (bgmState?.isPlaying) return true
      // Check SFX (briefly true when triggered)
      const sfxState = playingState.sfx.find(s => s.id === button.mediaId)
      return sfxState?.isPlaying ?? false
    }
    return false
  }, [playingState, stageControl])

  // Trigger button with animation
  const handleTrigger = useCallback((buttonId: string) => {
    // Add to triggered set for animation
    setTriggeredButtons(prev => new Set(prev).add(buttonId))
    
    // Remove after animation completes
    setTimeout(() => {
      setTriggeredButtons(prev => {
        const next = new Set(prev)
        next.delete(buttonId)
        return next
      })
    }, 150)
    
    triggerStreamDeckButton(buttonId)
  }, [triggerStreamDeckButton])

  // Build key combination string from keyboard event
  const buildKeyString = useCallback((e: KeyboardEvent): string => {
    const parts: string[] = []
    
    // Add modifiers in consistent order
    if (e.ctrlKey) parts.push('Ctrl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    if (e.metaKey) parts.push('Cmd')
    
    // Add the main key (skip if it's just a modifier)
    const modifierKeys = ['Control', 'Alt', 'Shift', 'Meta']
    if (!modifierKeys.includes(e.key)) {
      // Format the key name
      const keyMap: Record<string, string> = {
        ' ': 'Space',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
      }
      const formattedKey = keyMap[e.key] || e.key.charAt(0).toUpperCase() + e.key.slice(1)
      parts.push(formattedKey)
    }
    
    return parts.join('+')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      // Build the key combination string
      const keyString = buildKeyString(e)
      
      // Find matching button (case-insensitive)
      const button = streamDeckButtons.find(b => 
        b.keyBinding?.toUpperCase() === keyString.toUpperCase()
      )
      
      if (button) {
        // Prevent default browser action and stop propagation
        e.preventDefault()
        e.stopPropagation()
        handleTrigger(button.id)
      }
    }
    // Use capture phase to intercept before browser handles it
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [streamDeckButtons, handleTrigger, buildKeyString])

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorderStreamDeckButtons(dragIndex, dragOverIndex)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="stream-deck-container">
      {/* Preset dropdown */}
      <div className="stream-deck-preset-bar">
        <select 
          className="stream-deck-preset-select"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              loadStreamDeckPreset(e.target.value)
            }
          }}
        >
          <option value="">Load Preset...</option>
          {STREAM_DECK_PRESETS.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        {streamDeckButtons.length > 0 && (
          <button className="stream-deck-clear-btn" onClick={clearStreamDeck}>
            Clear All
          </button>
        )}
      </div>
      
      <div className="stream-deck-grid">
        {streamDeckButtons.map((button, index) => (
          <StreamDeckButtonComponent
            key={button.id}
            button={button}
            onTrigger={() => handleTrigger(button.id)}
            onEdit={() => setEditingButton(button)}
            onDragStart={() => setDragIndex(index)}
            onDragOver={() => setDragOverIndex(index)}
            onDragEnd={handleDragEnd}
            isDragging={dragIndex === index}
            isTriggered={triggeredButtons.has(button.id)}
            isPlaying={isButtonPlaying(button)}
          />
        ))}
        
        {/* Add button */}
        <button className="stream-deck-add" onClick={addStreamDeckButton}>
          <div className="stream-deck-add-icon">
            <Icons.General.Plus style={{ width: 28, height: 28 }} />
            <span>Add</span>
          </div>
        </button>
      </div>

      {/* Edit modal */}
      {editingButton && (
        <StreamDeckButtonEditor
          button={editingButton}
          onClose={() => setEditingButton(null)}
          onSave={(updates) => updateStreamDeckButton(editingButton.id, updates)}
          onDelete={() => {
            removeStreamDeckButton(editingButton.id)
            setEditingButton(null)
          }}
        />
      )}
    </div>
  )
}

function AssetsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const { mediaLibrary, playingState, triggerSfx, playBgm, pauseBgm, playVideo, triggerSfxByShortcut } = useMediaBoard()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 9) {
        triggerSfxByShortcut(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerSfxByShortcut])

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const allImages = mediaLibrary.images.session
  const allVideos = [...mediaLibrary.video.session, ...mediaLibrary.video.generic]

  const filterBySearch = (items: MediaItem[]) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="media-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <div className="media-panel-search" style={{ margin: '0 12px 12px 12px' }}>
        <Icons.General.SearchMd style={{ width: 16, height: 16 }} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="media-search-input"
        />
      </div>

      <div className="media-panel-sections" style={{ flex: 1 }}>
        {/* Images */}
        <MediaboardSection
          title="Images"
          collapsed={collapsedSections.images}
          onToggle={() => toggleSection('images')}
        >
          <div className="media-section-content">
            {filterBySearch(allImages).map(item => (
              <MediaboardCard key={item.id} item={item} />
            ))}
          </div>
        </MediaboardSection>

        {/* Videos */}
        <MediaboardSection
          title="Videos"
          collapsed={collapsedSections.videos}
          onToggle={() => toggleSection('videos')}
        >
          <div className="media-section-content">
            {filterBySearch(allVideos).map(item => {
              const videoState = playingState.videos.find(v => v.id === item.id)
              const isVideoPlaying = videoState?.isPlaying && videoState?.visible
              return (
                <MediaboardCard 
                  key={item.id} 
                  item={item} 
                  showDuration
                  isPlaying={isVideoPlaying}
                  onClick={() => playVideo(item.id)}
                />
              )
            })}
          </div>
        </MediaboardSection>

        {/* Background Music */}
        <MediaboardSection
          title="Background music"
          collapsed={collapsedSections.bgm}
          onToggle={() => toggleSection('bgm')}
        >
          <div className="media-section-content" style={{ flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
            {filterBySearch(mediaLibrary.audio.bgm).map(item => {
              const isPlaying = playingState.bgm.some(b => b.id === item.id && b.isPlaying)
              return (
                <MediaboardBgmItem 
                  key={item.id} 
                  item={item}
                  isPlaying={isPlaying}
                  onPlay={() => isPlaying ? pauseBgm(item.id) : playBgm(item.id)}
                />
              )
            })}
          </div>
        </MediaboardSection>

        {/* Sound FX */}
        <MediaboardSection
          title="Sound FX"
          collapsed={collapsedSections.sfx}
          onToggle={() => toggleSection('sfx')}
        >
          <div className="mediaboard-sfx-grid">
            {filterBySearch(mediaLibrary.audio.sfx).map((item, index) => (
              <button 
                key={item.id} 
                className="mediaboard-sfx-btn"
                onClick={() => triggerSfx(item.id)}
              >
                <div className={`mediaboard-sfx-bg ${SFX_GRADIENTS[index % SFX_GRADIENTS.length]}`} />
                <span className="mediaboard-sfx-name">{item.name}</span>
              </button>
            ))}
          </div>
        </MediaboardSection>
      </div>
    </div>
  )
}

function StreamDeckLayout({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<StreamDeckTab>('deck')

  return (
    <div className="media-board-panel media-panel-editor-style">
      {/* Header */}
      <div className="media-panel-header">
        <span className="media-panel-title">Stream Deck</span>
        <div className="media-panel-header-actions">
          <button className="media-panel-icon-btn" onClick={onClose}>
            <Icons.General.XClose style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="stream-deck-tabs">
        <button 
          className={`stream-deck-tab ${activeTab === 'deck' ? 'active' : ''}`}
          onClick={() => setActiveTab('deck')}
        >
          Deck
        </button>
        <button 
          className={`stream-deck-tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </div>

      {activeTab === 'deck' ? (
        <div className="media-panel-content" style={{ padding: 0 }}>
          <StageControl />
          <div className="stage-deck-divider">
            <span>Media Deck</span>
          </div>
          <StreamDeckGrid />
        </div>
      ) : (
        <AssetsTab />
      )}
    </div>
  )
}

// ===========================================
// MAIN EXPORT
// ===========================================

export function MediaBoardPanel({ onClose, layout = 'collapsible' }: MediaBoardPanelProps) {
  if (layout === 'streamdeck') {
    return <StreamDeckLayout onClose={onClose} />
  }
  if (layout === 'collapsible') {
    return <ScrollableLayout onClose={onClose} />
  }
  return <TabsLayout onClose={onClose} />
}
