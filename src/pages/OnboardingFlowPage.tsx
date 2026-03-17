/**
 * ONBOARDING FLOW - Riverside Design Style
 * 
 * Redesigned to match riverside.com aesthetic:
 * - Clean, spacious layouts
 * - Purple gradient accents
 * - Premium, modern feel
 * - Social proof elements
 * - Smooth animations
 */

import { useState, useEffect } from 'react'
import { Typography, Button, Icons, IconButton as _IconButton } from '@riversidefm/riverstyle'

// Types
type Goal = 'brand' | 'business' | 'thought-leader' | 'creative' | 'connect'
type Concern = 'equipment' | 'time' | 'quality' | 'audience' | 'consistency' | 'technical'

interface OnboardingState {
  step: number
  name: string
  goals: Goal[]
  concerns: Concern[]
}

const _TOTAL_STEPS = 5

// Goal options based on "Pull to the new way"
const GOALS: { id: Goal; title: string; desc: string }[] = [
  { id: 'brand', title: 'Build my personal brand', desc: 'Establish your voice and expertise' },
  { id: 'business', title: 'Grow my business', desc: 'Attract clients and customers' },
  { id: 'thought-leader', title: 'Become a thought leader', desc: 'Share insights and influence your industry' },
  { id: 'creative', title: 'Express myself creatively', desc: 'Tell stories and share what matters' },
  { id: 'connect', title: 'Connect with people', desc: 'Build a community around shared interests' },
]

// Concerns to address
const CONCERNS: { id: Concern; title: string }[] = [
  { id: 'equipment', title: "I don't have professional equipment" },
  { id: 'time', title: "I don't have enough time" },
  { id: 'quality', title: "My content won't be good enough" },
  { id: 'audience', title: "No one will want to listen" },
  { id: 'consistency', title: "I can't commit to a schedule" },
  { id: 'technical', title: "The technology seems overwhelming" },
]

// Reassuring responses
const CONCERN_RESPONSES: Record<Concern, { title: string; message: string }> = {
  equipment: {
    title: "Your phone is enough!",
    message: "Most successful podcasters started with just a smartphone. Riverside's AI enhances your audio quality automatically, so you sound professional from day one."
  },
  time: {
    title: "Start with 15 minutes",
    message: "Your first episode doesn't need to be an hour. A focused 15-minute conversation can be more impactful than a rambling long one. Quality over quantity."
  },
  quality: {
    title: "Done is better than perfect",
    message: "Every creator's first episode was their worst. The only way to get better is to start. Your unique perspective is already valuable — trust it."
  },
  audience: {
    title: "Start with one person in mind",
    message: "You don't need millions of listeners. If you can help just one person, you've succeeded. Your audience will grow as you stay consistent."
  },
  consistency: {
    title: "Flexibility is okay",
    message: "There's no rule that says you must publish weekly. Start with monthly, or even 'whenever you can.' What matters is that you begin."
  },
  technical: {
    title: "We handle the hard parts",
    message: "Riverside does the heavy lifting — recording, editing, transcription, distribution. You focus on what you're great at: the conversation."
  },
}

