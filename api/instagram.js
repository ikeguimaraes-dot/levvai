// Vercel Serverless Function — Instagram Graph API
// Instituto Levvai — @institutolevvai
// Instagram ID: 17841472231421137
// Connected via Page 818979271308603 (Business Manager: Meet & Eat)
// App: LEVVAI_PORTAL

import { requireUser } from './_auth.js';

const CACHE_TTL_MS = 30 * 60 * 1000;
let responseCache = null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  if (responseCache && Date.now() - responseCache.createdAt < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).json(responseCache.data);
  }

  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const IG_USER_ID = process.env.INSTAGRAM_USER_ID || '17841472231421137';

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Missing META_ACCESS_TOKEN in environment variables',
      setup: 'Vercel > Settings > Environment Variables > Add META_ACCESS_TOKEN and INSTAGRAM_USER_ID'
    });
  }

  try {
    // 1. Profile — confirmed working: username, followers_count, name
    const profileRes = await fetch(
      `https://graph.facebook.com/v25.0/${IG_USER_ID}?fields=username,followers_count,name&access_token=${ACCESS_TOKEN}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return res.status(400).json({ error: profile.error.message, tip: 'Token may be expired. Regenerate at developers.facebook.com/tools/explorer with LEVVAI_PORTAL app, Page: Instituto Levvai.' });
    }

    // 2. Recent media
    let posts = [];
    try {
      const mediaRes = await fetch(
        `https://graph.facebook.com/v25.0/${IG_USER_ID}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=20&access_token=${ACCESS_TOKEN}`
      );
      const media = await mediaRes.json();

      if (media.data) {
        posts = await Promise.all(
          media.data.slice(0, 12).map(async (post) => {
            let insights = {};
            try {
              const metrics = post.media_type === 'VIDEO' ? 'reach,saved,shares,plays' : 'reach,saved,shares';
              const r = await fetch(`https://graph.facebook.com/v25.0/${post.id}/insights?metric=${metrics}&access_token=${ACCESS_TOKEN}`);
              const d = await r.json();
              if (d.data) d.data.forEach(i => { insights[i.name] = i.values?.[0]?.value || 0; });
            } catch (e) {}
            return {
              id: post.id, caption: post.caption?.substring(0, 100) || '', type: post.media_type,
              date: post.timestamp, likes: post.like_count || 0, comments: post.comments_count || 0,
              reach: insights.reach || 0, saves: insights.saved || 0, shares: insights.shares || 0,
              plays: insights.plays || 0, url: post.permalink,
            };
          })
        );
      }
    } catch (e) {}

    // 3. Account insights (30 days)
    let accountInsights = {};
    try {
      const since = Math.floor(Date.now() / 1000) - 30 * 86400;
      const until = Math.floor(Date.now() / 1000);
      const r = await fetch(`https://graph.facebook.com/v25.0/${IG_USER_ID}/insights?metric=reach,impressions,profile_views&period=day&since=${since}&until=${until}&access_token=${ACCESS_TOKEN}`);
      const d = await r.json();
      if (d.data) d.data.forEach(m => { accountInsights[m.name] = { total: m.values.reduce((s, v) => s + (v.value || 0), 0), daily: m.values }; });
    } catch (e) {}

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      profile: {
        username: profile.username || 'institutolevvai',
        followers: profile.followers_count || 0,
        name: profile.name || 'Instituto Levvai',
      },
      posts,
      accountInsights,
    };
    responseCache = { createdAt: Date.now(), data: response };
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Instagram data', message: error.message });
  }
}
