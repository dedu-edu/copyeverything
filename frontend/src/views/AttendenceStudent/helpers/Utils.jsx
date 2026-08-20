

import { EMPTY_COUNTS } from './Constants'

export function calcSummary(sessions = [], week = '') {
  const counts = { ...EMPTY_COUNTS }
  for (const session of sessions) {
    for (const w of session.weeks ?? []) {
      if (week && w.week !== parseInt(week)) continue
      if (w.state_name in counts) counts[w.state_name]++
    }
  }
  return counts
}

export function buildPageNumbers(currentPage, totalPages) {
  const delta = 2
  const left  = Math.max(1, currentPage - delta)
  const right = Math.min(totalPages, currentPage + delta)
  const pages = []

  if (left > 1)           { pages.push(1); if (left > 2) pages.push('...') }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages) }
  return pages
}