export function OnboardingFlowPage() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    name: '',
    goals: [],
    concerns: [],
  })
  const [currentConcernIndex, setConcernIndex] = useState(0)
  const [showResponse, setShowResponse] = useState(false)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    setFadeIn(false)
    const timer = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timer)
  }, [state.step])

  const goToStep = (step: number) => {
    setState(s => ({ ...s, step }))
    setConcernIndex(0)
    setShowResponse(false)
  }

  const toggleGoal = (goal: Goal) => {
    setState(s => ({
      ...s,
      goals: s.goals.includes(goal) 
        ? s.goals.filter(g => g !== goal)
        : [...s.goals, goal]
    }))
  }

  const toggleConcern = (concern: Concern) => {
    setState(s => ({
      ...s,
      concerns: s.concerns.includes(concern)
        ? s.concerns.filter(c => c !== concern)
        : [...s.concerns, concern]
    }))
  }

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return <WelcomeStep name={state.name} setName={(name) => setState(s => ({ ...s, name }))} onNext={() => goToStep(2)} />
      case 2:
        return <GoalsStep goals={state.goals} toggleGoal={toggleGoal} onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
      case 3:
        return <ConcernsStep concerns={state.concerns} toggleConcern={toggleConcern} onNext={() => goToStep(4)} onBack={() => goToStep(2)} />
      case 4:
        return (
          <ReassuranceStep 
            concerns={state.concerns} 
            currentIndex={currentConcernIndex}
            setCurrentIndex={setConcernIndex}
            showResponse={showResponse}
            setShowResponse={setShowResponse}
            onNext={() => goToStep(5)} 
            onBack={() => goToStep(3)} 
          />
        )
      case 5:
        return <ReadyStep name={state.name} onBack={() => goToStep(4)} />
      default:
        return null
    }
  }

  return (
    <div className="onboarding-root">
      {/* Gradient orbs background */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      
      {/* Header with logo and progress */}
      <header className="onboarding-header">
        <div className="logo">
          <img src="/riverside-icon.svg" alt="Riverside" style={{ width: 32, height: 32 }} />
          <span className="logo-text">Riverside</span>
        </div>
        <div className="progress-indicator">
          {[1, 2, 3, 4, 5].map(num => (
            <div 
              key={num} 
              className={`progress-dot ${num === state.step ? 'active' : ''} ${num < state.step ? 'completed' : ''}`}
            />
          ))}
        </div>
        <div className="header-spacer" />
      </header>

      {/* Main content */}
      <main className={`step-content ${fadeIn ? 'fade-in' : 'fade-out'}`}>
        {renderStep()}
      </main>

      {/* Trust badges */}
      {state.step === 1 && (
        <footer className="trust-footer">
          <span className="trust-text">Trusted by 50,000+ creators worldwide</span>
          <div className="trust-logos">
            <span className="trust-badge">★ 4.8 on G2</span>
          </div>
        </footer>
      )}

      <style>{`
        .onboarding-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Gradient orbs - Riverside style */
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.5;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #7848ff 0%, #b43dff 100%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.3;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #50c9ff 0%, #7848ff 100%);
          bottom: -100px;
          right: -100px;
          opacity: 0.2;
        }

        /* Header */
        .onboarding-header {
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
          font: var(--font-heading-xsmall);
          color: white;
          letter-spacing: -0.02em;
        }

        .progress-indicator {
          display: flex;
          gap: 8px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          width: 24px;
          border-radius: 4px;
          background: linear-gradient(90deg, #7848ff, #b43dff);
        }

        .progress-dot.completed {
          background: #7848ff;
        }

        .header-spacer {
          width: 120px;
        }

        /* Main content */
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

        .fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-out {
          opacity: 0;
          transform: translateY(16px);
        }

        /* Step containers */
        .step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        /* Headlines - Riverside style */
        .headline {
          font-size: 48px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: white;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subheadline {
          font: var(--font-body-large);
          color: rgba(255, 255, 255, 0.6);
          max-width: 480px;
          line-height: 1.6;
        }

        /* Name input - Premium style */
        .name-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 40px 0;
        }

        .name-input {
          width: 100%;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: white;
          font-size: 18px;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
        }

        .name-input:focus {
          outline: none;
          border-color: #7848ff;
          background: rgba(120, 72, 255, 0.05);
          box-shadow: 0 0 0 4px rgba(120, 72, 255, 0.15);
        }

        .name-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Primary CTA - Riverside gradient style */
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #7848ff 0%, #9671ff 100%);
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
          box-shadow: 0 8px 24px rgba(120, 72, 255, 0.4);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        /* Goal cards - Clean card style */
        .goals-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin: 32px 0;
        }

        .goal-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .goal-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .goal-card.selected {
          background: rgba(120, 72, 255, 0.1);
          border-color: #7848ff;
        }

        .goal-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .goal-card.selected .goal-icon {
          background: linear-gradient(135deg, #7848ff, #9671ff);
        }

        .goal-content {
          flex: 1;
        }

        .goal-title {
          font: var(--font-label-medium);
          color: white;
          margin-bottom: 4px;
        }

        .goal-desc {
          font: var(--font-body-small);
          color: rgba(255, 255, 255, 0.5);
        }

        .goal-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .goal-card.selected .goal-check {
          background: #7848ff;
          border-color: #7848ff;
        }

        /* Concern chips */
        .concerns-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 32px 0;
          max-width: 560px;
        }

        .concern-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          font: var(--font-label-medium);
          color: rgba(255, 255, 255, 0.7);
        }

        .concern-chip:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .concern-chip.selected {
          background: rgba(120, 72, 255, 0.15);
          border-color: #7848ff;
          color: white;
        }

        /* Reassurance card */
        .reassurance-container {
          width: 100%;
          max-width: 520px;
        }

        .concern-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          margin-bottom: 24px;
          font: var(--font-body-small);
          color: rgba(255, 255, 255, 0.6);
        }

        .reassurance-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          text-align: left;
          margin-bottom: 24px;
          animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reassurance-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .reassurance-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reassurance-title {
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
        }

        .reassurance-message {
          font: var(--font-body-large);
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        .reassurance-nav {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .nav-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-dot.active {
          background: #7848ff;
          width: 24px;
          border-radius: 4px;
        }

        /* Ready step */
        .ready-container {
          text-align: center;
        }

        .celebration-badge {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          animation: celebrate 0.6s ease;
        }

        @keyframes celebrate {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 40px 0;
          text-align: left;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7848ff, #9671ff);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-content {
          flex: 1;
        }

        .feature-title {
          font: var(--font-label-medium);
          color: white;
          margin-bottom: 4px;
        }

        .feature-desc {
          font: var(--font-body-small);
          color: rgba(255, 255, 255, 0.5);
        }

        /* Navigation buttons */
        .nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .back-button {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .skip-link {
          font: var(--font-link-small);
          color: rgba(255, 255, 255, 0.4);
          background: none;
          border: none;
          cursor: pointer;
          padding: 12px;
          margin-top: 8px;
          transition: color 0.3s ease;
        }

        .skip-link:hover {
          color: rgba(255, 255, 255, 0.7);
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
          color: rgba(255, 255, 255, 0.4);
        }

        .trust-badge {
          font: var(--font-label-small);
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 100px;
        }
      `}</style>
    </div>
  )
}

