import { getConfig } from "../../config";

export default class MsAuthService {

    static async _getServiceToken(): Promise<string> {
        const tenantId = getConfig().MS_TENANT_ID;
        const clientId = getConfig().MS_CLIENT_ID;
        const clientSecret = getConfig().MS_CLIENT_SECRET;
        const scope = getConfig().MS_SCOPE || "https://graph.microsoft.com/.default";

        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('scope', scope);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token request error details:', errorText);
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }

            const tokenData = await response.json();
            return tokenData.access_token;

        } catch (error) {
            throw new Error(`Failed to get service token: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Authenticate user by validating their existence and permissions in Microsoft Graph
     * Note: This doesn't validate the password as that would require OAuth2 flow with user consent
     * Instead, it validates that the user exists and has the necessary permissions
     */
    static async authenticateUser(email: string, password?: string): Promise<{
        isValid: boolean;
        user?: any;
        message: string;
    }> {
        try {
            console.log(`Validating user: ${email}`);
            
            const token = await this._getServiceToken();
            
            // Get user information to validate existence
            const userUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}`;
            
            const userResponse = await fetch(userUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    return {
                        isValid: false,
                        message: `User ${email} not found in the organization`
                    };
                }
                throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
            }

            const user = await userResponse.json();
            console.log(`Found user: ${user.displayName} (${user.userPrincipalName})`);

            // Check if user account is enabled
            if (user.accountEnabled === false) {
                return {
                    isValid: false,
                    user: user,
                    message: `User account ${email} is disabled`
                };
            }

            // Optionally check group memberships or specific permissions
            // const groupsUrl = `https://graph.microsoft.com/v1.0/users/${user.id}/memberOf`;
            // const groupsResponse = await fetch(groupsUrl, {
            //     method: "GET",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         "Content-Type": "application/json"
            //     }
            // });

            // if (groupsResponse.ok) {
            //     const groups = await groupsResponse.json();
            //     console.log(`User is member of ${groups.value.length} groups`);
            // }

            return {
                isValid: true,
                user: user,
                message: `User ${email} is valid and active`
            };

        } catch (error: any) {
            console.error("Error in authenticateUser:", error);
            return {
                isValid: false,
                message: `Authentication error: ${error.message}`
            };
        }
    }

    /**
     * Get user authentication methods (what authentication methods are available for the user)
     */
    static async getUserAuthMethods(email: string): Promise<any> {
        try {
            const token = await this._getServiceToken();
            
            // First get the user ID
            const userUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}`;
            const userResponse = await fetch(userUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!userResponse.ok) {
                throw new Error(`Failed to get user: ${userResponse.status} ${userResponse.statusText}`);
            }

            const user = await userResponse.json();
            
            // Get authentication methods
            const authMethodsUrl = `https://graph.microsoft.com/v1.0/users/${user.id}/authentication/methods`;
            const authResponse = await fetch(authMethodsUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!authResponse.ok) {
                throw new Error(`Failed to get auth methods: ${authResponse.status} ${authResponse.statusText}`);
            }

            const authMethods = await authResponse.json();
            return authMethods;

        } catch (error: any) {
            console.error("Error in getUserAuthMethods:", error);
            throw new Error(`Failed to get authentication methods: ${error.message}`);
        }
    }

    /**
     * Generate an OAuth2 authorization URL for user login
     * This is the proper way to authenticate users with their credentials
     */
    static generateAuthUrl(redirectUri: string, state?: string): string {
        const tenantId = getConfig().MS_TENANT_ID;
        const clientId = getConfig().MS_CLIENT_ID;
        
        const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
        
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('scope', 'openid profile email User.Read');
        authUrl.searchParams.append('response_mode', 'query');
        
        if (state) {
            authUrl.searchParams.append('state', state);
        }
        
        return authUrl.toString();
    }
}