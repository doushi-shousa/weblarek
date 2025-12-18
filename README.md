# Проектная работа «Веб-ларёк» (Web-Larёk)

Стек: **HTML**, **SCSS**, **TypeScript**, **Vite**

Проект — интернет-магазин с товарами для веб-разработчиков. Реализована архитектура **MVP (Model–View–Presenter)**: слой данных (каталог, корзина, покупатель), слой представления (UI-компоненты) и слой логики (Presenter в `main.ts`) + коммуникация с сервером через API-клиент.

---

## Структура проекта

* `src/` — исходные файлы проекта
* `src/components/` — компоненты приложения
* `src/components/base/` — базовый код (Api, EventEmitter, Component и т.д.)
* `src/components/models/` — модели данных и API-клиент
* `src/components/views/` — компоненты представления (UI)
* `src/types/index.ts` — типы и интерфейсы
* `src/utils/` — константы и утилиты
* `src/scss/styles.scss` — корневой файл стилей
* `src/main.ts` — точка входа приложения (**Presenter**)

Важные файлы:

* `index.html` — HTML-файл главной страницы (включая `<template>` для компонентов)
* `src/utils/constants.ts` — константы (в т.ч. `API_URL`, `CDN_URL`, `categoryMap`)

---

## Установка и запуск

### 1) Установка зависимостей

```bash
npm install
```

или

```bash
yarn
```

### 2) Переменные окружения (.env)

Создайте файл `.env` в корне проекта и добавьте:

```env
VITE_API_ORIGIN=https://larek-api.nomoreparties.co
```

> Важно: адрес указывается **без слеша** в конце.

### 3) Запуск в режиме разработки

```bash
npm run dev
```

или

```bash
yarn dev
```

---

## Сборка

```bash
npm run build
```

или

```bash
yarn build
```

---

## Интернет-магазин «Web-Larёk»

«Web-Larёk» — интернет-магазин, где пользователи могут просматривать каталог товаров, добавлять товары в корзину и оформлять заказы. В интерфейсе используются модальные окна для просмотра карточек товара, корзины и форм оформления заказа.

---

## Архитектура приложения

Код приложения разделён на слои согласно парадигме **MVP (Model–View–Presenter)**:

* **Model** — слой данных: хранение состояния и операции над данными.
* **View** — слой представления: отображение данных в DOM и генерация событий пользовательских действий.
* **Presenter** — слой логики: подписывается на события, связывает модели и представления, управляет сценариями.

Взаимодействие реализовано событийно-ориентированно: модели и представления эмитят события через `EventEmitter`, презентер их обрабатывает.

---

## Базовый код

### `Component<T>`

Базовый класс для компонентов интерфейса.

**Конструктор:**

* `constructor(container: HTMLElement)`

**Поля:**

* `container: HTMLElement` — корневой DOM-элемент компонента.

**Методы:**

* `render(data?: Partial<T>): HTMLElement` — применяет данные (через сеттеры) и возвращает `container`.
* `setImage(element: HTMLImageElement, src: string, alt?: string): void` — утилита для установки изображения.

### `Api`

Базовый класс для HTTP-запросов.

**Конструктор:**

* `constructor(baseUrl: string, options: RequestInit = {})`

**Поля:**

* `baseUrl: string`
* `options: RequestInit`

**Методы:**

* `get<T extends object>(uri: string): Promise<T>`
* `post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>`
* `handleResponse(response: Response): Promise<object>`

### `EventEmitter`

Брокер событий (паттерн «Наблюдатель»).

**Поля:**

* `_events: Map<string | RegExp, Set<Function>>`

**Методы:**

* `on<T extends object>(event: EventName, callback: (data: T) => void): void`
* `emit<T extends object>(event: string, data?: T): void`
* `trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void`

---

## Данные и типы

Типы и интерфейсы описаны в `src/types/index.ts`.

### `TPayment`

```ts
export type TPayment = 'cash' | 'card';
```

### `IProduct`

