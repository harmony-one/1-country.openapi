import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Claim {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  address: string;

  @Column({ unique: true })
  domain: string;
}
