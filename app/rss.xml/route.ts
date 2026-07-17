import { getSeoConfig } from '@/lib/seo/config';
import { listRants } from '@/lib/db/repo';

// Revalidate the feed at most once per hour
export const revalidate = 3600;

const MAX_ITEMS = 50;

/**
 * Escape a string for safe inclusion in XML text nodes / attributes.
 */
function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Strip HTML tags and collapse whitespace to produce a plain-text string.
 */
function toPlainText(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Build a concise item title from the rant content.
 */
function buildTitle(content: string, mood?: string): string {
    const text = toPlainText(content);
    const truncated = text.length > 80 ? `${text.slice(0, 80).trim()}…` : text;
    const prefix = mood ? `[${mood}] ` : '';
    return `${prefix}${truncated || 'Untitled rant'}`;
}

interface RantRow {
    id: string;
    content: string;
    mood: string | null;
    created_at: string;
    tags: string[] | null;
}

export async function GET() {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, '');

    let rants: RantRow[] = [];

    // Read the latest rants from Turso; emit an empty (but valid) feed on failure.
    try {
        rants = await listRants({ sortBy: 'latest', limit: MAX_ITEMS });
    } catch (err) {
        console.error('Error building RSS feed:', err);
        rants = [];
    }

    const lastBuildDate = (rants[0]?.created_at
        ? new Date(rants[0].created_at)
        : new Date()
    ).toUTCString();

    const items = rants
        .map((rant) => {
            const plain = toPlainText(rant.content);
            const link = baseUrl; // No per-rant detail page yet; link to the feed source.
            const categories = (rant.tags || [])
                .map((tag) => `      <category>${escapeXml(tag)}</category>`)
                .join('\n');

            return `    <item>
      <title>${escapeXml(buildTitle(rant.content, rant.mood || undefined))}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">rant-${escapeXml(rant.id)}</guid>
      <pubDate>${new Date(rant.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${plain}]]></description>
${categories}
    </item>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.siteName)} — Latest Rants</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(config.defaultDescription)}</description>
    <language>${escapeXml((config.locale || 'en_US').replace('_', '-').toLowerCase())}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
