import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import GridEmbed from './GridEmbed'

const GRID_URL = 'https://grid.0nmcp.com/communities/groups/the-0nboard/home'

export const metadata = {
  title: 'Grid | 0nMCP',
  description: 'The 0nBoard — community for 0nMCP builders',
  robots: { index: false, follow: false },
}

export default async function GridPage() {
  const supabase = await createSupabaseServer()
  if (!supabase) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/grid')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, crm_contact_id, crm_location_id')
    .eq('id', user.id)
    .single()

  const hasAccess = profile?.plan && profile.plan !== 'free'

  if (!hasAccess) {
    redirect('/console?ref=community')
  }

  // Show Grid for all paid users — CRM setup is optional enhancement
  return <GridEmbed gridUrl={GRID_URL} hasCrmSetup={true} />
}
