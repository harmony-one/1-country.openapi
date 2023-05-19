import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  ownerAddress: string;

  @ApiProperty()
  domainName: string;

  authKey: string;
}

@ApiTags('web3')
@Controller('')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}
  @Get('/balance')
  @ApiOkResponse({
    type: String,
  })
  async getBalance() {
    const data = await this.web3Service.getOneCountryServiceBalance();
    return data;
  }

  @Get('/hasClaim/:address')
  @ApiOkResponse({
    type: String,
  })
  async hasClaim(@Param('address') address: string) {
    const hasClaim = await this.web3Service.isAddressHasClaim(
      address,
    );

    return {
      hasClaim,
    };
  }

  @Post('/rent')
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    type: String,
  })
  async rent(@Body() params: { ownerAddress: string, domainName: string, freeRentKey: string }) {
    if(!this.web3Service.validateAuthKey(params.freeRentKey)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'freeRentKey is wrong',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (params.domainName.length <= 2) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'domain name should contain 2+ characters',
        },
        HttpStatus.CONFLICT,
      );
    }

    const hasClaim = await this.web3Service.isAddressHasClaim(
      params.ownerAddress,
    );

    if (hasClaim) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'an address can claim only one domain',
        },
        HttpStatus.CONFLICT,
      );
    }

    await this.web3Service.createClaim(params.ownerAddress, params.domainName);

    const data = await this.web3Service.register(params.domainName, params.ownerAddress);

    return data;
  }
}
