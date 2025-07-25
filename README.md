# Recipe Sharing Platform

A modern recipe sharing platform built with Next.js, TypeScript, and Supabase.

## Features

- User authentication and authorization
- Create, edit, and delete recipes
- Browse all recipes
- User profiles
- Responsive design

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.local.example`)
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The platform uses the following main tables:
- `profiles`: User profile information
- `recipes`: Recipe data with ingredients and instructions

## Deployment

The application is deployed on Vercel and automatically updates when changes are pushed to the main branch.

---
*Last updated: December 2024*
