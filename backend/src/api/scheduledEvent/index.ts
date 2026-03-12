import fromTeamsCalendar from "./fromTeamsCalendar";
import scheduledEventCreate from "./scheduledEventCreate";
import scheduledEventUpdate from "./scheduledEventUpdate";
import scheduledEventImport from "./scheduledEventImport";
import scheduledEventDestroy from "./scheduledEventDestroy";
import scheduledEventAutocomplete from "./scheduledEventAutocomplete";
import scheduledEventCount from "./scheduledEventCount";
import scheduledEventList from "./scheduledEventList";
import scheduledEventFind from "./scheduledEventFind";
import scheduledEventUpcoming from "./scheduledEventUpcoming";
import scheduledEventCurrentlyRunning from "./scheduledEventCurrentlyRunning";

export default (app) => {
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
  // Must be before /:id to avoid routing conflict
  app.get(
    `/tenant/:tenantId/scheduled-event/upcoming`,
    scheduledEventUpcoming,
  );
  app.get(
    `/tenant/:tenantId/scheduled-event/currently-running`,
    scheduledEventCurrentlyRunning,
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