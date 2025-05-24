# Sumails - Project Documentation

## Project Overview

**Sumails** is a Next.js-based web application that provides AI-powered email management and summarization services for busy professionals. The application connects to Gmail accounts and offers intelligent daily summaries, email organization, and cleanup suggestions to help users manage their email overload more effectively.

## Key Features

- **Smart Email Summaries**: AI-powered daily email summaries categorized by importance and urgency
- **Gmail Integration**: Secure connection to Gmail accounts via Google OAuth
- **Email Analytics**: Insights into email patterns and habits
- **Email Health Monitoring**: Track and improve email management practices
- **Multi-Account Support**: Manage multiple Gmail accounts from a single dashboard
- **Subscription Management**: Tiered pricing with different feature levels
- **Modern UI/UX**: Responsive design with dark/light mode support

## Technology Stack

### Frontend
- **Next.js 15.1.8** - React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.12.2** - Animation library
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **Next Themes** - Dark/light mode support

### Backend & APIs
- **Next.js API Routes** - Server-side functionality
- **Google APIs** - Gmail integration and authentication
- **Google Auth Library** - Secure OAuth implementation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast development builds

## Project Structure

```
sumails/
├── documentation/                    # Project documentation
│   ├── GMAIL_SETUP.md               # Gmail integration setup guide
│   └── PROJECT_OVERVIEW.md          # This documentation file
├── public/                          # Static assets
├── src/                            # Source code
│   ├── app/                        # Next.js App Router structure
│   │   ├── (main)/                 # Main marketing site group
│   │   │   ├── layout.tsx          # Marketing layout wrapper
│   │   │   └── page.tsx            # Landing page with components
│   │   ├── api/                    # API routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   │   ├── accounts/       # Account management
│   │   │   │   ├── callback/       # OAuth callback handling
│   │   │   │   └── url/            # Auth URL generation
│   │   │   └── emails/             # Email-related APIs
│   │   │       ├── summarize/      # Email summarization endpoint
│   │   │       └── route.ts        # General email operations
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── layout.tsx          # Auth layout
│   │   │   └── page.tsx            # Login/signup page
│   │   ├── dashboard/              # Main application dashboard
│   │   │   ├── layout.tsx          # Dashboard layout
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── connected-emails/   # Email account management
│   │   │   ├── email-analytics/    # Email usage analytics
│   │   │   ├── email-health/       # Email health insights
│   │   │   ├── settings/           # User settings
│   │   │   ├── subscription/       # Subscription management
│   │   │   └── today-summary/      # Daily email summaries
│   │   ├── favicon.ico             # App favicon
│   │   ├── globals.css             # Global styles and CSS variables
│   │   └── layout.tsx              # Root layout component
│   ├── components/                 # Reusable UI components
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── DashboardNavbar.tsx # Dashboard navigation
│   │   │   ├── ProfileFooter.tsx   # User profile footer
│   │   │   └── layout/             # Dashboard layout components
│   │   ├── dialogs/                # Modal dialogs
│   │   ├── layout/                 # Layout components
│   │   ├── ui/                     # Shadcn/UI components
│   │   │   ├── button.tsx          # Button component with variants
│   │   │   ├── dialog.tsx          # Modal dialog primitives
│   │   │   ├── input.tsx           # Form input component
│   │   │   └── switch.tsx          # Toggle switch component
│   │   ├── CTA.tsx                 # Call-to-action section
│   │   ├── FAQ.tsx                 # Frequently asked questions
│   │   ├── FeatureCard.tsx         # Individual feature card
│   │   ├── Features.tsx            # Features showcase section
│   │   ├── Hero.tsx                # Landing page hero section
│   │   ├── HowItWorks.tsx          # Process explanation section
│   │   ├── Pricing.tsx             # Pricing plans section
│   │   ├── ScrollToTop.tsx         # Scroll-to-top button
│   │   ├── TestimonialCard.tsx     # Individual testimonial card
│   │   ├── Testimonials.tsx        # Customer testimonials section
│   │   └── ThemeToggle.tsx         # Dark/light mode toggle
│   ├── config/                     # Configuration files
│   ├── constants/                  # Application constants
│   ├── contexts/                   # React contexts
│   ├── data/                       # Static data and content
│   ├── hooks/                      # Custom React hooks
│   │   └── usePageInfo.ts          # Page metadata and SEO hook
│   ├── lib/                        # Utility libraries
│   │   ├── google/                 # Google APIs integration
│   │   ├── json_handler.ts         # JSON processing utilities
│   │   └── utils.ts                # General utility functions
│   ├── providers/                  # React providers and wrappers
│   ├── types/                      # TypeScript type definitions
│   │   ├── auth.ts                 # Authentication types
│   │   └── email.ts                # Email-related types
│   └── utils/                      # Utility functions
├── components.json                  # Shadcn/UI configuration
├── eslint.config.mjs               # ESLint configuration
├── .eslintrc.json                  # Legacy ESLint config
├── .gitignore                      # Git ignore rules
├── next.config.ts                  # Next.js configuration
├── next-env.d.ts                   # Next.js TypeScript declarations
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Exact dependency versions
├── postcss.config.mjs              # PostCSS configuration
├── README.md                       # Basic project information
├── tailwind.config.ts              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

## Key Files and Their Purpose

### Core Application Files

#### `src/app/layout.tsx`
- Root layout component that wraps the entire application
- Sets up global providers, themes, and metadata
- Includes font loading and global styling

#### `src/app/(main)/page.tsx`
- Landing page that showcases the product
- Combines multiple marketing sections: Hero, Features, How It Works, Testimonials, Pricing, FAQ, and CTA
- Serves as the primary entry point for new users

#### `src/app/globals.css`
- Global CSS styles and custom properties
- Tailwind CSS base styles and utilities
- Custom animations and component styles
- CSS variables for theming and dark mode

### Authentication System

#### `src/app/auth/page.tsx`
- Authentication page for user login and signup
- Handles Google OAuth integration
- Redirects to dashboard after successful authentication

#### `src/app/api/auth/`
- **`accounts/`**: Manages user account operations
- **`callback/`**: Handles OAuth callback processing
- **`url/`**: Generates authentication URLs for OAuth flow

### Dashboard Application

#### `src/app/dashboard/page.tsx`
- Main dashboard interface after user login
- Provides overview of connected accounts and recent activities
- Navigation hub to other dashboard features

#### Dashboard Feature Pages:
- **`connected-emails/`**: Manage connected Gmail accounts
- **`email-analytics/`**: View email usage patterns and statistics
- **`email-health/`**: Monitor email management health and suggestions
- **`settings/`**: User preferences and account settings
- **`subscription/`**: Subscription plans and billing management
- **`today-summary/`**: Daily AI-generated email summaries

### Email Processing

#### `src/app/api/emails/route.ts`
- Main email processing endpoint
- Handles email fetching from Gmail API
- Processes and categorizes emails

#### `src/app/api/emails/summarize/`
- AI-powered email summarization service
- Generates intelligent summaries of email batches
- Categorizes emails by importance and urgency

### UI Components

#### Marketing Components
- **`Hero.tsx`**: Landing page hero with value proposition and product preview
- **`Features.tsx`**: Feature showcase with benefits and capabilities
- **`HowItWorks.tsx`**: Step-by-step process explanation
- **`Testimonials.tsx`**: Customer testimonials and social proof
- **`Pricing.tsx`**: Subscription plans and pricing tiers
- **`FAQ.tsx`**: Common questions and answers
- **`CTA.tsx`**: Call-to-action section encouraging signup

#### Dashboard Components
- **`DashboardNavbar.tsx`**: Navigation bar for dashboard pages
- **`ProfileFooter.tsx`**: User profile information and quick actions

#### UI System Components (`src/components/ui/`)
- Built with Shadcn/UI and Radix primitives
- **`button.tsx`**: Customizable button component with variants
- **`dialog.tsx`**: Modal dialog system
- **`input.tsx`**: Form input components
- **`switch.tsx`**: Toggle switch for settings

### Type Definitions

#### `src/types/auth.ts`
- User authentication interfaces
- OAuth token management types
- Session and account structures

#### `src/types/email.ts`
- Email message structures
- Gmail API response types
- Email categorization and metadata

### Utility Libraries

#### `src/lib/google/`
- Google APIs integration utilities
- Gmail API wrapper functions
- OAuth token management

#### `src/lib/utils.ts`
- General utility functions
- Class name merging utilities (cn function)
- Common helper functions

#### `src/hooks/usePageInfo.ts`
- Custom hook for page metadata management
- SEO and page title handling
- Dynamic page information updates

## Configuration Files

### `next.config.ts`
- Next.js framework configuration
- Build optimizations and feature flags
- Environment-specific settings

### `tailwind.config.ts`
- Tailwind CSS customization
- Custom color palette and design tokens
- Plugin configurations and extensions
- Animation and utility class definitions

### `components.json`
- Shadcn/UI component library configuration
- Component generation and customization settings
- Design system integration setup

### `tsconfig.json`
- TypeScript compiler configuration
- Path mapping and module resolution
- Strict type checking settings

## Development Workflow

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code analysis

### Key Development Features
- **Turbopack**: Fast development builds and hot reloading
- **TypeScript**: Full type safety and intellisense
- **ESLint**: Code quality and consistency enforcement
- **Tailwind CSS**: Utility-first styling with design system
- **Dark Mode**: Built-in theme switching capabilities

## Architecture Patterns

### Next.js App Router
- File-based routing system
- Server and client components
- Nested layouts and route groups
- API routes co-located with pages

### Component Architecture
- Functional components with TypeScript
- Custom hooks for reusable logic
- Context providers for global state
- Modular and composable design

### Styling Strategy
- Tailwind CSS for utility-first styling
- CSS custom properties for theming
- Component variants with class-variance-authority
- Responsive design with mobile-first approach

### State Management
- React hooks for local state
- Context API for global state
- Server state managed via API routes
- Form state with controlled components

## Security Considerations

### Authentication
- Google OAuth 2.0 implementation
- Secure token storage and management
- Session-based authentication
- Protected route middleware

### API Security
- Server-side API route protection
- Input validation and sanitization
- Error handling without information leakage
- CORS and security headers

## Future Enhancements

Based on the current structure, the application is designed to support:
- AI-powered email summarization and categorization
- Multi-provider email integration (beyond Gmail)
- Advanced analytics and insights
- Email automation and rules
- Team collaboration features
- Mobile applications (React Native compatibility)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables for Google OAuth
4. Configure Gmail API credentials (see `GMAIL_SETUP.md`)
5. Run development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

For detailed Gmail integration setup, refer to `documentation/GMAIL_SETUP.md`. 