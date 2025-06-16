# Cellerhut API Documentation v2.0

## Overview

The Cellerhut API provides endpoints for managing a South African liquor store's e-commerce operations. This API is designed to be compatible with PickBazar frontend frameworks and follows RESTful principles.

**Base URL**: `https://cellerhut-api.vercel.app`
**Authentication**: Bearer Token (JWT)

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Orders](#orders)
5. [User Management](#user-management)
6. [Error Handling](#error-handling)
7. [Data Structures](#data-structures)

---

## Authentication

### Register User

**Endpoint**: `POST /auth/register`

**Description**: Register a new customer account.

**Request Body**:

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john.doe@example.com",
	"password": "securePassword123",
	"phone": "+27123456789"
}
```

**Response** (201 Created):

```json
{
	"status": "success",
	"message": "User registered successfully.",
	"data": {
		"user": {
			"id": 1,
			"name": "John Doe",
			"email": "john.doe@example.com",
			"is_active": true,
			"created_at": "2024-01-18T10:30:00Z",
			"updated_at": "2024-01-18T10:30:00Z",
			"profile": {
				"avatar": null,
				"phone": "+27123456789"
			},
			"address": [],
			"permissions": [
				{
					"id": 1,
					"name": "customer",
					"guard_name": "api"
				}
			]
		}
	}
}
```

### Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and receive access token.

**Request Body**:

```json
{
	"email": "john.doe@example.com",
	"password": "securePassword123"
}
```

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Logged in successfully.",
	"data": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"permissions": ["customer"],
		"role": "customer",
		"user": {
			"id": 1,
			"name": "John Doe",
			"email": "john.doe@example.com",
			"is_active": true,
			"created_at": "2024-01-18T10:30:00Z",
			"updated_at": "2024-01-18T10:30:00Z",
			"profile": {
				"avatar": null,
				"phone": "+27123456789"
			},
			"address": [
				{
					"id": 1,
					"street": "123 Main Road",
					"city": "Cape Town",
					"province": "Western Cape",
					"postal_code": "8001",
					"is_default": true
				}
			],
			"permissions": [
				{
					"id": 1,
					"name": "customer",
					"guard_name": "api"
				}
			]
		}
	}
}
```

### Get User Profile

**Endpoint**: `GET /auth/profile`

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Profile fetched successfully.",
	"data": {
		"id": 1,
		"name": "John Doe",
		"email": "john.doe@example.com",
		"is_active": true,
		"created_at": "2024-01-18T10:30:00Z",
		"updated_at": "2024-01-18T10:30:00Z",
		"profile": {
			"avatar": "https://cdn.cellerhut.com/avatars/user1.jpg",
			"phone": "+27123456789"
		},
		"address": [
			{
				"id": 1,
				"street": "123 Main Road",
				"city": "Cape Town",
				"province": "Western Cape",
				"postal_code": "8001",
				"is_default": true
			}
		]
	}
}
```

---

## Products

### Get Products (Paginated)

**Endpoint**: `GET /products`

**Description**: Retrieve a paginated list of products with optional filtering.

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 15, max: 50)
- `search` (string, optional): Search term for product names
- `category` (string, optional): Filter by category name
- `status` (string, optional): Filter by status (`publish`, `draft`)

**Example Request**: `GET /products?page=1&limit=15&search=wine&category=Red Wines`

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Products retrieved successfully.",
	"data": {
		"data": [
			{
				"id": 1,
				"name": "Kanonkop Pinotage 2020",
				"slug": "kanonkop-pinotage-2020",
				"description": "Award-winning South African Pinotage with rich berry flavors and smooth tannins.",
				"image": {
					"id": 1,
					"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage.jpg",
					"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage.jpg"
				},
				"gallery": [
					{
						"id": 2,
						"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage-2.jpg",
						"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage-2.jpg"
					}
				],
				"price": 450.0,
				"sale_price": 399.0,
				"sku": "KAN-PIN-2020",
				"quantity": 24,
				"in_stock": true,
				"is_taxable": true,
				"status": "publish",
				"ratings": 4.5,
				"unit": "bottle",
				"category": {
					"id": 11,
					"name": "Red Wines",
					"slug": "red-wines"
				},
				"alcohol_content": 14.5,
				"volume": "750ml",
				"origin": "Stellenbosch, South Africa",
				"vintage": 2020,
				"tasting_notes": ["dark berries", "spice", "smooth tannins"],
				"food_pairings": ["grilled meat", "game", "mature cheese"],
				"serving_temperature": "16-18°C",
				"age_restricted": true,
				"in_wishlist": false,
				"type": {
					"id": 1,
					"name": "Liquor",
					"slug": "liquor"
				},
				"created_at": "2024-01-15T09:00:00Z",
				"updated_at": "2024-01-18T10:30:00Z"
			}
		],
		"count": 1,
		"current_page": 1,
		"last_page": 5,
		"per_page": 15,
		"total": 73,
		"first_page_url": "https://api.cellerhut.com/products?page=1",
		"last_page_url": "https://api.cellerhut.com/products?page=5",
		"next_page_url": "https://api.cellerhut.com/products?page=2",
		"prev_page_url": null,
		"from": 1,
		"to": 15
	}
}
```

### Get Single Product

**Endpoint**: `GET /products/{id}`

**Description**: Retrieve detailed information about a specific product.

**Path Parameters**:

- `id` (integer, required): Product ID

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Product retrieved successfully.",
	"data": {
		"id": 1,
		"name": "Kanonkop Pinotage 2020",
		"slug": "kanonkop-pinotage-2020",
		"description": "Award-winning South African Pinotage with rich berry flavors and smooth tannins. This wine showcases the best of Stellenbosch terroir with its deep ruby color and complex flavor profile.",
		"image": {
			"id": 1,
			"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage.jpg",
			"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage.jpg"
		},
		"gallery": [
			{
				"id": 2,
				"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage-2.jpg",
				"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage-2.jpg"
			},
			{
				"id": 3,
				"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage-3.jpg",
				"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage-3.jpg"
			}
		],
		"price": 450.0,
		"sale_price": 399.0,
		"sku": "KAN-PIN-2020",
		"quantity": 24,
		"in_stock": true,
		"is_taxable": true,
		"status": "publish",
		"ratings": 4.5,
		"unit": "bottle",
		"category": {
			"id": 11,
			"name": "Red Wines",
			"slug": "red-wines"
		},
		"alcohol_content": 14.5,
		"volume": "750ml",
		"origin": "Stellenbosch, South Africa",
		"vintage": 2020,
		"tasting_notes": ["dark berries", "spice", "smooth tannins", "vanilla oak"],
		"food_pairings": ["grilled meat", "game", "mature cheese", "dark chocolate"],
		"serving_temperature": "16-18°C",
		"age_restricted": true,
		"in_wishlist": false,
		"type": {
			"id": 1,
			"name": "Liquor",
			"slug": "liquor"
		},
		"created_at": "2024-01-15T09:00:00Z",
		"updated_at": "2024-01-18T10:30:00Z"
	}
}
```

---

## Categories

### Get Categories

**Endpoint**: `GET /categories`

**Description**: Retrieve all product categories with hierarchical structure.

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Categories retrieved successfully.",
	"data": [
		{
			"id": 1,
			"name": "Wines",
			"slug": "wines",
			"image": {
				"id": 10,
				"original": "https://cdn.cellerhut.com/categories/wines.jpg",
				"thumbnail": "https://cdn.cellerhut.com/categories/thumbs/wines.jpg"
			},
			"icon": "wine-glass",
			"parent": null,
			"subcategories": [
				{
					"id": 11,
					"name": "Red Wines",
					"slug": "red-wines",
					"parent_id": 1
				},
				{
					"id": 12,
					"name": "White Wines",
					"slug": "white-wines",
					"parent_id": 1
				},
				{
					"id": 13,
					"name": "Rosé Wines",
					"slug": "rose-wines",
					"parent_id": 1
				},
				{
					"id": 14,
					"name": "Sparkling",
					"slug": "sparkling-wines",
					"parent_id": 1
				}
			],
			"created_at": "2024-01-15T09:00:00Z",
			"updated_at": "2024-01-18T10:30:00Z"
		},
		{
			"id": 2,
			"name": "Spirits",
			"slug": "spirits",
			"image": {
				"id": 11,
				"original": "https://cdn.cellerhut.com/categories/spirits.jpg",
				"thumbnail": "https://cdn.cellerhut.com/categories/thumbs/spirits.jpg"
			},
			"icon": "cocktail",
			"parent": null,
			"subcategories": [
				{
					"id": 21,
					"name": "Whisky",
					"slug": "whisky",
					"parent_id": 2
				},
				{
					"id": 22,
					"name": "Gin",
					"slug": "gin",
					"parent_id": 2
				},
				{
					"id": 23,
					"name": "Vodka",
					"slug": "vodka",
					"parent_id": 2
				},
				{
					"id": 24,
					"name": "Rum",
					"slug": "rum",
					"parent_id": 2
				}
			],
			"created_at": "2024-01-15T09:00:00Z",
			"updated_at": "2024-01-18T10:30:00Z"
		}
	]
}
```

---

## Orders

### Create Order from Cart

**Endpoint**: `POST /orders`

**Headers**: `Authorization: Bearer {token}`

**Description**: Create a new order from the user's shopping cart.

**Request Body**:

```json
{
	"addressId": 1,
	"paymentDetails": {
		"gateway": "STRIPE",
		"delivery_fee": 50.0,
		"sales_tax": 134.85
	}
}
```

**Response** (201 Created):

```json
{
	"status": "success",
	"message": "Order created successfully.",
	"data": {
		"id": 1001,
		"tracking_number": "CLH-1705665000123",
		"customer_id": 1,
		"order_status": "order-pending",
		"payment_status": "payment-pending",
		"payment_gateway": "STRIPE",
		"total": 1033.85,
		"sub_total": 849.0,
		"amount": 1033.85,
		"sales_tax": 134.85,
		"delivery_fee": 50.0,
		"delivery_time": "2024-01-20 14:00-18:00",
		"customer": {
			"id": 1,
			"name": "John Doe",
			"email": "john.doe@example.com",
			"is_active": true,
			"profile": {
				"avatar": null,
				"phone": "+27123456789"
			}
		},
		"billing_address": {
			"street_address": "123 Main Road",
			"city": "Cape Town",
			"state": "Western Cape",
			"zip": "8001",
			"country": "South Africa"
		},
		"shipping_address": {
			"street_address": "123 Main Road",
			"city": "Cape Town",
			"state": "Western Cape",
			"zip": "8001",
			"country": "South Africa"
		},
		"products": [
			{
				"id": 1,
				"name": "Kanonkop Pinotage 2020",
				"slug": "kanonkop-pinotage-2020",
				"price": 450.0,
				"sale_price": 399.0,
				"image": {
					"id": 1,
					"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage.jpg",
					"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage.jpg"
				},
				"pivot": {
					"order_id": 1001,
					"product_id": 1,
					"order_quantity": 2,
					"unit_price": 399.0,
					"subtotal": 798.0
				}
			}
		],
		"created_at": "2024-01-18T09:30:00Z",
		"updated_at": "2024-01-18T10:15:00Z"
	}
}
```

### Get User Orders

**Endpoint**: `GET /orders`

**Headers**: `Authorization: Bearer {token}`

**Description**: Retrieve all orders for the authenticated user.

**Query Parameters**:

- `status` (string, optional): Filter by order status
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10)

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Orders retrieved successfully.",
	"data": [
		{
			"id": 1001,
			"tracking_number": "CLH-1705665000123",
			"customer_id": 1,
			"order_status": "order-processing",
			"payment_status": "payment-success",
			"payment_gateway": "STRIPE",
			"total": 1033.85,
			"sub_total": 849.0,
			"amount": 1033.85,
			"sales_tax": 134.85,
			"delivery_fee": 50.0,
			"delivery_time": "2024-01-20 14:00-18:00",
			"customer": {
				"id": 1,
				"name": "John Doe",
				"email": "john.doe@example.com"
			},
			"products": [
				{
					"id": 1,
					"name": "Kanonkop Pinotage 2020",
					"price": 450.0,
					"sale_price": 399.0,
					"pivot": {
						"order_id": 1001,
						"product_id": 1,
						"order_quantity": 2,
						"unit_price": 399.0,
						"subtotal": 798.0
					}
				}
			],
			"created_at": "2024-01-18T09:30:00Z",
			"updated_at": "2024-01-18T10:15:00Z"
		}
	]
}
```

### Get Single Order

**Endpoint**: `GET /orders/{id}`

**Headers**: `Authorization: Bearer {token}`

**Description**: Retrieve detailed information about a specific order.

**Path Parameters**:

- `id` (integer, required): Order ID

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Order retrieved successfully.",
	"data": {
		"id": 1001,
		"tracking_number": "CLH-1705665000123",
		"customer_id": 1,
		"order_status": "order-processing",
		"payment_status": "payment-success",
		"payment_gateway": "STRIPE",
		"total": 1033.85,
		"sub_total": 849.0,
		"amount": 1033.85,
		"sales_tax": 134.85,
		"delivery_fee": 50.0,
		"delivery_time": "2024-01-20 14:00-18:00",
		"customer": {
			"id": 1,
			"name": "John Doe",
			"email": "john.doe@example.com",
			"is_active": true,
			"profile": {
				"avatar": null,
				"phone": "+27123456789"
			},
			"address": [
				{
					"id": 1,
					"street": "123 Main Road",
					"city": "Cape Town",
					"province": "Western Cape",
					"postal_code": "8001",
					"is_default": true
				}
			]
		},
		"billing_address": {
			"street_address": "123 Main Road",
			"city": "Cape Town",
			"state": "Western Cape",
			"zip": "8001",
			"country": "South Africa"
		},
		"shipping_address": {
			"street_address": "123 Main Road",
			"city": "Cape Town",
			"state": "Western Cape",
			"zip": "8001",
			"country": "South Africa"
		},
		"products": [
			{
				"id": 1,
				"name": "Kanonkop Pinotage 2020",
				"slug": "kanonkop-pinotage-2020",
				"description": "Award-winning South African Pinotage with rich berry flavors",
				"image": {
					"id": 1,
					"original": "https://cdn.cellerhut.com/products/kanonkop-pinotage.jpg",
					"thumbnail": "https://cdn.cellerhut.com/products/thumbs/kanonkop-pinotage.jpg"
				},
				"price": 450.0,
				"sale_price": 399.0,
				"sku": "KAN-PIN-2020",
				"alcohol_content": 14.5,
				"volume": "750ml",
				"origin": "Stellenbosch, South Africa",
				"vintage": 2020,
				"pivot": {
					"order_id": 1001,
					"product_id": 1,
					"order_quantity": 2,
					"unit_price": 399.0,
					"subtotal": 798.0
				}
			}
		],
		"created_at": "2024-01-18T09:30:00Z",
		"updated_at": "2024-01-18T10:15:00Z"
	}
}
```

