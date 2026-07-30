/**
 * SLACK OAUTH REDIRECT — one constant, used by BOTH start and callback.
 *
 * THE BUG THIS FIXES: both routes derived the redirect URI from
 * NEXT_PUBLIC_SITE_URL, which is set to the APEX "https://0nmcp.com". Slack
 * matches redirect_uri as an EXACT STRING, the Slack app is registered against
 * the canonical www host, and so every install failed with:
 *
 *   redirect_uri did not match any configured URIs.
 *   Passed URI: https://0nmcp.com/api/connect/slack/callback
 *
 * The apex is not even servable — it 308s to www — so it could never have been
 * the right value here.
 *
 * It is deliberately NOT derived from NEXT_PUBLIC_SITE_URL any more. That
 * variable is a site-wide setting that anyone can change for an unrelated reason,
 * and an OAuth redirect must be a fixed, registered string. SLACK_REDIRECT_URI
 * can override it, but the default is correct on its own.
 *
 * WHATEVER VALUE THIS RESOLVES TO MUST BE LISTED VERBATIM in the Slack app at
 * api.slack.com -> OAuth & Permissions -> Redirect URLs.
 */
export const SLACK_REDIRECT_URI =
  process.env.SLACK_REDIRECT_URI || 'https://www.0nmcp.com/api/connect/slack/callback'
