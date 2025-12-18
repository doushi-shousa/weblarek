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

    this.cardButton.addEventListener("click", () => {
      if (this.cardButton.disabled) return;

      const isInCart = this.cardButton.getAttribute("data-in-cart") === "true";

      this.events.emit(isInCart ? "card:delete" : "card:add", {
        card: this.container.id,
      });
    });
  }

  set category(value: string) {
    this.categoryElement.textContent = value;

    // categoryMap: Record<string, string> (название категории -> модификатор)
    Object.values(categoryMap).forEach((cls) => {
      this.categoryElement.classList.remove(`card__category_${cls}`);
    });

    const cls = (categoryMap as Record<string, string>)[value];
    if (cls) {
      this.categoryElement.classList.add(`card__category_${cls}`);
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

    if (value) {
      this.cardButton.setAttribute("data-in-cart", "true");
      this.cardButton.textContent = "Удалить из корзины";
    } else {
      this.cardButton.removeAttribute("data-in-cart");
      this.cardButton.textContent = "Купить";
    }

    this.cardButton.disabled = false;
  }

  disableButton() {
    this.cardButton.disabled = true;
    this.cardButton.textContent = "Недоступно";
    this.cardButton.removeAttribute("data-in-cart");
  }
}
