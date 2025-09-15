import MsTaskService  from "./src/integrations/msGraph/msTaskService";
require('dotenv').config();

// async function testGetTasksOfBoard() {
//     try {
//         const planId = "orzNvoilGUS6enGocQGEV-EADxr-";
//         console.log(`Getting all tasks of plan: ${planId}`);
        
//         const tasks = await MsTaskService.getTasksOfBoard(planId);
//         console.log("Tasks retrieved successfully:");
//         console.log(JSON.stringify(tasks, null, 2));
//     } catch (error) {
//         console.error("Error getting tasks:", error instanceof Error ? error.message : String(error));
//     }
// }

// // Execute the test
// testGetTasksOfBoard();

// async function testSearchTaskByTitle() {
//     try {
//         const planId = "orzNvoilGUS6enGocQGEV-EADxr-";
        
//         console.log("Loading board details and users...");
//         const boardDetails = await MsTaskService.getBoardDetails(planId);
//         const categoriesLookup = boardDetails.categories || boardDetails.details?.categoryDescriptions || {};
//         const allUsers = await MsTaskService.getAllUsers();
        
//         // Create user lookup map for quick access
//         const userLookup: { [key: string]: any } = {};
//         allUsers.forEach((user: any) => {
//             userLookup[user.id] = user;
//         });
        
//         console.log(`Loaded ${allUsers.length} users and board details with ${Object.keys(categoriesLookup).length} categories`);
//         console.log("Available categories:", Object.keys(categoriesLookup));
//         if (Object.keys(categoriesLookup).length > 0) {
//             console.log("Category details:", JSON.stringify(categoriesLookup, null, 2));
//         }

//         // Test exact search
//         console.log("\n=== Test 1: Exact search ===");
//         let searchQuery = "Create the flow for MLM configuration";
//         console.log(`Searching for tasks with title containing: "${searchQuery}"`);
        
//         let foundTasks = await MsTaskService.searchTaskByTextInTitle(planId, searchQuery);
//         console.log(`Found ${foundTasks.length} task(s)`);
        
//         if (foundTasks.length > 0) {
//             foundTasks.forEach((task: any, index: number) => {
//                 console.log(`\n--- Task ${index + 1} ---`);
//                 console.log(`ID: ${task.id}`);
//                 console.log(`Title: ${task.title}`);
//                 console.log(`Bucket ID: ${task.bucketId}`);
//                 console.log(`Percent Complete: ${task.percentComplete}%`);
//                 console.log(`Priority: ${task.priority}`);
//                 console.log(`Created: ${task.createdDateTime}`);
//                 console.log(`Due Date: ${task.dueDateTime || 'No due date'}`);
//                 console.log(`Has Description: ${task.hasDescription}`);
                
//                 // Log assigned users with email
//                 const assignments = task.assignments || {};
//                 const assignedUsers = Object.keys(assignments);
//                 if (assignedUsers.length > 0) {
//                     console.log(`Assigned to (${assignedUsers.length} user(s)):`);
//                     assignedUsers.forEach((userId, userIndex) => {
//                         const assignment = assignments[userId];
//                         const user = userLookup[userId];
//                         const assignedByUser = userLookup[assignment.assignedBy?.user?.id];
                        
//                         console.log(`  ${userIndex + 1}. ${user?.displayName || 'Unknown User'} (${user?.mail || user?.userPrincipalName || 'No email'})`);
//                         console.log(`     User ID: ${userId}`);
//                         console.log(`     Assigned Date: ${assignment.assignedDateTime}`);
//                         console.log(`     Assigned By: ${assignedByUser?.displayName || 'Unknown'} (${assignedByUser?.mail || assignedByUser?.userPrincipalName || 'No email'})`);
//                     });
//                 } else {
//                     console.log(`Assigned to: No assignments`);
//                 }
                
//                 // Log categories with names
//                 const categories = task.appliedCategories || {};
//                 const categoryKeys = Object.keys(categories);
//                 if (categoryKeys.length > 0) {
//                     console.log(`Categories (${categoryKeys.length}):`);
//                     categoryKeys.forEach((categoryKey, catIndex) => {
//                         const categoryInfo = categoriesLookup[categoryKey];
//                         let categoryName = 'Unknown Category';
                        
