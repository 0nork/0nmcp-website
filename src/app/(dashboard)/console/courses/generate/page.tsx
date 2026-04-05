'use client'
import CourseGenerator from '@/components/add0n/CourseGenerator'

export default function CourseGeneratorPage() {
  // In production, ssoToken comes from the URL params (CRM iframe)
  // For dashboard access, use a placeholder that the API handles
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <CourseGenerator ssoToken="" locationId="" />
    </div>
  )
}
