/**
 * MEDIA BOARD CONTEXT
 * 
 * State management for the Media Board panel using React Context.
 * Manages media library, playback state, and media operations.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'

// Import thumbnail image for proper Vite handling
import mockThumbnailImage from '../../assets/c1283eb50eda812284e45b1be890bc81404f5735.png'

// ============================================================================
// TYPES
// ============================================================================

export type MediaType = 'video' | 'audio' | 'image'
export type VideoCategory = 'session' | 'generic'
export type AudioCategory = 'bgm' | 'sfx'
export type ImageCategory = 'session'

export interface MediaItem {
  id: string
  name: string
  type: MediaType
  category: VideoCategory | AudioCategory | ImageCategory
  thumbnail?: string
  duration?: string // For audio/video
  shortcut?: number // For SFX (1-9)
  audioUrl?: string // For playable audio
  videoUrl?: string // For playable video
}

export interface BgmPlayingState {
  id: string
  volume: number
  loop: boolean
  isPlaying: boolean
  fade: boolean
}

export interface SfxPlayingState {
  id: string
  isPlaying: boolean
}

export interface VideoPlayingState {
  id: string
  isPlaying: boolean
  progress: number
  volume: number
  muted: boolean
  visible: boolean // Visible in livestream
  currentTime: number
  duration: number
}

export interface MediaLibrary {
  video: {
    session: MediaItem[]
    generic: MediaItem[]
  }
  audio: {
    bgm: MediaItem[]
    sfx: MediaItem[]
  }
  images: {
    session: MediaItem[]
  }
}

export interface ImagePresentingState {
  id: string
  isPresenting: boolean
}

export interface PlayingState {
  bgm: BgmPlayingState[]
  sfx: SfxPlayingState[]
  videos: VideoPlayingState[]
  images: ImagePresentingState[]
}

// Stage Control Action Types
export type StageAction = 
  | 'layout-solo' | 'layout-split' | 'layout-grid' | 'layout-pip'
  | 'screen-share' | 'banner' | 'branding' | 'mute-all'

// Stream Deck Button
export interface StreamDeckButton {
  id: string
  name: string
  color: string
  icon?: string // Icon name or emoji
  mediaId?: string // Assigned media item ID
  mediaType?: MediaType // Type of assigned media
  action?: StageAction // Stage control action
  keyBinding?: string // Keyboard shortcut (e.g., "1", "a", "F1")
  order: number
}

export interface StreamDeckPreset {
  id: string
  name: string
  description: string
  buttons: Omit<StreamDeckButton, 'id' | 'order'>[]
}

// Stage Control Types
export interface StageParticipant {
  id: string
  name: string
  avatar?: string
  isOnStage: boolean
  isMuted: boolean
  isVideoOn: boolean
  isSpotlighted: boolean
}

export type StageLayout = 'solo' | 'split' | 'grid' | 'pip'

export interface StageControlState {
  layout: StageLayout
  participants: StageParticipant[]
  showBanner: boolean
  showBranding: boolean
  isScreenSharing: boolean
  bannerText: string
}

// Initial Stage Control State
const INITIAL_STAGE_CONTROL: StageControlState = {
  layout: 'solo',
  participants: [
    { id: 'host', name: 'Host', isOnStage: true, isMuted: false, isVideoOn: true, isSpotlighted: false },
    { id: 'guest-1', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', isOnStage: false, isMuted: true, isVideoOn: true, isSpotlighted: false },
    { id: 'guest-2', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', isOnStage: false, isMuted: true, isVideoOn: true, isSpotlighted: false },
    { id: 'guest-3', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', isOnStage: false, isMuted: true, isVideoOn: false, isSpotlighted: false },
  ],
  showBanner: false,
  showBranding: false,
  isScreenSharing: false,
  bannerText: '',
}

// Stream Deck Presets - using only verified icons
export const STREAM_DECK_PRESETS: StreamDeckPreset[] = [
  {
    id: 'sound-fx',
    name: 'Sound FX',
    description: 'Essential sound effects for any production',
    buttons: [
      { name: 'Applause', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'thumbs', keyBinding: '1' },
      { name: 'Drum Roll', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'disc', keyBinding: '2' },
      { name: 'Ding', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'bell', keyBinding: '3' },
      { name: 'Whoosh', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'signal', keyBinding: '4' },
      { name: 'Fail Horn', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'volume', keyBinding: '5' },
      { name: 'Success', color: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)', icon: 'sparkles', keyBinding: '6' },
    ]
  },
  {
    id: 'webinar',
    name: 'Webinar',
    description: 'Professional webinar and presentation setup',
    buttons: [
      { name: 'Intro Video', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'clapperboard', keyBinding: '1' },
      { name: 'Outro Video', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'tv', keyBinding: '2' },
      { name: 'Hold Music', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'music', keyBinding: '3' },
      { name: 'Break Slide', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'image', keyBinding: '4' },
      { name: 'Q&A Time', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'message', keyBinding: '5' },
      { name: 'Thank You', color: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)', icon: 'sparkles', keyBinding: '6' },
    ]
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Fun sound effects for comedy shows',
    buttons: [
      { name: 'Rimshot', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'disc', keyBinding: '1' },
      { name: 'Sad Trombone', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'music', keyBinding: '2' },
      { name: 'Laugh Track', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'thumbs', keyBinding: '3' },
      { name: 'Crickets', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'mic', keyBinding: '4' },
      { name: 'Air Horn', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'volume', keyBinding: '5' },
      { name: 'Victory', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'sparkles', keyBinding: '6' },
    ]
  },
  {
    id: 'podcast',
    name: 'Podcast',
    description: 'Essential controls for podcast recording',
    buttons: [
      { name: 'Intro', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'play', keyBinding: '1' },
      { name: 'Outro', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'stop', keyBinding: '2' },
      { name: 'Ad Break', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'bell', keyBinding: '3' },
      { name: 'Transition', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'refresh', keyBinding: '4' },
      { name: 'BGM On', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'music', keyBinding: '5' },
      { name: 'Stinger', color: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)', icon: 'signal', keyBinding: '6' },
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Stream controls for gaming content',
    buttons: [
      { name: 'Starting Soon', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'settings', keyBinding: '1' },
      { name: 'BRB', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'pause', keyBinding: '2' },
      { name: 'Hype!', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'signal', keyBinding: '3' },
      { name: 'GG', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'thumbs', keyBinding: '4' },
      { name: 'Alert', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'bell', keyBinding: '5' },
      { name: 'End Stream', color: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)', icon: 'stop', keyBinding: '6' },
    ]
  },
  {
    id: 'stage-control',
    name: 'Stage Control',
    description: 'Layouts and stage management controls',
    buttons: [
      { name: 'Solo', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'fullscreen', action: 'layout-solo', keyBinding: '1' },
      { name: 'Split', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'split', action: 'layout-split', keyBinding: '2' },
      { name: 'Grid', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'grid', action: 'layout-grid', keyBinding: '3' },
      { name: 'PiP', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'pip', action: 'layout-pip', keyBinding: '4' },
      { name: 'Screen', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'monitor', action: 'screen-share', keyBinding: 's' },
      { name: 'Banner', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'message', action: 'banner', keyBinding: 'b' },
      { name: 'Brand', color: 'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)', icon: 'star', action: 'branding', keyBinding: 'r' },
      { name: 'Mute All', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'mic-off', action: 'mute-all', keyBinding: 'm' },
    ]
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Screen sharing and presentation controls',
    buttons: [
      { name: 'Share Screen', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'monitor', keyBinding: '1' },
      { name: 'Show Slides', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'folder', keyBinding: '2' },
      { name: 'Show Video', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'video', keyBinding: '3' },
      { name: 'Show Image', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'image', keyBinding: '4' },
      { name: 'Change Layout', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'layout', keyBinding: '5' },
      { name: 'Stop Share', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'x', keyBinding: '6' },
    ]
  },
  {
    id: 'live-show',
    name: 'Live Show',
    description: 'Full live show control with guests and media',
    buttons: [
      { name: 'Go Live', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'recording', keyBinding: '1' },
      { name: 'Add Guest', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'user', keyBinding: '2' },
      { name: 'Spotlight', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'star', keyBinding: '3' },
      { name: 'Share Screen', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'monitor', keyBinding: '4' },
      { name: 'Play Media', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'play', keyBinding: '5' },
      { name: 'End Show', color: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)', icon: 'stop', keyBinding: '6' },
      { name: 'Mute All', color: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)', icon: 'volume', keyBinding: '7' },
      { name: 'Show Chat', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'message', keyBinding: '8' },
      { name: 'Raise Hand', color: 'linear-gradient(135deg, #FFCC00 0%, #FF9500 100%)', icon: 'thumbs', keyBinding: '9' },
    ]
  },
  {
    id: 'interview',
    name: 'Interview',
    description: 'Professional interview and panel controls',
    buttons: [
      { name: 'Focus Host', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'star', keyBinding: '1' },
      { name: 'Focus Guest', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'user', keyBinding: '2' },
      { name: 'Split View', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'layout', keyBinding: '3' },
      { name: 'Show Slides', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'folder', keyBinding: '4' },
      { name: 'Lower Third', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'down', keyBinding: '5' },
      { name: 'Full Screen', color: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)', icon: 'up', keyBinding: '6' },
    ]
  },
]

export type CategoryPath = 
  | 'video'
  | 'video.session'
  | 'video.generic'
  | 'audio'
  | 'audio.bgm'
  | 'audio.sfx'
  | 'images'
  | 'images.session'

export interface MediaBoardContextType {
  // State
  mediaLibrary: MediaLibrary
  playingState: PlayingState
  selectedCategory: CategoryPath
  
  // Category navigation
  setSelectedCategory: (category: CategoryPath) => void
  
  // Media operations
  uploadMedia: (type: MediaType, category: string, file: File) => string
  deleteMedia: (id: string) => void
  renameMedia: (id: string, newName: string) => void
  reorderMedia: (category: CategoryPath, fromIndex: number, toIndex: number) => void
  
  // Video playback
  playVideo: (id: string) => void
  pauseVideo: (id: string) => void
  setVideoProgress: (id: string, progress: number) => void
  setVideoTime: (id: string, currentTime: number, duration: number) => void
  setVideoVolume: (id: string, volume: number) => void
  toggleVideoMute: (id: string) => void
  toggleVideoVisibility: (id: string) => void
  getVideoState: (id: string) => VideoPlayingState | undefined
  
  // BGM playback
  playBgm: (id: string) => void
  pauseBgm: (id: string) => void
  setBgmVolume: (id: string, volume: number) => void
  toggleBgmLoop: (id: string) => void
  toggleBgmFade: (id: string) => void
  
  // SFX playback
  triggerSfx: (id: string) => void
  triggerSfxByShortcut: (shortcut: number) => void
  
  // Image presentation
  presentImage: (id: string) => void
  hideImage: (id: string) => void
  getPresentingImage: () => ImagePresentingState | undefined
  
  // Global audio controls
  globalBgmVolume: number
  globalBgmMuted: boolean
  globalBgmLooping: boolean
  globalBgmFading: boolean
  setGlobalBgmVolume: (volume: number) => void
  setGlobalBgmMuted: (muted: boolean) => void
  setGlobalBgmLooping: (looping: boolean) => void
  setGlobalBgmFading: (fading: boolean) => void
  
  globalSfxVolume: number
  globalSfxMuted: boolean
  setGlobalSfxVolume: (volume: number) => void
  setGlobalSfxMuted: (muted: boolean) => void
  
  // Video preview modal
  previewVideoId: string | null
  setPreviewVideoId: (id: string | null) => void
  
  // Stream Deck
  streamDeckButtons: StreamDeckButton[]
  addStreamDeckButton: () => void
  removeStreamDeckButton: (id: string) => void
  updateStreamDeckButton: (id: string, updates: Partial<StreamDeckButton>) => void
  reorderStreamDeckButtons: (fromIndex: number, toIndex: number) => void
  triggerStreamDeckButton: (id: string) => void
  loadStreamDeckPreset: (presetId: string) => void
  clearStreamDeck: () => void
  getMediaById: (id: string) => MediaItem | undefined
  
  // Stage Control
  stageControl: StageControlState
  setStageLayout: (layout: StageLayout) => void
  toggleParticipantStage: (id: string) => void
  toggleParticipantMute: (id: string) => void
  toggleParticipantSpotlight: (id: string) => void
  muteAllParticipants: () => void
  bringAllOnStage: () => void
  toggleScreenShare: () => void
  toggleBanner: () => void
  toggleStagebranding: () => void
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_THUMBNAIL = mockThumbnailImage

// Sample video from a public CDN (Big Buck Bunny - open source)
const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const SAMPLE_VIDEO_THUMB = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

// Free sample audio URLs (using freesound.org public samples via CDN)
const AUDIO_URLS = {
  // Background music - using royalty-free samples
  bgm1: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946b0939c8.mp3', // Upbeat corporate style
  bgm2: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3', // Ambient chill
  bgm3: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e02f9.mp3', // Piano
  bgm4: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749d484.mp3', // Electronic
  // Sound effects
  sfx1: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3', // Ding/notification
  sfx2: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8f65e96bf3.mp3', // Whoosh
  sfx3: 'https://cdn.pixabay.com/audio/2022/01/18/audio_8db1f1b5a1.mp3', // Pop
  sfx4: 'https://cdn.pixabay.com/audio/2022/03/24/audio_8c5e79fd56.mp3', // Click
  sfx5: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3', // Swoosh
  sfx6: 'https://cdn.pixabay.com/audio/2022/11/17/audio_5b7b0e8a76.mp3', // Chime
  sfx7: 'https://cdn.pixabay.com/audio/2022/03/15/audio_e8de6a9988.mp3', // Beep
  sfx8: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c507296890.mp3', // Bell
  sfx9: 'https://cdn.pixabay.com/audio/2022/07/19/audio_2f13a47c62.mp3', // Notification
}

const INITIAL_MEDIA_LIBRARY: MediaLibrary = {
  video: {
    session: [
      { id: 'vid-s1', name: 'Big Buck Bunny', type: 'video', category: 'session', thumbnail: SAMPLE_VIDEO_THUMB, duration: '09:56', videoUrl: SAMPLE_VIDEO_URL },
      { id: 'vid-s2', name: 'Interview Take 2', type: 'video', category: 'session', thumbnail: MOCK_THUMBNAIL, duration: '02:58' },
      { id: 'vid-s3', name: 'B-Roll Office', type: 'video', category: 'session', thumbnail: MOCK_THUMBNAIL, duration: '01:12' },
    ],
    generic: [
      { id: 'vid-g1', name: 'Sample Video', type: 'video', category: 'generic', thumbnail: SAMPLE_VIDEO_THUMB, duration: '09:56', videoUrl: SAMPLE_VIDEO_URL },
      { id: 'vid-g2', name: 'Outro Animation', type: 'video', category: 'generic', thumbnail: MOCK_THUMBNAIL, duration: '00:12' },
      { id: 'vid-g3', name: 'Lower Third', type: 'video', category: 'generic', thumbnail: MOCK_THUMBNAIL, duration: '00:05' },
    ],
  },
  audio: {
    bgm: [
      { id: 'bgm-1', name: 'Upbeat Corporate', type: 'audio', category: 'bgm', duration: '02:17', audioUrl: AUDIO_URLS.bgm1 },
      { id: 'bgm-2', name: 'Ambient Chill', type: 'audio', category: 'bgm', duration: '02:34', audioUrl: AUDIO_URLS.bgm2 },
      { id: 'bgm-3', name: 'Inspiring Piano', type: 'audio', category: 'bgm', duration: '01:52', audioUrl: AUDIO_URLS.bgm3 },
      { id: 'bgm-4', name: 'Electronic Groove', type: 'audio', category: 'bgm', duration: '02:08', audioUrl: AUDIO_URLS.bgm4 },
    ],
    sfx: [
      { id: 'sfx-1', name: 'Ding', type: 'audio', category: 'sfx', duration: '00:02', shortcut: 1, audioUrl: AUDIO_URLS.sfx1 },
      { id: 'sfx-2', name: 'Whoosh', type: 'audio', category: 'sfx', duration: '00:01', shortcut: 2, audioUrl: AUDIO_URLS.sfx2 },
      { id: 'sfx-3', name: 'Pop', type: 'audio', category: 'sfx', duration: '00:01', shortcut: 3, audioUrl: AUDIO_URLS.sfx3 },
      { id: 'sfx-4', name: 'Click', type: 'audio', category: 'sfx', duration: '00:01', shortcut: 4, audioUrl: AUDIO_URLS.sfx4 },
      { id: 'sfx-5', name: 'Swoosh', type: 'audio', category: 'sfx', duration: '00:02', shortcut: 5, audioUrl: AUDIO_URLS.sfx5 },
      { id: 'sfx-6', name: 'Chime', type: 'audio', category: 'sfx', duration: '00:03', shortcut: 6, audioUrl: AUDIO_URLS.sfx6 },
      { id: 'sfx-7', name: 'Beep', type: 'audio', category: 'sfx', duration: '00:01', shortcut: 7, audioUrl: AUDIO_URLS.sfx7 },
      { id: 'sfx-8', name: 'Bell', type: 'audio', category: 'sfx', duration: '00:02', shortcut: 8, audioUrl: AUDIO_URLS.sfx8 },
      { id: 'sfx-9', name: 'Notification', type: 'audio', category: 'sfx', duration: '00:01', shortcut: 9, audioUrl: AUDIO_URLS.sfx9 },
    ],
  },
  images: {
    session: [
      { id: 'img-1', name: 'Logo Dark', type: 'image', category: 'session', thumbnail: MOCK_THUMBNAIL },
      { id: 'img-2', name: 'Logo Light', type: 'image', category: 'session', thumbnail: MOCK_THUMBNAIL },
      { id: 'img-3', name: 'Background 1', type: 'image', category: 'session', thumbnail: MOCK_THUMBNAIL },
      { id: 'img-4', name: 'Background 2', type: 'image', category: 'session', thumbnail: MOCK_THUMBNAIL },
    ],
  },
}

const INITIAL_PLAYING_STATE: PlayingState = {
  bgm: [],
  sfx: [],
  videos: [],
  images: [],
}

// ============================================================================
// CONTEXT
// ============================================================================

const MediaBoardContext = createContext<MediaBoardContextType | null>(null)

export function useMediaBoard() {
  const context = useContext(MediaBoardContext)
  if (!context) {
    throw new Error('useMediaBoard must be used within a MediaBoardProvider')
  }
  return context
}

// ============================================================================
// PROVIDER
// ============================================================================

export function MediaBoardProvider({ children }: { children: ReactNode }) {
  const [mediaLibrary, setMediaLibrary] = useState<MediaLibrary>(INITIAL_MEDIA_LIBRARY)
  const [playingState, setPlayingState] = useState<PlayingState>(INITIAL_PLAYING_STATE)
  const [selectedCategory, setSelectedCategory] = useState<CategoryPath>('video.session')
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  
  // Stream Deck buttons - start with stage control actions + media
  const [streamDeckButtons, setStreamDeckButtons] = useState<StreamDeckButton[]>([
    // Row 1: Layout controls
    { id: 'default-1', name: 'Solo', color: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', icon: 'fullscreen', action: 'layout-solo', keyBinding: '1', order: 0 },
    { id: 'default-2', name: 'Split', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'split', action: 'layout-split', keyBinding: '2', order: 1 },
    { id: 'default-3', name: 'Grid', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'grid', action: 'layout-grid', keyBinding: '3', order: 2 },
    { id: 'default-4', name: 'PiP', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'pip', action: 'layout-pip', keyBinding: '4', order: 3 },
    // Row 2: Stage controls + media
    { id: 'default-5', name: 'Screen', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'monitor', action: 'screen-share', keyBinding: 's', order: 4 },
    { id: 'default-6', name: 'Banner', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'message', action: 'banner', keyBinding: 'b', order: 5 },
    { id: 'default-7', name: 'Brand', color: 'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)', icon: 'star', action: 'branding', keyBinding: 'r', order: 6 },
    { id: 'default-8', name: 'Mute All', color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%)', icon: 'mic-off', action: 'mute-all', keyBinding: 'm', order: 7 },
    // Row 3: Media - BGM & Video
    { id: 'default-9', name: 'Piano BGM', color: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', icon: 'music', mediaId: 'bgm-3', mediaType: 'audio', keyBinding: 'p', order: 8 },
    { id: 'default-10', name: 'Big Bunny', color: 'linear-gradient(135deg, #007AFF 0%, #00C7BE 100%)', icon: 'clapperboard', mediaId: 'vid-s1', mediaType: 'video', keyBinding: 'v', order: 9 },
    { id: 'default-11', name: 'Ding', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', icon: 'bell', mediaId: 'sfx-1', mediaType: 'audio', keyBinding: 'q', order: 10 },
    { id: 'default-12', name: 'Whoosh', color: 'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)', icon: 'signal', mediaId: 'sfx-2', mediaType: 'audio', keyBinding: 'w', order: 11 },
    // Row 4: More SFX
    { id: 'default-13', name: 'Pop', color: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', icon: 'sparkles', mediaId: 'sfx-3', mediaType: 'audio', keyBinding: 'e', order: 12 },
    { id: 'default-14', name: 'Chime', color: 'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)', icon: 'bell', mediaId: 'sfx-6', mediaType: 'audio', keyBinding: 't', order: 13 },
    { id: 'default-15', name: 'Swoosh', color: 'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)', icon: 'up', mediaId: 'sfx-5', mediaType: 'audio', keyBinding: 'y', order: 14 },
    { id: 'default-16', name: 'Bell', color: 'linear-gradient(135deg, #FFCC00 0%, #FF9500 100%)', icon: 'bell', mediaId: 'sfx-8', mediaType: 'audio', keyBinding: 'u', order: 15 },
  ])
  
  // Stage Control state
  const [stageControl, setStageControl] = useState<StageControlState>(INITIAL_STAGE_CONTROL)

  // Global audio control states
  const [globalBgmVolume, setGlobalBgmVolume] = useState(50)
  const [globalBgmMuted, setGlobalBgmMuted] = useState(false)
  const [globalBgmLooping, setGlobalBgmLooping] = useState(true)
  const [globalBgmFading, setGlobalBgmFading] = useState(false)
  
  const [globalSfxVolume, setGlobalSfxVolume] = useState(75)
  const [globalSfxMuted, setGlobalSfxMuted] = useState(false)

  // Audio element refs for BGM playback
  const bgmAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Helper to get or create BGM audio element
  const getBgmAudio = useCallback((id: string): HTMLAudioElement | null => {
    if (bgmAudioRefs.current.has(id)) {
      return bgmAudioRefs.current.get(id)!
    }
    const item = mediaLibrary.audio.bgm.find(b => b.id === id)
    if (item?.audioUrl) {
      const audio = new Audio(item.audioUrl)
      audio.preload = 'auto'
      bgmAudioRefs.current.set(id, audio)
      return audio
    }
    return null
  }, [mediaLibrary.audio.bgm])

  // Sync BGM audio state with playing state and global settings
  useEffect(() => {
    playingState.bgm.forEach(bgmState => {
      const audio = getBgmAudio(bgmState.id)
      if (audio) {
        // Apply global volume and mute settings
        const effectiveVolume = globalBgmMuted ? 0 : (globalBgmVolume / 100) * (bgmState.volume / 100)
        audio.volume = effectiveVolume
        audio.loop = globalBgmLooping || bgmState.loop
        if (bgmState.isPlaying && audio.paused) {
          audio.play().catch(() => {})
        } else if (!bgmState.isPlaying && !audio.paused) {
          audio.pause()
        }
      }
    })
  }, [playingState.bgm, getBgmAudio, globalBgmVolume, globalBgmMuted, globalBgmLooping])

  // ============================================
  // MEDIA OPERATIONS
  // ============================================

  const uploadMedia = useCallback((type: MediaType, category: string, file: File): string => {
    const id = `${type}-${Date.now()}`
    const blobUrl = URL.createObjectURL(file)
    
    // For images, use the blob URL as thumbnail
    // For videos, we'll generate a thumbnail from the first frame
    let thumbnailUrl = MOCK_THUMBNAIL
    if (type === 'image') {
      thumbnailUrl = blobUrl
    }
    
    const newItem: MediaItem = {
      id,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      type,
      category: category as VideoCategory | AudioCategory | ImageCategory,
      thumbnail: thumbnailUrl,
      duration: type === 'video' ? '00:00' : type === 'audio' ? '00:00' : undefined,
      audioUrl: type === 'audio' ? blobUrl : undefined,
      videoUrl: type === 'video' ? blobUrl : undefined,
    }
    
    // For videos, generate thumbnail from first frame
    if (type === 'video') {
      const video = document.createElement('video')
      video.src = blobUrl
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.currentTime = 1 // Seek to 1 second for thumbnail
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          
          // Update the item with the generated thumbnail
          setMediaLibrary(prev => {
            const updated = { ...prev }
            const updateThumbnail = (items: MediaItem[]) => 
              items.map(item => item.id === id ? { ...item, thumbnail: thumbnailDataUrl } : item)
            
            updated.video = {
              session: updateThumbnail(prev.video.session),
              generic: updateThumbnail(prev.video.generic),
            }
            return updated
          })
        }
      }
      video.load()
    }

    // Add new items to the BEGINNING of arrays (most recent first)
    setMediaLibrary(prev => {
      const updated = { ...prev }
      if (type === 'video' && (category === 'session' || category === 'generic')) {
        updated.video = { ...updated.video, [category]: [newItem, ...updated.video[category]] }
      } else if (type === 'audio' && (category === 'bgm' || category === 'sfx')) {
        updated.audio = { ...updated.audio, [category]: [newItem, ...updated.audio[category]] }
      } else if (type === 'image' && category === 'session') {
        updated.images = { ...updated.images, session: [newItem, ...updated.images.session] }
      }
      return updated
    })
    
    return id
  }, [])

  const deleteMedia = useCallback((id: string) => {
    setMediaLibrary(prev => ({
      video: {
        session: prev.video.session.filter(m => m.id !== id),
        generic: prev.video.generic.filter(m => m.id !== id),
      },
      audio: {
        bgm: prev.audio.bgm.filter(m => m.id !== id),
        sfx: prev.audio.sfx.filter(m => m.id !== id),
      },
      images: {
        session: prev.images.session.filter(m => m.id !== id),
      },
    }))
  }, [])

  const renameMedia = useCallback((id: string, newName: string) => {
    const updateItems = (items: MediaItem[]) =>
      items.map(m => m.id === id ? { ...m, name: newName } : m)

    setMediaLibrary(prev => ({
      video: {
        session: updateItems(prev.video.session),
        generic: updateItems(prev.video.generic),
      },
      audio: {
        bgm: updateItems(prev.audio.bgm),
        sfx: updateItems(prev.audio.sfx),
      },
      images: {
        session: updateItems(prev.images.session),
      },
    }))
  }, [])

  const reorderMedia = useCallback((category: CategoryPath, fromIndex: number, toIndex: number) => {
    setMediaLibrary(prev => {
      const updated = { ...prev }
      let items: MediaItem[] = []

      if (category === 'video.session') items = [...prev.video.session]
      else if (category === 'video.generic') items = [...prev.video.generic]
      else if (category === 'audio.bgm') items = [...prev.audio.bgm]
      else if (category === 'audio.sfx') items = [...prev.audio.sfx]
      else if (category === 'images.session') items = [...prev.images.session]

      const [removed] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, removed)

      if (category === 'video.session') updated.video = { ...updated.video, session: items }
      else if (category === 'video.generic') updated.video = { ...updated.video, generic: items }
      else if (category === 'audio.bgm') updated.audio = { ...updated.audio, bgm: items }
      else if (category === 'audio.sfx') updated.audio = { ...updated.audio, sfx: items }
      else if (category === 'images.session') updated.images = { ...updated.images, session: items }

      return updated
    })
  }, [])

  // ============================================
  // VIDEO PLAYBACK
  // ============================================

  // Helper to get or initialize video state
  const getOrCreateVideoState = useCallback((id: string): VideoPlayingState => {
    const existing = playingState.videos.find(v => v.id === id)
    if (existing) return existing
    return { id, isPlaying: false, progress: 0, volume: 80, muted: false, visible: false, currentTime: 0, duration: 0 }
  }, [playingState.videos])

  const getVideoState = useCallback((id: string): VideoPlayingState | undefined => {
    return playingState.videos.find(v => v.id === id)
  }, [playingState.videos])

  const playVideo = useCallback((id: string) => {
    setPlayingState(prev => {
      const existing = prev.videos.find(v => v.id === id)
      if (existing) {
        // Play this video, make it visible, hide others
        return {
          ...prev,
          videos: prev.videos.map(v => 
            v.id === id 
              ? { ...v, isPlaying: true, visible: true } 
              : { ...v, visible: false }
          ),
        }
      }
      // Create new video state - visible and playing, hide all others
      return {
        ...prev,
        videos: [
          ...prev.videos.map(v => ({ ...v, visible: false })),
          { id, isPlaying: true, progress: 0, volume: 80, muted: false, visible: true, currentTime: 0, duration: 0 }
        ],
      }
    })
  }, [])

  const pauseVideo = useCallback((id: string) => {
    setPlayingState(prev => ({
      ...prev,
      videos: prev.videos.map(v => v.id === id ? { ...v, isPlaying: false } : v),
    }))
  }, [])

  const setVideoProgress = useCallback((id: string, progress: number) => {
    setPlayingState(prev => ({
      ...prev,
      videos: prev.videos.map(v => v.id === id ? { ...v, progress } : v),
    }))
  }, [])

  const setVideoTime = useCallback((id: string, currentTime: number, duration: number) => {
    setPlayingState(prev => {
      const existing = prev.videos.find(v => v.id === id)
      if (existing) {
        return {
          ...prev,
          videos: prev.videos.map(v => v.id === id ? { ...v, currentTime, duration } : v),
        }
      }
      return prev
    })
  }, [])

  const setVideoVolume = useCallback((id: string, volume: number) => {
    setPlayingState(prev => {
      const existing = prev.videos.find(v => v.id === id)
      if (existing) {
        return {
          ...prev,
          videos: prev.videos.map(v => v.id === id ? { ...v, volume } : v),
        }
      }
      return {
        ...prev,
        videos: [...prev.videos, { id, isPlaying: false, progress: 0, volume, muted: false, visible: false, currentTime: 0, duration: 0 }],
      }
    })
  }, [])

  const toggleVideoMute = useCallback((id: string) => {
    setPlayingState(prev => {
      const existing = prev.videos.find(v => v.id === id)
      if (existing) {
        return {
          ...prev,
          videos: prev.videos.map(v => v.id === id ? { ...v, muted: !v.muted } : v),
        }
      }
      return {
        ...prev,
        videos: [...prev.videos, { id, isPlaying: false, progress: 0, volume: 80, muted: true, visible: false, currentTime: 0, duration: 0 }],
      }
    })
  }, [])

  const toggleVideoVisibility = useCallback((id: string) => {
    setPlayingState(prev => {
      const existing = prev.videos.find(v => v.id === id)
      const isCurrentlyVisible = existing?.visible ?? false
      
      if (isCurrentlyVisible) {
        // Just hide this video
        return {
          ...prev,
          videos: prev.videos.map(v => v.id === id ? { ...v, visible: false } : v),
        }
      } else {
        // Make this video visible, hide all others
        const updatedVideos = prev.videos.map(v => ({ ...v, visible: v.id === id }))
        if (!existing) {
          // Add new video state if doesn't exist
          updatedVideos.push({ id, isPlaying: false, progress: 0, volume: 80, muted: false, visible: true, currentTime: 0, duration: 0 })
        }
        return {
          ...prev,
          videos: updatedVideos,
        }
      }
    })
  }, [])

  // ============================================
  // BGM PLAYBACK
  // ============================================

  const playBgm = useCallback((id: string) => {
    setPlayingState(prev => {
      const existing = prev.bgm.find(b => b.id === id)
      if (existing) {
        return {
          ...prev,
          bgm: prev.bgm.map(b => b.id === id ? { ...b, isPlaying: true } : b),
        }
      }
      return {
        ...prev,
        bgm: [...prev.bgm, { id, isPlaying: true, volume: 80, loop: false, fade: false }],
      }
    })
  }, [])

  const pauseBgm = useCallback((id: string) => {
    setPlayingState(prev => ({
      ...prev,
      bgm: prev.bgm.map(b => b.id === id ? { ...b, isPlaying: false } : b),
    }))
  }, [])

  const setBgmVolume = useCallback((id: string, volume: number) => {
    setPlayingState(prev => ({
      ...prev,
      bgm: prev.bgm.map(b => b.id === id ? { ...b, volume } : b),
    }))
  }, [])

  const toggleBgmLoop = useCallback((id: string) => {
    setPlayingState(prev => ({
      ...prev,
      bgm: prev.bgm.map(b => b.id === id ? { ...b, loop: !b.loop } : b),
    }))
  }, [])

  const toggleBgmFade = useCallback((id: string) => {
    setPlayingState(prev => ({
      ...prev,
      bgm: prev.bgm.map(b => b.id === id ? { ...b, fade: !b.fade } : b),
    }))
  }, [])

  // ============================================
  // SFX PLAYBACK
  // ============================================

  const triggerSfx = useCallback((id: string) => {
    // Find the SFX item and play the audio
    const sfxItem = mediaLibrary.audio.sfx.find(s => s.id === id)
    if (sfxItem?.audioUrl && !globalSfxMuted) {
      const audio = new Audio(sfxItem.audioUrl)
      audio.volume = globalSfxVolume / 100
      audio.play().catch(() => {})
    }

    // Instant trigger - add to playing state briefly for visual feedback
    setPlayingState(prev => ({
      ...prev,
      sfx: [...prev.sfx, { id, isPlaying: true }],
    }))

    // Remove after short delay
    setTimeout(() => {
      setPlayingState(prev => ({
        ...prev,
        sfx: prev.sfx.filter(s => s.id !== id),
      }))
    }, 500)
  }, [mediaLibrary.audio.sfx])

  const triggerSfxByShortcut = useCallback((shortcut: number) => {
    const sfxItem = mediaLibrary.audio.sfx.find(s => s.shortcut === shortcut)
    if (sfxItem) {
      triggerSfx(sfxItem.id)
    }
  }, [mediaLibrary.audio.sfx, triggerSfx])

  // ============================================
  // IMAGE PRESENTATION
  // ============================================

  const presentImage = useCallback((id: string) => {
    // Hide any visible videos first
    setPlayingState(prev => ({
      ...prev,
      videos: prev.videos.map(v => ({ ...v, visible: false, isPlaying: false })),
      images: [{ id, isPresenting: true }] // Only one image can be presented at a time
    }))
  }, [])

  const hideImage = useCallback((id: string) => {
    setPlayingState(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }))
  }, [])

  const getPresentingImage = useCallback((): ImagePresentingState | undefined => {
    return playingState.images.find(img => img.isPresenting)
  }, [playingState.images])

  // ============================================
  // STREAM DECK
  // ============================================

  const getMediaById = useCallback((id: string): MediaItem | undefined => {
    const allMedia = [
      ...mediaLibrary.video.session,
      ...mediaLibrary.video.generic,
      ...mediaLibrary.audio.bgm,
      ...mediaLibrary.audio.sfx,
      ...mediaLibrary.images.session,
    ]
    return allMedia.find(m => m.id === id)
  }, [mediaLibrary])

  const addStreamDeckButton = useCallback(() => {
    const newId = `sd-${Date.now()}`
    // Apple-style gradient colors
    const gradients = [
      'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
      'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)',
      'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
      'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
      'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
      'linear-gradient(135deg, #00C7BE 0%, #5AC8FA 100%)',
      'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)',
      'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)',
    ]
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]
    
    setStreamDeckButtons(prev => [
      ...prev,
      {
        id: newId,
        name: 'New Button',
        color: randomGradient,
        icon: 'play',
        order: prev.length,
      }
    ])
  }, [])

  const removeStreamDeckButton = useCallback((id: string) => {
    setStreamDeckButtons(prev => prev.filter(b => b.id !== id))
  }, [])

  const updateStreamDeckButton = useCallback((id: string, updates: Partial<StreamDeckButton>) => {
    setStreamDeckButtons(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ))
  }, [])

  const reorderStreamDeckButtons = useCallback((fromIndex: number, toIndex: number) => {
    setStreamDeckButtons(prev => {
      const newButtons = [...prev]
      const [moved] = newButtons.splice(fromIndex, 1)
      newButtons.splice(toIndex, 0, moved)
      return newButtons.map((b, i) => ({ ...b, order: i }))
    })
  }, [])

  const loadStreamDeckPreset = useCallback((presetId: string) => {
    const preset = STREAM_DECK_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    
    const buttons: StreamDeckButton[] = preset.buttons.map((btn, index) => ({
      ...btn,
      id: `sd-${Date.now()}-${index}`,
      order: index,
    }))
    
    setStreamDeckButtons(buttons)
  }, [])

  const clearStreamDeck = useCallback(() => {
    setStreamDeckButtons([])
  }, [])

  const triggerStreamDeckButton = useCallback((id: string) => {
    const button = streamDeckButtons.find(b => b.id === id)
    if (!button) return
    
    // Handle stage control actions
    if (button.action) {
      switch (button.action) {
        case 'layout-solo':
          setStageControl(prev => ({ ...prev, layout: 'solo' }))
          return
        case 'layout-split':
          setStageControl(prev => ({ ...prev, layout: 'split' }))
          return
        case 'layout-grid':
          setStageControl(prev => ({ ...prev, layout: 'grid' }))
          return
        case 'layout-pip':
          setStageControl(prev => ({ ...prev, layout: 'pip' }))
          return
        case 'screen-share':
          setStageControl(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
          return
        case 'banner':
          setStageControl(prev => ({ ...prev, showBanner: !prev.showBanner }))
          return
        case 'branding':
          setStageControl(prev => ({ ...prev, showBranding: !prev.showBranding }))
          return
        case 'mute-all':
          setStageControl(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.isOnStage ? { ...p, isMuted: true } : p)
          }))
          return
      }
    }
    
    // Handle media actions
    if (!button.mediaId || !button.mediaType) return

    const media = getMediaById(button.mediaId)
    if (!media) return

    if (media.type === 'video') {
      // Toggle video play/pause
      const videoState = playingState.videos.find(v => v.id === media.id)
      if (videoState?.isPlaying) {
        pauseVideo(media.id)
      } else {
        playVideo(media.id)
      }
    } else if (media.type === 'audio') {
      if (media.category === 'bgm') {
        // Toggle BGM play/pause
        const bgmState = playingState.bgm.find(b => b.id === media.id)
        if (bgmState?.isPlaying) {
          pauseBgm(media.id)
        } else {
          playBgm(media.id)
        }
      } else if (media.category === 'sfx') {
        // SFX are one-shot, always trigger
        triggerSfx(media.id)
      }
    }
  }, [streamDeckButtons, getMediaById, playVideo, pauseVideo, playBgm, pauseBgm, triggerSfx, playingState])

  // ============================================
  // STAGE CONTROL
  // ============================================

  const setStageLayout = useCallback((layout: StageLayout) => {
    setStageControl(prev => ({ ...prev, layout }))
  }, [])

  const toggleParticipantStage = useCallback((id: string) => {
    setStageControl(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id 
          ? { 
              ...p, 
              isOnStage: !p.isOnStage,
              // Unmute when adding to stage
              isMuted: p.isOnStage ? p.isMuted : false 
            } 
          : p
      )
    }))
  }, [])

  const toggleParticipantMute = useCallback((id: string) => {
    setStageControl(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id ? { ...p, isMuted: !p.isMuted } : p
      )
    }))
  }, [])

  const toggleParticipantSpotlight = useCallback((id: string) => {
    setStageControl(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id ? { ...p, isSpotlighted: !p.isSpotlighted } : { ...p, isSpotlighted: false }
      )
    }))
  }, [])

  const muteAllParticipants = useCallback(() => {
    setStageControl(prev => ({
      ...prev,
      participants: prev.participants.map(p => ({ ...p, isMuted: true }))
    }))
  }, [])

  const bringAllOnStage = useCallback(() => {
    setStageControl(prev => ({
      ...prev,
      participants: prev.participants.map(p => ({ ...p, isOnStage: true, isMuted: false }))
    }))
  }, [])

  const toggleScreenShare = useCallback(() => {
    setStageControl(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
  }, [])

  const toggleBanner = useCallback(() => {
    setStageControl(prev => ({ ...prev, showBanner: !prev.showBanner }))
  }, [])

  const toggleStagebranding = useCallback(() => {
    setStageControl(prev => ({ ...prev, showBranding: !prev.showBranding }))
  }, [])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: MediaBoardContextType = {
    mediaLibrary,
    playingState,
    selectedCategory,
    setSelectedCategory,
    uploadMedia,
    deleteMedia,
    renameMedia,
    reorderMedia,
    playVideo,
    pauseVideo,
    setVideoProgress,
    setVideoTime,
    setVideoVolume,
    toggleVideoMute,
    toggleVideoVisibility,
    getVideoState,
    playBgm,
    pauseBgm,
    setBgmVolume,
    toggleBgmLoop,
    toggleBgmFade,
    triggerSfx,
    triggerSfxByShortcut,
    presentImage,
    hideImage,
    getPresentingImage,
    previewVideoId,
    setPreviewVideoId,
    streamDeckButtons,
    addStreamDeckButton,
    removeStreamDeckButton,
    updateStreamDeckButton,
    reorderStreamDeckButtons,
    triggerStreamDeckButton,
    loadStreamDeckPreset,
    clearStreamDeck,
    getMediaById,
    // Stage Control
    stageControl,
    setStageLayout,
    toggleParticipantStage,
    toggleParticipantMute,
    toggleParticipantSpotlight,
    muteAllParticipants,
    bringAllOnStage,
    toggleScreenShare,
    toggleBanner,
    toggleStagebranding,
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
  }

  return (
    <MediaBoardContext.Provider value={value}>
      {children}
    </MediaBoardContext.Provider>
  )
}
