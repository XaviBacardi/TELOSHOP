import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/file-filter.helper';
import { fileNamer } from './helpers/file-namer.helper';


@Controller('files')
export class FilesController {

    constructor(
      private readonly filesService: FilesService
    ) {}

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
      console.log(file);
      return {
        filename: file.originalname,
        type: file.mimetype
      };
    }
}
