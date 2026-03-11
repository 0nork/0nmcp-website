import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const WEBHOOK_SECRET = process.env.WEB0N_WEBHOOK_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use service role client for webhook operations (bypasses RLS)
function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase service role not configured')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature') || ''
  if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
    // Simple token-based verification
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, invoiceId, contactId } = body

    if (!type || !invoiceId) {
      return NextResponse.json({ error: 'Missing type or invoiceId' }, { status: 400 })
    }

    const supabase = getServiceClient()

    if (type === 'InvoicePaymentReceived' || type === 'invoice.paid') {
      // Find project by deposit or final invoice ID
      const { data: depositProject } = await supabase
        .from('web0n_projects')
        .select('*')
        .eq('deposit_invoice_id', invoiceId)
        .single()

      if (depositProject) {
        // Deposit invoice paid
        await supabase
          .from('web0n_projects')
          .update({
            status: 'deposit_paid',
            deposit_paid_at: new Date().toISOString(),
          })
          .eq('id', depositProject.id)

        return NextResponse.json({ success: true, action: 'deposit_paid', projectId: depositProject.id })
      }

      const { data: finalProject } = await supabase
        .from('web0n_projects')
        .select('*')
        .eq('final_invoice_id', invoiceId)
        .single()

      if (finalProject) {
        // Final invoice paid
        await supabase
          .from('web0n_projects')
          .update({
            status: 'final_paid',
            final_paid_at: new Date().toISOString(),
          })
          .eq('id', finalProject.id)

        return NextResponse.json({ success: true, action: 'final_paid', projectId: finalProject.id })
      }

      // Invoice not matched — log for debugging
      console.warn('web0n webhook: invoice not matched', { invoiceId, contactId })
      return NextResponse.json({ success: false, message: 'Invoice not matched to project' })
    }

    return NextResponse.json({ success: true, message: 'Event type not handled' })
  } catch (err) {
    console.error('web0n webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
