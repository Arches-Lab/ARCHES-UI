/**
 * Utility functions for working with Auth0 tokens and extracting metadata
 */

export interface TokenMetadata {
  StoreNumber?: number[] | string;
  [key: string]: any;
}

export interface DecodedToken {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Decodes a JWT token without verification (client-side only)
 * @param token - The JWT token to decode
 * @returns The decoded token payload
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Finds the correct app metadata key in the decoded token
 * @param decoded - The decoded token
 * @param domain - The Auth0 domain
 * @returns The app metadata key if found, null otherwise
 */
function findAppMetadataKey(decoded: DecodedToken, domain: string): string | null {
  console.log('🔍 Searching for app metadata key in token...');
  console.log('🔍 Domain:', domain);
  console.log('🔍 All token keys:', Object.keys(decoded));
  
  const possibleKeys = [
    `https://${domain}/app_metadata`,
    `https://${domain}/app_meta`,
    `https://yourapp.example.com/app_meta`,
    `https://yourapp.example.com/app_metadata`
  ];

  console.log('🔍 Checking possible keys:', possibleKeys);

  for (const key of possibleKeys) {
    console.log(`🔍 Checking key: ${key}`);
    if (decoded[key] && typeof decoded[key] === 'object') {
      console.log(`✅ Found app metadata in key: ${key}`);
      console.log(`📦 App metadata content:`, decoded[key]);
      return key;
    } else {
      console.log(`❌ Key ${key} not found or not an object`);
    }
  }

  console.log('❌ No app metadata key found');
  return null;
}

/**
 * Extracts StoreNumber from an Auth0 token
 * @param token - The Auth0 access token or ID token
 * @param domain - The Auth0 domain (e.g., 'your-domain.auth0.com')
 * @returns The StoreNumber array if found, null otherwise
 */
export function extractStoreNumber(token: string, domain: string): number[] | null {
  console.log('🚀 Starting StoreNumber extraction...');
  console.log('🚀 Domain:', domain);
  console.log('🚀 Token length:', token.length);
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      console.error('❌ Failed to decode token');
      return null;
    }

    console.log('✅ Token decoded successfully');
    console.log('📋 Decoded token keys:', Object.keys(decoded));

    // Find the correct app metadata key
    const appMetadataKey = findAppMetadataKey(decoded, domain);
    
    if (appMetadataKey) {
      const appMetadata = decoded[appMetadataKey] as TokenMetadata;
      console.log('📦 App metadata found:', appMetadata);
      
      if (appMetadata && appMetadata.StoreNumber) {
        console.log(`✅ Found StoreNumber:`, appMetadata.StoreNumber);
        
        // Handle both array and string formats
        if (Array.isArray(appMetadata.StoreNumber)) {
          console.log(`✅ StoreNumber is an array:`, appMetadata.StoreNumber);
          return appMetadata.StoreNumber;
        } else if (typeof appMetadata.StoreNumber === 'string') {
          console.log(`✅ StoreNumber is a string: ${appMetadata.StoreNumber}`);
          // Convert string to array if it's comma-separated
          const numbers = appMetadata.StoreNumber.split(',').map(s => parseInt(s.trim(), 10));
          return numbers.filter(n => !isNaN(n));
        } else if (typeof appMetadata.StoreNumber === 'number') {
          console.log(`✅ StoreNumber is a single number: ${appMetadata.StoreNumber}`);
          return [appMetadata.StoreNumber];
        }
      } else {
        console.log('❌ StoreNumber not found in app metadata');
        console.log('📦 App metadata keys:', appMetadata ? Object.keys(appMetadata) : 'null');
      }
    }

    // Fallback: check for StoreNumber directly in the token
    if (decoded.StoreNumber) {
      console.log(`✅ Found StoreNumber directly in token:`, decoded.StoreNumber);
      if (Array.isArray(decoded.StoreNumber)) {
        return decoded.StoreNumber;
      } else if (typeof decoded.StoreNumber === 'string') {
        const numbers = decoded.StoreNumber.split(',').map(s => parseInt(s.trim(), 10));
        return numbers.filter(n => !isNaN(n));
      } else if (typeof decoded.StoreNumber === 'number') {
        return [decoded.StoreNumber];
      }
    }

    console.log('❌ StoreNumber not found anywhere in token');
    return null;
  } catch (error) {
    console.error('❌ Error extracting StoreNumber from token:', error);
    return null;
  }
}

/**
 * Extracts all metadata from an Auth0 token
 * @param token - The Auth0 access token or ID token
 * @param domain - The Auth0 domain (e.g., 'your-domain.auth0.com')
 * @returns Object containing app_metadata and user_metadata
 */
export function extractMetadata(token: string, domain: string): {
  app_metadata?: TokenMetadata;
  user_metadata?: any;
} {
  console.log('🔍 Extracting all metadata...');
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      console.error('❌ Failed to decode token for metadata extraction');
      return {};
    }

    const appMetadataKey = findAppMetadataKey(decoded, domain);
    const userMetadataKey = `https://${domain}/user_metadata`;

    const result = {
      app_metadata: appMetadataKey ? (decoded[appMetadataKey] as TokenMetadata) : undefined,
      user_metadata: decoded[userMetadataKey]
    };

    console.log('📦 Extracted metadata:', result);
    return result;
  } catch (error) {
    console.error('❌ Error extracting metadata from token:', error);
    return {};
  }
} 