import { useState, useEffect, useMemo } from 'react'
import { API_BASE } from '../lib/api'

export function useScheduleData(year, month) {
  const [holidays, setHolidays] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/holidays?year=${year}`)
      .then(r => r.json())
      .then(data => setHolidays(data))
    fetch(`${API_BASE}/api/events?year=${year}`)
      .then(r => r.json())
      .then(data => setEvents(data))
  }, [year])

  const holidayMap = useMemo(() => {
    const map = new Map()
    for (const h of holidays) {
      const key = `${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(h.name)
    }
    return map
  }, [holidays])

  const eventMap = useMemo(() => {
    const map = new Map()
    for (const e of events) {
      const [, eMonth, eDay] = e.date.split('-').map(Number)
      if (eMonth !== month + 1) continue
      const day = String(eDay).padStart(2, '0')
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(e)
    }
    return map
  }, [events, month])

  return { holidayMap, eventMap }
}
