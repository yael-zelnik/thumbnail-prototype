/**
 * BGM LIST
 * 
 * List view for background music tracks.
 * Supports drag-and-drop reordering.
 */

import { useState } from 'react'
import { useMediaBoard } from './MediaBoardContext'
import { BgmItem } from './BgmItem'

export function BgmList() {
  const { mediaLibrary, playingState, reorderMedia } = useMediaBoard()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const bgmItems = mediaLibrary.audio.bgm

  const getBgmPlayingState = (id: string) => {
    return playingState.bgm.find(b => b.id === id)
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
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      reorderMedia('audio.bgm', dragIndex, dropIndex)
    }
    setDragIndex(null)
    setDropIndex(null)
  }

  if (bgmItems.length === 0) {
    return (
      <div className="bgm-list-empty">
        <p>No background music</p>
        <p className="hint">Upload long audio tracks for background music</p>
      </div>
    )
  }

  return (
    <div className="bgm-list">
      {bgmItems.map((item, index) => (
        <BgmItem
          key={item.id}
          item={item}
          playingState={getBgmPlayingState(item.id)}
          index={index}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  )
}
