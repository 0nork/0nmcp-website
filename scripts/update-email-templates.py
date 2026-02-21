#!/usr/bin/env python3
"""
Update all Supabase auth email templates for 0nMCP branding.
Uses the Supabase Management API with curl for better Cloudflare compatibility.
"""
import json
import subprocess
import base64
import sys
import os

token = base64.b64decode("c2JwXzgyOTZlMmJmZGI1ZTMyZTZiYWMyZTZhNjkyNjkxNDRjNDcyZWRjYTk=").decode()
project_ref = "pwujhhmlrtxjmjzyttwn"


def make_template(preheader, heading, body_html, cta_text, cta_url):
    return f'''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>{heading}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#06060a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<span style="display:none;font-size:1px;color:#06060a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{preheader}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#06060a;">
<tr>
<td align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td><![endif]-->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#0c0c14;border:1px solid #1a1a2e;border-radius:16px;">
<tr>
<td align="center" style="padding:40px 40px 24px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:2px;">
<span style="color:#00ff88;">0n</span><span style="color:#ffffff;">MCP</span>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="border-top:1px solid #1a1a2e;font-size:1px;line-height:1px;">&nbsp;</td></tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding:32px 40px 16px 40px;">
<h1 style="margin:0;font-size:24px;font-weight:700;color:#e8e8e8;line-height:1.3;">{heading}</h1>
</td>
</tr>
<tr>
<td style="padding:0 40px;">
{body_html}
</td>
</tr>
<tr>
<td align="center" style="padding:32px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="background-color:#00ff88;border-radius:10px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{cta_url}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="21%" fillcolor="#00ff88" stroke="f"><w:anchorlock/><center style="color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:16px;font-weight:700;">{cta_text}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a href="{cta_url}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#00ff88;color:#0a0a0f;font-size:16px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1.2;">{cta_text}</a><!--<![endif]-->
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.1);border-radius:8px;">
<tr>
<td style="padding:16px;font-size:13px;color:#999;line-height:1.5;">
If you did not request this email, you can safely ignore it. This link will expire in 1 hour.
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:24px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="border-top:1px solid #1a1a2e;font-size:1px;line-height:1px;">&nbsp;</td></tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding:24px 40px 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="padding:0 12px;"><a href="https://0nmcp.com" target="_blank" style="color:#00ff88;font-size:13px;text-decoration:none;">Website</a></td>
<td style="color:#333;font-size:13px;">|</td>
<td style="padding:0 12px;"><a href="https://0nmcp.com/forum" target="_blank" style="color:#00ff88;font-size:13px;text-decoration:none;">Forum</a></td>
<td style="color:#333;font-size:13px;">|</td>
<td style="padding:0 12px;"><a href="https://github.com/0nork/0nmcp" target="_blank" style="color:#00ff88;font-size:13px;text-decoration:none;">GitHub</a></td>
<td style="color:#333;font-size:13px;">|</td>
<td style="padding:0 12px;"><a href="https://www.npmjs.com/package/0nmcp" target="_blank" style="color:#00ff88;font-size:13px;text-decoration:none;">npm</a></td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding:8px 40px 32px 40px;">
<p style="margin:0 0 8px 0;font-size:12px;color:#555;line-height:1.5;">
RocketOpp LLC &#8212; 651 N Broad St Suite 201, Middletown DE 19709
</p>
<p style="margin:0;font-size:11px;color:#444;line-height:1.5;">
You received this email because of activity on your <a href="https://0nmcp.com" style="color:#00ff88;text-decoration:none;">0nMCP</a> account.<br/>
<a href="https://0nmcp.com/settings" style="color:#555;text-decoration:underline;">Manage email preferences</a>
</p>
</td>
</tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td>
</tr>
</table>
</body>
</html>'''


# --- Build all 5 templates ---

confirmation = make_template(
    preheader="Welcome to 0nMCP - confirm your email to get started with 545+ AI tools",
    heading="Confirm your email",
    body_html='''<p style="margin:0 0 20px 0;font-size:16px;color:#999;line-height:1.6;">
Welcome to <strong style="color:#e8e8e8;">0nMCP</strong> &#8212; the universal AI orchestration platform. Confirm your email to unlock your account.</p>
<p style="margin:0 0 16px 0;font-size:14px;color:#999;line-height:1.6;">Here is what you get access to:</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
<tr><td style="padding:6px 0;font-size:14px;color:#999;line-height:1.5;"><span style="color:#00ff88;">&#10003;</span> 545+ tools across 26 services</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#999;line-height:1.5;"><span style="color:#00ff88;">&#10003;</span> Free courses and tutorials</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#999;line-height:1.5;"><span style="color:#00ff88;">&#10003;</span> Community forum and support</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#999;line-height:1.5;"><span style="color:#00ff88;">&#10003;</span> Visual workflow builder</td></tr>
</table>''',
    cta_text="Confirm Email",
    cta_url="{{ .ConfirmationURL }}"
)

invite = make_template(
    preheader="You have been invited to join 0nMCP - the universal AI orchestration platform",
    heading="You have been invited",
    body_html='''<p style="margin:0 0 20px 0;font-size:16px;color:#999;line-height:1.6;">
You have been invited to create an account on <strong style="color:#e8e8e8;">0nMCP</strong> &#8212; the universal AI orchestration platform with 545+ tools across 26 services.</p>
<p style="margin:0 0 8px 0;font-size:14px;color:#999;line-height:1.6;">
Click the button below to accept the invitation and set up your account.</p>''',
    cta_text="Accept Invitation",
    cta_url="{{ .ConfirmationURL }}"
)

