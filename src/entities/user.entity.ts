import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'hashedPassword123',
    description: 'The hashed password of the user',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'USER',
    description: 'The role of the user',
    enum: UserRole,
  })
  @Column({
    type: 'text',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'text',
  })
  created_at: string;
}
