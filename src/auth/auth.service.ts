import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private readonly _userRepo: Repository<User>
  ){}

  //Creando un nuevo usuario
  async create(createUserDto: CreateUserDto) {

    const {email} = createUserDto;

    const exist = await this._userRepo.findOne({
      where: {email}
    })

    if(exist) throw new BadRequestException([
      `El correo electronico  ${email} ya se encuentra previamente registrado` 
    ])

    try {

      const { password, ...userData } = createUserDto;


      //instanciamos el nuevo usuario
      const user = this._userRepo.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this._userRepo.save(user)

      delete user.password;

      return user;
      //TODO: Retornarl el JWT

    } catch (error) {
      console.log(error);
    }

  }

  async login(loginUserDto: LoginUserDto){

    const {email, password} = loginUserDto;
   
    const user = await this._userRepo.findOne({
      where: {email},
      select: {email: true, password: true}
    })


    if(!user) throw new UnauthorizedException(['Credenciales no validas (email)'])

    if( !bcrypt.compareSync(password, user.password) )
      throw new UnauthorizedException('Credenciales no validas (password)')


    return user;
    //TODO: retornar el JWT de acceso
  }

}
