# Sumails - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Folder Structure & Guidelines](#folder-structure--guidelines)
5. [Naming Conventions](#naming-conventions)
6. [Development Standards](#development-standards)
7. [Component Architecture](#component-architecture)
8. [State Management Strategy](#state-management-strategy)
9. [API Design Patterns](#api-design-patterns)
10. [Testing Strategy](#testing-strategy)
11. [Security Guidelines](#security-guidelines)
12. [Performance Optimization](#performance-optimization)
13. [Deployment & DevOps](#deployment--devops)
14. [Future Roadmap](#future-roadmap)

## Project Overview

**Sumails** is a modern, AI-powered email management platform built with Next.js 15 and React 19. It helps busy professionals manage email overload through intelligent summarization, categorization, and analytics. The application provides secure Gmail integration, daily email digests, and actionable insights to improve email productivity.

### Core Value Propositions
- **AI-Powered Intelligence**: Smart email summarization and categorization using OpenAI
- **Gmail Integration**: Secure, OAuth-based connection to Gmail accounts
- **Daily Digests**: Automated email summaries delivered daily
- **Email Analytics**: Insights into email patterns and productivity metrics
- **Multi-Account Support**: Manage multiple Gmail accounts from a unified dashboard
- **Modern UX**: Responsive design with accessibility-first approach

### Target Users
- **Primary**: Busy professionals receiving 50+ emails daily
- **Secondary**: Small business owners and entrepreneurs
- **Tertiary**: Anyone seeking better email organization

## Technology Stack

### Frontend Framework
- **Next.js 15.1.8** - React framework with App Router and Server Components
- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript 5** - Full type safety and enhanced developer experience

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Shadcn/UI** - Accessible, customizable component library
- **Radix UI** - Low-level UI primitives for accessibility
- **Framer Motion 12.12.2** - Animation library for smooth interactions
- **Lucide React** - Consistent icon system
- **Next Themes** - Dark/light mode with system preference support

### Backend & APIs
- **Next.js API Routes** - Server-side functionality with edge runtime support
- **Google APIs** - Gmail integration and data fetching
- **Google Auth Library** - Secure OAuth 2.0 implementation
- **OpenAI API** - AI-powered email summarization and analysis

### Data & Validation
- **Zod** - Runtime type validation and schema parsing
- **Nanoid** - URL-safe unique identifier generation

### Development Tools
- **ESLint** - Code linting with Next.js optimized rules
- **PostCSS** - CSS processing and optimization
- **Turbopack** - Fast development builds and hot module replacement

### Monitoring & Notifications
- **Sonner** - Toast notifications with accessibility support

## Project Architecture

### Next.js App Router Structure
The project uses the modern App Router with Server Components by default, utilizing Client Components only when necessary for interactivity.

#### Route Groups
- **`(main)`** - Marketing site and landing pages
- **`dashboard`** - Authenticated application features
- **`auth`** - Authentication and onboarding flows

#### Server vs Client Components
- **Server Components** (Default): Data fetching, layouts, static content
- **Client Components** (`'use client'`): Interactive forms, state management, browser APIs

### Component Architecture Patterns
- **Composition over Inheritance**: Build complex UIs from simple, reusable components
- **Props Drilling Avoidance**: Use React Context for shared state
- **Single Responsibility**: Each component has one clear purpose
- **Accessibility First**: ARIA attributes and semantic HTML by default

## Folder Structure & Guidelines

```
sumails/
├── documentation/                           # Project documentation
│   ├── PROJECT_OVERVIEW.md                # This comprehensive guide
│   ├── GMAIL_SETUP.md                     # Gmail API integration guide
│   ├── DEPLOYMENT.md                      # Deployment instructions
│   └── API_REFERENCE.md                   # API endpoint documentation
├── public/                                 # Static assets
│   ├── images/                            # Image assets (WebP preferred)
│   ├── icons/                             # App icons and favicons
│   └── manifest.json                      # PWA manifest
├── src/                                   # Source code
│   ├── app/                              # Next.js App Router
│   │   ├── (main)/                       # Marketing site route group
│   │   │   ├── layout.tsx                # Marketing layout wrapper
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── about/                    # About page
│   │   │   ├── privacy/                  # Privacy policy
│   │   │   └── terms/                    # Terms of service
│   │   ├── api/                          # API routes
│   │   │   ├── auth/                     # Authentication endpoints
│   │   │   │   ├── accounts/             # Account management
│   │   │   │   ├── callback/             # OAuth callbacks
│   │   │   │   └── url/                  # Auth URL generation
│   │   │   ├── emails/                   # Email operations
│   │   │   │   ├── route.ts              # CRUD operations
│   │   │   │   └── summarize/            # AI summarization
│   │   │   ├── digests/                  # Daily digest generation
│   │   │   ├── processing-log/           # Email processing logs
│   │   │   └── migration/                # Data migration endpoints
│   │   ├── auth/                         # Authentication pages
│   │   │   ├── layout.tsx                # Auth layout
│   │   │   ├── page.tsx                  # Login/signup
│   │   │   ├── callback/                 # OAuth callback handling
│   │   │   └── error/                    # Auth error handling
│   │   ├── dashboard/                    # Main application
│   │   │   ├── layout.tsx                # Dashboard layout
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── today-summary/            # Daily email summaries
│   │   │   ├── connected-emails/         # Email account management
│   │   │   ├── email-analytics/          # Usage analytics
│   │   │   ├── email-health/             # Email health insights
│   │   │   ├── settings/                 # User preferences
│   │   │   └── subscription/             # Billing management
│   │   ├── globals.css                   # Global styles
│   │   ├── layout.tsx                    # Root layout
│   │   └── not-found.tsx                 # 404 page
│   ├── components/                        # Reusable UI components
│   │   ├── ui/                           # Base UI components (Shadcn/UI)
│   │   │   ├── button.tsx                # Button with variants
│   │   │   ├── input.tsx                 # Form inputs
│   │   │   ├── dialog.tsx                # Modal dialogs
│   │   │   ├── switch.tsx                # Toggle switches
│   │   │   ├── card.tsx                  # Card container
│   │   │   ├── badge.tsx                 # Status badges
│   │   │   └── toast.tsx                 # Notification toasts
│   │   ├── layout/                       # Layout components
│   │   │   ├── header.tsx                # Site header
│   │   │   ├── footer.tsx                # Site footer
│   │   │   ├── sidebar.tsx               # Dashboard sidebar
│   │   │   └── navigation.tsx            # Navigation menus
│   │   ├── dashboard/                    # Dashboard-specific components
│   │   │   ├── dashboard-navbar.tsx      # Dashboard navigation
│   │   │   ├── profile-footer.tsx        # User profile section
│   │   │   ├── email-summary-card.tsx    # Email summary display
│   │   │   ├── analytics-chart.tsx       # Data visualization
│   │   │   └── account-switcher.tsx      # Multi-account selector
│   │   ├── forms/                        # Form components
│   │   │   ├── contact-form.tsx          # Contact form
│   │   │   ├── settings-form.tsx         # User settings
│   │   │   └── subscription-form.tsx     # Billing forms
│   │   ├── dialogs/                      # Modal dialogs
│   │   │   ├── confirmation-dialog.tsx   # Confirmation modals
│   │   │   ├── email-preview-dialog.tsx  # Email preview
│   │   │   └── account-setup-dialog.tsx  # Account setup
│   │   ├── Hero.tsx                      # Landing page hero
│   │   ├── Features.tsx                  # Features showcase
│   │   ├── HowItWorks.tsx               # Process explanation
│   │   ├── Testimonials.tsx             # Customer testimonials
│   │   ├── Pricing.tsx                   # Pricing plans
│   │   ├── FAQ.tsx                       # Frequently asked questions
│   │   ├── CTA.tsx                       # Call-to-action sections
│   │   ├── ThemeToggle.tsx              # Dark/light mode toggle
│   │   └── ScrollToTop.tsx              # Scroll-to-top button
│   ├── lib/                              # Utility libraries
│   │   ├── google/                       # Google APIs integration
│   │   │   ├── auth.ts                   # OAuth utilities
│   │   │   ├── gmail.ts                  # Gmail API wrapper
│   │   │   └── types.ts                  # Google API types
│   │   ├── openai/                       # OpenAI integration
│   │   │   ├── client.ts                 # OpenAI client setup
│   │   │   ├── prompts.ts                # AI prompts library
│   │   │   └── summarizer.ts             # Email summarization
│   │   ├── database/                     # Database utilities
│   │   │   ├── connection.ts             # DB connection
│   │   │   ├── models.ts                 # Data models
│   │   │   └── migrations.ts             # Schema migrations
│   │   ├── validations/                  # Zod schemas
│   │   │   ├── auth.ts                   # Auth validation
│   │   │   ├── email.ts                  # Email validation
│   │   │   └── user.ts                   # User data validation
│   │   ├── utils.ts                      # General utilities
│   │   ├── constants.ts                  # App constants
│   │   └── json-handler.ts               # JSON processing
│   ├── hooks/                            # Custom React hooks
│   │   ├── use-page-info.ts              # Page metadata hook
│   │   ├── use-local-storage.ts          # Local storage hook
│   │   ├── use-debounce.ts               # Debouncing hook
│   │   ├── use-auth.ts                   # Authentication hook
│   │   ├── use-email-data.ts             # Email data fetching
│   │   └── use-intersection-observer.ts   # Intersection observer
│   ├── contexts/                         # React contexts
│   │   ├── auth-context.tsx              # Authentication context
│   │   ├── email-context.tsx             # Email data context
│   │   └── theme-context.tsx             # Theme context
│   ├── providers/                        # Context providers
│   │   ├── auth-provider.tsx             # Auth provider wrapper
│   │   ├── query-provider.tsx            # React Query provider
│   │   └── theme-provider.tsx            # Theme provider
│   ├── types/                            # TypeScript definitions
│   │   ├── auth.ts                       # Authentication types
│   │   ├── email.ts                      # Email-related types
│   │   ├── user.ts                       # User data types
│   │   ├── api.ts                        # API response types
│   │   └── global.ts                     # Global type definitions
│   ├── config/                           # Configuration files
│   │   ├── database.ts                   # Database configuration
│   │   ├── auth.ts                       # Auth configuration
│   │   ├── api.ts                        # API configuration
│   │   └── constants.ts                  # App-wide constants
│   ├── data/                             # Static data
│   │   ├── testimonials.ts               # Customer testimonials
│   │   ├── features.ts                   # Feature descriptions
│   │   ├── pricing-plans.ts              # Pricing tiers
│   │   └── faq-items.ts                  # FAQ content
│   └── utils/                            # Utility functions
│       ├── email-helpers.ts              # Email processing utilities
│       ├── date-helpers.ts               # Date formatting utilities
│       ├── string-helpers.ts             # String manipulation
│       └── validation-helpers.ts         # Custom validation
├── tests/                                # Test files
│   ├── __mocks__/                        # Mock implementations
│   ├── components/                       # Component tests
│   ├── hooks/                            # Hook tests
│   ├── lib/                              # Utility tests
│   └── api/                              # API tests
├── .env.local.example                    # Environment variables template
├── .env.local                            # Local environment variables
├── .gitignore                            # Git ignore rules
├── README.md                             # Basic project information
├── package.json                          # Dependencies and scripts
├── next.config.ts                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── tsconfig.json                         # TypeScript configuration
├── eslint.config.mjs                     # ESLint configuration
├── postcss.config.mjs                    # PostCSS configuration
└── components.json                       # Shadcn/UI configuration
```

### Folder Guidelines

#### `/src/app/` - Next.js App Router
- **Purpose**: File-based routing and server-side functionality
- **Structure**: Route groups, layouts, pages, and API routes
- **Files**: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`

#### `/src/components/` - React Components
- **Purpose**: Reusable UI components organized by category
- **Structure**: Hierarchical organization from generic to specific
- **Files**: PascalCase component files with `.tsx` extension

#### `/src/lib/` - Utility Libraries
- **Purpose**: External service integrations and complex utilities
- **Structure**: Organized by service or functionality domain
- **Files**: Functional modules with clear interfaces

#### `/src/hooks/` - Custom React Hooks
- **Purpose**: Reusable stateful logic and side effects
- **Structure**: One hook per file with descriptive names
- **Files**: Prefixed with `use-` and kebab-case naming

#### `/src/types/` - TypeScript Definitions
- **Purpose**: Centralized type definitions and interfaces
- **Structure**: Organized by feature or data domain
- **Files**: Descriptive names matching the data they describe

#### `/src/config/` - Configuration
- **Purpose**: Application configuration and environment setup
- **Structure**: Separate files for different configuration domains
- **Files**: Environment-specific and feature-specific configs

## Naming Conventions

### Files and Directories

#### Directories
- **Format**: `kebab-case`
- **Examples**: `email-analytics`, `user-settings`, `auth-providers`
- **Rule**: Use descriptive, multi-word names with hyphens

#### React Components
- **Format**: `PascalCase.tsx`
- **Examples**: `EmailSummaryCard.tsx`, `DashboardNavbar.tsx`, `UserProfileForm.tsx`
- **Rule**: Clear, descriptive names that indicate component purpose

#### Utility Files
- **Format**: `kebab-case.ts`
- **Examples**: `email-helpers.ts`, `date-formatters.ts`, `api-client.ts`
- **Rule**: Descriptive names ending with purpose (helpers, utils, constants)

#### Hook Files
- **Format**: `use-kebab-case.ts`
- **Examples**: `use-email-data.ts`, `use-local-storage.ts`, `use-auth.ts`
- **Rule**: Always start with `use-` prefix followed by descriptive name

#### Type Files
- **Format**: `kebab-case.ts`
- **Examples**: `auth-types.ts`, `email-data.ts`, `api-responses.ts`
- **Rule**: Domain-specific names ending with purpose when needed

### Code Elements

#### Variables and Functions
- **Format**: `camelCase`
- **Examples**: `emailSummary`, `getUserData`, `isAuthenticated`
- **Rule**: Descriptive names starting with lowercase letter

#### Constants
- **Format**: `UPPER_SNAKE_CASE`
- **Examples**: `API_BASE_URL`, `MAX_EMAIL_COUNT`, `DEFAULT_TIMEOUT`
- **Rule**: All uppercase with underscores for word separation

#### Interfaces and Types
- **Format**: `PascalCase`
- **Examples**: `EmailSummary`, `UserProfile`, `AuthState`
- **Rule**: Clear, descriptive names without prefixes

#### React Components
- **Format**: `PascalCase`
- **Examples**: `EmailCard`, `NavigationMenu`, `SettingsPanel`
- **Rule**: Noun-based names describing what the component represents

#### Event Handlers
- **Format**: `handle + Action + Target`
- **Examples**: `handleClickSubmit`, `handleChangeEmail`, `handleDeleteAccount`
- **Rule**: Always start with `handle` followed by action and target

#### Boolean Variables
- **Format**: Verb + Subject
- **Examples**: `isLoading`, `hasError`, `canSubmit`, `shouldRefresh`
- **Rule**: Use verbs that clearly indicate true/false states

#### Custom Hooks
- **Format**: `use + PascalCase`
- **Examples**: `useEmailData`, `useAuthentication`, `useLocalStorage`
- **Rule**: Always start with `use` followed by descriptive name

### CSS and Styling

#### CSS Classes (when not using Tailwind)
- **Format**: `kebab-case`
- **Examples**: `email-card`, `navigation-menu`, `user-avatar`
- **Rule**: Component-based naming with BEM methodology

#### CSS Custom Properties
- **Format**: `--kebab-case`
- **Examples**: `--primary-color`, `--border-radius`, `--font-size-lg`
- **Rule**: Semantic names describing purpose or value

#### Tailwind Custom Classes
- **Format**: `kebab-case`
- **Examples**: `btn-primary`, `card-elevated`, `text-muted`
- **Rule**: Utility-focused names that extend Tailwind's system

## Development Standards

### Code Quality Standards

#### TypeScript Guidelines
```typescript
// ✅ Good: Clear interface definition
interface EmailSummaryProps {
	emails: Email[]
	dateRange: DateRange
	onRefresh: () => void
	isLoading?: boolean
}

// ✅ Good: Proper type guards
function isValidEmail(email: unknown): email is Email {
	return typeof email === 'object' && 
		   email !== null && 
		   'id' in email && 
		   'subject' in email
}

// ✅ Good: Generic utility types
type ApiResponse<T> = {
	data: T
	error?: string
	timestamp: Date
}

// ❌ Bad: Any types
function processData(data: any): any {
	return data.something
}
```

#### Component Structure
```typescript
// ✅ Good: Proper component structure
interface EmailCardProps {
	email: Email
	isSelected: boolean
	onSelect: (id: string) => void
	onDelete: (id: string) => void
}

function EmailCard({ 
	email, 
	isSelected, 
	onSelect, 
	onDelete 
}: EmailCardProps) {
	const handleClick = () => onSelect(email.id)
	const handleDelete = () => onDelete(email.id)

	return (
		<div 
			className={cn(
				'email-card',
				isSelected && 'email-card--selected'
			)}
			onClick={handleClick}
		>
			{/* Component content */}
		</div>
	)
}

export default EmailCard
```

#### Error Handling
```typescript
// ✅ Good: Proper error handling
try {
	const response = await fetchEmails()
	return response.data
} catch (error) {
	if (error instanceof ApiError) {
		console.error('API Error:', error.message)
		throw new Error(`Failed to fetch emails: ${error.message}`)
	}
	
	console.error('Unexpected error:', error)
	throw new Error('An unexpected error occurred')
}

// ✅ Good: Error boundaries
function EmailListErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<ErrorBoundary
			fallback={<EmailListError />}
			onError={(error) => logError('EmailList', error)}
		>
			{children}
		</ErrorBoundary>
	)
}
```

### Performance Standards

#### React Performance
```typescript
// ✅ Good: Memoized components
const EmailCard = React.memo(({ email, onSelect }: EmailCardProps) => {
	const handleSelect = useCallback(() => {
		onSelect(email.id)
	}, [email.id, onSelect])

	return <div onClick={handleSelect}>{email.subject}</div>
})

// ✅ Good: Optimized lists
function EmailList({ emails }: EmailListProps) {
	const emailElements = useMemo(() => 
		emails.map(email => (
			<EmailCard key={email.id} email={email} />
		)), 
		[emails]
	)

	return <div>{emailElements}</div>
}
```

#### Bundle Optimization
```typescript
// ✅ Good: Code splitting
const EmailAnalytics = dynamic(() => import('../components/EmailAnalytics'), {
	loading: () => <AnalyticsLoader />,
	ssr: false
})

// ✅ Good: Tree shaking
import { formatDate } from '@/lib/date-helpers'
import { validateEmail } from '@/lib/validation-helpers'
```

### Accessibility Standards

#### Semantic HTML
```tsx
// ✅ Good: Semantic structure
<main>
	<header>
		<h1>Email Dashboard</h1>
		<nav aria-label="Dashboard navigation">
			<ul>
				<li><a href="/dashboard">Overview</a></li>
				<li><a href="/emails">Emails</a></li>
			</ul>
		</nav>
	</header>
	
	<section aria-labelledby="email-summary">
		<h2 id="email-summary">Today's Summary</h2>
		{/* Content */}
	</section>
</main>
```

#### ARIA Attributes
```tsx
// ✅ Good: Proper ARIA usage
<button
	aria-expanded={isOpen}
	aria-controls="email-menu"
	aria-label="Email actions menu"
	onClick={handleToggle}
>
	Actions
</button>

<div
	id="email-menu"
	role="menu"
	aria-hidden={!isOpen}
>
	{/* Menu items */}
</div>
```

#### Keyboard Navigation
```tsx
// ✅ Good: Keyboard support
function EmailCard({ email, onSelect }: EmailCardProps) {
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onSelect(email.id)
		}
	}

	return (
		<div
			tabIndex={0}
			role="button"
			onKeyDown={handleKeyDown}
			onClick={() => onSelect(email.id)}
		>
			{email.subject}
		</div>
	)
}
```

## Component Architecture

### Component Hierarchy

#### Base Components (`/src/components/ui/`)
- **Purpose**: Fundamental, reusable UI primitives
- **Examples**: Button, Input, Card, Dialog
- **Rules**: No business logic, highly configurable, accessible by default

#### Layout Components (`/src/components/layout/`)
- **Purpose**: Structural components for page organization
- **Examples**: Header, Footer, Sidebar, Navigation
- **Rules**: Composition-focused, responsive, consistent spacing

#### Feature Components (`/src/components/dashboard/`)
- **Purpose**: Domain-specific components with business logic
- **Examples**: EmailSummaryCard, AnalyticsChart, AccountSwitcher
- **Rules**: Self-contained, data-aware, feature-complete

#### Page Components (`/src/app/`)
- **Purpose**: Top-level page containers and layouts
- **Examples**: Dashboard, Settings, EmailAnalytics
- **Rules**: Server Components by default, handle data fetching

### Component Composition Patterns

#### Compound Components
```tsx
// ✅ Good: Compound component pattern
function EmailCard({ children }: { children: React.ReactNode }) {
	return <div className="email-card">{children}</div>
}

function EmailCardHeader({ children }: { children: React.ReactNode }) {
	return <header className="email-card__header">{children}</header>
}

function EmailCardContent({ children }: { children: React.ReactNode }) {
	return <div className="email-card__content">{children}</div>
}

function EmailCardActions({ children }: { children: React.ReactNode }) {
	return <footer className="email-card__actions">{children}</footer>
}

EmailCard.Header = EmailCardHeader
EmailCard.Content = EmailCardContent
EmailCard.Actions = EmailCardActions

// Usage
<EmailCard>
	<EmailCard.Header>
		<h3>{email.subject}</h3>
		<span>{email.from}</span>
	</EmailCard.Header>
	<EmailCard.Content>
		{email.preview}
	</EmailCard.Content>
	<EmailCard.Actions>
		<Button onClick={handleArchive}>Archive</Button>
		<Button onClick={handleDelete}>Delete</Button>
	</EmailCard.Actions>
</EmailCard>
```

#### Render Props Pattern
```tsx
// ✅ Good: Render props for flexible data sharing
interface EmailListProps {
	emails: Email[]
	children: (props: {
		emails: Email[]
		selectedEmails: string[]
		onSelectEmail: (id: string) => void
		onSelectAll: () => void
	}) => React.ReactNode
}

function EmailList({ emails, children }: EmailListProps) {
	const [selectedEmails, setSelectedEmails] = useState<string[]>([])
	
	const handleSelectEmail = (id: string) => {
		setSelectedEmails(prev => 
			prev.includes(id) 
				? prev.filter(emailId => emailId !== id)
				: [...prev, id]
		)
	}
	
	const handleSelectAll = () => {
		setSelectedEmails(
			selectedEmails.length === emails.length 
				? [] 
				: emails.map(email => email.id)
		)
	}
	
	return children({
		emails,
		selectedEmails,
		onSelectEmail: handleSelectEmail,
		onSelectAll: handleSelectAll
	})
}
```

#### Custom Hooks for Logic Separation
```tsx
// ✅ Good: Custom hook for email selection logic
function useEmailSelection(emails: Email[]) {
	const [selectedEmails, setSelectedEmails] = useState<string[]>([])
	
	const selectEmail = useCallback((id: string) => {
		setSelectedEmails(prev => 
			prev.includes(id) 
				? prev.filter(emailId => emailId !== id)
				: [...prev, id]
		)
	}, [])
	
	const selectAll = useCallback(() => {
		setSelectedEmails(
			selectedEmails.length === emails.length 
				? [] 
				: emails.map(email => email.id)
		)
	}, [emails, selectedEmails.length])
	
	const clearSelection = useCallback(() => {
		setSelectedEmails([])
	}, [])
	
	return {
		selectedEmails,
		selectEmail,
		selectAll,
		clearSelection,
		isAllSelected: selectedEmails.length === emails.length,
		selectedCount: selectedEmails.length
	}
}

// Usage in component
function EmailDashboard() {
	const { emails, isLoading } = useEmailData()
	const emailSelection = useEmailSelection(emails)
	
	if (isLoading) return <EmailListSkeleton />
	
	return (
		<div>
			<EmailListHeader {...emailSelection} />
			<EmailList 
				emails={emails} 
				selectedEmails={emailSelection.selectedEmails}
				onSelectEmail={emailSelection.selectEmail}
			/>
		</div>
	)
}
```

## State Management Strategy

### Local State Management

#### useState for Simple State
```tsx
// ✅ Good: useState for component-level state
function EmailForm() {
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)
		
		try {
			await sendEmail(email)
			setEmail('')
		} catch (error) {
			setError('Failed to send email')
		} finally {
			setIsSubmitting(false)
		}
	}
	
	return (
		<form onSubmit={handleSubmit}>
			<input 
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				disabled={isSubmitting}
			/>
			{error && <p className="error">{error}</p>}
			<button disabled={isSubmitting}>Send</button>
		</form>
	)
}
```

#### useReducer for Complex State
```tsx
// ✅ Good: useReducer for complex state logic
interface EmailFilterState {
	searchTerm: string
	selectedCategories: string[]
	dateRange: DateRange
	sortBy: SortOption
	isLoading: boolean
}

type EmailFilterAction = 
	| { type: 'SET_SEARCH_TERM'; payload: string }
	| { type: 'TOGGLE_CATEGORY'; payload: string }
	| { type: 'SET_DATE_RANGE'; payload: DateRange }
	| { type: 'SET_SORT_BY'; payload: SortOption }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'RESET_FILTERS' }

function emailFilterReducer(
	state: EmailFilterState, 
	action: EmailFilterAction
): EmailFilterState {
	switch (action.type) {
		case 'SET_SEARCH_TERM':
			return { ...state, searchTerm: action.payload }
		case 'TOGGLE_CATEGORY':
			return {
				...state,
				selectedCategories: state.selectedCategories.includes(action.payload)
					? state.selectedCategories.filter(cat => cat !== action.payload)
					: [...state.selectedCategories, action.payload]
			}
		case 'RESET_FILTERS':
			return initialEmailFilterState
		default:
			return state
	}
}

function useEmailFilters() {
	const [state, dispatch] = useReducer(emailFilterReducer, initialEmailFilterState)
	
	const setSearchTerm = useCallback((searchTerm: string) => {
		dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm })
	}, [])
	
	const toggleCategory = useCallback((category: string) => {
		dispatch({ type: 'TOGGLE_CATEGORY', payload: category })
	}, [])
	
	return {
		...state,
		setSearchTerm,
		toggleCategory,
		resetFilters: () => dispatch({ type: 'RESET_FILTERS' })
	}
}
```

### Global State Management

#### React Context for Shared State
```tsx
// ✅ Good: Context for authentication state
interface AuthContextValue {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (credentials: LoginCredentials) => Promise<void>
	logout: () => Promise<void>
	updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	
	useEffect(() => {
		// Initialize auth state
		initializeAuth().then(setUser).finally(() => setIsLoading(false))
	}, [])
	
	const login = useCallback(async (credentials: LoginCredentials) => {
		setIsLoading(true)
		try {
			const user = await authenticateUser(credentials)
			setUser(user)
		} finally {
			setIsLoading(false)
		}
	}, [])
	
	const logout = useCallback(async () => {
		await logoutUser()
		setUser(null)
	}, [])
	
	const value = useMemo(() => ({
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		updateProfile: async (updates: Partial<User>) => {
			if (user) {
				const updatedUser = await updateUserProfile(user.id, updates)
				setUser(updatedUser)
			}
		}
	}), [user, isLoading, login, logout])
	
	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
```

#### Zustand for Complex Global State (Future Enhancement)
```tsx
// ✅ Future: Zustand store for email state
interface EmailStore {
	emails: Email[]
	selectedEmailIds: string[]
	filters: EmailFilters
	isLoading: boolean
	
	// Actions
	setEmails: (emails: Email[]) => void
	addEmail: (email: Email) => void
	updateEmail: (id: string, updates: Partial<Email>) => void
	deleteEmail: (id: string) => void
	selectEmail: (id: string) => void
	clearSelection: () => void
	updateFilters: (filters: Partial<EmailFilters>) => void
	setLoading: (isLoading: boolean) => void
}

const useEmailStore = create<EmailStore>((set, get) => ({
	emails: [],
	selectedEmailIds: [],
	filters: defaultEmailFilters,
	isLoading: false,
	
	setEmails: (emails) => set({ emails }),
	addEmail: (email) => set((state) => ({ 
		emails: [...state.emails, email] 
	})),
	updateEmail: (id, updates) => set((state) => ({
		emails: state.emails.map(email => 
			email.id === id ? { ...email, ...updates } : email
		)
	})),
	deleteEmail: (id) => set((state) => ({
		emails: state.emails.filter(email => email.id !== id),
		selectedEmailIds: state.selectedEmailIds.filter(emailId => emailId !== id)
	})),
	selectEmail: (id) => set((state) => ({
		selectedEmailIds: state.selectedEmailIds.includes(id)
			? state.selectedEmailIds.filter(emailId => emailId !== id)
			: [...state.selectedEmailIds, id]
	})),
	clearSelection: () => set({ selectedEmailIds: [] }),
	updateFilters: (filters) => set((state) => ({
		filters: { ...state.filters, ...filters }
	})),
	setLoading: (isLoading) => set({ isLoading })
}))
```

## API Design Patterns

### Next.js API Route Structure

#### RESTful API Design
```typescript
// ✅ Good: RESTful API routes structure
// GET /api/emails - List emails
// POST /api/emails - Create email
// GET /api/emails/[id] - Get specific email
// PUT /api/emails/[id] - Update email
// DELETE /api/emails/[id] - Delete email

// src/app/api/emails/route.ts
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const category = searchParams.get('category')
		
		const emails = await getEmails({
			page,
			limit,
			category: category || undefined
		})
		
		return Response.json({
			data: emails,
			pagination: {
				page,
				limit,
				total: emails.length
			}
		})
	} catch (error) {
		console.error('Error fetching emails:', error)
		return Response.json(
			{ error: 'Failed to fetch emails' },
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const validatedData = createEmailSchema.parse(body)
		
		const email = await createEmail(validatedData)
		
		return Response.json(
			{ data: email },
			{ status: 201 }
		)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json(
				{ error: 'Invalid request data', details: error.errors },
				{ status: 400 }
			)
		}
		
		console.error('Error creating email:', error)
		return Response.json(
			{ error: 'Failed to create email' },
			{ status: 500 }
		)
	}
}
```

#### Error Handling Patterns
```typescript
// ✅ Good: Centralized error handling
class ApiError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string
	) {
		super(message)
		this.name = 'ApiError'
	}
}

