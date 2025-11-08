import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.addressesService.create(createAddressDto, token);
  }

  @Get()
  addresses(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.addressesService.findAll(token);
  }

  @Get(':id')
  address(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.addressesService.findOne(+id, token);
  }

  @Put(':id')
  updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.addressesService.update(+id, updateAddressDto, token);
  }

  @Delete(':id')
  deleteAddress(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.addressesService.remove(+id, token);
  }
}
