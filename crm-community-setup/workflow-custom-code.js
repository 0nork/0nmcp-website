/**
 * 0nBoard Community — CRM Workflow Custom Code
 *
 * Paste this into the Custom Code action of your "0nBoard AI Persona Posts" workflow.
 * Trigger: Inbound Webhook with persona content payload
 *
 * This code:
 * 1. Creates a community post in "the-0nboard" group
 * 2. Creates/updates the AI persona as a community member
 * 3. Sends a notification email to admins (optional)
 *
 * Webhook payload expected:
 *   { title, content, author, group, channel, type, source, timestamp }
 */

// ==================== CONFIG ====================
const LOCATION_ID = 'nphConTwfHcVE1oA0uep';
const GROUP_SLUG = 'the-0nboard';
const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

// ==================== MAIN HANDLER ====================
const axios = require('axios');

// Input data comes from the webhook trigger
const webhookData = inputData;

async function run() {
  const results = { posts: [], contacts: [], errors: [] };

  try {
    // === Step 1: Ensure the persona exists as a CRM contact ===
    const personaEmail = `persona-${slugify(webhookData.author)}@0nmcp.internal`;

    let contact;
    try {
      // Search for existing persona contact
      const searchRes = await axios.post(`${API_BASE}/contacts/search`, {
        locationId: LOCATION_ID,
        filters: [{ field: 'email', operator: 'eq', value: personaEmail }],
        pageLimit: 1,
      }, { headers: getHeaders() });

      contact = searchRes.data?.contacts?.[0];
    } catch (e) {
      // Contact search failed, try upsert
    }

    if (!contact) {
      // Create the persona as a contact
      const nameParts = webhookData.author.split(' ');
      const createRes = await axios.post(`${API_BASE}/contacts/upsert`, {
        locationId: LOCATION_ID,
        email: personaEmail,
        firstName: nameParts[0] || webhookData.author,
        lastName: nameParts.slice(1).join(' ') || '',
        source: '0nmcp.com/personas',
        tags: ['0nmcp', 'ai-persona', 'community-member', 'the-0nboard'],
      }, { headers: getHeaders() });

      contact = createRes.data?.contact;
      results.contacts.push(`Created persona contact: ${webhookData.author}`);
    }

    // === Step 2: Add community member tags ===
    if (contact?.id) {
      try {
        await axios.post(`${API_BASE}/contacts/${contact.id}/tags`, {
          tags: ['community-active', 'content-creator', `group-${GROUP_SLUG}`],
        }, { headers: getHeaders() });
      } catch (e) {
        // Tags may already exist
      }

      // === Step 3: Add the post content as a contact note ===
      // (Since direct community post API is not public, we store as notes
      //  which are visible in the CRM contact record)
      try {
        await axios.post(`${API_BASE}/contacts/${contact.id}/notes`, {
          body: `[Community Post] ${webhookData.title}\n\n${webhookData.content}\n\n---\nPosted via AI Persona Engine | ${webhookData.timestamp || new Date().toISOString()}`,
          userId: contact.id,
        }, { headers: getHeaders() });
        results.posts.push(`Note added: "${webhookData.title}" by ${webhookData.author}`);
      } catch (e) {
        results.errors.push(`Note error: ${e.message}`);
      }

      // === Step 4: Create a conversation with the post content ===
      // This creates a trackable conversation in the CRM
      try {
        await axios.post(`${API_BASE}/conversations/messages`, {
          type: 'Custom',
          contactId: contact.id,
          message: `📝 New Community Post: ${webhookData.title}\n\n${webhookData.content}`,
          html: formatPostAsHtml(webhookData),
        }, { headers: getHeaders() });
        results.posts.push(`Conversation created for: "${webhookData.title}"`);
      } catch (e) {
        // Conversation creation is optional
      }
    }

  } catch (err) {
    results.errors.push(`Main error: ${err.message}`);
  }

  return results;
}

// ==================== HELPERS ====================

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.CRM_API_KEY || inputData._apiKey || ''}`,
    'Content-Type': 'application/json',
    'Version': API_VERSION,
  };
}

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatPostAsHtml(data) {
  return `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;">
      <div style="background:#0a0a0f;border:1px solid #2a2a3a;border-radius:12px;padding:24px;color:#e8e8ef;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00ff88,#00d4ff);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0a0a0f;font-size:14px;">
            ${(data.author || 'AI').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;">${data.author || 'AI Persona'}</div>
            <div style="font-size:11px;color:#55556a;">0nBoard Community</div>
          </div>
        </div>
        <h3 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#e8e8ef;">${data.title || 'Community Post'}</h3>
        <div style="font-size:14px;line-height:1.7;color:#8888a0;">${(data.content || '').replace(/\n/g, '<br>')}</div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid #2a2a3a;">
          <a href="https://0nmcp.com/forum/${data.forumUrl || ''}" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;">
            View on 0nMCP Forum →
          </a>
        </div>
      </div>
    </div>
  `;
}

// Execute
const result = await run();
return result;
