# Leopold Project - Detailed Lint Errors

**Total Errors:** 38  
**Date:** 2025-10-18

---

## Error Breakdown

### Category 1: Svelte Parser Errors (11 errors)
These are caused by TypeScript parser configuration issues in Svelte files. The ESLint configuration needs to be updated to properly handle Svelte components with TypeScript.

**Files:**
1. `src/lib/components/AudioRecorder.svelte:1:8` - Parsing error: '>' expected
2. `src/lib/components/ImageUpload.svelte:1:8` - Parsing error: '>' expected
3. `src/lib/components/LocationPicker.svelte:1:8` - Parsing error: '>' expected
4. `src/lib/components/ObservationForm.svelte:1:2` - Parsing error: Type expected
5. `src/lib/components/ObservationMap.svelte:1:8` - Parsing error: '>' expected
6. `src/lib/components/SpeciesSelector.svelte:1:8` - Parsing error: '>' expected
7. `src/routes/+layout.svelte:3:6` - Parsing error: '>' expected
8. `src/routes/+page.svelte:1:2` - Parsing error: Type expected
9. `src/routes/about/+page.svelte:1:2` - Parsing error: Type expected
10. `src/routes/auth/signin/+page.svelte:1:8` - Parsing error: '>' expected
11. `src/routes/map/+page.svelte:2:4` - Parsing error: Expression expected
12. `src/routes/observations/+page.svelte:1:2` - Parsing error: Type expected
13. `src/routes/observations/new/+page.svelte:1:2` - Parsing error: Type expected

**Solution:** Update `eslint.config.js` to properly configure the Svelte parser for TypeScript support.

---

### Category 2: TypeScript `any` Type Usage (19 errors)

#### src/lib/api/client.ts (4 errors)
- Line 181:100 - Unexpected any
- Line 191:53 - Unexpected any
- Line 287:61 - Unexpected any
- Line 292:71 - Unexpected any

#### src/lib/stores/index.ts (7 errors)
- Line 195:25 - Unexpected any
- Line 216:57 - Unexpected any
- Line 288:58 - Unexpected any
- Line 676:19 - Unexpected any
- Line 676:31 - Unexpected any
- Line 677:19 - Unexpected any
- Line 677:31 - Unexpected any

#### src/lib/types/index.ts (7 errors)
- Line 263:28 - Unexpected any
- Line 276:10 - Unexpected any
- Line 282:11 - Unexpected any
- Line 284:23 - Unexpected any
- Line 315:28 - Unexpected any
- Line 380:29 - Unexpected any
- Line 386:27 - Unexpected any

#### src/lib/utils/index.ts (5 errors)
- Line 101:46 - Unexpected any
- Line 101:56 - Unexpected any
- Line 116:46 - Unexpected any
- Line 116:56 - Unexpected any
- Line 293:52 - Unexpected any

#### src/lib/utils/validation.ts (1 error)
- Line 124:41 - Unexpected any

#### src/service-worker.ts (1 error)
- Line 76:39 - Unexpected any

**Solution:** Replace `any` types with proper TypeScript types or use `// @ts-ignore` comments if necessary.

---

## Fixes Applied So Far

✅ **tailwind.config.js** - Converted 4 `require()` calls to ES6 imports  
✅ **scripts/test-audio.js** - Removed 2 unused imports  
✅ **src/lib/utils/audio.ts** - Removed 1 unused variable  
✅ **src/lib/stores/index.ts** - Removed 1 unused import  

**Errors Reduced:** 46 → 38

---

## Next Steps

### Priority 1: Fix Svelte Parser
Update `eslint.config.js` to properly handle Svelte TypeScript parsing.

### Priority 2: Type Annotations
Replace `any` types with proper TypeScript types in:
- `src/lib/api/client.ts`
- `src/lib/stores/index.ts`
- `src/lib/types/index.ts`
- `src/lib/utils/index.ts`
- `src/lib/utils/validation.ts`
- `src/service-worker.ts`

---

## How to Run Linter

```bash
cd leopold-frontend
bun run lint
```

## How to Fix Linter Issues

```bash
cd leopold-frontend
bun run lint:fix
```

