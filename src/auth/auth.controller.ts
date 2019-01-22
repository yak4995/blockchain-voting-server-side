import { 
    Controller,
    Post,
    UsePipes,
    Body,
    Res,
    HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OuterServiceCredentialsDTO } from './dto/OuterServiceCredentialsDTO';
import { JwtTokenDTO } from './dto/JwtTokenDTO';
import { ValidatorPipe } from '../common/validator.pipe';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @UsePipes(ValidatorPipe)
  async createToken(@Body() outerServiceCredentials: OuterServiceCredentialsDTO, @Res() response): Promise<any> {
    try {
      let result: JwtTokenDTO = await this.authService.createToken(outerServiceCredentials);
      return response.status(HttpStatus.OK).json(result);
    } catch (e) {
      return response.status(HttpStatus.UNAUTHORIZED).json({'error' : 'Invalid credentials!'});
    }
  }
}