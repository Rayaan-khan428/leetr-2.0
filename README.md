# Interview Prep Platform

A Next.js-based platform to help developers prepare for technical interviews.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Git

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd [repository-name]
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`

## Project Structure

- `/app` - Next.js 13+ app directory containing page components
- `/components` - Reusable UI components
- `/public` - Static assets including images
- `/styles` - Global styles and CSS modules

## Key Dependencies

- Next.js - React framework
- Shadcn UI - UI component library
- Lucide React - Icon library
- TypeScript - Type safety

## Development Notes

- The project uses the new Next.js App Router
- Components are built using TypeScript
- Styling is handled through Tailwind CSS
- Make sure to have the `/public/images/interview-prep.png` image file

## Common Issues & Solutions

1. If you see module not found errors, try:
   ```bash
   npm install
   # or
   yarn install
   ```

2. If the styles aren't loading properly, ensure Tailwind CSS is properly configured:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Need Help?

Contact the project maintainer for access to any additional resources or documentation.
