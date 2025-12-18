import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";

export type TCard = Pick<IProduct, "title" | "price" | "id">;

export class Card<T = {}> extends Component<TCard & T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  // ✅ id не в DOM
  protected _id = "";

  constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>(".card__title", this.container);
    this.priceElement = ensureElement<HTMLElement>(".card__price", this.container);
  }

  set id(value: string) {
    this._id = value;
  }

  getId(): string {
    return this._id;
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent = value === null ? "Бесценно" : `${value} синапсов`;
  }
}
