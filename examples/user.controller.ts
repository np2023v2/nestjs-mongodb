import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: { name: string; email: string; age?: number; roles?: string[] }) {
    return this.userService.createUser(body.name, body.email, body.age, body.roles);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.userService.getUsersWithPagination(parseInt(page), parseInt(limit));
    }
    return this.userService.getAllUsers();
  }

  @Get('search')
  async search(
    @Query('q') searchText: string,
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
    @Query('roles') roles?: string,
  ) {
    const roleArray = roles ? roles.split(',') : undefined;
    return this.userService.searchUsers(
      searchText,
      minAge ? parseInt(minAge) : undefined,
      maxAge ? parseInt(maxAge) : undefined,
      roleArray,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<any>) {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    return { success: result };
  }
}
