# Component Architecture

## Component Hierarchy

```
App
├── Navigation
└── Routes
    ├── Clients (Page)
    │   ├── PageHeader
    │   │   └── Button (New Client)
    │   ├── EmptyState (when no clients)
    │   │   ├── Icon
    │   │   ├── Title
    │   │   ├── Description
    │   │   └── Button
    │   ├── ClientGrid (when clients exist)
    │   │   └── ClientCard (for each client)
    │   │       ├── Card
    │   │       │   ├── CardHeader
    │   │       │   │   ├── Icon
    │   │       │   │   ├── Client Info
    │   │       │   │   └── DropdownMenu
    │   │       │   │       ├── Edit MenuItem
    │   │       │   │       └── Delete MenuItem
    │   │       │   └── CardContent
    │   │       │       ├── Email
    │   │       │       ├── Phone
    │   │       │       └── Address
    │   └── ClientFormDialog
    │       ├── Dialog
    │       │   ├── DialogHeader
    │       │   ├── Form
    │       │   │   └── ClientFormFields
    │       │   │       ├── Input (firstName)
    │       │   │       ├── Input (lastName)
    │       │   │       ├── Input (email)
    │       │   │       ├── Input (phone)
    │       │   │       ├── Input (address)
    │       │   │       └── ... (more fields)
    │       │   └── DialogFooter
    │       │       ├── Button (Cancel)
    │       │       └── Button (Save)
    │
    ├── Projects (Page)
    │   ├── PageHeader
    │   │   └── Button (New Project)
    │   ├── EmptyState (when no projects)
    │   ├── ProjectGrid (when projects exist)
    │   │   └── ProjectCard (for each project)
    │   │       ├── Card
    │   │       │   ├── CardHeader
    │   │       │   │   ├── Icon
    │   │       │   │   ├── Project Info
    │   │       │   │   └── DropdownMenu
    │   │       │   │       └── Delete MenuItem
    │   │       │   └── CardContent
    │   │       │       ├── Dates
    │   │       │       ├── Team Members Badge
    │   │       │       └── Milestones Badge
    │   └── ProjectFormDialog
    │       ├── Dialog
    │       │   ├── DialogHeader
    │       │   ├── Form
    │       │   │   └── ProjectFormFields
    │       │   │       ├── Input (title)
    │       │   │       ├── Textarea (description)
    │       │   │       ├── Input (startDate)
    │       │   │       └── Input (endDate)
    │       │   └── DialogFooter
    │       │       ├── Button (Cancel)
    │       │       └── Button (Create)
    │
    ├── ClientDetails (Page) [To be refactored]
    │   ├── PageHeader
    │   │   ├── Back Button
    │   │   └── Edit/Save Buttons
    │   ├── Client Info Card
    │   │   └── ClientFormFields (edit mode)
    │   └── Assigned Projects Section
    │       └── ProjectCard (for each project)
    │
    └── ProjectDetails (Page) [To be refactored - 2972 lines!]
        ├── PageHeader
        │   ├── Back Button
        │   └── Edit/Save Buttons
        ├── Project Info Card
        │   └── ProjectFormFields (edit mode)
        ├── Assigned Clients Section
        │   ├── Search Input
        │   ├── Add Client Button
        │   └── ClientCard (for each client)
        ├── Milestones Section
        │   ├── Add Milestone Button
        │   └── MilestoneCard (for each milestone)
        │       ├── Milestone Header
        │       │   ├── Name & Status
        │       │   └── Actions Menu
        │       ├── Deliverables Section
        │       │   ├── Add Deliverable Button
        │       │   └── DeliverableCard (for each deliverable)
        │       │       ├── Deliverable Header
        │       │       │   ├── Title & Dates
        │       │       │   └── Actions Menu
        │       │       └── Tasks Section
        │       │           ├── Add Task Button
        │       │           └── TaskItem (for each task)
        │       │               ├── Task Info
        │       │               └── Actions Menu
        └── Gantt Chart Section
            └── GanttChart Component
```

## Component Dependencies

### Page Components
```
Clients.jsx
├── imports from '../../components/ui'
│   ├── Button
│   ├── LoadingSpinner
│   ├── EmptyState
│   └── PageHeader
├── imports from '../../components/clients'
│   └── ClientGrid
│       └── ClientCard
├── imports from '../../components/forms'
│   └── ClientFormDialog
│       └── ClientFormFields
└── imports from '../../hooks'
    └── useClients

Projects.jsx
├── imports from '../../components/ui'
│   ├── Button
│   ├── LoadingSpinner
│   ├── EmptyState
│   └── PageHeader
├── imports from '../../components/projects'
│   └── ProjectGrid
│       └── ProjectCard
├── imports from '../../components/forms'
│   └── ProjectFormDialog
│       └── ProjectFormFields
└── imports from '../../hooks'
    ├── useProjects
    └── useTeam
```

