export interface TaskTemplate {
  id: string;
  name?: string;
  description?: string;
  type?: 'EPIC' | 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK';
  fields?: TaskTemplateField[];
  workflow?: TaskTemplateWorkflow;
  isActive?: boolean;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskTemplateField {
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'BOOLEAN';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface TaskTemplateWorkflow {
  states: TaskTemplateState[];
  transitions: TaskTemplateTransition[];
}

export interface TaskTemplateState {
  name: string;
  color?: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface TaskTemplateTransition {
  from: string;
  to: string;
  name: string;
}

export interface TaskTemplateFormValues {
  name?: string;
  description?: string;
  type?: 'EPIC' | 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK';
  fields?: TaskTemplateField[];
  workflow?: TaskTemplateWorkflow;
  isActive?: boolean;
  tenant: string;
}

export interface TaskTemplateFilter {
  name?: string;
  description?: string;
  type?: string;
  isActive?: boolean;
  tenant?: string;
  importHash?: string;
}
