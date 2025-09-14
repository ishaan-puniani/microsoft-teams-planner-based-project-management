export interface IProject {
  id?: string;
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  epicTemplate?: string;
  userStoryTemplate?: string;
  taskTemplate?: string;
  bugTemplate?: string;
  subtaskTemplate?: string;
  testPlanTemplate?: string;
  testCaseTemplate?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectCreate {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  epicTemplate?: string;
  userStoryTemplate?: string;
  taskTemplate?: string;
  bugTemplate?: string;
  subtaskTemplate?: string;
  testPlanTemplate?: string;
  testCaseTemplate?: string;
  tenant: string;
}

export interface IProjectUpdate {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  epicTemplate?: string;
  userStoryTemplate?: string;
  taskTemplate?: string;
  bugTemplate?: string;
  subtaskTemplate?: string;
  testPlanTemplate?: string;
  testCaseTemplate?: string;
  tenant?: string;
}

export interface IProjectFilter {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  tenant?: string;
  importHash?: string;
}
