import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  BeforeInsert,
  BeforeUpdate,
  AfterUpdate,
  AfterRemove,
  AfterLoad,
  VirtualColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  code: string;

  // Virtual field
  fullName: string;

  @AfterLoad()
  setFullName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  // this is a hook that will be called after the user is inserted into the database
  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }

  // this is a hook that will be called before the user is inserted into the database
  @BeforeInsert()
  logBeforeInsert() {
    console.log('Before Inserting User with id', this.id);
  }

  @BeforeUpdate()
  logBeforeUpdate() {
    console.log('Before Updating User with id', this.id);
  }

  @AfterUpdate()
  logAfterUpdate() {
    console.log('After Updating User with id', this.id);
  }

  @AfterRemove()
  logAfterRemove() {
    console.log('After Removing User with id', this.id);
  }
}
