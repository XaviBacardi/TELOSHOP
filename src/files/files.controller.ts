import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/file-filter.helper';
import { fileNamer } from './helpers/file-namer.helper';


@Controller('files')
export class FilesController {

    constructor(
      private readonly filesService: FilesService
    ) {}


    @Get('product/:imageName')
    findImage(
      @Res() res: Response,
      @Param('imageName') imageName: string
    ){


      const path = this.filesService.getImage(imageName)
      res.sendFile(path)
    }

    @Post('product')
    @UseInterceptors( FileInterceptor('file', {
      fileFilter: fileFilter,
      //limits: {fileSize: 1000}
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer
      })
    }) )
    uploadFiles(
      	@UploadedFile()  file: Express.Multer.File,
    ){

      if(!file) throw new BadRequestException(['Asegurate que el archivo es una imagen'])
      
      const secureURL = `${file.filename}`
      return {
        secureURL
      };
    }
}
