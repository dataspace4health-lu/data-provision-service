# Data Delivery REST Service

A secure REST API service built with Express.js and TypeScript for delivering data assets with OIDC authentication. This service provides authenticated access to various file formats including CSV, TXT, and JSON files.

## Features

- 🔐 **OIDC Authentication** - Secure token-based authentication using OpenID Connect
- 📁 **File Delivery** - Secure delivery of data assets (CSV, TXT, JSON)
- 📝 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🔍 **File Validation** - Built-in file type and format validation
- 🚀 **TypeScript** - Full TypeScript support for better development experience
- 🐳 **Docker Support** - Containerized deployment ready

## Prerequisites

- Node.js 18+ 
- npm or yarn
- An OIDC provider (Keycloak, Idp kit, Google, etc.)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd rest-service
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your OIDC provider details:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OIDC Configuration
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=http://localhost:3000/callback
```

### 3. Add Data Files

Place your data files in the `data/` directory:

```
data/
├── sample.csv
├── sample.txt
└── verifiable_presentation.json
```

### 4. Build and Run

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Docker:**
```bash
docker build -t data-delivery-service .
docker run -p 3000:3000 --env-file .env data-delivery-service
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/

## API Endpoints

### GET /api/files/{filename}

Retrieve a data asset by filename with OIDC authentication.

**Headers:**
```
Authorization: Bearer <your-access-token>
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/files/sample.csv
```

**Responses:**
- `200 OK` - File delivered successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - File not found
- `415 Unsupported Media Type` - Invalid file type

## Authentication

This service uses OIDC (OpenID Connect) for authentication. You need to:

1. Obtain an access token from your OIDC provider
2. Include the token in the `Authorization` header as `Bearer <token>`

### Current Implementation

**⚠️ Important Note**: Currently, we can configure this service to use **Keycloak** as the OIDC issuer for authentication. 

### Future Plans

**🔄 Planned Migration**: We plan to migrate from Keycloak to **IDP Kit** as the OIDC issuer in future releases.

**Migration Considerations**:
- Environment variables will need to be updated
- OIDC endpoints and configuration may change
- Additional IDP Kit-specific configurations may be required
- Authentication flow should remain compatible due to OIDC standard compliance

### Supported OIDC Providers

- **Keycloak** (current)
- **IDP Kit** (planned future implementation)
- Any OIDC-compliant provider

## Testing

### Manual Testing

Use the provided test script:

```bash
chmod +x test-api-endpoint.sh
./test-api-endpoint.sh sample.csv
```

### API Testing

```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/files/sample.csv

# Test authentication
curl -v http://localhost:3000/api/files/sample.csv
# Should return 401 Unauthorized
```

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── config/
│   ├── loader.ts           # Environment configuration
│   └── swagger.ts          # API documentation setup
├── controllers/
│   └── dataAsset.controller.ts  # File delivery logic
├── middleware/
│   └── oidc.middleware.ts  # OIDC authentication
├── routes/
│   └── dataset.routes.ts   # API routes definition
├── services/
│   ├── dataAsset.service.ts     # File operations
│   └── fileValidation.service.ts # File validation
└── utils/
    └── errors/
        └── custom.error.ts # Custom error handling
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Environment Variables

**📝 Migration Note**: The OIDC-related environment variables are currently configured for Keycloak but could be updated when migrating to IDP Kit.

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `OIDC_ISSUER` | OIDC provider URL | Yes | - |
| `OIDC_CLIENT_ID` | OIDC client ID | Yes | - |
| `OIDC_CLIENT_SECRET` | OIDC client secret | Yes | - |
| `OIDC_REDIRECT_URI` | OIDC redirect URI | No | - |

## Security

- All endpoints require valid OIDC authentication
- File access is controlled and validated
- Input validation on all file operations

## Deployment

### Local Docker Deployment

```bash
# Build image
docker build -t data-delivery-service .

# Run container
docker run -d \
  --name data-delivery \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  data-delivery-service
```

### Docker Registry Deployment

For deployment with a local registry (e.g., k3d cluster registry):

```bash
# Build image for your registry
docker build -t localhost:5432/data-delivery-service:latest .

# Push to local registry
docker push localhost:5432/data-delivery-service:latest

# Verify image is in registry
curl http://localhost:5432/v2/data-delivery-service/tags/list

# Run from registry
docker run --rm -d \
  -p 3000:3000 \
  --name data-delivery \
  localhost:5432/data-delivery-service:latest
```

### Production Considerations

- Set `NODE_ENV=production`
- Use a reverse proxy (nginx/Apache)
- Configure proper SSL/TLS certificates
- Set up monitoring and logging
- Use environment variables for secrets
- Regular security updates
