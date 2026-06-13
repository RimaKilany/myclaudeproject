import { Category } from '@/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface BadgeProps {
  category: Category
  className?: string
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

export function CategoryBadge({ category, className }: BadgeProps) {
  const color = CATEGORY_COLORS[category]
  const rgb = hexToRgb(color)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{ backgroundColor: `rgba(${rgb}, 0.12)`, color }}
    >
      <span>{CATEGORY_ICONS[category]}</span>
      {category}
    </span>
  )
}