function withErrorHandling<T extends any[], R>(
	handler: (...args: T) => Promise<Response>
) {
	return async (...args: T): Promise<Response> => {
		try {
			return await handler(...args)
		} catch (error) {
			console.error('API Error:', error)
			
			if (error instanceof ApiError) {
				return Response.json(
					{ 
						error: error.message,
						code: error.code 
					},
					{ status: error.statusCode }
				)
			}
			
			if (error instanceof z.ZodError) {
				return Response.json(
					{ 
						error: 'Validation failed',
						details: error.errors 
					},
					{ status: 400 }
				)
			}
			
			return Response.json(
				{ error: 'Internal server error' },
				{ status: 500 }
			)
		}
	}
}

// Usage
export const GET = withErrorHandling(async (request: Request) => {
	const emails = await getEmails()
	return Response.json({ data: emails })
})
```

#### Request Validation
```typescript
// ✅ Good: Zod validation schemas
import { z } from 'zod'

const createEmailSchema = z.object({
	to: z.string().email().transform(email => email.toLowerCase().trim()),
	subject: z.string()
		.min(1, 'Subject is required')
		.max(200, 'Subject too long')
		.transform(subject => DOMPurify.sanitize(subject)),
	body: z.string()
		.min(1, 'Body is required')
		.max(10000, 'Body too long')
		.transform(body => DOMPurify.sanitize(body, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em'] })),
	attachments: z.array(z.object({
		name: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename'),
		type: z.string().regex(/^[a-zA-Z0-9\/.-]+$/, 'Invalid file type'),
		size: z.number().positive().max(10 * 1024 * 1024, 'File too large') // 10MB max
	})).optional()
})

const updateEmailSchema = createEmailSchema.partial()

const emailQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	category: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['date', 'subject', 'sender']).default('date'),
	sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Usage in API route
export async function POST(request: Request) {
	const body = await request.json()
	const validatedData = createEmailSchema.parse(body)
	
	// Process validated data
	const email = await createEmail(validatedData)
	return Response.json({ data: email })
}
```

### Client-Side API Communication

#### API Client Pattern
```typescript
// ✅ Good: Centralized API client
class ApiClient {
	private baseUrl: string
	
	constructor(baseUrl: string = '/api') {
		this.baseUrl = baseUrl
	}
	
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`
		
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		})
		
		if (!response.ok) {
			const error = await response.json()
			throw new ApiError(error.message || 'Request failed', response.status)
		}
		
		return response.json()
	}
	
	// Email endpoints
	async getEmails(params: EmailQueryParams = {}): Promise<EmailListResponse> {
		const searchParams = new URLSearchParams(
			Object.entries(params).map(([key, value]) => [key, String(value)])
		)
		
		return this.request(`/emails?${searchParams}`)
	}
	
	async getEmail(id: string): Promise<EmailResponse> {
		return this.request(`/emails/${id}`)
	}
	
	async createEmail(data: CreateEmailData): Promise<EmailResponse> {
		return this.request('/emails', {
			method: 'POST',
			body: JSON.stringify(data)
		})
	}
	
	async updateEmail(id: string, data: UpdateEmailData): Promise<EmailResponse> {
		return this.request(`/emails/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	}
	
	async deleteEmail(id: string): Promise<void> {
		return this.request(`/emails/${id}`, {
			method: 'DELETE'
		})
	}
}

