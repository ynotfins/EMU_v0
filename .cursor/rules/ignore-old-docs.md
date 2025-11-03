# CRITICAL: Ignore Old Documentation

## DO NOT USE `/docs/Old/` FOR CONTEXT

The `/docs/Old/` folder contains documentation from the previous architecture implementation. This documentation is:
- OUTDATED
- NOT RELEVANT to the Clean Architecture implementation
- KEPT ONLY FOR HISTORICAL REFERENCE

## ALWAYS USE NEW DOCUMENTATION

For the current Clean Architecture implementation, use:
- `/docs/memory-bank/` - Current memory bank files
- `/EMU_BEST_PRACTICES_ARCHITECTURE.md` - Architecture guide
- `/IMPLEMENTATION_ROADMAP.md` - Implementation plan
- `/CLEAN_ARCHITECTURE_*.md` - Progress tracking files

## If You Reference Old Docs
If you accidentally reference old documentation:
1. STOP immediately
2. Find the equivalent in new documentation
3. If no equivalent exists, ask for clarification
4. NEVER apply old patterns to new architecture

## File Patterns to Ignore
- `docs/Old/**/*`
- Any references to old component structure
- Old Firebase patterns
- Old state management approaches
- Old routing patterns

Remember: The Clean Architecture is a complete rewrite with different patterns, structure, and approaches.
