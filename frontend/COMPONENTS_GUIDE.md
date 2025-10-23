# Reusable Components Guide

This guide explains how to use the new reusable components created during the refactoring.

## UI Components

### LoadingSpinner
Displays a loading spinner with optional text.

```jsx
import { LoadingSpinner } from '../../components/ui';

// Simple usage
<LoadingSpinner />

// With custom size and text
<LoadingSpinner className="w-12 h-12" text="Loading data..." />
```

### EmptyState
Shows an empty state with icon, title, description, and optional action button.

```jsx
import { EmptyState } from '../../components/ui';
import { Users } from 'lucide-react';

<EmptyState
  icon={Users}
  title="No clients yet"
  description="Get started by adding your first client"
  actionLabel={<><Plus className="w-4 h-4" />Add Client</>}
  onAction={handleAddClient}
/>
```

### PageHeader
Consistent page header with title, description, and action button.

```jsx
import { PageHeader } from '../../components/ui';

<PageHeader
  title="Clients"
  description="Manage your client contacts"
  action={
    <Button onClick={handleAdd} size="lg">
      <Plus className="w-4 h-4" />
      New Client
    </Button>
  }
/>
```

### ConfirmDialog
Reusable confirmation dialog for destructive actions.

```jsx
import { ConfirmDialog } from '../../components/ui';

<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Client?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
  loading={isDeleting}
  variant="destructive"
/>
```

## Form Components

### ClientFormDialog
Complete dialog for creating/editing clients.

```jsx
import { ClientFormDialog } from '../../components/forms';

const [clientData, setClientData] = useState({
  company: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: ''
});

<ClientFormDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  client={clientData}
  onChange={setClientData}
  onSubmit={handleSubmit}
  loading={isSubmitting}
  title="Add New Client"
  description="Enter client information"
/>
```

### ProjectFormDialog
Complete dialog for creating/editing projects.

```jsx
import { ProjectFormDialog } from '../../components/forms';

const [projectData, setProjectData] = useState({
  title: '',
  description: '',
  startDate: '',
  endDate: ''
});

<ProjectFormDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  project={projectData}
  onChange={setProjectData}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

## Display Components

### ClientGrid
Animated grid of client cards.

```jsx
import { ClientGrid } from '../../components/clients';

<ClientGrid
  clients={clients}
  onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
  onEditClient={handleEdit}
  onDeleteClient={handleDelete}
  showActions={true}
/>
```

### ProjectGrid
Animated grid of project cards.

```jsx
import { ProjectGrid } from '../../components/projects';

<ProjectGrid
  projects={projects}
  onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
  onDeleteProject={handleDelete}
  teamMembers={teamMembers}
  showActions={true}
/>
```

## Custom Hooks

### useFormDialog
Manages form dialog state, opening, closing, and submission.

```jsx
import { useFormDialog } from '../../hooks';

const {
  isOpen,
  formData,
  isSubmitting,
  openDialog,
  closeDialog,
  updateFormData,
  setFormData,
  handleSubmit
} = useFormDialog({
  title: '',
  description: ''
});

// Open dialog
openDialog({ title: 'Initial', description: 'Values' });

// Update form
updateFormData({ title: 'New Title' });

// Submit
await handleSubmit(async (data) => {
  await api.create(data);
});
```

### useConfirmDialog
Manages confirmation dialog state and actions.

```jsx
import { useConfirmDialog } from '../../hooks';

const {
  isOpen,
  config,
  openConfirmDialog,
  closeConfirmDialog,
  handleConfirm
} = useConfirmDialog();

// Open confirmation
openConfirmDialog({
  title: 'Delete Item?',
  description: 'This cannot be undone.',
  onConfirm: async () => {
    await deleteItem(id);
  },
  variant: 'destructive'
});

// Use with ConfirmDialog component
<ConfirmDialog
  open={isOpen}
  onOpenChange={closeConfirmDialog}
  title={config.title}
  description={config.description}
  onConfirm={handleConfirm}
  variant={config.variant}
/>
```

## Utility Functions

### formatPhoneNumber
Formats phone numbers to (XXX) XXX-XXXX format.

```jsx
import { formatPhoneNumber } from '../../utils/formatters';

const formatted = formatPhoneNumber('5551234567');
// Returns: "(555) 123-4567"
```

## Best Practices

1. **Always use reusable components** instead of duplicating code
2. **Leverage custom hooks** for common state management patterns
3. **Keep page components simple** - delegate to child components
4. **Use ShadCN UI components** as the foundation
5. **Maintain consistent spacing** and styling across components
6. **Handle loading and error states** consistently
7. **Add animations** using framer-motion for better UX

## Component Props Reference

### Common Props Pattern
Most components follow this pattern:
- `open` / `isOpen` - Controls visibility
- `onOpenChange` / `onClose` - Handles closing
- `loading` / `isLoading` - Shows loading state
- `disabled` - Disables interactions
- `className` - Additional CSS classes
- `variant` - Visual variant (default, destructive, outline, etc.)

### Event Handler Props
- `onClick` - Click handler
- `onChange` - Change handler
- `onSubmit` - Form submission
- `onConfirm` - Confirmation handler
- `onAction` - Generic action handler

## Migration Guide

### Before (Old Pattern)
```jsx
function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <div>
      <div className="flex justify-between">
        <h1>Clients</h1>
        <Button onClick={() => setIsOpen(true)}>Add</Button>
      </div>
      
      <Dialog open={isOpen}>
        {/* 100 lines of form fields */}
      </Dialog>
    </div>
  );
}
```

### After (New Pattern)
```jsx
import { PageHeader, EmptyState } from '../../components/ui';
import { ClientFormDialog } from '../../components/forms';
import { ClientGrid } from '../../components/clients';

function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Clients"
          description="Manage your client contacts"
          action={<Button onClick={() => setIsOpen(true)}>Add</Button>}
        />
        
        {clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients yet" />
        ) : (
          <ClientGrid clients={clients} />
        )}
        
        <ClientFormDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          client={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
```

## Next Steps

1. Continue refactoring remaining pages using these components
2. Add more specialized components as patterns emerge
3. Create Storybook documentation for visual component reference
4. Add unit tests for reusable components
5. Consider TypeScript migration for better type safety
