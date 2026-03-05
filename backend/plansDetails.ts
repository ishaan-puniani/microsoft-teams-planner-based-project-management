import "dotenv/config";
import MsTaskService from "./src/integrations/msGraph/msTaskService";

async function listPlans() {
    try {
        const plans = await MsTaskService.getBoardDetails("ltAHsib4MEiRUj7EOYq2yeEAH4V2");
        
        console.log(`Found `);
        console.log(JSON.stringify(plans));
    } catch (err: any) {
        console.error("Error listing groups:", err.message);
        process.exit(1);
    }
}

listPlans();