export const apiClient = new ApiClient()
```

#### React Query Integration (Future Enhancement)
```typescript
// ✅ Future: React Query hooks for data fetching
function useEmails(params: EmailQueryParams = {}) {
	return useQuery({
		queryKey: ['emails', params],
		queryFn: () => apiClient.getEmails(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000 // 10 minutes
	})
}

function useEmail(id: string) {
	return useQuery({
		queryKey: ['email', id],
		queryFn: () => apiClient.getEmail(id),
		enabled: !!id
	})
}

function useCreateEmail() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (data: CreateEmailData) => apiClient.createEmail(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['emails'] })
		}
	})
}

function useUpdateEmail() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmailData }) => 
			apiClient.updateEmail(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['emails'] })
			queryClient.invalidateQueries({ queryKey: ['email', id] })
		}
	})
}
```

## Testing Strategy

### Testing Framework Setup

#### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
	dir: './'
})

const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapping: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	collectCoverageFrom: [
		'src/**/*.{js,jsx,ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*.stories.{js,jsx,ts,tsx}',
		'!src/**/__tests__/**',
		'!src/**/__mocks__/**'
	],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
}

module.exports = createJestConfig(customJestConfig)
```

#### Test Setup
```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
Object.assign(global, { TextDecoder, TextEncoder })

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn()
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => '/'
}))
```

