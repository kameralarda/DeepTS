import express from 'express';
import cors from 'cors';
import { Config, initConfig } from './config';
import { translateByDeepLX } from './translate/translate';

const app = express();

// Initialize configuration
const config = initConfig();

// Middleware setup
app.use(express.json());
app.use(cors());

// Authentication middleware
function authMiddleware(config: Config): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (config.token) {
            const providedTokenInQuery = req.query.token as string;
            const providedTokenInHeader = req.headers.authorization;

            let headerToken = '';
            if (providedTokenInHeader) {
                const parts = providedTokenInHeader.split(' ');
                if (parts.length === 2) {
                    if (parts[0] === 'Bearer' || parts[0] === 'DeepL-Auth-Key') {
                        headerToken = parts[1];
                    }
                }
            }

            if (headerToken !== config.token && providedTokenInQuery !== config.token) {
                res.status(401).json({
                    code: 401,
                    message: 'Invalid access token'
                });
                return;
            }
        }
        next();
    };
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: 'DeepL Free API, Developed by sjlleo and missuo. Go to /translate with POST. http://github.com/OwO-Network/DeepLX'
    });
});

// Free API endpoint
app.post('/translate', authMiddleware(config), async (req, res) => {
    const { text, source_lang, target_lang, tag_handling } = req.body;

    try {
        const result = await translateByDeepLX(
            source_lang,
            target_lang,
            text,
            tag_handling,
            config.proxy,
            ''
        );

        if (result.code === 200) {
            res.json({
                code: result.code,
                id: result.id,
                data: result.data,
                alternatives: result.alternatives,
                source_lang: result.sourceLang,
                target_lang: result.targetLang,
                method: result.method
            });
        } else {
            res.status(result.code).json({
                code: result.code,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Translation failed:', error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error'
        });
    }
});

// Pro API endpoint
app.post('/v1/translate', authMiddleware(config), async (req, res) => {
    const { text, source_lang, target_lang, tag_handling } = req.body;

    let dlSession = config.dlSession;
    const cookie = req.headers.cookie;
    if (cookie) {
        dlSession = cookie.replace('dl_session=', '');
    }

    if (!dlSession) {
        res.status(401).json({
            code: 401,
            message: 'No dl_session Found'
        });
        return;
    }

    if (dlSession.includes('.')) {
        res.status(401).json({
            code: 401,
            message: 'Your account is not a Pro account. Please upgrade your account or switch to a different account.'
        });
        return;
    }

    try {
        const result = await translateByDeepLX(
            source_lang,
            target_lang,
            text,
            tag_handling,
            config.proxy,
            dlSession
        );

        if (result.code === 200) {
            res.json({
                code: result.code,
                id: result.id,
                data: result.data,
                alternatives: result.alternatives,
                source_lang: result.sourceLang,
                target_lang: result.targetLang,
                method: result.method
            });
        } else {
            res.status(result.code).json({
                code: result.code,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Translation failed:', error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error'
        });
    }
});

// V2 API endpoint (official API format)
app.post('/v2/translate', authMiddleware(config), async (req, res) => {
    let text: string;
    let targetLang: string;

    // Handle both form data and JSON
    if (req.is('application/x-www-form-urlencoded')) {
        text = req.body.text;
        targetLang = req.body.target_lang;
    } else {
        const jsonData = req.body;
        text = Array.isArray(jsonData.text) ? jsonData.text.join('\n') : '';
        targetLang = jsonData.target_lang;
    }

    if (!text || !targetLang) {
        res.status(400).json({
            code: 400,
            message: 'Invalid request payload'
        });
        return;
    }

    try {
        const result = await translateByDeepLX(
            '',
            targetLang,
            text,
            '',
            config.proxy,
            ''
        );

        if (result.code === 200) {
            res.json({
                translations: [{
                    detected_source_language: result.sourceLang,
                    text: result.data
                }]
            });
        } else {
            res.status(result.code).json({
                code: result.code,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Translation failed:', error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error'
        });
    }
});

// Catch-all route
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: 'Path not found'
    });
});

// Start server
app.listen(config.port, config.ip, () => {
    console.log(`DeepL X has been successfully launched! Listening on ${config.ip}:${config.port}`);
    console.log('Developed by sjlleo <i@leo.moe> and missuo <me@missuo.me>.');
}); 