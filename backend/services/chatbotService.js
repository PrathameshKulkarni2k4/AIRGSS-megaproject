const https = require('https');

const GOVERNANCE_KNOWLEDGE = `
You are GAIA (Governance AI Assistant), an AI-powered assistant for AIRGSS - AI Powered Rural Governance Support System.
You help rural citizens with Panchayat services. You support English, Hindi, and Marathi.

Services you help with:
- Complaint registration (roads, water, electricity, sanitation, health, education)
- Government scheme recommendations (PM Awas Yojana, PM Kisan, Ayushman Bharat, etc.)
- Tax and bill payments (property tax, water bill)
- Certificate requests (income, residence, birth certificates)
- Document upload and verification

Government Schemes:
- PM Awas Yojana: Housing for families with income < 3 lakhs
- PM Kisan Samman Nidhi: Rs 6000/year for farmers
- Ayushman Bharat: Free health coverage up to Rs 5 lakhs for BPL families
- PMJDY: Jan Dhan bank accounts for all
- Ujjwala Yojana: Free LPG for BPL women
- MGNREGA: 100 days employment guarantee

Be helpful, concise, and compassionate. For complex issues, guide users to the appropriate service module.
`;

const LANGUAGE_INSTRUCTION = {
  hi: 'Always respond in Hindi language only.',
  mr: 'Always respond in Marathi language only.',
  en: 'Always respond in English language only.',
};

exports.getChatbotResponse = async (message, history, language, user) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error("Gemini API key is missing.");
      return getFallbackResponse(message);
    }

    // FIX 1: The correct key is 'en'
    const languageNote = LANGUAGE_INSTRUCTION[language] || LANGUAGE_INSTRUCTION['en'];

    const systemContext = GOVERNANCE_KNOWLEDGE
      + `\nLanguage instruction: ${languageNote}`
      + (user ? `\nUser: ${user.name}, Role: ${user.role}` : '');

    // FIX 2: Safeguard against an undefined history array
    const safeHistory = Array.isArray(history) ? history : [];
    const geminiHistory = safeHistory.slice(-8).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // FIX 3: Prevent duplicate user messages to avoid 400 Bad Request
    let contents = [...geminiHistory];
    const isMessageAlreadyInHistory = contents.length > 0 && 
                                      contents[contents.length - 1].role === 'user' && 
                                      contents[contents.length - 1].parts[0].text === message;
                                      
    if (!isMessageAlreadyInHistory) {
        contents.push({ role: 'user', parts: [{ text: message }] });
    }

    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemContext }]
      },
      contents: contents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    const path = `/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    return new Promise((resolve) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // FIX 4: Explicitly define utf8 for Hindi/Marathi unicode characters
          'Content-Length': Buffer.byteLength(body, 'utf8') 
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              resolve(text);
            } else {
              // This will print the exact reason if Gemini rejects the prompt
              console.error("Gemini API Error:", parsed.error?.message || data); 
              resolve(getFallbackResponse(message));
            }
          } catch (e) {
            console.error("Parsing Error:", e);
            resolve(getFallbackResponse(message));
          }
        });
      });

      req.on('error', (e) => {
        console.error("Request Error:", e);
        resolve(getFallbackResponse(message));
      });
      
      req.write(body);
      req.end();
    });

  } catch (err) {
    console.error("Fatal function error:", err);
    // FIX 5: Removed the inline comment so it actually returns the fallback string
    return getFallbackResponse(message);
  }
};

function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('complaint') || lower.includes('problem')) {
    return 'To file a complaint, go to the Complaints section and describe your issue. Our AI will classify and assign it to the right department automatically.';
  }
  if (lower.includes('scheme') || lower.includes('benefit')) {
    return 'To see government schemes you qualify for, complete your profile with income, age, and occupation details. Then visit the Schemes section for personalized recommendations.';
  }
  if (lower.includes('tax') || lower.includes('payment') || lower.includes('bill')) {
    return 'You can pay property tax, water bills, and local fees in the Payments section. We accept all major payment methods.';
  }
  if (lower.includes('certificate') || lower.includes('document')) {
    return 'You can request Income, Residence, and Birth certificates from the Documents section. Admin will verify and issue digitally.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
    return 'Namaste! I am GAIA, your Governance AI Assistant. I can help you with complaints, schemes, payments, certificates and more. How can I assist you today?';
  }
  return 'I am here to help with all Panchayat services. You can ask me about complaints, government schemes, payments, or document requests.';
}