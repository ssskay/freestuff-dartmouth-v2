# Report Issue Feature

The Report Issue feature allows users to flag problems with resources and optionally receive a free sticker for helping keep the catalog accurate.

## Setup (One-Time)

To enable the report feature, you need to create the `resource_reports` table in your Supabase database:

1. Go to your Supabase project's SQL Editor
2. Run the migration file: `supabase/add-reports-table.sql`

You can verify the table exists by running:
```bash
npm run check-reports
```

## How It Works

### User Flow
1. User clicks "Report" button on any resource card
2. Dropdown appears with issue types:
   - Broken link
   - Wrong information
   - Outdated
   - Wrong eligibility
   - Other
3. User selects an issue type
4. System shows success message with sticker offer
5. If user wants a sticker, they enter their email

### Data Captured
- `resource_id`: The resource being reported
- `issue_type`: The type of problem
- `email`: Optional email for sticker fulfillment
- `created_at`: Timestamp
- `status`: Pending/Reviewed/Fixed (for admin tracking)

## Managing Reports

To view submitted reports, query the `resource_reports` table in Supabase:

```sql
SELECT
  r.name,
  rr.issue_type,
  rr.email,
  rr.created_at,
  rr.status
FROM resource_reports rr
JOIN resources r ON r.id = rr.resource_id
WHERE rr.status = 'pending'
ORDER BY rr.created_at DESC;
```

## Implementation Files

- **Database Schema**: `supabase/add-reports-table.sql`
- **Backend Function**: `src/lib/supabase.ts` → `reportIssue()`
- **UI Component**: `src/components/ResourceCard.astro` → Report button & dropdown
- **JavaScript Logic**: `src/pages/index.astro` → Event handlers
- **Verification Script**: `scripts/add-reports-table.js` → Check table exists

## Security

The feature uses Row Level Security (RLS):
- Anyone can submit reports (INSERT)
- Anyone can view reports (SELECT) - for admin purposes
- Reports are anonymous unless user provides email for sticker