### Component Testing

#### Unit Tests for Components
```typescript
// tests/components/EmailCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EmailCard } from '@/components/EmailCard'
import type { Email } from '@/types/email'

const mockEmail: Email = {
	id: '1',
	subject: 'Test Email',
	from: 'test@example.com',
	body: 'This is a test email',
	date: new Date('2024-01-01'),
	isRead: false,
	category: 'inbox'
}

describe('EmailCard', () => {
	const mockOnSelect = jest.fn()
	const mockOnDelete = jest.fn()
	
	beforeEach(() => {
		jest.clearAllMocks()
	})
	
	it('renders email information correctly', () => {
		render(
			<EmailCard 
				email={mockEmail}
				isSelected={false}
				onSelect={mockOnSelect}
				onDelete={mockOnDelete}
			/>
		)
		
		expect(screen.getByText('Test Email')).toBeInTheDocument()
		expect(screen.getByText('test@example.com')).toBeInTheDocument()
		expect(screen.getByText('This is a test email')).toBeInTheDocument()
	})
	
	it('calls onSelect when clicked', () => {
		render(
			<EmailCard 
				email={mockEmail}
				isSelected={false}
				onSelect={mockOnSelect}
				onDelete={mockOnDelete}
			/>
		)
		
		fireEvent.click(screen.getByRole('button', { name: /test email/i }))
		expect(mockOnSelect).toHaveBeenCalledWith('1')
	})
	
	it('shows selected state correctly', () => {
		render(
			<EmailCard 
				email={mockEmail}
				isSelected={true}
				onSelect={mockOnSelect}
				onDelete={mockOnDelete}
			/>
		)
		
		expect(screen.getByRole('button')).toHaveClass('email-card--selected')
	})
	
	it('handles keyboard navigation', () => {
		render(
			<EmailCard 
				email={mockEmail}
				isSelected={false}
				onSelect={mockOnSelect}
				onDelete={mockOnDelete}
			/>
		)
		
		const card = screen.getByRole('button')
		fireEvent.keyDown(card, { key: 'Enter' })
		expect(mockOnSelect).toHaveBeenCalledWith('1')
		
		fireEvent.keyDown(card, { key: ' ' })
		expect(mockOnSelect).toHaveBeenCalledTimes(2)
	})
})
```

