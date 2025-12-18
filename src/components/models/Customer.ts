import { ICustomer, TPayment } from '../../types';
import { IEvents } from '../base/Events';

// Удобный тип: данные покупателя, которые могут быть заполнены не полностью
export type CustomerState = Omit<ICustomer, 'payment'> & { payment: TPayment | null };

export type CustomerErrors = Partial<Record<keyof CustomerState, string>>;

export class Customer {
  constructor(private readonly events?: IEvents) {}

  private _payment: TPayment | null = null;
  private _address = '';
  private _email = '';
  private _phone = '';

  // Обновление частями (не затирает то, чего нет в data)
  setCustomerInfo(data: Partial<CustomerState>): void {
    if (data.payment !== undefined) this._payment = data.payment;
    if (data.address !== undefined) this._address = data.address;
    if (data.email !== undefined) this._email = data.email;
    if (data.phone !== undefined) this._phone = data.phone;

    this.events?.emit('customer:changed', { customer: this.getCustomerInfo() } as any);
    this.validateCustomerInfo();
  }

  set payment(value: TPayment | null) {
    this._payment = value;
  }
  set address(value: string) {
    this._address = value;
  }
  set email(value: string) {
    this._email = value;
  }
  set phone(value: string) {
    this._phone = value;
  }

  // Возвращаем реальное состояние, без "as TPayment"
  getCustomerInfo(): CustomerState {
    return {
      payment: this._payment,
      address: this._address,
      email: this._email,
      phone: this._phone,
    };
  }

  clearCustomerInfo(): void {
    this._payment = null;
    this._address = '';
    this._email = '';
    this._phone = '';

    this.events?.emit('customer:changed', { customer: this.getCustomerInfo() } as any);
    this.validateCustomerInfo();
  }

  validateCustomerInfo(): CustomerErrors {
    const errors: CustomerErrors = {};

    if (!this._payment) errors.payment = 'Не указан способ оплаты';
    if (!this._address) errors.address = 'Необходим адрес доставки';
    if (!this._email) errors.email = 'Укажите электронную почту';
    if (!this._phone) errors.phone = 'Введите номер телефона';

    this.events?.emit('form:errors', errors as any);

    return errors;
  }
}
