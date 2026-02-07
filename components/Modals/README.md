# ConfirmModal Component

A reusable, type-safe confirmation modal component for React Native with Expo.

## Features

- ✅ Type-safe with TypeScript
- ✅ Customizable icon, title, and description
- ✅ Multiple action buttons support
- ✅ Optional cancel button
- ✅ Dark mode support
- ✅ Button variants (default, danger, primary)
- ✅ Clean, modern UI

## Props

```typescript
interface ConfirmModalProps {
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Called when modal should close
  isDark: boolean; // Dark mode flag
  icon?: IoniconsName; // Optional Ionicons icon name
  iconColor?: string; // Optional custom icon color
  title: string; // Modal title
  description: string; // Modal description/message
  buttons: ButtonConfig[]; // Array of action buttons
  cancelButton?: {
    // Optional cancel button
    label: string;
    onPress?: () => void;
  };
}

interface ButtonConfig {
  label: string; // Button text
  onPress: () => void; // Button action
  variant?: "default" | "danger" | "primary"; // Button style variant
  testID?: string; // Optional test ID
}
```

## Usage Examples

### Basic Delete Confirmation

```tsx
import { ConfirmModal } from "@/components";

const [showModal, setShowModal] = useState(false);

<ConfirmModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  isDark={isDark}
  icon="trash-outline"
  title="Delete Item"
  description="Are you sure you want to delete this item? This action cannot be undone."
  buttons={[
    {
      label: "Delete",
      onPress: handleDelete,
      variant: "danger",
    },
  ]}
  cancelButton={{
    label: "Cancel",
  }}
/>;
```

### Multiple Action Buttons

```tsx
<ConfirmModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  isDark={isDark}
  icon="warning-outline"
  title="Unsaved Changes"
  description="You have unsaved changes. What would you like to do?"
  buttons={[
    {
      label: "Save",
      onPress: handleSave,
      variant: "primary",
    },
    {
      label: "Discard",
      onPress: handleDiscard,
      variant: "danger",
    },
  ]}
  cancelButton={{
    label: "Cancel",
  }}
/>
```

### Simple Confirmation (No Cancel)

```tsx
<ConfirmModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  isDark={isDark}
  icon="checkmark-circle-outline"
  title="Success"
  description="Your changes have been saved successfully."
  buttons={[
    {
      label: "OK",
      onPress: () => {},
      variant: "primary",
    },
  ]}
/>
```

### Custom Icon Color

```tsx
<ConfirmModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  isDark={isDark}
  icon="alert-circle-outline"
  iconColor="#f97316"
  title="Warning"
  description="This action requires your attention."
  buttons={[
    {
      label: "Proceed",
      onPress: handleProceed,
      variant: "primary",
    },
  ]}
  cancelButton={{
    label: "Go Back",
  }}
/>
```

## Button Variants

- **default**: Gray text color (matches theme)
- **danger**: Red text color (#EF4444)
- **primary**: Orange text color (#f97316)

## Integration Example (AlertCard)

See `components/AlertCard.tsx` for a complete integration example where the modal is used for delete confirmation.

## Notes

- The modal automatically closes when any button is pressed (after executing the button's `onPress`)
- The cancel button also closes the modal and optionally executes a custom `onPress` if provided
- Clicking outside the modal (on the overlay) will close it
- The modal is fully accessible and supports React Native's accessibility features
