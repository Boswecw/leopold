# Dark Mode - Quick Start Guide 🌙

## What's New?

Leopold now has **full dark mode support**! Users can toggle between light and dark themes with a single click.

## How to Use

### For End Users
1. Look for the **Moon/Sun icon** in the top navbar
2. Click it to toggle between light and dark mode
3. Your preference is saved automatically
4. Theme persists across sessions

### For Developers

#### Adding Dark Mode Styles to Components

**Option 1: Tailwind Dark Prefix (Recommended)**
```svelte
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

**Option 2: CSS Variables**
```svelte
<div style="background-color: var(--bg-primary); color: var(--text-primary);">
  Content
</div>
```

**Option 3: Global Classes**
```svelte
<div class="card">
  <!-- Automatically styled for current theme -->
</div>
```

#### Accessing Theme in Components
```svelte
<script lang="ts">
  import { uiStore } from '$lib/stores';
  
  let theme: 'light' | 'dark' = 'light';
  
  const unsubscribe = uiStore.subscribe((ui) => {
    theme = ui.theme;
  });
</script>

<p>Current theme: {theme}</p>
```

## Implementation Details

### Files Changed
- ✅ `tailwind.config.js` - Added `darkMode: 'class'`
- ✅ `src/app.css` - Added dark mode CSS variables
- ✅ `src/lib/styles/globals.css` - Added dark mode selectors
- ✅ `src/routes/+layout.svelte` - Theme initialization
- ✅ `src/lib/components/Navbar.svelte` - Theme toggle button

### How It Works
1. **Initialization**: App detects saved theme or system preference
2. **Storage**: Theme preference saved to `localStorage`
3. **Application**: `dark` class added to `<html>` element
4. **Styling**: CSS uses `:root.dark` selectors for dark mode
5. **Tailwind**: Tailwind's `dark:` prefix works automatically

## Color Palette

### Light Mode
```
Background: #FAFAF9 (off-white)
Text: #1C1C1C (soft black)
Primary: #2F5D50 (forest green)
Secondary: #A3B18A (moss green)
```

### Dark Mode
```
Background: #1A1A1A (dark)
Text: #F5F5F5 (light)
Primary: #4A8A6F (lighter forest)
Secondary: #7A9B6D (lighter moss)
```

## Testing Dark Mode

### Manual Testing
1. Click the Moon/Sun icon in navbar
2. Verify theme changes immediately
3. Refresh page - theme should persist
4. Check browser DevTools → Application → localStorage
5. Look for `leopold_theme` key

### Browser Console Testing
```javascript
// Toggle dark mode
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');

// Check current theme
localStorage.getItem('leopold_theme');

// Check if dark class is applied
document.documentElement.classList.contains('dark');
```

## Accessibility

✅ **WCAG AA Compliant** - All colors meet contrast requirements  
✅ **Smooth Transitions** - 0.3s transitions prevent jarring changes  
✅ **System Preference** - Respects OS dark mode setting  
✅ **Persistent** - Remembers user preference  
✅ **Clear Indicators** - Moon/Sun icons show current state  

## Common Tasks

### Add Dark Mode to a New Component
```svelte
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-black dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

### Create a Dark Mode Aware Button
```svelte
<button class="
  bg-primary-forest dark:bg-primary-sky
  text-secondary-sand dark:text-neutral-soft-black
  hover:bg-primary-earth dark:hover:bg-primary-forest
  transition-colors
">
  Click me
</button>
```

### Use CSS Variables
```svelte
<style>
  .my-component {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
</style>
```

## Troubleshooting

**Dark mode not working?**
- Check if `dark` class is on `<html>` element
- Verify localStorage has `leopold_theme` key
- Check browser console for errors

**Colors look wrong?**
- Verify Tailwind config has `darkMode: 'class'`
- Check CSS variables in `:root.dark`
- Ensure component uses correct class names

**Theme not persisting?**
- Check if localStorage is enabled
- Verify browser privacy settings
- Check for localStorage quota errors

## Documentation

For more detailed information, see:
- 📖 `DARK_MODE_GUIDE.md` - Comprehensive guide
- 📋 `DARK_MODE_IMPLEMENTATION.md` - Implementation details

## Status

🎉 **PRODUCTION READY**

Dark mode is fully implemented, tested, and ready to use!

---

**Quick Links**
- 🌙 Toggle button: Top navbar (Moon/Sun icon)
- 💾 Storage: `localStorage.getItem('leopold_theme')`
- 🎨 Colors: See color palette above
- 📚 Docs: See DARK_MODE_GUIDE.md

Happy coding! 🚀

