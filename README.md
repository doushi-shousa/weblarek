# Проектная работа «Web‑Larёk»

Стек: **HTML**, **SCSS**, **TypeScript**, **Vite**

**Web‑Larёk** — интернет‑магазин с товарами для веб‑разработчиков. Приложение построено по архитектуре **MVP (Model–View–Presenter)**: состояние хранится в моделях, UI отвечает за отображение и генерацию событий, а вся логика сценариев находится в `main.ts` (Presenter). Взаимодействие между слоями реализовано через `EventEmitter`.

---

## Структура проекта

* `src/` — исходные файлы проекта
* `src/components/` — компоненты приложения
* `src/components/base/` — базовый код (Api, EventEmitter, Component, утилиты)
* `src/components/models/` — модели данных и API‑клиент
* `src/components/views/` — компоненты представления (UI)
* `src/types/index.ts` — типы и интерфейсы
* `src/utils/` — константы и утилиты
* `src/scss/styles.scss` — корневой файл стилей
* `src/main.ts` — точка входа приложения (**Presenter**)

Важные файлы:

* `index.html` — главная страница (включая `<template>` для компонентов)
* `src/utils/constants.ts` — константы (в т.ч. `API_URL`, `CDN_URL`, `categoryMap`)

---

## Установка и запуск

### 1) Установка зависимостей

```bash
npm install
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

---

## Сборка

```bash
npm run build
```

---

## Архитектура MVP

Приложение разделено на слои:

* **Model** — хранит состояние и бизнес‑операции, **не взаимодействует с DOM**, эмитит события при изменении данных.
* **View** — отвечает только за DOM и пользовательские действия: рендерит, слушает DOM‑события и эмитит события наверх. **Представления не хранят доменные данные.**
* **Presenter** (`src/main.ts`) — связывает модели и представления: подписывается на события и управляет сценариями (открытие модалок, обновление UI, запросы к API).

Взаимодействие событийное: модели и представления эмитят события через `EventEmitter`, а презентер их обрабатывает.

---

## Базовый код

### `Component<T>`

Базовый класс UI‑компонентов.

* `constructor(container: HTMLElement)`
* `render(data?: Partial<T>): HTMLElement` — применяет данные (через сеттеры) и возвращает `container`
* `setImage(element: HTMLImageElement, src: string, alt?: string): void`

### `Api`

Базовый класс для HTTP‑запросов.

* `constructor(baseUrl: string, options: RequestInit = {})`
* `get<T extends object>(uri: string): Promise<T>`
* `post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>`

### `EventEmitter`

Брокер событий (паттерн «Наблюдатель»).

* `on<T extends object>(event: EventName, callback: (data: T) => void): void`
* `emit<T extends object>(event: string, data?: T): void`
* `trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void`

---

## Типы и данные

Типы описаны в `src/types/index.ts`.

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

* хранит каталог и выбранный товар
* эмитит:

  * `catalog:changed`
  * `product:selected`

Ключевые методы:

* `setProducts(products: IProduct[]): void`
* `setSelected(product: IProduct | null): void`
* `getProductById(id: string): IProduct | undefined`

### `Cart`

Файл: `src/components/models/Cart.ts`

* хранит товары корзины
* эмитит `basket:changed`

Ключевые методы:

* `addItem(product: IProduct): void`
* `removeItemById(productId: string): void`
* `clear(): void`
* `getCount(): number`
* `getTotal(): number`

### `Customer`

Файл: `src/components/models/Customer.ts`

* хранит данные покупателя
* выполняет валидацию
* эмитит:

  * `customer:changed`
  * `form:errors`

Ключевые методы:

* `setCustomerInfo(data: Partial<CustomerState>): void`
* `clearCustomerInfo(): void`
* `validateCustomerInfo(): CustomerErrors`

---

## Слой коммуникации

### `ApiClient`

Файл: `src/components/models/ApiClient.ts`

* `fetchProducts(): Promise<IProduct[]>` — GET `/product/` (возвращает `items`)
* `sendOrder(order: IOrderRequest): Promise<IOrderResponse>` — POST `/order/`

---

## Представления (View)

View‑компоненты отвечают только за DOM и пользовательские действия: **не хранят состояние домена** и **не принимают бизнес‑решения**.

### Основные компоненты

* `Gallery` — контейнер каталога
* `Header` — шапка и кнопка корзины (эмитит `basket:open`)
* `Modal` — модальное окно (эмитит `modal:close`)
* `Basket` — отображение корзины (эмитит `basket:ready`)
* карточки:

  * `Card` (база)
  * `CardCatalog` (каталог, эмитит `card:open`)
  * `CardPreview` (превью, эмитит `card:add` / `card:delete`)
  * `CardBasket` (строка корзины, эмитит `card:delete`)
* формы:

  * `Form` (база)
  * `OrderForm` (шаг 1: оплата + адрес, эмитит `order:change`, `order:next`)
  * `ContactsForm` (шаг 2: email + телефон, эмитит `order:change`, `contacts:submit`)
* `OrderSuccess` — сообщение об успешном заказе (эмитит `success:closed`)

> Примечание: формы не перерисовывают себя целиком. Они получают от презентера ошибки валидации и обновляют только отображение ошибок и доступность submit‑кнопки.

---

## События приложения

### События от View

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
* `basket:changed` `{ items, count, total }`
* `customer:changed` `{ customer }`
* `form:errors` `CustomerErrors`

---

## Presenter

Файл: `src/main.ts`

`main.ts` связывает Model и View:

* подписывается на события моделей и обновляет UI
* подписывается на события View и вызывает методы моделей / открывает модальные окна
* представления создаются **один раз** и переиспользуются (формы/модалки/шапка)

---

## Проверка работы

Ручная проверка основных сценариев:

* каталог отображается после загрузки с сервера
* клик по карточке → открывается превью в модалке
* `price === null` → кнопка `Недоступно` и заблокирована
* корзина: список/пустая, `total`, кнопка оформления disabled при пустой корзине
* оформление: 2 шага, ошибки, кнопки disabled пока форма невалидна
* модалки закрываются по оверлею и крестику, фон не скроллится
