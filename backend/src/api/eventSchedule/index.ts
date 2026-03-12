import fromTeamsCalendar from "./fromTeamsCalendar";

export default (app) => {
    app.get('/tenant/:tenantId/event-schedule/get-upcoming-events', fromTeamsCalendar);

};