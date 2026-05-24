import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { html, siteName } = await req.json()

  if (!html || !siteName) {
    return NextResponse.json({ error: 'html and siteName are required' }, { status: 400 })
  }

  const token = process.env.NETLIFY_ACCESS_TOKEN!
  const slug  = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

  try {
    // 1. Create a new Netlify site
    const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `${slug}-${Date.now()}`,
      }),
    })

    if (!siteRes.ok) {
      const err = await siteRes.json()
      console.error('Netlify site creation error:', err)
      return NextResponse.json({ error: 'Failed to create Netlify site', detail: err }, { status: 500 })
    }

    const site   = await siteRes.json()
    const siteId = site.id

    // 2. Deploy the HTML file as a zip
    const zipBuffer = await createZip(html)
    const zipUint8  = new Uint8Array(zipBuffer)

    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${token}`,
      },
      body: zipUint8,
    })

    if (!deployRes.ok) {
      const err = await deployRes.json()
      console.error('Netlify deploy error:', err)
      return NextResponse.json({ error: 'Failed to deploy to Netlify', detail: err }, { status: 500 })
    }

    const deploy = await deployRes.json()

    return NextResponse.json({
      url:      `https://${site.default_domain}`,
      deployId: deploy.id,
      siteId:   site.id,
    })

  } catch (err) {
    console.error('Deploy route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a minimal zip containing index.html
async function createZip(html: string): Promise<Buffer> {
  const encoder       = new TextEncoder()
  const content       = encoder.encode(html)
  const fileName      = 'index.html'
  const fileNameBytes = encoder.encode(fileName)

  const localHeader   = buildLocalHeader(fileNameBytes, content)
  const centralHeader = buildCentralHeader(fileNameBytes, content, localHeader.length)
  const eocd          = buildEOCD(centralHeader.length, localHeader.length + content.length)

  return Buffer.concat([localHeader, content, centralHeader, eocd])
}

function crc32(data: Uint8Array): number {
  const table = makeCRCTable()
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeCRCTable(): number[] {
  const table: number[] = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  return table
}

function writeUint16LE(val: number): Uint8Array {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff])
}

function writeUint32LE(val: number): Uint8Array {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff, (val >> 16) & 0xff, (val >> 24) & 0xff])
}

function buildLocalHeader(fileName: Uint8Array, content: Uint8Array): Buffer {
  const crc  = crc32(content)
  const size = content.length
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x03, 0x04]),
    writeUint16LE(20),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint32LE(crc),
    writeUint32LE(size),
    writeUint32LE(size),
    writeUint16LE(fileName.length),
    writeUint16LE(0),
    fileName,
  ])
}

function buildCentralHeader(fileName: Uint8Array, content: Uint8Array, localOffset: number): Buffer {
  const crc  = crc32(content)
  const size = content.length
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x01, 0x02]),
    writeUint16LE(20),
    writeUint16LE(20),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint32LE(crc),
    writeUint32LE(size),
    writeUint32LE(size),
    writeUint16LE(fileName.length),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint32LE(0),
    writeUint32LE(localOffset),
    fileName,
  ])
}

function buildEOCD(centralDirSize: number, centralDirOffset: number): Buffer {
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x05, 0x06]),
    writeUint16LE(0),
    writeUint16LE(0),
    writeUint16LE(1),
    writeUint16LE(1),
    writeUint32LE(centralDirSize),
    writeUint32LE(centralDirOffset),
    writeUint16LE(0),
  ])
}