#### Integration Tests
```typescript
// tests/components/EmailList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailList } from '@/components/EmailList'
import { apiClient } from '@/lib/api-client'

// Mock API client
jest.mock('@/lib/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockEmails: Email[] = [
	{
		id: '1',
		subject: 'First Email',
		from: 'first@example.com',
		body: 'First email body',
		date: new Date('2024-01-01'),
		isRead: false,
		category: 'inbox'
	},
	{
		id: '2',
		subject: 'Second Email',
		from: 'second@example.com',
		body: 'Second email body',
		date: new Date('2024-01-02'),
		isRead: true,
		category: 'inbox'
	}
]

describe('EmailList Integration', () => {
	beforeEach(() => {
		mockedApiClient.getEmails.mockResolvedValue({
			data: mockEmails,
			pagination: { page: 1, limit: 20, total: 2 }
		})
	})
	
	it('loads and displays emails', async () => {
		render(<EmailList />)
		
		expect(screen.getByText('Loading...')).toBeInTheDocument()
		
		await waitFor(() => {
			expect(screen.getByText('First Email')).toBeInTheDocument()
			expect(screen.getByText('Second Email')).toBeInTheDocument()
		})
	})
	
	it('handles email selection', async () => {
		const user = userEvent.setup()
		render(<EmailList />)
		
		await waitFor(() => {
			expect(screen.getByText('First Email')).toBeInTheDocument()
		})
		
		await user.click(screen.getByText('First Email'))
		
		expect(screen.getByRole('button', { name: /first email/i }))
			.toHaveClass('email-card--selected')
	})
	
	it('handles bulk selection', async () => {
		const user = userEvent.setup()
		render(<EmailList />)
		
		await waitFor(() => {
			expect(screen.getByText('Select All')).toBeInTheDocument()
		})
		
		await user.click(screen.getByText('Select All'))
		
		expect(screen.getAllByText(/selected/)).toHaveLength(2)
	})
})
```

### Hook Testing

#### Custom Hook Tests
```typescript
// tests/hooks/useEmailSelection.test.ts
import { renderHook, act } from '@testing-library/react'
import { useEmailSelection } from '@/hooks/useEmailSelection'

const mockEmails: Email[] = [
	{ id: '1', subject: 'Email 1' } as Email,
	{ id: '2', subject: 'Email 2' } as Email,
	{ id: '3', subject: 'Email 3' } as Email
]

describe('useEmailSelection', () => {
	it('initializes with empty selection', () => {
		const { result } = renderHook(() => useEmailSelection(mockEmails))
		
		expect(result.current.selectedEmails).toEqual([])
		expect(result.current.selectedCount).toBe(0)
		expect(result.current.isAllSelected).toBe(false)
	})
	
	it('selects and deselects emails', () => {
		const { result } = renderHook(() => useEmailSelection(mockEmails))
		
		act(() => {
			result.current.selectEmail('1')
		})
		
		expect(result.current.selectedEmails).toEqual(['1'])
		expect(result.current.selectedCount).toBe(1)
		
		act(() => {
			result.current.selectEmail('1')
		})
		
		expect(result.current.selectedEmails).toEqual([])
		expect(result.current.selectedCount).toBe(0)
	})
	
	it('selects all emails', () => {
		const { result } = renderHook(() => useEmailSelection(mockEmails))
		
		act(() => {
			result.current.selectAll()
		})
		
		expect(result.current.selectedEmails).toEqual(['1', '2', '3'])
		expect(result.current.selectedCount).toBe(3)
		expect(result.current.isAllSelected).toBe(true)
	})
	
	it('clears selection', () => {
		const { result } = renderHook(() => useEmailSelection(mockEmails))
		
		act(() => {
			result.current.selectAll()
		})
		
		act(() => {
			result.current.clearSelection()
		})
		
		expect(result.current.selectedEmails).toEqual([])
		expect(result.current.selectedCount).toBe(0)
	})
})
```

### API Testing

#### API Route Tests
```typescript
// tests/api/emails.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/emails/route'

jest.mock('@/lib/database', () => ({
	getEmails: jest.fn(),
	createEmail: jest.fn()
}))

describe('/api/emails', () => {
	describe('GET', () => {
		it('returns emails successfully', async () => {
			const { req } = createMocks({
				method: 'GET',
				url: '/api/emails?page=1&limit=10'
			})
			
			const mockEmails = [
				{ id: '1', subject: 'Test Email' }
			]
			
			;(getEmails as jest.Mock).mockResolvedValue(mockEmails)
			
			const response = await GET(req as Request)
			const data = await response.json()
			
			expect(response.status).toBe(200)
			expect(data.data).toEqual(mockEmails)
			expect(data.pagination).toBeDefined()
		})
		
		it('handles errors gracefully', async () => {
			const { req } = createMocks({
				method: 'GET',
				url: '/api/emails'
			})
			
			;(getEmails as jest.Mock).mockRejectedValue(new Error('Database error'))
			
			const response = await GET(req as Request)
			const data = await response.json()
			
			expect(response.status).toBe(500)
			expect(data.error).toBe('Failed to fetch emails')
		})
	})
	
	describe('POST', () => {
		it('creates email successfully', async () => {
			const emailData = {
				to: 'test@example.com',
				subject: 'Test Subject',
				body: 'Test Body'
			}
			
			const { req } = createMocks({
				method: 'POST',
				body: emailData
			})
			
			const mockEmail = { id: '1', ...emailData }
			;(createEmail as jest.Mock).mockResolvedValue(mockEmail)
			
			const response = await POST(req as Request)
			const data = await response.json()
			
			expect(response.status).toBe(201)
			expect(data.data).toEqual(mockEmail)
		})
		
		it('validates request data', async () => {
			const invalidData = {
				to: 'invalid-email',
				subject: '',
				body: 'Test Body'
			}
			
			const { req } = createMocks({
				method: 'POST',
				body: invalidData
			})
			
			const response = await POST(req as Request)
			const data = await response.json()
			
			expect(response.status).toBe(400)
			expect(data.error).toBe('Invalid request data')
			expect(data.details).toBeDefined()
		})
	})
})
```

### End-to-End Testing (Future Enhancement)

#### Playwright Setup
```typescript
// tests/e2e/setup.ts
import { test as base, expect } from '@playwright/test'

interface TestFixtures {
	authenticatedPage: Page
}

export const test = base.extend<TestFixtures>({
	authenticatedPage: async ({ page }, use) => {
		// Login user
		await page.goto('/auth')
		await page.fill('[data-testid="email"]', 'test@example.com')
		await page.fill('[data-testid="password"]', 'password123')
		await page.click('[data-testid="login-button"]')
		
		// Wait for redirect to dashboard
		await expect(page).toHaveURL('/dashboard')
		
		await use(page)
	}
})

export { expect }
```

