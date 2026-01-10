# Todo App Frontend

This is the frontend for the Todo application, built with Next.js 15, TypeScript, and Tailwind CSS.
It uses [Better Auth](https://www.better-auth.com/) for authentication and interacts with a FastAPI backend.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- User Authentication (Signup/Login)
- Task Management (Create, View, Update, Delete)
- Responsive Design with Tailwind CSS
- Secure API interactions

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable UI components
- `src/lib`: Shared utilities, API client, and auth configuration
- `src/types`: TypeScript type definitions