//                         if (categoryInfo) {
//                             // Microsoft Planner category structure
//                             categoryName = categoryInfo || 'Unknown Category';
//                         } else {
//                             // Fallback: use the key as name if no lookup found
//                             categoryName = categoryKey;
//                         }
                        
//                         console.log(`  ${catIndex + 1}. ${categoryKey} - ${categoryName}`);
//                     });
//                 } else {
//                     console.log(`Categories: None`);
//                 }
                
//                 // Log created by with email
//                 if (task.createdBy?.user?.id) {
//                     const createdByUser = userLookup[task.createdBy.user.id];
//                     console.log(`Created by: ${createdByUser?.displayName || 'Unknown User'} (${createdByUser?.mail || createdByUser?.userPrincipalName || 'No email'})`);
//                     console.log(`Created by ID: ${task.createdBy.user.id}`);
//                 }
                
//                 // Log completed by (if completed)
//                 if (task.completedBy?.user?.id) {
//                     const completedByUser = userLookup[task.completedBy.user.id];
//                     console.log(`Completed by: ${completedByUser?.displayName || 'Unknown User'} (${completedByUser?.mail || completedByUser?.userPrincipalName || 'No email'})`);
//                     console.log(`Completed on: ${task.completedDateTime}`);
//                 }
//             });
//         }
        
//         // Test partial search
//         console.log("\n=== Test 2: Partial search ===");
//         searchQuery = "edit";
//         console.log(`Searching for tasks with title containing: "${searchQuery}"`);
        
//         foundTasks = await MsTaskService.searchTaskByTextInTitle(planId, searchQuery);
//         console.log(`Found ${foundTasks.length} task(s)`);
        
//         if (foundTasks.length > 0) {
//             foundTasks.forEach((task: any, index: number) => {
//                 const assignments = task.assignments || {};
//                 const assignedUsers = Object.keys(assignments);
//                 const assignedUserNames = assignedUsers.map(userId => {
//                     const user = userLookup[userId];
//                     return user?.displayName || 'Unknown';
//                 }).join(', ');
                
//                 console.log(`  ${index + 1}. ${task.title} (${task.percentComplete}% complete)`);
//                 console.log(`     Assigned to: ${assignedUserNames || 'No assignments'}`);
//             });
//         }
        
//         // Test search with no results
//         console.log("\n=== Test 3: Search with no results ===");
//         searchQuery = "ThisTaskDoesNotExist";
//         console.log(`Searching for tasks with title containing: "${searchQuery}"`);
        
//         foundTasks = await MsTaskService.searchTaskByTextInTitle(planId, searchQuery);
//         console.log(`Found ${foundTasks.length} task(s)`);
        
//         if (foundTasks.length === 0) {
//             console.log("  No tasks found matching the search criteria.");
//         }
        
//     } catch (error) {
//         console.error("Error searching for tasks:", error instanceof Error ? error.message : String(error));
//     }
// }

// // Execute the search test
// testSearchTaskByTitle();


// async function createTaskWithDetails(){
//     try {
//         const planId = "orzNvoilGUS6enGocQGEV-EADxr-";
//         const assignToEmail = "jeevesh.tewatia@coderower.com";
//         const createdByEmail = "ishaan@coderower.com";
//         const categoryName = "WaPaS"; // category4
//         const taskTitle = "Test task with working description";
//         const taskDescription = `Video Explaination: https://recordings.fabbuilder.com/watch/cTQ6Ylno4KG

// Available Lists:
// - Achievement: Details related to achieving a goal
// - Coupons: Information about discounts or offers
// - Rules: Guidelines or rules for completing tasks
// - Group: Related to working in a group
// - Commission Group: Pertains to commission-based tasks 
// - Partners: Tasks related to business partners
// - Services: Tasks related to offering services`;

