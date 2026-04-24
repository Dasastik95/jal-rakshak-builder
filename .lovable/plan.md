
# Purulia Properties — Admin Panel Plan

A complete, SaaS-grade admin control center wired to **your existing Supabase project**. Every module from your spec will be built. Modules backed by existing tables (`profiles`, `properties`, `saved_properties`) will be fully functional with real CRUD. Modules that need tables you haven't created yet (chats, payments, notifications, audit logs, cities, amenities, requirements, reports) will be built as fully-designed UIs that show a clear "Schema not configured — provide table to activate" empty state, so the moment you add the table they light up.

---

## 1. Connect Your Supabase

Before building, I'll need from you:
- **Supabase Project URL**
- **Supabase Publishable (anon) key**
- **Supabase Service Role key** (for admin server-side operations that must bypass RLS — stored as a server-only secret, never shipped to the browser)

These get stored as project secrets. The browser client uses the anon key (RLS applies); server functions use the service role for trusted admin actions.

---

## 2. Branding & Design System

- **Primary Blue** `#0e47a1`
- **White** `#ffffff`
- **Accent Orange** `#ff9700`
- Inter font, generous spacing, soft shadows, rounded corners
- SaaS-style layout: collapsible left sidebar (icon-collapse mode) + sticky top navbar (search, notifications, admin avatar menu)
- Skeleton loaders on every data fetch
- Responsive: full desktop, condensed tablet, drawer-sidebar on mobile

---

## 3. Authentication & Role-Based Access

**Admin gating uses a separate `user_roles` table** (industry best practice — prevents privilege escalation).

I will create a migration for:
- Enum `app_role` with values `super_admin`, `sub_admin`
- Table `public.user_roles (id, user_id → auth.users, role, created_at)` with RLS
- Security-definer function `public.has_role(_user_id, _role)`
- Security-definer function `public.is_admin(_user_id)` (true for either admin role)
- Audit log table `public.admin_audit_logs (id, admin_id, action, entity_type, entity_id, metadata, created_at)`

**Login flow:**
- Email + password (Supabase Auth)
- After login, check `is_admin(auth.uid())` — non-admins are signed out and rejected
- **2FA / OTP**: Supabase TOTP MFA enrollment + verification on login (authenticator app)
- All admin pages protected by a `_authenticated` route guard that re-checks admin role on every navigation
- Activity logging middleware writes to `admin_audit_logs` for every mutation

---

## 4. Modules (every spec item, organized)

### Dashboard (Overview)
KPI cards (Total Users, Total Properties, Active Listings, Pending Approvals, Sold/Rented, Saved Properties count) + charts:
- User growth (daily/monthly) from `profiles.created_at`
- Listings trend from `properties.created_at`
- Status breakdown donut (active/pending/sold/rented) from `properties.status`
- Property type distribution
- Revenue chart → empty state until `payments` table exists

### User Management *(fully functional)*
- Paginated, searchable, filterable table over `profiles` (filter by `role`, `owner_type`, `onboarded`, city)
- View full profile (avatar, contact, bio, preferences, listings count from `properties` join, saved count, last activity)
- Verify/Unverify, Block/Suspend (adds `is_blocked` column via migration), Delete user
- Promote/demote admin (manages `user_roles` rows) — Super Admin only
- Bulk actions, CSV export

### Property Management *(fully functional)*
- Paginated table over `properties` with filters: `listing_type` (Buy/Sell/Rent), `property_type`, `category`, `status`, `is_verified`, `is_featured`, city, price range
- Detail drawer with full data, image gallery, owner info (joined from `profiles`)
- Actions: Approve / Reject (status), Edit any field, Delete, Toggle Featured ⭐, Toggle Verified ✔, Mark Sold/Rented
- Bulk approve / bulk feature
- Map preview using lat/long
- CSV export

### Requirement Management (Tenant Posts)
- Full UI built. Empty state until `requirements` table is created — I'll provide the suggested schema. View / Edit / Delete / Approve / Reject ready to wire on day-one.

### Chat & Lead Management
- Conversations viewer + leads tracker UI built. Empty state pending `conversations`, `messages`, `leads` tables. Schema suggestion provided.

### Monetization (Payments & Subscriptions)
- Featured listing pricing config, broker subscription tiers, transaction history table. Empty state until `payments` / `subscriptions` tables exist.

### Locations & Categories
- CRUD UIs for Cities/Areas, Property Types, Amenities. Empty state until `cities`, `amenities` tables exist.

### Notifications
- In-app notification composer + recipients selector + history. Empty state until `notifications` table exists.
- Email/SMS sending requires Resend + Twilio (you said skip — UI built, send button disabled with "Configure provider" tooltip).

### Reports & Analytics
- Most viewed properties (uses `properties.views`), top sellers/brokers (group by `owner_id`), user engagement
- CSV/Excel export for every table
- Fraud detection: duplicate listings (same title+city+owner), suspicious users (many listings created in short window) — runs against existing tables

### Content Moderation
- Reported listings inbox. Empty state until `reports` table exists. Approve/Remove actions wired.

### Settings
- Site branding (logo, colors, contact details), SEO defaults (meta title/description), API config — stored in a `site_settings` JSONB row I'll migrate.

### Audit Logs
- Searchable timeline of every admin action (who, what, when, before/after). Fully functional from day one.

---

## 5. Cross-Cutting Features

- TanStack Query for caching, background refetch, optimistic updates
- Supabase Realtime subscriptions on key tables (properties, profiles) for live dashboard updates
- Server-side pagination + cursor for large tables
- Debounced search with auto-suggestions (properties + users)
- Lazy-loaded routes; skeleton loaders everywhere
- Zod validation on every form (client + server)
- All admin mutations routed through server functions using the service role + audit log write

---

## 6. Migrations I Will Create

Inside your Supabase project (you approve before they run):
1. `app_role` enum + `user_roles` table + RLS
2. `has_role()` and `is_admin()` security-definer functions
3. `admin_audit_logs` table + RLS
4. `is_blocked boolean default false` column on `profiles`
5. `site_settings` table (single-row JSONB config)
6. RLS policies on `profiles` and `properties` letting admins read/update everything via `is_admin(auth.uid())`

I will **not** create chats, payments, requirements, notifications, cities, amenities, reports tables — per your instruction. Those modules ship as ready-to-activate UI.

---

## 7. Tech Notes

- TanStack Start (already set up), TanStack Router file-based routes under `src/routes/admin/...` behind an `_authenticated` guard
- Browser supabase client (anon key, RLS) + server `supabaseAdmin` (service role) for trusted admin writes via `createServerFn`
- shadcn/ui components (Sidebar, Table, Dialog, Drawer, Tabs, Charts via Recharts)
- Roles never stored on `profiles` — strictly in `user_roles`

---

## 8. What Happens Next

After you approve this plan:
1. I'll ask you to paste the Supabase URL, anon key, and service role key as secrets
2. I'll generate the migrations listed above for you to review/run
3. I'll scaffold the admin shell, auth, and dashboard first
4. Then build every module in order: Users → Properties → Requirements → Chat/Leads → Monetization → Locations → Notifications → Reports → Moderation → Settings → Audit Logs
5. You'll get the first admin account by signing up normally, then I'll insert the `super_admin` role row for your user.
