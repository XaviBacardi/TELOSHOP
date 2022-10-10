import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/file-filter.helper';


@Controller('files')
export class FilesController {

    constructor(
      private readonly filesService: FilesService
    ) {}

    @Post('product')
    @UseInterceptors( FileInterceptor('file', {
      fileFilter: fileFilter
    }) )
    uploadFiles(
      	@UploadedFile()  file: Express.Multer.File,
    ){

      if(!file) throw new BadRequestException(['Asegurate que el archivo es una imagen'])
      
      return {
        filename: file.originalname,
        type: file.mimetype
      };
    }
}
