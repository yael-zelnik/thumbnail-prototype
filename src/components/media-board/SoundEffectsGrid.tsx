/**
 * SOUND EFFECTS GRID
 * 
 * Launchpad-style 3x3 grid for sound effects.
 * Supports simultaneous playback and keyboard shortcuts 1-9.
 */

import { useMediaBoard } from './MediaBoardContext'
import { SfxButton } from './SfxButton'

export function SoundEffectsGrid() {
  const { mediaLibrary, playingState, triggerSfx } = useMediaBoard()

  const sfxItems = mediaLibrary.audio.sfx

  const isSfxPlaying = (id: string): boolean => {
    return playingState.sfx.some(s => s.id === id && s.isPlaying)
  }

  if (sfxItems.length === 0) {
    return (
      <div className="sfx-grid-empty">
        <p>No sound effects</p>
        <p className="hint">Upload short audio clips to use as sound effects</p>
      </div>
    )
  }

  return (
    <div className="sfx-grid">
      <div className="sfx-grid-hint">
        Press keys 1-9 to trigger sound effects
      </div>
      
      <div className="sfx-launchpad">
        {sfxItems.slice(0, 9).map((item) => (
          <SfxButton
            key={item.id}
            item={item}
            isPlaying={isSfxPlaying(item.id)}
            onTrigger={() => triggerSfx(item.id)}
          />
        ))}
      </div>

      {/* Additional SFX beyond 9 (no shortcuts) */}
      {sfxItems.length > 9 && (
        <div className="sfx-extra">
          <h4>Additional Effects</h4>
          <div className="sfx-extra-grid">
            {sfxItems.slice(9).map((item) => (
              <SfxButton
                key={item.id}
                item={item}
                isPlaying={isSfxPlaying(item.id)}
                onTrigger={() => triggerSfx(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