#### E2E Test Examples
```typescript
// tests/e2e/email-workflow.spec.ts
import { test, expect } from './setup'

test.describe('Email Management Workflow', () => {
	test('user can view and manage emails', async ({ authenticatedPage: page }) => {
		// Navigate to email list
		await page.click('[data-testid="emails-nav"]')
		await expect(page).toHaveURL('/dashboard/emails')
		
		// Check emails are loaded
		await expect(page.locator('[data-testid="email-card"]')).toBeVisible()
		
		// Select an email
		await page.click('[data-testid="email-card"]:first-child')
		await expect(page.locator('[data-testid="email-card"]:first-child'))
			.toHaveClass(/selected/)
		
		// Archive selected email
		await page.click('[data-testid="archive-button"]')
		await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
	})
	
	test('user can filter emails', async ({ authenticatedPage: page }) => {
		await page.goto('/dashboard/emails')
		
		// Apply category filter
		await page.selectOption('[data-testid="category-filter"]', 'unread')
		
		// Verify filter is applied
		await expect(page.locator('[data-testid="email-card"]'))
			.toContainText('Unread')
		
		// Apply search filter
		await page.fill('[data-testid="search-input"]', 'important')
		await page.keyboard.press('Enter')
		
		// Verify search results
		await expect(page.locator('[data-testid="email-card"]'))
			.toContainText('important')
	})
})
```

## Security Guidelines

### Authentication & Authorization

#### JWT Token Management
```typescript
// ✅ Good: Secure token handling
interface AuthTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

class TokenManager {
	private static readonly ACCESS_TOKEN_KEY = 'access_token'
	private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
	
	static setTokens(tokens: AuthTokens): void {
		// Store in httpOnly cookies for security
		document.cookie = `${this.ACCESS_TOKEN_KEY}=${tokens.accessToken}; Path=/; Secure; HttpOnly; SameSite=Strict`
		document.cookie = `${this.REFRESH_TOKEN_KEY}=${tokens.refreshToken}; Path=/; Secure; HttpOnly; SameSite=Strict`
	}
	
	static async getAccessToken(): Promise<string | null> {
		// Check if token is expired
		const expiresAt = this.getTokenExpiration()
		if (expiresAt && Date.now() > expiresAt) {
			return this.refreshAccessToken()
		}
		
		return this.getStoredAccessToken()
	}
	
	private static async refreshAccessToken(): Promise<string | null> {
		try {
			const response = await fetch('/api/auth/refresh', {
				method: 'POST',
				credentials: 'include'
			})
			
			if (!response.ok) {
				this.clearTokens()
				return null
			}
			
			const { accessToken } = await response.json()
			return accessToken
		} catch (error) {
			console.error('Token refresh failed:', error)
			this.clearTokens()
			return null
		}
	}
	
	static clearTokens(): void {
		document.cookie = `${this.ACCESS_TOKEN_KEY}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
		document.cookie = `${this.REFRESH_TOKEN_KEY}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
	}
}
```

#### Route Protection
```typescript
// ✅ Good: Protected route middleware
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	
	// Public routes that don't require authentication
	const publicRoutes = ['/auth', '/privacy', '/terms', '/']
	const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
	
	if (isPublicRoute) {
		return NextResponse.next()
	}
	
	// Check for authentication token
	const token = request.cookies.get('access_token')?.value
	
	if (!token) {
		return NextResponse.redirect(new URL('/auth', request.url))
	}
	
	try {
		// Verify token
		const payload = await verifyToken(token)
		
		// Add user info to request headers
		const requestHeaders = new Headers(request.headers)
		requestHeaders.set('x-user-id', payload.userId)
		requestHeaders.set('x-user-email', payload.email)
		
		return NextResponse.next({
			request: {
				headers: requestHeaders
			}
		})
	} catch (error) {
		console.error('Token verification failed:', error)
		return NextResponse.redirect(new URL('/auth', request.url))
	}
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	]
}
```

### Input Validation & Sanitization

#### Server-Side Validation
```typescript
// ✅ Good: Comprehensive input validation
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

const emailSchema = z.object({
	to: z.string().email().transform(email => email.toLowerCase().trim()),
	subject: z.string()
		.min(1, 'Subject is required')
		.max(200, 'Subject too long')
		.transform(subject => DOMPurify.sanitize(subject)),
	body: z.string()
		.min(1, 'Body is required')
		.max(10000, 'Body too long')
		.transform(body => DOMPurify.sanitize(body, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em'] })),
	attachments: z.array(z.object({
		name: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename'),
		type: z.string().regex(/^[a-zA-Z0-9\/.-]+$/, 'Invalid file type'),
		size: z.number().positive().max(10 * 1024 * 1024, 'File too large') // 10MB max
	})).optional()
})

// API route with validation
export async function POST(request: Request) {
	try {
		const body = await request.json()
		
		// Validate and sanitize input
		const validatedData = emailSchema.parse(body)
		
		// Additional security checks
		if (await isSpamContent(validatedData.body)) {
			return Response.json(
				{ error: 'Content detected as spam' },
				{ status: 400 }
			)
		}
		
		const email = await createEmail(validatedData)
		return Response.json({ data: email })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json(
				{ error: 'Invalid input', details: error.errors },
				{ status: 400 }
			)
		}
		
		console.error('Email creation error:', error)
		return Response.json(
			{ error: 'Failed to create email' },
			{ status: 500 }
		)
	}
}
```

#### XSS Prevention
```typescript
// ✅ Good: XSS prevention utilities
import DOMPurify from 'isomorphic-dompurify'

class SecurityUtils {
	static sanitizeHtml(html: string): string {
		return DOMPurify.sanitize(html, {
			ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
			ALLOWED_ATTR: ['href', 'target'],
			ALLOW_DATA_ATTR: false
		})
	}
	
	static escapeHtml(text: string): string {
		const map: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}
		
		return text.replace(/[&<>"']/g, (match) => map[match])
	}
	
	static isValidUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url)
			return ['http:', 'https:'].includes(parsedUrl.protocol)
		} catch {
			return false
		}
	}
	
	static sanitizeFilename(filename: string): string {
		return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
	}
}

// Component usage
function EmailPreview({ email }: { email: Email }) {
	const sanitizedBody = useMemo(() => 
		SecurityUtils.sanitizeHtml(email.body), 
		[email.body]
	)
	
	return (
		<div>
			<h3>{SecurityUtils.escapeHtml(email.subject)}</h3>
			<div dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
		</div>
	)
}
```

### API Security

#### Rate Limiting
```typescript
// ✅ Good: Rate limiting implementation
import { LRUCache } from 'lru-cache'

interface RateLimitConfig {
	windowMs: number
	maxRequests: number
}

class RateLimiter {
	private cache: LRUCache<string, number>
	private config: RateLimitConfig
	
	constructor(config: RateLimitConfig) {
		this.config = config
		this.cache = new LRUCache({
			max: 1000,
			ttl: config.windowMs
		})
	}
	
	isAllowed(identifier: string): boolean {
		const current = this.cache.get(identifier) || 0
		
		if (current >= this.config.maxRequests) {
			return false
		}
		
		this.cache.set(identifier, current + 1)
		return true
	}
	
	getRemainingRequests(identifier: string): number {
		const current = this.cache.get(identifier) || 0
		return Math.max(0, this.config.maxRequests - current)
	}
}

// Rate limiting middleware
const emailApiLimiter = new RateLimiter({
	windowMs: 60 * 1000, // 1 minute
	maxRequests: 30 // 30 requests per minute
})

function withRateLimit(handler: Function) {
	return async (request: Request) => {
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown'
		
		if (!emailApiLimiter.isAllowed(ip)) {
			return Response.json(
				{ error: 'Too many requests' },
				{ 
					status: 429,
					headers: {
						'Retry-After': '60'
					}
				}
			)
		}
		
		return handler(request)
	}
}

// Usage
export const POST = withRateLimit(async (request: Request) => {
	// Handle email creation
})
```

#### CORS Configuration
```typescript
// ✅ Good: CORS configuration
function corsHeaders(origin?: string) {
	const allowedOrigins = [
		'https://sumails.com',
		'https://www.sumails.com',
		process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
	].filter(Boolean)
	
	const isAllowedOrigin = origin && allowedOrigins.includes(origin)
	
	return {
		'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true',
		'Access-Control-Max-Age': '86400'
	}
}

function withCors(handler: Function) {
	return async (request: Request) => {
		const origin = request.headers.get('origin')
		const headers = corsHeaders(origin)
		
		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 200, headers })
		}
		
		const response = await handler(request)
		
		// Add CORS headers to response
		Object.entries(headers).forEach(([key, value]) => {
			response.headers.set(key, value)
		})
		
		return response
	}
}
```

### Data Protection

