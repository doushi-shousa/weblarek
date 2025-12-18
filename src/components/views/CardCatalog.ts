import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { Card, TCard } from "./Card";
import { categoryMap, CDN_URL } from "../../utils/constants";

export type TCardCatalog = Pick<IProduct, "category" | "image"> & TCard;

export class CardCatalog extends Card<TCardCatalog> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);

    this.container.addEventListener("click", () =>
      this.events.emit("card:open", { card: this.container.id })
    );
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
}
