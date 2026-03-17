import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { RiverstylePage } from './pages/RiverstylePage'
import { PrototypePage } from './pages/PrototypePage'
import { MyComponentsPage } from './pages/MyComponentsPage'
import { DashboardPage } from './pages/DashboardPage'
import { FirstProjectPage } from './pages/FirstProjectPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectPage } from './pages/ProjectPage'
import { MadeForYouPage } from './pages/MadeForYouPage'
import { EditorPage } from './pages/EditorPage'
import { StudioPage } from './pages/StudioPage'
import { OnboardingFlowPage } from './pages/OnboardingFlowPage'
import { ChatOnboardingPage } from './pages/ChatOnboardingPage'
import { ThumbnailLPPage } from './pages/ThumbnailLPPage'

/**
 * RIVERSIDE PROTOTYPE APP
 * 
 * Routes:
 * - / : Home page with getting started guide
 * - /riverstyle : Storybook viewer for the design system
 * - /prototype : Your prototype workspace (Riverstyle components)
 * - /my-components : Custom components (when Riverstyle doesn't have what you need)
 * - /dashboard : Platform dashboard
 * - /projects : All projects grid view
 * - /projects/first : Your first project (empty page template)
 * - /projects/:id : Individual project page with recordings and files
 * - /made-for-you : Made for You page with Magic Episode and Co-Creator
 * - /editor : Video editor interface
 * - /onboarding : Improved onboarding flow prototype (addresses emotional barriers)
 * 
 * IMPORTANT FOR AI: Always use @riversidefm/riverstyle components and tokens!
 */
function App() {
  return (
    <Routes>
      {/* Pages with their own layout (no header) */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/first" element={<FirstProjectPage />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
      <Route path="/made-for-you" element={<MadeForYouPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/onboarding" element={<OnboardingFlowPage />} />
      <Route path="/chat-onboarding" element={<ChatOnboardingPage />} />
      <Route path="/thumbnails" element={<ThumbnailLPPage />} />
      
      {/* Other pages use standard layout */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/riverstyle" element={<Layout><RiverstylePage /></Layout>} />
      <Route path="/prototype" element={<Layout><PrototypePage /></Layout>} />
      <Route path="/my-components" element={<Layout><MyComponentsPage /></Layout>} />
    </Routes>
  )
}

export default App

