# Environment Setup

This project uses environment variables for configuration. Follow these steps to set up your environment:

## 1. Create Environment File

Create a `.env` file in the root directory of the project:

```bash
# Copy the example file (if available)
cp .env.example .env

# Or create a new .env file
touch .env
```

## 2. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment
VITE_ENV=development
```

## 3. Environment Variables Reference

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | Base URL for API requests | `http://localhost:3000/api` |
| `VITE_ENV` | Application environment | `development` |

## 4. Important Notes

- **Vite Environment Variables**: All environment variables must be prefixed with `VITE_` to be accessible in the client-side code
- **Security**: Never commit `.env` files to version control (they are already in `.gitignore`)
- **Development vs Production**: Use different values for different environments

## 5. Production Setup

For production deployment, set the environment variables in your hosting platform:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_ENV=production
```

## 6. Local Development

For local development, you can use:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV=development
```

## 7. Verification

To verify your environment variables are working:

1. Start the development server: `npm run dev`
2. Check the browser console for any configuration errors
3. Verify API requests are going to the correct base URL 