# StoreNumber Usage Guide

This guide explains how to use the StoreNumber functionality that has been implemented to read the StoreNumber from Auth0 tokens after login.

## Overview

The StoreNumber is extracted from the Auth0 token's `app_metadata` after successful authentication. The implementation includes:

- **Token Utilities**: Functions to decode JWT tokens and extract metadata
- **AuthContext Enhancement**: Updated context to include StoreNumber array and metadata
- **StoreContext**: Manages the currently selected store for the application
- **Store Selector**: Dropdown in the header to switch between stores
- **Custom Hooks**: Easy-to-use hooks for accessing StoreNumber throughout the app
- **UI Components**: Components to display and manage StoreNumber information

## Prerequisites

Before using this functionality, ensure you have:

1. **Auth0 Action Configured**: Follow the `AUTH0_SETUP_GUIDE.md` to set up the Auth0 Action that adds `app_metadata` to tokens
2. **Environment Variables**: Set up your `.env.local` file with Auth0 configuration
3. **User Metadata**: Ensure your Auth0 users have `StoreNumber` in their `app_metadata`

## StoreNumber Format

The StoreNumber is expected to be an array of numbers in the token:

```json
{
  "https://yourapp.example.com/app_meta": {
    "StoreNumber": [1126, 5284]
  }
}
```

## Store Selection

The application automatically selects the first store when the user logs in. Users can switch between stores using the dropdown in the header.

### Store Selector Features

- **Auto-selection**: First store is automatically selected on login
- **Visual Indicator**: Current store is displayed in the header
- **Dropdown Menu**: Easy switching between available stores
- **API Integration**: Selected store is automatically included in API requests
- **State Management**: Store selection persists across page navigation

## How to Use

### 1. Using the Selected Store Hook (Recommended)

```tsx
import { useSelectedStore } from '../auth/useSelectedStore';

function MyComponent() {
  const { 
    selectedStore, 
    switchToStore, 
    availableStores, 
    hasSelectedStore,
    canSwitchStores 
  } = useSelectedStore();

  if (!hasSelectedStore) {
    return <div>No store selected</div>;
  }

  return (
    <div>
      <h2>Current Store: {selectedStore}</h2>
      {canSwitchStores && (
        <div>
          <p>Switch to:</p>
          {availableStores.map(store => (
            <button
              key={store}
              onClick={() => switchToStore(store)}
              className={store === selectedStore ? 'active' : ''}
            >
              Store {store}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Using the Store Context Directly

```tsx
import { useStore } from '../auth/StoreContext';

function MyComponent() {
  const { selectedStore, setSelectedStore, availableStores } = useStore();

  return (
    <div>
      <p>Current Store: {selectedStore || 'None'}</p>
      <p>Available Stores: {availableStores.join(', ')}</p>
      <button onClick={() => setSelectedStore(availableStores[1])}>
        Switch to Store {availableStores[1]}
      </button>
    </div>
  );
}
```

### 3. Using the Store Selector Component

The StoreSelector is automatically included in the header, but you can also use it elsewhere:

```tsx
import StoreSelector from '../components/StoreSelector';

function MyComponent() {
  return (
    <div>
      <h2>Store Selection</h2>
      <StoreSelector />
    </div>
  );
}
```

## API Integration

The selected store is automatically included in all API requests:

### Headers
```
X-Selected-Store: 1126
```

### Query Parameters (GET requests)
```
?storeId=1126
```

### Usage in API Calls

```tsx
import { getDashboardData } from '../api';

// The selected store is automatically included in the request
const data = await getDashboardData();
// Request will include: GET /dashboard?storeId=1126
// Headers: X-Selected-Store: 1126
```

## Store Switching Behavior

When a user switches stores:

1. **UI Updates**: All components using `useSelectedStore()` automatically re-render
2. **API Requests**: New requests include the updated store ID
3. **Data Refresh**: Components can trigger data reloads based on store changes
4. **State Persistence**: Store selection persists during navigation

### Example: Data Loading on Store Change

```tsx
import { useEffect, useState } from 'react';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getDashboardData } from '../api';

function Dashboard() {
  const { selectedStore } = useSelectedStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (selectedStore) {
      // Automatically reload data when store changes
      getDashboardData().then(setData);
    }
  }, [selectedStore]); // Dependency on selectedStore

  return (
    <div>
      <h1>Dashboard for Store {selectedStore}</h1>
      {/* Data display */}
    </div>
  );
}
```

## Token Structure

The StoreNumber is expected to be in the token with this structure:

```json
{
  "https://yourapp.example.com/app_meta": {
    "StoreNumber": [1126, 5284]
  }
}
```

## Error Handling

The implementation includes comprehensive error handling:

- **Token Decoding Errors**: Gracefully handled with console logging
- **Missing StoreNumber**: Returns `null` instead of throwing errors
- **Empty Arrays**: Handles empty StoreNumber arrays
- **Store Switching**: Validates store availability before switching
- **Network Errors**: API requests handle token retrieval failures
- **Loading States**: Proper loading indicators during token extraction

## Debugging

### Check Token Contents

1. **Browser Console**: Check console logs for extracted StoreNumber and metadata
2. **JWT.io**: Decode your token at [jwt.io](https://jwt.io) to verify the structure
3. **StoreInfo Component**: Use the built-in component to view token contents
4. **DebugInfo Component**: Shows detailed token and configuration information

### Common Issues

1. **StoreNumber Not Found**: Ensure the Auth0 Action is properly configured
2. **Wrong Domain**: Verify `VITE_AUTH0_DOMAIN` matches your Auth0 domain
3. **Cached Tokens**: Log out and log back in to get fresh tokens
4. **Missing Metadata**: Check that users have `StoreNumber` in their `app_metadata`
5. **Wrong Format**: Ensure StoreNumber is an array of numbers
6. **Store Not Selected**: Check if auto-selection is working properly

## TypeScript Support

All functions and components are fully typed:

```tsx
import { TokenMetadata } from '../auth/tokenUtils';

interface MyComponentProps {
  storeNumber: number[] | null;
  selectedStore: number | null;
  metadata: {
    app_metadata?: TokenMetadata;
    user_metadata?: any;
  };
}
```

## Testing

To test the StoreNumber functionality:

1. **Login**: Authenticate with a user that has StoreNumber array in their metadata
2. **Check Header**: Verify the store selector appears in the header
3. **Auto-selection**: Confirm the first store is automatically selected
4. **Store Switching**: Test switching between different stores
5. **API Integration**: Verify API requests include the selected store
6. **Data Updates**: Check that data refreshes when switching stores

## Security Notes

- **Client-Side Only**: Token decoding is done client-side without verification
- **No Sensitive Data**: Only extract necessary data from tokens
- **Token Expiry**: Tokens are automatically refreshed by Auth0
- **Logout**: StoreNumber array and selection are cleared on logout
- **Store Validation**: Only available stores can be selected

## Future Enhancements

Potential improvements:

1. **Server-Side Verification**: Add server-side token verification
2. **Caching**: Implement caching for StoreNumber array to reduce token decoding
3. **Store Permissions**: Add role-based access control for different stores
4. **Store Validation**: Add validation for StoreNumber array format
5. **Store History**: Remember user's last selected store
6. **Store Analytics**: Track which stores users access most frequently 