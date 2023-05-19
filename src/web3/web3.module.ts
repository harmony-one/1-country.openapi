import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { ConfigModule } from '@nestjs/config';
import { Web3Controller } from './web3.controller';
import { HttpModule } from '@nestjs/axios';
import { ClaimsModule } from '../claim/claims.module';
import { ClaimsService } from '../claim/claims.service';

@Module({
  imports: [ConfigModule, HttpModule, ClaimsModule],
  providers: [Web3Service, ClaimsService],
  controllers: [Web3Controller],
})
export class Web3Module {}