### Shared Component Dependencies
```
All Form Components
└── depend on '../../components/ui'
    ├── Dialog
    ├── DialogContent
    ├── DialogHeader
    ├── DialogFooter
    ├── Input
    ├── Label
    ├── Textarea
    └── Button

All Card Components
└── depend on '../../components/ui'
    ├── Card
    ├── CardHeader
    ├── CardContent
    ├── DropdownMenu
    └── Button
```

## Data Flow

### Client Management Flow
```
1. User Action (Add/Edit/Delete)
   ↓
2. Page Component (Clients.jsx)
   ↓
3. Custom Hook (useClients)
   ↓
4. Service Layer (clientService)
   ↓
5. API Call (backend)
   ↓
6. State Update
   ↓
7. Re-render Components
```

### Form Submission Flow
```
1. User fills ClientFormDialog
   ↓
2. ClientFormFields updates formData state
   ↓
3. User clicks Save
   ↓
4. onSubmit handler in page component
   ↓
5. createClient/updateClient from useClients
   ↓
6. API call via clientService
   ↓
7. Success: closeDialog, refetch data
   Error: display error, keep dialog open
```

## Component Communication

### Props Down, Events Up
```
Parent (Clients.jsx)
│
├─→ [props] → ClientGrid
│                │
│                ├─→ [props] → ClientCard
│                │                │
│                ←─ [event] ──────┘
│              onClientClick(id)
│
├─→ [props] → ClientFormDialog
│                │
│                ├─→ [props] → ClientFormFields
│                │                │
│                ←─ [event] ──────┘
│              onChange(data)
│
←─ [event] ────────┘
  onSubmit(data)
```

## State Management Patterns

### Local State (useState)
- Form input values
- Dialog open/closed state
- Loading states
- Editing mode flags

### Custom Hooks State
- `useClients` - clients list, CRUD operations
- `useProjects` - projects list, CRUD operations
- `useFormDialog` - form dialog state management
- `useConfirmDialog` - confirmation dialog state

### Derived State
- Filtered lists
- Computed values (fullName, formatted dates)
- Display-only states

## Styling Architecture

### Tailwind CSS Classes
- Utility-first approach
- Responsive design with md:, lg: prefixes
- Consistent spacing (p-8, gap-6, etc.)
- Color system (gray-900, gray-600, etc.)

### ShadCN UI Variants
- Button variants: default, outline, ghost, destructive
- Badge variants: default, secondary, outline
- Card styling: border, shadow, hover effects

### Animations (Framer Motion)
- Page transitions
- Card hover effects
- List item stagger animations
- Dialog enter/exit animations

## Testing Strategy (Recommended)

### Unit Tests
```
components/ui/
├── LoadingSpinner.test.jsx
├── EmptyState.test.jsx
├── ConfirmDialog.test.jsx
└── PageHeader.test.jsx

components/forms/
├── ClientFormFields.test.jsx
├── ClientFormDialog.test.jsx
├── ProjectFormFields.test.jsx
└── ProjectFormDialog.test.jsx

hooks/
├── useFormDialog.test.js
└── useConfirmDialog.test.js
```

### Integration Tests
```
pages/
├── Clients.test.jsx
└── Projects.test.jsx
```

### E2E Tests
```
e2e/
├── client-management.spec.js
└── project-management.spec.js
```

## Performance Considerations

### Code Splitting
- Lazy load pages with React.lazy()
- Separate bundles for each route
- Lazy load heavy components (GanttChart)

### Memoization
- Use React.memo() for expensive card components
- useMemo() for derived/filtered lists
- useCallback() for event handlers passed to children

### Virtualization
- Consider react-window for large lists (100+ items)
- Implement pagination for API calls

## Accessibility

### ARIA Labels
- Add aria-label to icon-only buttons
- Add aria-describedby to form fields
- Add role attributes where appropriate

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Tab order is logical
- Escape key closes dialogs

### Screen Readers
- Semantic HTML (header, main, nav, section)
- Alt text for images/icons
- Descriptive button text

## Future Enhancements

1. **Add Storybook** - Visual documentation for all components
2. **TypeScript Migration** - Type safety across the codebase
3. **Error Boundaries** - Graceful error handling
4. **Suspense Boundaries** - Better loading states
5. **Context API** - For deeply nested component props
6. **React Query** - Advanced server state management
7. **Zod Validation** - Form validation schema
8. **Skeleton Loaders** - Better loading UX
