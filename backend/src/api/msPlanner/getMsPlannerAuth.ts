import { decrypt } from '../../utils/encryption';
import { MsPlannerCredentials } from '../../integrations/msGraph/msTaskService';

/**
 * Get MS Planner credentials from the current tenant.
 * Uses decrypted msPlanner when available, otherwise decrypts msPlannerEncrypted.
 */
export function getMsPlannerAuth(req: { currentTenant: any }): MsPlannerCredentials | undefined {
  const tenant = req.currentTenant;
  if (!tenant) return undefined;
  if (tenant.msPlanner && typeof tenant.msPlanner === 'object') {
    return tenant.msPlanner as MsPlannerCredentials;
  }
  if (tenant.msPlannerEncrypted) {
    try {
      return JSON.parse(decrypt(tenant.msPlannerEncrypted)) as MsPlannerCredentials;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
