# UI Settings Feature 🎨

## Overview
A powerful, admin-only **Settings Page** that lets you customize every UI element across all dashboards in real-time without touching the code!

## Location
**Admin Dashboard → Settings Tab**

## Features

### 1. **Button Customization**
- Size presets (Small, Medium, Large, Extra Large)
- Font size and weight
- Border radius (rounded corners)
- Horizontal and vertical padding
- **Live Preview** - See changes instantly!

### 2. **Card Customization**
- Border radius
- Border width
- Padding
- Shadow size (None to Extra Large)
- **Live Preview** with sample card

### 3. **Text Customization**
- Heading font size and weight
- Body font size and weight
- Small text size
- **Live Preview** showing all text styles

### 4. **Logo Customization**
- Logo text (change "HIMS" to anything)
- Logo container size
- Icon size
- Toggle icon visibility
- **Live Preview** with actual logo

### 5. **Theme Settings**
- Theme mode (Light, Dark, System)
- Primary color picker
- Accent color picker
- **Live Preview** with color swatches

### 6. **Spacing Settings**
- Container padding
- Section gap
- Element gap
- **Live Preview** showing spacing hierarchy

## How to Use

### Making Changes
1. Go to **Admin Dashboard**
2. Click on **Settings** tab (gear icon)
3. Select the category you want to customize (Buttons, Cards, Text, Logo, Theme, Spacing)
4. Modify the values using inputs, dropdowns, or color pickers
5. See changes apply **immediately** in the preview
6. Changes are **automatically saved** to browser's localStorage

### Export Settings
1. Click the **Export** button
2. Settings JSON is copied to clipboard
3. Share with team or save as backup

### Import Settings
1. Click the **Import** button
2. Paste the settings JSON
3. Click **Import**
4. All settings are applied instantly

### Reset to Default
1. Click the **Reset** button
2. Confirm the action
3. All settings return to factory defaults

## Technical Details

### Storage
- Settings are saved to **localStorage**
- Persists across browser sessions
- Survives page refreshes
- Each user has their own settings

### CSS Variables
All settings are applied using CSS custom properties:
```css
--btn-font-size
--btn-font-weight
--btn-border-radius
--btn-padding-x
--btn-padding-y
--card-border-radius
--card-border-width
--card-padding
--card-shadow
--heading-font-size
--body-font-size
--small-font-size
--heading-font-weight
--body-font-weight
--logo-size
--logo-icon-size
--container-padding
--section-gap
--element-gap
--custom-primary
--custom-accent
```

### Global Application
Settings apply to:
- ✅ Admin Dashboard
- ✅ Doctor Dashboard
- ✅ Patient Dashboard
- ✅ Pharmacist Dashboard
- ✅ Login Page
- ✅ All forms and components

## Default Values

```json
{
  "button": {
    "size": "md",
    "fontSize": "14px",
    "fontWeight": "600",
    "borderRadius": "8px",
    "paddingX": "16px",
    "paddingY": "10px"
  },
  "card": {
    "borderRadius": "12px",
    "borderWidth": "2px",
    "padding": "24px",
    "shadowSize": "lg"
  },
  "text": {
    "headingFontSize": "24px",
    "bodyFontSize": "14px",
    "smallFontSize": "12px",
    "headingFontWeight": "700",
    "bodyFontWeight": "400"
  },
  "logo": {
    "size": "56px",
    "text": "HIMS",
    "showIcon": true,
    "iconSize": "28px"
  },
  "theme": {
    "mode": "system",
    "primaryColor": "#3b82f6",
    "accentColor": "#8b5cf6"
  },
  "spacing": {
    "containerPadding": "32px",
    "sectionGap": "32px",
    "elementGap": "16px"
  }
}
```

## Examples

### Making Buttons Larger
1. Go to Settings → Buttons
2. Select "Large" from Size Preset
3. Or manually set:
   - Font Size: `16px`
   - Padding X: `20px`
   - Padding Y: `12px`

### Changing Brand Colors
1. Go to Settings → Theme
2. Click Primary Color picker
3. Choose your brand color
4. Click Accent Color picker  
5. Choose complementary color
6. See all buttons and highlights update!

### Increasing Spacing
1. Go to Settings → Spacing
2. Set Container Padding: `48px`
3. Set Section Gap: `48px`
4. All pages feel more spacious!

### Custom Logo
1. Go to Settings → Logo
2. Change Text to your hospital name
3. Adjust sizes as needed
4. Toggle icon off if you want text only

## Benefits

✅ **No Code Changes Needed** - Customize without developer help  
✅ **Real-time Preview** - See changes before applying  
✅ **Persistent** - Settings saved automatically  
✅ **Portable** - Export/import for consistency  
✅ **Safe** - Reset to defaults anytime  
✅ **Fast** - Changes apply instantly  
✅ **Professional** - Maintains design consistency

## Tips

- Start with button size preset, then fine-tune
- Use color picker for precise brand matching
- Export settings before making major changes
- Test in both light and dark mode
- Keep text sizes accessible (not too small)
- Maintain good contrast ratios

## Support

For questions or issues with UI settings:
1. Reset to defaults first
2. Try exporting and re-importing
3. Clear browser cache if settings don't apply
4. Check browser console for errors

---

**Created:** $(Get-Date)  
**Version:** 1.0  
**Author:** Hospital Management System Team
