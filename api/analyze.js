module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider = 'gemini', imageBase64, prompt, mimeType = 'image/jpeg' } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  // Usa Gemini (default)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: cleanBase64 } }
        ]
      }]
    }),
  })
  .then(r => r.json())
  .then(data => {
    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'Invalid response', details: data });
    }
    res.status(200).json({ result: data.candidates[0].content.parts[0].text });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
};
