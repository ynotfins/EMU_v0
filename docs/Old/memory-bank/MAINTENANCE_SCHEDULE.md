# Memory Bank Maintenance Schedule

**Purpose**: Keep all memory bank files accurate, up-to-date, and synchronized with the codebase and HANDOFF.md

**Last Updated**: November 1, 2025  
**Maintained By**: AI Agent + Developer

---

## 🔄 Update Frequency

### Daily Updates (After Every Session)

**Files to Update**:
- ✅ `activeContext.md` - **MUST UPDATE** after every coding session
- ✅ `progress.md` - Update when features completed, status changes, or issues resolved

**When to Update**:
- After implementing new features
- After fixing bugs
- After resolving issues
- After deployment changes
- After architectural decisions

**What to Include**:
- Current work focus
- Recent changes (with dates)
- Active issues & blockers
- Next immediate steps
- Session context for next developer

---

### Weekly Updates (Every Sunday)

**Files to Update**:
- ✅ `progress.md` - Comprehensive status review
- ✅ `activeContext.md` - Weekly summary
- ✅ `systemPatterns.md` - If architecture changed
- ✅ `techContext.md` - If dependencies changed

**What to Review**:
- Feature completion status
- Known issues status
- Next steps prioritization
- Technical debt accumulation
- Architecture patterns evolution

---

### Monthly Updates (First of Month)

**Files to Update**:
- ✅ `projectbrief.md` - If project goals changed
- ✅ `productContext.md` - If user problems/solutions evolved
- ✅ `systemPatterns.md` - Architecture review
- ✅ `techContext.md` - Dependency audit
- ✅ `progress.md` - Full metrics update
- ✅ `HANDOFF.md` - Comprehensive sync

**What to Review**:
- Project scope changes
- User feedback integration
- Technical decisions retrospectives
- Performance metrics
- Completion estimates

---

## 📋 Update Checklist

### After Every Coding Session

- [ ] Update `activeContext.md`:
  - [ ] Current work focus section
  - [ ] Recent changes with dates
  - [ ] Active issues & blockers
  - [ ] Next immediate steps
  - [ ] Session context for next developer

- [ ] Update `progress.md` if:
  - [ ] New features completed
  - [ ] Bugs fixed
  - [ ] Status changed (In Progress → Complete)
  - [ ] New issues discovered

---

### Weekly Review

- [ ] Review all memory bank files for accuracy
- [ ] Check HANDOFF.md sync (are they aligned?)
- [ ] Update metrics in `progress.md`
- [ ] Verify cross-references are correct
- [ ] Check for outdated information

---

### Monthly Deep Dive

- [ ] Full audit of all memory bank files
- [ ] Sync HANDOFF.md with memory bank
- [ ] Update project goals if changed
- [ ] Review architecture decisions
- [ ] Update completion estimates
- [ ] Archive old issues/fixes

---

## 🎯 Update Priorities

### High Priority (Update Immediately)

1. **Feature Completion** → Update `progress.md` + `activeContext.md`
2. **Bug Fixes** → Update `progress.md` + `activeContext.md`
3. **Architecture Changes** → Update `systemPatterns.md` + `activeContext.md`
4. **Dependency Changes** → Update `techContext.md` + `activeContext.md`
5. **Project Goals Change** → Update `projectbrief.md` + `activeContext.md`

### Medium Priority (Update Weekly)

1. **Status Changes** → Update `progress.md`
2. **Pattern Evolution** → Update `systemPatterns.md`
3. **New Learnings** → Update `activeContext.md`

### Low Priority (Update Monthly)

1. **Metrics Review** → Update `progress.md`
2. **Documentation Cleanup** → All files
3. **Cross-Reference Verification** → All files

---

## 📝 Update Templates

### activeContext.md Update Template

```markdown
## Current Work Focus

**Latest Session (YYYY-MM-DD)**:
- ✅ Feature/bug/change description
- ✅ Another change
- ⚠️ In progress item

**Previous Session (YYYY-MM-DD)**: Brief summary

**Current State**:
- ✅ What's deployed
- ✅ What's working
- ⚠️ What's in progress

## Recent Changes (Today's Session)

### Phase X: Feature Name ✅

**Problem**: Description
**Solution**: Implementation details
**Result**: Outcome

## Active Issues & Blockers

### Issue Name 🔴

**Problem**: Description
**Status**: Status
**Fix**: If fixed, describe fix

## Next Immediate Steps

### Priority 1: Feature Name

**Status**: Status
**Plan**: Implementation plan
**Estimate**: Time estimate
```

