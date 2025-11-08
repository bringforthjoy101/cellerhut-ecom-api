import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  getAllUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('authorization') authorization?: string,
  ) {
    // Extract token from Bearer authorization header
    const token = authorization?.replace('Bearer ', '');
    return this.usersService.update(+id, updateUserDto, token);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('unblock-user')
  activeUser(@Body('id') id: number) {
    return this.usersService.activeUser(+id);
  }

  @Post('block-user')
  banUser(@Body('id') id: number) {
    return this.usersService.banUser(+id);
  }

  @Post('make-admin')
  makeAdmin(@Param('user_id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    console.log(createProfileDto);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Headers('authorization') authorization?: string,
  ) {
    // Extract token from Bearer authorization header
    const token = authorization?.replace('Bearer ', '');

    // Transform UpdateProfileDto to UpdateUserDto format
    const updateUserDto = {
      phone: updateProfileDto.contact,
      ...updateProfileDto,
    };

    return this.usersService.update(+id, updateUserDto as any, token);
  }

  @Delete(':id')
  deleteProfile(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

@Controller('admin/list')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllAdmin(@Query() query: GetUsersDto) {
    return this.usersService.getAdmin(query);
  }
}

@Controller('vendors/list')
export class VendorController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllVendor(@Query() query: GetUsersDto) {
    return this.usersService.getVendors(query);
  }
}

@Controller('my-staffs')
export class MyStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllMyStaffs(@Query() query: GetUsersDto) {
    return this.usersService.getMyStaffs(query);
  }
}
@Controller('all-staffs')
export class AllStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllStaffs(@Query() query: GetUsersDto) {
    return this.usersService.getAllStaffs(query);
  }
}

@Controller('customers/list')
export class AllCustomerController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllCustomers(@Query() query: GetUsersDto) {
    return this.usersService.getAllCustomers(query);
  }
}