```ts
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

`price` может быть `null` — такой товар в UI считается недоступным для покупки.

### `ICustomer`

```ts
export interface ICustomer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
```

### `IOrderRequest`

```ts
export interface IOrderRequest extends ICustomer {
  items: string[];
  total: number;
}
```

### `IOrderResponse`

```ts
export interface IOrderResponse {
  id: string;
  total: number;
}
```

---

## Модели данных (Model)

Модели не взаимодействуют с DOM и эмитят события при изменении состояния.

### `Product`

Файл: `src/components/models/Product.ts`

**Назначение:** хранит каталог товаров и выбранный товар.

**Конструктор:**

* `constructor(events?: IEvents)`

**Поля:**

* `selected: IProduct | null`
* `products: IProduct[]`

**Методы:**

* `getSelected(): IProduct | null`
* `getProducts(): IProduct[]`
* `setSelected(product: IProduct | null): void` — эмитит `product:selected`
* `setProducts(products: IProduct[]): void` — эмитит `catalog:changed`
* `getProductById(id: string): IProduct | undefined`

### `Cart`

Файл: `src/components/models/Cart.ts`

**Назначение:** хранит товары, выбранные для покупки.

**Конструктор:**

* `constructor(events?: IEvents)`

**Поля:**

* `items: IProduct[]`

**Методы:**

* `getItems(): IProduct[]`
* `hasItem(productId: string): boolean`
* `addItem(product: IProduct): void` — эмитит `basket:changed`
* `removeItemById(productId: string): void` — эмитит `basket:changed`
* `clear(): void` — эмитит `basket:changed`
* `getCount(): number`
* `getTotal(): number`

### `Customer`

Файл: `src/components/models/Customer.ts`

**Назначение:** хранит данные покупателя и выполняет валидацию.

**Типы:**

* `CustomerState = Omit<ICustomer, 'payment'> & { payment: TPayment | null }`
* `CustomerErrors = Partial<Record<keyof CustomerState, string>>`

**Конструктор:**

* `constructor(events?: IEvents)`

**Поля:**

* `_payment: TPayment | null`
* `_address: string`
* `_email: string`
* `_phone: string`

**Методы:**

* `setCustomerInfo(data: Partial<CustomerState>): void` — эмитит `customer:changed`, вызывает валидацию
* `getCustomerInfo(): CustomerState`
* `clearCustomerInfo(): void` — эмитит `customer:changed`, вызывает валидацию
* `validateCustomerInfo(): CustomerErrors` — эмитит `form:errors`

---

## Слой коммуникации

### `ApiClient`

Файл: `src/components/models/ApiClient.ts`

**Назначение:** взаимодействие с сервером через композицию с `Api`.

**Конструктор:**

* `constructor(api: IApi)`

**Методы:**

* `fetchProducts(): Promise<IProduct[]>` — GET `/product/`, возвращает `items`
* `sendOrder(order: IOrderRequest): Promise<IOrderResponse>` — POST `/order/`

---

## Слой представления (View)

View-компоненты отвечают только за DOM и пользовательские действия. Данные не хранят.

### `Gallery`

Файл: `src/components/views/Gallery.ts`

**Назначение:** контейнер каталога на главной странице.

**Конструктор:**

* `constructor(container?: HTMLElement)`

**Поля:**

* `catalogElement: HTMLElement`

**Сеттеры:**

* `set catalog(items: HTMLElement[])`

### `Header`

Файл: `src/components/views/Header.ts`

**Назначение:** шапка, кнопка корзины и счётчик.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `counterElement: HTMLElement`
* `basketButton: HTMLButtonElement`

**События:**

* эмитит `basket:open`

**Сеттеры:**

* `set counter(value: number)`

### `Modal`

Файл: `src/components/views/Modal.ts`

**Назначение:** модальное окно (без наследников).

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `closeButton: HTMLButtonElement`
* `contentElement: HTMLElement`

**События:**

* эмитит `modal:close`

**Методы/сеттеры:**

* `open(): void`
* `close(): void`
* `set content(element: HTMLElement)`

### `Basket`

Файл: `src/components/views/Basket.ts`

**Назначение:** отображение корзины.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `listElements: HTMLElement`
* `priceElements: HTMLElement`
* `basketButton: HTMLButtonElement`

**События:**

* эмитит `basket:ready`

**Сеттеры:**

* `set items(elements: HTMLElement[])`
* `set total(value: number)`

### Карточки товара (общий родитель)

#### `Card`

Файл: `src/components/views/Card.ts`

**Назначение:** базовая карточка товара (id, title, price).

**Конструктор:**

* `constructor(container: HTMLElement)`

**Поля:**

* `titleElement: HTMLElement`
* `priceElement: HTMLElement`

**Сеттеры:**

* `set id(value: string)`
* `set title(value: string)`
* `set price(value: number | null)`

#### `CardCatalog`

Файл: `src/components/views/CardCatalog.ts`

**Назначение:** карточка товара в каталоге.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `categoryElement: HTMLElement`
* `imageElement: HTMLImageElement`

**События:**

* эмитит `card:open`

**Сеттеры:**

* `set category(value: string)`
* `set image(value: string)`

#### `CardPreview`

Файл: `src/components/views/CardPreview.ts`

**Назначение:** карточка товара для просмотра (в модальном окне).

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `categoryElement: HTMLElement`
* `imageElement: HTMLImageElement`
* `descriptionElement: HTMLElement`
* `cardButton: HTMLButtonElement`

**События:**

* эмитит `card:add` / `card:delete`

**Сеттеры/методы:**

* `set category(value: string)`
* `set image(value: string)`
* `set description(value: string)`
* `set inCart(value: boolean)`
* `disableButton(): void`

#### `CardBasket`

Файл: `src/components/views/CardBasket.ts`

**Назначение:** элемент товара в корзине.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `indexElement: HTMLElement`
* `itemDeleteButton: HTMLButtonElement`

**События:**

* эмитит `card:delete`

**Сеттеры:**

* `set index(value: number)`

### Формы (общий родитель)

#### `Form`

Файл: `src/components/views/Form.ts`

**Назначение:** базовый класс формы (ошибки и submit-кнопка). Не содержит бизнес-логики.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `formElement: HTMLFormElement`
* `formErrors: HTMLElement`
* `nextButton: HTMLButtonElement`
* `formInputs: HTMLInputElement[]`

**Сеттеры:**

* `set isButtonValid(value: boolean)`
* `set errors(text: string)`

#### `OrderForm`

Файл: `src/components/views/OrderForm.ts`

**Назначение:** шаг 1 оформления (оплата + адрес).

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `addressElement: HTMLInputElement`
* `cashButton: HTMLButtonElement`
* `cardButton: HTMLButtonElement`

**События:**

* эмитит `order:change`, `order:next`

**Сеттеры/методы:**

* `set payment(value: TPayment)`
* `set addressValue(value: string)`
* `validateForm(errors: IError): void`

#### `ContactsForm`

Файл: `src/components/views/ContactsForm.ts`

**Назначение:** шаг 2 оформления (email + телефон).

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `emailElement: HTMLInputElement`
* `phoneElement: HTMLInputElement`

**События:**

* эмитит `order:change`, `contacts:submit`

**Сеттеры/методы:**

* `set emailValue(value: string)`
* `set phoneValue(value: string)`
* `validateForm(errors: IError): void`

### `OrderSuccess`

Файл: `src/components/views/OrderSuccess.ts`

**Назначение:** сообщение об успешной оплате.

**Конструктор:**

* `constructor(events: IEvents, container: HTMLElement)`

**Поля:**

* `titleElement: HTMLElement`
* `descriptionElement: HTMLElement`
* `closeButton: HTMLButtonElement`

**События:**

* эмитит `success:closed`

**Сеттеры:**

* `set total(value: number)`

---

## События приложения

### События от View (UI)

* `basket:open`
* `modal:close`
* `card:open` `{ card: string }`
* `card:add` `{ card: string }`
* `card:delete` `{ card: string }`
* `basket:ready`
* `order:change` `{ field: string, value: string }`
* `order:next`
* `contacts:submit`
* `success:closed`

### События от Models

* `catalog:changed` `{ products: IProduct[] }`
* `product:selected` `{ product: IProduct | null }`
* `basket:changed` `{ items, count, total }` (payload из `Cart`)
* `customer:changed` `{ customer }`
* `form:errors` `CustomerErrors`

---

## Презентер (Presenter)

Файл: `src/main.ts`.

**Назначение:** связывает Model и View:

* подписывается на события от моделей (`catalog:changed`, `basket:changed`, `product:selected`, …) и обновляет UI;
* подписывается на события от View (`card:*`, `basket:*`, `order:*`, …) и вызывает методы моделей / открывает модальные окна;
* **не эмитит событий сам** — только обрабатывает;
* перерисовка выполняется при событиях изменения данных в моделях и при открытии модальных окон.

---

## Проверка работы

Ручная проверка сценариев в интерфейсе:

* каталог отображается после загрузки с сервера
* клик по карточке → открывается превью в модалке
* `price === null` → кнопка `Недоступно` и заблокирована
* корзина: список/пустая, total, кнопка оформления disabled при пустой корзине
* оформление: 2 шага, ошибки, кнопки disabled пока форма невалидна
* модалки закрываются по оверлею и крестику, не скроллятся
