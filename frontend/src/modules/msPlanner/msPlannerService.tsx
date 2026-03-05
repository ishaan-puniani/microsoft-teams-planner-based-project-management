import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import authAxios from 'src/modules/shared/axios/authAxios';

export default class MsPlannerService {
  // static async update(id, data) {
  //   const body = {
  //     id,
  //     data,
  //   };

  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.put(
  //     `/tenant/${tenantId}/project/${id}`,
  //     body,
  //   );

  //   return response.data;
  // }

  // static async destroyAll(ids) {
  //   const params = {
  //     ids,
  //   };

  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.delete(
  //     `/tenant/${tenantId}/project`,
  //     {
  //       params,
  //     },
  //   );

  //   return response.data;
  // }

  // static async create(data) {
  //   const body = {
  //     data,
  //   };

  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.post(
  //     `/tenant/${tenantId}/project`,
  //     body,
  //   );

  //   return response.data;
  // }

  // static async import(values, importHash) {
  //   const body = {
  //     data: values,
  //     importHash,
  //   };

  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.post(
  //     `/tenant/${tenantId}/project/import`,
  //     body,
  //   );

  //   return response.data;
  // }

  // static async find(id) {
  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.get(
  //     `/tenant/${tenantId}/project/${id}`,
  //   );

  //   return response.data;
  // }

  // static async list(filter, orderBy, limit, offset) {
  //   const params = {
  //     filter,
  //     orderBy,
  //     limit,
  //     offset,
  //   };

  //   const tenantId = AuthCurrentTenant.get();

  //   const response = await authAxios.get(
  //     `/tenant/${tenantId}/project`,
  //     {
  //       params,
  //     },
  //   );

  //   return response.data;
  // }
  static async getUsers() {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/users`,
    );
    return response.data;
  }

  static async getPlan(planId) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/plan/${planId}`,
    );
    return response.data;
  }

  static async getTasks(planId) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/tasks/${planId}`,
    );
    return response.data;
  }

  static async getBuckets(planId) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/plan/${planId}/buckets`,
    );
    return response.data;
  }

  static async createTask(planId, payload) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ms-planner/plan/${planId}/task`,
      payload,
    );
    return response.data;
  }

  static async getTask(taskId) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/task/${taskId}`,
    );
    return response.data;
  }

  static async getTaskDetails(taskId) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/task/${taskId}/details`,
    );
    return response.data;
  }

  static async updateTask(taskId, payload) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.patch(
      `/tenant/${tenantId}/ms-planner/task/${taskId}`,
      payload,
    );
    return response.data;
  }

  static async updateTaskDetails(taskId, payload) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.patch(
      `/tenant/${tenantId}/ms-planner/task/${taskId}/details`,
      payload,
    );
    return response.data;
  }

  static async listPlansAutocomplete(query, limit, groupId) {
    const params = {
      query,
      limit,
      groupId,
    };

    const tenantId = AuthCurrentTenant.get();

    const response = await authAxios.get(
      `/tenant/${tenantId}/ms-planner/plans/autocomplete`,
      {
        params,
      },
    );

    return response.data;
  }

  static async listGroupsAutocomplete(query, limit) {
    const params = {
      query,
      limit,
    };

    const tenantId = AuthCurrentTenant.get();

  const response = await authAxios.get(
    `/tenant/${tenantId}/ms-planner/groups/autocomplete`,
    {
      params,
    },
  );

  return response.data;
  }
}
