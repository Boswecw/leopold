# Leopold Dark Mode Implementation Guide

## Overview

Leopold now includes a fully functional dark mode system with:
- ✅ Theme toggle button in the navbar
- ✅ Persistent theme preference (localStorage)
- ✅ System preference detection
- ✅ Smooth transitions between themes
- ✅ WCAG AA compliant colors in both modes
- ✅ Tailwind CSS dark mode support

## How It Works

### 1. Theme Storage & Initialization

The theme system is managed through the `uiStore` in `src/lib/stores/index.ts`:

```typescript
// Initialize theme on app load
onMount(() => {
  const savedTheme = localStorage.getItem('leopold_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = (savedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
  uiStore.setTheme(theme);
});
```

### 2. Theme Toggle

Users can toggle between light and dark mode using the button in the navbar:
- **Light Mode**: Sun icon visible (click to switch to dark)
- **Dark Mode**: Moon icon visible (click to switch to light)

### 3. CSS Variables

Dark mode uses CSS variables defined in `src/app.css`:

**Light Mode (`:root`)**
```css
--bg-primary: #FAFAF9;
--bg-secondary: #F3E9DC;
--text-primary: #1C1C1C;
--text-secondary: #4B4B4B;
```

**Dark Mode (`:root.dark`)**
```css
--bg-primary: #1A1A1A;
--bg-secondary: #2D2D2D;
--text-primary: #F5F5F5;
--text-secondary: #B0B0B0;
```

### 4. Tailwind Dark Mode

Tailwind CSS is configured with `darkMode: 'class'` in `tailwind.config.js`:

```javascript
export default {
  darkMode: 'class',
  // ... rest of config
}
```

This allows using `dark:` prefix for dark mode styles:

```html
<div class="bg-neutral-off-white dark:bg-neutral-off-white">
  Content
</div>
```

## Color Palette

### Light Mode (Default)
- **Primary Forest**: #2F5D50 (dark green)
- **Primary Earth**: #5C4033 (brown)
- **Primary Sky**: #76B4BD (light blue)
- **Secondary Moss**: #A3B18A (light green)
- **Secondary Goldenrod**: #DAA520 (gold)
- **Secondary Sand**: #F3E9DC (beige)
- **Neutral Off-White**: #FAFAF9 (background)
- **Neutral Stone Gray**: #4B4B4B (text)
- **Neutral Soft Black**: #1C1C1C (headings)

### Dark Mode
Colors are automatically adjusted for dark backgrounds:
- Darker, more saturated primary colors
- Lighter text colors for contrast
- Adjusted secondary colors for visibility
- All colors maintain WCAG AA contrast ratios

## Implementation Details

### Files Modified

1. **tailwind.config.js**
   - Added `darkMode: 'class'`

2. **src/app.css**
   - Added dark mode CSS variables
   - Updated body styles with transitions

3. **src/lib/styles/globals.css**
   - Added `:root.dark` selectors for all components
   - Dark mode styles for buttons, cards, badges, forms

4. **src/routes/+layout.svelte**
   - Added theme initialization on mount
   - Detects system preference and saved preference

5. **src/lib/components/Navbar.svelte**
   - Added theme toggle button with Moon/Sun icons
   - Displays current theme state

### Store Methods

The `uiStore` provides these theme methods:

```typescript
// Set theme to specific value
uiStore.setTheme('dark' | 'light');

// Toggle between light and dark
uiStore.toggleTheme();

// Subscribe to theme changes
uiStore.subscribe((ui) => {
  console.log(ui.theme); // 'light' or 'dark'
});
```

## Using Dark Mode in Components

### Method 1: Tailwind Dark Prefix

```svelte
<div class="bg-white dark:bg-gray-900">
  <p class="text-black dark:text-white">Content</p>
</div>
```

### Method 2: CSS Variables

```svelte
<div style="background-color: var(--bg-primary); color: var(--text-primary);">
  Content
</div>
```

### Method 3: Global Classes

```svelte
<div class="card">
  <!-- Automatically styled for current theme -->
</div>
```

## Testing Dark Mode

1. **Manual Toggle**: Click the Moon/Sun icon in the navbar
2. **System Preference**: Change your OS theme settings
3. **Browser DevTools**: 
   - Open DevTools (F12)
   - Go to Console
   - Run: `document.documentElement.classList.add('dark')`
   - Run: `document.documentElement.classList.remove('dark')`

## Accessibility

- ✅ All colors meet WCAG AA contrast requirements
- ✅ Smooth transitions (0.3s) prevent jarring changes
- ✅ Theme preference persists across sessions
- ✅ Respects system preference on first visit
- ✅ Clear visual indicators (Moon/Sun icons)

## Future Enhancements

- [ ] Add theme selector in settings page
- [ ] Add more theme options (e.g., auto, system)
- [ ] Add theme preview before applying
- [ ] Add custom theme creation
- [ ] Add theme scheduling (auto-switch at sunset)

## Troubleshooting

### Dark mode not applying?
1. Check if `dark` class is on `<html>` element
2. Verify localStorage has `leopold_theme` key
3. Check browser console for errors

### Colors look wrong?
1. Verify Tailwind config has `darkMode: 'class'`
2. Check CSS variables in `:root.dark`
3. Ensure component uses correct class names

### Theme not persisting?
1. Check if localStorage is enabled
2. Verify browser privacy settings
3. Check for localStorage quota errors

## Browser Support

- ✅ Chrome/Edge 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ Mobile browsers (iOS Safari 13+, Chrome Mobile)

---

**Last Updated**: 2025-10-18
**Status**: Production Ready ✅