// Step 1: Welcome
function WelcomeStep({ name, setName, onNext }: { name: string; setName: (n: string) => void; onNext: () => void }) {
  return (
    <div className="step-container">
      <h1 className="headline">
        Create your best<br />content yet.
      </h1>
      <p className="subheadline">
        You're about to join 50,000+ creators who use Riverside to record, edit, and share studio-quality content.
      </p>

      <div className="name-input-wrapper">
        <input
          type="text"
          className="name-input"
          placeholder="What's your name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <button className="cta-button" onClick={onNext}>
        Get started
        <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
      </button>
    </div>
  )
}

// Step 2: Goals
function GoalsStep({ goals, toggleGoal, onNext, onBack }: { goals: Goal[]; toggleGoal: (g: Goal) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="step-container">
      <h1 className="headline">
        What brings you here?
      </h1>
      <p className="subheadline">
        Select all that apply. This helps us personalize your experience.
      </p>

      <div className="goals-grid">
        {GOALS.map(goal => {
          const isSelected = goals.includes(goal.id)
          const iconColor = isSelected ? 'white' : 'rgba(255, 255, 255, 0.5)'
          
          return (
            <div 
              key={goal.id}
              className={`goal-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="goal-icon">
                {goal.id === 'brand' && <Icons.Users.User01 style={{ width: 24, height: 24, color: iconColor }} />}
                {goal.id === 'business' && <Icons.General.Building01 style={{ width: 24, height: 24, color: iconColor }} />}
                {goal.id === 'thought-leader' && <Icons.MediaDevices.Lightbulb02 style={{ width: 24, height: 24, color: iconColor }} />}
                {goal.id === 'creative' && <Icons.General.Heart style={{ width: 24, height: 24, color: iconColor }} />}
                {goal.id === 'connect' && <Icons.Users.Users01 style={{ width: 24, height: 24, color: iconColor }} />}
              </div>
              <div className="goal-content">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-desc">{goal.desc}</div>
              </div>
              <div className="goal-check">
                {isSelected && <Icons.General.Check style={{ width: 14, height: 14, color: 'white' }} />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="nav-buttons">
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="cta-button" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  )
}

// Step 3: Concerns
function ConcernsStep({ concerns, toggleConcern, onNext, onBack }: { concerns: Concern[]; toggleConcern: (c: Concern) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="step-container">
      <h1 className="headline">
        Any hesitations?
      </h1>
      <p className="subheadline">
        It's normal to have doubts. Select any that resonate and we'll address them.
      </p>

      <div className="concerns-grid">
        {CONCERNS.map(concern => {
          const isSelected = concerns.includes(concern.id)
          
          return (
            <div 
              key={concern.id}
              className={`concern-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleConcern(concern.id)}
            >
              {concern.id === 'equipment' && <Icons.MediaDevices.Microphone01 style={{ width: 18, height: 18 }} />}
              {concern.id === 'time' && <Icons.Time.Clock style={{ width: 18, height: 18 }} />}
              {concern.id === 'quality' && <Icons.Shapes.Star01 style={{ width: 18, height: 18 }} />}
              {concern.id === 'audience' && <Icons.Users.Users01 style={{ width: 18, height: 18 }} />}
              {concern.id === 'consistency' && <Icons.Time.Calendar style={{ width: 18, height: 18 }} />}
              {concern.id === 'technical' && <Icons.MediaDevices.Monitor01 style={{ width: 18, height: 18 }} />}
              {concern.title}
            </div>
          )
        })}
      </div>

      <div className="nav-buttons">
        <button className="back-button" onClick={onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="cta-button" onClick={onNext}>
          {concerns.length > 0 ? 'Address my concerns' : 'Continue'}
        </button>
      </div>

      <button className="skip-link" onClick={onNext}>
        I'm ready to dive in →
      </button>
    </div>
  )
}

// Step 4: Reassurance
function ReassuranceStep({ 
  concerns, 
  currentIndex, 
  setCurrentIndex,
  showResponse,
  setShowResponse,
  onNext, 
  onBack 
}: { 
  concerns: Concern[]
  currentIndex: number
  setCurrentIndex: (i: number) => void
  showResponse: boolean
  setShowResponse: (s: boolean) => void
  onNext: () => void
  onBack: () => void
}) {
  const currentConcern = concerns[currentIndex]
  const response = currentConcern ? CONCERN_RESPONSES[currentConcern] : null
  const concernData = CONCERNS.find(c => c.id === currentConcern)
  
  useEffect(() => {
    if (currentConcern && !showResponse) {
      const timer = setTimeout(() => setShowResponse(true), 200)
      return () => clearTimeout(timer)
    }
  }, [currentConcern, showResponse, setShowResponse])

  const goToNext = () => {
    if (currentIndex < concerns.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResponse(false)
    } else {
      onNext()
    }
  }

  if (concerns.length === 0) {
    return (
      <div className="step-container">
        <div className="celebration-badge">
          <Icons.General.Zap style={{ width: 48, height: 48, color: 'white' }} />
        </div>
        
        <h1 className="headline">Love the confidence!</h1>
        <p className="subheadline">
          You're ready to create. Let's get you set up.
        </p>

        <div className="nav-buttons" style={{ marginTop: 32 }}>
          <button className="back-button" onClick={onBack}>
            <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <button className="cta-button" onClick={onNext}>
            Let's go
            <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="step-container">
      <h1 className="headline">Let's clear that up.</h1>
      <p className="subheadline">
        Here's the truth about common concerns.
      </p>

      <div className="reassurance-container" style={{ marginTop: 32 }}>
        {concernData && (
          <div className="concern-label">
            <Icons.AlertsFeedback.AlertCircle style={{ width: 16, height: 16 }} />
            "{concernData.title}"
          </div>
        )}

        {showResponse && response && (
          <div className="reassurance-card" key={currentConcern}>
            <div className="reassurance-header">
              <div className="reassurance-icon">
                <Icons.General.Check style={{ width: 24, height: 24, color: 'white' }} />
              </div>
              <div className="reassurance-title">{response.title}</div>
            </div>
            <p className="reassurance-message">{response.message}</p>
          </div>
        )}

        {concerns.length > 1 && (
          <div className="reassurance-nav">
            {concerns.map((_, i) => (
              <div 
                key={i}
                className={`nav-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(i)
                  setShowResponse(false)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="nav-buttons">
        <button className="back-button" onClick={currentIndex > 0 ? () => { setCurrentIndex(currentIndex - 1); setShowResponse(false) } : onBack}>
          <Icons.Arrows.ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="cta-button" onClick={goToNext}>
          {currentIndex < concerns.length - 1 ? 'Next' : 'I feel better'}
          <Icons.Arrows.ArrowRight style={{ width: 20, height: 20 }} />
        </button>
      </div>
    </div>
  )
}

// Step 5: Ready
function ReadyStep({ name, onBack }: { name: string; onBack: () => void }) {
  const displayName = name || 'there'
  
  return (
    <div className="step-container ready-container">
      <div className="celebration-badge">
        <Icons.General.Check style={{ width: 48, height: 48, color: 'white' }} />
      </div>
      
      <h1 className="headline">
        You're all set, {displayName}!
      </h1>
      <p className="subheadline">
        Your content journey starts now. Here's what you can do with Riverside.
      </p>

      <div className="features-list">
        <div className="feature-item">
          <div className="feature-icon">
            <Icons.MediaDevices.VideoRecorder style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div className="feature-content">
            <div className="feature-title">Record in studio quality</div>
            <div className="feature-desc">4K video and uncompressed audio, right from your browser</div>
          </div>
        </div>
        
        <div className="feature-item">
          <div className="feature-icon">
            <Icons.Magic.MagicAudio style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div className="feature-content">
            <div className="feature-title">Let AI polish your sound</div>
            <div className="feature-desc">Remove noise and make any mic sound professional</div>
          </div>
        </div>
        
        <div className="feature-item">
          <div className="feature-icon">
            <Icons.Magic.MagicClips style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div className="feature-content">
            <div className="feature-title">Create clips instantly</div>
            <div className="feature-desc">AI finds your best moments and turns them into shareable clips</div>
          </div>
        </div>
      </div>

      <button 
        className="cta-button" 
        onClick={() => window.location.href = '/studio'}
        style={{ minWidth: 260 }}
      >
        <Icons.MediaDevices.Recording01 style={{ width: 20, height: 20 }} />
        Start my first recording
      </button>

      <button className="skip-link" onClick={onBack}>
        ← Go back
      </button>
    </div>
  )
}
