/**
 * Fetches scheduled meetings from a Microsoft 365 group (Teams) calendar
 * or from a specific person's calendar in your org.
 *
 * Set in .env:
 *   GROUP_ID   - Microsoft 365 group (Team) ID → fetches group calendar events
 *   USER_EMAIL - User's email (e.g. person@domain.com) → fetches that person's calendar
 *
 * Optional:
 *   EVENTS_START - ISO start (default: start of this week)
 *   EVENTS_END   - ISO end (default: end of next week)
 *
 * Run: npm run fetch-events
 */
import "dotenv/config";
import MsCalendarService from "./src/integrations/msGraph/msCalendarService";
import moment from "moment";

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getDefaultDateRange(): { start: string; end: string } {
    const now = new Date();
    const start = moment().startOf('month').add(-1,'M').toDate();
    const end = moment().endOf('month').toDate();
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

async function fetchEvents() {
    const groupId = process.env.GROUP_ID || "a86c0620-49e9-45dc-8e0b-6e49de4d3b25";
    const userEmail = process.env.USER_EMAIL || "ishaan@coderower.com";
    const { start, end } = getDefaultDateRange();
    const startParam = process.env.EVENTS_START || start;
    const endParam = process.env.EVENTS_END || end;

    if (!groupId && !userEmail) {
        console.error(
            "Set GROUP_ID (for group/team calendar) or USER_EMAIL (for a person's calendar) in .env"
        );
        process.exit(1);
    }

    try {
        let eventList: any[];

        if (groupId) {
            console.log(`Fetching group calendar events for group ${groupId} (${startParam} → ${endParam})...`);
            eventList = await MsCalendarService.getGroupCalendarEvents(groupId, startParam, endParam);
        } else {
            console.log(`Fetching calendar events for ${userEmail} (${startParam} → ${endParam})...`);
            eventList = await MsCalendarService.getUserCalendarEvents(userEmail!, startParam, endParam);
        }

        console.log(`Found ${eventList.length} event(s):\n`);
        eventList.forEach((e: any, i: number) => {
            const startTime = e.start?.dateTime || e.start?.date;
            const endTime = e.end?.dateTime || e.end?.date;
            const subject = e.subject || "(No subject)";
            // Use e.iCalUId for attaching metadata – stable across calendars; e.id can change
            const eventId = e.id;
            const iCalUId = e.iCalUId;
            const description = e.bodyPreview ?? (e.body?.content ? stripHtml(e.body.content) : null) ?? "(no description)";
            console.log(`${i + 1}. ${subject}`);
            console.log(`   id:      ${eventId}`);
            console.log(`   iCalUId: ${iCalUId ?? "(not set)"}  ← use this to link your metadata`);
            console.log(`   Start:   ${startTime}`);
            console.log(`   End:     ${endTime}`);
            console.log(`   Description: ${description}`);
            if (e.isOnlineMeeting) console.log(`   Online:  ${e.onlineMeeting?.joinUrl || "yes"}`);
            console.log("");
        });
    } catch (err: any) {
        console.error("Error fetching events:", err.message);
        process.exit(1);
    }
}

fetchEvents();
