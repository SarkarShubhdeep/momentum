# Context Menu Implementation

## Overview

A fully functional right-click context menu has been implemented in the `TodoCard` component using the shadcn ContextMenu component. This provides quick access to common task actions with submenus for category and priority selection.

## Features

### Context Menu Actions

-   **Edit Task**: Opens task editing mode
-   **Duplicate Task**: Creates a copy of the current task with "(Copy)" suffix
-   **Category**: Submenu to select from available categories with visual indicators
-   **Set Priority**: Submenu to select High | Medium | Low | None with visual indicators
-   **Archive Task**: Marks task as completed (archived)
-   **Delete Task**: Removes task permanently (with red styling to indicate destructive action)

### Technical Implementation

-   **Component**: Uses `ContextMenu` from `@/components/ui/context-menu`
-   **Submenus**: Uses `DropdownMenu` for category and priority selection
-   **Trigger**: Right-click anywhere on the task card
-   **Icons**: Each menu item includes a relevant Lucide React icon
-   **Styling**: Consistent with shadcn design system
-   **Separators**: Visual grouping of related actions
-   **Visual Indicators**: Current category and priority are highlighted in submenus

### Menu Structure

```
┌─────────────────────────┐
│ ✏️  Edit Task           │
│ 📋 Duplicate Task       │
│ ─────────────────────── │
│ 📁 Category >           │
│    ├─ No Category       │
│    ├─ Work              │
│    ├─ Personal          │
│    └─ Shopping          │
│ ⚠️  Set Priority >      │
│    ├─ None              │
│    ├─ Low               │
│    ├─ Medium            │
│    └─ High              │
│ ─────────────────────── │
│ 📦 Archive Task         │
│ ─────────────────────── │
│ 🗑️  Delete Task         │
└─────────────────────────┘
```

## Props Interface

The TodoCard component accepts these props for context menu functionality:

```typescript
interface TodoCardProps {
    // ... existing props
    categories?: Array<{ cat_id: string; cat_name: string }>;
    onCategoryChange?: (newCategory: string) => void;
    onDuplicate?: (taskId: string) => void;
    onArchive?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
}
```

## Implementation Details

### Category Selection

-   **Dynamic Categories**: Shows actual available categories from the database
-   **Visual Feedback**: Currently selected category is highlighted in blue
-   **No Category Option**: Allows removing category assignment
-   **Real-time Updates**: Category changes are immediately reflected in the UI

### Priority Selection

-   **All Priority Levels**: None, Low, Medium, High
-   **Visual Feedback**: Currently selected priority is highlighted in blue
-   **Immediate Updates**: Priority changes are applied instantly

### Task Actions

-   **Duplicate**: Creates exact copy with "(Copy)" suffix
-   **Archive**: Marks task as completed (status = true)
-   **Delete**: Permanently removes task from database
-   **Toast Notifications**: User feedback for all actions

## Usage

1. **Right-click** on any task card
2. **Context menu appears** with available actions
3. **Hover over submenus** (Category, Set Priority) to see options
4. **Visual indicators** show current selections
5. **Click on menu item** to execute the action
6. **Menu automatically closes** after selection
7. **Toast notifications** confirm successful actions

## Dependencies Used

-   `@radix-ui/react-context-menu`: For context menu functionality
-   `@radix-ui/react-dropdown-menu`: For submenu functionality
-   `lucide-react`: For menu item icons
-   `@/components/ui/context-menu`: shadcn context menu component
-   `@/components/ui/dropdown-menu`: shadcn dropdown menu component

## Database Integration

All context menu actions are fully integrated with the database:

-   **Category Changes**: Updates `cat_id` field in tasks table
-   **Priority Changes**: Updates `task_priority` field
-   **Task Duplication**: Creates new task with copied data
-   **Task Archiving**: Updates `status` field to true
-   **Task Deletion**: Removes task from database

## Future Enhancements

-   Add confirmation dialogs for destructive actions (delete, archive)
-   Implement keyboard shortcuts for common actions
-   Add bulk selection and actions
-   Support for custom menu items based on task state
-   Add undo functionality for destructive actions
