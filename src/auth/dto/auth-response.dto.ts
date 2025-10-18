import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  user_id: number;

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
