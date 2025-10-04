import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.model';
import {
  buildTextSearchQuery,
  buildFilterQuery,
  mergeFilterQueries,
  PaginationResult,
} from '@np2023v2/nestjs-mongodb';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    name: string,
    email: string,
    age?: number,
    roles?: string[],
  ): Promise<User> {
    return this.userRepository.create({ name, email, age, roles });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async getUsersWithPagination(
    page: number,
    limit: number,
  ): Promise<PaginationResult<User>> {
    return this.userRepository.findWithPagination({}, { page, limit });
  }

  async searchUsers(
    searchText: string,
    minAge?: number,
    maxAge?: number,
    roles?: string[],
  ): Promise<User[]> {
    const textQuery = buildTextSearchQuery(searchText, ['name', 'email']);
    const filterQuery = buildFilterQuery({
      age: minAge && maxAge ? { min: minAge, max: maxAge } : undefined,
      roles: roles && roles.length > 0 ? roles : undefined,
      isActive: true,
    });

    const combinedQuery = mergeFilterQueries(textQuery, filterQuery);
    return this.userRepository.findAll(combinedQuery);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, data);
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.userRepository.deactivateUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async countUsers(isActive?: boolean): Promise<number> {
    const filter = isActive !== undefined ? { isActive } : {};
    return this.userRepository.count(filter);
  }

  async userExists(email: string): Promise<boolean> {
    return this.userRepository.exists({ email });
  }
}
