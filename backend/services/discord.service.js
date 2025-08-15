/**
 * Discord Webhook Service - Simplified for Visit Notifications Only
 * Sends notifications to Discord channel when users visit the website
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a Discord embed message
 */
async function sendDiscordEmbed(embed) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('⚠️ Discord webhook URL not configured');
    return;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (response.status === 429) {
      console.warn('⚠️ Discord rate limit hit, skipping notification');
      return;
    }

    if (!response.ok) {
      console.error('❌ Discord webhook failed:', response.status, response.statusText);
      return;
    }

    console.log('✅ Discord notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message);
  }
}

/**
 * Send website visit notification
 */
export async function notifyWebsiteVisit(visitData) {
  const embed = {
    title: "🌐 Website Visit",
    description: "Someone visited JourneyAI!",
    color: 0x3498db, // Blue
    fields: [
      {
        name: "📍 URL",
        value: visitData.url || "Unknown",
        inline: true
      },
      {
        name: "🖥️ Screen",
        value: visitData.screen || "Unknown", 
        inline: true
      },
      {
        name: "🌍 Timezone",
        value: visitData.timezone || "Unknown",
        inline: true
      },
      {
        name: "🗣️ Language", 
        value: visitData.language || "Unknown",
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "JourneyAI Analytics"
    }
  };

  await sendDiscordEmbed(embed);
}