//         console.log("=== Creating Task with Details ===");
//         console.log(`Plan ID: ${planId}`);
//         console.log(`Task Title: ${taskTitle}`);
//         console.log(`Assign To: ${assignToEmail}`);
//         console.log(`Created By: ${createdByEmail}`);
//         console.log(`Category: ${categoryName}`);

//         // Step 1: Get board details to find category ID
//         console.log("\n1. Loading board details...");
//         const boardDetails = await MsTaskService.getBoardDetails(planId);
//         const categoriesLookup = boardDetails.categories || boardDetails.details?.categoryDescriptions || {};
        
//         // Find category ID by name
//         let categoryId: string = "category4"; // Default to category4
//         for (const [id, name] of Object.entries(categoriesLookup)) {
//             if (name === categoryName) {
//                 categoryId = id;
//                 break;
//             }
//         }
        
//         if (!categoriesLookup[categoryId]) {
//             console.log(`Warning: Category "${categoryName}" not found. Available categories:`, categoriesLookup);
//             console.log(`Using default category: ${categoryId}`);
//         }
        
//         console.log(`Found category ID: ${categoryId} -> ${categoriesLookup[categoryId] || 'Default category'}`);

//         // Step 2: Get buckets to assign task to a bucket
//         console.log("\n2. Loading buckets...");
//         const buckets = await MsTaskService.getBuckets(planId);
//         console.log(`Found ${buckets.length} buckets`);
        
//         if (buckets.length === 0) {
//             throw new Error("No buckets found in the plan. At least one bucket is required to create a task.");
//         }
        
//         // Use the first bucket
//         const targetBucket = buckets[0];
//         console.log(`Using bucket: ${targetBucket.name} (${targetBucket.id})`);

//         // Step 3: Get user information
//         console.log("\n3. Loading user information...");
//         const assignToUser = await MsTaskService.getUserByEmail(assignToEmail);
//         const createdByUser = await MsTaskService.getUserByEmail(createdByEmail);
        
//         console.log(`Assign To User: ${assignToUser.displayName} (${assignToUser.id})`);
//         console.log(`Created By User: ${createdByUser.displayName} (${createdByUser.id})`);

//         // Step 4: Create the task
//         console.log("\n4. Creating the task...");
//         const taskData = {
//             planId: planId,
//             bucketId: targetBucket.id,
//             title: taskTitle,
//             assignments: {
//                 [assignToUser.id]: {
//                     "@odata.type": "#microsoft.graph.plannerAssignment",
//                     orderHint: " !"
//                 }
//             },
//             appliedCategories: {
//                 [categoryId]: true
//             }
//         };

//         console.log("Task data:", JSON.stringify(taskData, null, 2));
        
//         const createdTask = await MsTaskService.createTask(planId, taskData);
        
//         console.log("\n✅ Task created successfully!");
//         console.log(`Task ID: ${createdTask.id}`);
//         console.log(`Task Title: ${createdTask.title}`);
//         console.log(`Bucket ID: ${createdTask.bucketId}`);
//         console.log(`Plan ID: ${createdTask.planId}`);
        
//         // Display assignments
//         const assignments = createdTask.assignments || {};
//         const assignedUsers = Object.keys(assignments);
//         console.log(`\nAssigned to (${assignedUsers.length} user(s)):`);
//         assignedUsers.forEach((userId, index) => {
//             const isTargetUser = userId === assignToUser.id;
//             console.log(`  ${index + 1}. ${isTargetUser ? assignToUser.displayName : 'Unknown User'} (${userId})`);
//         });
        
//         // Display categories
//         const categories = createdTask.appliedCategories || {};
//         const categoryKeys = Object.keys(categories);
//         console.log(`\nCategories (${categoryKeys.length}):`);
//         categoryKeys.forEach((key, index) => {
//             const categoryName = categoriesLookup[key] || 'Unknown Category';
//             console.log(`  ${index + 1}. ${key} - ${categoryName}`);
//         });

