// 0nBoard — Universal CRM Workflow Custom Code
// Handles BOTH enrollment AND persona posting.
// SETUP: Add property "apiKey" with your CRM Bearer token.
// Enable: HTTP Requests, Moment.js (buttons above)

var LOCATION_ID = 'nphConTwfHcVE1oA0uep';
var API_BASE = 'https://services.leadconnectorhq.com';
var API_VERSION = '2021-07-28';
var COMMUNITY_URL = 'https://0n.app.clientclub.net/communities/groups/the-0nboard/home';
var SITE_URL = 'https://0nmcp.com';
var ADMIN_EMAIL = 'mike@rocketopp.com';

var hdrs = {
  'Authorization': 'Bearer ' + (inputData.apikey || inputData.apiKey || ''),
  'Content-Type': 'application/json',
  'Version': API_VERSION
};

function sl(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ini(name) {
  return (name || 'AI').split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
}

function welcomeHtml(data) {
  return '<div style="background:#0a0a0f;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">'
    + '<div style="max-width:560px;margin:0 auto;padding:40px 24px;">'
    + '<div style="text-align:center;margin-bottom:32px;">'
    + '<span style="font-family:Courier New,monospace;font-size:36px;font-weight:900;color:#00ff88;">0n</span>'
    + '<span style="font-size:24px;font-weight:700;color:#e0e0e0;">MCP</span>'
    + '</div>'
    + '<div style="background:#1a1a25;border:1px solid #2a2a3a;border-radius:16px;padding:32px;">'
    + '<h1 style="font-size:22px;font-weight:800;color:#e8e8ef;margin:0 0 8px;text-align:center;">Welcome to the 0nBoard</h1>'
    + '<p style="font-size:14px;color:#8888a0;text-align:center;margin:0 0 24px;">You are now part of the 0nMCP community, ' + (data.firstName || 'friend') + '!</p>'
    + '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:24px;">'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">550</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Tools</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">26</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Services</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:20px;font-weight:900;color:#00ff88;display:block;">FREE</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Open Source</span></div>'
    + '</div>'
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<a href="' + COMMUNITY_URL + '" style="display:inline-block;padding:12px 32px;background:#00ff88;color:#0a0a0f;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Enter the 0nBoard</a>'
    + '</div>'
    + '<div style="border-top:1px solid #2a2a3a;padding-top:20px;">'
    + '<p style="font-size:13px;font-weight:700;color:#e8e8ef;margin:0 0 12px;">What you get:</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">- Access to the 0nBoard community hub</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">- AI-powered discussions and insights</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">- Direct access to the 0nMCP team</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0 0 8px;">- Early access to new tools and features</p>'
    + '<p style="font-size:13px;color:#8888a0;margin:0;">- Community-driven workflow templates</p>'
    + '</div>'
    + '</div>'
    + '<div style="text-align:center;margin-top:24px;">'
    + '<a href="' + SITE_URL + '/forum" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Forum</a>'
    + '<a href="' + SITE_URL + '/learn" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Learn</a>'
    + '<a href="' + SITE_URL + '/builder" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Builder</a>'
    + '<a href="' + SITE_URL + '/turn-it-on" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;margin:0 12px;">Turn it 0n</a>'
    + '</div>'
    + '<div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #1a1a25;">'
    + '<span style="font-size:11px;color:#33334a;">Powered by </span>'
    + '<a href="' + SITE_URL + '" style="font-size:11px;color:#55556a;text-decoration:none;font-weight:600;">0nMCP</a>'
    + '<span style="font-size:11px;color:#33334a;"> - 550 tools. 26 services. One command.</span>'
    + '<br><span style="font-size:10px;color:#33334a;margin-top:8px;display:inline-block;">RocketOpp LLC - Pittsburgh, PA</span>'
    + '</div>'
    + '</div></div>';
}

function postHtml(data) {
  var now = moment().format('MMM D, YYYY [at] h:mm A');
  return '<div style="background:#0a0a0f;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">'
    + '<div style="max-width:560px;margin:0 auto;padding:40px 24px;">'
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<span style="font-family:Courier New,monospace;font-size:28px;font-weight:900;color:#00ff88;">0n</span>'
    + '<span style="font-size:18px;font-weight:700;color:#e0e0e0;">MCP</span>'
    + '<span style="font-size:10px;color:#55556a;margin-left:8px;text-transform:uppercase;letter-spacing:0.1em;">Community Post</span>'
    + '</div>'
    + '<div style="background:#1a1a25;border:1px solid #2a2a3a;border-radius:12px;padding:24px;">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
    + '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00ff88,#00d4ff);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0a0a0f;font-size:14px;">'
    + ini(data.author)
    + '</div>'
    + '<div>'
    + '<div style="font-weight:700;font-size:14px;color:#e8e8ef;">' + (data.author || 'AI Persona') + '</div>'
    + '<div style="font-size:11px;color:#55556a;">0nBoard - ' + now + '</div>'
    + '</div>'
    + '</div>'
    + '<h3 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#e8e8ef;">' + (data.title || 'Community Post') + '</h3>'
    + '<div style="font-size:14px;line-height:1.7;color:#8888a0;">' + (data.content || '').replace(/\n/g, '<br>') + '</div>'
    + '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #2a2a3a;">'
    + '<a href="' + SITE_URL + '/forum/' + (data.forumUrl || '') + '" style="color:#00ff88;font-size:12px;text-decoration:none;font-weight:600;">View on 0nMCP Forum</a>'
    + '</div>'
    + '</div>'
    + '<div style="text-align:center;margin-top:24px;">'
    + '<span style="font-size:10px;color:#33334a;">0nMCP Community Engine - <a href="' + SITE_URL + '" style="color:#55556a;text-decoration:none;">0nmcp.com</a></span>'
    + '</div>'
    + '</div></div>';
}

var log = { action: '', contacts: [], posts: [], emails: [], errors: [] };
var d = inputData;

try {
  if (d.action === 'community_enroll') {
    log.action = 'enrollment';

    var contactRes = await axios.post(API_BASE + '/contacts/upsert', {
      locationId: LOCATION_ID,
      email: d.email,
      firstName: d.firstName || d.email.split('@')[0],
      lastName: d.lastName || '',
      source: d.source || '0nmcp.com',
      tags: ['0nmcp-signup', 'website-signup', 'community-member', 'the-0nboard']
    }, { headers: hdrs });

    var contact = contactRes.data.contact;
    log.contacts.push('Upserted: ' + d.email + ' (ID: ' + contact.id + ')');

    try {
      await axios.post(API_BASE + '/contacts/' + contact.id + '/tags', {
        tags: ['0nboard-member', 'community-enrolled', 'active-member']
      }, { headers: hdrs });
    } catch (e) { }

    try {
      await axios.post(API_BASE + '/contacts/' + contact.id + '/notes', {
        body: '[0nBoard Enrollment]\nMember enrolled via ' + (d.source || '0nmcp.com') + '\nDate: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\nEmail: ' + d.email
      }, { headers: hdrs });
    } catch (e) { log.errors.push('Note: ' + e.message); }

    try {
      await axios.post(API_BASE + '/conversations/messages', {
        type: 'Email',
        contactId: contact.id,
        subject: 'Welcome to the 0nBoard',
        html: welcomeHtml(d),
        emailFrom: '0nMCP Community <community@0nmcp.com>'
      }, { headers: hdrs });
      log.emails.push('Welcome email sent to ' + d.email);
    } catch (e) { log.errors.push('Email: ' + e.message); }

    try {
      await axios.post(API_BASE + '/conversations/messages', {
        type: 'Custom',
        contactId: contact.id,
        message: 'Welcome to the 0nBoard community! Jump in: ' + COMMUNITY_URL
      }, { headers: hdrs });
    } catch (e) { }

  } else if (d.type === 'community_post' || d.title) {
    log.action = 'persona_post';

    var personaEmail = 'persona-' + sl(d.author) + '@0nmcp.internal';
    var persona;

    try {
      var searchRes = await axios.post(API_BASE + '/contacts/search', {
        locationId: LOCATION_ID,
        filters: [{ field: 'email', operator: 'eq', value: personaEmail }],
        pageLimit: 1
      }, { headers: hdrs });
      persona = searchRes.data && searchRes.data.contacts && searchRes.data.contacts[0];
    } catch (e) { }

    if (!persona) {
      var nameParts = (d.author || 'AI Persona').split(' ');
      var createRes = await axios.post(API_BASE + '/contacts/upsert', {
        locationId: LOCATION_ID,
        email: personaEmail,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        source: '0nmcp.com/personas',
        tags: ['ai-persona', 'community-member', 'the-0nboard', 'content-creator', '0nmcp']
      }, { headers: hdrs });
      persona = createRes.data.contact;
      log.contacts.push('Created persona: ' + d.author + ' (' + persona.id + ')');
    } else {
      log.contacts.push('Found persona: ' + d.author + ' (' + persona.id + ')');
    }

    try {
      await axios.post(API_BASE + '/contacts/' + persona.id + '/tags', {
        tags: ['community-active', 'content-creator', 'group-' + (d.group || 'the-0nboard'), 'ai-persona']
      }, { headers: hdrs });
    } catch (e) { }

    try {
      await axios.post(API_BASE + '/contacts/' + persona.id + '/notes', {
        body: '[Community Post] ' + (d.title || 'Untitled') + '\n\n' + (d.content || '') + '\n\n---\nGroup: ' + (d.group || 'the-0nboard') + '\nForum: ' + SITE_URL + '/forum/' + (d.forumUrl || '') + '\nPosted: ' + moment().format('YYYY-MM-DD HH:mm:ss')
      }, { headers: hdrs });
      log.posts.push('Note: "' + d.title + '" by ' + d.author);
    } catch (e) { log.errors.push('Note: ' + e.message); }

    try {
      await axios.post(API_BASE + '/conversations/messages', {
        type: 'Custom',
        contactId: persona.id,
        message: 'New Community Post: ' + (d.title || '') + '\n\n' + (d.content || ''),
        html: postHtml(d)
      }, { headers: hdrs });
      log.posts.push('Conversation: "' + d.title + '"');
    } catch (e) { log.errors.push('Conversation: ' + e.message); }

    try {
      var adminSearch = await axios.post(API_BASE + '/contacts/search', {
        locationId: LOCATION_ID,
        filters: [{ field: 'email', operator: 'eq', value: ADMIN_EMAIL }],
        pageLimit: 1
      }, { headers: hdrs });
      var admin = adminSearch.data && adminSearch.data.contacts && adminSearch.data.contacts[0];
      if (admin) {
        await axios.post(API_BASE + '/contacts/' + admin.id + '/notes', {
          body: '[Persona Engine] New post by ' + d.author + ': "' + d.title + '" in ' + (d.group || 'the-0nboard')
        }, { headers: hdrs });
      }
    } catch (e) { }

  } else {
    log.action = 'unknown';
    log.errors.push('Unknown webhook payload');
  }
} catch (err) {
  log.errors.push('Fatal: ' + (err.message || 'unknown error'));
}

output = {
  success: log.errors.length === 0,
  action: log.action,
  contacts: log.contacts,
  posts: log.posts,
  emails: log.emails,
  errors: log.errors,
  processedAt: moment().toISOString()
};
