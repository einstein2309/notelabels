// api/analyze.js - Supporta sia Gemini che Claude
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider = 'gemini', imageBase64, prompt, mimeType = 'image/jpeg' } = req.body;
  
  // Debug: logga cosa riceviamo
  console.log('Provider:', provider);
  console.log('Image length:', imageBase64 ? imageBase64.length : 0);
  console.log('MimeType:', mimeType);
  
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  // Rimuovi il prefisso data:image/... se presente
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  try {
    if (provider === 'claude') {
      // Usa Claude (Anthropic)
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Claude API key not configured' });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 2500,
          messages: [{
            role: 'user',
            content: [
              { 
                type: 'image', 
                source: { 
                  type: 'base64', 
                  media_type: mimeType, 
                  data: cleanBase64 
                } 
              },
              { type: 'text', text: prompt }
            ]
          }]
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json({ result: data.content[0].text });

    } else {
      // Usa Gemini (Google) - default
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

      // Formato corretto per Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { 
                inline_data: { 
                  mime_type: mimeType, 
                  data: cleanBase64 
                } 
              }
            ]
          }]
        }),
      });

      const data = await response.json();
      console.log('Gemini response:', JSON.stringify(data).substring(0, 200));
      
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || 'Gemini API error', details: data });
      }
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return res.status(500).json({ error: 'Invalid Gemini response', details: data });
      }
      
      return res.status(200).json({ result: data.candidates[0].content.parts[0].text });
    }

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
