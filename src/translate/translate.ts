import axios, { AxiosError } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { 
    PostData, 
    DeepLXTranslationResult, 
    Job, 
    SplitTextResponse,
    TranslationResponse 
} from './types';
import { 
    getICount, 
    getRandomNumber, 
    getTimeStamp, 
    formatPostString, 
    isRichText 
} from './utils';

const BASE_URL = 'https://www2.deepl.com/jsonrpc';

// Makes an HTTP request to DeepL API
async function makeRequest(
    postData: PostData, 
    urlMethod: string, 
    proxyURL?: string, 
    dlSession?: string
): Promise<any> {
    const urlFull = `${BASE_URL}?client=chrome-extension,1.28.0&method=${urlMethod}`;
    const postStr = formatPostString(postData);

    const headers: Record<string, string> = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh-HK;q=0.6,zh;q=0.5',
        'Authorization': 'None',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'DNT': '1',
        'Origin': 'chrome-extension://cofdbpoegempjloogbagkncekinflcnj',
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Referer': 'https://www.deepl.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'none',
        'Sec-GPC': '1',
        'User-Agent': 'DeepLBrowserExtension/1.28.0 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    };

    if (dlSession) {
        headers['Cookie'] = `dl_session=${dlSession}`;
    }

    const config: any = {
        headers,
        decompress: true
    };

    if (proxyURL) {
        config.httpsAgent = new HttpsProxyAgent(proxyURL);
    }

    try {
        const response = await axios.post(urlFull, postStr, config);
        return response.data;
    } catch (error) {
        const err = error as AxiosError;
        throw new Error(`Request failed: ${err.message}`);
    }
}

// Splits the input text for translation
async function splitText(
    text: string, 
    tagHandling: boolean, 
    proxyURL?: string, 
    dlSession?: string
): Promise<SplitTextResponse> {
    const postData: PostData = {
        jsonrpc: '2.0',
        method: 'LMT_split_text',
        id: getRandomNumber(),
        params: {
            commonJobParams: {
                mode: 'translate'
            },
            lang: {
                langUserSelected: 'auto',
                targetLang: ''
            },
            texts: [text],
            textType: tagHandling || isRichText(text) ? 'richtext' : 'plaintext',
            timestamp: getTimeStamp(getICount(text))
        }
    };

    return makeRequest(postData, 'LMT_split_text', proxyURL, dlSession);
}

// Main translation function
export async function translateByDeepLX(
    sourceLang: string,
    targetLang: string,
    text: string,
    tagHandling?: string,
    proxyURL?: string,
    dlSession?: string
): Promise<DeepLXTranslationResult> {
    if (!text) {
        return {
            code: 404,
            id: 0,
            message: 'No text to translate',
            data: '',
            alternatives: [],
            sourceLang: '',
            targetLang: '',
            method: ''
        };
    }

    // Split text by newlines and store them for later reconstruction
    const textParts = text.split('\n');
    const translatedParts: string[] = [];
    const allAlternatives: string[][] = [];

    for (const part of textParts) {
        if (!part.trim()) {
            translatedParts.push('');
            allAlternatives.push(['']);
            continue;
        }

        // Split text first
        const splitResult = await splitText(
            part,
            tagHandling === 'html' || tagHandling === 'xml',
            proxyURL,
            dlSession
        );

        // For auto language detection, let DeepL handle it
        if (!sourceLang || sourceLang === 'auto') {
            sourceLang = 'auto';
        }

        // Prepare jobs from split result
        const jobs: Job[] = [];
        const chunks = splitResult.result.texts[0].chunks;

        chunks.forEach((chunk, idx) => {
            const contextBefore = idx > 0 ? [chunks[idx - 1].sentences[0].text] : [];
            const contextAfter = idx < chunks.length - 1 ? [chunks[idx + 1].sentences[0].text] : [];

            jobs.push({
                kind: 'default',
                preferredNumBeams: 4,
                rawEnContextBefore: contextBefore,
                rawEnContextAfter: contextAfter,
                sentences: [{
                    prefix: chunk.sentences[0].prefix,
                    text: chunk.sentences[0].text,
                    id: idx + 1
                }]
            });
        });

        const hasRegionalVariant = targetLang.includes('-');
        const targetLangCode = hasRegionalVariant ? targetLang.split('-')[0] : targetLang;

        // Prepare translation request
        const id = getRandomNumber();
        const postData: PostData = {
            jsonrpc: '2.0',
            method: 'LMT_handle_jobs',
            id,
            params: {
                commonJobParams: {
                    mode: 'translate',
                    regionalVariant: hasRegionalVariant ? targetLang : undefined
                },
                lang: {
                    sourceLangComputed: sourceLang.toUpperCase(),
                    targetLang: targetLangCode.toUpperCase()
                },
                jobs,
                priority: 1,
                timestamp: getTimeStamp(getICount(part))
            }
        };

        // Make translation request
        const result = await makeRequest(postData, 'LMT_handle_jobs', proxyURL, dlSession);

        // Process translation results
        let partTranslation = '';
        const partAlternatives: string[] = [];

        const translations = result.result.translations;
        if (translations.length > 0) {
            // Process main translation
            translations.forEach((translation: TranslationResponse['result']['translations'][0]) => {
                partTranslation += translation.beams[0].sentences[0].text + ' ';
            });
            partTranslation = partTranslation.trim();

            // Process alternatives
            const numBeams = translations[0].beams.length;
            for (let i = 1; i < numBeams; i++) {
                let altText = '';
                translations.forEach((translation: TranslationResponse['result']['translations'][0]) => {
                    if (translation.beams[i]) {
                        altText += translation.beams[i].sentences[0].text + ' ';
                    }
                });
                if (altText) {
                    partAlternatives.push(altText.trim());
                }
            }
        }

        if (!partTranslation) {
            return {
                code: 503,
                id: 0,
                message: 'Translation failed',
                data: '',
                alternatives: [],
                sourceLang: '',
                targetLang: '',
                method: ''
            };
        }

        translatedParts.push(partTranslation);
        allAlternatives.push(partAlternatives);
    }

    // Join all translated parts with newlines
    const translatedText = translatedParts.join('\n');

    // Combine alternatives with proper newline handling
    const maxAlts = Math.max(...allAlternatives.map(alts => alts.length));
    const combinedAlternatives: string[] = [];

    for (let i = 0; i < maxAlts; i++) {
        const altParts = allAlternatives.map((alts, j) => {
            if (i < alts.length) {
                return alts[i];
            }
            return translatedParts[j].length === 0 ? '' : translatedParts[j];
        });
        combinedAlternatives.push(altParts.join('\n'));
    }

    return {
        code: 200,
        id: getRandomNumber(),
        data: translatedText,
        alternatives: combinedAlternatives,
        sourceLang,
        targetLang,
        method: dlSession ? 'Pro' : 'Free'
    };
} 