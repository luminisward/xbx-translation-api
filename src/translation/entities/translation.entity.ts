import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
@Index(['table', 'row_id'], { unique: true })
export class Translation {
  @PrimaryColumn()
  table: string;

  @PrimaryColumn()
  row_id: number;

  @Column()
  text: string;
}
