import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@np2023v2/nestjs-mongodb';
import { User } from './user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({ isActive: true });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findAll({ roles: role });
  }

  async findUsersInAgeRange(minAge: number, maxAge: number): Promise<User[]> {
    return this.findAll({
      age: { $gte: minAge, $lte: maxAge },
    });
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.update(id, { isActive: false });
  }

  async addRoleToUser(id: string, role: string): Promise<User | null> {
    return this.update(id, { $addToSet: { roles: role } });
  }
}
