const TOKEN = "EAA0tvCZBTqEcBSdFVBRzoEOAo2fuG7qLMxCH5tJdd99RZCaMF4QSpUh2nwx0g9gkIAz4HaSibKvwDddtoZCeJsWVecNMcUmZABwe2OA0AY0k2HKsLVPgENpP8ZAduGaBl0U2IkagtmAHoaVTvZBsaYVjHrpQUo1F2bYNKlXwORbyughFBjFZB03YnZBZC1TIiNZAJiMQlRvcUpTGaoFYkn49cKkigltPYvfOzITkfBxw0W2voG379N0tBpqM4UGCkKYBy67tMVUOHDtqOjApTAJqZBFwNtQ";
const PHONE_ID = "1371484266037867";
const TO_NUMBER = "919025619766";

async function sendTest() {
  console.log("Sending WhatsApp message to " + TO_NUMBER + "...");
  try {
    const response = await fetch("https://graph.facebook.com/v19.0/" + PHONE_ID + "/messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: TO_NUMBER,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      })
    });
    const data = await response.json();
    console.log("Meta Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
sendTest();
