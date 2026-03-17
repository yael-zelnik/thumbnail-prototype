/**
 * VIDEO PREVIEW MODAL
 * 
 * Modal overlay for previewing videos with actual video playback.
 */

import { useRef, useEffect } from 'react'
import { Icons } from '@riversidefm/riverstyle'
import { useMediaBoard } from './MediaBoardContext'

export function VideoPreviewModal() {
  const { 
    mediaLibrary, 
    previewVideoId, 
    setPreviewVideoId,
  } = useMediaBoard()

  const videoRef = useRef<HTMLVideoElement>(null)

  // Find the video item
  const video = previewVideoId 
    ? [...mediaLibrary.video.session, ...mediaLibrary.video.generic].find(v => v.id === previewVideoId)
    : null

  // Auto-play when modal opens
  useEffect(() => {
    if (video?.videoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [video?.videoUrl])

  if (!video) return null

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setPreviewVideoId(null)
  }

  const hasVideoUrl = !!video.videoUrl

  return (
    <div className="video-preview-overlay" onClick={handleClose}>
      <div className="video-preview-modal" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="video-preview-close" onClick={handleClose}>
          <Icons.General.XClose style={{ width: 20, height: 20 }} />
        </button>

        {/* Video preview area */}
        <div className="video-preview-player">
          {hasVideoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              controls
              autoPlay
              className="video-preview-video"
              poster={video.thumbnail}
            />
          ) : video.thumbnail ? (
            <>
              <img src={video.thumbnail} alt={video.name} className="video-preview-thumbnail" />
              <div className="video-preview-no-source">
                <Icons.MediaDevices.VideoRecorder style={{ width: 32, height: 32 }} />
                <span>No video source available</span>
              </div>
            </>
          ) : (
            <div className="video-preview-placeholder">
              <Icons.MediaDevices.VideoRecorder style={{ width: 48, height: 48 }} />
              <span>No video source</span>
            </div>
          )}
        </div>

        {/* Video name */}
        <div className="video-preview-info">
          <span className="video-preview-name">{video.name}</span>
          {video.duration && <span className="video-preview-duration">{video.duration}</span>}
        </div>
      </div>
    </div>
  )
}
