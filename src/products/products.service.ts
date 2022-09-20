import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { In, Not, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

import { validate as isUUID} from 'uuid';
@Injectable()
export class ProductsService {

/**propiedad para mostrar los logs y que haga referencia a la entidad donde se encuentran */
private readonly logger = new Logger('ProductService')

constructor(
  @InjectRepository(Product)
  private readonly _productRepository: Repository<Product>,

  @InjectRepository(ProductImage)
  private readonly _productImageRepository: Repository<ProductImage>
){

}

/**CREANDO LA INSERCION DE UN NUEVO PRODUCTO */
async create(createProductDto: CreateProductDto) {

    try {

      //el resto de las propiedades se van a almacenar el productDetails solo sacamos la colección de imágenes
      const {images = [], ...productDetails} = createProductDto;

      const product =  this._productRepository.create({
        ...productDetails,
        images: images.map( image => this._productImageRepository.create({url: image}))
      });
      await this._productRepository.save(product);

      return {...product, images};
    } catch (error) {
      this.handleExceptions(error);
    }

  
  }


  //TODO: paginar
  async findAll(paginationDto: PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    return await this._productRepository.find({
      take: limit,//tomar los elementos que indique el límite
      skip: offset //saltarse todos los elementos del offset
      //TODO: Relaciones
    });
  }

  async findOne(term: string) {


    let product: Product;

    if( isUUID(term)){
      product = await this._productRepository.findOneBy({id: term})
    }else{
      const queryBuilder = this._productRepository.createQueryBuilder();
      product = await queryBuilder
      .where(`UPPER(title) = :title or slug = :slug`, {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .getOne();
      
    }

    if(!product){
      throw new NotFoundException(`El producto con id ${term} no fué encontrado`)
    } 
    return product; 
  }

  async findBySlug(slug: string){
    return await this._productRepository.findOne({where: {slug}})
  }

 async  update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this._productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    });

    if(!product) throw new NotFoundException(`Product whit ${id} not found!!`)

    try {
       //esperar hasta que los cambios fueron salvados en la bdd antes de retornarlo
      await  this._productRepository.save(product);
      return product;
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async remove(id: string) {
    const productDelete = await this.findOne(id);
    await this._productRepository.remove(productDelete);
  }


  async notInclude(){

   const qb = await this._productRepository.createQueryBuilder('products');

   try {
    const prods = qb
    .where("products.id NOT IN" + qb.subQuery()
      .select("image.productId")
      .from(ProductImage, "image")
      .getQuery()
    )
    .getMany()


    return prods;
   } catch (error) {
      this.handleExceptions(error)
   }
   
    

  }

  private handleExceptions(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Help')
    
  }

}
