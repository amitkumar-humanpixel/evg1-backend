import { IsEmail, IsNotEmpty } from 'class-validator';
export class SupervisorRegistrationFormDTO {
  @IsNotEmpty({ message: 'First Name should not be empty' })
  firstName: string;
  @IsNotEmpty({ message: 'Last Name should not be empty' })
  lastName: string;
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Enter valid Email' })
  email: string;
  @IsNotEmpty({ message: 'Practice Name should not be empty' })
  practiceName: string;
}
