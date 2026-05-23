export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
} as const;