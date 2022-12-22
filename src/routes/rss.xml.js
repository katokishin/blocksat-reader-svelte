
export async function get() {
  const headers = {
    'Cache-Control': 'max-age=0m s-maxage=3600',
    'Content-Type': 'application/xml'
  }
  return {
    Headers,
    body: `<rss xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="https://www.w3.org/2005/Atom" version="2.0"></rss>`,
  }
}