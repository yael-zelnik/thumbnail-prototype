/**
 * BGM ITEM
 * 
 * Background music item with play/pause, loop toggle, fade in/out controls,
 * dedicated volume slider, duration, and drag handle for reordering.
 */

import { useState } from 'react'
import { Icons } from '@riversidefm/riverstyle'
import { useMediaBoard, MediaItem, BgmPlayingState } from './MediaBoardContext'

interface BgmItemProps {
  item: MediaItem
  playingState: BgmPlayingState | undefined
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
}

export function BgmItem({ 
  item, 
  playingState,
  index,
  onDragStart,
  onDragOver,
  onDragEnd
}: BgmItemProps) {
  const { 
    playBgm, 
    pauseBgm, 
    setBgmVolume, 
    toggleBgmLoop, 
    toggleBgmFade,
    deleteMedia,
    renameMedia,
  } = useMediaBoard()

  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)

  const isPlaying = playingState?.isPlaying ?? false
  const volume = playingState?.volume ?? 80
  const loop = playingState?.loop ?? false
  const fade = playingState?.fade ?? false

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseBgm(item.id)
    } else {
      playBgm(item.id)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgmVolume(item.id, parseInt(e.target.value))
  }

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

  return (
    <div 
      className={`bgm-item ${isPlaying ? 'playing' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle */}
      <div className="bgm-drag-handle">
        <Icons.General.DotsHorizontal style={{ width: 14, height: 14 }} />
      </div>

      {/* Play/Pause button */}
      <button className="bgm-play-button" onClick={handlePlayPause}>
        {isPlaying ? (
          <Icons.MediaDevices.Pause style={{ width: 28, height: 28 }} />
        ) : (
          <Icons.MediaDevices.PlayFill style={{ width: 28, height: 28 }} />
        )}
      </button>

      {/* Track info */}
      <div className="bgm-info">
        {isRenaming ? (
          <input
            type="text"
            className="bgm-name-input"
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
          <span className="bgm-name">{item.name}</span>
        )}
        <span className="bgm-duration">{item.duration}</span>
      </div>

      {/* Controls group */}
      <div className="bgm-controls">
        {/* Loop toggle */}
        <button 
          className={`bgm-control-button ${loop ? 'active' : ''}`}
          onClick={() => toggleBgmLoop(item.id)}
          title="Loop"
        >
          <Icons.Arrows.ReverseLeft style={{ width: 16, height: 16 }} />
        </button>

        {/* Fade toggle */}
        <button 
          className={`bgm-control-button ${fade ? 'active' : ''}`}
          onClick={() => toggleBgmFade(item.id)}
          title="Fade"
        >
          <span className="fade-label">Fade</span>
        </button>
      </div>

      {/* Volume slider */}
      <div className="bgm-volume">
        <Icons.MediaDevices.MusicNote01 style={{ width: 14, height: 14 }} />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="bgm-volume-slider"
        />
        <span className="bgm-volume-value">{volume}%</span>
      </div>

      {/* Options menu */}
      <div className="bgm-menu-wrapper">
        <button 
          className="bgm-menu-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Icons.General.DotsHorizontal style={{ width: 16, height: 16 }} />
        </button>

        {showMenu && (
          <div className="bgm-menu">
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
  )
}
