// 0nBoard — New Signup Enrollment Workflow
// Trigger: Inbound Webhook from 0nmcp.com signups
// Enable: HTTP Requests, Moment.js (buttons above)
// Add property: apikey → pit-2a95a657-c926-42d2-92f0-df232aa5d0a3

var LOCATION_ID = 'nphConTwfHcVE1oA0uep';
var API_BASE = 'https://services.leadconnectorhq.com';
var API_VERSION = '2021-07-28';
var COMMUNITY_URL = 'https://0n.app.clientclub.net/communities/groups/the-0nboard/home';
var SITE_URL = 'https://0nmcp.com';

var hdrs = {
  'Authorization': 'Bearer ' + (inputData.apikey || inputData.apiKey || ''),
  'Content-Type': 'application/json',
  'Version': API_VERSION
};

var d = inputData;
var log = { contact: null, tags: [], notes: [], emails: [], errors: [] };

// ======================== STEP 1: Create / Upsert Contact ========================

try {
  var upsertRes = await axios.post(API_BASE + '/contacts/upsert', {
    locationId: LOCATION_ID,
    email: d.email,
    firstName: d.firstName || (d.email ? d.email.split('@')[0] : 'Member'),
    lastName: d.lastName || '',
    source: d.source || '0nmcp.com',
    tags: ['0nmcp-signup', 'website-signup', 'community-member', 'the-0nboard']
  }, { headers: hdrs });

  log.contact = {
    id: upsertRes.data.contact.id,
    email: d.email,
    isNew: upsertRes.data.new || false
  };
} catch (e) {
  log.errors.push('Upsert failed: ' + e.message);
}

var contactId = log.contact ? log.contact.id : null;

