import { IProduct } from '../../types';

export class Product {
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
  }

  setProducts(products: IProduct[]): void {
    this.products = [...products];
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }
}
