/// File is generated from https://studio.fabbuilder.com -

/**
 * Storage permissions.
 *
 * @id - Used to identify the rule on permissions and upload.
 * @folder - Folder where the files will be saved
 * @maxSizeInBytes - Max allowed size in bytes
 * @bypassWritingPermissions - Does not validate if the user has permission to write
 * @publicRead - The file can be publicly accessed via the URL without the need for a signed token
 */
export default class Storage {
  static get values() {
    return {
      userAvatarsProfiles: {
        id: 'userAvatarsProfiles',
        folder: 'user/avatars/profile/:userId',
        maxSizeInBytes: 10 * 1024 * 1024,
        bypassWritingPermissions: true,
        publicRead: true,
      },
      settingsLogos: {
        id: 'settingsLogos',
        folder: 'tenant/:tenantId/settings/logos',
        maxSizeInBytes: 10 * 1024 * 1024,
        publicRead: true,
      },
      settingsBackgroundImages: {
        id: 'settingsBackgroundImages',
        folder:
          'tenant/:tenantId/settings/backgroundImages',
        maxSizeInBytes: 10 * 1024 * 1024,
        publicRead: true,
      },

      requirementImages: {
        id: 'requirementImages',
        folder: 'tenant/:tenantId/requirement/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      moduleImages: {
        id: 'moduleImages',
        folder: 'tenant/:tenantId/module/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      projectImages: {
        id: 'projectImages',
        folder: 'tenant/:tenantId/project/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      testPlanImages: {
        id: 'testPlanImages',
        folder: 'tenant/:tenantId/testPlan/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      testSuiteImages: {
        id: 'testSuiteImages',
        folder: 'tenant/:tenantId/testSuite/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      testCaseImages: {
        id: 'testCaseImages',
        folder: 'tenant/:tenantId/testCase/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      taskImages: {
        id: 'taskImages',
        folder: 'tenant/:tenantId/task/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      statusImages: {
        id: 'statusImages',
        folder: 'tenant/:tenantId/status/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      tagImages: {
        id: 'tagImages',
        folder: 'tenant/:tenantId/tag/images',
        maxSizeInBytes: 100 * 1024 * 1024,
      },

      testCaseAttachment: {
        id: 'testCaseAttachment',
        folder: 'tenant/:tenantId/testCase/attachment',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
      taskAttachment: {
        id: 'taskAttachment',
        folder: 'tenant/:tenantId/task/attachment',
        maxSizeInBytes: 100 * 1024 * 1024,
      },
    };
  }
}
/// File is generated from https://studio.fabbuilder.com -
