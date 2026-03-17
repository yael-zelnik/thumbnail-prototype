/**
 * SFX BUTTON
 * 
 * Large launchpad button for sound effects.
 * Shows name, play icon, shortcut indicator.
 * Triggers instantly on click or keyboard shortcut.
 */

import { Icons } from '@riversidefm/riverstyle'
import { MediaItem } from './MediaBoardContext'

interface SfxButtonProps {
  item: MediaItem
  isPlaying: boolean
  onTrigger: () => void
}

export function SfxButton({ item, isPlaying, onTrigger }: SfxButtonProps) {
  return (
    <button 
      className={`sfx-button ${isPlaying ? 'playing' : ''}`}
      onClick={onTrigger}
    >
      <div className="sfx-button-icon">
        <Icons.MediaDevices.PlayFill style={{ width: 32, height: 32 }} />
      </div>
      
      <span className="sfx-button-name">{item.name}</span>
      
      {item.shortcut && (
        <span className="sfx-button-shortcut">{item.shortcut}</span>
      )}
    </button>
  )
}
