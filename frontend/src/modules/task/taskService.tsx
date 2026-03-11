import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import authAxios from 'src/modules/shared/axios/authAxios';

export default class TaskService {
  static async update(id, data) {
    const body = {
      id,
      data,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.put(
      `/tenant/${tenantId}/task/${id}`,
      body,
    );

    return response.data;
  }

  static async destroyAll(ids) {
    const params = {
      ids,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.delete(
      `/tenant/${tenantId}/task`,
      {
        params,
      },
    );

    return response.data;
  }

  static async create(data) {
    const body = {
      data,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.post(
      `/tenant/${tenantId}/task`,
      body,
    );

    return response.data;
  }

  static async bulkCreate(projectId, tasks) {
    const body = {
      data: { projectId, tasks },
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.post(
      `/tenant/${tenantId}/task/bulk-create`,
      body,
    );

    return response.data;
  }

  static async bulkUpdateEstimates(updates) {
    const body = {
      data: { updates },
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.put(
      `/tenant/${tenantId}/task/bulk-update-estimates`,
      body,
    );

    return response.data;
  }

  /**
   * Single call: create new tasks and update estimates. Payload: { projectId, newTasks: [{ tempId, type, title, storyPoints?, estimatedTime?, parentTempId?, parentId? }], updates: [{ id, storyPoints?, estimatedTime? }] }
   */
  static async savePlan(payload) {
    const body = {
      data: payload,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.put(
      `/tenant/${tenantId}/task/plan-save`,
      body,
    );

    return response.data;
  }

  static async import(values, importHash) {
    const body = {
      data: values,
      importHash,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.post(
      `/tenant/${tenantId}/task/import`,
      body,
    );

    return response.data;
  }

  static async find(id) {
    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.get(
      `/tenant/${tenantId}/task/${id}`,
    );

    return response.data;
  }

  /**
   * Update local task from linked Microsoft Planner task.
   * @param id - Task id
   * @param fields - Optional list: 'title' | 'description' | 'estimatedStart' | 'estimatedEnd'. If omitted, all are applied.
   */
  static async syncFromPlanner(id, fields?) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/task/${id}/sync-from-planner`,
      { data: fields && fields.length ? { fields } : {} },
    );
    return response.data;
  }

  /**
   * Send task to Microsoft Planner (create or update).
   * @param id - Task id
   * @param payload - { planId, bucketId? (required when creating), fields?: ['title','description','estimatedStart','estimatedEnd'] }
   */
  static async sendToPlanner(id, payload) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/task/${id}/send-to-planner`,
      { data: payload },
    );
    return response.data;
  }

  static async list(filter, orderBy, limit, offset) {
    const params = {
      filter,
      orderBy,
      limit,
      offset,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.get(
      `/tenant/${tenantId}/task`,
      {
        params,
      },
    );

    return response.data;
  }

  static async getAggregateEstimates(projectId: string, type: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/task/reports/aggregate-estimates`,
      { params: { projectId, type } },
    );
    return response.data;
  }

  static async listAutocomplete(query, limit) {
    const params = {
      query,
      limit,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.get(
      `/tenant/${tenantId}/task/autocomplete`,
      {
        params,
      },
    );

    return response.data;
  }
}
