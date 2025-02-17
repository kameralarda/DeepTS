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

## Executables

You can build standalone executables for Linux, macOS, and Windows platforms.

### Building Executables Locally

To build executables for all platforms:
```bash
yarn package:all
```

This will create the following executables in the `dist` directory:
- Linux: `deep-ts-linux`
- macOS: `deep-ts-macos`
- Windows: `deep-ts-win.exe`

### Automated Releases

The project uses GitHub Actions to automatically build and release executables when a new version tag is pushed. To create a new release:

1. Tag a new version:
```bash
git tag v1.0.0  # Replace with your version
git push origin v1.0.0
```

2. The GitHub Actions workflow will automatically:
   - Build the executables for all platforms
   - Create a new GitHub release
   - Upload the executables as release assets

You can find all releases in the [Releases](../../releases) section of the GitHub repository.

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