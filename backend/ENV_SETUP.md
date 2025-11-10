# Backend Environment Variables Setup

The backend requires environment variables to connect to Supabase. Follow these steps:

## Step 1: Create `.env` file

Create a `.env` file in the `backend/` directory with the following content:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (secret) → Use for `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: The service_role key has admin access. Keep it secret and never commit it to version control!

## Step 3: Replace Placeholder Values

Replace the placeholder values in your `.env` file with your actual Supabase credentials.

## Example

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Verify Setup

After creating the `.env` file, restart the backend server:

```bash
cd backend
yarn start:dev
```

The server should start without the "Missing Supabase environment variables" error.

