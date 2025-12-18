import { Component } from "../base/Component.ts";
import { IEvents } from "../base/Events.ts";
import { ensureElement } from "../../utils/utils.ts";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected listElements: HTMLElement;
  protected priceElements: HTMLElement;
  protected basketButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.listElements = ensureElement<HTMLElement>(
      ".basket__list",
      this.container
    );
    this.priceElements = ensureElement<HTMLElement>(
      ".basket__price",
      this.container
    );
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );

    this.basketButton.addEventListener("click", () =>
      this.events.emit("basket:ready")
    );
  }

  set items(elements: HTMLElement[]) {
    const isEmpty = elements.length === 0;

    if (isEmpty) {
      this.listElements.innerHTML = "<div>Корзина пуста</div>";
      this.listElements.classList.add("basket__list_empty");
      this.basketButton.disabled = true;
    } else {
      this.listElements.replaceChildren(...elements);
      this.listElements.classList.remove("basket__list_empty");
      this.basketButton.disabled = false;
    }

    this.listElements.classList.toggle(
      "basket__list_scroll",
      elements.length > 4
    );
  }

  set total(value: number) {
    this.priceElements.textContent = `${value} синапсов`;
  }
}
