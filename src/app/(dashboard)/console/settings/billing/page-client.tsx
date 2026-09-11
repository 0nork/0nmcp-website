'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Zap, ArrowUpRight } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: '$0', period: '/forever', features: ['Console access', 'BYOK AI keys', 'Limited tools', 'Community support'], current: true },
  { name: 'Supporter', price: 'TBD', period: '/mo', features: ['More tools', 'Vault encryption', 'Email support', 'Priority queue'], current: false },
  { name: 'Builder', price: 'TBD', period: '/mo', features: ['Full tool registry', 'Workflow builder', 'API access', 'Custom integrations'], current: false },
  { name: 'Agency', price: 'TBD', period: '/mo', features: ['Sub-location unlock', 'CRM integration', 'Marketplace Add0ns', 'White-label'], current: false },
]

export default function BillingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#fafafa]">Billing</h1>

      <Card className="bg-[#273142] border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#487fff]" />
              <div>
                <div className="text-sm font-bold text-[#fafafa]">Current Plan: Free</div>
                <div className="text-xs text-[#b4b4b4]">Atomic billing: $0.01 per tool call when active</div>
              </div>
            </div>
            <Badge className="bg-[#487fff]/15 text-[#487fff] border-0">FREE</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map(plan => (
          <Card key={plan.name} className={`border-white/10 ${plan.current ? 'bg-[#487fff]/10 border-[#487fff]/30' : 'bg-[#273142]'}`}>
            <CardContent className="p-5">
              <div className="text-sm font-bold text-[#fafafa] mb-1">{plan.name}</div>
              <div className="text-2xl font-bold text-[#fafafa]">{plan.price}<span className="text-xs text-[#b4b4b4] font-normal">{plan.period}</span></div>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-[#b4b4b4] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#487fff]" />{f}
                  </li>
                ))}
              </ul>
              <Button size="sm" className={`mt-4 w-full ${plan.current ? 'bg-white/10 text-[#fafafa]' : 'bg-[#487fff] text-white hover:bg-[#487fff]/80'}`} disabled={plan.current}>
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
