import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";

export type TCard = Pick<IProduct, "title" | "price" | "id">;

export class Card<T = {}> extends Component<TCard & T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>(".card__title", this.container);
    this.priceElement = ensureElement<HTMLElement>(".card__price", this.container);
  }

  set id(value: string) {
    this.container.dataset.id = value;
    this.container.id = value;
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent = value === null ? "Бесценно" : `${value} синапсов`;
  }
}
