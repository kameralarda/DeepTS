import dotenv from 'dotenv';

dotenv.config();

export interface Config {
    ip: string;
    port: number;
    token?: string;
    dlSession?: string;
    proxy?: string;
}

export function initConfig(): Config {
    const config: Config = {
        ip: '0.0.0.0',
        port: 1188
    };

    // IP configuration
    if (process.env.IP) {
        config.ip = process.env.IP;
    }

    // Port configuration
    if (process.env.PORT) {
        const port = parseInt(process.env.PORT, 10);
        if (!isNaN(port)) {
            config.port = port;
        }
    }

    // DL Session configuration
    if (process.env.DL_SESSION) {
        config.dlSession = process.env.DL_SESSION;
    }

    // Access token configuration
    if (process.env.TOKEN) {
        config.token = process.env.TOKEN;
    }

    // HTTP Proxy configuration
    if (process.env.PROXY) {
        config.proxy = process.env.PROXY;
    }

    return config;
} 