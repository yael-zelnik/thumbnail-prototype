/**
 * PROJECT PAGE - Individual Project Detail View
 * 
 * Shows a single project with recordings, tabs, and file management.
 * Based on Figma design: Project page (node 11513:13772)
 * Uses Riverstyle components and the PlatformSidebar.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Icons } from '@riversidefm/riverstyle'
import { PlatformSidebar, MadeForYouTabContent } from '../components/my-components'

// Speaker images from existing assets
const imgSpeaker1 = '/icons/4306b5000124acacaee4b055aff5d35e0f9175e4.png'
const imgSpeaker2 = '/icons/77d69cf518a8647bd5380ca25978db6820a92bde.png'

// Co-creator icon from Riverstyle magic icons
const CoCreatorIcon = Icons.Magic.CoCreator

// Sample recording data
const sampleRecordings = [
  {
    id: '1',
    name: 'Recording 01',
    timestamp: 'Recorded just now',
    duration: '45:00',
    thumbnails: [imgSpeaker1, imgSpeaker2],
  },
]

// Sample files data (recording files section)
const sampleFiles = [
  {
    id: '1',
    name: 'All participants',
    status: 'Ready',
    duration: '00:25:00',
    resolution: '1080×1920',
    exportStatus: 'Done',
    thumbnails: [imgSpeaker1, imgSpeaker2],
  },
  {
    id: '2',
    name: 'Tjin',
    status: 'Ready',
    duration: '00:25:00',
    resolution: '1080×1920',
    exportStatus: 'Done',
    thumbnails: [imgSpeaker1],
    hasIndicator: true,
  },
  {
    id: '3',
    name: 'Ben',
    status: 'Ready',
    duration: '00:25:00',
    resolution: '1080×1920',
    exportStatus: 'Done',
    thumbnails: [imgSpeaker2],
  },
]

// Tab definitions
const tabs = [
  { id: 'recordings', label: 'Recordings' },
  { id: 'made-for-you', label: 'Made for you' },
  { id: 'edits', label: 'Edits' },
  { id: 'exports', label: 'Exports' },
]

export function ProjectPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('recordings')
  const projectName = 'Science of Happiness'

  return (
    <div className="project-root">
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
          <div className="project-header">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => navigate('/projects')}>
                Projects
              </button>
              <Icons.Arrows.ChevronRight style={{ width: 20, height: 20, color: 'var(--color-secondary-c400)' }} />
              <span className="breadcrumb-current">{projectName}</span>
            </div>

            <div className="header-actions">
              <button className="icon-btn-link">
                <Icons.General.Link03 style={{ width: 20, height: 20 }} />
              </button>
              <Button variant="secondary-40" onClick={() => {}}>
                <Icons.General.Plus style={{ width: 20, height: 20 }} />
                Create
              </Button>
              <Button variant="primary-40" onClick={() => {}}>
                <CoCreatorIcon style={{ width: 20, height: 20 }} />
                Ask Co-Creator
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-section">
            <div className="tabs-row">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="tabs-line" />
          </div>

          {/* Content */}
          <div className="content-scroll">
            {activeTab === 'made-for-you' && (
              <MadeForYouTabContent />
            )}

            {activeTab === 'recordings' && (
              <>
                {/* Recording Card */}
                <div className="recording-card">
                  <div className="recording-thumbnail">
                    {sampleRecordings[0].thumbnails.map((thumb, idx) => (
                      <img key={idx} src={thumb} alt="" className="thumb-img" />
                    ))}
                    <div className="duration-badge">{sampleRecordings[0].duration}</div>
                  </div>
                  <div className="recording-info">
                    <div className="recording-meta">
                      <span className="recording-name">{sampleRecordings[0].name}</span>
                      <div className="recording-sub">
                        <span className="recording-time">{sampleRecordings[0].timestamp}</span>
                        <button className="dots-btn">
                          <Icons.General.DotsHorizontal style={{ width: 20, height: 20 }} />
                        </button>
                      </div>
                    </div>
                    <div className="recording-btns">
                      <Button variant="secondary-40" onClick={() => {}}>
                        <Icons.Editor.Scissors01 style={{ width: 16, height: 16 }} />
                        Edit
                      </Button>
                      <Button variant="secondary-40" onClick={() => {}}>
                        <Icons.General.Share07 style={{ width: 16, height: 16 }} />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recording Files */}
                <div className="files-section">
                  <div className="files-header">
                    <span className="files-title">Recording files</span>
                    <Button variant="secondary-40" onClick={() => {}}>
                      <Icons.General.Download01 style={{ width: 16, height: 16 }} />
                      Export all
                    </Button>
                  </div>
                  <div className="files-table">
                    {sampleFiles.map(file => (
                      <div key={file.id} className="file-row">
                        <div className="file-col file-col-name">
                          <div className="file-thumb">
                            {file.thumbnails.map((thumb, idx) => (
                              <img key={idx} src={thumb} alt="" />
                            ))}
                            {file.hasIndicator && (
                              <div className="file-badge">
                                <Icons.MediaDevices.VideoRecorder style={{ width: 10, height: 10 }} />
                              </div>
                            )}
                          </div>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-status">{file.status}</span>
                          </div>
                        </div>
                        <div className="file-col file-col-duration">{file.duration}</div>
                        <div className="file-col file-col-resolution">{file.resolution}</div>
                        <div className="file-col file-col-export">{file.exportStatus}</div>
                        <div className="file-col file-col-actions">
                          <Button variant="secondary-36" onClick={() => {}}>
                            <Icons.General.Download01 style={{ width: 16, height: 16 }} />
                            High Quality
                          </Button>
                          <Button variant="secondary-36" onClick={() => {}}>
                            <Icons.General.Download01 style={{ width: 16, height: 16 }} />
                            Cloud
                          </Button>
                          <button className="dots-btn">
                            <Icons.General.DotsHorizontal style={{ width: 20, height: 20 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab !== 'recordings' && activeTab !== 'made-for-you' && (
              <div className="empty-state">
                <span>No content yet</span>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button className="help-btn">
            <Icons.General.HelpCircle style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      <style>{`
        .project-root {
          display: flex;
          min-height: 100vh;
          background: var(--color-secondary-c1100);
          position: fixed;
          inset: 0;
        }

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
          padding: 8px 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          padding: 6px 140px;
          cursor: pointer;
        }

        .search-container:hover {
          background: var(--color-secondary-c700);
        }

        .search-text {
          font: var(--font-body-medium);
          color: var(--color-secondary-c100);
        }

        /* Content Panel */
        .content-panel {
          flex: 1;
          background: var(--color-secondary-c1000);
          border: 1px solid var(--color-secondary-c800);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Header */
        .project-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          gap: 24px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          font: var(--font-heading-small);
          font-weight: 700;
          color: var(--color-secondary-c400);
          cursor: pointer;
          padding: 0;
        }

        .breadcrumb-link:hover {
          color: var(--color-secondary-c200);
        }

        .breadcrumb-current {
          font: var(--font-heading-small);
          font-weight: 700;
          color: var(--color-secondary-c100);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-btn-link {
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-secondary-c100);
          cursor: pointer;
        }

        .icon-btn-link:hover {
          background: var(--color-secondary-c800);
        }

        /* Tabs */
        .tabs-section {
          padding: 0 24px;
        }

        .tabs-row {
          display: flex;
          gap: 24px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 8px 0;
          font: var(--font-label-medium);
          color: var(--color-secondary-c400);
          cursor: pointer;
        }

        .tab-btn:hover {
          color: var(--color-secondary-c200);
        }

        .tab-btn.active {
          color: var(--color-secondary-c100);
        }

        .tabs-line {
          height: 1px;
          background: var(--color-secondary-c700);
          margin-top: 12px;
        }

        /* Content Scroll */
        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Recording Card */
        .recording-card {
          max-width: 480px;
        }

        .recording-thumbnail {
          position: relative;
          aspect-ratio: 16 / 9;
          background: var(--color-secondary-c800);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
        }

        .thumb-img {
          width: 50%;
          height: 100%;
          object-fit: cover;
        }

        .duration-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.75);
          padding: 4px 8px;
          border-radius: 4px;
          font: var(--font-body-small);
          font-weight: 500;
          color: var(--color-secondary-c100);
        }

        .recording-info {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-top: 12px;
          gap: 16px;
        }

        .recording-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .recording-name {
          font: var(--font-label-medium);
          font-weight: 600;
          color: var(--color-secondary-c100);
        }

        .recording-sub {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .recording-time {
          font: var(--font-body-small);
          color: var(--color-secondary-c400);
        }

        .dots-btn {
          background: none;
          border: none;
          padding: 0;
          color: var(--color-secondary-c400);
          cursor: pointer;
          display: flex;
        }

        .dots-btn:hover {
          color: var(--color-secondary-c100);
        }

        .recording-btns {
          display: flex;
          gap: 8px;
        }

        /* Files Section */
        .files-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .files-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .files-title {
          font: var(--font-heading-xxsmall);
          color: var(--color-secondary-c100);
        }

        .files-table {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* File Row */
        .file-row {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          gap: 24px;
        }

        .file-row:hover {
          background: var(--color-secondary-c900);
        }

        .file-col {
          font: var(--font-body-medium);
          color: var(--color-secondary-c300);
        }

        .file-col-name {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .file-col-duration {
          width: 80px;
        }

        .file-col-resolution {
          width: 100px;
        }

        .file-col-export {
          width: 60px;
        }

        .file-col-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .file-thumb {
          width: 48px;
          height: 36px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          background: var(--color-secondary-c700);
          position: relative;
          flex-shrink: 0;
        }

        .file-thumb img {
          flex: 1;
          height: 100%;
          object-fit: cover;
        }

        .file-badge {
          position: absolute;
          bottom: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: var(--color-primary-c800);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .file-name {
          font: var(--font-label-medium);
          font-weight: 500;
          color: var(--color-secondary-c100);
        }

        .file-status {
          font: var(--font-body-small);
          color: var(--color-secondary-c400);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          font: var(--font-body-medium);
          color: var(--color-secondary-c400);
        }

        /* Help Button */
        .help-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-secondary-c800);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-secondary-c300);
          cursor: pointer;
        }

        .help-btn:hover {
          background: var(--color-secondary-c700);
          color: var(--color-secondary-c100);
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .file-col-duration,
          .file-col-resolution {
            display: none;
          }
        }

        @media (max-width: 900px) {
          .file-col-export {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
