/**
 * TestCase module uses Task API prefiltered by type "TEST_CASE".
 * Test cases are tasks with type TEST_CASE; this service maps between task and testCase shapes.
 */
import TaskService from 'src/modules/task/taskService';

const TEST_CASE_TYPE = 'TEST_CASE';

/** Map task API row to testCase shape expected by list/view */
function taskToTestCaseShape(task) {
  if (!task) return null;
  const td = task.templateData ?? {};
  return {
    id: task.id,
    title: task.title,
    project: task.project,
    key: task.key,
    task: Array.isArray(task.parents) ? task.parents[0] : task.parents,
    description: task.description,
    steps: td.testSteps ?? td.steps ?? '',
    expectedResult: td.expectedResult ?? '',
    preconditions: td.preconditions ?? '',
    testType: td.testType ?? '',
    attachment: task.attachment ?? [],
    leadBy: task.leadBy,
    reviewedBy: task.reviewedBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

/** Merge testCase filter with type TEST_CASE; map "task" (parent) -> "parents" */
function toTaskFilter(filter) {
  const taskFilter = {
    type: TEST_CASE_TYPE,
    ...filter,
  };
  if (filter?.task != null) {
    taskFilter.parents = filter.task;
    delete taskFilter.task;
  }
  return taskFilter;
}

/** Map testCase form/create data to task create payload */
function testCaseToTaskCreatePayload(data) {
  const task = data.task?.id ?? data.task;
  return {
    type: TEST_CASE_TYPE,
    project: data.project?.id ?? data.project,
    ...(data.template && { template: data.template?.id ?? data.template }),
    ...(task && { parents: [task] }),
    title: data.title,
    description: data.description,
    attachment: data.attachment,
    leadBy: data.leadBy,
    reviewedBy: data.reviewedBy,
    templateData: {
      preconditions: data.preconditions ?? '',
      testSteps: data.steps ?? '',
      expectedResult: data.expectedResult ?? '',
      testType: data.testType ?? 'Functional',
    },
  };
}

/** Build task update payload from testCase form data; merge with existing templateData so we don't wipe preconditions/testType when form omits them */
function testCaseToTaskUpdatePayload(data, existingTask) {
  const existingTd = existingTask?.templateData ?? {};
  const payload = {
    title: data.title !== undefined ? data.title : existingTask?.title,
    description: data.description !== undefined ? data.description : existingTask?.description,
    attachment: data.attachment !== undefined ? data.attachment : existingTask?.attachment,
    leadBy: data.leadBy !== undefined ? data.leadBy : existingTask?.leadBy,
    reviewedBy: data.reviewedBy !== undefined ? data.reviewedBy : existingTask?.reviewedBy,
    templateData: {
      preconditions: data.preconditions !== undefined ? data.preconditions : (existingTd.preconditions ?? ''),
      testSteps: data.steps !== undefined ? data.steps : (existingTd.testSteps ?? existingTd.steps ?? ''),
      expectedResult: data.expectedResult !== undefined ? data.expectedResult : (existingTd.expectedResult ?? ''),
      testType: data.testType !== undefined ? data.testType : (existingTd.testType ?? 'Functional'),
    },
  };
  return payload;
}

export default class TestCaseService {
  static async update(id, data) {
    const existing = await TaskService.find(id);
    const payload = testCaseToTaskUpdatePayload(data, existing);
    const task = await TaskService.update(id, payload);
    return taskToTestCaseShape(task);
  }

  static async destroyAll(ids) {
    return TaskService.destroyAll(ids);
  }

  static async create(data) {
    const payload = testCaseToTaskCreatePayload(data);
    const task = await TaskService.create(payload);
    return taskToTestCaseShape(task);
  }

  static async import(values, importHash) {
    const payload = testCaseToTaskCreatePayload({ ...values, title: values.title ?? 'Imported' });
    const task = await TaskService.import(payload, importHash);
    return taskToTestCaseShape(task);
  }

  static async find(id) {
    const task = await TaskService.find(id);
    return taskToTestCaseShape(task);
  }

  static async list(filter, orderBy, limit, offset) {
    const taskFilter = toTaskFilter(filter ?? {});
    const response = await TaskService.list(taskFilter, orderBy, limit, offset);
    return {
      rows: (response.rows ?? []).map(taskToTestCaseShape),
      count: response.count ?? 0,
    };
  }

  static async listAutocomplete(query, limit) {
    const taskFilter: { type: string; title?: string } = { type: TEST_CASE_TYPE };
    if (query != null && String(query).trim()) {
      taskFilter.title = query.trim();
    }
    const response = await TaskService.list(taskFilter, undefined, limit ?? 10, 0);
    const rows = response.rows ?? [];
    return rows.map((t) => ({
      id: t.id,
      label: t.title ?? t.key ?? t.id,
      title: t.title,
    }));
  }
}
