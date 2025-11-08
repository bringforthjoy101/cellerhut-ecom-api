import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CellerHutAuthService } from '../auth/celler-hut-auth.service';

@Injectable()
export class AddressesService {
  constructor(private readonly cellerHutAuthService: CellerHutAuthService) {}

  async create(createAddressDto: CreateAddressDto, token?: string) {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      // Transform frontend format to backend format
      const addressData = this.transformAddressToBackend(createAddressDto);
      return await this.cellerHutAuthService.addAddress(token, addressData);
    } catch (error) {
      console.error('[Addresses Service] Create address failed:', error);
      throw error;
    }
  }

  async findAll(token?: string) {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const addresses = await this.cellerHutAuthService.getAddresses(token);
      // Transform backend addresses to frontend format
      return addresses.map((addr) => this.transformAddressToFrontend(addr));
    } catch (error) {
      console.error('[Addresses Service] Get addresses failed:', error);
      throw error;
    }
  }

  async findOne(id: number, token?: string) {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const addresses = await this.cellerHutAuthService.getAddresses(token);
      const address = addresses.find((addr) => addr.id === id);
      if (!address) {
        throw new Error('Address not found');
      }
      return this.transformAddressToFrontend(address);
    } catch (error) {
      console.error('[Addresses Service] Get address failed:', error);
      throw error;
    }
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
    token?: string,
  ) {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      // Transform frontend format to backend format
      const addressData = this.transformAddressToBackend(updateAddressDto);
      return await this.cellerHutAuthService.updateAddress(
        token,
        id,
        addressData,
      );
    } catch (error) {
      console.error('[Addresses Service] Update address failed:', error);
      throw error;
    }
  }

  async remove(id: number, token?: string) {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      await this.cellerHutAuthService.deleteAddress(token, id);
      return { success: true, message: 'Address deleted successfully' };
    } catch (error) {
      console.error('[Addresses Service] Delete address failed:', error);
      throw error;
    }
  }

  /**
   * Transform frontend address format to backend format
   * Frontend: street_address, state, zip, type (home/office)
   * Backend: street, province, postalCode, isDefaultBilling, isDefaultShipping
   */
  private transformAddressToBackend(addressDto: any): any {
    const transformed: any = {};

    // Map street_address to street
    if (addressDto.address?.street_address) {
      transformed.street = addressDto.address.street_address;
    }

    // Map state to province
    if (addressDto.address?.state) {
      transformed.province = addressDto.address.state;
    }

    // Map zip to postalCode
    if (addressDto.address?.zip) {
      transformed.postalCode = addressDto.address.zip;
    }

    // Map city
    if (addressDto.address?.city) {
      transformed.city = addressDto.address.city;
    }

    // Map country
    if (addressDto.address?.country) {
      transformed.country = addressDto.address.country;
    }

    // Map title
    if (addressDto.title) {
      transformed.title = addressDto.title;
    }

    // Map type to default flags
    if (addressDto.type) {
      transformed.type = addressDto.type;
      // Set default flags based on type
      if (addressDto.type.slug === 'billing') {
        transformed.isDefaultBilling = true;
        transformed.isDefaultShipping = false;
      } else if (addressDto.type.slug === 'shipping') {
        transformed.isDefaultBilling = false;
        transformed.isDefaultShipping = true;
      }
    }

    // Map location fields (latitude, longitude, formattedAddress)
    if (addressDto.latitude !== undefined) {
      transformed.latitude = addressDto.latitude;
    }
    if (addressDto.longitude !== undefined) {
      transformed.longitude = addressDto.longitude;
    }
    if (addressDto.formattedAddress) {
      transformed.formattedAddress = addressDto.formattedAddress;
    }

    return transformed;
  }

  /**
   * Transform backend address format to frontend format
   * Backend: street, province, postalCode, isDefaultBilling, isDefaultShipping
   * Frontend: street_address, state, zip, type
   */
  private transformAddressToFrontend(backendAddress: any): any {
    return {
      id: backendAddress.id,
      title: backendAddress.title || '',
      address: {
        street_address: backendAddress.street || '',
        state: backendAddress.province || '',
        zip: backendAddress.postalCode || '',
        city: backendAddress.city || '',
        country: backendAddress.country || '',
      },
      type: {
        id: backendAddress.isDefaultBilling ? 1 : 2,
        name: backendAddress.isDefaultBilling ? 'Billing' : 'Shipping',
        slug: backendAddress.isDefaultBilling ? 'billing' : 'shipping',
      },
      latitude: backendAddress.latitude,
      longitude: backendAddress.longitude,
      formattedAddress: backendAddress.formattedAddress,
      created_at: backendAddress.createdAt,
      updated_at: backendAddress.updatedAt,
    };
  }
}
