// Language settings for translation
export interface Lang {
    sourceLangComputed?: string;
    targetLang: string;
    langUserSelected?: string;
}

// Common parameters for translation jobs
export interface CommonJobParams {
    mode: string;
    regionalVariant?: string;
}

// Represents a sentence in the translation request
export interface Sentence {
    prefix: string;
    text: string;
    id: number;
}

// Represents a translation job
export interface Job {
    kind: string;
    preferredNumBeams: number;
    rawEnContextBefore: string[];
    rawEnContextAfter: string[];
    sentences: Sentence[];
}

// Parameters for translation requests
export interface Params {
    commonJobParams: CommonJobParams;
    lang: Lang;
    texts?: string[];
    textType?: string;
    jobs?: Job[];
    priority?: number;
    timestamp: number;
}

// Complete translation request
export interface PostData {
    jsonrpc: string;
    method: string;
    id: number;
    params: Params;
}

// Response from text splitting
export interface SplitTextResponse {
    jsonrpc: string;
    id: number;
    result: {
        lang: {
            detected: string;
        };
        texts: {
            chunks: {
                sentences: {
                    prefix: string;
                    text: string;
                }[];
            }[];
        }[];
    };
}

// Response from translation
export interface TranslationResponse {
    jsonrpc: string;
    id: number;
    result: {
        translations: {
            beams: {
                sentences: {
                    text: string;
                }[];
            }[];
        }[];
        sourceLang: string;
        targetLang: string;
    };
}

// Final translation result
export interface DeepLXTranslationResult {
    code: number;
    id: number;
    message?: string;
    data: string;
    alternatives: string[];
    sourceLang: string;
    targetLang: string;
    method: string;
}

// API request payloads
export interface PayloadFree {
    text: string;
    sourceLang: string;
    targetLang: string;
    tagHandling?: string;
}

export interface PayloadAPI {
    text: string[];
    targetLang: string;
    sourceLang: string;
    tagHandling?: string;
} 