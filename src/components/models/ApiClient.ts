import { IApi, IProduct, IOrderRequest, IOrderResponse } from '../../types';

type ProductsResponse = {
  items: IProduct[];
  total: number;
};

export class ApiClient {
  constructor(private readonly api: IApi) {}

  fetchProducts(): Promise<IProduct[]> {
    return this.api.get<ProductsResponse>('/product/').then((res) => res.items);
  }

  sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', order);
  }
}
