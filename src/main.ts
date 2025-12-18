import "./scss/styles.scss";

import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";
import { ensureElement } from "./utils/utils";
import { API_URL } from "./utils/constants";

import { ApiClient } from "./components/models/ApiClient";
import { Product } from "./components/models/Product";
import { Cart } from "./components/models/Cart";
import { Customer } from "./components/models/Customer";

import { Gallery } from "./components/views/Gallery";
import { Header } from "./components/views/Header";
import { Modal } from "./components/views/Modal";
import { Basket } from "./components/views/Basket";

import { CardCatalog } from "./components/views/CardCatalog";
import { CardPreview } from "./components/views/CardPreview";
import { CardBasket } from "./components/views/CardBasket";

import { OrderForm } from "./components/views/OrderForm";
import { ContactsForm } from "./components/views/ContactsForm";
import { OrderSuccess } from "./components/views/OrderSuccess";

import type { IProduct, IOrderResponse, TPayment } from "./types";

/**
 * 🧪 Local sanity-check (но уже по-взрослому):
 * Теперь это не набор console.log, а полноценный Presenter (MVP):
 * - View генерирует события
 * - Models хранят данные и тоже эмитят события при изменении
 * - main.ts (Presenter) слушает всё это и обновляет UI
 *
 * Тут нет “магии” — только события, рендер и немного веры в TypeScript.
 */

// ─────────────────────────────────────────────────────────────
// 🧩 Helpers: шаблоны и служебные штуки
// ─────────────────────────────────────────────────────────────
function cloneTemplate<T extends HTMLElement>(selector: string): T {
  const tpl = ensureElement<HTMLTemplateElement>(selector);
  const node = tpl.content.firstElementChild?.cloneNode(true);
  if (!node) throw new Error(`Template ${selector} is empty`);
  return node as T;
}

type ModalView = "preview" | "basket" | "order" | "contacts" | "success" | null;
let activeModalView: ModalView = null;

// ─────────────────────────────────────────────────────────────
// 🧠 Models + 🌐 API + 📣 Events
// ─────────────────────────────────────────────────────────────
const events = new EventEmitter();
const apiClient = new ApiClient(new Api(API_URL));

const catalogModel = new Product(events);
const cartModel = new Cart(events);
const customerModel = new Customer(events);

// ─────────────────────────────────────────────────────────────
// 🖼️ Views (корневые компоненты приложения)
// ─────────────────────────────────────────────────────────────
const galleryView = new Gallery();
const headerView = new Header(events, ensureElement<HTMLElement>(".header"));
const modal = new Modal(events, ensureElement<HTMLElement>(".modal"));

// ─────────────────────────────────────────────────────────────
// 🎨 Render helpers: мелкие функции отображения (без логики)
// ─────────────────────────────────────────────────────────────
function openModalWith(view: ModalView, content: HTMLElement) {
  activeModalView = view;
  modal.content = content;
  modal.open();
}

function closeModal() {
  activeModalView = null;
  modal.close();
}

function renderHeader() {
  // 🧺 Счётчик товаров в корзине — в шапку
  headerView.counter = cartModel.getCount();
}

