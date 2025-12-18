import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { Form, TForm } from "./Form";
import { TPayment, IError } from "../../types";

type TOrderForm = {
  addressElement: HTMLInputElement;
  cashButton: HTMLButtonElement;
  cardButton: HTMLButtonElement;
} & TForm;

export class OrderForm extends Form<TOrderForm> {
  protected addressElement: HTMLInputElement;
  protected cashButton: HTMLButtonElement;
  protected cardButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(events, container);

    this.cashButton = ensureElement<HTMLButtonElement>(
      'button[name="cash"]',
      this.container
    );
    this.cardButton = ensureElement<HTMLButtonElement>(
      'button[name="card"]',
      this.container
    );
    this.addressElement = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container
    );

    // начальное состояние — без активной кнопки
    [this.cashButton, this.cardButton].forEach((btn) =>
      btn.classList.remove("button_alt-active")
    );

    this.cashButton.addEventListener("click", () => this.emitPayment("cash"));
    this.cardButton.addEventListener("click", () => this.emitPayment("card"));

    this.addressElement.addEventListener("input", () =>
      this.events.emit("order:change", {
        field: "address",
        value: this.addressElement.value,
      })
    );

    this.nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      // disabled-кнопка кликов не генерирует
      this.events.emit("order:next");
    });
  }

  // ✅ только эмит, без “локального рендера”
  private emitPayment(payment: TPayment): void {
    this.events.emit("order:change", { field: "payment", value: payment });
  }

  // ✅ презентер вызывает этот сеттер при изменении данных
  set payment(value: TPayment) {
    [this.cashButton, this.cardButton].forEach((button) => {
      button.classList.toggle(
        "button_alt-active",
        button.getAttribute("name") === value
      );
    });
  }

  set addressValue(value: string) {
    this.addressElement.value = value;
  }

  // ✅ не “валидирует”, а применяет состояние ошибок к форме
  setValidationErrors(errors: IError): void {
    const orderErrors = [errors.address, errors.payment].filter(Boolean);

    this.isButtonValid = orderErrors.length === 0;
    this.errors = orderErrors.length ? orderErrors.join(", ") : "";
  }
}
