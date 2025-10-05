import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

/**
 * Inject a Mongoose model into a class
 * @param model - The name of the model
 * @param connectionName - Optional connection name
 */
export const InjectModel = (model: string, connectionName?: string) => {
  return Inject(getModelToken(model, connectionName));
};

/**
 * Inject a repository instance
 * @param repositoryToken - The token/name for the repository
 */
export const InjectRepository = (repositoryToken: string) => {
  return Inject(repositoryToken);
};
