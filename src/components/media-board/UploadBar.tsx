/**
 * UPLOAD BAR
 * 
 * Upload area with button and drag-and-drop target at the top of every category view.
 */

import { useState, useRef, DragEvent } from 'react'
import { Icons } from '@riversidefm/riverstyle'
import { useMediaBoard, MediaType } from './MediaBoardContext'

export function UploadBar() {
  const { selectedCategory, uploadMedia } = useMediaBoard()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine media type and subcategory from selection
  const getUploadInfo = (): { type: MediaType; category: string } => {
    if (selectedCategory.startsWith('video')) {
      const category = selectedCategory.split('.')[1] || 'session'
      return { type: 'video', category }
    }
    if (selectedCategory.startsWith('audio')) {
      const category = selectedCategory.split('.')[1] || 'bgm'
      return { type: 'audio', category }
    }
    return { type: 'image', category: 'session' }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const { type, category } = getUploadInfo()
      Array.from(files).forEach(file => {
        uploadMedia(type, category, { name: file.name })
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const { type, category } = getUploadInfo()
      Array.from(files).forEach(file => {
        uploadMedia(type, category, { name: file.name })
      })
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAcceptType = () => {
    if (selectedCategory.startsWith('video')) return 'video/*'
    if (selectedCategory.startsWith('audio')) return 'audio/*'
    return 'image/*'
  }

  return (
    <div 
      className={`upload-bar ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <button className="upload-button" onClick={handleUploadClick}>
        <Icons.General.UploadCloud01 style={{ width: 16, height: 16 }} />
        <span>Upload</span>
      </button>
      
      <div className="upload-dropzone">
        <Icons.General.UploadCloud01 style={{ width: 20, height: 20, opacity: 0.5 }} />
        <span>Drop files here</span>
      </div>
    </div>
  )
}
