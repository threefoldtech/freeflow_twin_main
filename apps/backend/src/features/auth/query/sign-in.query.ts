import { IsNotEmpty, IsString } from 'class-validator';

export class SignInQuery {
    @IsNotEmpty()
    @IsString()
    username: string;
}
