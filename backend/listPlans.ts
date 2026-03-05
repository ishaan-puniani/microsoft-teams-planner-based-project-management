import "dotenv/config";
import MsTaskService from "./src/integrations/msGraph/msTaskService";

async function listPlans() {
    try {
        const plans = await MsTaskService.getAllPlansInGroup("6c9e7766-6ee6-4514-84ff-2c11eabfe91e");
        if (plans.length === 0) {
            console.log("No groups found (or app has no permission to list groups).");
            return;
        }
        console.log(`Found ${plans.length} group(s). Use the id as GROUP_ID in .env:\n`);
        plans.forEach((g: any, i: number) => {
            console.log(`${i + 1}. ${g.title ?? g.mail ?? "(no name)"}`);
            console.log(`   PLAN_ID=${g.id}`);
           
        });
    } catch (err: any) {
        console.error("Error listing groups:", err.message);
        process.exit(1);
    }
}

listPlans();