---

## User Management

### Add Address

**Endpoint**: `POST /auth/addresses`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
	"street": "456 Oak Avenue",
	"city": "Johannesburg",
	"province": "Gauteng",
	"postal_code": "2000",
	"country": "South Africa",
	"is_default": false
}
```

**Response** (201 Created):

```json
{
	"status": "success",
	"message": "Address added successfully.",
	"data": {
		"id": 2,
		"street": "456 Oak Avenue",
		"city": "Johannesburg",
		"province": "Gauteng",
		"postal_code": "2000",
		"country": "South Africa",
		"is_default": false,
		"created_at": "2024-01-18T11:00:00Z",
		"updated_at": "2024-01-18T11:00:00Z"
	}
}
```

### Update Address

**Endpoint**: `PUT /auth/addresses/{id}`

**Headers**: `Authorization: Bearer {token}`

**Path Parameters**:

- `id` (integer, required): Address ID

**Request Body**:

```json
{
	"street": "456 Oak Avenue, Unit 5",
	"city": "Johannesburg",
	"province": "Gauteng",
	"postal_code": "2000",
	"country": "South Africa",
	"is_default": true
}
```

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Address updated successfully.",
	"data": {
		"id": 2,
		"street": "456 Oak Avenue, Unit 5",
		"city": "Johannesburg",
		"province": "Gauteng",
		"postal_code": "2000",
		"country": "South Africa",
		"is_default": true,
		"created_at": "2024-01-18T11:00:00Z",
		"updated_at": "2024-01-18T11:30:00Z"
	}
}
```

