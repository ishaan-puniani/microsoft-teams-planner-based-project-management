const en = {
  common: {
    or: 'or',
    cancel: 'Cancel',
    reset: 'Reset',
    save: 'Save',
    search: 'Search',
    edit: 'Edit',
    remove: 'Remove',
    new: 'New',
    export: 'Export to Excel',
    noDataToExport: 'No data to export',
    import: 'Import',
    discard: 'Discard',
    yes: 'Yes',
    no: 'No',
    pause: 'Pause',
    areYouSure: 'Are you sure?',
    view: 'View',
    destroy: 'Delete',
    mustSelectARow: 'Must select a row',
    start: 'Start',
    end: 'End',
    select: 'Select',
    continue: 'Continue',
    filters: 'Filters',
  },

  app: {
    title: 'Application',
  },

  api: {
    menu: 'API',
  },

  entities: {
    module: {
      name: 'module',
      label: 'Modules',
      menu: 'Modules',
      exporterFileName: 'Modules_export',
      list: {
        menu: 'Modules',
        title: 'Modules',
      },
      create: {
        success: 'Module successfully saved',
      },
      update: {
        success: 'Module successfully saved',
      },
      destroy: {
        success: 'Module successfully deleted',
      },
      destroyAll: {
        success: 'Module(s) successfully deleted',
      },
      edit: {
        title: 'Edit Module',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        details: 'Details',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Module',
      },
      view: {
        title: 'View Module',
      },
      importer: {
        title: 'Import Modules',
        fileName: 'module_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    requirement: {
      name: 'requirement',
      label: 'Requirements',
      menu: 'Requirements',
      exporterFileName: 'Requirements_export',
      list: {
        menu: 'Requirements',
        title: 'Requirements',
      },
      create: {
        success: 'Requirement successfully saved',
      },
      update: {
        success: 'Requirement successfully saved',
      },
      destroy: {
        success: 'Requirement successfully deleted',
      },
      destroyAll: {
        success: 'Requirement(s) successfully deleted',
      },
      edit: {
        title: 'Edit Requirement',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        background: 'Background',
        acceptanceCriteria: 'Acceptance Criteria',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Requirement',
      },
      view: {
        title: 'View Requirement',
      },
      importer: {
        title: 'Import Requirements',
        fileName: 'requirement_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    testPlan: {
      name: 'testPlan',
      label: 'Test Plans',
      menu: 'Test Plans',
      exporterFileName: 'Test Plans_export',
      list: {
        menu: 'Test Plans',
        title: 'Test Plans',
      },
      create: {
        success: 'Test Plan successfully saved',
      },
      update: {
        success: 'Test Plan successfully saved',
      },
      destroy: {
        success: 'Test Plan successfully deleted',
      },
      destroyAll: {
        success: 'Test Plan(s) successfully deleted',
      },
      edit: {
        title: 'Edit Test Plan',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        scope: 'Scope',
        objective: 'Objective',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Test Plan',
      },
      view: {
        title: 'View Test Plan',
      },
      importer: {
        title: 'Import Test Plans',
        fileName: 'testPlan_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    testSuite: {
      name: 'testSuite',
      label: 'Test Suites',
      menu: 'Test Suites',
      exporterFileName: 'Test Suites_export',
      list: {
        menu: 'Test Suites',
        title: 'Test Suites',
      },
      create: {
        success: 'Test Suite successfully saved',
      },
      update: {
        success: 'Test Suite successfully saved',
      },
      destroy: {
        success: 'Test Suite successfully deleted',
      },
      destroyAll: {
        success: 'Test Suite(s) successfully deleted',
      },
      edit: {
        title: 'Edit Test Suite',
      },
      fields: {
        id: 'Id',
        name: 'Name',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Test Suite',
      },
      view: {
        title: 'View Test Suite',
      },
      importer: {
        title: 'Import Test Suites',
        fileName: 'testSuite_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    testCase: {
      name: 'testCase',
      label: 'Test Cases',
      menu: 'Test Cases',
      exporterFileName: 'Test Cases_export',
      list: {
        menu: 'Test Cases',
        title: 'Test Cases',
      },
      create: {
        success: 'Test Case successfully saved',
      },
      update: {
        success: 'Test Case successfully saved',
      },
      destroy: {
        success: 'Test Case successfully deleted',
      },
      destroyAll: {
        success: 'Test Case(s) successfully deleted',
      },
      edit: {
        title: 'Edit Test Case',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        description: 'Description',
        steps: 'Steps',
        attachment: 'Attachment',
        leadBy: 'Lead by',
        reviewedBy: 'Reviewed by',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Test Case',
      },
      view: {
        title: 'View Test Case',
      },
      importer: {
        title: 'Import Test Cases',
        fileName: 'testCase_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    task: {
      name: 'task',
      label: 'Tasks',
      menu: 'Tasks',
      exporterFileName: 'Tasks_export',
      list: {
        menu: 'Tasks',
        title: 'Tasks',
      },
      create: {
        success: 'Task successfully saved',
      },
      update: {
        success: 'Task successfully saved',
      },
      destroy: {
        success: 'Task successfully deleted',
      },
      destroyAll: {
        success: 'Task(s) successfully deleted',
      },
      edit: {
        title: 'Edit Task',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        description: 'Description',
        attachment: 'Attachment',
        leadBy: 'Lead by',
        reviewedBy: 'Reviewed by',
        estimatedStart: 'Estimated Start',
        estimatedStartRange: 'Estimated Start',
        estimatedEnd: 'Estimated End',
        estimatedEndRange: 'Estimated End',
        workStart: 'Work Start',
        workStartRange: 'Work Start',
        workEnd: 'Work End',
        workEndRange: 'Work End',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Task',
      },
      view: {
        title: 'View Task',
      },
      importer: {
        title: 'Import Tasks',
        fileName: 'task_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    status: {
      name: 'status',
      label: 'Statuses',
      menu: 'Statuses',
      exporterFileName: 'Statuses_export',
      list: {
        menu: 'Statuses',
        title: 'Statuses',
      },
      create: {
        success: 'Status successfully saved',
      },
      update: {
        success: 'Status successfully saved',
      },
      destroy: {
        success: 'Status successfully deleted',
      },
      destroyAll: {
        success: 'Status(s) successfully deleted',
      },
      edit: {
        title: 'Edit Status',
      },
      fields: {
        id: 'Id',
        name: 'Name',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Status',
      },
      view: {
        title: 'View Status',
      },
      importer: {
        title: 'Import Statuses',
        fileName: 'status_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
    tag: {
      name: 'tag',
      label: 'Tags',
      menu: 'Tags',
      exporterFileName: 'Tags_export',
      list: {
        menu: 'Tags',
        title: 'Tags',
      },
      create: {
        success: 'Tag successfully saved',
      },
      update: {
        success: 'Tag successfully saved',
      },
      destroy: {
        success: 'Tag successfully deleted',
      },
      destroyAll: {
        success: 'Tag(s) successfully deleted',
      },
      edit: {
        title: 'Edit Tag',
      },
      fields: {
        id: 'Id',
        title: 'Title',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        updatedAtRange: 'Updated at',
        createdAtRange: 'Created at',
      },
      enumerators: {},
      placeholders: {},
      hints: {},
      new: {
        title: 'New Tag',
      },
      view: {
        title: 'View Tag',
      },
      importer: {
        title: 'Import Tags',
        fileName: 'tag_import_template',
        hint: 'Files/Images columns must be the URLs of the files separated by space.',
      },
    },
  },

  auth: {
    tenants: 'Workspaces',
    profile: {
      title: 'Profile',
      success: 'Profile successfully updated',
    },
    createAnAccount: 'Create an account',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password',
    signin: 'Sign in',
    signup: 'Sign up',
    signout: 'Sign out',
    alreadyHaveAnAccount:
      'Already have an account? Sign in.',
    social: {
      errors: {
        'auth-invalid-provider':
          'This email is already registered to another provider.',
        'auth-no-email': `The email associated with this account is private or inexistent.`,
      },
    },
    signinWithAnotherAccount:
      'Sign in with another account',
    passwordChange: {
      title: 'Change Password',
      success: 'Password successfully changed',
      mustMatch: 'Passwords must match',
    },
    emailUnverified: {
      message: `Please confirm your email at <strong>{0}</strong> to continue.`,
      submit: `Resend email verification`,
    },
    emptyPermissions: {
      message: `You have no permissions yet. Wait for the admin to grant you privileges.`,
    },
    passwordResetEmail: {
      message: 'Send password reset email',
      error: `Email not recognized`,
    },
    passwordReset: {
      message: 'Reset password',
    },
    emailAddressVerificationEmail: {
      error: `Email not recognized`,
    },
    verificationEmailSuccess: `Verification email successfully sent`,
    passwordResetEmailSuccess: `Password reset email successfully sent`,
    passwordResetSuccess: `Password successfully changed`,
    verifyEmail: {
      success: 'Email successfully verified.',
      message:
        'Just a moment, your email is being verified...',
    },
  },

  tenant: {
    name: 'tenant',
    label: 'Workspaces',
    menu: 'Workspaces',
    list: {
      menu: 'Workspaces',
      title: 'Workspaces',
    },
    create: {
      button: 'Create Workspace',
      success: 'Workspace successfully saved',
    },
    update: {
      success: 'Workspace successfully saved',
    },
    destroy: {
      success: 'Workspace successfully deleted',
    },
    destroyAll: {
      success: 'Workspace(s) successfully deleted',
    },
    edit: {
      title: 'Edit Workspace',
    },
    fields: {
      id: 'Id',
      name: 'Name',
      url: 'URL',
      tenantName: 'Workspace Name',
      tenantId: 'Workspace',
      tenantUrl: 'Workspace URL',
      plan: 'Plan',
    },
    enumerators: {},
    placeholders: {},
    hints: {},
    new: {
      title: 'New Workspace',
    },
    invitation: {
      view: 'View Invitations',
      invited: 'Invited',
      accept: 'Accept Invitation',
      decline: 'Decline Invitation',
      declined: 'Invitation successfully declined',
      acceptWrongEmail: 'Accept Invitation With This Email',
    },
    select: 'Select Workspace',
    validation: {
      url: 'Your workspace URL can only contain lowercase letters, numbers and dashes (and must start with a letter or number).',
    },
  },

  roles: {
    admin: {
      label: 'Admin',
      description: 'Full access to all resources',
    },
    custom: {
      label: 'Custom Role',
      description: 'Custom access to resources',
    },
  },

  user: {
    invite: 'Invite',
    title: 'Users',
    menu: 'Users',
    fields: {
      id: 'Id',
      avatars: 'Avatar',
      email: 'Email',
      emails: 'Email(s)',
      fullName: 'Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      status: 'Status',
      phoneNumber: 'Phone Number',
      role: 'Role',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      roleUser: 'Role/User',
      roles: 'Roles',
      createdAtRange: 'Created at',
      password: 'Password',
      rememberMe: 'Remember me',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      newPasswordConfirmation: 'New Password Confirmation',
    },
    validations: {
      // eslint-disable-next-line
      email: 'Email ${value} is invalid',
    },
    disable: 'Disable',
    enable: 'Enable',
    doAddSuccess: 'User(s) successfully saved',
    doUpdateSuccess: 'User successfully saved',
    status: {
      active: 'Active',
      invited: 'Invited',
      'empty-permissions': 'Waiting for Permissions',
    },
    exporterFileName: 'users_export',
    doDestroySuccess: 'User successfully deleted',
    doDestroyAllSelectedSuccess:
      'User(s) successfully deleted',
    edit: {
      title: 'Edit User',
    },
    enumerators: {},
    placeholders: {},
    hints: {},
    new: {
      title: 'New User(s)',
      titleModal: 'New User',
      emailsHint:
        'Separate multiple email addresses using the comma character.',
    },
    view: {
      title: 'View User',
      activity: 'Activity',
    },
    importer: {
      title: 'Import Users',
      fileName: 'users_import_template',
      hint: 'Files/Images columns must be the URLs of the files separated by space. Relationships must be the ID of the referenced records separated by space. Roles must be the role ids separated by space.',
    },
    errors: {
      userAlreadyExists:
        'User with this email already exists',
      userNotFound: 'User not found',
      disablingHimself: `You can't disable yourself`,
      revokingOwnPermission: `You can't revoke your own admin permission`,
    },
  },

  plan: {
    menu: 'Plans',
    title: 'Plans',

    free: {
      label: 'Free',
      price: '$0',
    },
    growth: {
      label: 'Growth',
      price: '$10',
    },
    enterprise: {
      label: 'Enterprise',
      price: '$50',
    },

    pricingPeriod: '/month',
    current: 'Current Plan',
    subscribe: 'Subscribe',
    manage: 'Manage Subscription',
    cancelAtPeriodEnd:
      'This plan will be canceled at the end of the period.',
    somethingWrong:
      'There is something wrong with your subscription. Please go to manage subscription for more details.',
    notPlanUser: `You are not the manager of this subscription.`,
  },

  auditLog: {
    menu: 'Audit Logs',
    title: 'Audit Logs',
    exporterFileName: 'audit_log_export',
    entityNamesHint:
      'Separate multiple entities using the comma character.',
    fields: {
      id: 'Id',
      timestampRange: 'Period',
      entityName: 'Entity',
      entityNames: 'Entities',
      entityId: 'Entity ID',
      action: 'Action',
      values: 'Values',
      timestamp: 'Date',
      createdByEmail: 'User Email',
    },
  },
  settings: {
    title: 'Settings',
    menu: 'Settings',
    save: {
      success:
        'Settings successfully saved. The page will reload in {0} seconds for changes to take effect.',
    },
    fields: {
      theme: 'Theme',
      logos: 'Logo',
      backgroundImages: 'Background Image',
    },
    colors: {
      default: 'Dark',
      light: 'Light',
      cyan: 'Cyan',
      'geek-blue': 'Geek Blue',
      gold: 'Gold',
      lime: 'Lime',
      magenta: 'Magenta',
      orange: 'Orange',
      'polar-green': 'Polar Green',
      purple: 'Purple',
      red: 'Red',
      volcano: 'Volcano',
      yellow: 'Yellow',
    },
  },
  dashboard: {
    menu: 'Dashboard',
    message: `This page uses fake data for demonstration purposes only. You can edit it at frontend/view/dashboard/DashboardPage.ts.`,
    charts: {
      day: 'Day',
      red: 'Red',
      green: 'Green',
      yellow: 'Yellow',
      grey: 'Grey',
      blue: 'Blue',
      orange: 'Orange',
      months: {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
      },
      eating: 'Eating',
      drinking: 'Drinking',
      sleeping: 'Sleeping',
      designing: 'Designing',
      coding: 'Coding',
      cycling: 'Cycling',
      running: 'Running',
      customer: 'Customer',
    },
  },
  errors: {
    backToHome: 'Back to home',
    403: `Sorry, you don't have access to this page`,
    404: 'Sorry, the page you visited does not exist',
    500: 'Sorry, the server is reporting an error',
    429: 'Too many requests. Please try again later.',
    forbidden: {
      message: 'Forbidden',
    },
    validation: {
      message: 'An error occurred',
    },
    defaultErrorMessage: 'Ops, an error occurred',
  },

  preview: {
    error:
      'Sorry, this operation is not allowed in preview mode.',
  },

  // See https://github.com/jquense/yup#using-a-custom-locale-dictionary
  /* eslint-disable */
  validation: {
    mixed: {
      default: '${path} is invalid',
      required: '${path} is required',
      oneOf:
        '${path} must be one of the following values: ${values}',
      notOneOf:
        '${path} must not be one of the following values: ${values}',
      notType: ({ path, type, value, originalValue }) => {
        return `${path} must be a ${type}`;
      },
    },
    string: {
      length:
        '${path} must be exactly ${length} characters',
      min: '${path} must be at least ${min} characters',
      max: '${path} must be at most ${max} characters',
      matches:
        '${path} must match the following: "${regex}"',
      email: '${path} must be a valid email',
      url: '${path} must be a valid URL',
      trim: '${path} must be a trimmed string',
      lowercase: '${path} must be a lowercase string',
      uppercase: '${path} must be a upper case string',
      selected: '${path} must be selected',
    },
    number: {
      min: '${path} must be greater than or equal to ${min}',
      max: '${path} must be less than or equal to ${max}',
      lessThan: '${path} must be less than ${less}',
      moreThan: '${path} must be greater than ${more}',
      notEqual: '${path} must be not equal to ${notEqual}',
      positive: '${path} must be a positive number',
      negative: '${path} must be a negative number',
      integer: '${path} must be an integer',
    },
    date: {
      min: '${path} field must be later than ${min}',
      max: '${path} field must be at earlier than ${max}',
    },
    boolean: {},
    object: {
      noUnknown:
        '${path} field cannot have keys not specified in the object shape',
    },
    array: {
      min: ({ min, path }) =>
        min === 1
          ? `${path} is required`
          : `${path} field must have at least ${min} items`,
      max: '${path} field must have less than or equal to ${max} items',
    },
  },
  /* eslint-disable */
  fileUploader: {
    upload: 'Upload',
    image: 'You must upload an image',
    size: 'File is too big. Max allowed size is {0}',
    formats: `Invalid format. Must be one of: {0}.`,
  },
  importer: {
    line: 'Line',
    status: 'Status',
    pending: 'Pending',
    imported: 'Imported',
    error: 'Error',
    total: `{0} imported, {1} pending and {2} with error`,
    importedMessage: `Processed {0} of {1}.`,
    noNavigateAwayMessage:
      'Do not navigate away from this page or import will be stopped.',
    completed: {
      success:
        'Import completed. All rows were successfully imported.',
      someErrors:
        'Processing completed, but some rows were unable to be imported.',
      allErrors: 'Import failed. There are no valid rows.',
    },
    form: {
      downloadTemplate: 'Download the template',
      hint: 'Click or drag the file to this area to continue',
    },
    list: {
      discardConfirm:
        'Are you sure? Non-imported data will be lost.',
    },
    errors: {
      invalidFileEmpty: 'The file is empty',
      invalidFileExcel:
        'Only excel (.xlsx) files are allowed',
      invalidFileUpload:
        'Invalid file. Make sure you are using the last version of the template.',
      importHashRequired: 'Import hash is required',
      importHashExistent: 'Data has already been imported',
    },
  },

  autocomplete: {
    loading: 'Loading...',
    noOptions: 'No data found',
  },

  imagesViewer: {
    noImage: 'No image',
  },

  table: {
    noData: 'No records found',
    loading: 'Loading...',
  },

  pagination: {
    items_per_page: '/ page',
    jump_to: 'Goto',
    jump_to_confirm: 'confirm',
    page: '',

    prev_page: 'Previous Page',
    next_page: 'Next Page',
    prev_5: 'Previous 5 Pages',
    next_5: 'Next 5 Pages',
    prev_3: 'Previous 3 Pages',
    next_3: 'Next 3 Pages',
  },
};

export default en;
