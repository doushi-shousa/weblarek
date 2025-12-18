import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Card, TCard } from "./Card";

export type TCardBasket = { index: number } & TCard;

export class CardBasket extends Card<TCardBasket> {
  protected indexElement: HTMLElement;
  protected itemDeleteButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>(".basket__item-index", this.container);

    this.itemDeleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    this.itemDeleteButton.addEventListener("click", () =>
      this.events.emit("card:delete", { card: this.getId() })
    );
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
