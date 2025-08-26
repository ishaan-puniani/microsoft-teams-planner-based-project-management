import auditLogList from './auditLogList';

export default (app) => {
  app.get(
    `/tenant/:tenantId/audit-log`,
    auditLogList,
  );
};
