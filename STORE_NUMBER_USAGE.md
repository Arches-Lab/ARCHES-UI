# StoreNumber Usage Guide

This guide explains how to use the StoreNumber functionality that has been implemented to read the StoreNumber from Auth0 tokens after login.

## Overview

The StoreNumber is extracted from the Auth0 token's `app_metadata` after successful authentication. The implementation includes:

- **Token Utilities**: Functions to decode JWT tokens and extract metadata
- **AuthContext Enhancement**: Updated context to include StoreNumber array and metadata
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

## How to Use

### 1. Using the Custom Hook (Recommended)

```tsx
import { useStoreNumber } from '../auth/useStoreNumber';

function MyComponent() {
  const { 
    storeNumber, 
    isLoading, 
    hasStoreNumber, 
    refreshStoreNumber,
    storeNumberCount,
    firstStoreNumber,
    allStoreNumbers
  } = useStoreNumber();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasStoreNumber) {
    return <div>No store numbers available</div>;
  }

  return (
    <div>
      <h2>Store Numbers ({storeNumberCount}):</h2>
      <div>
        {allStoreNumbers.map((number, index) => (
          <span key={index} className="store-number">
            {number}
          </span>
        ))}
      </div>
      <p>First Store: {firstStoreNumber}</p>
      <button onClick={refreshStoreNumber}>Refresh</button>
    </div>
  );
}
```

### 2. Using the AuthContext Directly

```tsx
import { useAuth } from '../auth/AuthContext';

function MyComponent() {
  const { storeNumber, metadata, refreshStoreNumber } = useAuth();

  return (
    <div>
      <p>Store Numbers: {storeNumber ? storeNumber.join(', ') : 'Not available'}</p>
      <p>App Metadata: {JSON.stringify(metadata.app_metadata)}</p>
      <button onClick={refreshStoreNumber}>Refresh Store Numbers</button>
    </div>
  );
}
```

### 3. Using the StoreInfo Component

```tsx
import StoreInfo from '../components/StoreInfo';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <StoreInfo />
    </div>
  );
}
```

## API Integration

The StoreNumber array is automatically included in API requests through the updated API interceptor. The token is automatically attached to all API calls:

```tsx
import { getDashboardData } from '../api';

// The token (including StoreNumber array) is automatically included
const data = await getDashboardData();
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

## TypeScript Support

All functions and components are fully typed:

```tsx
import { TokenMetadata } from '../auth/tokenUtils';

interface MyComponentProps {
  storeNumber: number[] | null;
  metadata: {
    app_metadata?: TokenMetadata;
    user_metadata?: any;
  };
}
```

## Testing

To test the StoreNumber functionality:

1. **Login**: Authenticate with a user that has StoreNumber array in their metadata
2. **Check Dashboard**: Visit the dashboard to see the StoreInfo component
3. **API Calls**: Verify that API requests include the token
4. **Refresh**: Use the refresh button to re-extract the StoreNumber array

## Security Notes

- **Client-Side Only**: Token decoding is done client-side without verification
- **No Sensitive Data**: Only extract necessary data from tokens
- **Token Expiry**: Tokens are automatically refreshed by Auth0
- **Logout**: StoreNumber array is cleared on logout

## Future Enhancements

Potential improvements:

1. **Server-Side Verification**: Add server-side token verification
2. **Caching**: Implement caching for StoreNumber array to reduce token decoding
3. **Store Selection**: Add UI for users to select which store to work with
4. **Store Validation**: Add validation for StoreNumber array format
5. **Store Permissions**: Add role-based access control for different stores 