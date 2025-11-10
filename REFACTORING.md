# Refactoring: Next.js Full-Stack to Next.js Frontend + Nest.js Backend

This document describes the refactoring from a Next.js full-stack application to a separated frontend (Next.js) and backend (Nest.js) architecture.

## Architecture Overview

### Before
- **Next.js Full-Stack**: API routes in `app/api/` directory
- Frontend components making fetch calls to `/api/*` endpoints
- All logic in a single Next.js application

### After
- **Next.js Frontend**: Client-side only, renders UI components
- **Nest.js Backend**: Separate backend service handling all API logic
- Frontend communicates with backend via HTTP requests

## Project Structure

```
phine/
├── app/                    # Next.js frontend (pages and components)
│   ├── dashboards/
│   ├── playground/
│   └── protected/
├── lib/                    # Frontend utilities
│   └── api-client.ts      # API client for backend communication
├── backend/                # Nest.js backend
│   ├── src/
│   │   ├── api-keys/      # API keys module
│   │   ├── metrics/        # Metrics module
│   │   ├── github-summarizer/  # GitHub summarizer module
│   │   ├── validate/       # Validation module
│   │   └── supabase/       # Supabase service
│   └── package.json
└── package.json           # Frontend package.json
```

## Backend API Endpoints

The Nest.js backend exposes the following endpoints:

- `GET /api-keys` - List all API keys
- `POST /api-keys` - Create a new API key
- `GET /api-keys/:id` - Get API key by ID (masked)
- `GET /api-keys/:id/reveal` - Reveal full API key
- `PUT /api-keys/:id` - Update API key
- `DELETE /api-keys/:id` - Delete API key
- `GET /metrics` - Get API metrics
- `POST /validate` - Validate an API key
- `POST /github-summarizer` - GitHub summarizer endpoint

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (backend/.env)
```env
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Running the Application

### Development

1. **Start the backend:**
   ```bash
   cd backend
   yarn install
   yarn start:dev
   ```

2. **Start the frontend (in a separate terminal):**
   ```bash
   yarn install
   yarn dev
   ```

   Or use the convenience script:
   ```bash
   yarn dev:all  # Requires concurrently package
   ```

### Production

1. **Build and start the backend:**
   ```bash
   cd backend
   yarn build
   yarn start:prod
   ```

2. **Build and start the frontend:**
   ```bash
   yarn build
   yarn start
   ```

## Key Changes

### Frontend Changes

1. **API Client**: Created `lib/api-client.ts` to centralize all backend API calls
2. **Hooks Updated**: 
   - `use-api-keys.ts` - Now uses `apiClient` instead of direct fetch calls
   - `use-metrics.ts` - Now uses `apiClient` instead of direct fetch calls
3. **Pages Updated**: 
   - `app/protected/page.tsx` - Now uses `apiClient.validateApiKey()`
4. **Removed**: All Next.js API routes in `app/api/` directory

### Backend Changes

1. **Nest.js Structure**: Created modular Nest.js application with:
   - Controllers for handling HTTP requests
   - Services for business logic
   - DTOs for data validation
   - Modules for dependency injection

2. **Supabase Integration**: Moved all Supabase operations to `SupabaseService` in the backend

3. **CORS Configuration**: Enabled CORS to allow frontend to communicate with backend

## Migration Notes

- All API logic has been moved from Next.js API routes to Nest.js controllers
- The frontend no longer has direct access to Supabase (only the backend does)
- API client uses environment variable `NEXT_PUBLIC_API_URL` to determine backend URL
- Error handling is consistent across all endpoints

## Next Steps

1. Install backend dependencies: `cd backend && yarn install`
2. Set up environment variables for both frontend and backend
3. Start both services
4. Test all functionality to ensure everything works correctly

