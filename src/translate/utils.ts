import { PostData } from './types';

// Returns the number of 'i' characters in the text
export function getICount(translateText: string): number {
    return (translateText.match(/i/g) || []).length;
}

// Generates a random number for request ID
export function getRandomNumber(): number {
    const num = Math.floor(Math.random() * 99999) + 8300000;
    return num * 1000;
}

// Generates timestamp for request based on i count
export function getTimeStamp(iCount: number): number {
    const ts = Date.now();
    if (iCount !== 0) {
        iCount = iCount + 1;
        return ts - (ts % iCount) + iCount;
    }
    return ts;
}

// Formats the request JSON string with specific spacing rules
export function formatPostString(postData: PostData): string {
    const postStr = JSON.stringify(postData);

    if ((postData.id + 5) % 29 === 0 || (postData.id + 3) % 13 === 0) {
        return postStr.replace('"method":"', '"method" : "');
    } else {
        return postStr.replace('"method":"', '"method": "');
    }
}

// Checks if text contains HTML-like tags
export function isRichText(text: string): boolean {
    return text.includes('<') && text.includes('>');
} 