function renderCatalog(products: IProduct[]) {
  // 🛍️ Каталог товаров — карточки на главной
  const cards = products.map((product) => {
    const card = new CardCatalog(
      events,
      cloneTemplate<HTMLElement>("#card-catalog")
    );
    return card.render({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  });

  galleryView.catalog = cards;
}

function renderBasket(basketView: Basket) {
  // 🧺 Корзина — список выбранных товаров
  const rows = cartModel.getItems().map((product, index) => {
    const row = new CardBasket(events, cloneTemplate<HTMLElement>("#card-basket"));
    return row.render({
      id: product.id,
      title: product.title,
      price: product.price,
      index: index + 1,
    });
  });

  basketView.items = rows;
  basketView.total = cartModel.getTotal();
}

function openBasket() {
  // 🧺 Открываем корзину в модалке
  const basketView = new Basket(events, cloneTemplate<HTMLElement>("#basket"));
  renderBasket(basketView);
  openModalWith("basket", basketView.render());
}

function openPreview(product: IProduct) {
  // 🔎 Открываем превью товара в модалке
  const preview = new CardPreview(events, cloneTemplate<HTMLElement>("#card-preview"));
  const el = preview.render({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    description: product.description,
    inCart: cartModel.hasItem(product.id),
  });

  // 🚫 Если цены нет — кнопка недоступна
  if (product.price === null) preview.disableButton();

  openModalWith("preview", el);
}

function openOrder() {
  // 🧾 Шаг 1 оформления: оплата + адрес
  const form = new OrderForm(events, cloneTemplate<HTMLElement>("#order"));
  const info = customerModel.getCustomerInfo();

  form.addressValue = info.address ?? "";

  // payment в модели может быть null — в форму подставляем только если выбран
  if (info.payment) {
    form.payment = info.payment;
  }

  // Прогоняем валидацию, чтобы подсветились ошибки/кнопка
  customerModel.validateCustomerInfo();

  openModalWith("order", form.render());
}

function openContacts() {
  // 📩 Шаг 2 оформления: email + phone
  const form = new ContactsForm(events, cloneTemplate<HTMLElement>("#contacts"));
  const info = customerModel.getCustomerInfo();

  form.emailValue = info.email ?? "";
  form.phoneValue = info.phone ?? "";

  // Прогоняем валидацию, чтобы подсветились ошибки/кнопка
  customerModel.validateCustomerInfo();

  openModalWith("contacts", form.render());
}

function openSuccess(total: number) {
  // ✅ Успешная оплата
  const success = new OrderSuccess(events, cloneTemplate<HTMLElement>("#success"));
  success.total = total;
  openModalWith("success", success.render());
}

// ─────────────────────────────────────────────────────────────
// 📦 Presenter: события от МОДЕЛЕЙ (данные изменились → обновляем UI)
// ─────────────────────────────────────────────────────────────
events.on<{ products: IProduct[] }>("catalog:changed", ({ products }) => {
  // 🛍️ Каталог обновился — перерисовали
  renderCatalog(products);
});

events.on("basket:changed", () => {
  // 🧺 Корзина изменилась — обновляем счётчик и (если нужно) модалку
  renderHeader();

  if (activeModalView === "basket") {
    const basketView = new Basket(events, cloneTemplate<HTMLElement>("#basket"));
    renderBasket(basketView);
    modal.content = basketView.render();
  }
});

events.on("product:selected", () => {
  // 🔎 Выбран товар — показываем превью
  const selected = catalogModel.getSelected();
  if (selected) openPreview(selected);
});

// ─────────────────────────────────────────────────────────────
// 🖱️ Presenter: события от VIEW (пользователь что-то сделал → меняем модели / открываем модалки)
// ─────────────────────────────────────────────────────────────
events.on("modal:close", () => closeModal());

events.on("basket:open", () => openBasket());

events.on<{ card: string }>("card:open", ({ card }) => {
  // Открыть карточку товара
  const product = catalogModel.getProductById(card);
  if (!product) return;
  catalogModel.setSelected(product);
});

events.on<{ card: string }>("card:add", ({ card }) => {
  // Купить: добавить в корзину
  const product = catalogModel.getProductById(card);
  if (!product) return;

  cartModel.addItem(product);
  closeModal();
});

events.on<{ card: string }>("card:delete", ({ card }) => {
  // Удалить из корзины (или из превью)
  cartModel.removeItemById(card);

  // Если мы удалили из превью — просто закрываем
  if (activeModalView === "preview") closeModal();
});

events.on("basket:ready", () => {
  // Оформить → шаг 1
  openOrder();
});

events.on<{ field: string; value: string }>("order:change", ({ field, value }) => {
  // Любое изменение в формах → записываем в модель покупателя
  // (payment здесь приходит как string, но по факту это 'cash' | 'card')
  customerModel.setCustomerInfo({ [field]: value } as any);
});

events.on("order:next", () => {
  // Далее → шаг 2
  openContacts();
});

events.on("contacts:submit", async () => {
  // Оплатить → отправляем заказ на сервер
  const customer = customerModel.getCustomerInfo();

  // На момент оплаты способ оплаты должен быть выбран.
  // Если вдруг null — подстрахуемся, чтобы TS не ругался.
  const payment = (customer.payment ?? "card") as TPayment;

  const payload = {
    payment,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    items: cartModel.getItems().map((p) => p.id),
    total: cartModel.getTotal(),
  };

  try {
    const res: IOrderResponse = await apiClient.sendOrder(payload as any);

    // ✅ Успех → чистим данные (как в ТЗ) и показываем сообщение
    cartModel.clear();
    customerModel.clearCustomerInfo();
    openSuccess(res.total);
  } catch (e) {
    console.error("Order error:", e);
  }
});

events.on("success:closed", () => {
  // Закрыли окно успеха
  closeModal();
});

// ─────────────────────────────────────────────────────────────
// 🚀 Bootstrap: старт приложения (получаем товары и запускаем UI)
// ─────────────────────────────────────────────────────────────
renderHeader();

apiClient
  .fetchProducts()
  .then((products) => catalogModel.setProducts(products))
  .catch((e) => console.error("API error:", e));
