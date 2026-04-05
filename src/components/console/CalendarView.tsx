'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'

interface Appointment {
  id: string
  contactName: string
  title: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  calendarName?: string
  appointmentType?: string
}

interface CalendarResponse {
  appointments: Appointment[]
  total: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: 'rgba(126,217,87,0.1)', text: '#6EE05A', border: 'rgba(126,217,87,0.25)' },
  pending: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  completed: { bg: 'rgba(0,212,255,0.1)', text: '#00d4ff', border: 'rgba(0,212,255,0.25)' },
  'no-show': { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Spinner(): ReactNode {
  return (
    <div style={{
      width: 20, height: 20, border: '2px solid var(--border)',
      borderTopColor: '#6EE05A', borderRadius: '50%',
      animation: 'cal-spin 0.6s linear infinite',
    }} />
  )
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarView() {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)
      const startDate = new Date(year, month, 1).toISOString()
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const params = new URLSearchParams({ startDate, endDate })
      const res = await fetch(`/api/console/crm/calendar?${params}`)
      if (!res.ok) throw new Error(`Failed to fetch calendar (${res.status})`)
      const data: CalendarResponse = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments(currentYear, currentMonth)
  }, [currentYear, currentMonth, fetchAppointments])

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDay(null)
  }, [currentMonth])

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDay(null)
  }, [currentMonth])

  const goToToday = useCallback(() => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    setSelectedDay(dateKey(now))
  }, [])

  // Build appointment map by day
  const appointmentsByDay: Record<string, Appointment[]> = {}
  for (const apt of appointments) {
    const d = new Date(apt.startTime)
    const key = dateKey(d)
    if (!appointmentsByDay[key]) appointmentsByDay[key] = []
    appointmentsByDay[key].push(apt)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const today = dateKey(new Date())

  // Get appointments for selected day
  const selectedAppointments = selectedDay ? (appointmentsByDay[selectedDay] || []) : []

  // Build calendar grid cells
  const cells: Array<{ day: number | null; key: string }> = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: `empty-${i}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, key })
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
            Calendar
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} this month
          </p>
        </div>
        <button
          onClick={goToToday}
          style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(126,217,87,0.3)',
            background: 'rgba(126,217,87,0.08)', color: '#6EE05A', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,217,87,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(126,217,87,0.08)' }}
        >
          Today
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>
          <button
            onClick={() => fetchAppointments(currentYear, currentMonth)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
              background: 'transparent', color: '#ef4444', fontSize: '0.75rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', padding: '0 0.25rem',
      }}>
        <button
          onClick={goToPrevMonth}
          style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: '#7A8290', fontSize: '1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)' }}
        >
          ‹
        </button>
        <span style={{
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
        }}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={goToNextMonth}
          style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: '#7A8290', fontSize: '1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)' }}
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{
        borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
        overflow: 'hidden', marginBottom: '1.5rem', position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            borderRadius: 12,
          }}>
            <Spinner />
          </div>
        )}

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DAY_LABELS.map(day => (
            <div key={day} style={{
              padding: '0.625rem 0', textAlign: 'center',
              fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--text-muted)',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map(cell => {
            if (cell.day === null) {
              return <div key={cell.key} style={{ padding: '0.75rem', minHeight: 56 }} />
            }

            const dayAppts = appointmentsByDay[cell.key] || []
            const isToday = cell.key === today
            const isSelected = cell.key === selectedDay

            return (
              <button
                key={cell.key}
                onClick={() => setSelectedDay(isSelected ? null : cell.key)}
                style={{
                  padding: '0.5rem', minHeight: 56, border: 'none',
                  background: isSelected
                    ? 'rgba(126,217,87,0.08)'
                    : isToday
                      ? 'var(--bg-card)'
                      : 'transparent',
                  cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
                  borderBottom: '1px solid var(--bg-card)',
                  borderRight: '1px solid var(--bg-card)',
                  position: 'relative',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-card)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--bg-card)' : 'transparent' }}
              >
                <div style={{
                  fontSize: '0.8rem', fontWeight: isToday ? 700 : 400,
                  color: isToday ? '#6EE05A' : isSelected ? '#e8eaed' : '#7A8290',
                  marginBottom: 4,
                }}>
                  {cell.day}
                </div>
                {dayAppts.length > 0 && (
                  <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {dayAppts.slice(0, 3).map((apt, i) => {
                      const statusColor = STATUS_COLORS[apt.status]?.text || '#6EE05A'
                      return (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%', background: statusColor,
                        }} />
                      )
                    })}
                    {dayAppts.length > 3 && (
                      <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', lineHeight: '5px' }}>
                        +{dayAppts.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day appointments */}
      {selectedDay && (
        <div>
          <h2 style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.875rem',
          }}>
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString([], {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </h2>

          {selectedAppointments.length === 0 ? (
            <div style={{
              padding: '2rem 1.5rem', textAlign: 'center', borderRadius: 12,
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: '0.8rem',
            }}>
              No appointments on this day.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedAppointments
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(apt => {
                  const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.confirmed
                  const start = new Date(apt.startTime)
                  const end = apt.endTime ? new Date(apt.endTime) : null
                  const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const endStr = end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

                  return (
                    <div key={apt.id} style={{
                      padding: '1rem 1.25rem', borderRadius: 12,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      borderLeft: `3px solid ${colors.text}`,
                    }}>
                      {/* Time */}
                      <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {timeStr}
                        </div>
                        {endStr && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {endStr}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                          {apt.contactName || 'Unknown Contact'}
                        </div>
                        <div style={{
                          fontSize: '0.75rem', color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {apt.title || apt.appointmentType || apt.calendarName || 'Appointment'}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '0.25rem 0.625rem',
                        borderRadius: 6, background: colors.bg, color: colors.text,
                        border: `1px solid ${colors.border}`, textTransform: 'capitalize',
                        flexShrink: 0,
                      }}>
                        {apt.status}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* All appointments list (when no day selected) */}
      {!selectedDay && !loading && appointments.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.875rem',
          }}>
            Upcoming This Month
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {appointments
              .filter(apt => new Date(apt.startTime).getTime() >= Date.now())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 10)
              .map(apt => {
                const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.confirmed
                const start = new Date(apt.startTime)

                return (
                  <div key={apt.id} style={{
                    padding: '0.875rem 1.25rem', borderRadius: 12,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    borderLeft: `3px solid ${colors.text}`,
                  }}>
                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 50 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {start.toLocaleDateString([], { month: 'short' })}
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {start.getDate()}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {apt.contactName || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {apt.title || apt.appointmentType || 'Appointment'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: 6, background: colors.bg, color: colors.text,
                      border: `1px solid ${colors.border}`, textTransform: 'capitalize',
                      flexShrink: 0,
                    }}>
                      {apt.status}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {!selectedDay && !loading && appointments.length === 0 && !error && (
        <div style={{
          padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '1.25rem', color: '#3a3a4a', marginBottom: '0.5rem' }}>No appointments</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            No appointments scheduled for {MONTH_NAMES[currentMonth]} {currentYear}.
          </p>
        </div>
      )}

      <style>{`
        @keyframes cal-spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
