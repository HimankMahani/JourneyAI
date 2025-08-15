import fetch from 'node-fetch';

/**
 * Discord Webhook Service - Simplified for Visit Notifications Only
 * Sends notifications to Discord channel when users visit the website
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Simple queue + cooldown
let queue = Promise.resolve();
let cooldownUntil = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postWebhook(body, attempt = 1) {
  // Respect cooldown
  const now = Date.now();
  if (now < cooldownUntil) {
    await sleep(cooldownUntil - now);
  }

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });

  if (res.status === 429) {
    // Parse Retry-After seconds (or default 1s)
    const h = (n) => res.headers.get(n);
    const retryAfter =
      parseFloat(h('retry-after') || h('x-ratelimit-reset-after') || '1') || 1;
    cooldownUntil = Date.now() + Math.ceil(retryAfter * 1000);

    if (attempt >= 2) {
      console.warn('⚠️ Discord rate limit, max retries reached. Dropping message.');
      return false;
    }
    console.warn(`⚠️ Discord rate limit. Retrying in ${Math.ceil(retryAfter)}s...`);
    await sleep(Math.ceil(retryAfter * 1000));
    return postWebhook(body, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('❌ Discord webhook failed:', res.status, res.statusText, text);
    return false;
  }

  return true;
}

async function sendDiscordEmbed(embed) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('⚠️ Discord webhook URL not configured');
    return false;
  }

  const payload = JSON.stringify({ embeds: [embed] });

  // Serialize sends to avoid burst 429s
  queue = queue.then(() => postWebhook(payload).catch((e) => {
    console.error('❌ Error sending Discord notification:', e?.message || e);
    return false;
  }));
  return queue;
}

/**
 * Send website visit notification
 */
export async function notifyWebsiteVisit(visitData) {
  const embed = {
    title: '🌐 Website Visit',
    description: 'Someone visited JourneyAI!',
    color: 0x3498db,
    fields: [
      { name: '📍 URL', value: visitData.url || 'Unknown', inline: true },
      { name: '🖥️ Screen', value: visitData.screen || 'Unknown', inline: true },
      { name: '🌍 Timezone', value: visitData.timezone || 'Unknown', inline: true },
      { name: '🗣️ Language', value: visitData.language || 'Unknown', inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'JourneyAI Analytics' }
  };
  return sendDiscordEmbed(embed);
}
