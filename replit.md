# 노인맞춤돌봄서비스 현장 모니터링 통합 관리 시스템

## Overview

This is a comprehensive monitoring and management system for elderly care services in South Korea. The application manages surveys, inventory distribution, and provides analytical insights for 55 elderly care service organizations in Gyeongsangnam-do province. It features a React frontend with TypeScript, Express backend, and local IndexedDB storage with plans to integrate PostgreSQL via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand for application state, TanStack Query for server state
- **Charts**: Chart.js for data visualization
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling
- **Storage Interface**: Abstracted storage layer with in-memory implementation

### Data Storage Solutions
- **Current**: IndexedDB via idb library for client-side persistence
- **Planned**: PostgreSQL with Drizzle ORM (configuration already present)
- **Schema**: Comprehensive TypeScript schemas with Zod validation
- **Migration**: Drizzle migrations configured for PostgreSQL transition

## Key Components

### Survey Management
- **Official Survey**: Excel upload system for government employee surveys
- **Elderly Survey**: Multi-section form for elderly care recipients
- **Validation**: Client-side validation with comprehensive error handling
- **Storage**: Local IndexedDB with export/backup capabilities

### Inventory Management
- **Distribution Tracking**: Record keeping for supply distribution to organizations
- **Analytics**: Real-time calculation of distribution rates and remaining stock
- **CRUD Operations**: Full create, read, update, delete functionality

### Analytics Dashboard
- **Real-time Metrics**: Live calculation of survey completion rates and inventory status
- **Data Visualization**: Interactive charts showing satisfaction scores, regional distribution, and trends
- **Comparative Analysis**: Side-by-side comparison of official vs elderly survey responses

### UI Components
- **Design System**: Consistent component library based on shadcn/ui
- **Responsive Design**: Mobile-first approach with breakpoint-aware components
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Korean Localization**: Full Korean language support with appropriate fonts

## Data Flow

1. **Survey Data Entry**:
   - Officials: Excel file upload → validation → storage
   - Elderly: Multi-step form → validation → storage

2. **Inventory Management**:
   - Distribution records → real-time calculations → analytics updates

3. **Analytics Processing**:
   - Raw data → aggregation → visualization → dashboard updates

4. **Data Persistence**:
   - IndexedDB for immediate storage → future PostgreSQL integration

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Vite build system with plugins

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography

### Data and Storage
- IndexedDB via idb for client-side storage
- Drizzle ORM for future PostgreSQL integration
- Zod for runtime type validation and schema definition

### Development Tools
- TypeScript for type safety
- tsx for development server
- esbuild for production builds
- PostCSS for CSS processing

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- tsx for backend TypeScript execution
- Concurrent development with proxy setup

### Production Build
- Frontend: Vite build with optimized assets
- Backend: esbuild bundle for Node.js deployment
- Static assets served by Express in production

### Database Migration
- Current: Self-contained with IndexedDB
- Future: PostgreSQL integration via Drizzle migrations
- Backup/restore functionality for data migration

### Scalability Considerations
- Modular architecture for easy feature additions
- Abstracted storage layer for database flexibility
- Component-based UI for maintainable frontend development

## Recent Changes
- **2025-07-29**: GitHub 저장소 연동 완료
  - Repository: https://github.com/Shinyongki/elderly-care-monitoring-system
  - 기본 프로젝트 파일들 (README.md, package.json, .gitignore, 설정 파일들) 업로드 완료
  - GitHub API를 통한 자동화된 파일 업로드 시스템 구현