import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export async function GET(): Promise<NextResponse> {
  const widgetPath = resolve(process.cwd(), 'apps-sdk/web/widget.html')
  const html = readFileSync(widgetPath, 'utf8')

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;profile=mcp-app',
      'X-Frame-Options': 'ALLOW-FROM https://chatgpt.com',
      'Content-Security-Policy':
        "default-src 'self' https://0nmcp.com https://marketplace.rocketclients.com; " +
        "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https://0nmcp.com;",
    },
  })
}