//         console.log(`\n5. Adding task description...`);
//         try {
//             const updatedDetails = await MsTaskService.updateTaskDetails(createdTask.id, taskDescription);
//             console.log("✅ Task description added successfully!");
//             console.log("Description update result:", JSON.stringify(updatedDetails, null, 2));
//         } catch (descError) {
//             console.log("⚠️ Could not add description:", descError instanceof Error ? descError.message : String(descError));
//         }
        
//         return createdTask;
        
//     } catch (error) {
//         console.error("Error creating task:", error instanceof Error ? error.message : String(error));
//         throw error;
//     }
// }

// // Execute the create task test
// createTaskWithDetails();

// async function testUpdateTaskDetails() {
//     try {
//         const taskId = "IHMA8E-tH0y_f4joyq7fj-EACgDA"; // Use the previously created task ID
//         const description = `Video Explaination: https://recordings.fabbuilder.com/watch/cTQ6Ylno4KG

// Available Lists:
// - Achievement: Details related to achieving a goal
// - Coupons: Information about discounts or offers
// - Rules: Guidelines or rules for completing tasks
// - Group: Related to working in a group
// - Commission Group: Pertains to commission-based tasks 
// - Partners: Tasks related to business partners
// - Services: Tasks related to offering services`;

//         console.log("=== Testing Update Task Details ===");
//         console.log(`Task ID: ${taskId}`);
//         console.log(`Description length: ${description.length} characters`);
        
//         const result = await MsTaskService.updateTaskDetails(taskId, description);
//         console.log("✅ Task details updated successfully!");
//         console.log("Result:", JSON.stringify(result, null, 2));
        
//     } catch (error) {
//         console.error("❌ Error updating task details:", error instanceof Error ? error.message : String(error));
//     }
// }

// Execute the update task details test
// testUpdateTaskDetails();



