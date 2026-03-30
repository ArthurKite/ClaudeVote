import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  try {
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
    const response = await fetch(microlinkUrl, { redirect: 'follow' })

    if (!response.ok) {
      return res.status(404).end()
    }

    const contentType = response.headers.get('content-type')
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader('Content-Type', contentType || 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    return res.send(buffer)
  } catch {
    return res.status(404).end()
  }
}
