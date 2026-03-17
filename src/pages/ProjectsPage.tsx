/**
 * PROJECTS PAGE - All Projects Grid View
 * 
 * Shows all projects in a grid layout with thumbnails.
 * Based on Figma design: All Projects - Grid View (node 14975:7205)
 * Uses Riverstyle components and the PlatformSidebar.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Icons } from '@riversidefm/riverstyle'
import { PlatformSidebar } from '../components/my-components'

// Speaker images from Figma
const imgSpeaker1 = '/icons/4306b5000124acacaee4b055aff5d35e0f9175e4.png'
const imgSpeaker2 = '/icons/77d69cf518a8647bd5380ca25978db6820a92bde.png'

// Sample project data
const sampleProjects = [
  {
    id: '1',
    name: 'Kendall & Stephen',
    type: 'empty' as const,
    createdAt: '1 day ago',
    files: '0 files',
  },
  {
    id: '2',
    name: 'Kendall & Stephen',
    type: '1-recording' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
  {
    id: '3',
    name: 'Kendall & Stephen',
    type: '2-recording' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
  {
    id: '4',
    name: 'Kendall & Stephen',
    type: '2-and-more' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 2 Edits',
  },
  {
    id: '5',
    name: 'Kendall & Stephen',
    type: 'audio' as const,
    createdAt: '1 day ago',
    files: '3 Recording',
  },
  {
    id: '6',
    name: 'Kendall & Stephen',
    type: '3-recording' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
  {
    id: '7',
    name: 'Kendall & Stephen',
    type: '1-speaker' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
  {
    id: '8',
    name: 'Kendall & Stephen',
    type: '2-recording' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
  {
    id: '9',
    name: 'Kendall & Stephen',
    type: '2-recording' as const,
    createdAt: '1 day ago',
    files: '2 Recording · 1 Edits',
  },
]

type ProjectType = 'empty' | '1-recording' | '2-recording' | '2-and-more' | '3-recording' | 'audio' | '1-speaker'

interface ProjectThumbnailProps {
  type: ProjectType
}

function ProjectThumbnail({ type }: ProjectThumbnailProps) {
  // Empty state - folder icon
  if (type === 'empty') {
    return (
      <div className="project-thumbnail">
        <div className="thumbnail-single empty-thumb">
          <Icons.Files.Folder style={{ width: 20, height: 20, color: 'var(--color-secondary-c700)' }} />
        </div>
      </div>
    )
  }

  // Default fallback
  if (!type) {
    return (
      <div className="project-thumbnail">
        <div className="thumbnail-single empty-thumb">
          <Icons.Files.Folder style={{ width: 20, height: 20, color: 'var(--color-secondary-c700)' }} />
        </div>
      </div>
    )
  }

  // Single recording (1 full thumbnail)
  if (type === '1-recording') {
    return (
      <div className="project-thumbnail">
        <div className="thumbnail-single">
          <img src={imgSpeaker1} alt="" className="speaker-img left" />
          <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
        </div>
      </div>
    )
  }

  // 1 speaker only
  if (type === '1-speaker') {
    return (
      <div className="project-thumbnail">
        <div className="thumbnail-single one-speaker">
          <img src={imgSpeaker1} alt="" className="single-speaker-img" />
        </div>
      </div>
    )
  }

  // 2 recordings with one empty slot
  if (type === '2-recording') {
    return (
      <div className="project-thumbnail with-sidebar">
        <div className="thumbnail-main">
          <img src={imgSpeaker1} alt="" className="speaker-img left" />
          <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
        </div>
        <div className="thumbnail-sidebar">
          <div className="thumbnail-small">
            <img src={imgSpeaker1} alt="" className="speaker-img left" />
            <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
          </div>
          <div className="thumbnail-small empty-thumb" />
        </div>
      </div>
    )
  }

  // 3 recordings (all filled)
  if (type === '3-recording') {
    return (
      <div className="project-thumbnail with-sidebar">
        <div className="thumbnail-main">
          <img src={imgSpeaker1} alt="" className="speaker-img left" />
          <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
        </div>
        <div className="thumbnail-sidebar">
          <div className="thumbnail-small">
            <img src={imgSpeaker1} alt="" className="speaker-img left" />
            <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
          </div>
          <div className="thumbnail-small">
            <img src={imgSpeaker1} alt="" className="speaker-img left" />
            <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
          </div>
        </div>
      </div>
    )
  }

  // 2+ more recordings
  if (type === '2-and-more') {
    return (
      <div className="project-thumbnail with-sidebar">
        <div className="thumbnail-main">
          <img src={imgSpeaker1} alt="" className="speaker-img left" />
          <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
        </div>
        <div className="thumbnail-sidebar">
          <div className="thumbnail-small">
            <img src={imgSpeaker1} alt="" className="speaker-img left" />
            <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
          </div>
          <div className="thumbnail-small with-overlay">
            <img src={imgSpeaker1} alt="" className="speaker-img left" />
            <img src={imgSpeaker2} alt="" className="speaker-img right flipped" />
            <div className="more-overlay">+2</div>
          </div>
        </div>
      </div>
    )
  }

  // Audio only
  if (type === 'audio') {
    return (
      <div className="project-thumbnail with-sidebar">
        <div className="thumbnail-main audio-thumb">
          <Icons.MediaDevices.Recording02 style={{ width: 32, height: 32, color: 'var(--color-primary-c400)' }} />
        </div>
        <div className="thumbnail-sidebar">
          <div className="thumbnail-small audio-thumb">
            <Icons.MediaDevices.Recording02 style={{ width: 32, height: 32, color: 'var(--color-primary-c400)' }} />
          </div>
          <div className="thumbnail-small audio-thumb">
            <Icons.MediaDevices.Recording02 style={{ width: 32, height: 32, color: 'var(--color-primary-c400)' }} />
          </div>
        </div>
      </div>
    )
  }

  return null
}

interface ProjectCardProps {
  project: typeof sampleProjects[0]
  onClick: () => void
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div className="project-card" onClick={onClick}>
      <ProjectThumbnail type={project.type} />
      <div className="project-info">
        <div className="project-header">
          <span className="project-name">{project.name}</span>
          <button className="more-btn" onClick={(e) => e.stopPropagation()}>
            <Icons.General.DotsHorizontal style={{ width: 20, height: 20 }} />
          </button>
        </div>
        <span className="project-meta">
          Created {project.createdAt} · {project.files}
        </span>
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  return (
    <div className="projects-root">
      {/* Platform Sidebar */}
      <PlatformSidebar 
        activeNavId="projects"
        onNavChange={() => {}}
      />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Top Bar with Search */}
        <div className="top-bar">
          <div className="search-container">
            <Icons.General.SearchMd style={{ width: 16, height: 16, color: 'var(--color-secondary-c300)' }} />
            <span className="search-text">Search</span>
          </div>
        </div>

        {/* Content Panel */}
        <div className="content-panel">
          {/* Header */}
          <div className="projects-header">
            <Typography variant="headingSmall">Projects</Typography>
            
            <div className="header-actions">
              {/* Sort Button */}
              <button className="sort-btn">
                <Icons.Arrows.SwitchVertical01 style={{ width: 20, height: 20 }} />
                <span>Last viewed</span>
              </button>

              {/* View Toggle */}
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <Icons.Layout.ListView style={{ width: 20, height: 20 }} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Icons.Layout.GridView style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* New Project Button */}
              <Button variant="primary-36" onClick={() => {}}>
                <Icons.General.Plus style={{ width: 20, height: 20 }} />
                New
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {sampleProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>

          {/* Help Button */}
          <button className="help-btn" title="Help">
            <Icons.General.HelpCircle style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      <style>{`
        .projects-root {
          display: flex;
          min-height: 100vh;
          background: var(--color-secondary-c1100);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        /* Main Area */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 8px 8px 0;
          overflow: hidden;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          justify-content: center;
          padding: 12px 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          padding: 4px 24px;
          max-width: 480px;
          width: 360px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-container:hover {
          background: var(--color-secondary-c700);
        }

        .search-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
          letter-spacing: 0.2px;
        }

        /* Content Panel */
        .content-panel {
          flex: 1;
          background: var(--color-secondary-c1000);
          border: 1px solid var(--color-secondary-c800);
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Projects Header */
        .projects-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 36px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          height: 36px;
          cursor: pointer;
          color: var(--color-secondary-c100);
          font: var(--font-link-medium);
          transition: all 0.2s ease;
        }

        .sort-btn:hover {
          background: var(--color-secondary-c700);
        }

        .view-toggle {
          display: flex;
          background: var(--color-secondary-c900);
          border-radius: 8px;
          padding: 2px;
          height: 36px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          color: var(--color-secondary-c300);
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          color: var(--color-secondary-c100);
        }

        .view-btn.active {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
          box-shadow: 0 0 14px rgba(34, 34, 34, 0.4);
        }

        /* Projects Grid - cards min 312px, max 464px */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(312px, 464px));
          gap: 24px;
        }

        /* Project Card */
        .project-card {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c800);
          border-radius: 12px;
          padding: 12px;
          height: 290px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .project-card:hover {
          border-color: var(--color-secondary-c600);
        }

        .project-card:hover .more-btn {
          opacity: 1;
        }

        /* Project Thumbnail */
        .project-thumbnail {
          aspect-ratio: 16 / 9;
          width: 100%;
          display: flex;
          gap: 8px;
          border-radius: 8px;
          overflow: hidden;
        }

        .thumbnail-single {
          flex: 1;
          background: var(--color-secondary-c700);
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .thumbnail-single.empty-thumb {
          background: var(--color-secondary-c1000);
          align-items: center;
          justify-content: center;
        }

        .thumbnail-single.one-speaker {
          justify-content: center;
          overflow: hidden;
        }

        .single-speaker-img {
          height: 100%;
          width: auto;
          object-fit: cover;
        }

        .project-thumbnail.with-sidebar {
          display: flex;
          gap: 8px;
        }

        .thumbnail-main {
          flex: 1;
          background: var(--color-secondary-c700);
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .thumbnail-main.audio-thumb {
          background: var(--color-secondary-c800);
          align-items: center;
          justify-content: center;
        }

        .thumbnail-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 33%;
        }

        .thumbnail-small {
          flex: 1;
          background: var(--color-secondary-c700);
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .thumbnail-small.empty-thumb {
          background: var(--color-secondary-c1000);
        }

        .thumbnail-small.audio-thumb {
          background: var(--color-secondary-c800);
          align-items: center;
          justify-content: center;
        }

        .thumbnail-small.with-overlay {
          position: relative;
        }

        .speaker-img {
          width: 50%;
          height: 100%;
          object-fit: cover;
        }

        .speaker-img.flipped {
          transform: scaleX(-1);
        }

        /* More overlay on thumbnails */
        .more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(19, 19, 19, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          font: var(--font-heading-xsmall);
          color: var(--color-secondary-c100);
        }

        /* Project Info */
        .project-info {
          display: flex;
          flex-direction: column;
        }

        .project-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .project-name {
          flex: 1;
          font: var(--font-heading-xxsmall);
          color: var(--color-secondary-c100);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .project-meta {
          font: var(--font-body-small);
          color: var(--color-secondary-c300);
        }

        .more-btn {
          opacity: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-secondary-c300);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
        }

        .more-btn:hover {
          color: var(--color-secondary-c100);
        }

        /* Help Button */
        .help-btn {
          position: absolute;
          bottom: 19px;
          right: 19px;
          width: 36px;
          height: 36px;
          border-radius: 50px;
          background: var(--color-secondary-c800);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c300);
          transition: all 0.2s ease;
        }

        .help-btn:hover {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
        }

      `}</style>
    </div>
  )
}
