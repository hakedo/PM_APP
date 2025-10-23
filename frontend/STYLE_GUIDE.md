# Component Style Guide

This guide ensures consistent styling across all components in the application.

## Core Design Principles

1. **Single Source of Truth**: All styling decisions centralized in reusable components
2. **Consistency First**: Same component = same style everywhere
3. **Override When Needed**: Use className prop for specific customizations
4. **Responsive by Default**: All components mobile-first

## Standard Spacing

### Page Layout
```jsx
// Standard page wrapper
<div className="min-h-screen bg-gray-50 p-8">
  <div className="max-w-7xl mx-auto">
    {/* content */}
  </div>
</div>
```

### Component Spacing
- **Card spacing**: `border-gray-200` for borders
- **Section margins**: `mt-6` between major sections
- **Grid gaps**: `gap-4` for card grids, `gap-6` for form fields
- **Button gaps**: `gap-2` for icon + text

## Color System

### Backgrounds
- **Page background**: `bg-gray-50`
- **Card background**: `bg-white` (default)
- **Icon containers**: `bg-gray-900`
- **Hover states**: `hover:shadow-xl`

### Text Colors
- **Primary text**: `text-gray-900`
- **Secondary text**: `text-gray-600`
- **Muted text**: `text-gray-500`
- **Label text**: `text-gray-500 uppercase tracking-wider`

### Borders
- **Standard border**: `border-gray-200`
- **Input borders**: `border-gray-300`

## Icon Standards

### Icon Sizes
```jsx
// Page headers (large icons)
<Icon className="w-7 h-7" />

// Section headers
<Icon className="w-6 h-6" />

// Card headers
<Icon className="w-5 h-5" />

// Inline icons (buttons, labels)
<Icon className="w-4 h-4" />
```

### Icon Containers
```jsx
// Large (detail pages)
<div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
  <Icon className="w-7 h-7 text-white" />
</div>

// Medium (cards)
<div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
  <Icon className="w-5 h-5 text-white" />
</div>
```

## Typography

### Headers
```jsx
// Page title
<h1 className="text-4xl font-bold text-gray-900 mb-2">

// Section title
<h2 className="text-3xl font-bold text-gray-900">

// Card title
<h3 className="text-xl font-semibold text-gray-900">

// Field labels
<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
```

### Body Text
```jsx
// Primary content
<p className="text-gray-900 font-medium">

// Secondary content
<p className="text-gray-600">

// Muted/placeholder
<p className="text-gray-500">
```

## Animation Standards

### Page Entry
```jsx
// Main content
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

### Staggered Items (Grids)
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
```

### Card Hover
```jsx
<motion.div whileHover={{ y: -4 }}>
```

### Collapsible Content
```jsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  style={{ overflow: 'hidden' }}
>
```

## Button Styles

### Primary Actions
```jsx
<Button onClick={handleAction} size="lg" className="gap-2">
  <Icon className="w-4 h-4" />
  Action Text
</Button>
```

### Secondary Actions
```jsx
<Button variant="outline" size="sm" className="gap-2">
  <Icon className="w-4 h-4" />
  Action Text
</Button>
```

### Ghost Buttons (Back, Cancel)
```jsx
<Button variant="ghost" onClick={handleBack} className="gap-2">
  <ArrowLeft className="w-4 h-4" />
  Back
</Button>
```

### Destructive Actions
```jsx
<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>
```

### Loading States
```jsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

## Form Components

### Standard Form Layout
```jsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Field Label *</Label>
    <Input
      id="field"
      name="field"
      value={value}
      onChange={onChange}
      placeholder="Placeholder"
      required
    />
  </div>
  {/* More fields */}
</div>
```

### Grid Form Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>First Field</Label>
    <Input />
  </div>
  <div className="space-y-2">
    <Label>Second Field</Label>
    <Input />
  </div>
</div>
```

### Input Styling
```jsx
// Standard input
<Input className="border-gray-300" />

// With icon padding
<Input className="pl-7 border-gray-300" />
```

## Card Components

### Standard Card
```jsx
<Card className="border-gray-200">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Hover Card
```jsx
<Card className="hover:shadow-xl transition-all duration-300 border-gray-200">
```

### Interactive Card
```jsx
<Card 
  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200"
  onClick={handleClick}
>
```

## Grid Layouts

### Standard Responsive Grid
```jsx
// 3 columns on large screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// Or use GridLayout component
<GridLayout columns={3} gap={6}>
  {items.map(item => <Card key={item.id} />)}
