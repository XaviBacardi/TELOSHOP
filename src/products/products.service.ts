import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, In, Not, Repository } from 'typeorm';
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
  private readonly _productImageRepository: Repository<ProductImage>,

  private readonly dataSource: DataSource
){

}

/**CREANDO LA INSERCION DE UN NUEVO PRODUCTO */
async create(createProductDto: CreateProductDto) {

    try {

      //el resto de las propiedades se van a almacenar el productDetails solo sacamos la colección de imágenes
      const {images = [], ...productDetails} = createProductDto;

      const product =  this._productRepository.create({
        ...productDetails,
        images: images.map( image => 
          this._productImageRepository.create({url: image})
        )
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

    const products = await this._productRepository.find({
      relations: ['images'],
      take: limit,//tomar los elementos que indique el límite
      skip: offset //saltarse todos los elementos del offset
    });


    //barriendo cada uno de los productos
    return products.map( (product) => ({

      //Spread para adjuntar a cada producto el barrido de las imágenes
      ...product,
      images: product.images.map( (image) => image.url)
    }))
  }

  async findOne(term: string) {


    let product: Product;

    if( isUUID(term)){
      product = await this._productRepository.findOneBy({id: term})
    }else{
      const queryBuilder = this._productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where(`UPPER(title) = :title or slug = :slug`, {
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'img')
      .getOne();
      
    }

    if(!product){
      throw new NotFoundException(`El producto con id ${term} no fué encontrado`)
    } 
    return product; 
  }

  //Retornar las imagenes aplanadas al buscar un producto especifico
  async findByPlane(termino: string){
    const {images, ...resto} = await this.findOne( termino );
    
    return {
      ...resto,
      images: images.map( (img) => img.url)
    }
  }

  async findBySlug(slug: string){
    return await this._productRepository.findOne({where: {slug}})
  }

 async  update(id: string, updateProductDto: UpdateProductDto) {


    const {images, ...toUpdate} = updateProductDto;

    const product = await this._productRepository.preload({ id, ...toUpdate});

    if(!product) throw new NotFoundException(`Product whit ${id} not found!!`)

    //Si hay imagenes debemos eliminarlas para actualizar las nuevas
    /**CREATE QUERY RUNNER permite realizar diversas transacciones sql*/
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      //si hay imagenes borramos las que existan
      if( images ){
        await queryRunner.manager.delete(ProductImage, {product: { id } })

        product.images = images.map( 
          (image) => this._productImageRepository.create({url: image}) 
        )
      }else{

      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      //esperar hasta que los cambios fueron salvados en la bdd antes de retornarlo
      //await  this._productRepository.save(product);
      return this.findByPlane( id );
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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


  async deleteAllProducts(){

    const query = this._productRepository.createQueryBuilder('product')

    try {
      return await query
       .delete()
       .where({})
       .execute()
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