#### Encryption Utilities
```typescript
// ✅ Good: Data encryption utilities
import crypto from 'crypto'

class EncryptionService {
	private static readonly algorithm = 'aes-256-gcm'
	private static readonly keyLength = 32
	private static readonly ivLength = 16
	private static readonly tagLength = 16
	
	static encrypt(text: string, key: string): string {
		const keyBuffer = crypto.scryptSync(key, 'salt', this.keyLength)
		const iv = crypto.randomBytes(this.ivLength)
		const cipher = crypto.createCipher(this.algorithm, keyBuffer, iv)
		
		let encrypted = cipher.update(text, 'utf8', 'hex')
		encrypted += cipher.final('hex')
		
		const tag = cipher.getAuthTag()
		
		return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
	}
	
	static decrypt(encryptedData: string, key: string): string {
		const parts = encryptedData.split(':')
		if (parts.length !== 3) {
			throw new Error('Invalid encrypted data format')
		}
		
		const iv = Buffer.from(parts[0], 'hex')
		const tag = Buffer.from(parts[1], 'hex')
		const encrypted = parts[2]
		
		const keyBuffer = crypto.scryptSync(key, 'salt', this.keyLength)
		const decipher = crypto.createDecipher(this.algorithm, keyBuffer, iv)
		decipher.setAuthTag(tag)
		
		let decrypted = decipher.update(encrypted, 'hex', 'utf8')
		decrypted += decipher.final('utf8')
		
		return decrypted
	}
	
	static hash(text: string): string {
		return crypto.createHash('sha256').update(text).digest('hex')
	}
	
	static generateSecureKey(): string {
		return crypto.randomBytes(32).toString('hex')
	}
}

// Usage for sensitive data
class UserDataService {
	private static encryptionKey = process.env.DATA_ENCRYPTION_KEY!
	
	static async storeEmailTokens(userId: string, tokens: any) {
		const encryptedTokens = EncryptionService.encrypt(
			JSON.stringify(tokens),
			this.encryptionKey
		)
		
		return database.userTokens.upsert({
			where: { userId },
			update: { encryptedTokens },
			create: { userId, encryptedTokens }
		})
	}
	
	static async retrieveEmailTokens(userId: string) {
		const record = await database.userTokens.findUnique({
			where: { userId }
		})
		
		if (!record) return null
		
		const decryptedTokens = EncryptionService.decrypt(
			record.encryptedTokens,
			this.encryptionKey
		)
		
		return JSON.parse(decryptedTokens)
	}
}
```

## Performance Optimization

### React Performance

#### Component Optimization
```typescript
// ✅ Good: Optimized components
import { memo, useMemo, useCallback } from 'react'

interface EmailListProps {
	emails: Email[]
	selectedIds: string[]
	onSelectEmail: (id: string) => void
}

const EmailList = memo(function EmailList({ 
	emails, 
	selectedIds, 
	onSelectEmail 
}: EmailListProps) {
	// Memoize filtered and sorted emails
	const processedEmails = useMemo(() => {
		return emails
			.filter(email => !email.isDeleted)
			.sort((a, b) => b.date.getTime() - a.date.getTime())
	}, [emails])
	
	// Memoize render items to prevent unnecessary re-renders
	const emailElements = useMemo(() => {
		return processedEmails.map(email => (
			<EmailCard
				key={email.id}
				email={email}
				isSelected={selectedIds.includes(email.id)}
				onSelect={onSelectEmail}
			/>
		))
	}, [processedEmails, selectedIds, onSelectEmail])
	
	return (
		<div className="email-list">
			{emailElements}
		</div>
	)
})

// Individual email card optimization
const EmailCard = memo(function EmailCard({ 
	email, 
	isSelected, 
	onSelect 
}: EmailCardProps) {
	// Memoize click handler to prevent prop changes
	const handleClick = useCallback(() => {
		onSelect(email.id)
	}, [email.id, onSelect])
	
	// Memoize date formatting
	const formattedDate = useMemo(() => {
		return formatRelativeDate(email.date)
	}, [email.date])
	
	return (
		<div
			className={cn(
				'email-card',
				isSelected && 'email-card--selected'
			)}
			onClick={handleClick}
		>
			<h3>{email.subject}</h3>
			<p>{email.preview}</p>
			<time>{formattedDate}</time>
		</div>
	)
})
```

#### Virtual Scrolling for Large Lists
```typescript
// ✅ Good: Virtual scrolling implementation
import { FixedSizeList as List } from 'react-window'

interface VirtualEmailListProps {
	emails: Email[]
	height: number
	itemHeight: number
	selectedIds: string[]
	onSelectEmail: (id: string) => void
}

function VirtualEmailList({ 
	emails, 
	height, 
	itemHeight, 
	selectedIds, 
	onSelectEmail 
}: VirtualEmailListProps) {
	const EmailItem = useCallback(({ index, style }: any) => {
		const email = emails[index]
		
		return (
			<div style={style}>
				<EmailCard
					email={email}
					isSelected={selectedIds.includes(email.id)}
					onSelect={onSelectEmail}
				/>
			</div>
		)
	}, [emails, selectedIds, onSelectEmail])
	
	return (
		<List
			height={height}
			itemCount={emails.length}
			itemSize={itemHeight}
			itemData={emails}
		>
			{EmailItem}
		</List>
	)
}
```

### Bundle Optimization

#### Dynamic Imports
```typescript
// ✅ Good: Code splitting with dynamic imports
import dynamic from 'next/dynamic'

// Lazy load heavy components
const EmailAnalytics = dynamic(() => import('./EmailAnalytics'), {
	loading: () => <AnalyticsLoader />,
	ssr: false
})

const EmailComposer = dynamic(() => import('./EmailComposer'), {
	loading: () => <ComposerLoader />
})

// Lazy load features based on user subscription
const PremiumFeatures = dynamic(() => import('./PremiumFeatures'), {
	loading: () => <PremiumLoader />,
	ssr: false
})

function Dashboard() {
	const { user } = useAuth()
	const [showAnalytics, setShowAnalytics] = useState(false)
	const [showComposer, setShowComposer] = useState(false)
	
	return (
		<div>
			<DashboardHeader />
			<EmailList />
			
			{showAnalytics && <EmailAnalytics />}
			{showComposer && <EmailComposer />}
			{user.subscription === 'premium' && <PremiumFeatures />}
		</div>
	)
}
```

#### Tree Shaking Optimization
```typescript
// ✅ Good: Optimized imports for tree shaking
// Instead of importing entire libraries
import * as _ from 'lodash' // ❌ Bad: imports entire library

// Import only what you need
import { debounce, throttle } from 'lodash' // ✅ Better
import debounce from 'lodash/debounce' // ✅ Best

// Create utility modules for common functions
// src/utils/array-helpers.ts
export const chunk = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = []
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size))
	}
	return chunks
}

export const unique = <T>(array: T[]): T[] => [...new Set(array)]

export const groupBy = <T>(
	array: T[], 
	key: keyof T
): Record<string, T[]> => {
	return array.reduce((groups, item) => {
		const group = String(item[key])
		groups[group] = groups[group] || []
		groups[group].push(item)
		return groups
	}, {} as Record<string, T[]>)
}

// Usage
import { chunk, unique, groupBy } from '@/utils/array-helpers'
```

### Image Optimization

#### Next.js Image Component
```typescript
// ✅ Good: Optimized images with Next.js Image
import Image from 'next/image'

function UserAvatar({ user }: { user: User }) {
	return (
		<Image
			src={user.avatar || '/images/default-avatar.webp'}
			alt={`${user.name}'s avatar`}
			width={40}
			height={40}
			className="rounded-full"
			priority={false} // Only set to true for above-the-fold images
			placeholder="blur"
			blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLmuJfPLOqnXOOGpmnybFMq0Vr5BL5QFQY"
		/>
	)
}

function EmailAttachmentPreview({ attachment }: { attachment: Attachment }) {
	if (!attachment.isImage) return null
	
	return (
		<div className="relative w-32 h-32">
			<Image
				src={attachment.thumbnailUrl}
				alt={attachment.name}
				fill
				className="object-cover rounded"
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
			/>
		</div>
	)
}
```

### Caching Strategies

#### Service Worker Caching (Future Enhancement)
```typescript
// ✅ Future: Service worker for caching
// public/sw.js
const CACHE_NAME = 'sumails-v1'
const urlsToCache = [
	'/',
	'/static/js/bundle.js',
	'/static/css/main.css',
	'/images/logo.png'
]

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => cache.addAll(urlsToCache))
	)
})

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Return cached version or fetch from network
				return response || fetch(event.request)
			})
	)
})

// Register service worker
// src/lib/service-worker.ts
export function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js')
			.then((registration) => {
				console.log('SW registered: ', registration)
			})
			.catch((registrationError) => {
				console.log('SW registration failed: ', registrationError)
			})
	}
}
```

#### API Response Caching
```typescript
// ✅ Good: Response caching with SWR pattern
function useEmailsWithCache(params: EmailQueryParams = {}) {
	const cacheKey = `emails-${JSON.stringify(params)}`
	
	return useSWR(
		cacheKey,
		() => apiClient.getEmails(params),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			dedupingInterval: 2 * 1000, // 2 seconds
			errorRetryCount: 3,
			onError: (error) => {
				console.error('Email fetch error:', error)
				toast.error('Failed to load emails')
			}
		}
	)
}

