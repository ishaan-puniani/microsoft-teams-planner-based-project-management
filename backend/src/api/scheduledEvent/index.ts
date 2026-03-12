import fromTeamsCalendar from "./fromTeamsCalendar";
import scheduledEventCreate from "./scheduledEventCreate";
import scheduledEventUpdate from "./scheduledEventUpdate";
import scheduledEventImport from "./scheduledEventImport";
import scheduledEventDestroy from "./scheduledEventDestroy";
import scheduledEventAutocomplete from "./scheduledEventAutocomplete";
import scheduledEventCount from "./scheduledEventCount";
import scheduledEventList from "./scheduledEventList";
import scheduledEventFind from "./scheduledEventFind";

export default (app) => {
    // app.get('/tenant/:tenantId/scheduled-event-schedule/get-upcoming-scheduledEvent', fromTeamsCalendar);
  app.post(
    `/tenant/:tenantId/scheduled-event`,
    scheduledEventCreate,
  );
  app.put(
    `/tenant/:tenantId/scheduled-event/:id`,
    scheduledEventUpdate,
  );

  app.post(
    `/tenant/:tenantId/scheduled-event/import`,
    scheduledEventImport,
  );
  app.delete(
    `/tenant/:tenantId/scheduled-event`,
    scheduledEventDestroy,
  );
  app.get(
    `/tenant/:tenantId/scheduled-event/autocomplete`,
    scheduledEventAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/scheduled-event/count`,
    scheduledEventCount,
  );
  app.get(
    `/tenant/:tenantId/scheduled-event`,
    scheduledEventList,
  );
  app.get(
    `/tenant/:tenantId/scheduled-event/:id`,
    scheduledEventFind,
  );
};