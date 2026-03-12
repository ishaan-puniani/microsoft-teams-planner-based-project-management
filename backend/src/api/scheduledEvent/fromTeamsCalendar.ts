import MsCalendarService from "../../integrations/msGraph/msCalendarService";
import credentials from "../file/credentials";
import { getMsPlannerAuth } from "../msPlanner/getMsPlannerAuth";

export default async (req, res) => {
    try {
        const groupId = req.query.groupId as string | undefined;
        const userEmail = req.query.userEmail as string | undefined;
        const msPlannerAuth = getMsPlannerAuth(req);

        let start = req.query.start as string | undefined;
        let end = req.query.end as string | undefined;

        if (!groupId && !userEmail) {
            res.status(400).json({
                error: "Provide either groupId or userEmail as query parameter",
            });
            return;
        }

        if (!start || !end) {
            const now = new Date();
            const defaultEnd = new Date(now);
            defaultEnd.setDate(defaultEnd.getDate() + 30);
            start = start ?? now.toISOString();
            end = end ?? defaultEnd.toISOString();
        }

        let events: any[];
        if (groupId) {
            events = await MsCalendarService.getGroupCalendarEvents(groupId, start, end, msPlannerAuth);
        } else {
            events = await MsCalendarService.getUserCalendarEvents( userEmail!, start, end, msPlannerAuth);
        }

        res.json({ events });
    } catch (err: any) {
        console.error("get-upcoming-events error:", err.message);
        res.status(500).json({ error: err.message || "Failed to fetch events" });
    }
};
