import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UserProfileDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  name: string;

  @ApiProperty({
    example: 'USER',
    description: 'The role of the user',
    enum: UserRole,
  })
  role: UserRole;
}
