/// File is generated from https://studio.fabbuilder.com - testCycle

import Error400 from '../errors/Error400';
import MongooseRepository from '../database/repositories/mongooseRepository';
import { IServiceOptions } from './IServiceOptions';
import TestCycleRepository from '../database/repositories/testCycleRepository';
import UserRepository from '../database/repositories/userRepository';

export default class TestCycleService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      data.leadBy = await UserRepository.filterIdInTenant(
        data.leadBy,
        { ...this.options, session },
      );

      const record = await TestCycleRepository.create(data, {
        ...this.options,
        session,
      });

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'testCycle',
      );

      throw error;
    }
  }

  async update(id, data) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      data.leadBy = await UserRepository.filterIdInTenant(
        data.leadBy,
        { ...this.options, session },
      );

      const record = await TestCycleRepository.update(
        id,
        data,
        {
          ...this.options,
          session,
        },
      );

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'testCycle',
      );

      throw error;
    }
  }

  async destroyAll(ids) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await TestCycleRepository.destroy(id, {
          ...this.options,
          session,
        });
      }

      await MongooseRepository.commitTransaction(session);
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  async findById(id) {
    return TestCycleRepository.findById(id, this.options);
  }

  async addTestCases(testCycleId, testCaseIds) {
    if (!testCaseIds || !testCaseIds.length) {
      return this.findById(testCycleId);
    }

    return TestCycleRepository.addTestCases(
      testCycleId,
      testCaseIds,
      this.options,
    );
  }

  async findAllAutocomplete(search, limit) {
    return TestCycleRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return TestCycleRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  async import(data, importHash) {
    if (!importHash) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashRequired',
      );
    }

    if (await this._isImportHashExistent(importHash)) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashExistent',
      );
    }

    const dataToCreate = {
      ...data,
      importHash,
    };

    return this.create(dataToCreate);
  }

  async _isImportHashExistent(importHash) {
    const count = await TestCycleRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
/// File is generated from https://studio.fabbuilder.com - testCycle
