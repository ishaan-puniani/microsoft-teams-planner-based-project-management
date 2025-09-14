export interface ITaskTemplate {
  id?: string;
  name?: string;
  description?: string;
  type?: 'EPIC' | 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK' | 'TEST_PLAN' | 'TEST_CASE';
  fields?: ITaskTemplateField[];
  workflow?: ITaskTemplateWorkflow;
  isActive?: boolean;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskTemplateField {
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'BOOLEAN';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface ITaskTemplateWorkflow {
  states: ITaskTemplateState[];
  transitions: ITaskTemplateTransition[];
}

export interface ITaskTemplateState {
  name: string;
  color?: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface ITaskTemplateTransition {
  from: string;
  to: string;
  name: string;
}

export interface ITaskTemplateCreate {
  name?: string;
  description?: string;
  type?: 'EPIC' | 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK' | 'TEST_PLAN' | 'TEST_CASE';
  fields?: ITaskTemplateField[];
  workflow?: ITaskTemplateWorkflow;
  isActive?: boolean;
  tenant: string;
}

export interface ITaskTemplateUpdate {
  name?: string;
  description?: string;
  type?: 'EPIC' | 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK' | 'TEST_PLAN' | 'TEST_CASE';
  fields?: ITaskTemplateField[];
  workflow?: ITaskTemplateWorkflow;
  isActive?: boolean;
  tenant?: string;
}

export interface ITaskTemplateFilter {
  name?: string;
  description?: string;
  type?: string;
  isActive?: boolean;
  tenant?: string;
  importHash?: string;
}