</GridLayout>
```

### 2 Column Grid
```jsx
<GridLayout columns={2} gap={4}>
```

### 4 Column Grid
```jsx
<GridLayout columns={4} gap={4}>
```

## Component Usage Examples

### Page Structure
```jsx
function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Page Title"
          description="Page description"
          action={<Button>Action</Button>}
        />

        {isEmpty ? (
          <EmptyState
            icon={Icon}
            title="Empty State"
            description="Description"
            actionLabel="Add Item"
            onAction={handleAdd}
          />
        ) : (
          <GridLayout columns={3} gap={6}>
            {/* Items */}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
```

### Detail Page Structure
```jsx
function DetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={goBack} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Main info card */}
        <CollapsibleInfoCard
          title={title}
          subtitle={subtitle}
          icon={Icon}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          {/* Content */}
        </CollapsibleInfoCard>

        {/* Additional sections */}
        <Section title="Section" icon={Icon} count={count} className="mt-6">
          <GridLayout columns={3} gap={4}>
            {/* Items */}
          </GridLayout>
        </Section>
      </div>
    </div>
  );
}
```

## Responsive Breakpoints

### Standard Breakpoints
- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

### Usage
```jsx
// 1 column on mobile, 2 on tablet, 3 on desktop
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Different spacing
className="gap-4 md:gap-6"

// Conditional display
className="hidden md:block"
```

## Customization Guidelines

### When to Use className Prop
Use the `className` prop for:
- **One-off spacing**: `className="mt-8"` instead of default `mt-6`
- **Width adjustments**: `className="max-w-4xl"` for narrower content
- **Additional styling**: Adding extra classes without breaking defaults

### When to Create New Component
Create a new component when:
- Pattern is used 3+ times
- Variation is significant enough to warrant its own component
- Styling logic is complex

### Example: Proper Customization
```jsx
// Good: Extend default styling
<Section className="mt-8 mb-12" title="Custom Spacing" icon={Icon}>

// Bad: Override all styling (should create new component instead)
<Section className="bg-blue-500 p-20 rounded-full" title="..." icon={Icon}>
```

## Accessibility

### Always Include
- `aria-label` for icon-only buttons
- `alt` text for images
- `htmlFor` matching `id` for labels
- Keyboard navigation support

### Example
```jsx
<Button aria-label="Delete client" variant="ghost" size="sm">
  <Trash2 className="w-4 h-4" />
</Button>

<Label htmlFor="email">Email</Label>
<Input id="email" name="email" type="email" />
```

## Testing Checklist

When creating/modifying components:
- ✅ Works on mobile (320px+)
- ✅ Works on tablet (768px+)
- ✅ Works on desktop (1024px+)
- ✅ Keyboard accessible
- ✅ Loading states handled
- ✅ Error states handled
- ✅ Empty states handled
- ✅ Animations smooth
- ✅ Colors match design system
- ✅ Spacing consistent

## Common Mistakes to Avoid

### ❌ Don't Do This
```jsx
// Inconsistent spacing
<div className="mt-5 mb-7">

// Non-standard colors
<div className="bg-blue-400 text-red-500">

// Inline styles
<div style={{ marginTop: '20px' }}>

// Hardcoded values
<div className="w-[347px]">

// Inconsistent border colors
<Card className="border-green-500">
```

### ✅ Do This Instead
```jsx
// Standard spacing
<div className="mt-6 mb-6">

// Standard colors
<div className="bg-gray-900 text-white">

// Tailwind classes
<div className="mt-6">

// Semantic sizing
<div className="max-w-7xl mx-auto">

// Standard border
<Card className="border-gray-200">
```

## Quick Reference

### Most Common Patterns
```jsx
// Page wrapper
<div className="min-h-screen bg-gray-50 p-8">
  <div className="max-w-7xl mx-auto">

// Section spacing
className="mt-6"

// Icon container
<div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Card
<Card className="border-gray-200">

// Button with icon
<Button className="gap-2">
  <Icon className="w-4 h-4" />
  Text
</Button>
```

## Summary

**Golden Rules:**
1. Use existing components whenever possible
2. Follow the established spacing and color system
3. Maintain responsive behavior
4. Add animations consistently
5. Test on multiple screen sizes
6. Keep accessibility in mind
7. When in doubt, look at existing code for examples

**Result:** Consistent, maintainable, professional UI across the entire application.
