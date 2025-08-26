/// File is generated from https://studio.fabbuilder.com - task

import { IBase } from '../base/IBase';
import { IUser } from '../user/IUser';

export interface ITask extends IBase {
  title: string;
  description: string;
  attachment: string[];
  leadBy: IUser;
  reviewedBy: IUser;
  estimatedStart: Date;
  estimatedEnd: Date;
  workStart: Date;
  workEnd: Date;
}

/// File is generated from https://studio.fabbuilder.com - task
