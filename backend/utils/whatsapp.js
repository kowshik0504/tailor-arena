const fetch = global.fetch;

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Sends a generic text message via WhatsApp.
 * Note: In the Meta Test Environment, the recipient MUST have replied 
 * to your test number within the last 24 hours to receive custom text messages.
 */
exports.sendWhatsAppMessage = async (to, text) => {
  if (!PHONE_ID || !TOKEN) {
    console.error("WhatsApp credentials missing in .env");
    return false;
  }

  // Format number (remove + if present, ensure country code)
  const toClean = to.replace(/[^0-9]/g, "");

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toClean,
        type: "text",
        text: { 
          preview_url: false,
          body: text 
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("WhatsApp API Error:", data.error.message);
      return false;
    }
    
    console.log(`WhatsApp message sent to ${toClean}`);
    return true;
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err);
    return false;
  }
};

/**
 * Sends a pre-approved template message (e.g., hello_world).
 * Templates do NOT require the 24-hour window.
 */
exports.sendWhatsAppTemplate = async (to, templateName, languageCode = "en_US") => {
  const toClean = to.replace(/[^0-9]/g, "");

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toClean,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode }
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error(`WhatsApp Template Error (${templateName}):`, data.error.message);
      return false;
    }
    
    console.log(`WhatsApp template ${templateName} sent to ${toClean}`);
    return true;
  } catch (err) {
    console.error("Failed to send WhatsApp template:", err);
    return false;
  }
};

