import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Cart {
  constructor(private readonly events?: IEvents) {}

  private items: IProduct[] = [];

  getItems(): IProduct[] {
    return [...this.items];
  }

  hasItem(productId: string): boolean {
    return this.items.some((item) => item.id === productId);
  }

  addItem(product: IProduct): void {
    if (!this.hasItem(product.id)) {
      this.items.push(product);
      this.events?.emit('basket:changed', this.getState());
    }
  }

  removeItemById(productId: string): void {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== productId);

    if (this.items.length !== before) {
      this.events?.emit('basket:changed', this.getState());
    }
  }

  clear(): void {
    if (this.items.length === 0) return;

    this.items = [];
    this.events?.emit('basket:changed', this.getState());
  }

  getCount(): number {
    return this.items.length;
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  private getState() {
    return {
      items: this.getItems(),
      count: this.getCount(),
      total: this.getTotal(),
    };
  }
}