// Manual cache invalidation
function useEmailMutations() {
	const { mutate } = useSWRConfig()
	
	const createEmail = useCallback(async (data: CreateEmailData) => {
		try {
			const newEmail = await apiClient.createEmail(data)
			
			// Optimistically update cache
			mutate(
				(key) => typeof key === 'string' && key.startsWith('emails-'),
				(emails: EmailListResponse) => ({
					...emails,
					data: [newEmail.data, ...emails.data]
				}),
				false
			)
			
			toast.success('Email created successfully')
			return newEmail
		} catch (error) {
			toast.error('Failed to create email')
			throw error
		}
	}, [mutate])
	
	return { createEmail }
}
```

## Deployment & DevOps

### Environment Configuration

#### Environment Variables
```bash
# .env.local.example
# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sumails
DATABASE_ENCRYPTION_KEY=your-encryption-key

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn

# Feature Flags
FEATURE_PREMIUM_ANALYTICS=true
FEATURE_EMAIL_COMPOSER=false
```

#### Environment Validation
```typescript
// ✅ Good: Environment validation
import { z } from 'zod'

const envSchema = z.object({
	// Next.js
	NODE_ENV: z.enum(['development', 'production', 'test']),
	NEXTAUTH_URL: z.string().url(),
	NEXTAUTH_SECRET: z.string().min(32),
	
	// Google
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	
	// OpenAI
	OPENAI_API_KEY: z.string().min(1),
	
	// Database
	DATABASE_URL: z.string().url(),
	DATABASE_ENCRYPTION_KEY: z.string().min(32),
	
	// Optional features
	FEATURE_PREMIUM_ANALYTICS: z.coerce.boolean().default(false),
	FEATURE_EMAIL_COMPOSER: z.coerce.boolean().default(true)
})

export const env = envSchema.parse(process.env)

// Usage in configuration
export const config = {
	auth: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	},
	openai: {
		apiKey: env.OPENAI_API_KEY
	},
	features: {
		premiumAnalytics: env.FEATURE_PREMIUM_ANALYTICS,
		emailComposer: env.FEATURE_EMAIL_COMPOSER
	}
} as const
```

### Build Configuration

#### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Enable experimental features
	experimental: {
		serverComponentsExternalPackages: ['googleapis'],
		optimizePackageImports: ['lucide-react']
	},
	
	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		domains: ['lh3.googleusercontent.com'], // Google profile images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
	},
	
	// Bundle analyzer (development only)
	...(process.env.ANALYZE === 'true' && {
		webpack: (config: any) => {
			config.plugins.push(
				new (require('@next/bundle-analyzer'))({
					enabled: true
				})
			)
			return config
		}
	}),
	
	// Security headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY'
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin'
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()'
					}
				]
			}
		]
	}
}

export default nextConfig
```

#### Build Scripts
```json
{
	"scripts": {
		"dev": "next dev --turbopack",
		"build": "next build",
		"start": "next start",
		"lint": "next lint",
		"lint:fix": "next lint --fix",
		"type-check": "tsc --noEmit",
		"test": "jest",
		"test:watch": "jest --watch",
		"test:coverage": "jest --coverage",
		"test:e2e": "playwright test",
		"analyze": "ANALYZE=true npm run build",
		"db:generate": "prisma generate",
		"db:push": "prisma db push",
		"db:migrate": "prisma migrate deploy",
		"db:studio": "prisma studio",
		"docker:build": "docker build -t sumails .",
		"docker:run": "docker run -p 3000:3000 sumails"
	}
}
```

### Docker Configuration

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/sumails
    depends_on:
      - db
    networks:
      - sumails-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=sumails
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - sumails-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sumails-network

volumes:
  postgres_data:
  redis_data:

networks:
  sumails-network:
    driver: bridge
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage

  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t sumails:${{ github.sha }} .
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          # Add deployment commands here
          echo "Deploying to production..."
```

### Monitoring & Analytics

#### Error Tracking
```typescript
// ✅ Good: Error tracking setup
import * as Sentry from '@sentry/nextjs'

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1.0,
	beforeSend(event) {
		// Filter out development errors
		if (process.env.NODE_ENV === 'development') {
			return null
		}
		return event
	}
})

// Custom error tracking
export class ErrorTracker {
	static captureException(error: Error, context?: any) {
		console.error('Error captured:', error)
		
		Sentry.captureException(error, {
			extra: context,
			tags: {
				component: context?.component,
				action: context?.action
			}
		})
	}
	
	static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
		console.log(`[${level.toUpperCase()}] ${message}`)
		Sentry.captureMessage(message, level)
	}
	
	static setUser(user: { id: string; email: string }) {
		Sentry.setUser({
			id: user.id,
			email: user.email
		})
	}
}

// Usage in components
function EmailList() {
	const { emails, error } = useEmails()
	
	useEffect(() => {
		if (error) {
			ErrorTracker.captureException(error, {
				component: 'EmailList',
				action: 'fetch_emails'
			})
		}
	}, [error])
	
	// Component render logic
}
```

#### Performance Monitoring
```typescript
// ✅ Good: Performance monitoring
export class PerformanceMonitor {
	static measurePageLoad(pageName: string) {
		if (typeof window !== 'undefined') {
			const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
			
			const metrics = {
				page: pageName,
				domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
				loadComplete: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
				firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
				firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
			}
			
			// Send to analytics
			this.sendMetrics('page_load', metrics)
		}
	}
	
	static measureApiCall(endpoint: string, duration: number, success: boolean) {
		const metrics = {
			endpoint,
			duration,
			success,
			timestamp: Date.now()
		}
		
		this.sendMetrics('api_call', metrics)
	}
	
	private static sendMetrics(event: string, data: any) {
		// Send to your analytics service
		if (typeof gtag !== 'undefined') {
			gtag('event', event, data)
		}
		
		// Also log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.log(`[Performance] ${event}:`, data)
		}
	}
}

// Usage in pages
function Dashboard() {
	useEffect(() => {
		PerformanceMonitor.measurePageLoad('dashboard')
	}, [])
	
	return <div>Dashboard content</div>
}

// Usage in API client
class ApiClient {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const startTime = performance.now()
		
		try {
			const response = await fetch(endpoint, options)
			const duration = performance.now() - startTime
			
			PerformanceMonitor.measureApiCall(endpoint, duration, response.ok)
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}
			
			return response.json()
		} catch (error) {
			const duration = performance.now() - startTime
			PerformanceMonitor.measureApiCall(endpoint, duration, false)
			throw error
		}
	}
}
```

## Future Roadmap

### Phase 1: Core Features (Months 1-3)
- **Authentication System**: Complete Google OAuth integration
- **Email Processing**: Gmail API integration and email fetching
- **AI Summarization**: OpenAI integration for email summaries
- **Basic Dashboard**: Email list, summaries, and basic analytics
- **Responsive Design**: Mobile-first UI implementation

### Phase 2: Enhanced Features (Months 4-6)
- **Multi-Account Support**: Multiple Gmail account management
- **Advanced Filtering**: Smart filters and search capabilities
- **Email Health Metrics**: Productivity analytics and insights
- **Subscription System**: Pricing plans and payment integration
- **Performance Optimization**: Virtual scrolling, caching, PWA features

### Phase 3: Premium Features (Months 7-9)
- **Email Automation**: Rules-based email processing
- **Advanced Analytics**: Detailed reporting and insights
- **Team Collaboration**: Shared accounts and team features
- **API Access**: Public API for third-party integrations
- **Mobile App**: React Native mobile application

### Phase 4: Enterprise Features (Months 10-12)
- **Multi-Provider Support**: Outlook, Yahoo, and other email providers
- **Advanced Security**: SSO, audit logs, compliance features
- **White-label Solutions**: Customizable branding and deployment
- **Advanced AI Features**: Custom models, sentiment analysis
- **Enterprise Integrations**: CRM, productivity tools, webhooks

### Technology Evolution
- **Database Migration**: Move from file-based to PostgreSQL
- **State Management**: Implement Zustand for complex state
- **Testing Coverage**: Achieve 90%+ test coverage
- **CI/CD Enhancement**: Automated deployment and monitoring
- **Performance**: Sub-second load times and offline support

### Innovation Opportunities
- **Voice Interface**: Voice commands for email management
- **Smart Scheduling**: AI-powered meeting scheduling from emails
- **Email Writing Assistant**: AI-powered email composition
- **Privacy Features**: End-to-end encryption, data anonymization
- **Integration Ecosystem**: Plugin architecture for extensibility

---

## Conclusion

This comprehensive documentation provides a solid foundation for the Sumails project development. The guidelines, conventions, and standards outlined here will help maintain code quality, ensure scalability, and facilitate team collaboration as the project grows.

Regular updates to this documentation are recommended as the project evolves and new patterns emerge. The focus should remain on writing clean, maintainable, and accessible code that provides an excellent user experience.

For questions or suggestions regarding this documentation, please refer to the project's issue tracker or contact the development team. 