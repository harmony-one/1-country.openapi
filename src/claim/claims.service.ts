import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../typeorm/claim.entity';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
  ) {}

  findByAddress(address: string): Promise<null | Claim> {
    return this.claimRepository.findOneBy({ address });
  }

  create(address: string, domain: string): Promise<Claim> {
    const claim = this.claimRepository.create({ address, domain });
    return this.claimRepository.save(claim)
  }
}
