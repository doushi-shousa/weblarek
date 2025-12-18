import { Component } from "../base/Component";
import { ensureElement, ensureAllElements } from "../../utils/utils";
import { IEvents } from "../base/Events";

export type TForm = {
  formElement: HTMLFormElement;
  formErrors: HTMLElement;
  nextButton: HTMLButtonElement;
  formInputs: HTMLInputElement[];
};

export class Form<T = {}> extends Component<TForm & T> {
  protected formElement: HTMLFormElement;
  protected formErrors: HTMLElement;
  protected nextButton: HTMLButtonElement;
  protected formInputs: HTMLInputElement[];

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.formElement =
      container instanceof HTMLFormElement
        ? container
        : ensureElement<HTMLFormElement>(".form", this.container);

    this.nextButton = ensureElement<HTMLButtonElement>(".button", this.container);
    this.formErrors = ensureElement<HTMLElement>(".form__errors", this.container);
    this.formInputs = ensureAllElements<HTMLInputElement>(".form__input", this.container);
  }

  set isButtonValid(value: boolean) {
    this.nextButton.disabled = !value;
  }

  set errors(text: string) {
    this.formErrors.textContent = text;
  }
}
