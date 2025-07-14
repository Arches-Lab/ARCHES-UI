# Auth0 Setup Guide for Metadata in Tokens

## Problem
Your `app_metadata` and `user_metadata` are not showing up in the Auth0 tokens. This is a common issue that requires proper Auth0 configuration.

## Solution Steps

### 1. Create Auth0 Action for Custom Claims

1. **Go to Auth0 Dashboard** → **Actions** → **Flows** → **Login**
2. **Create a new Action** with the following code:

```javascript
/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your-domain.auth0.com/';
  
  // Add app_metadata to the ID token
  if (event.user.app_metadata) {
    api.idToken.setCustomClaim(`${namespace}app_metadata`, event.user.app_metadata);
  }
  
  // Add user_metadata to the ID token
  if (event.user.user_metadata) {
    api.idToken.setCustomClaim(`${namespace}user_metadata`, event.user.user_metadata);
  }
  
  // Add app_metadata to the access token
  if (event.user.app_metadata) {
    api.accessToken.setCustomClaim(`${namespace}app_metadata`, event.user.app_metadata);
  }
  
  // Add user_metadata to the access token
  if (event.user.user_metadata) {
    api.accessToken.setCustomClaim(`${namespace}user_metadata`, event.user.user_metadata);
  }
};
```

**Important**: Replace `your-domain.auth0.com` with your actual Auth0 domain.

### 2. Deploy and Add Action to Login Flow

1. **Deploy the Action**
2. **Add it to your Login flow** (drag and drop)
3. **Save the flow**

### 3. Update Your Application Configuration

1. **Go to Applications** → **Your App** → **Settings**
2. **Add these to "Allowed Callback URLs"**:
   ```
   http://localhost:5173
   http://localhost:5173/
   ```
3. **Add these to "Allowed Logout URLs"**:
   ```
   http://localhost:5173
   http://localhost:5173/
   ```
4. **Add these to "Allowed Web Origins"**:
   ```
   http://localhost:5173
   ```

### 4. Create Environment File

Create a `.env.local` file in your project root:

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
```

### 5. Update Your AuthContext

The current AuthContext is already well-configured to handle the custom claims. The key changes needed are:

1. **Use the correct namespace** when looking for claims
2. **Handle both ID token and access token claims**

### 6. Test the Configuration

1. **Log out** of your application
2. **Log back in** to get fresh tokens with the new claims
3. **Check the Auth Debug section** in your dashboard

## Alternative: Using Rules (Legacy Method)

If you prefer to use Rules instead of Actions:

1. **Go to Auth0 Dashboard** → **Rules**
2. **Create a new Rule**:

```javascript
function (user, context, callback) {
  const namespace = 'https://your-domain.auth0.com/';
  
  const idToken = context.idToken;
  const accessToken = context.accessToken;
  
  if (user.app_metadata) {
    idToken[namespace + 'app_metadata'] = user.app_metadata;
    accessToken[namespace + 'app_metadata'] = user.app_metadata;
  }
  
  if (user.user_metadata) {
    idToken[namespace + 'user_metadata'] = user.user_metadata;
    accessToken[namespace + 'user_metadata'] = user.user_metadata;
  }
  
  callback(null, user, context);
}
```

## Troubleshooting

### Check if Claims are Present

1. **Use the Auth Debug component** in your dashboard
2. **Check browser console** for the detailed logs
3. **Use jwt.io** to decode your tokens manually

### Common Issues

1. **Wrong namespace**: Make sure the namespace matches your Auth0 domain
2. **Action not deployed**: Ensure the Action is deployed and added to the flow
3. **Cached tokens**: Log out and log back in to get fresh tokens
4. **Wrong scope**: Use `read:user_idp_tokens` instead of `read:app_metadata`

### Verify Token Contents

You can decode your JWT tokens at [jwt.io](https://jwt.io) to see exactly what claims are present.

## Expected Result

After following these steps, your tokens should include:

```json
{
  "https://your-domain.auth0.com/app_metadata": {
    "StoreNumber": "12345"
  },
  "https://your-domain.auth0.com/user_metadata": {
    "preferences": {}
  }
}
```

## Next Steps

1. **Set up the Action** as described above
2. **Create your `.env.local` file**
3. **Test the authentication flow**
4. **Check the Auth Debug section** to verify metadata is present 