### Delete Address

**Endpoint**: `DELETE /auth/addresses/{id}`

**Headers**: `Authorization: Bearer {token}`

**Path Parameters**:

- `id` (integer, required): Address ID

**Response** (200 OK):

```json
{
	"status": "success",
	"message": "Address deleted successfully."
}
```

---

## Error Handling

### Error Response Format

All error responses follow this consistent format:

```json
{
	"status": "error",
	"message": "Error description",
	"errors": {
		"field_name": ["Specific error message"]
	}
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Example Error Responses

**Validation Error (422)**:

```json
{
	"status": "error",
	"message": "Validation failed",
	"errors": {
		"email": ["The email field is required."],
		"password": ["The password must be at least 8 characters."]
	}
}
```

**Authentication Error (401)**:

```json
{
	"status": "error",
	"message": "Invalid login credentials"
}
```

**Not Found Error (404)**:

```json
{
	"status": "error",
	"message": "Product not found"
}
```

---

## Data Structures

### Core Entity Pattern

All entities extend this base structure:

```typescript
interface CoreEntity {
	id: number
	created_at: string // ISO 8601 format
	updated_at: string // ISO 8601 format
}
```

### User Object

```typescript
interface User extends CoreEntity {
	name: string
	email: string
	is_active: boolean
	profile?: {
		avatar?: string
		phone?: string
	}
	address?: Address[]
	permissions?: Permission[]
}
```

### Product Object

```typescript
interface Product extends CoreEntity {
	name: string
	slug: string
	description: string
	image?: {
		id: number
		original: string
		thumbnail: string
	}
	gallery?: Array<{
		id: number
		original: string
		thumbnail: string
	}>
	price: number
	sale_price?: number
	sku?: string
	quantity: number
	in_stock: boolean
	is_taxable: boolean
	status: 'publish' | 'draft'
	ratings: number
	unit: string
	category?: {
		id: number
		name: string
		slug: string
	}
	// Liquor-specific fields
	alcohol_content?: number
	volume?: string
	origin?: string
	vintage?: number
	tasting_notes?: string[]
	food_pairings?: string[]
	serving_temperature?: string
	age_restricted: boolean
	in_wishlist: boolean
	type: {
		id: number
		name: string
		slug: string
	}
}
```

### Order Object

```typescript
interface Order extends CoreEntity {
	tracking_number: string
	customer_id: number
	order_status: OrderStatusType
	payment_status: PaymentStatusType
	payment_gateway: string
	total: number
	sub_total: number
	amount: number
	sales_tax: number
	delivery_fee: number
	delivery_time?: string
	customer: User
	billing_address?: Address
	shipping_address?: Address
	products: ProductWithPivot[]
}
```

### Order Status Enums

```typescript
enum OrderStatusType {
	PENDING = 'order-pending',
	PROCESSING = 'order-processing',
	AT_LOCAL_FACILITY = 'order-at-local-facility',
	OUT_FOR_DELIVERY = 'order-out-for-delivery',
	COMPLETED = 'order-completed',
	CANCELLED = 'order-cancelled',
	REFUNDED = 'order-refunded',
}

enum PaymentStatusType {
	PENDING = 'payment-pending',
	SUCCESS = 'payment-success',
	FAILED = 'payment-failed',
	REFUNDED = 'payment-refunded',
}
```

### Pagination Object

```typescript
interface PaginationResponse<T> {
	data: T[]
	count: number
	current_page: number
	last_page: number
	per_page: number
	total: number
	first_page_url: string
	last_page_url: string
	next_page_url?: string
	prev_page_url?: string
	from: number
	to: number
}
```

---

## Rate Limiting

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **Order creation**: 10 requests per minute per authenticated user

## CORS Policy

The API supports CORS for web applications. Allowed origins must be configured in the server settings.

## Changelog

### Version 2.0 (2024-01-18)

- Updated all models to use plural naming convention
- Implemented PickBazar-compatible data structures
- Added liquor-specific product fields
- Enhanced image structure with id, original, and thumbnail
- Improved error handling and response consistency
- Added comprehensive pagination support

---

**Support**: For API support, contact support@cellerhut.com
**Documentation Version**: 2.0
**Last Updated**: January 18, 2024
