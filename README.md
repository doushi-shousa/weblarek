# Проектная работа «Веб-ларёк» (Web-Larёk)

Стек: **HTML**, **SCSS**, **TypeScript**, **Vite**

Проект — интернет-магазин с товарами для веб-разработчиков. Реализована архитектура **MVP (Model-View-Presenter)**: слой данных (каталог, корзина, покупатель), слой представления (UI-компоненты) и слой логики (Presenter в `main.ts`) + коммуникация с сервером через API-клиент.

---

## Структура проекта

- `src/` — исходные файлы проекта
- `src/components/` — компоненты приложения
- `src/components/base/` — базовый код (Api, EventEmitter, Component и т.д.)
- `src/components/models/` — модели данных и коммуникационный клиент
- `src/components/views/` — компоненты представления (UI)
- `src/types/index.ts` — типы и интерфейсы
- `src/utils/` — константы и утилиты
- `src/scss/styles.scss` — корневой файл стилей
- `src/main.ts` — точка входа приложения (**Presenter**)

Важные файлы:
- `index.html` — HTML-файл главной страницы (включая `<template>` для компонентов)
- `src/types/index.ts` — файл с типами
- `src/main.ts` — точка входа приложения (Presenter)
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — файл с константами (в т.ч. адрес API и `categoryMap`)

---

## Установка и запуск

### 1) Установка зависимостей

