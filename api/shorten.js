// API endpoint untuk shortening URL
// Simpan di: api/shorten.js

export default async function handler(req, res) {
    // Set CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        const { url, customDomain, customAlias } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                message: 'URL is required' 
            });
        }
        
        // Generate short code
        const code = customAlias || generateShortCode();
        
        // Here you would save to database
        // For demo, we'll just return the shortened URL
        const baseDomain = customDomain || process.env.VERCEL_URL || 'short.link';
        const shortUrl = `https://${baseDomain}/${code}`;
        
        return res.status(200).json({
            success: true,
            code: code,
            shortUrl: shortUrl,
            url: url,
            clicks: 0,
            createdAt: new Date().toISOString(),
            message: 'URL shortened successfully'
        });
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
