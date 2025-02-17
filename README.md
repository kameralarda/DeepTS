# DeepTS

A TypeScript implementation of the DeepL API proxy server. This project is a port of the [DeepLX](https://github.com/OwO-Network/DeepLX) project from Go to TypeScript.

## Features

- Free API endpoint for DeepL translations
- Pro API endpoint with session support
- V2 API endpoint compatible with official DeepL API format
- Support for HTML and XML tag handling
- Proxy support
- Token-based authentication

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file in the root directory with your configuration:
```env
IP=0.0.0.0
PORT=1188
TOKEN=your_access_token
DL_SESSION=your_dl_session
PROXY=your_proxy_url
```

All environment variables are optional. If not set, default values will be used.

## Development

Run the development server with hot reload:
```bash
yarn dev
```

## Production

Build the project:
```bash
yarn build
```

Start the production server:
```bash
yarn start
```

## API Endpoints

### 1. Free API (`/translate`)
```bash
POST /translate
Content-Type: application/json

{
    "text": "Hello, world!",
    "source_lang": "EN",
    "target_lang": "DE",
    "tag_handling": "html"  # optional
}
```

### 2. Pro API (`/v1/translate`)
```bash
POST /v1/translate
Content-Type: application/json
Cookie: dl_session=your_session_id

{
    "text": "Hello, world!",
    "source_lang": "EN",
    "target_lang": "DE",
    "tag_handling": "html"  # optional
}
```

### 3. V2 API (`/v2/translate`)
```bash
POST /v2/translate
Content-Type: application/json

{
    "text": ["Hello, world!"],
    "target_lang": "DE"
}
```

## Authentication

If `TOKEN` is set in the environment variables, all API endpoints will require authentication. You can provide the token in one of two ways:

1. Query parameter: `?token=your_token`
2. Authorization header: `Authorization: Bearer your_token` or `Authorization: DeepL-Auth-Key your_token`

## Credits

Original Go implementation by:
- sjlleo <i@leo.moe>
- missuo <me@missuo.me>

## License

MIT 