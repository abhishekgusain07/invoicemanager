Complete tRPC + TanStack Query Migration Plan

    Eliminating Sequential Server Action Patterns Across the Entire App

    PROJECT OVERVIEW

    Your invoice management app currently uses sequential server action 
    patterns in multiple components, causing performance issues like slow 
    loading, cache misses, duplicate API calls, and poor UX. This plan 
    addresses all components using this anti-pattern.

    IDENTIFIED PROBLEM AREAS

    High Impact Components (Critical for UX):

    - Dashboard (dashboard/page.tsx) - Two sequential API calls on every visit
    - Invoice Data Hook (invoices/hooks/useInvoiceData.ts) - Multiple 
    useEffect cascades  
    - Email Templates Hook (invoices/hooks/useEmailTemplates.ts) - Sequential 
    template loading
    - Connect Page (connect/page.tsx) - Auth + connection status chain
    - Settings Page (settings/page.tsx) - Settings loading pattern

    Medium Impact Components:

    - Templates Page (templates/page.tsx) - Template fetching
    - Create Invoice Form (create-invoice-form.tsx) - Form state management
    - Invoice Table Components - Real-time updates
    - Email Template Modal - Reminder history loading

    ---
    SPRINT 1: Foundation & Infrastructure (2-3 days)

    User Story: As a developer, I need robust tRPC infrastructure to support 
    all app data fetching.

    Tasks:

    1. Install Dependencies & Setup Base tRPC
      - @trpc/server, @trpc/client, @trpc/react-query, @trpc/next
      - @tanstack/react-query, superjson
      - Create src/server/trpc.ts with enhanced context (user, auth, db)
      - Setup src/app/api/trpc/[trpc]/route.ts
    2. Create Core tRPC Routers
      - src/server/routers/auth.ts - Authentication procedures
      - src/server/routers/user.ts - User management
      - src/server/root.ts - Main app router
    3. Client Configuration
      - src/lib/trpc.ts with optimized defaults
      - Update src/app/layout.tsx with TRPCReactProvider + QueryClient
      - Configure global cache settings (staleTime: 5min, gcTime: 10min)
    4. Testing Setup
      - Jest configuration for tRPC procedures
      - Playwright E2E test foundation
      - Mock database utilities

    ---
    SPRINT 2: Dashboard Performance Revolution (3-4 days)

    User Story: As a user, I want the dashboard to load instantly with no 
    loading flickers.

    Tasks:

    1. Create Dashboard Router
      - src/server/routers/dashboard.ts:
          - getStats (replaces getInvoiceStats)
        - getMonthlyData (replaces getMonthlyInvoiceData) 
        - getAllDashboardData (single call combining both)
        - getRecentActivity (for future features)
    2. Convert Dashboard Component
      - Replace dual Promise.all calls with single 
    api.dashboard.getAllDashboardData.useQuery()
      - Remove manual loading states
      - Implement background refetching
      - Add prefetching on route navigation
    3. Cache Strategy
      - Dashboard data: staleTime: 5min, background updates
      - Invoice creation: immediate cache invalidation
      - Smart partial updates for real-time feel
    4. Testing
      - Performance benchmarks (< 200ms repeat visits)
      - Network request verification (single call)
      - Cache invalidation tests

    ---
    SPRINT 3: Invoice Management Overhaul (4-5 days)

    User Story: As a user, I want all invoice operations to be instant and 
    reliable.

    Tasks:

    1. Create Comprehensive Invoice Router
      - src/server/routers/invoice.ts:
          - getByStatus, getById, getStats
        - create, update, delete, updateStatus
        - getReminders, sendReminder
        - bulkOperations for multi-select actions
    2. Convert Invoice Data Hook
      - Replace useInvoiceData.ts sequential pattern with parallel queries
      - Use useQueries for multiple status filters
      - Implement optimistic updates for status changes
      - Add real-time cache synchronization
    3. Enhanced Invoice Components
      - Convert InvoiceTable to use tRPC subscriptions
      - Update modals with instant mutations
      - Implement background sync for concurrent users
    4. Testing
      - CRUD operation performance tests
      - Optimistic update rollback scenarios
      - Concurrent user simulation

    ---
    SPRINT 4: Templates & Email System Migration (3-4 days)

    User Story: As a user, I want template management and email sending to be 
    seamless.

    Tasks:

    1. Create Templates Router
      - src/server/routers/templates.ts:
          - getAll, getByTone, getById
        - create, update, delete
        - render (server-side template rendering)
    2. Convert Templates Components
      - Replace useEmailTemplates.ts sequential loading
      - Update templates/page.tsx with instant loading
      - Convert template selectors to cached queries
    3. Email & Reminders Router
      - src/server/routers/email.ts:
          - sendReminder, getReminderHistory
        - checkGmailConnection, refreshTokens
        - bulkSendReminders
    4. Testing
      - Template rendering performance
      - Email sending reliability
      - Connection status accuracy

    ---
    SPRINT 5: Settings & Connection Management (2-3 days)

    User Story: As a user, I want settings and integrations to load and save 
    instantly.

    Tasks:

    1. Create Settings Router
      - src/server/routers/settings.ts:
          - getUserSettings, updateSettings
        - getEmailSettings, getReminderSettings
        - getAccountSettings
    2. Create Connection Router
      - src/server/routers/connections.ts:
          - checkGmailConnection, getConnectionData
        - refreshConnection, disconnectGmail
    3. Convert Components
      - Replace settings/page.tsx sequential loading
      - Update connect/page.tsx auth + connection cascade
      - Implement real-time connection status
    4. Testing
      - Settings persistence verification
      - Connection state reliability
      - Error handling scenarios

    ---
    SPRINT 6: Form Management & Optimization (2-3 days)

    User Story: As a user, I want forms to be responsive with instant 
    validation.

    Tasks:

    1. Form Data Management
      - Convert create-invoice-form.tsx to use tRPC mutations
      - Implement optimistic form submission
      - Add client-side caching for form data
    2. Real-time Features
      - Live invoice number validation
      - Duplicate detection
      - Background saves (draft functionality)
    3. Advanced UX Features
      - Form prefilling from previous invoices
      - Smart client/project suggestions
      - Auto-save with conflict resolution
    4. Testing
      - Form submission performance
      - Validation accuracy
      - Auto-save reliability

    ---
    SPRINT 7: Performance & Polish (2-3 days)

    User Story: As a user, I want the app to feel native with instant 
    responses.

    Tasks:

    1. Advanced Query Optimization
      - Implement query prefetching strategies
      - Add query warming on app load
      - Optimize bundle size with code splitting
    2. Enhanced Loading States
      - Replace all manual loading with query states
      - Implement progressive data loading
      - Add skeleton screens with real data shapes
    3. Error Handling & Resilience
      - Global error boundaries with tRPC integration
      - Automatic retry logic
      - Offline-first capabilities with sync
    4. Performance Monitoring
      - Add performance metrics collection
      - Implement query timing analytics
      - User experience tracking

    ---
    COMPREHENSIVE TESTING STRATEGY

    Jest Unit Tests (Each Sprint):

    - All tRPC procedures with database mocking
    - Client-side query hooks isolation
    - Cache invalidation logic verification
    - Error handling and edge cases
    - Business logic validation
    - Integration tests for router procedures
    - Mock service layer testing

    Performance Benchmarks:

    - Dashboard: < 200ms repeat visits
    - Invoice operations: < 100ms with optimistic updates
    - Form submissions: Immediate response with background sync
    - Search/filtering: < 50ms with client-side caching

    ---
    SUCCESS METRICS

    Performance Targets:

    ✅ 90% reduction in API calls (multi-call → single call patterns)
    ✅ Dashboard loads < 200ms on repeat visits✅ Zero loading flickers on 
    navigation
    ✅ < 100ms perceived response time for all operations
    ✅ Offline capability for 80% of features

    Developer Experience:

    ✅ 100% type-safe API calls end-to-end
    ✅ Automatic query invalidation
    ✅ Zero manual cache management
    ✅ Built-in error handling and retries
    ✅ Comprehensive test coverage (>90%)

    User Experience:

    ✅ Instant navigation between pages
    ✅ Real-time data updates
    ✅ Optimistic UI updates
    ✅ Robust offline/online transitions
    ✅ Consistent loading states

    ---
    MIGRATION STRATEGY

    Gradual Migration Approach:

    1. Phase 1: Setup infrastructure alongside existing code
    2. Phase 2: Component-by-component migration with feature flags
    3. Phase 3: Remove legacy server actions after validation
    4. Phase 4: Optimize and polish

    Risk Mitigation:

    - Keep existing server actions during transition
    - Feature flags for instant rollback capability
    - Comprehensive testing at each phase
    - Performance monitoring throughout
    - User feedback collection

    Rollback Plan:

    - Environment variables to toggle tRPC vs server actions
    - Database compatibility maintained
    - Instant revert capability for each component
    - User session continuity preserved

    ---
    This comprehensive plan will transform your entire app from sluggish 
    sequential patterns to a modern, cached, type-safe, and lightning-fast 
    user experience. Every component will benefit from intelligent caching, 
    optimistic updates, and real-time synchronization.
