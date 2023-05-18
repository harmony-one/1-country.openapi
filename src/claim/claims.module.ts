import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../typeorm/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claim])],
  exports: [TypeOrmModule],
})
export class ClaimsModule {}
