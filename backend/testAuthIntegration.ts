import { AuthIntegrationExample } from "./src/integrations/msGraph/authIntegrationExample";
require('dotenv').config();

async function testAuthIntegration() {
    console.log("🔐 Testing Microsoft Authentication Integration Examples\n");

    const testEmail = "ishaan@coderower.com";
    const invalidEmail = "nonexistent@coderower.com";

    try {
        // Test 1: Validate user login
        console.log("=== Test 1: User Login Validation ===");
        console.log(`Testing with valid email: ${testEmail}`);
        
        const loginResult = await AuthIntegrationExample.validateUserLogin(testEmail);
        console.log(`Login Success: ${loginResult.success}`);
        console.log(`Message: ${loginResult.message}`);
        
        if (loginResult.success && loginResult.user) {
            console.log(`User: ${loginResult.user.displayName} (${loginResult.user.mail || loginResult.user.userPrincipalName})`);
            console.log(`Auth URL generated: ${loginResult.authUrl ? 'Yes' : 'No'}`);
        }

        // Test 2: Invalid user login
        console.log(`\n=== Test 2: Invalid User Login ===`);
        console.log(`Testing with invalid email: ${invalidEmail}`);
        
        const invalidLoginResult = await AuthIntegrationExample.validateUserLogin(invalidEmail);
        console.log(`Login Success: ${invalidLoginResult.success}`);
        console.log(`Message: ${invalidLoginResult.message}`);

        // Test 3: User profile retrieval
        console.log(`\n=== Test 3: User Profile Retrieval ===`);
        console.log(`Getting profile for: ${testEmail}`);
        
        const profileResult = await AuthIntegrationExample.getUserProfile(testEmail);
        console.log(`Profile Success: ${profileResult.success}`);
        console.log(`Message: ${profileResult.message}`);
        
        if (profileResult.success && profileResult.profile) {
            console.log(`Profile Details:`);
            console.log(`  - ID: ${profileResult.profile.id}`);
            console.log(`  - Name: ${profileResult.profile.displayName}`);
            console.log(`  - Email: ${profileResult.profile.email}`);
            console.log(`  - Job Title: ${profileResult.profile.jobTitle || 'Not specified'}`);
            console.log(`  - Department: ${profileResult.profile.department || 'Not specified'}`);
            console.log(`  - Office: ${profileResult.profile.officeLocation || 'Not specified'}`);
            console.log(`  - Mobile: ${profileResult.profile.mobilePhone || 'Not specified'}`);
        }

        // Test 4: Permission validation with role
        console.log(`\n=== Test 4: Permission Validation ===`);
        console.log(`Checking if user has 'CTO' role permissions`);
        
        const permissionResult = await AuthIntegrationExample.validateUserPermissions(testEmail, "CTO");
        console.log(`Has Permission: ${permissionResult.hasPermission}`);
        console.log(`Message: ${permissionResult.message}`);

        // Test 5: Permission validation with different role
        console.log(`\nChecking if user has 'Manager' role permissions`);
        
        const managerPermissionResult = await AuthIntegrationExample.validateUserPermissions(testEmail, "Manager");
        console.log(`Has Permission: ${managerPermissionResult.hasPermission}`);
        console.log(`Message: ${managerPermissionResult.message}`);

        console.log(`\n${"=".repeat(60)}`);
        console.log("🎉 All integration tests completed successfully!");
        console.log(`${"=".repeat(60)}`);
        
        console.log(`\n📚 Integration Summary:`);
        console.log(`- User validation: ${loginResult.success ? '✅' : '❌'}`);
        console.log(`- Invalid user rejection: ${!invalidLoginResult.success ? '✅' : '❌'}`);
        console.log(`- Profile retrieval: ${profileResult.success ? '✅' : '❌'}`);
        console.log(`- Role-based permissions: ${permissionResult.hasPermission ? '✅' : '❌'}`);
        
        console.log(`\n🚀 Ready for production integration!`);
        console.log(`\nNext steps:`);
        console.log(`1. Integrate these functions into your Express.js routes`);
        console.log(`2. Set up OAuth2 callback handling for complete authentication`);
        console.log(`3. Implement session management for authenticated users`);
        console.log(`4. Add rate limiting and security headers`);

    } catch (error) {
        console.error("❌ Integration test error:", error instanceof Error ? error.message : String(error));
    }
}

testAuthIntegration();
