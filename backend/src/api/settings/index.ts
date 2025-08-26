import settingsSave from './settingsSave';
import settingsFind from './settingsFind';

export default (app) => {
  app.put(
    `/tenant/:tenantId/settings`,
    settingsSave,
  );
  app.get(
    `/tenant/:tenantId/settings`,
    settingsFind,
  );
};
