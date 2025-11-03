# 📦 **Module A: Core Infrastructure**

**Purpose**: Establish proper Next.js 14 App Router foundation with TypeScript, ESLint, and src/ directory structure.

---

## 🎯 **Goals**

1. Move to `src/` directory structure
2. Proper Next.js 14 configuration
3. TypeScript strict mode
4. ESLint with Next.js rules
5. Prettier formatting
6. Environment setup

---

## 📁 **New Directory Structure**

```
EMU_v0/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── global.css         # Global styles
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/              # UI components
│   │   ├── features/        # Feature components
│   │   └── layouts/         # Layout components
│   ├── lib/                  # Utilities
│   │   ├── actions/         # Server Actions
│   │   ├── firebase/        # Firebase config
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── hooks/               # Custom React hooks
│   └── middleware.ts        # Next.js middleware
├── public/                  # Static files
├── docs/                    # Documentation
├── scripts/                 # Build scripts
├── .env.local              # Environment variables
├── next.config.js          # Next.js config
├── tsconfig.json           # TypeScript config
├── .eslintrc.json          # ESLint config
├── .prettierrc             # Prettier config
└── package.json            # Dependencies
```

---

## 🔧 **Implementation Steps**

### **Step 1: Create src/ directory**
```bash
mkdir src
mkdir -p src/app src/components/ui src/components/features src/components/layouts
mkdir -p src/lib/actions src/lib/firebase src/lib/utils src/lib/types
mkdir src/hooks
```

### **Step 2: Move files to src/**
```bash
# Move app directory
mv app/* src/app/

# Move components
mv components/* src/components/

# Move lib
mv lib/* src/lib/

# Move hooks
mv hooks/* src/hooks/

# Move middleware
mv middleware.ts src/middleware.ts
```

### **Step 3: Update imports**
All imports need to be updated from:
- `@/components/...` → `@/components/...` (no change)
- `@/lib/...` → `@/lib/...` (no change)
- But ensure tsconfig paths are correct

### **Step 4: Update next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
    typedRoutes: true,
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'maps.googleapis.com',
    ],
  },
}

module.exports = nextConfig
```

### **Step 5: Update tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### **Step 6: ESLint Configuration**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### **Step 7: Prettier Configuration**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 🧪 **Testing Checklist**

- [ ] `npm run build` passes
- [ ] `npm run dev` starts without errors
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] All imports resolved
- [ ] Pages load correctly
- [ ] Hot reload works

---

## 📝 **Files to Create**

1. `src/app/layout.tsx` - New root layout with proper metadata
2. `src/lib/config/constants.ts` - App constants
3. `src/lib/types/index.ts` - TypeScript type definitions
4. `src/components/ui/index.ts` - UI component exports

---

## 🚨 **Common Issues**

1. **Import errors**: Update all relative imports
2. **Build errors**: Check for missing dependencies
3. **TypeScript errors**: May need to temporarily use `// @ts-ignore`
4. **ESLint errors**: Can be fixed incrementally

---

## ✅ **Success Criteria**

1. All files in `src/` directory
2. Clean build with no errors
3. Dev server runs
4. TypeScript strict mode enabled
5. ESLint configured
6. Prettier formatting works
