/**
 * MEDIA CARD
 * 
 * Card component for media items showing thumbnail, name, duration, 
 * type icon, options menu, and drag handle.
 * 
 * For videos: includes visibility toggle, play/pause, volume, mute, and menu.
 */

import { useState } from 'react'
import { Icons } from '@riversidefm/riverstyle'
import { useMediaBoard, MediaItem } from './MediaBoardContext'

interface MediaCardProps {
  item: MediaItem
  index: number
  isPlaying?: boolean
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
}

export function MediaCard({ 
  item, 
  index, 
  isPlaying = false,
  onDragStart, 
  onDragOver, 
  onDragEnd 
}: MediaCardProps) {
  const { 
    deleteMedia, 
    renameMedia, 
    playVideo, 
    pauseVideo,
    setVideoVolume,
    toggleVideoMute,
    toggleVideoVisibility,
    getVideoState,
  } = useMediaBoard()
  
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)

  // Get video state for video items
  const videoState = item.type === 'video' ? getVideoState(item.id) : undefined
  const volume = videoState?.volume ?? 80
  const muted = videoState?.muted ?? false
  const visible = videoState?.visible ?? false
  const currentTime = videoState?.currentTime ?? 0
  const duration = videoState?.duration ?? 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      renameMedia(item.id, newName.trim())
    }
    setIsRenaming(false)
    setShowMenu(false)
  }

  const handleDelete = () => {
    deleteMedia(item.id)
    setShowMenu(false)
  }

  const handlePlayClick = () => {
    if (item.type === 'video') {
      if (isPlaying) {
        pauseVideo(item.id)
      } else {
        playVideo(item.id)
      }
    }
  }

  const handleThumbnailClick = () => {
    if (item.type === 'video') {
      // Clicking thumbnail shows video in center stage and starts playing
      playVideo(item.id)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoVolume(item.id, parseInt(e.target.value))
  }

  const getTypeIcon = () => {
    switch (item.type) {
      case 'video':
        return <Icons.MediaDevices.VideoRecorder style={{ width: 14, height: 14 }} />
      case 'audio':
        return <Icons.MediaDevices.MusicNote01 style={{ width: 14, height: 14 }} />
      case 'image':
        return <Icons.Images.Image01 style={{ width: 14, height: 14 }} />
      default:
        return null
    }
  }

  // Render video card with full controls
  if (item.type === 'video') {
    return (
      <div 
        className={`media-card video-card ${isPlaying ? 'playing' : ''} ${visible ? 'visible-on-stream' : ''}`}
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
        onDragEnd={onDragEnd}
      >
        {/* Thumbnail */}
        <div className="media-card-thumbnail" onClick={handleThumbnailClick}>
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.name} />
          ) : (
            <div className="media-card-placeholder">
              {getTypeIcon()}
            </div>
          )}

          {/* Duration badge */}
          {item.duration && (
            <span className="media-card-duration">{item.duration}</span>
          )}

          {/* Visible indicator */}
          {visible && (
            <span className="media-card-live-badge">LIVE</span>
          )}
        </div>

        {/* Video controls row */}
        <div className="video-card-controls">
          {/* Visibility toggle */}
          <button 
            className={`video-control-btn ${visible ? 'active' : ''}`}
            onClick={() => toggleVideoVisibility(item.id)}
            title={visible ? 'Hide from stream' : 'Show on stream'}
          >
            <Icons.MediaDevices.Signal01 style={{ width: 16, height: 16 }} />
          </button>

          {/* Play/Pause */}
          <button 
            className={`video-control-btn ${isPlaying ? 'active' : ''}`}
            onClick={handlePlayClick}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Icons.MediaDevices.Pause style={{ width: 16, height: 16 }} />
            ) : (
              <Icons.MediaDevices.PlayFill style={{ width: 16, height: 16 }} />
            )}
          </button>

          {/* Mute/Unmute */}
          <button 
            className={`video-control-btn ${muted ? 'muted' : ''}`}
            onClick={() => toggleVideoMute(item.id)}
            title={muted ? 'Unmute' : 'Mute'}
          >
            <Icons.MediaDevices.VolumeMax style={{ width: 16, height: 16 }} />
          </button>

          {/* Volume slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="video-volume-slider"
            title={`Volume: ${volume}%`}
          />

          {/* Options menu */}
          <div className="media-card-menu-wrapper">
            <button 
              className="video-control-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
            >
              <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
            </button>

            {showMenu && (
              <div className="media-card-menu">
                <button onClick={() => { setIsRenaming(true); setShowMenu(false) }}>
                  <Icons.Editor.Type01 style={{ width: 14, height: 14 }} />
                  <span>Rename</span>
                </button>
                <button onClick={handleDelete} className="delete">
                  <Icons.General.Trash01 style={{ width: 14, height: 14 }} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar (shows when playing or has progress) */}
        {(isPlaying || currentTime > 0) && duration > 0 && (
          <div className="video-card-progress-row">
            <span className="video-card-time">{formatTime(currentTime)}</span>
            <div className="video-card-progress-bar">
              <div 
                className="video-card-progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="video-card-time">{formatTime(duration)}</span>
          </div>
        )}

        {/* Name row */}
        <div className="video-card-name-row">
          {isRenaming ? (
            <input
              type="text"
              className="media-card-name-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') { setIsRenaming(false); setNewName(item.name) }
              }}
              autoFocus
            />
          ) : (
            <span className="media-card-name" title={item.name}>{item.name}</span>
          )}
        </div>
      </div>
    )
  }

  // Render standard card for non-video items
  return (
    <div 
      className={`media-card ${isPlaying ? 'playing' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDragEnd={onDragEnd}
    >
      {/* Thumbnail */}
      <div className="media-card-thumbnail">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} />
        ) : (
          <div className="media-card-placeholder">
            {getTypeIcon()}
          </div>
        )}

        {/* Duration badge */}
        {item.duration && (
          <span className="media-card-duration">{item.duration}</span>
        )}
      </div>

      {/* Info row */}
      <div className="media-card-info">
        {/* Drag handle */}
        <div className="media-card-drag-handle">
          <Icons.General.DotsHorizontal style={{ width: 14, height: 14 }} />
        </div>

        {/* Type icon */}
        <span className="media-card-type-icon">{getTypeIcon()}</span>

        {/* Name */}
        {isRenaming ? (
          <input
            type="text"
            className="media-card-name-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setIsRenaming(false); setNewName(item.name) }
            }}
            autoFocus
          />
        ) : (
          <span className="media-card-name" title={item.name}>{item.name}</span>
        )}

        {/* Options menu */}
        <div className="media-card-menu-wrapper">
          <button 
            className="media-card-menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
          </button>

          {showMenu && (
            <div className="media-card-menu">
              <button onClick={() => { setIsRenaming(true); setShowMenu(false) }}>
                <Icons.Editor.Type01 style={{ width: 14, height: 14 }} />
                <span>Rename</span>
              </button>
              <button onClick={handleDelete} className="delete">
                <Icons.General.Trash01 style={{ width: 14, height: 14 }} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
