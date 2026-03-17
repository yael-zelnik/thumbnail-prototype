/**
 * THUMBNAIL LANDING PAGE - Riverside AI Thumbnails
 *
 * Multi-step flow for trying Riverside's AI thumbnail generator:
 * 1. Hero - Marketing value proposition
 * 2. Upload - Drop a recording file (mock)
 * 3. Choose Template - Pick from template library
 * 4. Result - Preview + download generated thumbnail
 * 5. Sign Up Gate - Iterate with Co-Creator requires account
 */

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icons } from '@riversidefm/riverstyle'

// Types
type Step = 'hero' | 'upload' | 'choose-template' | 'choose-title' | 'result' | 'signup'
type ParticipantFilter = 'all' | 1 | 2 | 3

interface ThumbnailTemplate {
  id: string
  name: string
  participantCount: 1 | 2 | 3
  bgColor: string
  accentColor: string
  style: string
  layout: 'split-left' | 'split-right' | 'top-text' | 'big-text' | 'overlay'
  image?: string
}

interface FlowState {
  step: Step
  uploadFileName: string | null
  uploadProgress: number
  selectedTemplateId: string | null
  selectedTitle: string | null
  participantFilter: ParticipantFilter
  detectedParticipants: 1 | 2 | 3
}

// Template data matching Figma board designs
const TEMPLATES: ThumbnailTemplate[] = [
  // 1 Speaker
  { id: 't1', name: 'Behind the Scenes', participantCount: 1, bgColor: '#1a1a2e', accentColor: '#ffffff', style: 'Bold', layout: 'overlay', image: '/templates/1speaker-2.png' },
  { id: 't2', name: 'Editorial Take', participantCount: 1, bgColor: '#f5f0e8', accentColor: '#7c3aed', style: 'Editorial', layout: 'split-right', image: '/templates/1speaker-3.png' },
  { id: 't3', name: 'Highlight a Point', participantCount: 1, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Statement', layout: 'split-left', image: '/templates/1speaker-4.png' },
  { id: 't4', name: 'Make a Statement', participantCount: 1, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Bold', layout: 'split-left', image: '/templates/1speaker-5.png' },
  { id: 't15', name: 'Explain an Idea', participantCount: 1, bgColor: '#1a1a2e', accentColor: '#ffffff', style: 'Gradient', layout: 'overlay', image: '/templates/1speaker-6.png' },
  { id: 't16', name: 'Creative Breakdown', participantCount: 1, bgColor: '#f5f0e8', accentColor: '#7c3aed', style: 'Educational', layout: 'top-text', image: '/templates/1speaker-7.png' },
  { id: 't17', name: 'Clean & Simple', participantCount: 1, bgColor: '#1a1a2e', accentColor: '#ffffff', style: 'Minimal', layout: 'overlay', image: '/templates/1speaker-8.png' },
  // 2 Speakers
  { id: 't5', name: 'Debate Perspectives', participantCount: 2, bgColor: '#352775', accentColor: '#a78bfa', style: 'Bold', layout: 'split-left', image: '/templates/template-1.png' },
  { id: 't6', name: 'Open a Conversation', participantCount: 2, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Minimal', layout: 'overlay', image: '/templates/template-4.png' },
  { id: 't7', name: 'Guided Learning', participantCount: 2, bgColor: '#f5f0e8', accentColor: '#50c9ff', style: 'Educational', layout: 'top-text', image: '/templates/template-5.png' },
  { id: 't8', name: 'Announce Updates', participantCount: 2, bgColor: '#352775', accentColor: '#ffffff', style: 'Dynamic', layout: 'big-text', image: '/templates/template-6.png' },
  { id: 't9', name: 'Share a Story', participantCount: 2, bgColor: '#1a1a2e', accentColor: '#b43dff', style: 'Story', layout: 'split-left', image: '/templates/template-7.png' },
  { id: 't10', name: 'Collaborate Together', participantCount: 2, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Collaborative', layout: 'overlay', image: '/templates/template-10.png' },
  // 3 Speakers
  { id: 't11', name: 'Highlight a Point', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Bold', layout: 'overlay', image: '/templates/3speaker-1.png' },
  { id: 't12', name: 'Editorial Take', participantCount: 3, bgColor: '#f5f0e8', accentColor: '#7c3aed', style: 'Editorial', layout: 'split-right', image: '/templates/3speaker-2.png' },
  { id: 't13', name: 'Make a Statement', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Statement', layout: 'split-left', image: '/templates/3speaker-3.png' },
  { id: 't14', name: 'Clean & Simple', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#ffffff', style: 'Minimal', layout: 'overlay', image: '/templates/3speaker-4.png' },
  { id: 't18', name: 'Creative Breakdown', participantCount: 3, bgColor: '#f5f0e8', accentColor: '#7c3aed', style: 'Educational', layout: 'top-text', image: '/templates/3speaker-5.png' },
  { id: 't19', name: 'Announce Updates', participantCount: 3, bgColor: '#352775', accentColor: '#a78bfa', style: 'Dynamic', layout: 'big-text', image: '/templates/3speaker-6.png' },
  { id: 't20', name: 'Comic Style', participantCount: 3, bgColor: '#f5f0e8', accentColor: '#1a1a2e', style: 'Illustrated', layout: 'top-text', image: '/templates/3speaker-7.png' },
  { id: 't21', name: 'Bold Impact', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Bold', layout: 'big-text', image: '/templates/3speaker-8.png' },
  { id: 't22', name: 'Dark & Bold', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#a78bfa', style: 'Story', layout: 'split-left', image: '/templates/3speaker-9.png' },
  { id: 't23', name: 'Behind the Scenes', participantCount: 3, bgColor: '#1a1a2e', accentColor: '#ffffff', style: 'Gradient', layout: 'overlay', image: '/templates/3speaker-10.png' },
]

// Module-level timer for generating step (survives React strict mode)
let _genStart = 0
let _genTimer: ReturnType<typeof setInterval> | null = null

const STEP_ORDER: Step[] = ['hero', 'upload', 'choose-template', 'choose-title', 'result', 'signup']

// Mock titles "extracted from the recording"
const SUGGESTED_TITLES = [
  'Professional Podcast Insights',
  'Behind the Scenes Talk',
  'Riverside Feedback Session',
]

export function ThumbnailLPPage() {
  const [state, setState] = useState<FlowState>({
    step: 'hero',
    uploadFileName: null,
    uploadProgress: 0,
    selectedTemplateId: null,
    selectedTitle: null,
    participantFilter: 'all',
    detectedParticipants: 2,
  })
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    setFadeIn(false)
    const timer = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timer)
  }, [state.step])

  const goToStep = (step: Step) => {
    setState(s => ({ ...s, step }))
    window.scrollTo(0, 0)
  }

  const stepIndex = STEP_ORDER.indexOf(state.step)
  // Progress dots: steps 2-5 (upload through signup) shown as 4 dots
  const progressStepIndex = stepIndex - 1

  const renderStep = () => {
    switch (state.step) {
      case 'hero':
        return <HeroStep onStart={() => goToStep('upload')} />
      case 'upload':
        return (
          <UploadStep
            fileName={state.uploadFileName}
            progress={state.uploadProgress}
            onFileSelect={(name) => setState(s => ({ ...s, uploadFileName: name, uploadProgress: 0 }))}
            setProgress={(p) => setState(s => ({ ...s, uploadProgress: p }))}
            onComplete={() => {
              const detected = ([1, 2, 3] as const)[Math.floor(Math.random() * 3)]
              setState(s => ({ ...s, detectedParticipants: detected }))
              goToStep('choose-template')
            }}
            onBack={() => goToStep('hero')}
          />
        )
      case 'choose-template':
        return (
          <ChooseTemplateStep
            selectedId={state.selectedTemplateId}
            detectedParticipants={state.detectedParticipants}
            onSelect={(id) => setState(s => ({ ...s, selectedTemplateId: id }))}
            onContinue={() => goToStep('choose-title')}
            onBack={() => goToStep('upload')}
          />
        )
      case 'choose-title':
        return (
          <ChooseTitleStep
            selectedTitle={state.selectedTitle}
            onSelect={(title) => setState(s => ({ ...s, selectedTitle: title }))}
            onContinue={() => goToStep('result')}
            onBack={() => goToStep('choose-template')}
          />
        )
      case 'result':
        return (
          <ResultStep
            template={TEMPLATES.find(t => t.id === state.selectedTemplateId)!}
            onStartOver={() => setState({
              step: 'upload',
              uploadFileName: null,
              uploadProgress: 0,
              selectedTemplateId: null,
              selectedTitle: null,
              participantFilter: 'all',
              detectedParticipants: 2,
            })}
            onBack={() => goToStep('choose-title')}
          />
        )
      case 'signup':
        return <SignUpStep onBack={() => goToStep('result')} />
      default:
        return null
    }
  }

  return (
    <div className="thumb-root">
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />

      {/* Header */}
      <header className="thumb-header">
        <div className="logo">
          <img src="/riverside-icon.svg" alt="Riverside" style={{ width: 32, height: 32 }} />
          <span className="logo-text">RIVERSIDE</span>
        </div>
        {state.step !== 'hero' && (
          <div className="progress-indicator">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`progress-dot ${i === progressStepIndex ? 'active' : ''} ${i < progressStepIndex ? 'completed' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="header-spacer" />
      </header>

      {/* Content */}
      <main className={`step-content ${state.step === 'hero' ? 'step-content--hero' : ''} ${['choose-template', 'result'].includes(state.step) ? 'step-content--wide' : ''} ${fadeIn ? 'fade-in' : 'fade-out'}`}>
        {renderStep()}
      </main>


      <style>{`
        .thumb-root {
          min-height: 100vh;
          background: #1D1D1D;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(180px);
          pointer-events: none;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: #9671ff;
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.08;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: #9671ff;
          bottom: -200px;
          right: -100px;
          opacity: 0.05;
        }

        /* Header */
        .thumb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1000px;
          margin-bottom: 48px;
          position: relative;
          z-index: 10;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-text {
          font-size: 15px;
          font-weight: 800;
          color: white;
          letter-spacing: 0.12em;
        }
        .progress-indicator {
          display: flex;
          gap: 8px;
        }
        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3a3a3a;
          transition: all 0.3s ease;
        }
        .progress-dot.active {
          width: 24px;
          border-radius: 4px;
          background: #9671ff;
        }
        .progress-dot.completed {
          background: #9671ff;
        }
        .header-spacer {
          width: 120px;
        }

        /* Content */
        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 640px;
          position: relative;
          z-index: 10;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .step-content--hero {
          max-width: 1100px;
          justify-content: flex-start;
        }
        .step-content--wide {
          max-width: 960px;
        }
        .fade-in { opacity: 1; transform: translateY(0); }
        .fade-out { opacity: 0; transform: translateY(16px); }

        /* Step containers */
        .step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        /* Hero card container */
        .hero-card {
          width: 100%;
          background: #282828;
          border-radius: 24px;
          overflow: hidden;
        }

        /* Hero split layout */
        .hero-split {
          display: flex;
          width: 100%;
          min-height: 480px;
          position: relative;
        }
        .hero-left {
          flex: 1;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 64px 420px 64px 48px;
        }
        .hero-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 380px;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%);
        }
        .hero-scroll-track {
          display: flex;
          flex-direction: column;
          animation: heroScrollUp 25s linear infinite;
        }
        .hero-scroll-set {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 16px;
        }
        .hero-template-card {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          display: flex;
          border: 1px solid rgba(255,255,255,0.08);
        }
        @keyframes heroScrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        /* Headlines */
        .headline {
          font-size: 48px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .subheadline {
          font: var(--font-body-large);
          color: #8E9095;
          max-width: 520px;
          line-height: 1.6;
        }

        /* Hero badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #282828;
          border: 1px solid #3a3a3a;
          border-radius: 100px;
          margin-bottom: 24px;
          font: var(--font-label-small);
          color: #9671ff;
        }

        /* Value props grid */
        .value-props-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin: 32px 0;
          width: 100%;
        }
        .value-prop-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 16px;
          text-align: left;
          transition: all 0.3s ease;
        }
        .value-prop-card:hover {
          background: #282828;
          border-color: #3a3a3a;
        }
        .value-prop-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #2B2B2B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .value-prop-title {
          font: var(--font-label-medium);
          color: #D2D2D2;
          margin-bottom: 2px;
        }
        .value-prop-desc {
          font: var(--font-body-small);
          color: #6b6d72;
        }

        /* CTA button */
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          background: #9671ff;
          border: none;
          border-radius: 12px;
          color: white;
          font: var(--font-label-medium);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          background: #a384ff;
          box-shadow: 0 8px 24px rgba(150, 113, 255, 0.3);
        }
        .cta-button:active { transform: translateY(0); }
        .cta-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Back button */
        .back-button {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #282828;
          border: 1px solid #3a3a3a;
          color: #D2D2D2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .back-button:hover { background: #333333; }

        /* Nav row */
        .nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        /* Upload */
        .upload-dropzone {
          width: 100%;
          max-width: 520px;
          min-height: 260px;
          border: 2px dashed #3a3a3a;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 32px 0;
          transition: all 0.3s ease;
          background: #222222;
          cursor: pointer;
        }
        .upload-dropzone:hover, .upload-dropzone.drag-over {
          border-color: #9671ff;
          background: #282828;
        }
        .upload-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #2B2B2B;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upload-hint {
          font: var(--font-body-medium);
          color: #8E9095;
        }
        .upload-formats {
          font: var(--font-body-small);
          color: #6b6d72;
        }

        /* Upload progress */
        .upload-progress-container {
          width: 100%;
          max-width: 520px;
          margin: 32px 0;
          padding: 32px;
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 24px;
        }
        .upload-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .upload-file-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #2B2B2B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .upload-file-name {
          font: var(--font-label-medium);
          color: #D2D2D2;
          text-align: left;
        }
        .upload-file-size {
          font: var(--font-body-small);
          color: #6b6d72;
          text-align: left;
        }
        .upload-progress-bar {
          width: 100%;
          height: 8px;
          background: #2B2B2B;
          border-radius: 4px;
          overflow: hidden;
        }
        .upload-progress-fill {
          height: 100%;
          background: #9671ff;
          border-radius: 4px;
          transition: width 0.15s ease;
        }
        .upload-progress-text {
          font: var(--font-body-small);
          color: #8E9095;
          margin-top: 8px;
          text-align: right;
        }

        /* Template grid */
        .filter-chips {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 24px 0 16px;
        }
        .filter-chip {
          padding: 10px 18px;
          border-radius: 100px;
          background: #222222;
          border: 1px solid #3a3a3a;
          color: #8E9095;
          font: var(--font-label-small);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-chip:hover {
          background: #282828;
          border-color: #4a4a4a;
          color: #D2D2D2;
        }
        .filter-chip.selected {
          background: #282828;
          border-color: #9671ff;
          color: white;
        }
        .template-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 16px 0 24px;
          width: 100%;
          max-height: 50vh;
          overflow-y: auto;
          padding-right: 4px;
        }
        .template-grid::-webkit-scrollbar {
          width: 6px;
        }
        .template-grid::-webkit-scrollbar-track {
          background: transparent;
        }
        .template-grid::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 3px;
        }
        .template-grid::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .template-card {
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          border: 2px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
          display: flex;
        }
        .template-card:hover {
          transform: scale(1.03);
          border-color: #4a4a4a;
        }
        .template-card.selected {
          border-color: #9671ff;
          box-shadow: 0 0 0 3px rgba(150, 113, 255, 0.25);
          transform: scale(1.03);
        }
        .template-card-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
        }
        .template-card-name {
          font: var(--font-label-small);
          color: white;
        }
        .template-card-style {
          font: var(--font-body-small);
          color: #6b6d72;
        }

        /* Title options */
        .title-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
          width: 100%;
          max-width: 520px;
        }
        .title-option {
          width: 100%;
          padding: 18px 24px;
          background: #222;
          border: 1px solid #3a3a3a;
          border-radius: 14px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .title-option:hover {
          background: #2a2a2a;
          border-color: #555;
        }
        .title-option.selected {
          background: #2a2a3a;
          border-color: #9671ff;
          box-shadow: 0 0 0 3px rgba(150, 113, 255, 0.15);
        }
        .title-option-custom {
          padding: 0;
          background: #1a1a1a;
        }
        .title-option-custom.selected {
          background: #1f1f2a;
        }
        .title-custom-input {
          width: 100%;
          padding: 18px 24px;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          font-family: inherit;
        }
        .title-custom-input::placeholder {
          color: #555;
          font-weight: 400;
        }

        /* Template image */
        .tmpl-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Template card content layouts (fallback) */
        .tmpl-person {
          width: 42px;
          height: 50px;
          background: rgba(255,255,255,0.22);
          border-radius: 50% 50% 4px 4px;
          border: 2px solid rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .tmpl-split {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          gap: 8px;
        }
        .tmpl-text-col {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .tmpl-line {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: white;
          line-height: 1.2;
        }
        .tmpl-people-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }
        .tmpl-people-row {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .tmpl-big {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          gap: 2px;
          padding: 8px;
        }
        .tmpl-giant {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: white;
          line-height: 1;
        }
        .tmpl-top-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          gap: 8px;
          padding: 12px;
        }
        .tmpl-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          gap: 8px;
          padding: 12px;
        }
        .tmpl-overlay-text {
          font-size: 13px;
          font-weight: 700;
          color: white;
          text-align: center;
        }

        /* Result */
        /* Generating step */
        .generating-preview {
          max-width: 480px;
          width: 100%;
        }
        .generating-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          display: flex;
        }
        .generating-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(2px);
        }
        .generating-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: #9671ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .generating-progress-bar {
          max-width: 320px;
          width: 100%;
          height: 4px;
          background: #2a2a2a;
          border-radius: 2px;
          margin-top: 20px;
          overflow: hidden;
        }
        .generating-progress-fill {
          height: 100%;
          background: #9671ff;
          border-radius: 2px;
          transition: width 0.1s linear;
        }
        .generating-signup-card {
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          padding: 28px 32px;
          text-align: left;
          margin-top: 32px;
          max-width: 420px;
          width: 100%;
        }
        .generating-signup-hint {
          font: var(--font-body-small);
          color: #9671ff;
          margin-top: 16px;
          text-align: center;
        }

        /* Result split layout */
        .result-step-wide {
          max-width: 1100px !important;
        }
        .result-split {
          display: flex;
          gap: 36px;
          width: 100%;
          align-items: center;
        }
        .result-left {
          flex: 1.4;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .result-right {
          flex: 1;
          max-width: 360px;
        }
        .result-signup-card {
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          padding: 32px 28px;
          text-align: left;
        }
        .result-signup-title {
          font-size: 22px;
          font-weight: 700;
          color: #D2D2D2;
          margin-bottom: 6px;
        }
        .result-signup-subtitle {
          font: var(--font-body-medium);
          color: #8E9095;
          margin-bottom: 20px;
        }
        .result-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          margin: 16px 0;
          display: flex;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        /* Co-Creator */
        .cocreator-card {
          background: #222;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          margin-top: 16px;
          overflow: hidden;
          width: 100%;
          padding: 16px 16px 0;
        }
        .cocreator-textarea {
          width: 100%;
          min-height: 90px;
          background: transparent;
          border: none;
          color: #D2D2D2;
          padding: 20px 20px 12px;
          font-size: 15px;
          font-family: inherit;
          resize: none;
          outline: none;
          line-height: 1.5;
        }
        .cocreator-textarea::placeholder {
          color: #555;
        }
        .cocreator-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
        }
        .cocreator-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid #3a3a3a;
          border-radius: 10px;
          color: #ccc;
          cursor: pointer;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .cocreator-add-btn:hover {
          border-color: #555;
          color: white;
        }
        /* Chat action buttons (Suggestions, Pick content) */
        .chat-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid #3a3a3a;
          border-radius: 10px;
          color: #8E9095;
          cursor: pointer;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .chat-action-btn:hover {
          background: #2a2a2a;
          color: #D2D2D2;
        }
        /* Send button */
        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #3a3a3a;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .chat-send-btn.active {
          background: #9671ff;
          color: white;
        }
        .chat-send-btn.active:hover {
          background: #a884ff;
        }

        /* Chat-style Co-Creator */
        .chat-container {
          background: #1a1a1a;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          width: 100%;
          text-align: left;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #2e2e2e;
        }
        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-header-title {
          font-size: 15px;
          font-weight: 600;
          color: #D2D2D2;
        }
        .chat-messages {
          padding: 24px 20px;
          flex: 1;
          overflow-y: auto;
        }
        .chat-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .chat-message.ai {
          flex-direction: row;
        }
        .chat-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2a2a2a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-bubble {
          flex: 1;
          min-width: 0;
        }
        .chat-text {
          font-size: 14px;
          color: #D2D2D2;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .chat-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          display: flex;
        }
        .chat-status {
          font-size: 13px;
          color: #8E9095;
          margin-top: 8px;
        }
        .chat-cta-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          margin-bottom: 16px;
        }
        .chat-input-area {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0;
          border-top: 1px solid #2e2e2e;
          background: #222;
          border-radius: 0 0 20px 20px;
          margin: 0;
        }
        .chat-input {
          width: 100%;
          min-width: 0;
          background: transparent;
          border: none;
          color: #D2D2D2;
          caret-color: #9671ff;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          line-height: 1.5;
          padding: 16px 20px 8px;
          overflow: hidden;
        }
        .chat-input::placeholder {
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Chat input actions bar */
        .chat-input-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px 12px;
        }
        .chat-input-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        /* Chat disclaimer */
        .chat-disclaimer {
          font-size: 11px;
          color: #555;
          text-align: center;
          padding: 8px 0 0;
        }

        /* Chat thumbnail scaled-up template content */
        .chat-thumbnail .tmpl-person {
          width: 56px;
          height: 66px;
          border-width: 2px;
        }
        .chat-thumbnail .tmpl-line {
          font-size: 18px;
        }
        .chat-thumbnail .tmpl-giant {
          font-size: 34px;
        }
        .chat-thumbnail .tmpl-overlay-text {
          font-size: 20px;
        }
        .chat-thumbnail .tmpl-split {
          padding: 20px 24px;
          gap: 12px;
        }
        .chat-thumbnail .tmpl-people-col {
          gap: 6px;
        }
        .chat-thumbnail .tmpl-people-row {
          gap: 10px;
        }

        /* Result thumbnail scaled-up template content */
        .result-thumbnail .tmpl-person {
          width: 72px;
          height: 84px;
          border-width: 3px;
        }
        .result-thumbnail .tmpl-line {
          font-size: 22px;
        }
        .result-thumbnail .tmpl-giant {
          font-size: 42px;
        }
        .result-thumbnail .tmpl-overlay-text {
          font-size: 24px;
        }
        .result-thumbnail .tmpl-split {
          padding: 24px 32px;
          gap: 16px;
        }
        .result-thumbnail .tmpl-people-col {
          gap: 8px;
        }
        .result-thumbnail .tmpl-people-row {
          gap: 12px;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 8px 0;
        }
        .iterate-cta {
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          margin-top: 32px;
          max-width: 520px;
          width: 100%;
        }
        .iterate-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #9671ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .iterate-title {
          font-size: 20px;
          font-weight: 700;
          color: #D2D2D2;
          margin-bottom: 8px;
        }
        .iterate-desc {
          font: var(--font-body-medium);
          color: #8E9095;
          margin-bottom: 20px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }
        .result-signup-cta {
          margin-top: 24px;
          font-size: 17px;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result-signup-hint {
          font: var(--font-body-small);
          color: #6b6d72;
          margin-top: 10px;
          text-align: center;
        }

        /* Share Modal */
        .share-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .share-modal {
          background: #1a1a1a;
          border-radius: 20px;
          padding: 28px 28px 24px;
          max-width: 460px;
          width: 90%;
        }
        .share-title {
          font-size: 18px;
          font-weight: 700;
          color: #D2D2D2;
          margin-bottom: 24px;
        }
        .share-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px 0;
        }
        .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0;
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.3;
          text-align: center;
          transition: color 0.2s;
        }
        .share-option:hover {
          color: white;
        }
        .share-option:hover .share-icon {
          transform: scale(1.08);
        }
        .share-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .share-divider {
          height: 1px;
          background: #2e2e2e;
          margin: 24px 0 16px;
        }
        .share-feedback {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
          font-size: 13px;
        }
        .share-feedback a {
          color: #9671ff;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }
        .share-feedback a:hover {
          text-decoration: underline;
        }

        .result-secondary-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        .result-divider {
          color: #4a4a4a;
        }
        .iterate-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          margin-top: 16px;
        }
        .iterate-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font: var(--font-body-medium);
          color: #D2D2D2;
        }
        .ghost-link {
          font: var(--font-link-small);
          color: #6b6d72;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.3s ease;
        }
        .ghost-link:hover { color: #8E9095; }

        /* Sign Up */
        /* Signup step */
        .signup-step-wide {
          max-width: 900px !important;
        }
        .signup-split {
          display: flex;
          gap: 48px;
          width: 100%;
          align-items: flex-start;
        }
        .signup-left {
          flex: 1;
          max-width: 420px;
        }
        .signup-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sso-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
          width: 100%;
        }
        .sso-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          border: 1px solid #3a3a3a;
          background: #222222;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sso-button:hover {
          background: #2a2a2a;
          border-color: #555;
        }
        .signup-legal {
          font: var(--font-body-small);
          color: #6b6d72;
          margin-top: 20px;
        }
        .signup-legal a {
          color: #9671ff;
          text-decoration: underline;
        }
        .signup-footer {
          font: var(--font-body-small);
          color: #6b6d72;
          margin-top: 8px;
        }
        .signup-footer a {
          color: #9671ff;
          text-decoration: none;
        }

        /* Signup Modal (popup) */
        .signup-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .signup-modal {
          background: #1a1a1a;
          border: 1px solid #2e2e2e;
          border-radius: 24px;
          padding: 48px 40px 36px;
          max-width: 440px;
          width: 100%;
          position: relative;
          text-align: center;
        }
        .signup-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid #3a3a3a;
          border-radius: 50%;
          color: #8E9095;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .signup-modal-close:hover {
          background: #2a2a2a;
          color: white;
        }
        .signup-modal h2 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }
        .signup-modal p {
          font: var(--font-body-medium);
          color: #8E9095;
          margin-bottom: 4px;
        }
        .signup-modal .sso-buttons {
          margin-top: 24px;
          max-width: 100%;
        }
        .signup-modal .signup-legal {
          margin-top: 20px;
        }
        .signup-modal .signup-footer {
          margin-top: 8px;
        }

        .signup-product-preview {
          background: #222222;
          border: 1px solid #2e2e2e;
          border-radius: 20px;
          padding: 40px 32px;
          text-align: center;
        }
        .signup-preview-title {
          font-size: 20px;
          font-weight: 700;
          color: #D2D2D2;
          line-height: 1.4;
          margin-bottom: 12px;
        }
        .signup-preview-features {
          font: var(--font-body-medium);
          color: #8E9095;
        }
        .signup-preview-features span {
          color: #b89aff;
        }

        /* Trust footer */
        .trust-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 48px;
          position: relative;
          z-index: 10;
        }
        .trust-text {
          font: var(--font-body-small);
          color: #6b6d72;
        }
        .trust-badge {
          font: var(--font-label-small);
          color: #8E9095;
          background: #222222;
          padding: 8px 16px;
          border-radius: 100px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Shared: Template Card Content ───────────────────────────────

function TemplateCardContent({ template }: { template: ThumbnailTemplate }) {
  if (template.image) {
    return <img src={template.image} alt={template.name} className="tmpl-image" />
  }

  const persons = Array.from({ length: template.participantCount }).map((_, i) => (
    <div key={i} className="tmpl-person" />
  ))

  switch (template.layout) {
    case 'split-left':
      return (
        <div className="tmpl-split">
          <div className="tmpl-text-col">
            <span className="tmpl-line">WHY</span>
            <span className="tmpl-line tmpl-accent" style={{ color: template.accentColor }}>THUMBNAILS</span>
            <span className="tmpl-line">MATTER</span>
          </div>
          <div className="tmpl-people-col">{persons}</div>
        </div>
      )
    case 'split-right':
      return (
        <div className="tmpl-split">
          <div className="tmpl-people-col">{persons}</div>
          <div className="tmpl-text-col">
            <span className="tmpl-line">WHY</span>
            <span className="tmpl-line tmpl-accent" style={{ color: template.accentColor }}>THUMBNAILS</span>
            <span className="tmpl-line">MATTER</span>
          </div>
        </div>
      )
    case 'big-text':
      return (
        <div className="tmpl-big">
          <span className="tmpl-giant">THUMB</span>
          <div className="tmpl-people-row">{persons}</div>
          <span className="tmpl-giant">NAILS</span>
        </div>
      )
    case 'top-text':
      return (
        <div className="tmpl-top-layout">
          <div className="tmpl-text-col" style={{ alignItems: 'center' }}>
            <span className="tmpl-line">WHY <span style={{ color: template.accentColor }}>THUMBNAILS</span> MATTER</span>
          </div>
          <div className="tmpl-people-row">{persons}</div>
        </div>
      )
    case 'overlay':
      return (
        <div className="tmpl-overlay">
          <div className="tmpl-people-row">{persons}</div>
          <div className="tmpl-overlay-text">
            Why <span style={{ color: template.accentColor }}>Thumbnails</span> Matter
          </div>
        </div>
      )
    default:
      return null
  }
}

// ─── Step 1: Hero ────────────────────────────────────────────────

function HeroStep({ onStart }: { onStart: () => void }) {
  const valueProps = [
    { icon: <Icons.Magic.CoCreator style={{ width: 20, height: 20, color: '#b89aff' }} />, title: 'One-click creation', desc: 'Generated from your recording — no photos needed' },
    { icon: <Icons.General.Brand style={{ width: 20, height: 20, color: '#b89aff' }} />, title: 'Your brand, built in', desc: 'Colors and fonts auto-extracted from your brand' },
    { icon: <Icons.Magic.MagicClips style={{ width: 20, height: 20, color: '#b89aff' }} />, title: 'Pick your style', desc: 'Choose from templates tailored to your content' },
    { icon: <Icons.Shapes.Star01 style={{ width: 20, height: 20, color: '#b89aff' }} />, title: 'Your brand, built in', desc: 'Auto-extracted from your settings' },
    { icon: <Icons.Magic.CoCreator style={{ width: 20, height: 20, color: '#b89aff' }} />, title: 'Iterate with AI', desc: 'Refine with Co-Creator' },
  ]

  // Pick diverse templates for the scrolling showcase (mix of 1/2/3 speakers)
  const showcaseTemplates = [
    TEMPLATES[0],  // 1speaker - Behind the Scenes
    TEMPLATES[7],  // 2speaker - Debate Perspectives
    TEMPLATES[10], // 3speaker - Highlight a Point
    TEMPLATES[2],  // 1speaker - Highlight a Point
    TEMPLATES[9],  // 2speaker - Share a Story
    TEMPLATES[12], // 3speaker - Make a Statement
    TEMPLATES[5],  // 1speaker - Creative Breakdown
    TEMPLATES[8],  // 2speaker - Guided Learning
  ]

  return (
    <div className="step-container" style={{ alignItems: 'stretch' }}>
      {/* Hero card */}
      <div className="hero-card">
        <div className="hero-split">
          {/* Left side: text content */}
          <div className="hero-left">
            <h1 className="headline" style={{ fontSize: 42 }}>
              Thumbnails that<br />stop the scroll.
            </h1>
            <p className="subheadline">
              Upload a recording and get stunning, on-brand thumbnails in seconds — no design skills needed.
            </p>

            <button className="cta-button" onClick={onStart} style={{ marginTop: 32 }}>
              Create your thumbnail
              <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Right side: scrolling template showcase */}
          <div className="hero-right">
            <div className="hero-scroll-track">
              {[0, 1].map(setIndex => (
                <div key={setIndex} className="hero-scroll-set">
                  {showcaseTemplates.map(t => (
                    <div
                      key={`${setIndex}-${t.id}`}
                      className="hero-template-card"
                      style={{ background: t.bgColor }}
                    >
                      <TemplateCardContent template={t} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Value props below the card */}
      <div className="value-props-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40 }}>
        {valueProps.slice(0, 3).map((vp, i) => (
          <div key={i} className="value-prop-card" style={{ flexDirection: 'column', textAlign: 'center', padding: '24px 16px', gap: 12 }}>
            <div className="value-prop-icon" style={{ margin: '0 auto' }}>{vp.icon}</div>
            <div>
              <div className="value-prop-title">{vp.title}</div>
              <div className="value-prop-desc">{vp.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Upload ──────────────────────────────────────────────

function UploadStep({
  fileName,
  progress,
  onFileSelect,
  setProgress,
  onComplete,
  onBack,
}: {
  fileName: string | null
  progress: number
  onFileSelect: (name: string) => void
  setProgress: (p: number) => void
  onComplete: () => void
  onBack: () => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const progressRef = useRef(progress)
  progressRef.current = progress

  // Simulate upload progress
  useEffect(() => {
    if (fileName && progress < 100) {
      intervalRef.current = window.setInterval(() => {
        const next = Math.min(progressRef.current + Math.random() * 12 + 3, 100)
        setProgress(next)
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setTimeout(onComplete, 300)
        }
      }, 120)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
    if (progress >= 100) {
      const timer = setTimeout(onComplete, 600)
      return () => clearTimeout(timer)
    }
  }, [fileName, progress])

  const handleClick = () => {
    if (!fileName) {
      onFileSelect('podcast-episode-42.mp4')
    }
  }

  return (
    <div className="step-container">
      <h1 className="headline">Upload your recording</h1>
      <p className="subheadline">
        Drop a recording and we'll extract your participants automatically.
      </p>

      {!fileName ? (
        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={handleClick}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onFileSelect('podcast-episode-42.mp4') }}
        >
          <div className="upload-icon">
            <Icons.General.UploadCloud01 style={{ width: 32, height: 32, color: '#9671ff' }} />
          </div>
          <span className="upload-hint">Drag & drop your recording here</span>
          <Button variant="secondary-36" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onFileSelect('podcast-episode-42.mp4') }}>
            Browse files
          </Button>
          <span className="upload-formats">MP4, MOV, WAV, MP3</span>
        </div>
      ) : (
        <div className="upload-progress-container">
          <div className="upload-file-info">
            <div className="upload-file-icon">
              <Icons.MediaDevices.Film01 style={{ width: 22, height: 22, color: '#9671ff' }} />
            </div>
            <div>
              <div className="upload-file-name">{fileName}</div>
              <div className="upload-file-size">124.3 MB</div>
            </div>
          </div>
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${Math.round(progress)}%` }} />
          </div>
          <div className="upload-progress-text">{Math.round(progress)}%</div>
        </div>
      )}

      <div className="nav-buttons">
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Choose Template ─────────────────────────────────────

function ChooseTemplateStep({
  selectedId,
  detectedParticipants,
  onSelect,
  onContinue,
  onBack,
}: {
  selectedId: string | null
  detectedParticipants: 1 | 2 | 3
  onSelect: (id: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  const filtered = TEMPLATES.filter(t => t.participantCount === detectedParticipants)

  return (
    <div className="step-container">
      <h1 className="headline">Choose your template</h1>
      <p className="subheadline">
        We detected {detectedParticipants} {detectedParticipants === 1 ? 'speaker' : 'speakers'} in your recording — pick a style.
      </p>

      <div className="template-grid">
        {filtered.map(t => (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              className={`template-card ${selectedId === t.id ? 'selected' : ''}`}
              style={{ background: t.bgColor }}
              onClick={() => onSelect(t.id)}
            >
              <TemplateCardContent template={t} />
            </div>
            <div className="template-card-info">
              <span className="template-card-name">{t.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="nav-buttons">
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="cta-button" disabled={!selectedId} onClick={onContinue}>
          Generate thumbnail
          <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}


// ─── Step 3b: Choose Title ───────────────────────────────────────

function ChooseTitleStep({
  selectedTitle,
  onSelect,
  onContinue,
  onBack,
}: {
  selectedTitle: string | null
  onSelect: (title: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  const [customText, setCustomText] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  return (
    <div className="step-container">
      <h1 className="headline">Choose your title</h1>
      <p className="subheadline">
        Extracted from your recording — pick one or write your own.
      </p>

      <div className="title-options">
        {SUGGESTED_TITLES.map((title, i) => (
          <button
            key={i}
            className={`title-option ${selectedTitle === title && !isCustom ? 'selected' : ''}`}
            onClick={() => { setIsCustom(false); onSelect(title) }}
          >
            {title}
          </button>
        ))}
        <div className={`title-option title-option-custom ${isCustom ? 'selected' : ''}`}>
          <input
            type="text"
            className="title-custom-input"
            placeholder="Other..."
            value={customText}
            onFocus={() => setIsCustom(true)}
            onChange={e => {
              setCustomText(e.target.value)
              setIsCustom(true)
              onSelect(e.target.value)
            }}
          />
        </div>
      </div>

      <div className="nav-buttons">
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button
          className="cta-button"
          disabled={!selectedTitle && !(isCustom && customText.trim())}
          onClick={onContinue}
        >
          Generate thumbnail
          <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Result ──────────────────────────────────────────────

function ResultStep({
  template,
  onStartOver: _onStartOver,
  onBack,
}: {
  template: ThumbnailTemplate
  onStartOver: () => void
  onBack: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [cocreatorText, setCocreatorText] = useState('')
  const done = progress >= 100

  const statusMessages = ['Analyzing your recording...', 'Extracting participants...', 'Applying template style...', 'Finalizing your thumbnail...']
  const statusText = statusMessages[Math.min(Math.floor(progress / 25), 3)]

  useEffect(() => {
    if (!_genStart) _genStart = Date.now()
    if (_genTimer) clearInterval(_genTimer)
    _genTimer = setInterval(() => {
      const p = Math.min(((Date.now() - _genStart) / 6000) * 100, 100)
      setProgress(p)
      if (p >= 100) {
        if (_genTimer) clearInterval(_genTimer)
        _genTimer = null
        _genStart = 0
      }
    }, 80)
    return () => {
      if (_genTimer) { clearInterval(_genTimer); _genTimer = null }
    }
  }, []) // eslint-disable-line

  return (
    <div className="step-container result-step-wide">
      <div className="result-split">
        {/* Left: Co-Creator Chat */}
        <div className="result-left">
          <div className="chat-container">
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <Icons.Magic.CoCreator style={{ width: 20, height: 20, color: '#b89aff' }} />
                <span className="chat-header-title">Co-Creator</span>
              </div>
            </div>

            {/* Chat messages area */}
            <div className="chat-messages">
              {/* AI message */}
              <div className="chat-message ai">
                <div className="chat-avatar">
                  <Icons.Magic.CoCreator style={{ width: 16, height: 16, color: '#b89aff' }} />
                </div>
                <div className="chat-bubble">
                  {!done ? (
                    <>
                      <div className="chat-thumbnail" style={{ background: template.bgColor, position: 'relative' }}>
                        <TemplateCardContent template={template} />
                        <div className="generating-overlay">
                          <div className="generating-spinner" />
                        </div>
                      </div>
                      <div className="generating-progress-bar" style={{ margin: '12px 0 0', maxWidth: '100%' }}>
                        <div className="generating-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="chat-status">{statusText}</p>
                    </>
                  ) : (
                    <>
                      <div className="chat-thumbnail" style={{ background: template.bgColor }}>
                        <TemplateCardContent template={template} />
                      </div>
                      <div className="chat-cta-row">
                        <Button variant="primary-36" onClick={() => {}}>
                          <Icons.General.Download01 style={{ width: 16, height: 16 }} />
                          Download
                        </Button>
                        <Button variant="secondary-36" onClick={() => setShowShareModal(true)}>
                          <Icons.General.Share07 style={{ width: 16, height: 16 }} />
                          Share
                        </Button>
                      </div>
                      <p className="chat-text">Make it yours — adjust the text, colors, layout, or background to match your brand and style.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Ask Co-Creator for any iteration"
                autoFocus
                value={cocreatorText}
                onChange={e => setCocreatorText(e.target.value)}
                rows={2}
              />
              <div className="chat-input-actions">
                <div className="chat-input-left" />
                <button
                  className={`chat-send-btn ${cocreatorText.trim() ? 'active' : ''}`}
                  onClick={() => setShowSignupModal(true)}
                >
                  <Icons.Arrows.ArrowUp style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Signup CTA */}
        <div className="result-right">
          <div className="result-signup-card">
            <h2 className="result-signup-title">Get more with Riverside</h2>
            <p className="result-signup-subtitle">Sign up for free and unlock:</p>

            <div className="iterate-features">
              <div className="iterate-feature">
                <Icons.Magic.CoCreator style={{ width: 18, height: 18, color: '#b89aff' }} />
                <span>Personalise your thumbnails</span>
              </div>
              <div className="iterate-feature">
                <Icons.General.Brand style={{ width: 18, height: 18, color: '#b89aff' }} />
                <span>Extract your brand automatically</span>
              </div>
              <div className="iterate-feature">
                <Icons.Magic.MagicClips style={{ width: 18, height: 18, color: '#b89aff' }} />
                <span>Get clips, shownotes and social posts</span>
              </div>
            </div>

            <button className="cta-button result-signup-cta" onClick={() => setShowSignupModal(true)}>
              Start for free
              <Icons.Arrows.ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      </div>

      <div className="nav-buttons" style={{ justifyContent: 'center', marginTop: 24 }}>
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Share Modal */}
      {/* Signup Modal — portal to body to avoid transform containment */}
      {showSignupModal && createPortal(
        <div className="signup-modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="signup-modal" onClick={e => e.stopPropagation()}>
            <button className="signup-modal-close" onClick={() => setShowSignupModal(false)}>
              <Icons.General.XClose style={{ width: 16, height: 16 }} />
            </button>
            <h2>Create your account</h2>
            <p>Sign up to join Riverside it's free</p>

            <div className="sso-buttons">
              <button className="sso-button" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button className="sso-button" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.45-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
              <button className="sso-button" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Continue with Spotify
              </button>
              <button className="sso-button" onClick={() => {}}>
                <Icons.Communications.Mail01 style={{ width: 20, height: 20, color: '#b89aff' }} />
                Continue with Email
              </button>
            </div>

            <div className="signup-legal">
              By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>
            </div>
            <div className="signup-footer">
              Have an account? <a href="#">Log in</a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showShareModal && (
        <div className="share-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <h2 className="share-title">Share</h2>
            <div className="share-grid">
              <button className="share-option" onClick={() => window.open('https://youtube.com/upload', '_blank')}>
                <div className="share-icon" style={{ background: '#333' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <span>YouTube</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://youtube.com/upload', '_blank')}>
                <div className="share-icon" style={{ background: '#333' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF4500"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73zM10 15l5.19-3L10 9v6z"/><rect x="16" y="3" width="6" height="18" rx="1" fill="#FF4500" opacity="0.8"/></svg>
                </div>
                <span>YouTube Shorts</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://instagram.com', '_blank')}>
                <div className="share-icon" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
                <span>Instagram</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://tiktok.com', '_blank')}>
                <div className="share-icon" style={{ background: '#111' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-3.77-1.85V6.69h3.77z"/></svg>
                </div>
                <span>TikTok</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://www.facebook.com/sharer/sharer.php', '_blank')}>
                <div className="share-icon" style={{ background: '#1877F2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span>Facebook</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://twitter.com/intent/tweet?text=Check%20out%20my%20thumbnail', '_blank')}>
                <div className="share-icon" style={{ background: '#333' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span>X</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/', '_blank')}>
                <div className="share-icon" style={{ background: '#0A66C2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                <span>LinkedIn</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://wa.me/?text=Check%20out%20my%20thumbnail', '_blank')}>
                <div className="share-icon" style={{ background: '#25D366' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span>WhatsApp</span>
              </button>
              <button className="share-option" onClick={() => window.open('https://t.me/share/url?text=Check%20out%20my%20thumbnail', '_blank')}>
                <div className="share-icon" style={{ background: '#26A5E4' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <span>Telegram</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 5: Sign Up ─────────────────────────────────────────────

function SignUpStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="step-container">
          <h1 className="headline">Create your account</h1>
          <p className="subheadline">Sign up to join Riverside — it's free</p>

          <div className="sso-buttons">
            <button className="sso-button" onClick={() => {}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="sso-button" onClick={() => {}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.45-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
            <button className="sso-button" onClick={() => {}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Continue with Spotify
            </button>
            <button className="sso-button" onClick={() => {}}>
              <Icons.Communications.Mail01 style={{ width: 20, height: 20, color: '#b89aff' }} />
              Continue with Email
            </button>
          </div>

          <div className="signup-legal">
            By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>
          </div>
          <div className="signup-footer">
            Have an account? <a href="#">Log in</a>
          </div>

      <div className="nav-buttons" style={{ justifyContent: 'center', marginTop: 24 }}>
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}
