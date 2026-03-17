/**
 * CATEGORY SIDEBAR
 * 
 * Navigation sidebar for the Media Board with expandable category hierarchy.
 */

import { Icons } from '@riversidefm/riverstyle'
import { useMediaBoard, CategoryPath } from './MediaBoardContext'

interface CategoryItem {
  id: CategoryPath
  label: string
  icon: React.ReactNode
  children?: CategoryItem[]
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'video',
    label: 'Video',
    icon: <Icons.MediaDevices.VideoRecorder style={{ width: 16, height: 16 }} />,
    children: [
      { id: 'video.session', label: 'Session Media', icon: null },
      { id: 'video.generic', label: 'Generic Media', icon: null },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: <Icons.MediaDevices.MusicNote01 style={{ width: 16, height: 16 }} />,
    children: [
      { id: 'audio.bgm', label: 'Background Music', icon: null },
      { id: 'audio.sfx', label: 'Sound Effects', icon: null },
    ],
  },
  {
    id: 'images',
    label: 'Images',
    icon: <Icons.Images.Image01 style={{ width: 16, height: 16 }} />,
    children: [
      { id: 'images.session', label: 'Session Media', icon: null },
    ],
  },
]

function CategoryButton({ 
  item, 
  isSelected, 
  isExpanded,
  onSelect 
}: { 
  item: CategoryItem
  isSelected: boolean
  isExpanded: boolean
  onSelect: (id: CategoryPath) => void
}) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <button
      className={`category-button ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      {item.icon && <span className="category-icon">{item.icon}</span>}
      <span className="category-label">{item.label}</span>
      {hasChildren && (
        <Icons.Arrows.ChevronDown 
          style={{ 
            width: 12, 
            height: 12,
            marginLeft: 'auto',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }} 
        />
      )}
    </button>
  )
}

function SubCategoryButton({ 
  item, 
  isSelected, 
  onSelect 
}: { 
  item: CategoryItem
  isSelected: boolean
  onSelect: (id: CategoryPath) => void
}) {
  return (
    <button
      className={`subcategory-button ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <span className="subcategory-label">{item.label}</span>
    </button>
  )
}

export function CategorySidebar() {
  const { selectedCategory, setSelectedCategory } = useMediaBoard()

  // Determine which parent category is expanded based on selection
  const getParentCategory = (path: CategoryPath): string => {
    return path.split('.')[0]
  }

  const expandedCategory = getParentCategory(selectedCategory)

  const handleSelect = (id: CategoryPath) => {
    // If clicking a parent category, select its first child
    const category = CATEGORIES.find(c => c.id === id)
    if (category?.children && category.children.length > 0) {
      setSelectedCategory(category.children[0].id)
    } else {
      setSelectedCategory(id)
    }
  }

  return (
    <div className="category-sidebar">
      <div className="category-header">
        <Icons.MediaDevices.MusicNote01 style={{ width: 16, height: 16 }} />
        <span>Media</span>
      </div>
      
      <div className="category-list">
        {CATEGORIES.map(category => {
          const isExpanded = getParentCategory(selectedCategory) === category.id.split('.')[0]
          const isParentSelected = selectedCategory.startsWith(category.id)

          return (
            <div key={category.id} className="category-group">
              <CategoryButton
                item={category}
                isSelected={isParentSelected}
                isExpanded={isExpanded}
                onSelect={handleSelect}
              />
              
              {isExpanded && category.children && (
                <div className="subcategory-list">
                  {category.children.map(child => (
                    <SubCategoryButton
                      key={child.id}
                      item={child}
                      isSelected={selectedCategory === child.id}
                      onSelect={setSelectedCategory}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
