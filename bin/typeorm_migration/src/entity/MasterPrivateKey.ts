import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate} from "typeorm";
import { Utils } from "../../../../libs/sota-common";

@Entity('master_private_key')
export class MasterPrivateKey {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @Column({ name: 'encrypted', nullable: false })
  public encrypted: string;

  @Column({ name: 'currency', nullable: false })
  public currency: string;

  @Column({ name: 'device_id', nullable: false })
  public devideId: string;

  @Column({ name: 'wallet_id', nullable: false })
  public walletId: string;

  @Column({ name: 'created_at' })
  public createdAt: number;

  @Column({ name: 'updated_at' })
  updatedAt: number;  

  @BeforeInsert()
  public updateCreateDates() {
    this.createdAt = Utils.nowInMillis();
    this.updatedAt = Utils.nowInMillis();
  }

  @BeforeUpdate()
  public updateUpdateDates() {
    this.updatedAt = Utils.nowInMillis();
  }  
}
