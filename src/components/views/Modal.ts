import { Component } from "../base/Component.ts";
import { IEvents } from "../base/Events.ts";
import { ensureElement } from "../../utils/utils.ts";

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected closeButton: HTMLButtonElement;
  protected contentElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container
    );
    this.contentElement = ensureElement<HTMLElement>(
      ".modal__content",
      this.container
    );

    this.closeButton.addEventListener("click", () =>
      this.events.emit("modal:close")
    );

    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) this.events.emit("modal:close");
    });
  }

  open() {
    this.container.classList.add("modal_active");
  }

  close() {
    this.container.classList.remove("modal_active");
    this.contentElement.replaceChildren();
  }

  set content(element: HTMLElement) {
    this.contentElement.replaceChildren(element);
  }
}
