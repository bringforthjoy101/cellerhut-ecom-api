import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Fuse from 'fuse.js';
import { User } from './entities/user.entity';
import usersJson from '@db/users.json';
import { paginate } from 'src/common/pagination/paginate';
import { CellerHutAuthService } from '../auth/celler-hut-auth.service';

const users = plainToClass(User, usersJson);

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};
const fuse = new Fuse(users, options);

@Injectable()
export class UsersService {
  private users: User[] = users;

  constructor(private readonly cellerHutAuthService: CellerHutAuthService) {}

  create(createUserDto: CreateUserDto) {
    return this.users[0];
  }

  async getUsers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users;
    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/users?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getUsersNotify({ limit }: GetUsersDto): User[] {
    const data: any = this.users;
    return data?.slice(0, limit);
  }

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  async update(id: number, updateUserDto: any, token?: string) {
    // Note: Using 'any' type because ProfilesController passes a flat object with contact field
    // at root level, not nested in profile. The controller casts to UpdateUserDto with 'as any'.
    console.log('[Users Service] Updating user profile...');
    console.log('[Users Service] Update data:', JSON.stringify(updateUserDto, null, 2));

    if (!token) {
      console.error('[Users Service] No authentication token provided');
      throw new Error('Authentication token is required to update profile');
    }

    try {
      // Transform frontend format to backend format
      const profileData: any = { ...updateUserDto };

      // Transform contact to phone if present at root level
      if (updateUserDto.contact) {
        profileData.phone = updateUserDto.contact;
        delete profileData.contact;
      }

      // Handle nested profile.contact from profile update forms
      if (updateUserDto.profile?.contact) {
        profileData.phone = updateUserDto.profile.contact;
        // Remove contact from nested profile to avoid confusion
        if (profileData.profile) {
          const { contact, ...restProfile } = profileData.profile;
          profileData.profile = restProfile;
        }
      }

      console.log('[Users Service] Transformed profile data:', JSON.stringify(profileData, null, 2));
      const result = await this.cellerHutAuthService.updateProfile(token, profileData);
      console.log('[Users Service] Profile updated successfully');
      return result;
    } catch (error) {
      console.error('[Users Service] Update profile failed:', error.message);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  makeAdmin(user_id: string) {
    return this.users.find((u) => u.id === Number(user_id));
  }

  banUser(id: number) {
    const user = this.users.find((u) => u.id === Number(id));

    user.is_active = !user.is_active;

    return user;
  }

  activeUser(id: number) {
    const user = this.users.find((u) => u.id === Number(id));

    user.is_active = !user.is_active;

    return user;
  }

  async getAdmin({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'super_admin';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/admin/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getVendors({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'store_owner';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/vendors/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getAllCustomers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'customer';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/customers/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getMyStaffs({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = [];

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/my-staffs/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getAllStaffs({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = [];

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/all-staffs/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }
}
