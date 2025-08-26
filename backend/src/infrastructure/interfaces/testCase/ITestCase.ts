/// File is generated from https://studio.fabbuilder.com - testCase

import { IBase } from '../base/IBase';
import { IUser } from '../user/IUser';

export interface ITestCase extends IBase {
  title: string;
  description: string;
  attachment: string[];
  leadBy: IUser;
  reviewedBy: IUser;
}

/// File is generated from https://studio.fabbuilder.com - testCase
