/**
 * PLATFORM SIDEBAR - Riverside Platform Navigation
 * 
 * Main sidebar navigation component for the platform screens.
 * Uses Riverstyle components and design tokens.
 * 
 * Based on Figma design: https://www.figma.com/design/wXQnl6mSANal8DCbMssQkO/
 */

import { useState } from 'react'
import { Icons } from '@riversidefm/riverstyle'

// Sidebar navigation item type
export type SidebarNavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  href?: string
}

// Props for the sidebar
interface PlatformSidebarProps {
  navItems?: SidebarNavItem[]
  activeNavId?: string
  onNavChange?: (id: string) => void
  studioThumbnail?: string
  studioLabel?: string
  profileImage?: string
  onToggleSidebar?: (expanded: boolean) => void
}

// Default navigation items using Riverstyle icons
// Icon names match the file names in node_modules/@riversidefm/riverstyle/icons/
// e.g., home-05.svg.js → Icons.General.Home05
const defaultNavItems: SidebarNavItem[] = [
  { id: 'home', label: 'Home', icon: Icons.General.Home05 },
  { id: 'projects', label: 'Projects', icon: Icons.Files.Folder },
  { id: 'schedule', label: 'Schedule', icon: Icons.Time.Calendar },
  { id: 'hosting', label: 'Hosting', icon: Icons.MediaDevices.Podcast },
]

// Open Panel icon - exported from Figma
const openPanelIconSvg = '/icons/7651a885bd1db176e0eb76c6d8dc4047556a3563.svg'

