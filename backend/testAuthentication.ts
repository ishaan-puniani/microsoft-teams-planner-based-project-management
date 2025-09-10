import MsAuthService from "./src/integrations/msGraph/msAuthService";
require('dotenv').config();

async function testUserAuthentication() {
    try {
        const email = "ishaan@coderower.com";
        
        console.log("=== Testing User Authentication ===");
        console.log(`Email: ${email}`);
        
        // Test user validation (not password validation as that requires OAuth2 flow)
        console.log("\n1. Validating user existence and permissions...");
        const authResult = await MsAuthService.authenticateUser(email);
        
        console.log(`\nAuthentication Result:`);
        console.log(`- Valid: ${authResult.isValid}`);
        console.log(`- Message: ${authResult.message}`);
        
        if (authResult.user) {
            console.log(`- User Details:`);
            console.log(`  - Display Name: ${authResult.user.displayName}`);
            console.log(`  - Email: ${authResult.user.mail || authResult.user.userPrincipalName}`);
            console.log(`  - Account Enabled: ${authResult.user.accountEnabled !== undefined ? authResult.user.accountEnabled : 'Not specified'}`);
            console.log(`  - User ID: ${authResult.user.id}`);
            console.log(`  - Job Title: ${authResult.user.jobTitle || 'Not specified'}`);
            console.log(`  - Department: ${authResult.user.department || 'Not specified'}`);
            console.log(`  - Office Location: ${authResult.user.officeLocation || 'Not specified'}`);
            console.log(`  - Mobile Phone: ${authResult.user.mobilePhone || 'Not specified'}`);
        }
        
        if (authResult.isValid) {
            console.log("\n2. Getting user authentication methods...");
            try {
                const authMethods = await MsAuthService.getUserAuthMethods(email);
                console.log(`\nAvailable Authentication Methods: ${authMethods.value.length}`);
                authMethods.value.forEach((method: any, index: number) => {
                    console.log(`  ${index + 1}. ${method['@odata.type']} (ID: ${method.id})`);
                });
            } catch (methodError) {
                console.log("⚠️ Could not retrieve authentication methods (likely insufficient permissions)");
                console.log("   This is normal - reading auth methods requires special admin permissions");
            }
            
            console.log("\n3. Generating OAuth2 authorization URL...");
            const redirectUri = "http://localhost:3000/auth/callback";
            const authUrl = MsAuthService.generateAuthUrl(redirectUri, "test_state");
            console.log(`\nOAuth2 Authorization URL:`);
            console.log(authUrl);
            console.log(`\nNote: For actual password validation, users need to authenticate through this OAuth2 URL.`);
        }
        
        return authResult.isValid;
        
    } catch (error) {
        console.error("❌ Error during authentication:", error instanceof Error ? error.message : String(error));
        return false;
    }
}

async function testInvalidUser() {
    try {
        console.log("\n=== Testing Invalid User ===");
        const invalidEmail = "nonexistent@coderower.com";
        console.log(`Email: ${invalidEmail}`);
        
        const authResult = await MsAuthService.authenticateUser(invalidEmail);
        
        console.log(`\nAuthentication Result:`);
        console.log(`- Valid: ${authResult.isValid}`);
        console.log(`- Message: ${authResult.message}`);
        
        return !authResult.isValid; // Should return true if the invalid user was correctly rejected
        
    } catch (error) {
        console.error("❌ Error during invalid user test:", error instanceof Error ? error.message : String(error));
        return false;
    }
}

async function testServiceToken() {
    try {
        console.log("\n=== Testing Service Token ===");
        const token = await MsAuthService._getServiceToken();
        console.log("✅ Service token obtained successfully!");
        console.log(`Token length: ${token.length} characters`);
        console.log(`Token starts with: ${token.substring(0, 50)}...`);
        
        // Verify token format (JWT tokens start with 'eyJ')
        if (token.startsWith('eyJ')) {
            console.log("✅ Token appears to be a valid JWT format");
        } else {
            console.log("⚠️ Token doesn't appear to be in JWT format");
        }
        
        return true;
    } catch (error) {
        console.error("❌ Error getting service token:", error instanceof Error ? error.message : String(error));
        return false;
    }
}

// Execute comprehensive tests
async function runAllTests() {
    console.log("🚀 Starting Microsoft Authentication Service Tests\n");
    
    const results = {
        serviceToken: false,
        validUser: false,
        invalidUser: false
    };
    
    results.serviceToken = await testServiceToken();
    results.validUser = await testUserAuthentication();
    results.invalidUser = await testInvalidUser();
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(50));
    console.log(`Service Token Test: ${results.serviceToken ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Valid User Test: ${results.validUser ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Invalid User Test: ${results.invalidUser ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = results.serviceToken && results.validUser && results.invalidUser;
    console.log(`\nOverall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log("\n🎉 Microsoft Authentication Service is working correctly!");
        console.log("\nKey Points:");
        console.log("- Service can authenticate with Microsoft Graph API");
        console.log("- User validation works for existing users");
        console.log("- Invalid users are properly rejected");
        console.log("- OAuth2 URLs can be generated for actual user authentication");
        console.log("\nFor production use:");
        console.log("1. Users should authenticate via OAuth2 URL for password validation");
        console.log("2. This service validates user existence and basic permissions");
        console.log("3. Consider implementing proper OAuth2 flow for complete authentication");
    }
}

runAllTests();