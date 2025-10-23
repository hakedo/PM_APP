# Shadcn UI Components - Complete Reference

This project uses **shadcn/ui** exclusively for all UI components. Below is a comprehensive list of all available components.

## Installation Complete ✅

All shadcn/ui components have been successfully installed and configured.

## Core shadcn/ui Components

### Form Controls
- **Button** - `./button.jsx`
  - Variants: default, destructive, outline, secondary, ghost, link
  - Sizes: default, sm, lg, icon, icon-sm, icon-lg
  
- **Input** - `./input.jsx`
  - Text input with full form support
  
- **Textarea** - `./textarea.jsx`
  - Multi-line text input
  
- **Label** - `./label.jsx`
  - Accessible form labels
  
- **Checkbox** - `./checkbox.jsx`
  - Checkbox input with Radix UI
  
- **RadioGroup** - `./radio-group.jsx`
  - Radio button groups
  
- **Switch** - `./switch.jsx`
  - Toggle switch component
  
- **Slider** - `./slider.jsx`
  - Range slider input
  
- **Select** - `./select.jsx`
  - Custom select dropdown

### Layout Components
- **Card** - `./card.jsx`
  - Exports: Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
  
- **Separator** - `./separator.jsx`
  - Visual divider line
  
- **ScrollArea** - `./scroll-area.jsx`
  - Custom scrollable area
  
- **Sheet** - `./sheet.jsx`
  - Slide-out panel (Exports: Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter)

### Navigation & Overlay
- **Dialog** - `./dialog.jsx`
  - Modal dialogs (Exports: Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger)
  
- **Dropdown Menu** - `./dropdown-menu.jsx`
  - Context menus (Exports: DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel)
  
- **Tabs** - `./tabs.jsx`
  - Tab navigation (Exports: Tabs, TabsList, TabsTrigger, TabsContent)
  
- **Accordion** - `./accordion.jsx`
  - Collapsible sections (Exports: Accordion, AccordionContent, AccordionItem, AccordionTrigger)
  
- **Command** - `./command.jsx`
  - Command palette (Exports: Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator)
  
- **Popover** - `./popover.jsx`
  - Floating popover (Exports: Popover, PopoverContent, PopoverTrigger)
  
- **Tooltip** - `./tooltip.jsx`
  - Hover tooltips (Exports: Tooltip, TooltipContent, TooltipProvider, TooltipTrigger)

### Display Components
- **Badge** - `./badge.jsx`
  - Status badges
  
- **Avatar** - `./avatar.jsx`
  - User avatars (Exports: Avatar, AvatarImage, AvatarFallback)
  
- **Alert** - `./alert.jsx`
  - Alert messages (Exports: Alert, AlertTitle, AlertDescription)
  
- **Progress** - `./progress.jsx`
  - Progress bars
  
- **Skeleton** - `./skeleton.jsx`
  - Loading skeletons

### Data Display
- **Table** - `./table.jsx`
  - Data tables (Exports: Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption)
  
- **Calendar** - `./calendar.jsx`
  - Date picker calendar

### Forms & Validation
- **Form** - `./form.jsx`
  - Form context with react-hook-form integration
  - Exports: Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage

### Notifications
- **Sonner (Toast)** - `./sonner.jsx`
  - Toast notifications using Sonner library
  - Exports: Toaster

## Custom Components Built with Shadcn

These are custom components built on top of shadcn primitives:

### Utility Components
- **LoadingSpinner** - `./loading-spinner.jsx`
  - Full-page loading indicator using Lucide icons
  
- **EmptyState** - `./empty-state.jsx`
  - Empty state with icon, title, description, and action button
  
- **ConfirmDialog** - `./confirm-dialog.jsx`
  - Confirmation dialog built with shadcn Dialog + Button

### Layout Helpers
- **PageHeader** - `./page-header.jsx`
  - Page header with title, description, and action
  
- **DetailPageHeader** - `./detail-page-header.jsx`
  - Detailed page header with icon, back button, and actions
  
- **Section** - `./section.jsx`
  - Reusable section component with Card + header
  
- **GridLayout** - `./grid-layout.jsx`
  - Responsive grid layouts (Exports: GridLayout, AnimatedGrid)

### Domain-Specific Components
- **InfoField** - `./info-field.jsx`
  - Field display/edit with icon and label
  
- **CollapsibleInfoCard** - `./collapsible-info-card.jsx`
  - Collapsible card with edit mode
  
- **AssignedProjectCard** - `./assigned-project-card.jsx`
  - Project card for client assignments

## Global Providers

Configured in `App.jsx`:

```jsx
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';

<TooltipProvider>
  <App />
  <Toaster />
</TooltipProvider>
```

## Usage

All components can be imported from the central export:

```jsx
import { 
  Button, 
  Card, 
  CardContent, 
  Dialog,
  Input,
  Label,
  // ... etc
} from '@/components/ui';
```

## Configuration

### Path Aliases
- `@/` → `./src/`
- Configured in `vite.config.js` and `jsconfig.json`

### Theme
- CSS variables defined in `src/index.css`
- Based on Tailwind CSS v4
- Color palette: Slate/Gray theme

### Dependencies
All required Radix UI primitives are installed:
- @radix-ui/react-dialog
- @radix-ui/react-label
- @radix-ui/react-checkbox
- @radix-ui/react-radio-group
- @radix-ui/react-switch
- @radix-ui/react-slider
- @radix-ui/react-progress
- @radix-ui/react-tooltip
- @radix-ui/react-popover
- @radix-ui/react-accordion
- @radix-ui/react-scroll-area
- @radix-ui/react-slot
- @radix-ui/react-icons

### Form Handling
- react-hook-form (^7.65.0)
- zod (^4.1.12) for validation
- @hookform/resolvers (^5.2.2)

### Additional Libraries
- framer-motion (^12.23.24) - animations
- lucide-react (^0.546.0) - icons
- sonner (^2.0.7) - toast notifications
- date-fns (^4.1.0) - date utilities
- react-day-picker (^9.11.1) - calendar

## No Non-Shadcn Components

✅ All UI components in this project are built exclusively with shadcn/ui
✅ No raw HTML form elements (`<button>`, `<input>`, `<select>`, etc.)
✅ No other UI libraries or frameworks
✅ Consistent design system throughout the application

## Component Architecture

```
frontend/src/
├── components/
│   ├── ui/                    # All shadcn components
│   ├── clients/               # Domain components using shadcn
│   ├── forms/                 # Form components using shadcn
│   ├── gantt/                 # Gantt chart using shadcn
│   ├── project-details/       # Project detail components using shadcn
│   └── projects/              # Project components using shadcn
├── pages/                     # Page components using shadcn
└── layouts/                   # Layout components using shadcn
```

All components follow the shadcn/ui philosophy of being:
- Copy-paste friendly
- Fully customizable
- Accessible by default
- Built on Radix UI primitives
- Styled with Tailwind CSS
