import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Product {
  constructor(private readonly events?: IEvents) {}

  private selected: IProduct | null = null;
  private products: IProduct[] = [];

  getSelected(): IProduct | null {
    return this.selected;
  }

  getProducts(): IProduct[] {
    return [...this.products];
  }

  setSelected(product: IProduct | null): void {
    this.selected = product;
    this.events?.emit('product:selected', { product });
  }

  setProducts(products: IProduct[]): void {
    this.products = [...products];
    this.events?.emit('catalog:changed', { products: this.getProducts() });
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }
}
