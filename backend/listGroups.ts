/**
 * Lists Microsoft 365 groups (Teams) so you can copy a GROUP_ID for eventFetcher.
 * Run: npm run list-groups
 */
import "dotenv/config";
import MsTaskService from "./src/integrations/msGraph/msTaskService";

async function listGroups() {
    try {
        const groups = await MsTaskService.getAllGroups();
        if (groups.length === 0) {
            console.log("No groups found (or app has no permission to list groups).");
            return;
        }
        console.log(`Found ${groups.length} group(s). Use the id as GROUP_ID in .env:\n`);
        groups.forEach((g: any, i: number) => {
            console.log(`${i + 1}. ${g.displayName ?? g.mail ?? "(no name)"}`);
            console.log(`   GROUP_ID=${g.id}`);
            if (g.mail) console.log(`   mail: ${g.mail}`);
            console.log("");
        });
    } catch (err: any) {
        console.error("Error listing groups:", err.message);
        process.exit(1);
    }
}

listGroups();