if (contactId) {

  // ======================== STEP 2: Add All Tags ========================

  try {
    var tagRes = await axios.post(API_BASE + '/contacts/' + contactId + '/tags', {
      tags: [
        '0nboard-member',
        'community-enrolled',
        'active-member',
        '0nmcp-user',
        'forum-access',
        'enrolled-' + moment().format('YYYY-MM')
      ]
    }, { headers: hdrs });
    log.tags = tagRes.data.tagsAdded || [];
  } catch (e) { log.errors.push('Tags: ' + e.message); }

  // ======================== STEP 3: Enrollment Note ========================

  try {
    await axios.post(API_BASE + '/contacts/' + contactId + '/notes', {
      body: '[0nBoard Enrollment]\n\n'
        + 'New member enrolled from ' + (d.source || '0nmcp.com') + '\n'
        + 'Date: ' + moment().format('YYYY-MM-DD hh:mm A') + '\n'
        + 'Email: ' + d.email + '\n'
        + 'Name: ' + (d.firstName || '') + ' ' + (d.lastName || '') + '\n\n'
        + 'Access granted:\n'
        + '- 0nBoard Community\n'
        + '- Forum (0nmcp.com/forum)\n'
        + '- Builder (0nmcp.com/builder)\n'
        + '- Turn it 0n (0nmcp.com/turn-it-on)\n\n'
        + 'Signup tags: 0nmcp-signup, community-member, the-0nboard'
    }, { headers: hdrs });
    log.notes.push('Enrollment note added');
  } catch (e) { log.errors.push('Note: ' + e.message); }

  // ======================== STEP 4: Welcome Email ========================

  var emailHtml = '<div style="background:#0a0a0f;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">'
    + '<div style="max-width:560px;margin:0 auto;padding:40px 24px;">'
    // Logo
    + '<div style="text-align:center;margin-bottom:32px;">'
    + '<span style="font-family:Courier New,monospace;font-size:36px;font-weight:900;color:#00ff88;">0n</span>'
    + '<span style="font-size:24px;font-weight:700;color:#e0e0e0;">MCP</span>'
    + '</div>'
    // Main card
    + '<div style="background:#1a1a25;border:1px solid #2a2a3a;border-radius:16px;padding:32px;">'
    + '<h1 style="font-size:24px;font-weight:800;color:#e8e8ef;margin:0 0 8px;text-align:center;">Welcome to the 0nBoard</h1>'
    + '<p style="font-size:14px;color:#8888a0;text-align:center;margin:0 0 28px;">You are officially in, ' + (d.firstName || 'friend') + '. Here is everything you need to get started.</p>'
    // Stats
    + '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:28px;">'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:22px;font-weight:900;color:#00ff88;display:block;">550</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Tools</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:22px;font-weight:900;color:#00ff88;display:block;">26</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Services</span></div>'
    + '<div style="text-align:center;"><span style="font-family:Courier New,monospace;font-size:22px;font-weight:900;color:#00ff88;display:block;">FREE</span><span style="font-size:10px;color:#55556a;text-transform:uppercase;letter-spacing:0.08em;">Open Source</span></div>'
    + '</div>'
    // Primary CTA
    + '<div style="text-align:center;margin-bottom:28px;">'
    + '<a href="' + COMMUNITY_URL + '" style="display:inline-block;padding:14px 36px;background:#00ff88;color:#0a0a0f;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Enter the 0nBoard</a>'
    + '</div>'
    // Quick start steps
    + '<div style="border-top:1px solid #2a2a3a;padding-top:20px;">'
    + '<p style="font-size:14px;font-weight:700;color:#e8e8ef;margin:0 0 16px;">Quick Start:</p>'
    // Step 1
    + '<div style="display:flex;gap:12px;margin-bottom:16px;">'
    + '<div style="width:28px;height:28px;border-radius:50%;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-family:Courier New,monospace;font-size:12px;font-weight:900;color:#00ff88;flex-shrink:0;">1</div>'
    + '<div><p style="font-size:13px;font-weight:600;color:#e8e8ef;margin:0 0 2px;">Join the 0nBoard</p><p style="font-size:12px;color:#8888a0;margin:0;">Introduce yourself, browse discussions, ask questions</p></div>'
    + '</div>'
    // Step 2
    + '<div style="display:flex;gap:12px;margin-bottom:16px;">'
    + '<div style="width:28px;height:28px;border-radius:50%;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-family:Courier New,monospace;font-size:12px;font-weight:900;color:#00ff88;flex-shrink:0;">2</div>'
    + '<div><p style="font-size:13px;font-weight:600;color:#e8e8ef;margin:0 0 2px;">Install 0nMCP</p><p style="font-size:12px;color:#8888a0;margin:0;">Run: npx -y 0nmcp — connects 26 services instantly</p></div>'
    + '</div>'
    // Step 3
    + '<div style="display:flex;gap:12px;margin-bottom:16px;">'
    + '<div style="width:28px;height:28px;border-radius:50%;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-family:Courier New,monospace;font-size:12px;font-weight:900;color:#00ff88;flex-shrink:0;">3</div>'
    + '<div><p style="font-size:13px;font-weight:600;color:#e8e8ef;margin:0 0 2px;">Turn it 0n</p><p style="font-size:12px;color:#8888a0;margin:0;">Import your API keys and start orchestrating</p></div>'
    + '</div>'
    // Step 4
    + '<div style="display:flex;gap:12px;">'
    + '<div style="width:28px;height:28px;border-radius:50%;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-family:Courier New,monospace;font-size:12px;font-weight:900;color:#00ff88;flex-shrink:0;">4</div>'
    + '<div><p style="font-size:13px;font-weight:600;color:#e8e8ef;margin:0 0 2px;">Build Something</p><p style="font-size:12px;color:#8888a0;margin:0;">Use the visual builder or just describe what you want</p></div>'
    + '</div>'
    + '</div>'
    + '</div>'
    // Secondary links
    + '<div style="display:flex;justify-content:center;gap:8px;margin-top:24px;flex-wrap:wrap;">'
    + '<a href="' + SITE_URL + '/forum" style="display:inline-block;padding:8px 16px;background:#1a1a25;border:1px solid #2a2a3a;border-radius:8px;color:#8888a0;font-size:12px;text-decoration:none;font-weight:600;">Forum</a>'
    + '<a href="' + SITE_URL + '/learn" style="display:inline-block;padding:8px 16px;background:#1a1a25;border:1px solid #2a2a3a;border-radius:8px;color:#8888a0;font-size:12px;text-decoration:none;font-weight:600;">Learn</a>'
    + '<a href="' + SITE_URL + '/builder" style="display:inline-block;padding:8px 16px;background:#1a1a25;border:1px solid #2a2a3a;border-radius:8px;color:#8888a0;font-size:12px;text-decoration:none;font-weight:600;">Builder</a>'
    + '<a href="' + SITE_URL + '/turn-it-on" style="display:inline-block;padding:8px 16px;background:#1a1a25;border:1px solid #2a2a3a;border-radius:8px;color:#8888a0;font-size:12px;text-decoration:none;font-weight:600;">Turn it 0n</a>'
    + '</div>'
    // Footer
    + '<div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #1a1a25;">'
    + '<span style="font-size:11px;color:#33334a;">Powered by </span>'
    + '<a href="' + SITE_URL + '" style="font-size:11px;color:#55556a;text-decoration:none;font-weight:600;">0nMCP</a>'
    + '<span style="font-size:11px;color:#33334a;"> - 550 tools. 26 services. One command.</span>'
    + '<br><span style="font-size:10px;color:#33334a;margin-top:8px;display:inline-block;">RocketOpp LLC - Pittsburgh, PA - <a href="mailto:mike@rocketopp.com" style="color:#55556a;text-decoration:none;">Contact</a></span>'
    + '</div>'
    + '</div></div>';

  try {
    await axios.post(API_BASE + '/conversations/messages', {
      type: 'Email',
      contactId: contactId,
      subject: 'Welcome to the 0nBoard - You are in!',
      html: emailHtml,
      emailFrom: '0nMCP Community <community@0nmcp.com>'
    }, { headers: hdrs });
    log.emails.push('Welcome email sent to ' + d.email);
  } catch (e) {
    log.errors.push('Email: ' + e.message);
  }

  // ======================== STEP 5: Welcome Conversation ========================

  try {
    await axios.post(API_BASE + '/conversations/messages', {
      type: 'Custom',
      contactId: contactId,
      message: 'Welcome to 0nMCP, ' + (d.firstName || 'friend') + '! You now have access to:\n\n'
        + '- The 0nBoard community: ' + COMMUNITY_URL + '\n'
        + '- Forum discussions: ' + SITE_URL + '/forum\n'
        + '- Visual workflow builder: ' + SITE_URL + '/builder\n'
        + '- 550 tools across 26 services: ' + SITE_URL + '/turn-it-on\n\n'
        + 'Get started: npx -y 0nmcp'
    }, { headers: hdrs });
    log.notes.push('Welcome conversation created');
  } catch (e) { log.errors.push('Conversation: ' + e.message); }

  // ======================== STEP 6: Add to Pipeline ========================

  try {
    // Get pipelines to find the right one
    var pipeRes = await axios.get(API_BASE + '/opportunities/pipelines?locationId=' + LOCATION_ID, { headers: hdrs });
    var pipelines = pipeRes.data.pipelines || [];

    if (pipelines.length > 0) {
      var pipeline = pipelines[0];
      var firstStage = pipeline.stages && pipeline.stages[0];

      if (firstStage) {
        await axios.post(API_BASE + '/opportunities/', {
          locationId: LOCATION_ID,
          contactId: contactId,
          pipelineId: pipeline.id,
          pipelineStageId: firstStage.id,
          name: (d.firstName || 'New') + ' ' + (d.lastName || 'Member') + ' - 0nBoard Signup',
          status: 'open',
          source: '0nmcp.com',
          tags: ['0nmcp-signup', '0nboard-member']
        }, { headers: hdrs });
        log.notes.push('Added to pipeline: ' + pipeline.name + ' > ' + firstStage.name);
      }
    }
  } catch (e) { log.errors.push('Pipeline: ' + e.message); }

  // ======================== STEP 7: Notify Admin ========================

  try {
    var adminSearch = await axios.post(API_BASE + '/contacts/search', {
      locationId: LOCATION_ID,
      filters: [{ field: 'email', operator: 'eq', value: 'mike@rocketopp.com' }],
      pageLimit: 1
    }, { headers: hdrs });

    var admin = adminSearch.data && adminSearch.data.contacts && adminSearch.data.contacts[0];
    if (admin) {
      await axios.post(API_BASE + '/contacts/' + admin.id + '/notes', {
        body: '[New 0nBoard Member]\n'
          + (d.firstName || '') + ' ' + (d.lastName || '') + ' (' + d.email + ')\n'
          + 'Signed up: ' + moment().format('MMM D, YYYY h:mm A') + '\n'
          + 'Source: ' + (d.source || '0nmcp.com')
      }, { headers: hdrs });
      log.notes.push('Admin notified');
    }
  } catch (e) { }
}

output = {
  success: log.errors.length === 0,
  action: 'enrollment',
  contactId: contactId,
  isNew: log.contact ? log.contact.isNew : false,
  tags: log.tags,
  notes: log.notes,
  emails: log.emails,
  errors: log.errors,
  processedAt: moment().toISOString()
};