magic_link = make_template(
    preheader="Your secure sign-in link for 0nMCP is ready",
    heading="Sign in to 0nMCP",
    body_html='''<p style="margin:0 0 20px 0;font-size:16px;color:#999;line-height:1.6;">
Click the button below to securely sign in to your <strong style="color:#e8e8e8;">0nMCP</strong> account. No password needed.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:rgba(255,200,0,0.05);border:1px solid rgba(255,200,0,0.15);border-radius:8px;margin-bottom:8px;">
<tr>
<td style="padding:12px 16px;font-size:13px;color:#cca300;line-height:1.5;">
&#9201; This link expires in <strong>1 hour</strong> and can only be used once.
</td>
</tr>
</table>''',
    cta_text="Sign In",
    cta_url="{{ .ConfirmationURL }}"
)

recovery = make_template(
    preheader="Reset your 0nMCP password - this link expires in 1 hour",
    heading="Reset your password",
    body_html='''<p style="margin:0 0 20px 0;font-size:16px;color:#999;line-height:1.6;">
We received a request to reset the password for your <strong style="color:#e8e8e8;">0nMCP</strong> account. Click the button below to choose a new password.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:rgba(255,200,0,0.05);border:1px solid rgba(255,200,0,0.15);border-radius:8px;margin-bottom:8px;">
<tr>
<td style="padding:12px 16px;font-size:13px;color:#cca300;line-height:1.5;">
&#9201; This link expires in <strong>1 hour</strong> and can only be used once.
</td>
</tr>
</table>''',
    cta_text="Reset Password",
    cta_url="{{ .ConfirmationURL }}"
)

email_change = make_template(
    preheader="Confirm your new email address for your 0nMCP account",
    heading="Confirm email change",
    body_html='''<p style="margin:0 0 20px 0;font-size:16px;color:#999;line-height:1.6;">
You requested to change the email address on your <strong style="color:#e8e8e8;">0nMCP</strong> account. Click the button below to confirm this change.</p>
<p style="margin:0 0 8px 0;font-size:14px;color:#999;line-height:1.6;">
If you did not request this change, please secure your account immediately by resetting your password.</p>''',
    cta_text="Confirm New Email",
    cta_url="{{ .ConfirmationURL }}"
)

payload = {
    "mailer_subjects_confirmation": "Confirm Your 0nMCP Account",
    "mailer_subjects_invite": "You're Invited to 0nMCP",
    "mailer_subjects_magic_link": "Your 0nMCP Login Link",
    "mailer_subjects_recovery": "Reset Your 0nMCP Password",
    "mailer_subjects_email_change": "Confirm Your New Email",
    "mailer_templates_confirmation_content": confirmation,
    "mailer_templates_invite_content": invite,
    "mailer_templates_magic_link_content": magic_link,
    "mailer_templates_recovery_content": recovery,
    "mailer_templates_email_change_content": email_change,
}

# Write payload to temp file for curl
tmp_file = "/tmp/supabase-email-payload.json"
with open(tmp_file, "w") as f:
    json.dump(payload, f)

print(f"Payload size: {os.path.getsize(tmp_file)} bytes")
print(f"Confirmation template size: {len(confirmation)} chars")

# Use curl to send the request (better Cloudflare compatibility)
result = subprocess.run([
    "curl", "-s", "-w", "\n%{http_code}",
    "-X", "PATCH",
    "-H", f"Authorization: Bearer {token}",
    "-H", "Content-Type: application/json",
    "-H", "User-Agent: supabase-cli/2.67.1",
    "-d", f"@{tmp_file}",
    f"https://api.supabase.com/v1/projects/{project_ref}/config/auth"
], capture_output=True, text=True)

output = result.stdout.strip()
lines = output.split("\n")
status_code = lines[-1] if lines else "unknown"
body = "\n".join(lines[:-1])

print(f"HTTP Status: {status_code}")

if status_code == "200":
    try:
        resp = json.loads(body)
        print("\nSUCCESS! All email templates updated.")
        print(f"  site_url: {resp.get('site_url')}")
        print(f"  confirmation subject: {resp.get('mailer_subjects_confirmation')}")
        print(f"  invite subject: {resp.get('mailer_subjects_invite')}")
        print(f"  magic_link subject: {resp.get('mailer_subjects_magic_link')}")
        print(f"  recovery subject: {resp.get('mailer_subjects_recovery')}")
        print(f"  email_change subject: {resp.get('mailer_subjects_email_change')}")

        for name, key in [
            ("Confirmation", "mailer_templates_confirmation_content"),
            ("Invite", "mailer_templates_invite_content"),
            ("Magic Link", "mailer_templates_magic_link_content"),
            ("Recovery", "mailer_templates_recovery_content"),
            ("Email Change", "mailer_templates_email_change_content"),
        ]:
            content = resp.get(key, "")
            has_brand = "0nMCP" in content and "#00ff88" in content
            has_logo = "0n</span><span" in content
            has_footer = "RocketOpp" in content
            has_mso = "mso" in content
            status = "PASS" if all([has_brand, has_logo, has_footer, has_mso]) else "WARN"
            print(f"  [{status}] {name}: brand={has_brand} logo={has_logo} footer={has_footer} outlook={has_mso}")
    except json.JSONDecodeError:
        print(f"Response body (not JSON): {body[:500]}")
else:
    print(f"FAILED! Response: {body[:1000]}")

# Cleanup
os.remove(tmp_file)
