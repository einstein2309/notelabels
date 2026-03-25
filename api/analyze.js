const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider = 'gemini', imageBase64, prompt, mimeType = 'image/jpeg' } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const postData = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: cleanBase64 } }
      ]
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.candidates || !parsed.candidates[0]) {
          return res.status(500).json({ error: 'Invalid Gemini response', details: parsed });
        }
        res.status(200).json({ result: parsed.candidates[0].content.parts[0].text });
      } catch (e) {
        res.status(500).json({ error: 'Parse error', details: data });
      }
    });
  });

  apiReq.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  apiReq.write(postData);
  apiReq.end();
};
