/**
 * 0n Console — Workflow Idea Suggestions
 * Ported from onork-app/lib/ideas.ts, adapted for 0nmcp.com
 *
 * Generates contextual workflow suggestions based on which services
 * the user has connected. The more services connected, the more
 * cross-service automation ideas become available.
 */

/** Map of service combination keys to workflow idea strings */
export const IDEAS: Record<string, string[]> = {
  "crm+stripe": [
    "When Stripe payment received -> auto-create CRM contact",
    "Subscription cancelled -> trigger win-back email in CRM",
    "CRM deal closed -> generate Stripe invoice",
  ],
  "crm+anthropic": [
    "New contact -> Claude scores lead quality",
    "Auto-draft personalized follow-ups with AI",
    "Classify form submissions by intent via Claude",
  ],
  "stripe+anthropic": [
    "Dispute opened -> AI drafts response from transaction data",
    "Monthly Stripe revenue -> AI summary report",
  ],
  "github+vercel": [
    "PR opened -> auto preview deploy",
    "Release published -> production deploy",
  ],
  "slack+crm": [
    "New CRM contact -> Slack notification in #sales",
    "Deal stage change -> alert team channel",
  ],
  "gmail+crm": [
    "Email from unknown sender -> create CRM contact",
    "CRM task due -> send Gmail reminder",
  ],
  "hubspot+stripe": [
    "HubSpot deal won -> create Stripe subscription",
    "Stripe churn -> update HubSpot lifecycle stage",
  ],
  "notion+slack": [
    "Notion page updated -> Slack notification",
    "Slack message saved -> create Notion page",
  ],
  "clickup+github": [
    "GitHub issue -> ClickUp task",
    "ClickUp task done -> close GitHub issue",
  ],
  "salesforce+anthropic": [
    "New Salesforce lead -> AI qualification score",
    "Opportunity notes -> AI-generated next steps",
  ],
  "whatsapp+crm": [
    "WhatsApp message -> create/update CRM contact",
    "CRM appointment booked -> WhatsApp confirmation",
  ],
  "gdrive+notion": [
    "New Google Drive file -> Notion database entry",
    "Notion export -> save to Google Drive",
  ],
  "perplexity+slack": [
    "Slack question -> Perplexity search -> reply in thread",
  ],
  "gemini+crm": [
    "New contact -> Gemini analyzes company website",
    "Gemini generates personalized outreach",
  ],
  "supabase+anthropic": [
    "New database row -> Claude generates summary",
    "AI-powered search across Supabase tables",
  ],
  "sendgrid+crm": [
    "CRM tag added -> trigger SendGrid drip campaign",
    "SendGrid bounce -> update CRM contact status",
  ],
  "twilio+crm": [
    "Missed call -> create CRM follow-up task",
    "CRM appointment reminder -> send Twilio SMS",
  ],
  "stripe+supabase": [
    "Stripe webhook -> log event in Supabase",
    "New Supabase user -> create Stripe customer",
  ],
  "slack+anthropic": [
    "Slack message -> Claude summarizes thread",
    "Ask Claude in Slack -> AI response in thread",
  ],
  "github+slack": [
    "PR merged -> Slack celebration in #dev",
    "CI/CD failure -> alert #engineering channel",
  ],
  _base: [
    "Connect services to unlock smart workflow ideas",
    "Each connection adds triggers, actions, and AI combos",
    "Try Stripe + CRM for payment-to-contact automation",
  ],
};

/**
 * Returns workflow ideas relevant to the user's connected services.
 * Scans all combo keys and returns ideas where ALL services in the
 * combo are connected. Falls back to base ideas if fewer than 3 found.
 */
export function getIdeas(connectedServices: string[]): string[] {
  const results: string[] = [];

  for (const key of Object.keys(IDEAS)) {
    if (key === "_base") continue;
    const parts = key.split("+");
    if (parts.every((s) => connectedServices.includes(s))) {
      results.push(...IDEAS[key]);
    }
  }

  if (results.length < 3) {
    results.push(...IDEAS._base);
  }

  return results;
}