```bash
npm install
или

bash
Копировать код
yarn
2) Переменные окружения (.env)
Создайте файл .env в корне проекта и добавьте:

env
Копировать код
VITE_API_ORIGIN=https://larek-api.nomoreparties.co
Важно: адрес указывается без слеша в конце.
Полные пути запросов берутся из констант (например, src/utils/constants.ts).

3) Запуск в режиме разработки
bash
Копировать код
npm run dev
или

bash
Копировать код
yarn dev
Сборка
bash
Копировать код
npm run build
или

bash
Копировать код
yarn build
Интернет-магазин «Web-Larёk»
«Web-Larёk» — интернет-магазин, где пользователи могут просматривать каталог товаров, добавлять товары в корзину и оформлять заказы. В интерфейсе используются модальные окна для просмотра карточек товара, корзины и форм оформления заказа.

Архитектура приложения
Код приложения разделён на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает чёткое разделение ответственности:

Model — слой данных: хранение состояния и операции над данными.

View — слой представления: отображение данных на странице, генерация событий пользовательских действий.

Presenter — слой логики: связывает View и Model, подписывается на события и управляет сценарием приложения.

Взаимодействие между классами обеспечивается событийно-ориентированным подходом: модели и представления генерируют события, а презентер подписывается на них и реагирует, вызывая методы моделей/представлений.

Базовый код
Класс Component
Базовый класс для всех компонентов интерфейса. Класс является дженериком и принимает в T тип данных, которые могут быть переданы в метод render.

Конструктор:
constructor(container: HTMLElement) — принимает DOM-элемент, за отображение которого отвечает компонент.

Поля:

container: HTMLElement — корневой DOM-элемент компонента.

Методы:

render(data?: Partial<T>): HTMLElement — принимает данные для отображения, записывает их в поля класса и возвращает DOM-элемент.

setImage(element: HTMLImageElement, src: string, alt?: string): void — утилитарный метод для установки изображения.

Класс Api
Содержит базовую логику отправки запросов.

Конструктор:
constructor(baseUrl: string, options: RequestInit = {})

Поля:

baseUrl: string — базовый адрес сервера

options: RequestInit — настройки запросов

Методы:

get(uri: string): Promise<object> — GET запрос на эндпоинт

post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object> — отправка данных на эндпоинт

handleResponse(response: Response): Promise<object> — проверка ответа сервера и преобразование в объект/ошибку

Класс EventEmitter
Брокер событий реализует паттерн «Наблюдатель», позволяя отправлять события и подписываться на них.

Поля:

_events: Map<string | RegExp, Set<Function>> — хранилище подписок на события.

Методы:

on<T extends object>(event: EventName, callback: (data: T) => void): void — подписка на событие

emit<T extends object>(event: string, data?: T): void — генерация события

trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void — фабрика обработчика события

Данные
Типы и интерфейсы описаны в src/types/index.ts.

TPayment
Способ оплаты:

ts
Копировать код
export type TPayment = 'cash' | 'card';
IProduct
Данные товара:

ts
Копировать код
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
price может быть null — такой товар в UI считается недоступным для покупки.

ICustomer
Данные покупателя:

ts
Копировать код
export interface ICustomer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
Внутри модели Customer поле payment хранится как TPayment | null, пока пользователь не выберет способ оплаты (удобно для валидации).

IOrderRequest
Данные, отправляемые при оформлении заказа (POST /order/):

ts
Копировать код
export interface IOrderRequest extends ICustomer {
  items: string[];
  total: number;
}
items — массив идентификаторов товаров (id), которые входят в заказ
total — итоговая сумма заказа

IOrderResponse
Ответ сервера при успешном оформлении заказа:

ts
Копировать код
export interface IOrderResponse {
  id: string;
  total: number;
}
Модели данных
Модели данных отвечают только за хранение и управление данными. Они не работают с DOM и не зависят от UI.

Каталог товаров — Product
Файл: src/components/models/Product.ts

Назначение: хранит массив товаров каталога и выбранный товар для детального отображения.

Конструктор:
constructor(events?: IEvents)

Поля:

selected: IProduct | null

products: IProduct[]

Методы:

getSelected(): IProduct | null

getProducts(): IProduct[]

setSelected(product: IProduct | null): void — эмитит product:selected

setProducts(products: IProduct[]): void — эмитит catalog:changed

getProductById(id: string): IProduct | undefined

Корзина — Cart
Файл: src/components/models/Cart.ts

Назначение: хранит товары, выбранные для покупки.

Конструктор:
constructor(events?: IEvents)

Поля:

items: IProduct[]

Методы:

getItems(): IProduct[]

hasItem(productId: string): boolean

addItem(product: IProduct): void — эмитит basket:changed

removeItemById(productId: string): void — эмитит basket:changed

clear(): void — эмитит basket:changed

getTotal(): number

getCount(): number

Покупатель — Customer
Файл: src/components/models/Customer.ts

Назначение: хранит данные покупателя, умеет очищать и валидировать поля.

Типы:

CustomerState = Omit<ICustomer, 'payment'> & { payment: TPayment | null }

CustomerErrors = Partial<Record<keyof CustomerState, string>>

Конструктор:
constructor(events?: IEvents)

Поля:

_payment: TPayment | null

_address: string

_email: string

_phone: string

Методы:

setCustomerInfo(data: Partial<CustomerState>): void — эмитит customer:changed, вызывает валидацию

getCustomerInfo(): CustomerState

clearCustomerInfo(): void — эмитит customer:changed, вызывает валидацию

validateCustomerInfo(): CustomerErrors — эмитит form:errors

Слой коммуникации
ApiClient
Файл: src/components/models/ApiClient.ts

Назначение: изолирует сетевое взаимодействие с сервером и предоставляет методы получения каталога и отправки заказа.

Конструктор:

constructor(api: IApi)

Методы:

fetchProducts(): Promise<IProduct[]> — GET /product/, возвращает items

sendOrder(order: IOrderRequest): Promise<IOrderResponse> — POST /order/

Слой представления (View)
View-компоненты отвечают только за DOM и пользовательские действия. Данные не хранят.

Gallery
Файл: src/components/views/Gallery.ts

Назначение: контейнер каталога на главной странице.

Конструктор:
constructor(container?: HTMLElement)

Поля:

catalogElement: HTMLElement

Методы/сеттеры:

set catalog(items: HTMLElement[]): void

Header
Файл: src/components/views/Header.ts

Назначение: шапка, кнопка корзины и счётчик товаров.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

counterElement: HTMLElement

basketButton: HTMLButtonElement

События:

эмитит basket:open

Методы/сеттеры:

set counter(value: number): void

Modal
Файл: src/components/views/Modal.ts

Назначение: модальное окно (не имеет наследников).

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

closeButton: HTMLButtonElement

contentElement: HTMLElement

События:

эмитит modal:close (клик по оверлею / крестику)

Методы/сеттеры:

open(): void

close(): void

set content(element: HTMLElement): void

Basket
Файл: src/components/views/Basket.ts

Назначение: отображение корзины.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

listElements: HTMLElement

priceElements: HTMLElement

basketButton: HTMLButtonElement

События:

эмитит basket:ready

Методы/сеттеры:

set items(elements: HTMLElement[]): void

set total(value: number): void

Карточки (общий родитель Card)
Card
Файл: src/components/views/Card.ts

Назначение: базовая карточка товара (id, title, price).

Конструктор:
constructor(container: HTMLElement)

Поля:

titleElement: HTMLElement

priceElement: HTMLElement

Методы/сеттеры:

set id(value: string): void

set title(value: string): void

set price(value: number | null): void

CardCatalog
Файл: src/components/views/CardCatalog.ts

Назначение: карточка товара в каталоге.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

categoryElement: HTMLElement

imageElement: HTMLImageElement

События:

эмитит card:open

Методы/сеттеры:

set category(value: string): void

set image(value: string): void

CardPreview
Файл: src/components/views/CardPreview.ts

Назначение: карточка товара для просмотра (в модальном окне).

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

categoryElement: HTMLElement

imageElement: HTMLImageElement

descriptionElement: HTMLElement

cardButton: HTMLButtonElement

События:

эмитит card:add

эмитит card:delete

Методы/сеттеры:

set category(value: string): void

set image(value: string): void

set description(value: string): void

set inCart(value: boolean): void

disableButton(): void — выставляет Недоступно и блокирует кнопку

CardBasket
Файл: src/components/views/CardBasket.ts

Назначение: элемент товара в корзине.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

indexElement: HTMLElement

itemDeleteButton: HTMLButtonElement

События:

эмитит card:delete

Методы/сеттеры:

set index(value: number): void

Формы (общий родитель Form)
Form
Файл: src/components/views/Form.ts

Назначение: базовый класс формы (кнопка, ошибки, инпуты). Не содержит сценарной логики.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

formElement: HTMLFormElement

formErrors: HTMLElement

nextButton: HTMLButtonElement

formInputs: HTMLInputElement[]

Методы/сеттеры:

set isButtonValid(value: boolean): void

set errors(text: string): void

OrderForm
Файл: src/components/views/OrderForm.ts

Назначение: шаг 1 оформления (способ оплаты + адрес).

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

addressElement: HTMLInputElement

cashButton: HTMLButtonElement

cardButton: HTMLButtonElement

События:

эмитит order:change

эмитит order:next

Методы/сеттеры:

set payment(value: TPayment): void

set addressValue(value: string): void

validateForm(errors: IError): void

ContactsForm
Файл: src/components/views/ContactsForm.ts

Назначение: шаг 2 оформления (email + телефон).

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

emailElement: HTMLInputElement

phoneElement: HTMLInputElement

События:

эмитит order:change

эмитит contacts:submit

Методы/сеттеры:

set emailValue(value: string): void

set phoneValue(value: string): void

validateForm(errors: IError): void

OrderSuccess
Файл: src/components/views/OrderSuccess.ts

Назначение: отображение сообщения об успешной оплате.

Конструктор:
constructor(events: IEvents, container: HTMLElement)

Поля:

titleElement: HTMLElement

descriptionElement: HTMLElement

closeButton: HTMLButtonElement

События:

эмитит success:closed

Методы/сеттеры:

set total(value: number): void

События приложения
События от View (UI)
basket:open

modal:close

card:open { card: string }

card:add { card: string }

card:delete { card: string }

basket:ready

order:change { field: string, value: string }

order:next

contacts:submit

success:closed

События от Models
catalog:changed { products: IProduct[] }

product:selected { product: IProduct | null }

basket:changed { items, count, total } (payload из Cart)

customer:changed { customer }

form:errors CustomerErrors

Презентер (Presenter)
Файл: src/main.ts

Назначение: связывает Model и View.

подписывается на события от моделей (catalog:changed, basket:changed, product:selected, …) и обновляет UI;

подписывается на события от View (card:*, basket:*, order:*, …) и вызывает методы моделей/открывает модальные окна;

не эмитит событий сам — только обрабатывает;

перерисовка выполняется при событиях изменения данных в моделях и при открытии модальных окон.

Проверка работы
Ручная проверка сценариев в интерфейсе:

каталог отображается после загрузки с сервера

клик по карточке → открывается превью в модалке

price === null → кнопка Недоступно и заблокирована

корзина: список/пустая, total, кнопка оформления disabled при пустой корзине

оформление: 2 шага, ошибки, кнопки disabled пока форма невалидна

модалки закрываются по оверлею и крестику, не скроллятся