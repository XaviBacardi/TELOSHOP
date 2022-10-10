
export const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: Function) =>  {

    if(!file) return cb(new Error('El archivo esta vacío'), false);

    //Extrayendo la data del archivo
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = file.originalname;

    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

    if(validExtensions.includes(fileExtension)){
        return cb(null, true)
    }


    cb(null, false)
}