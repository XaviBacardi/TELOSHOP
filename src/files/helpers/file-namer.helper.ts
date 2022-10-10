export const fileNamer = (req: Express.Request, file: Express.Multer.File, cb: Function) =>  {

    if(!file) return cb(new Error('El archivo esta vacío'), false);

   
    const fileName = file.originalname;

    cb(null, fileName)
}