async function createTaskWithDetailsInChecklist() {
    try {
        const planId = "ltAHsib4MEiRUj7EOYq2yeEAH4V2";
        const bucketName = "Backlog";
        const assignToEmail = "ishaan@coderower.com";
        const categoryName = "PagePilot"; // category4
        const taskTitle = "Issues on try 1";
        const taskDescription = `Video Explaination: https://recordings.fabbuilder.com/watch/cTQoqRnod8R`;

        const checkListItems = [
            { title: "Task 1: Update color and theme of onboarding screens and left menu", isChecked: false },
            { title: "Task 2: Remove onboarding from here or make it proper", isChecked: false },
            { title: "Task 3: This is incorrect - fix issue", isChecked: false },
            { title: "Task 4: Add light or green dot indicator as per Figma", isChecked: false },
            { title: "Task 5: This has to be from visitor stats", isChecked: false },
            { title: "Task 6: This is incorrect", isChecked: false },
            { title: "Fix filter inconsistency: All tours desktop live vs draft", isChecked: false },
            { title: "Add provision to go back to all (remove hardcoded 52)", isChecked: false },
            { title: "Task 7: Add checkbox/flag for tooltip/tour availability", isChecked: false },
            { title: "Task 7: Highlight as red color", isChecked: false },
            { title: "Task 8: Fix help icon - add tour/tooltip functionality", isChecked: false },
            { title: "Task 8: Fix loading issue", isChecked: false },
            { title: "Clarify difference between components", isChecked: false },
            { title: "Task 9: Fix functionality issues", isChecked: false },
            { title: "Task 10: Fix stuck/not working issue", isChecked: false },
        ];

        console.log("=== Creating Task with Details and Checklist ===");
        console.log(`Plan ID: ${planId}`);
        console.log(`Task Title: ${taskTitle}`);
        console.log(`Bucket Name: ${bucketName}`);
        console.log(`Assign To: ${assignToEmail}`);
        console.log(`Category: ${categoryName}`);
        console.log(`Checklist Items: ${checkListItems.length} items`);

        // Step 1: Get board details to find category ID
        console.log("\n1. Loading board details...");
        const boardDetails = await MsTaskService.getBoardDetails(planId);
        const categoriesLookup = boardDetails.categories || boardDetails.details?.categoryDescriptions || {};
        
        // Find category ID by name
        let categoryId: string = "category4"; // Default to category4
        for (const [id, name] of Object.entries(categoriesLookup)) {
            if (name === categoryName) {
                categoryId = id;
                break;
            }
        }
        
        if (!categoriesLookup[categoryId]) {
            console.log(`Warning: Category "${categoryName}" not found. Available categories:`, categoriesLookup);
            console.log(`Using default category: ${categoryId}`);
        }
        
        console.log(`Found category ID: ${categoryId} -> ${categoriesLookup[categoryId] || 'Default category'}`);

        // Step 2: Get bucket by name
        console.log("\n2. Loading bucket by name...");
        const targetBucket = await MsTaskService.getBucketByName(planId, bucketName);
        console.log(`Found bucket: ${targetBucket.name} (${targetBucket.id})`);

        // Step 3: Get user information
        console.log("\n3. Loading user information...");
        const assignToUser = await MsTaskService.getUserByEmail(assignToEmail);
        
        console.log(`Assign To User: ${assignToUser.displayName} (${assignToUser.id})`);

        // Step 4: Create the task
        console.log("\n4. Creating the task...");
        const taskData = {
            planId: planId,
            bucketId: targetBucket.id,
            title: taskTitle,
            assignments: {
                [assignToUser.id]: {
                    "@odata.type": "#microsoft.graph.plannerAssignment",
                    orderHint: " !"
                }
            },
            appliedCategories: {
                [categoryId]: true
            }
        };

        console.log("Task data:", JSON.stringify(taskData, null, 2));
        
        const createdTask = await MsTaskService.createTask(planId, taskData);
        
        console.log("\n✅ Task created successfully!");
        console.log(`Task ID: ${createdTask.id}`);
        console.log(`Task Title: ${createdTask.title}`);
        console.log(`Bucket ID: ${createdTask.bucketId}`);
        console.log(`Plan ID: ${createdTask.planId}`);
        
        // Display assignments
        const assignments = createdTask.assignments || {};
        const assignedUsers = Object.keys(assignments);
        console.log(`\nAssigned to (${assignedUsers.length} user(s)):`);
        assignedUsers.forEach((userId, index) => {
            const isTargetUser = userId === assignToUser.id;
            console.log(`  ${index + 1}. ${isTargetUser ? assignToUser.displayName : 'Unknown User'} (${userId})`);
        });
        
        // Display categories
        const categories = createdTask.appliedCategories || {};
        const categoryKeys = Object.keys(categories);
        console.log(`\nCategories (${categoryKeys.length}):`);
        categoryKeys.forEach((key, index) => {
            const categoryName = categoriesLookup[key] || 'Unknown Category';
            console.log(`  ${index + 1}. ${key} - ${categoryName}`);
        });

        // Step 5: Add task description
        console.log(`\n5. Adding task description...`);
        try {
            const updatedDetails = await MsTaskService.updateTaskDetails(createdTask.id, taskDescription);
            console.log("✅ Task description added successfully!");
            console.log("Description update result:", JSON.stringify(updatedDetails, null, 2));
        } catch (descError) {
            console.log("⚠️ Could not add description:", descError instanceof Error ? descError.message : String(descError));
        }

        // Step 6: Add checklist items
        console.log(`\n6. Adding checklist items...`);
        try {
            const checklistResults = await MsTaskService.addChecklistItems(createdTask.id, checkListItems);
            console.log("✅ Checklist items added successfully!");
            console.log("Checklist results:");
            checklistResults.forEach((item: any, index: number) => {
                console.log(`  ${index + 1}. ${item.title} (${item.isChecked ? 'Checked' : 'Unchecked'}) - ${item.success ? 'Success' : 'Failed'}`);
            });
        } catch (checklistError) {
            console.log("⚠️ Could not add checklist items:", checklistError instanceof Error ? checklistError.message : String(checklistError));
        }
        
        console.log("\n🎉 Task with description and checklist created successfully!");
        return createdTask;
        
    } catch (error) {
        console.error("Error creating task with checklist:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}

// Execute the create task with checklist test
createTaskWithDetailsInChecklist();