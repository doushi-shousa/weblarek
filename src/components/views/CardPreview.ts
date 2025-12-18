import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { Card, TCard } from "./Card";
import { categoryMap, CDN_URL } from "../../utils/constants";

export type TCardPreview =
  Pick<IProduct, "category" | "image" | "description"> &
  TCard & { inCart?: boolean };

export class CardPreview extends Card<TCardPreview> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;
  protected cardButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);
    this.descriptionElement = ensureElement<HTMLElement>(".card__text", this.container);
    this.cardButton = ensureElement<HTMLButtonElement>(".card__button", this.container);

    // ✅ одно событие без хранения состояния в DOM
    this.cardButton.addEventListener("click", () => {
      if (this.cardButton.disabled) return;
      this.events.emit("card:toggle", { card: this.getId() })
    });
  }

  set category(value: string) {
    this.categoryElement.textContent = value;

    // ✅ сброс модификаторов одной операцией
    this.categoryElement.className = "card__category";

    // ✅ categoryMap хранит ГОТОВЫЙ класс (например: 'card__category_soft')
    const cls = (categoryMap as Record<string, string>)[value];
    if (cls) {
      this.categoryElement.classList.add(cls);
    }
  }

  set image(value: string) {
    const pngImage = value.replace(".svg", ".png");
    this.setImage(
      this.imageElement,
      `${CDN_URL}/${pngImage}`,
      this.titleElement.textContent ?? ""
    );
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set inCart(value: boolean) {
    if (this.cardButton.disabled) return;

    this.cardButton.textContent = value ? "Удалить из корзины" : "Купить";
    this.cardButton.disabled = false;
  }

  disableButton() {
    this.cardButton.disabled = true;
    this.cardButton.textContent = "Недоступно";
  }
}
