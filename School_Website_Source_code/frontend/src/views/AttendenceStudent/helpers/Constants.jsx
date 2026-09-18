
export const PAGE_SIZE   = 40
export const MODAL_LIMIT = 50

export const STATE_KEYS = ['и', 'т', 'ч', 'ө']

export const STATE_CONFIG = {
  и: { label: 'Ирсэн',    bg: '#f0faf0', cardBg: '#e8f5e9', icon: '✅', color: '#2e7d32', cellBg: '#f0faf0' },
  т: { label: 'Тасалсан', bg: '#fff5f5', cardBg: '#ffebee', icon: '❌', color: '#c62828', cellBg: '#fff5f5' },
  ч: { label: 'Чөлөөтэй', bg: '#fffbf0', cardBg: '#fff9c4', icon: '📅', color: '#f57f17', cellBg: '#fffbf0' },
  ө: { label: 'Өвчтэй',   bg: '#f0f7ff', cardBg: '#e3f2fd', icon: '😷', color: '#0277bd', cellBg: '#f0f7ff' },
}

export const STATUS_CELL_COLOR = {
  и: '#c8e6c9',
  т: '#ffcdd2',
  ч: '#fff59d',
  ө: '#b3e5fc',
}

export const WEEK_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export const EMPTY_COUNTS = { и: 0, т: 0, ч: 0, ө: 0 }

export const LEGEND = [
  { status: 'и', label: 'Ирсэн',    bg: '#c8e6c9' },
  { status: 'т', label: 'Тасалсан', bg: '#ffcdd2' },
  { status: 'ч', label: 'Чөлөөтэй', bg: '#fff59d' },
  { status: 'ө', label: 'Өвчтэй',   bg: '#b3e5fc' },
]