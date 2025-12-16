# Проектная работа «Веб-ларёк» (Web-Larёk)

Стек: **HTML**, **SCSS**, **TypeScript**, **Vite**

Проект — интернет-магазин с товарами для веб-разработчиков. В этой части реализованы **модели данных** (каталог, корзина, покупатель) и **слой коммуникации** (API-клиент) + проверка работы через `console.log` в `main.ts`.

---

## Структура проекта

- `src/` — исходные файлы проекта
- `src/components/` — компоненты приложения
- `src/components/base/` — базовый код (Api, EventEmitter, Component и т.д.)
- `src/components/models/` — модели данных и коммуникационный клиент (мои классы спринта)
- `src/types/index.ts` — типы и интерфейсы
- `src/utils/` — константы и утилиты
- `src/scss/styles.scss` — корневой файл стилей
- `src/main.ts` — точка входа приложения (тут выполняется тестирование моделей и API)

Важные файлы:
- `index.html` — HTML-файл главной страницы
- `src/types/index.ts` — файл с типами
- `src/main.ts` — точка входа приложения
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — файл с константами (в т.ч. адрес API)
- `src/utils/data.ts` — мок-данные `apiProducts` для локального тестирования

---

## Установка и запуск

### 1) Установка зависимостей

```bash
npm install
````

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
> Полные пути запросов берутся из констант (например, `src/utils/constants.ts`).

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

# Интернет-магазин «Web-Larёk»

«Web-Larёk» — интернет-магазин, где пользователи могут просматривать каталог товаров, добавлять товары в корзину и оформлять заказы. В интерфейсе используются модальные окна для просмотра карточек товара, корзины и форм оформления заказа.

---

## Архитектура приложения

Код приложения разделён на слои согласно парадигме **MVP (Model-View-Presenter)**, которая обеспечивает чёткое разделение ответственности:

* **Model** — слой данных: хранение состояния и операции над данными.
* **View** — слой представления: отображение данных на странице.
* **Presenter** — слой логики: связывает View и Model, обрабатывает события и управляет сценарием приложения.

Взаимодействие между классами обеспечивается событийно-ориентированным подходом: модели и представления генерируют события, а презентер подписывается на них и реагирует, вызывая методы моделей/представлений.

---

## Базовый код

### Класс `Component`

Базовый класс для всех компонентов интерфейса. Класс является дженериком и принимает в `T` тип данных, которые могут быть переданы в метод `render`.

Конструктор:
`constructor(container: HTMLElement)` — принимает DOM-элемент, за отображение которого отвечает компонент.

Поля:

* `container: HTMLElement` — корневой DOM-элемент компонента.

Методы:

* `render(data?: Partial<T>): HTMLElement` — принимает данные для отображения, записывает их в поля класса и возвращает DOM-элемент.
* `setImage(element: HTMLImageElement, src: string, alt?: string): void` — утилитарный метод для установки изображения.

### Класс `Api`

Содержит базовую логику отправки запросов.

Конструктор:
`constructor(baseUrl: string, options: RequestInit = {})`

Поля:

* `baseUrl: string` — базовый адрес сервера
* `options: RequestInit` — настройки запросов

Методы:

* `get(uri: string): Promise<object>` — GET запрос на эндпоинт
* `post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` — отправка данных на эндпоинт
* `handleResponse(response: Response): Promise<object>` — проверка ответа сервера и преобразование в объект/ошибку

### Класс `EventEmitter`

Брокер событий реализует паттерн «Наблюдатель», позволяя отправлять события и подписываться на них.

Поля:

* `_events: Map<string | RegExp, Set<Function>>` — хранилище подписок на события.

Методы:

* `on<T extends object>(event: EventName, callback: (data: T) => void): void` — подписка на событие
* `emit<T extends object>(event: string, data?: T): void` — генерация события
* `trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` — фабрика обработчика события

---

## Данные

Типы и интерфейсы описаны в `src/types/index.ts`.

### `TPayment`

Способ оплаты:

```ts
export type TPayment = 'cash' | 'card';
```

### `IProduct`

Данные товара:

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

Данные покупателя:

```ts
export interface ICustomer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
```

> Внутри модели `Customer` поле `payment` хранится как `TPayment | null`, пока пользователь не выберет способ оплаты (удобно для валидации).

### `IOrderRequest`

Данные, отправляемые при оформлении заказа:

```ts
export interface IOrderRequest {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
```

### `IOrderResponse`

Ответ сервера при успешном оформлении заказа:

```ts
export interface IOrderResponse {
  id: string;
  total: number;
}
```

---

## Модели данных

Модели данных отвечают только за **хранение и управление данными**. Они не работают с DOM и не зависят от UI.

### Каталог товаров — `Product`

Файл: `src/components/models/Product.ts`

Назначение: хранит массив товаров каталога и выбранный товар для детального отображения.

Поля:

* `products: IProduct[]` — массив всех товаров
* `selected: IProduct | null` — выбранный товар

Методы:

* `setProducts(products: IProduct[]): void` — сохранить массив товаров
* `getProducts(): IProduct[]` — получить массив товаров
* `getProductById(id: string): IProduct | undefined` — найти товар по `id`
* `setSelected(product: IProduct): void` — сохранить выбранный товар
* `getSelected(): IProduct | null` — получить выбранный товар

### Корзина — `Cart`

Файл: `src/components/models/Cart.ts`

Назначение: хранит товары, выбранные для покупки.

Поля:

* `items: IProduct[]` — массив товаров в корзине

Методы:

* `getItems(): IProduct[]` — получить товары из корзины
* `addItem(product: IProduct): void` — добавить товар (без дубликатов)
* `removeItem(itemId: string): void` — удалить товар по `id`
* `clear(): void` — очистить корзину
* `getTotal(): number` — сумма всех товаров (если `price === null`, считается как `0`)
* `getCount(): number` — количество товаров
* `hasItem(productId: string): boolean` — проверить наличие товара по `id`

### Покупатель — `Customer`

Файл: `src/components/models/Customer.ts`

Назначение: хранит данные покупателя, умеет очищать и валидировать поля.

Типы:

* `CustomerState` — состояние покупателя (включая `payment: TPayment | null`)
* `CustomerErrors` — объект ошибок валидации (ключи — поля, значения — текст ошибки)

Поля:

* `_payment: TPayment | null`
* `_address: string`
* `_email: string`
* `_phone: string`

Методы:

* `setCustomerInfo(data: Partial<CustomerState>): void` — обновление данных частями (не затирает ранее заполненные поля)
* `getCustomerInfo(): CustomerState` — получить текущее состояние покупателя
* `clearCustomerInfo(): void` — очистить данные покупателя
* `validateCustomerInfo(): CustomerErrors` — валидация полей (поле валидно, если не пустое).
  Возвращает объект ошибок, где присутствуют только поля с ошибками.

---

## Слой коммуникации

### `ApiClient`

Файл: `src/components/models/ApiClient.ts`

Назначение: изолирует сетевое взаимодействие с сервером и предоставляет методы получения каталога и отправки заказа.

Конструктор:

* `constructor(api: IApi)` — принимает объект, реализующий `IApi`

Методы:

* `fetchProducts(): Promise<IProduct[]>` — GET `/product/`, возвращает массив товаров (`items`)
* `sendOrder(order: IOrderRequest): Promise<IOrderResponse>` — POST `/order/`, отправляет данные заказа и возвращает ответ сервера

---

## Проверка работы (main.ts)

В `src/main.ts` создаются экземпляры:

* `Product` — проверка сохранения каталога, выбора товара, поиска по id
* `Cart` — добавление/удаление, подсчёт количества и суммы, очистка
* `Customer` — заполнение, частичное обновление, валидация, очистка
* `ApiClient` — запрос каталога с сервера, сохранение массива в модель каталога и вывод в консоль

Проверка выполняется через `console.log` (по требованиям спринта).

---

```