# Module A: Import Path Fixes

## Component Import Updates Needed

### From `@/components/[name]` to `@/components/features/[name]`:
- role-layout → features/role-layout
- stats-cards → features/stats-cards  
- supe-controls-card → features/supe-controls-card
- god-mode-card → features/god-mode-card

### From `@/lib/[name]` to correct subdirectory:
- auth-persistence → firebase/auth-persistence
- dev → utils/dev
- realtime-database → utils/realtime-database

### Missing file that needs to be created:
- docs/manifest.json

## Bulk Update Strategy

Instead of fixing each import individually, we'll:
1. Use search/replace across all files
2. Create missing files
3. Re-run build to verify
