import { getConfig } from "../../config";

export default class MsTaskService {

    static async _getServiceToken(): Promise<string> {
        const tenantId = getConfig().MS_TENANT_ID;
        const clientId = getConfig().MS_CLIENT_ID;
        const clientSecret = getConfig().MS_CLIENT_SECRET;
        const scope = getConfig().MS_SCOPE;

        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('scope', scope);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token request error details:', errorText);
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }

            const tokenData = await response.json();
            return tokenData.access_token;

        } catch (error) {
            throw new Error(`Failed to get service token: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    static async getAllGroups(): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/groups`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch groups: ${response.status} ${response.statusText}`);
            }

            const groupsResponse = await response.json();
            return groupsResponse.value || [];
        } catch (error: any) {
            throw new Error(`Failed to get all groups: ${error.message}`);
        }
    }

    static async getAllPlansInGroup(groupId: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/planner/plans`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch plans for group ${groupId}: ${response.status} ${response.statusText}`);
            }

            const plansResponse = await response.json();
            return plansResponse.value || [];
        } catch (error: any) {
            throw new Error(`Failed to get all plans in group ${groupId}: ${error.message}`);
        }
    }

    static async getTasksOfBoard(planId: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/planner/plans/${planId}/tasks`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks of plan ${planId}: ${response.status} ${response.statusText}`);
            }

            const tasksResponse = await response.json();
            return tasksResponse.value || [];
        } catch (error: any) {
            throw new Error(`Failed to get tasks of plan ${planId}: ${error.message}`);
        }
    }

    static async searchTaskByTextInTitle(planId: string, titleQuery: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/planner/plans/${planId}/tasks`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks of plan ${planId}: ${response.status} ${response.statusText}`);
            }

            const tasksResponse = await response.json();
            const tasks = tasksResponse.value || [];

            return tasks.filter((task: any) =>
                task.title && task.title.toLowerCase().includes(titleQuery.toLowerCase())
            );
        } catch (error: any) {
            throw new Error(`Failed to search tasks in plan ${planId}: ${error.message}`);
        }
    }

    static async createTask(planId: string, taskData: any): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/planner/tasks`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create task error details:', errorText);
                throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(`Failed to create task: ${error.message}`);
        }
    }

    static async getBuckets(planId: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/planner/plans/${planId}/buckets`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch buckets for plan ${planId}: ${response.status} ${response.statusText}`);
            }

            const bucketsResponse = await response.json();
            return bucketsResponse.value || [];
        } catch (error: any) {
            throw new Error(`Failed to get buckets for plan ${planId}: ${error.message}`);
        }
    }

    static async getUserByEmail(email: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/users/${email}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user with email ${email}: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(`Failed to get user with email ${email}: ${error.message}`);
        }
    }

    static async getBoardDetails(planId: string): Promise<any> {
        const token = await this._getServiceToken();

        try {
            // Get plan details first
            const planUrl = `https://graph.microsoft.com/v1.0/planner/plans/${planId}`;
            const planResponse = await fetch(planUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!planResponse.ok) {
                throw new Error(`Failed to fetch plan ${planId}: ${planResponse.status} ${planResponse.statusText}`);
            }

            const planData = await planResponse.json();

            // Get plan details for categories
            const detailsUrl = `https://graph.microsoft.com/v1.0/planner/plans/${planId}/details`;
            const detailsResponse = await fetch(detailsUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!detailsResponse.ok) {
                console.log(`Could not fetch plan details: ${detailsResponse.status} ${detailsResponse.statusText}`);
                return planData;
            }

            const detailsData = await detailsResponse.json();

            return {
                ...planData,
                details: detailsData,
                categories: detailsData.categoryDescriptions || {}
            };

        } catch (error: any) {
            throw new Error(`Failed to get board details for plan ${planId}: ${error.message}`);
        }
    }

    static async getAllUsers(): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/users`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
            }

            const usersResponse = await response.json();
            return usersResponse.value || [];
        } catch (error: any) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }

    static async updateTaskDetails(taskId: string, description: string): Promise<any> {
        const token = await this._getServiceToken();
        const url = `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`;

        try {
            console.log(`Updating task details for task ID: ${taskId}`);

            // First, get the current task details to get the eTag
            const getResponse = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            let etag = '';
            let isNewDetails = true;

            if (getResponse.ok) {
                try {
                    const currentDetails = await getResponse.json();
                    etag = getResponse.headers.get('ETag') || '';
                    isNewDetails = false;
                    console.log("Found existing task details, will update");
                } catch (parseError) {
                    console.log("Could not parse existing task details, will create new");
                }
            } else if (getResponse.status === 404) {
                console.log("Task details not found, will create new details");
            } else {
                console.log(`Could not get current task details: ${getResponse.status} ${getResponse.statusText}`);
            }

            // Prepare update data
            const updateData = {
                description: description,
                previewType: "description"
            };

            const headers: any = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            // For updates, we need the If-Match header with eTag
            if (!isNewDetails && etag) {
                headers['If-Match'] = etag;
            }

            // Use PATCH for updates, PUT for creation
            const method = isNewDetails ? "PUT" : "PATCH";

            console.log(`Making ${method} request to update task details`);
            console.log("Update data:", JSON.stringify(updateData, null, 2));

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update task details error response:', errorText);
                throw new Error(`Failed to update task details: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Check if response has content before trying to parse JSON
            const contentLength = response.headers.get('content-length');
            const contentType = response.headers.get('content-type');

            if (contentLength === '0' || !contentType?.includes('application/json')) {
                console.log("Task details updated successfully (no response body)");
                return { success: true, description: description };
            }

            try {
                const result = await response.json();
                console.log("Task details updated successfully with response");
                return result;
            } catch (jsonError) {
                console.log("Task details updated successfully (could not parse response JSON)");
                return { success: true, description: description };
            }

        } catch (error: any) {
            console.error("Error in updateTaskDetails:", error);
            throw new Error(`Failed to update task details for ${taskId}: ${error.message}`);
        }
    }

    /**
     * Add checklist items to a task
     * @param taskId - The ID of the task
     * @param checklistItems - Array of checklist items to add
     */
    static async addChecklistItems(taskId: string, checklistItems: Array<{ title: string, isChecked: boolean }>): Promise<any> {
        try {
            const token = await this._getServiceToken();

            console.log(`Adding ${checklistItems.length} checklist items to task: ${taskId}`);

            // First, get current task details to get eTag
            const getUrl = `https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`;
            const getResponse = await fetch(getUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            let etag = '';
            let currentChecklist = {};

            if (getResponse.ok) {
                const currentDetails = await getResponse.json();
                etag = getResponse.headers.get('ETag') || '';
                currentChecklist = currentDetails.checklist || {};
                console.log("Retrieved current task details for checklist update");
            }

            // Build new checklist items
            const newChecklistItems: any = {};
            checklistItems.forEach((item, index) => {
                // Use a unique key for each checklist item
                const uniqueKey = `item_${Date.now()}_${index}`;
                newChecklistItems[uniqueKey] = {
                    "@odata.type": "microsoft.graph.plannerChecklistItem",
                    title: item.title,
                    isChecked: item.isChecked
                };
                console.log(`Preparing checklist item: ${item.title} (checked: ${item.isChecked})`);
            });

            // Merge with existing checklist items
            const updatedChecklist = {
                ...currentChecklist,
                ...newChecklistItems
            };

            const updateData = {
                checklist: updatedChecklist
            };

            const headers: any = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            if (etag) {
                headers['If-Match'] = etag;
            }

            console.log("Updating checklist with data:", JSON.stringify(updateData, null, 2));

            const response = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}/details`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Add checklist items error response:', errorText);
                throw new Error(`Failed to add checklist items: ${response.status} ${response.statusText} - ${errorText}`);
            }

            console.log(`✅ Added all ${checklistItems.length} checklist items successfully`);

            // Return results
            const results = checklistItems.map(item => ({
                title: item.title,
                isChecked: item.isChecked,
                success: true
            }));

            return results;

        } catch (error: any) {
            console.error("Error in addChecklistItems:", error);
            throw new Error(`Failed to add checklist items to task ${taskId}: ${error.message}`);
        }
    }

    /**
     * Get buckets by name
     * @param planId - The ID of the plan
     * @param bucketName - Name of the bucket to find
     */
    static async getBucketByName(planId: string, bucketName: string): Promise<any> {
        try {
            const buckets = await this.getBuckets(planId);
            console.log(`Looking for bucket: "${bucketName}"`);
            console.log(`Available buckets: ${buckets.map((b: any) => `"${b.name}"`).join(', ')}`);

            const bucket = buckets.find((b: any) => b.name.trim().toLowerCase() === bucketName.trim().toLowerCase());

            if (!bucket) {
                throw new Error(`Bucket "${bucketName}" not found. Available buckets: ${buckets.map((b: any) => b.name).join(', ')}`);
            }

            return bucket;
        } catch (error: any) {
            console.error("Error in getBucketByName:", error);
            throw new Error(`Failed to find bucket "${bucketName}": ${error.message}`);
        }
    }
}