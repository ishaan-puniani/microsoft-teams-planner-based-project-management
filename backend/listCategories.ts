/**
 * Lists Planner plan categories (labels) for a given plan.
 * Run: npx ts-node listCategories.ts
 * Set PLAN_ID in .env or replace the planId below.
 */
import "dotenv/config";
import MsTaskService from "./src/integrations/msGraph/msTaskService";


async function listCategories() {
    try {
        const PLAN_ID = "ltAHsib4MEiRUj7EOYq2yeEAH4V2";

        const categories = await MsTaskService.getCategories(PLAN_ID);
        const entries = Object.entries(categories as Record<string, string>);
        if (entries.length === 0) {
            console.log("No categories defined for this plan.");
            return;
        }
        console.log(`Plan ${PLAN_ID} – ${entries.length} categor(y/ies):\n`);
        entries.forEach(([key, label], i) => {
            console.log(`${i + 1}. ${key}: ${label || "(no label)"}`);
        });
    } catch (err: any) {
        console.error("Error listing categories:", err.message);
        process.exit(1);
    }
}

listCategories();
