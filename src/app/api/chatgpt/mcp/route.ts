import { NextRequest, NextResponse } from 'next/server'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { getMCPServer } from '@/lib/mcp/server'
import { verifyBearerToken } from '@/lib/mcp/auth'
import crypto from 'crypto'

async function handleMCP(req: NextRequest): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const authInfo = token ? await verifyBearerToken(token) : null

  if (!authInfo) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Valid Bearer token required.' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': `Bearer realm="0nMCP", error="invalid_token", ` +
            `resource_metadata="${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/.well-known/oauth-protected-resource"`,
        },
      }
    )
  }

  const server = getMCPServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  })

  await server.connect(transport)

  const body = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => { headers[key] = value })

  const mockReq = {
    method: req.method,
    headers,
    body: body ? JSON.parse(body) : undefined,
  }

  const chunks: Buffer[] = []
  const mockRes = {
    statusCode: 200,
    _headers: {} as Record<string, string>,
    setHeader(k: string, v: string) { this._headers[k] = v },
    writeHead(code: number, hdrs?: Record<string, string>) {
      this.statusCode = code
      if (hdrs) Object.assign(this._headers, hdrs)
    },
    write(data: string | Uint8Array) {
      chunks.push(typeof data === 'string' ? Buffer.from(data) : Buffer.from(data))
    },
    end(data?: string | Uint8Array) {
      if (data) this.write(data)
    },
    on() { return this },
  }

  await transport.handleRequest(mockReq as never, mockRes as never, mockReq.body)

  const responseBody = Buffer.concat(chunks)
  return new Response(responseBody, {
    status: mockRes.statusCode,
    headers: {
      ...mockRes._headers,
      'Access-Control-Allow-Origin': 'https://chatgpt.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version',
    },
  })
}

export async function POST(req: NextRequest) { return handleMCP(req) }
export async function GET(req: NextRequest) { return handleMCP(req) }
export async function DELETE(req: NextRequest) { return handleMCP(req) }

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://chatgpt.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version',
      'Access-Control-Max-Age': '86400',
    },
  })
}
