import { 
IsString, 
MinLength, 
IsNumber, 
IsPositive, 
IsNotEmpty, 
IsOptional, 
IsInt, 
IsArray, 
IsIn} from 'class-validator';

export class CreateProductDto {

    @IsString()
    @MinLength(5, {message: 'El titulo debería contener al menos 5 caracteres'})
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;
    
    @IsPositive()
    @IsInt()
    @IsOptional()
    stock?: number;

    @IsNotEmpty({message: 'Se debe especificar el tamaño del producto'})
    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];
}
