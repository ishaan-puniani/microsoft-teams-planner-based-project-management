import { getConfig } from "../../config";
import { MsPlannerCredentials } from "./msTaskService";

/**
 * Fetches scheduled meetings/events from Microsoft 365 group (Teams) calendars
 * and user calendars via Microsoft Graph API.
 *
 * Required Azure AD app permissions (Application):
 * - Calendars.Read (or Calendars.ReadWrite) - for group and user calendars
 * - User.Read.All - if fetching by user email
 * - Group.Read.All - for group calendar (often already used for Planner)
 */
export default class MsCalendarService {

    static async _getServiceToken(credentials): Promise<string> {
        const tenantId = credentials?.MS_TENANT_ID || getConfig().MS_TENANT_ID;
        const clientId = credentials?.MS_CLIENT_ID || getConfig().MS_CLIENT_ID;
        const clientSecret = credentials?.MS_CLIENT_SECRET || getConfig().MS_CLIENT_SECRET;
        const scope = credentials?.MS_SCOPE || getConfig().MS_SCOPE;

        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("scope", scope);
        params.append("client_secret", clientSecret);
        params.append("grant_type", "client_credentials");

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const tokenData = await response.json();
        return tokenData.access_token;
    }

    /**
     * Get scheduled events from a group's (Team's) calendar.
     * @param groupId - Microsoft 365 group ID (same as Team id)
     * @param startDateTime - ISO 8601 start (e.g. 2025-02-03T00:00:00Z)
     * @param endDateTime - ISO 8601 end (e.g. 2025-02-10T23:59:59Z)
     */
    static async getGroupCalendarEvents(
        groupId: string,
        startDateTime?: string,
        endDateTime?: string,
        credentials?: MsPlannerCredentials,

    ): Promise<any[]> {
        const token = await this._getServiceToken(credentials);

        // calendarView expands recurring events in the range; events returns list with optional filter
        // $select=...,body,bodyPreview ensures description is returned (list sometimes omits it)
        const bodySelect = "&$select=id,iCalUId,subject,body,bodyPreview,start,end,isOnlineMeeting,onlineMeeting,location";
        const baseUrl = `https://graph.microsoft.com/v1.0/groups/${groupId}/calendar`;
        const useCalendarView = startDateTime && endDateTime;
        const url = useCalendarView
            ? `${baseUrl}/calendarView?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}${bodySelect}`
            : `${baseUrl}/events?${bodySelect.replace(/^&/, "")}`;

        const res = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to fetch group calendar events: ${res.status} ${res.statusText} - ${err}`);
        }

        const data = await res.json();
        return data.value ?? [];
    }

    /**
     * Get scheduled events from a person's calendar (e.g. a member of your group).
     * @param userIdOrEmail - User ID (GUID) or userPrincipalName (email)
     * @param startDateTime - ISO 8601 start
     * @param endDateTime - ISO 8601 end
     */
    static async getUserCalendarEvents(
        userIdOrEmail: string,
        startDateTime?: string,
        endDateTime?: string,
        credentials?: MsPlannerCredentials,

    ): Promise<any[]> {
        const token = await this._getServiceToken(credentials);
        const encoded = encodeURIComponent(userIdOrEmail);

        const bodySelect = "&$select=id,iCalUId,subject,body,bodyPreview,start,end,isOnlineMeeting,onlineMeeting,location";
        const baseUrl = `https://graph.microsoft.com/v1.0/users/${encoded}/calendar`;
        const useCalendarView = startDateTime && endDateTime;
        const url = useCalendarView
            ? `${baseUrl}/calendarView?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}${bodySelect}`
            : `${baseUrl}/events?${bodySelect.replace(/^&/, "")}`;

        const res = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to fetch user calendar events: ${res.status} ${res.statusText} - ${err}`);
        }

        const data = await res.json();
        return data.value ?? [];
    }
}
