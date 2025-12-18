import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

interface IOrderSuccess {
  total: number;
}

export class OrderSuccess extends Component<IOrderSuccess> {
  protected titleElement: HTMLElement;
  protected descriptionElement: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>(".order-success__title", this.container);
    this.descriptionElement = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container
    );
    this.closeButton = ensureElement<HTMLButtonElement>(".order-success__close", this.container);

    this.closeButton.addEventListener("click", () => this.events.emit("success:closed"));
  }

  set total(value: number) {
    this.descriptionElement.textContent = `Списано ${value} синапсов`;
  }
}
