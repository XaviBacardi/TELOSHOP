import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/products-data';

@Injectable()
export class SeedService {
  
  constructor(
    private readonly _productService: ProductsService
  ){}

  async runSeed(){

    await this.insertProducts();
    
    return 'Seed executed succesfully'
  }

  private async insertProducts(){

    this._productService.deleteAllProducts();

    //igualando una constante con la data contenida en el seed de tipo producto
    const products = initialData.products;

    //constante para barrer cada uno de los productos
    const insertPromises = [];


    products.forEach( product => {
      insertPromises.push(this._productService.create( product ));
    })

    const response = await Promise.all(insertPromises);
    return response;
  }

}
  