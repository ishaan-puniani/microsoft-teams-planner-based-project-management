import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import authAxios from 'src/modules/shared/axios/authAxios';

export default class ScheduledEventService {
  static async update(id, data) {
    const body = { id, data };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.put(
      `/tenant/${tenantId}/scheduled-event/${id}`,
      body,
    );
    return response.data;
  }

  static async destroyAll(ids) {
    const params = { ids };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.delete(
      `/tenant/${tenantId}/scheduled-event`,
      { params },
    );
    return response.data;
  }

  static async create(data) {
    const body = { data };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/scheduled-event`,
      body,
    );
    return response.data;
  }

  static async import(values, importHash) {
    const body = { data: values, importHash };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/scheduled-event/import`,
      body,
    );
    return response.data;
  }

  static async find(id) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/scheduled-event/${id}`,
    );
    return response.data;
  }

  static async list(filter, orderBy, limit, offset) {
    const params = { filter, orderBy, limit, offset };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/scheduled-event`,
      { params },
    );
    return response.data;
  }

  static async listAutocomplete(query, limit) {
    const params = { query, limit };
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/scheduled-event/autocomplete`,
      { params },
    );
    return response.data;
  }

  static async updateNextOccurance() {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/update-next-occurrence`,
    );
    return response.data;
  }

  static async fetchUpcoming(inHours: number) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/scheduled-event/upcoming`,
      { params: { hours: inHours } },
    );
    return response.data as Array<{
      event: Record<string, any>;
      nextOccurrence: string;
    }>;
  }

  static async fetchCurrentlyRunning() {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/scheduled-event/currently-running`,
    );
    return response.data as Array<{
      event: Record<string, any>;
      occurrenceStart: string;
      occurrenceEnd: string | null;
    }>;
  }
}
