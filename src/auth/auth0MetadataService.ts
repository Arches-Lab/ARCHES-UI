/**
 * Service for updating Auth0 user app_metadata directly from the frontend
 */

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;

export interface UserMetadataUpdate {
  selectedStore?: number;
  SelectedStore?: number | string;
  StoreNumber?: number[];
  customValue?: string;
  [key: string]: any;
}

/**
 * Gets a Management API token using client credentials flow
 */
async function getManagementToken(): Promise<string | null> {
  try {
    console.log('🔑 Getting Management API token...');
    
    const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json' 
      },
      body: JSON.stringify({
        "client_id": "DfajdM73y2ExRcsvgT2tfnnuHAbHJIfc",
        "client_secret": "tdjMBYEqGainwe9UburzsnZQKTK8jXITKFDt0ECjMoJvoZ0KWP85JitwKl7ooh0a",
        "audience": `https://${AUTH0_DOMAIN}/api/v2/`,
        "grant_type": "client_credentials"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get management token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully obtained Management API token');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting Management API token:', error);
    return null;
  }
}

/**
 * Updates the user's app_metadata in Auth0
 */
export async function updateUserAppMetadata(
  userId: string,
  metadata: UserMetadataUpdate
): Promise<boolean> {
  try {
    console.log(`🔄 Updating app_metadata for user ${userId}:`, metadata);
    
    const managementToken = await getManagementToken();
    if (!managementToken) {
      console.error('❌ Failed to get Management API token');
      return false;
    }
    
    const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_metadata: metadata
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update user app_metadata: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const updatedUser = await response.json();
    console.log('✅ Successfully updated user app_metadata:', updatedUser.app_metadata);
    return true;
  } catch (error) {
    console.error('❌ Error updating user app_metadata:', error);
    return false;
  }
}

/**
 * Saves a custom string value to the user's app_metadata
 */
export async function saveCustomValue(
  userId: string,
  key: string,
  value: string
): Promise<boolean> {
  const metadata: UserMetadataUpdate = {};
  metadata[key] = value;
  return updateUserAppMetadata(userId, metadata);
}

/**
 * Updates the user's selected store in app_metadata
 */
export async function updateSelectedStore(
  userId: string,
  selectedStore: number
): Promise<boolean> {
  console.log(`🔄 Updating SelectedStoreNumber to ${selectedStore} for user ${userId}`);
  
  return saveCustomValue(userId, 'SelectedStoreNumber', selectedStore.toString());
}

/**
 * Gets the current user's app_metadata from Auth0
 */
export async function getUserAppMetadata(userId: string): Promise<UserMetadataUpdate | null> {
  try {
    console.log(`🔍 Getting app_metadata for user ${userId}`);
    
    const managementToken = await getManagementToken();
    if (!managementToken) {
      console.error('❌ Failed to get Management API token');
      return null;
    }
    
    const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user app_metadata: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const user = await response.json();
    console.log('✅ Retrieved user app_metadata:', user.app_metadata);
    return user.app_metadata || {};
  } catch (error) {
    console.error('❌ Error getting user app_metadata:', error);
    return null;
  }
} 