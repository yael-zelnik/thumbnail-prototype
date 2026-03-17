/**
 * MEDIA GRID
 * 
 * Grid layout for displaying media cards (videos, images).
 * Supports drag-and-drop reordering.
 */

import { useState } from 'react'
import { useMediaBoard, MediaItem, PlayingState } from './MediaBoardContext'
import { MediaCard } from './MediaCard'

interface MediaGridProps {
  items?: MediaItem[]
  playingState?: PlayingState
}

export function MediaGrid({ items: propItems, playingState: propPlayingState }: MediaGridProps = {}) {
  const context = useMediaBoard()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  // Use props if provided, otherwise fall back to context
  const playingState = propPlayingState ?? context.playingState
  const items = propItems ?? []

  const isVideoPlaying = (id: string): boolean => {
    const videoState = playingState.videos.find(v => v.id === id)
    return videoState?.isPlaying ?? false
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      setDropIndex(index)
    }
  }

  const handleDragEnd = () => {
    // Reordering is simplified for now - just reset drag state
    // Full reorder would need category info passed as prop
    setDragIndex(null)
    setDropIndex(null)
  }

  if (items.length === 0) {
    return (
      <div className="media-grid-empty">
        <p>No media in this category</p>
        <p className="hint">Upload files or drag and drop them here</p>
      </div>
    )
  }

  return (
    <div className="media-grid">
      {items.map((item, index) => (
        <MediaCard
          key={item.id}
          item={item}
          index={index}
          isPlaying={item.type === 'video' && isVideoPlaying(item.id)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  )
}