// Confetti/Party icon - composed from Figma-exported SVG parts with exact transforms
// SVG files exported from Figma to /public/icons/
const ConfettiIcon = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ ...style, position: 'relative' }}>
    {/* Party popper cone - Polygon1, rotated 226.611deg */}
    <div style={{ 
      position: 'absolute', 
      left: '-4.88px', 
      top: '7.24px', 
      width: '22.08px', 
      height: '21.97px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/icons/2efbef5ee7793192692c3b469304bbd5357879f2.svg" 
        alt="" 
        style={{ 
          width: '14.12px', 
          height: '17.04px', 
          transform: 'rotate(226.611deg)',
          filter: 'brightness(0) invert(0.7)'
        }} 
      />
    </div>
    {/* Ellipse ring - rotated 46.611deg */}
    <div style={{ 
      position: 'absolute', 
      left: '4.91px', 
      top: '4.7px', 
      width: '14.87px', 
      height: '15.26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/icons/884a711ee2fe8f4d4037e5b6fdd6da88f5e88e1a.svg" 
        alt="" 
        style={{ 
          width: '15.63px', 
          height: '5.68px', 
          transform: 'rotate(46.611deg)',
          filter: 'brightness(0) invert(0.7)'
        }} 
      />
    </div>
    {/* Line 25 - rotated 88.944deg */}
    <div style={{ 
      position: 'absolute', 
      left: '12px', 
      top: '3px',
      transform: 'rotate(88.944deg)'
    }}>
      <img 
        src="/icons/1b58c3a74c03a493e1ec989fd6ea81d8b300f871.svg" 
        alt="" 
        style={{ 
          width: '2px', 
          height: '2px',
          filter: 'brightness(0) invert(0.7)'
        }} 
      />
    </div>
    {/* Vector 1 - curved streamer, rotated 54.615deg */}
    <div style={{ 
      position: 'absolute', 
      left: '15.5px', 
      top: '3.68px',
      width: '7.5px',
      height: '6.52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/icons/5edc09113d6be28e88bb32ae6d0ecf5830fa169f.svg" 
        alt="" 
        style={{ 
          width: '2.95px', 
          height: '7.1px', 
          transform: 'rotate(54.615deg)',
          filter: 'brightness(0) invert(0.7)'
        }} 
      />
    </div>
    {/* Line 27 - bottom streamer, rotated 45deg */}
    <div style={{ 
      position: 'absolute', 
      left: '3.75px', 
      top: '13.47px',
      width: '7.28px',
      height: '7.28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/icons/a2c9851a72f405545dbfad6ae8cfcf88c5d07692.svg" 
        alt="" 
        style={{ 
          width: '9.19px', 
          height: '1.1px', 
          transform: 'rotate(45deg)',
          filter: 'brightness(0) invert(0.7)'
        }} 
      />
    </div>
  </div>
)

// Default images
const defaultStudioThumbnail = '/fda5f7e20d2dbecde1b354509985b9a06a89bf03.png'
const defaultProfileImage = '/452d8b7bdde9fb6586b91d106d2241534a2b6bd2.png'

export function PlatformSidebar({
  navItems = defaultNavItems,
  activeNavId: controlledActiveNavId,
  onNavChange,
  studioThumbnail = defaultStudioThumbnail,
  studioLabel = 'Studio',
  profileImage = defaultProfileImage,
  onToggleSidebar,
}: PlatformSidebarProps) {
  // Internal state for uncontrolled usage
  const [internalActiveNav, setInternalActiveNav] = useState('home')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  
  // Use controlled or uncontrolled active state
  const activeNav = controlledActiveNavId ?? internalActiveNav
  
  const handleNavClick = (id: string) => {
    if (onNavChange) {
      onNavChange(id)
    } else {
      setInternalActiveNav(id)
    }
  }
  
  const handleToggleSidebar = () => {
    const newState = !sidebarExpanded
    setSidebarExpanded(newState)
    onToggleSidebar?.(newState)
  }

  return (
    <>
      <aside className="platform-sidebar">
        <div className="sidebar-top">
          {/* Open Panel Button */}
          <button 
            className="open-panel-btn" 
            title="Toggle sidebar"
            onClick={handleToggleSidebar}
          >
            <img src={openPanelIconSvg} alt="" style={{ width: 20, height: 20 }} />
          </button>

          {/* Top Actions (Studio + Nav) */}
          <div className="top-actions">
            {/* Studio Thumbnail */}
            <div className="studio-item">
              <div className="studio-thumbnail">
                <img src={studioThumbnail} alt={studioLabel} />
              </div>
              <span className="studio-label">{studioLabel}</span>
            </div>

            {/* Navigation Items */}
            <nav className="nav-items">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <item.icon style={{ width: 20, height: 20 }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="sidebar-bottom">
          {/* Action buttons */}
          <div className="action-buttons">
            {/* Icons.Users.UserPlus01 from user-plus-01.svg.js */}
            <button className="action-btn" title="Invite">
              <Icons.Users.UserPlus01 style={{ width: 20, height: 20 }} />
            </button>
            {/* Icons.MediaDevices.VideoRecorder from video-recorder.svg.js */}
            <button className="action-btn" title="Record">
              <Icons.MediaDevices.VideoRecorder style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Bottom icons */}
          <div className="bottom-icons">
            {/* Confetti/Party icon - custom from Figma design */}
            <button className="icon-btn" title="What's new">
              <ConfettiIcon style={{ width: 24, height: 24 }} />
            </button>
            {/* Icons.General.Settings02 from settings-02.svg.js */}
            <button className="icon-btn" title="Settings">
              <Icons.General.Settings02 style={{ width: 24, height: 24 }} />
            </button>
          </div>

          {/* Profile Avatar */}
          <div className="profile-avatar">
            <img src={profileImage} alt="Profile" />
          </div>
        </div>
      </aside>

      <style>{`
        /* Platform Sidebar */
        .platform-sidebar {
          width: 84px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px 8px 24px;
          background: var(--color-secondary-c1100);
          flex-shrink: 0;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 26px;
        }

        /* Open Panel Button */
        .open-panel-btn {
          width: 32px;
          height: 32px;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          color: var(--color-secondary-c300);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .open-panel-btn:hover {
          background: var(--color-secondary-c900);
          color: var(--color-secondary-c100);
        }

        /* Top Actions (Studio + Nav) */
        .top-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        /* Studio Item */
        .studio-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 68px;
          padding: 4px;
        }

        .studio-thumbnail {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.3);
        }

        .studio-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .studio-label {
          font: var(--font-tiny-label);
          color: var(--color-secondary-c300);
          letter-spacing: 0.2px;
        }

        /* Navigation Items */
        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 68px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 68px;
          height: 64px;
          padding: 12px 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-item span {
          font: var(--font-tiny-label);
          letter-spacing: 0.2px;
          color: var(--color-secondary-c300);
        }

        .nav-item svg {
          color: var(--color-secondary-c100);
        }

        .nav-item:hover {
          background: var(--color-secondary-c900);
        }

        .nav-item:hover span {
          color: var(--color-secondary-c100);
        }

        .nav-item.active {
          background: var(--color-secondary-c900);
        }

        .nav-item.active span {
          color: var(--color-secondary-c100);
        }

        /* Sidebar Bottom */
        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 200px;
          background: var(--color-secondary-c800);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c100);
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--color-secondary-c700);
        }

        .sidebar-divider {
          width: 24px;
          height: 1px;
          background: var(--color-secondary-c700);
        }

        .bottom-icons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .icon-btn {
          width: 68px;
          height: 40px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-secondary-c100);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: var(--color-secondary-c900);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 200px;
          overflow: hidden;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </>
  )
}

