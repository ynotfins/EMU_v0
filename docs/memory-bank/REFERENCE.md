# Reference Documentation Index

This file anchors all technical documentation as read-only references for the Memory Bank.

## 📚 Core Documentation

### 1. **README.md** (`/docs/README.md`)
**Purpose**: Project overview, setup instructions, tech stack  
**Contains**:
- How to run the project
- Tech stack details (Next.js 16, TypeScript, Tailwind, Firebase)
- Project structure
- Environment variables list
- Integration status
- Next steps

---

### 2. **WIRING.md** (`/docs/WIRING.md`)
**Purpose**: Data contracts, Firebase collections, security rules  
**Contains**:
- Complete Firestore collection schemas
- Hook → Collection mappings
- Security rules templates
- Data flow diagrams
- Real-time listener patterns

---

### 3. **EXTENSIONS.md** (`/docs/EXTENSIONS.md`)
**Purpose**: Firebase Extensions configuration guide  
**Contains**:
- Required Firebase Extensions list
- Configuration steps for each extension
- Environment variables needed
- Trigger functions setup
- Extension deployment order

---

### 4. **BUILD_REPORT.md** (`/BUILD_REPORT.md`)
**Purpose**: v0 build documentation and implementation log  
**Contains**:
- Original v0 build specifications
- Component implementation details
- Feature checklist
- Known limitations
- Build history

---

### 5. **ROUTES.md** (`/docs/ROUTES.md`)
**Purpose**: Complete route tree and navigation structure  
**Contains**:
- All route paths for chaser, supe, admin
- Route parameters
- Protected route patterns
- Navigation hierarchy
- Role-based access mapping

---

### 6. **COMPONENTS.md** (`/docs/COMPONENTS.md`)
**Purpose**: Component catalog with props and usage  
**Contains**:
- Complete component list (40+ shadcn/ui + 15+ custom)
- Props interfaces for each component
- Usage examples
- Component relationships
- File locations

---

### 7. **TESTPLAN.md** (`/docs/TESTPLAN.md`)
**Purpose**: Manual testing checklist  
**Contains**:
- Feature testing scenarios
- Role-based testing flows
- Firebase integration tests
- End-to-end test cases
- Acceptance criteria

---

### 8. **API_MAP.md** (`/docs/API_MAP.md`)
**Purpose**: Hooks → Firestore collections mapping  
**Contains**:
- All custom hooks list
- Firestore collection mappings
- Query patterns
- Real-time listener locations
- Action functions mapping

---

## 🔒 Reference Status

All documents listed above are **read-only references** for the Memory Bank.

- ✅ Do NOT modify during normal development
- ✅ Reference for architecture decisions
- ✅ Source of truth for data contracts
- ✅ Guide for Firebase implementation

## 📍 Quick Reference Paths

```
/docs/
├── README.md              → Project overview & setup
├── WIRING.md              → Data contracts & Firestore
├── EXTENSIONS.md          → Firebase Extensions
├── ROUTES.md              → Route structure
├── COMPONENTS.md          → Component catalog
├── TESTPLAN.md            → Testing scenarios
├── API_MAP.md             → Hooks & collections
├── ENV.md                 → Environment variables
└── INTEGRATION_LOG.md     → Implementation progress

/BUILD_REPORT.md           → v0 build documentation (root)

/docs/memory-bank/
├── projectbrief.md        → Core purpose & goals
├── productContext.md      → User problems & solutions
├── systemPatterns.md      → Architecture & patterns
├── techContext.md         → Tech stack & setup
├── activeContext.md       → Current work & issues
├── progress.md            → Status & roadmap
└── REFERENCE.md           → This file
```

---

## 🎯 Usage Guidelines

### When to Reference These Docs

1. **Before implementing Firebase queries** → Read WIRING.md
2. **Before adding new routes** → Read ROUTES.md
3. **Before modifying components** → Read COMPONENTS.md
4. **Before configuring Firebase** → Read EXTENSIONS.md
5. **Before testing features** → Read TESTPLAN.md
6. **When understanding data flow** → Read API_MAP.md
7. **When onboarding to project** → Read README.md
8. **When reviewing build history** → Read BUILD_REPORT.md

### Maintenance Notes

- These docs are maintained **separately** from Memory Bank
- Memory Bank references these docs but does not duplicate them
- Updates to these docs should be committed to Git
- Memory Bank tracks **progress and context**, not specifications

---

**Last Updated**: Initial setup  
**Status**: All reference docs anchored ✅

