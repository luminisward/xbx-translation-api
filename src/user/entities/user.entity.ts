import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'int2', default: 1 })
  permission: number;
}
