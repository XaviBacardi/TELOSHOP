import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {
  

  	getImage(name: string){
      const path = join(__dirname, '../../static/products', name);

      if(!existsSync) throw new BadRequestException(`Imagen no encontrada ${name}`)

      return path;
    }

}
