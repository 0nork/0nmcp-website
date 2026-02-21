// ============================================================
// 0nBoard — Universal CRM Workflow Custom Code
// ============================================================
// Handles BOTH enrollment AND persona posting in one block.
// Trigger: Inbound Webhook
//
// SETUP: Click "+ Add property" and add:
//   apiKey  →  your CRM API Bearer token for this location
//
// Webhook payloads this handles:
//   Enrollment: { email, firstName, lastName, action: "community_enroll" }
//   Post:       { title, content, author, type: "community_post" }
// ============================================================

const axios = require('axios');
const moment = require('moment');

const LOCATION_ID = 'nphConTwfHcVE1oA0uep';
const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const COMMUNITY_URL = 'https://0n.app.clientclub.net/communities/groups/the-0nboard/home';
const SITE_URL = 'https://0nmcp.com';
const ADMIN_EMAIL = 'mike@rocketopp.com';

function headers() {
  return {
    'Authorization': 'Bearer ' + (inputData.apiKey || ''),
    'Content-Type': 'application/json',
    'Version': API_VERSION,
  };
}

function slug(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function initials(name) {
  return (name || 'AI').split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
}

// ======================== EMAIL TEMPLATES ========================

function welcomeEmail(data) {
  return '<div style="background:#0a0a0f;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">'
    + '<div style="max-width:560px;margin:0 auto;padding:40px 24px;">'
    // Header
    + '<div style="text-align:center;margin-bottom:32px;">'
    + '<span style="font-family:Courier New,monospace;font-size:36px;font-weight:900;color:#00ff88;">0n</span>'
    + '<span style="font-size:24px;font-weight:700;color:#e0e0e0;">MCP</span>'
    + '</div>'
    // Card
    + '<div style="background:#1a1a25;border:1px solid #2a2a3a;border-radius:16px;padding:32px;">'
    + '<h1 style="font-size:22px;font-weight:800;color:#e8e8ef;margin:0 0 8px;text-align:center;">Welcome to the 0nBoard</h1>'
    + '<p style="font-size:14px;color:#8888a0;text-align:center;margin:0 0 24px;">You\'re now part of the 0nMCP community, ' + (data.firstName || 'friend') + '!</p>'
    // Stats row
    + '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:24px;">'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">550</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Tools</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">26</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Services</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">FREE</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Open Source</span></div>'
    + '</div>'
    // CTA
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<a href="' + COMMUNITY_URL + '" style="display:inline-block;padding:12px 32px;background:#00ff88;color:#0a0a0f;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Enter the 0nBoard</a>'
    + '</div>'
    // What you get
    + '<div style="border-top:1px solid #2a2a3a;padding-top:20px;">'
    + '<p style="font-size:13px;font-weight:700;color:#e8e8ef;margin:0 0 12px;">What you get:</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">&#x2713; Access to the 0nBoard community hub</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">&#x2713; AI-powered discussions and insights</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">&#x2713; Direct access to the 0nMCP team</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">&#x2713; Early access to new tools and features</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0;">&#x2713; Community-driven workflow templates</p>'
    + '</div>'
    + '</div>'
    // Links
    + '<div style="text-align:center;margin-top:24px;">'
    + '<a href="' + SITE_URL + '/forum" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Forum</a>'
    + '<a href="' + SITE_URL + '/learn" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Learn</a>'
    + '<a href="' + SITE_URL + '/builder" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Builder</a>'
    + '<a href="' + SITE_URL + '/turn-it-on" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Turn it 0n</a>'
    + '</div>'
    // Footer
    + '<div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #1a1a25;">'
    + '<span style="font-size:11px;color:#33334a;">Powered by </span>'
    + '<a href="' + SITE_URL + '" style="font-size:11px;color:#55556a;text-decoration:none;font-weight:600;">0nMCP</a>'
    + '<span style="font-size:11px;color:#33334a;"> &mdash; 550 tools. 26 services. One command.</span>'
    + '<br><span style="font-size:10px;color:#33334a;margin-top:8px;display:inline-block;">RocketOpp LLC &bull; Pittsburgh, PA &bull; <a href="mailto:mike@rocketopp.com" style="color:#55556a;text-decoration:none;">Contact</a></span>'
    + '</div>'
    + '</div></div>';
}

function postNotificationEmail(data) {
  return '<div style="background:#0a0a0f;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">'
    + '<div style="max-width:560px;margin:0 auto;padding:40px 24px;">'
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<span style="font-family:Courier New,monospace;font-size:28px;font-weight:900;color:#00ff88;">0n</span>'
    + '<span style="font-size:18px;font-weight:700;color:#e0e0e0;">MCP</span>'
    + '<span style="font-size:10px;color:#55556a;margin-left:8px;text-transform:uppercase;letter-spacing:0.1em;">Community Post</span>'
    + '</div>'
    + '<div style="background:#1a1a25;border:1px solid #2a2a3a;border-radius:12px;padding:24px;">'
    // Author row
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
    + '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00ff88,#00d4ff);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0a0a0f;font-size:14px;">'
    + initials(data.author)
    + '</div>'
    + '<div>'
    + '<div style="font-weight:700;font-size:14px;color:#e8e8ef;">' + (data.author || 'AI Persona') + '</div>'
    + '<div style="font-size:11px;color:#55556a;">0nBoard &bull; ' + moment().format('MMM D, YYYY [at] h:mm A') + '</div>'
    + '</div>'
    + '</div>'
    // Post content
    + '<h3 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#e8e8ef;">' + (data.title || 'Community Post') + '</h3>'
    + '<div style="font-size:14px;line-height:1.7;color:#8888a0;">' + (data.content || '').replace(/\n/g, '<br>') + '</div>'
    // Forum link
    + '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #2a2a3a;">'
    + '<a href="' + SITE_URL + '/forum/' + (data.forumUrl || '') + '" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;">View on 0nMCP Forum &#8594;</a>'
    + '<span style="float:right;">'
    + '<a href="' + COMMUNITY_URL + '" style="color:#8888a0;font-size:12px;text-decoration:none;font-weight:600;">Open 0nBoard &#8594;</a>'
    + '</span>'
    + '</div>'
    + '</div>'
    // Footer
    + '<div style="text-align:center;margin-top:24px;">'
    + '<span style="font-size:10px;color:#33334a;">0nMCP Community Engine &bull; <a href="' + SITE_URL + '" style="color:#55556a;text-decoration:none;">0nmcp.com</a></span>'
    + '</div>'
    + '</div></div>';
}

// ======================== MAIN LOGIC ========================

async function run() {
  var log = { action: '', contacts: [], posts: [], emails: [], errors: [] };
  var d = inputData;

  try {
    // =====================================================
    // ROUTE 1: Community Enrollment (new signup)
    // =====================================================
    if (d.action === 'community_enroll') {
      log.action = 'enrollment';

      // Step 1: Create or update the contact
      var contactRes = await axios.post(API_BASE + '/contacts/upsert', {
        locationId: LOCATION_ID,
        email: d.email,
        firstName: d.firstName || d.email.split('@')[0],
        lastName: d.lastName || '',
        source: d.source || '0nmcp.com',
        tags: ['0nmcp-signup', 'website-signup', 'community-member', 'the-0nboard'],
      }, { headers: headers() });

      var contact = contactRes.data.contact;
      log.contacts.push('Upserted: ' + d.email + ' (ID: ' + contact.id + ')');

      // Step 2: Add community-specific tags
      try {
        await axios.post(API_BASE + '/contacts/' + contact.id + '/tags', {
          tags: ['0nboard-member', 'community-enrolled', 'active-member'],
        }, { headers: headers() });
      } catch (e) { /* tags may exist */ }

      // Step 3: Add enrollment note
      try {
        await axios.post(API_BASE + '/contacts/' + contact.id + '/notes', {
          body: '[0nBoard Enrollment]\n'
            + 'Member enrolled via ' + (d.source || '0nmcp.com') + '\n'
            + 'Date: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n'
            + 'Email: ' + d.email + '\n'
            + 'Tags: 0nmcp-signup, community-member, the-0nboard',
        }, { headers: headers() });
      } catch (e) { log.errors.push('Note: ' + e.message); }

      // Step 4: Send branded welcome email
      try {
        await axios.post(API_BASE + '/conversations/messages', {
          type: 'Email',
          contactId: contact.id,
          subject: 'Welcome to the 0nBoard — You\'re In!',
          html: welcomeEmail(d),
          emailFrom: '0nMCP Community <community@0nmcp.com>',
        }, { headers: headers() });
        log.emails.push('Welcome email sent to ' + d.email);
      } catch (e) {
        log.errors.push('Email: ' + e.message);
        // Fallback: try email action
        try {
          await axios.post(API_BASE + '/contacts/' + contact.id + '/campaigns/emails', {
            subject: 'Welcome to the 0nBoard — You\'re In!',
            html: welcomeEmail(d),
            from: 'community@0nmcp.com',
            fromName: '0nMCP Community',
          }, { headers: headers() });
          log.emails.push('Welcome email sent via campaign to ' + d.email);
        } catch (e2) { log.errors.push('Campaign email: ' + e2.message); }
      }

      // Step 5: Create a welcome conversation thread
      try {
        await axios.post(API_BASE + '/conversations/messages', {
          type: 'Custom',
          contactId: contact.id,
          message: 'Welcome to the 0nBoard community! You now have access to our community hub, forums, and AI-powered discussions. Jump in: ' + COMMUNITY_URL,
        }, { headers: headers() });
      } catch (e) { /* optional */ }
    }

    // =====================================================
    // ROUTE 2: AI Persona Community Post
    // =====================================================
    else if (d.type === 'community_post' || d.title) {
      log.action = 'persona_post';

      // Step 1: Create or find the persona contact
      var personaEmail = 'persona-' + slug(d.author) + '@0nmcp.internal';
      var persona;

      try {
        var searchRes = await axios.post(API_BASE + '/contacts/search', {
          locationId: LOCATION_ID,
          filters: [{ field: 'email', operator: 'eq', value: personaEmail }],
          pageLimit: 1,
        }, { headers: headers() });
        persona = searchRes.data && searchRes.data.contacts && searchRes.data.contacts[0];
      } catch (e) { /* search failed, will upsert */ }

      if (!persona) {
        var nameParts = (d.author || 'AI Persona').split(' ');
        var createRes = await axios.post(API_BASE + '/contacts/upsert', {
          locationId: LOCATION_ID,
          email: personaEmail,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || '',
          source: '0nmcp.com/personas',
          tags: ['ai-persona', 'community-member', 'the-0nboard', 'content-creator', '0nmcp'],
        }, { headers: headers() });
        persona = createRes.data.contact;
        log.contacts.push('Created persona: ' + d.author + ' (' + persona.id + ')');
      } else {
        log.contacts.push('Found persona: ' + d.author + ' (' + persona.id + ')');
      }

      // Step 2: Add/update persona tags
      try {
        await axios.post(API_BASE + '/contacts/' + persona.id + '/tags', {
          tags: ['community-active', 'content-creator', 'group-' + (d.group || 'the-0nboard'), 'ai-persona'],
        }, { headers: headers() });
      } catch (e) { /* tags may exist */ }

      // Step 3: Update last active timestamp
      try {
        await axios.put(API_BASE + '/contacts/' + persona.id, {
          customFields: [{ key: 'last_community_post', value: moment().toISOString() }],
        }, { headers: headers() });
      } catch (e) { /* custom field may not exist yet */ }

      // Step 4: Add post as a contact note (full record)
      try {
        await axios.post(API_BASE + '/contacts/' + persona.id + '/notes', {
          body: '[Community Post] ' + (d.title || 'Untitled') + '\n\n'
            + (d.content || '') + '\n\n'
            + '---\n'
            + 'Group: ' + (d.group || 'the-0nboard') + '\n'
            + 'Forum: ' + SITE_URL + '/forum/' + (d.forumUrl || '') + '\n'
            + 'Posted: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n'
            + 'Source: AI Persona Engine',
        }, { headers: headers() });
        log.posts.push('Note: "' + d.title + '" by ' + d.author);
      } catch (e) { log.errors.push('Note: ' + e.message); }

      // Step 5: Create a conversation with branded HTML
      try {
        await axios.post(API_BASE + '/conversations/messages', {
          type: 'Custom',
          contactId: persona.id,
          message: 'New Community Post: ' + (d.title || '') + '\n\n' + (d.content || ''),
          html: postNotificationEmail(d),
        }, { headers: headers() });
        log.posts.push('Conversation: "' + d.title + '"');
      } catch (e) { log.errors.push('Conversation: ' + e.message); }

      // Step 6: Notify admin of new post
      try {
        // Find admin contact
        var adminSearch = await axios.post(API_BASE + '/contacts/search', {
          locationId: LOCATION_ID,
          filters: [{ field: 'email', operator: 'eq', value: ADMIN_EMAIL }],
          pageLimit: 1,
        }, { headers: headers() });

        var admin = adminSearch.data && adminSearch.data.contacts && adminSearch.data.contacts[0];
        if (admin) {
          await axios.post(API_BASE + '/contacts/' + admin.id + '/notes', {
            body: '[Persona Engine] New post by ' + d.author + ': "' + d.title + '" in ' + (d.group || 'the-0nboard'),
          }, { headers: headers() });
        }
      } catch (e) { /* admin notification is optional */ }
    }

    // =====================================================
    // ROUTE 3: Unknown action — log it
    // =====================================================
    else {
      log.action = 'unknown';
      log.errors.push('Unknown webhook payload — no action or type detected');
    }

  } catch (err) {
    log.errors.push('Fatal: ' + (err.message || 'unknown error'));
  }

  return log;
}

var result = await run();

output = {
  success: result.errors.length === 0,
  action: result.action,
  contacts: result.contacts,
  posts: result.posts,
  emails: result.emails,
  errors: result.errors,
  processedAt: moment().toISOString(),
};
