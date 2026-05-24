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

    const site = await siteRes.json()
    const siteId = site.id

    // 2. Deploy the HTML file as a zip
    // Netlify expects a zip with index.html inside
    // We'll use the files API to deploy directly
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${token}`,
      },
      body: await createZip(html),
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
  // Netlify accepts a zip with index.html
  // We build a minimal ZIP manually (no external deps needed)
  const encoder    = new TextEncoder()
  const content    = encoder.encode(html)
  const fileName   = 'index.html'
  const fileNameBytes = encoder.encode(fileName)

  // Local file header
  const localHeader = buildLocalHeader(fileNameBytes, content)
  // Central directory header
  const centralHeader = buildCentralHeader(fileNameBytes, content, localHeader.length)
  // End of central directory
  const eocd = buildEOCD(centralHeader.length, localHeader.length + content.length)

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
  const crc    = crc32(content)
  const size   = content.length
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x03, 0x04]), // signature
    writeUint16LE(20),                       // version needed
    writeUint16LE(0),                        // flags
    writeUint16LE(0),                        // compression (stored)
    writeUint16LE(0),                        // mod time
    writeUint16LE(0),                        // mod date
    writeUint32LE(crc),                      // crc32
    writeUint32LE(size),                     // compressed size
    writeUint32LE(size),                     // uncompressed size
    writeUint16LE(fileName.length),          // filename length
    writeUint16LE(0),                        // extra field length
    fileName,
  ])
}

function buildCentralHeader(fileName: Uint8Array, content: Uint8Array, localOffset: number): Buffer {
  const crc  = crc32(content)
  const size = content.length
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x01, 0x02]), // signature
    writeUint16LE(20),                       // version made by
    writeUint16LE(20),                       // version needed
    writeUint16LE(0),                        // flags
    writeUint16LE(0),                        // compression
    writeUint16LE(0),                        // mod time
    writeUint16LE(0),                        // mod date
    writeUint32LE(crc),                      // crc32
    writeUint32LE(size),                     // compressed size
    writeUint32LE(size),                     // uncompressed size
    writeUint16LE(fileName.length),          // filename length
    writeUint16LE(0),                        // extra field length
    writeUint16LE(0),                        // file comment length
    writeUint16LE(0),                        // disk number start
    writeUint16LE(0),                        // internal attributes
    writeUint32LE(0),                        // external attributes
    writeUint32LE(localOffset),              // offset of local header
    fileName,
  ])
}

function buildEOCD(centralDirSize: number, centralDirOffset: number): Buffer {
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x05, 0x06]), // signature
    writeUint16LE(0),                        // disk number
    writeUint16LE(0),                        // disk with central dir
    writeUint16LE(1),                        // entries on disk
    writeUint16LE(1),                        // total entries
    writeUint32LE(centralDirSize),           // central dir size
    writeUint32LE(centralDirOffset),         // central dir offset
    writeUint16LE(0),                        // comment length
  ])
}