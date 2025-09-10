import MsAuthService from "./msAuthService";

/**
 * Example integration showing how to use the Microsoft Authentication service
 * in your application's login flow
 */
export class AuthIntegrationExample {

    /**
     * Validate a user login attempt
     * This simulates a login endpoint that validates user existence
     */
    static async validateUserLogin(email: string): Promise<{
        success: boolean;
        user?: any;
        authUrl?: string;
        message: string;
    }> {
        try {
            console.log(`Processing login attempt for: ${email}`);
            
            // Step 1: Validate user exists in Microsoft Graph
            const userValidation = await MsAuthService.authenticateUser(email);
            
            if (!userValidation.isValid) {
                return {
                    success: false,
                    message: userValidation.message
                };
            }

            // Step 2: Generate OAuth2 URL for actual password authentication
            const redirectUri = process.env.AUTH_REDIRECT_URI || "http://localhost:3000/auth/callback";
            const state = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const authUrl = MsAuthService.generateAuthUrl(redirectUri, state);

            // Step 3: Return success with auth URL
            return {
                success: true,
                user: userValidation.user,
                authUrl: authUrl,
                message: "User validated. Please complete authentication via OAuth2 URL."
            };

        } catch (error) {
            console.error("Login validation error:", error);
            return {
                success: false,
                message: `Login validation failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Validate user permissions for specific actions
     */
    static async validateUserPermissions(email: string, requiredRole?: string): Promise<{
        hasPermission: boolean;
        user?: any;
        message: string;
    }> {
        try {
            const userValidation = await MsAuthService.authenticateUser(email);
            
            if (!userValidation.isValid) {
                return {
                    hasPermission: false,
                    message: userValidation.message
                };
            }

            const user = userValidation.user;

            // Example permission checks
            if (requiredRole) {
                // Check job title or department for role-based access
                const userRole = user.jobTitle?.toLowerCase() || '';
                const hasRequiredRole = userRole.includes(requiredRole.toLowerCase());
                
                if (!hasRequiredRole) {
                    return {
                        hasPermission: false,
                        user: user,
                        message: `User does not have required role: ${requiredRole}. Current role: ${user.jobTitle || 'Not specified'}`
                    };
                }
            }

            return {
                hasPermission: true,
                user: user,
                message: "User has required permissions"
            };

        } catch (error) {
            return {
                hasPermission: false,
                message: `Permission validation failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Get user profile information
     */
    static async getUserProfile(email: string): Promise<{
        success: boolean;
        profile?: any;
        message: string;
    }> {
        try {
            const userValidation = await MsAuthService.authenticateUser(email);
            
            if (!userValidation.isValid) {
                return {
                    success: false,
                    message: userValidation.message
                };
            }

            // Extract relevant profile information
            const profile = {
                id: userValidation.user.id,
                displayName: userValidation.user.displayName,
                email: userValidation.user.mail || userValidation.user.userPrincipalName,
                jobTitle: userValidation.user.jobTitle,
                department: userValidation.user.department,
                officeLocation: userValidation.user.officeLocation,
                mobilePhone: userValidation.user.mobilePhone,
                businessPhones: userValidation.user.businessPhones,
                accountEnabled: userValidation.user.accountEnabled
            };

            return {
                success: true,
                profile: profile,
                message: "User profile retrieved successfully"
            };

        } catch (error) {
            return {
                success: false,
                message: `Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}

/**
 * Example usage in Express.js routes
 */
export const authRouteExamples = {
    
    // POST /api/auth/validate
    validateUser: async (req: any, res: any) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            const result = await AuthIntegrationExample.validateUserLogin(email);
            
            return res.status(result.success ? 200 : 401).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    // GET /api/auth/profile/:email
    getUserProfile: async (req: any, res: any) => {
        try {
            const { email } = req.params;
            
            const result = await AuthIntegrationExample.getUserProfile(email);
            
            return res.status(result.success ? 200 : 404).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    // POST /api/auth/check-permissions
    checkPermissions: async (req: any, res: any) => {
        try {
            const { email, requiredRole } = req.body;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            const result = await AuthIntegrationExample.validateUserPermissions(email, requiredRole);
            
            return res.status(result.hasPermission ? 200 : 403).json({
                success: result.hasPermission,
                user: result.user,
                message: result.message
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
};