---

### progress.md Update Template

```markdown
## What Works (Production-Ready) ✅

### Feature Name - Complete ✅

- ✅ **Sub-feature**: Description
- ✅ **Sub-feature**: Description
- ✅ **Technical Details**: Implementation notes

## What's In Progress (Partially Implemented) ⚡

### Feature Name - Backend Ready, UI Pending ⚡

**Backend**: ✅ Complete  
**UI**: ❌ Not started

**What's Ready**: List
**What's Needed**: List
**Estimate**: Time

## What's Left to Build ❌

### Feature Name ❌

**Status**: Status  
**Priority**: Priority  
**Requirements**: List
**Estimate**: Time
```

---

## 🔗 Cross-Reference Rules

### Always Link Related Content

When updating memory bank files, ensure cross-references are maintained:

- `activeContext.md` → References `progress.md`
- `progress.md` → References `activeContext.md`
- `systemPatterns.md` → References `techContext.md`
- `techContext.md` → References `systemPatterns.md`
- All files → Reference `HANDOFF.md` where relevant

### Cross-Reference Format

```markdown
**📚 Reference**: `docs/memory-bank/filename.md`, `docs/OTHER_DOC.md`
```

---

## 🚨 Sync Alerts

### When HANDOFF.md and Memory Bank Diverge

If HANDOFF.md is updated but memory bank files are not:

1. **Immediate Action**: Update memory bank files to match HANDOFF.md
2. **Priority**: High (HANDOFF.md is source of truth)
3. **Files Affected**: Usually all memory bank files

### When Memory Bank Files Conflict

If memory bank files contradict each other:

1. **Check**: HANDOFF.md for authoritative answer
2. **Update**: All conflicting files to match HANDOFF.md
3. **Document**: Why conflict occurred in `activeContext.md`

---

## 📊 Maintenance Metrics

### Track These Metrics

- **Update Frequency**: How often each file is updated
- **Sync Status**: Alignment between HANDOFF.md and memory bank
- **Accuracy**: Verified by codebase review
- **Completeness**: All sections filled out

### Monthly Review Questions

1. Are all memory bank files up-to-date?
2. Is HANDOFF.md synchronized with memory bank?
3. Are cross-references accurate?
4. Are there outdated sections?
5. Are completion estimates realistic?

---

## 🎯 Maintenance Goals

### Primary Goals

1. **Accuracy**: Memory bank reflects current codebase state
2. **Completeness**: All sections filled out comprehensively
3. **Synchronization**: HANDOFF.md and memory bank aligned
4. **Clarity**: New developers can understand project immediately

### Success Criteria

- ✅ Memory bank updated after every session
- ✅ HANDOFF.md synced weekly
- ✅ Zero outdated information
- ✅ All cross-references valid
- ✅ New developers can onboard from memory bank alone

---

## 📅 Suggested Maintenance Schedule

### Monday (Start of Week)
- Review last week's changes
- Update `activeContext.md` with weekly summary
- Prioritize next steps

### Wednesday (Mid-Week)
- Check `progress.md` for status updates
- Update `activeContext.md` with mid-week progress
- Review blockers

### Friday (End of Week)
- Comprehensive `progress.md` update
- `activeContext.md` weekly summary
- Sync check with HANDOFF.md

### First Sunday of Month
- Full memory bank audit
- HANDOFF.md sync
- Architecture review
- Metrics update

---

## 🔧 Automated Checks (Future)

### Potential Automation

- [ ] Script to check memory bank update dates
- [ ] Script to verify cross-references
- [ ] Script to detect HANDOFF.md vs memory bank conflicts
- [ ] GitHub Action to remind weekly updates

**Status**: Not yet implemented  
**Priority**: Low (manual process works for now)

---

## 📚 Related Documentation

- `HANDOFF.md` - Comprehensive project handoff (source of truth)
- `docs/memory-bank/projectbrief.md` - Project overview
- `docs/memory-bank/productContext.md` - User problems & solutions
- `docs/memory-bank/systemPatterns.md` - Architecture & patterns
- `docs/memory-bank/techContext.md` - Tech stack & setup
- `docs/memory-bank/activeContext.md` - Current work focus
- `docs/memory-bank/progress.md` - Status tracking

---

**Remember**: Memory bank is the ONLY link between AI agent sessions. Accuracy is critical!

**Last Maintenance Check**: November 1, 2025  
**Next Weekly Review**: November 8, 2025  
**Next Monthly Review**: December 1, 2025

