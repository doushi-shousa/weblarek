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

import type {
  IProduct,
  IOrderRequest,
  IOrderResponse,
  TPayment,
  IError,
} from "./types";

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

type CardPayload = { card: string };

type OrderChangePayload =
  | { field: "address"; value: string }
  | { field: "email"; value: string }
  | { field: "phone"; value: string }
  | { field: "payment"; value: TPayment };

// ─────────────────────────────────────────────────────────────
// 🧠 Models + 🌐 API + 📣 Events
// ─────────────────────────────────────────────────────────────
const events = new EventEmitter();
const apiClient = new ApiClient(new Api(API_URL));

const catalogModel = new Product(events);
const cartModel = new Cart(events);
const customerModel = new Customer(events);

// ─────────────────────────────────────────────────────────────
// 🖼️ Views (создаём один раз, дальше НЕ пересоздаём)
// ─────────────────────────────────────────────────────────────
const galleryView = new Gallery(ensureElement<HTMLElement>(".gallery"));
const headerView = new Header(events, ensureElement<HTMLElement>(".header"));
const modalView = new Modal(events, ensureElement<HTMLElement>(".modal"));

// содержимое модалок — создаём один раз
const basketView = new Basket(events, cloneTemplate<HTMLElement>("#basket"));
const previewView = new CardPreview(events, cloneTemplate<HTMLElement>("#card-preview"));
const orderFormView = new OrderForm(events, cloneTemplate<HTMLElement>("#order"));
const contactsFormView = new ContactsForm(events, cloneTemplate<HTMLElement>("#contacts"));
const successView = new OrderSuccess(events, cloneTemplate<HTMLElement>("#success"));

// ─────────────────────────────────────────────────────────────
// 🎨 Render helpers: мелкие функции отображения (без логики)
// ─────────────────────────────────────────────────────────────
function openModalWith(view: ModalView, content: HTMLElement) {
  activeModalView = view;
  modalView.content = content;
  modalView.open();
}

function closeModal() {
  activeModalView = null;
  modalView.close();
}

function renderHeader() {
  // 🧺 Счётчик товаров в корзине — в шапку
  headerView.counter = cartModel.getCount();
}

function renderCatalog(products: IProduct[]) {
  // 🛍️ Каталог товаров — карточки на главной
  const cards = products.map((product) => {
    const card = new CardCatalog(events, cloneTemplate<HTMLElement>("#card-catalog"));
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

function renderBasket() {
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
  renderBasket();
  openModalWith("basket", basketView.render());
}

function openPreview(product: IProduct) {
  // 🔎 Открываем превью товара в модалке
  const el = previewView.render({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    description: product.description,
    inCart: cartModel.hasItem(product.id),
  });

  // 🚫 Если цены нет — кнопка недоступна
  if (product.price === null) previewView.disableButton();

  openModalWith("preview", el);
}

function openOrder() {
  // 🧾 Шаг 1 оформления: оплата + адрес
  const info = customerModel.getCustomerInfo();

  orderFormView.addressValue = info.address ?? "";
  if (info.payment) orderFormView.payment = info.payment;

  openModalWith("order", orderFormView.render());

  // прогоняем валидацию (ошибки покажет презентер через form:errors)
  customerModel.validateCustomerInfo();
}

function openContacts() {
  // 📩 Шаг 2 оформления: email + phone
  const info = customerModel.getCustomerInfo();

  contactsFormView.emailValue = info.email ?? "";
  contactsFormView.phoneValue = info.phone ?? "";

  openModalWith("contacts", contactsFormView.render());

  // прогоняем валидацию (ошибки покажет презентер через form:errors)
  customerModel.validateCustomerInfo();
}

function openSuccess(total: number) {
  // ✅ Успешная оплата
  successView.total = total;
  openModalWith("success", successView.render());
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
    renderBasket();
    modalView.content = basketView.render();
  }

  if (activeModalView === "preview") {
    const selected = catalogModel.getSelected();
    if (selected) previewView.inCart = cartModel.hasItem(selected.id);
  }
});

events.on<{ product: IProduct | null }>("product:selected", ({ product }) => {
  // 🔎 Выбран товар — показываем превью
  if (product) openPreview(product);
});

events.on<IError>("form:errors", (errors) => {
  // формы не слушают события сами — презентер решает, куда отдать ошибки
  if (activeModalView === "order") {
    orderFormView.setValidationErrors(errors);
  }
  if (activeModalView === "contacts") {
    contactsFormView.setValidationErrors(errors);
  }
});

// ─────────────────────────────────────────────────────────────
// 🖱️ Presenter: события от VIEW (пользователь что-то сделал → меняем модели / открываем модалки)
// ─────────────────────────────────────────────────────────────
events.on("modal:close", () => closeModal());

events.on("basket:open", () => openBasket());

events.on<CardPayload>("card:open", ({ card }) => {
  // Открыть карточку товара
  const product = catalogModel.getProductById(card);
  if (!product) return;
  catalogModel.setSelected(product);
});

// ✅ одно событие из превью: презентер решает, add/remove
events.on<CardPayload>("card:toggle", ({ card }) => {
  const product = catalogModel.getProductById(card);
  if (!product) return;

  if (cartModel.hasItem(card)) {
    cartModel.removeItemById(card);
  } else {
    cartModel.addItem(product);
  }

  // по ТЗ после нажатия кнопки — модалка закрывается
  if (activeModalView === "preview") closeModal();
});

events.on<CardPayload>("card:delete", ({ card }) => {
  // Удалить из корзины (кнопка удаления в Basket-строке)
  cartModel.removeItemById(card);
});

events.on("basket:ready", () => {
  // Оформить → шаг 1
  openOrder();
});

events.on<OrderChangePayload>("order:change", ({ field, value }) => {
  // Любое изменение в формах → записываем в модель покупателя
  switch (field) {
    case "payment":
      customerModel.setCustomerInfo({ payment: value });
      // форма сама себя не “рендерит” — подсветку делает презентер
      if (activeModalView === "order") orderFormView.payment = value;
      break;
    case "address":
      customerModel.setCustomerInfo({ address: value });
      break;
    case "email":
      customerModel.setCustomerInfo({ email: value });
      break;
    case "phone":
      customerModel.setCustomerInfo({ phone: value });
      break;
  }
});

events.on("order:next", () => {
  // Далее → шаг 2
  openContacts();
});

events.on("contacts:submit", async () => {
  // Оплатить → отправляем заказ на сервер
  const customer = customerModel.getCustomerInfo();

  // если вдруг не выбран payment — просто покажем ошибки
  if (!customer.payment) {
    customerModel.validateCustomerInfo();
    return;
  }

  const payload: IOrderRequest = {
    payment: customer.payment,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    items: cartModel.getItems().map((p) => p.id),
    total: cartModel.getTotal(),
  };

  try {
    const res: IOrderResponse = await apiClient.sendOrder(payload);

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
