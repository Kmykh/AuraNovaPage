# AURA NOVA — API FRONTEND CONTRACT

## 1. Información general
- **Backend**: .NET 8
- **API**: ASP.NET Core Web API
- **Producción**: `https://auranova-backend.onrender.com`
- **Base URL**: `https://auranova-backend.onrender.com`

## 2. Arquitectura de integración
Frontend Next.js
        ↓
Aura Nova API
        ↓
Supabase PostgreSQL
        +
Supabase Storage

## 3. Base URL
- **Production**: `https://auranova-backend.onrender.com`
- **Development**: `https://localhost:7152`

## 4. Authentication
**POST /api/Auth/login**
- **Request**: `LoginRequest` (`{ email, password }`)
- **Response**: `AuthResponse`
El backend devolverá un token JWT.
Para consumir rutas protegidas, el Frontend debe enviar el header:
`Authorization: Bearer <token>`

## 5. Authorization
| Área | Acceso | JWT | Role |
|------|--------|-----|------|
| `/api/admin/*` | Admin | Required | Admin |
| `/api/products` | Public | - | - |
| `/api/orders` (Crear) | Public | - | - |
| `/api/tracking` | Public | - | - |
| `/api/health` | Public | - | - |
| `/api/delivery-zones` | Public | - | - |
| `/api/meeting-points` | Public | - | - |
| `/api/payment-info` | Public | - | - |
| `/api/business-settings`| Public | - | - |

## 6. Rate Limiting
Valores configurados en el backend:
- `login_policy`: 5 req / 1 min
- `tracking_policy`: 30 req / 1 min
- `create_order_policy`: 20 req / 1 min
- `evidence_upload_policy`: 5 req / 10 min
- `accept_quote_policy`: 10 req / 1 min
- `admin_policy`: 100 req / 1 min

## 7. HTTP Errors
El backend usa `ProblemDetails` estándar de ASP.NET.
- **400 Bad Request**: Validación fallida o lógica de negocio incorrecta.
- **401 Unauthorized**: JWT ausente, expirado o inválido.
- **403 Forbidden**: JWT válido pero sin rol `Admin`.
- **404 Not Found**: Recurso no existe.
- **409 Conflict**: Conflicto de estado (ej. intentar pagar algo ya pagado).
- **413 Payload Too Large**: Archivo subido excede el límite.
- **415 Unsupported Media Type**: Formato de archivo no soportado.
- **429 Too Many Requests**: Límite de peticiones excedido.
- **500 Internal Server Error**: Excepción no controlada.

## 8. Common Types
- `PagedResponse<T>`: Contiene `items`, `page`, `pageSize`, `totalItems`, `totalPages`, `hasNextPage`, `hasPreviousPage`.
- `ProblemDetails`: `{ type, title, status, detail, instance, extensions }`
- `Guid`: String UUID estándar (ej. `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`).
- `DateTimeOffset`: Cadena ISO 8601 (ej. `"2026-08-16T12:00:00Z"`).
- `decimal`: En JSON será enviado y recibido como un `number` (ej. `15.50`).

## 9. ENUMS
La API serializa los enums como **INTEGER**. Frontend envía y recibe números.

### DeliveryType
- `0`: Delivery
- `1`: MeetingPoint
- `2`: NationalShipping

### OrderStatus
- `0`: WaitingQuote
- `1`: QuoteReady
- `2`: WaitingPayment
- `3`: PaymentReported
- `4`: PaymentConfirmed
- `5`: Preparing
- `6`: Ready
- `7`: Shipped
- `8`: Delivered
- `9`: Cancelled

### QuoteStatus
- `0`: Pending
- `1`: Ready
- `2`: Rejected

### PaymentMethod
- `0`: Yape

### PaymentStatus
- `0`: Pending
- `1`: Reported
- `2`: Confirmed
- `3`: Rejected

### NotificationType
- `0`: OrderCreated
- `1`: QuoteReady
- `2`: PaymentReported
- `3`: PaymentConfirmed
- `4`: PaymentRejected
- `5`: OrderPreparing
- `6`: OrderReady
- `7`: OrderShipped
- `8`: OrderDelivered
- `9`: OrderCancelled

### NotificationChannel
- `0`: WhatsApp

### NotificationStatus
- `0`: Generated
- `1`: Opened
- `2`: Sent
- `3`: Failed

## 10. PRODUCTS
**Public**
- `GET /api/products`: Lista productos disponibles. Retorna `Array<ProductResponse>`.
- `GET /api/products/{id}`: Detalle de producto. Retorna `ProductResponse`.

**Admin**
- `POST /api/admin/products`: Crea producto. Requiere Auth. Request: `CreateProductRequest`. Response: `ProductResponse`.
- `GET /api/admin/products`: Lista todos los productos. Requiere Auth. Response: `Array<ProductResponse>`.
- `GET /api/admin/products/{id}`: Detalle (incluso inactivos). Requiere Auth. Response: `ProductResponse`.
- `PUT /api/admin/products/{id}`: Actualiza datos básicos. Requiere Auth. Request: `UpdateProductRequest`. Response: `ProductResponse`.
- `PATCH /api/admin/products/{id}/stock`: Actualiza stock. Requiere Auth. Request: `UpdateProductStockRequest`. Response: `{ message: string }`.
- `PATCH /api/admin/products/{id}/availability`: Activa/Desactiva. Requiere Auth. Request: `UpdateProductAvailabilityRequest`. Response: `{ message: string }`.

## 11. DELIVERY ZONES
- **Public**: `GET /api/delivery-zones` (Solo las `isActive == true`).
- **Admin**: `GET /api/admin/delivery-zones`, `POST ...`, `PUT .../{id}`. 
- Disponibilidad: `PATCH /api/admin/delivery-zones/{id}/availability` usando `UpdateAvailabilityRequest` (`{ isActive: boolean }`).

## 12. MEETING POINTS
- **Public**: `GET /api/meeting-points` (Solo `isActive == true`).
- **Admin**: Rutas idénticas a Delivery Zones, pero en `/api/admin/meeting-points`.
- Disponibilidad: Usa el mismo `UpdateAvailabilityRequest` (`{ isActive: boolean }`).

## 13. ORDERS
**POST /api/orders**
Crea un nuevo pedido. Recibe `CreateOrderRequest`.
- **FRONTEND ENVÍA**: `customer` (nombre, teléfono, correo), `items` (productId, cantidad), `delivery` (tipo, address, zonas, etc).
- **BACKEND CALCULA**: `subtotal`, `deliveryCost`, `total`, `status`, `orderCode`, `trackingToken`. (¡NO los envíes en el JSON!).

## 14. DELIVERY TYPES
Ejemplos de `delivery` (dentro de CreateOrderRequest):
- **Delivery**: `{ "type": 0, "deliveryZoneId": "guid-aqui", "deliveryAddress": "Av. Siempreviva 123" }`
- **MeetingPoint**: `{ "type": 1, "meetingPointId": "guid-aqui" }`
- **NationalShipping**: `{ "type": 2, "department": "Lima", "province": "Lima", "district": "Miraflores", "deliveryAddress": "Av. Larco" }`

## 15. QUOTES
Endpoints Admin:
- `GET /api/admin/quotes`: Lista cotizaciones.
- `GET /api/admin/quotes/{id}`: Detalle.
- `PATCH /api/admin/quotes/{id}`: Actualiza `shippingCost` y `notes`. Pasa a `QuoteReady`.

Endpoints Public:
- `POST /api/orders/{id}/accept-quote`: El cliente acepta la cotización. Pasa de `QuoteReady` a `WaitingPayment`.

## 16. PAYMENTS
- **Public**: `GET /api/payment-info` (Cuentas a depositar). `POST /api/orders/{orderId}/payment-evidence` (Sube voucher y reporta pago).
- **Admin**: `GET /api/admin/payments` (Lista), `GET /api/admin/payments/{id}` (Detalle), `PATCH /api/admin/payments/{id}/confirm`, `PATCH /api/admin/payments/{id}/reject`.

## 17. YAPE
`GET /api/payment-info` devuelve `PaymentInfoResponse`:
```json
{
  "yape": {
    "method": 0,
    "holderName": "Maycol Rojas",
    "phoneNumber": "999888777",
    "qrImageUrl": "https://supabase.../yape-qr.png"
  }
}
```

## 18. FILE UPLOADS
- **Payment Evidence**: `POST /api/orders/{orderId}/payment-evidence`. Field: `evidence` (multipart/form-data). MIME: `image/jpeg, image/png, image/webp` (Ext: `.jpg, .jpeg, .png, .webp`). Max Size: 5MB.
- **Yape QR**: `POST /api/admin/business-settings/yape-qr`. Field: `qr` (multipart/form-data). MIME: `image/jpeg, image/png, image/webp` (Ext: `.jpg, .jpeg, .png, .webp`). Max Size: 5MB.

## 19. TRACKING
`GET /api/public/orders/{orderCode}/tracking/{trackingToken}`
Requiere **exactamente** la combinación única. NO cambiar a ID.

## 20. ORDER STATUS FLOW
- **DELIVERY / MEETING POINT**: WaitingPayment → PaymentReported → PaymentConfirmed → Preparing → Ready → Delivered.
- **NATIONAL SHIPPING**: WaitingQuote → QuoteReady → WaitingPayment (al aceptar quote) → PaymentReported → PaymentConfirmed → Preparing → Ready → Shipped → Delivered.

## 21. DASHBOARD
`GET /api/admin/dashboard/summary` devuelve totales calculados: Pedidos pendientes, ingresos, etc (`DashboardSummaryResponse`).

## 22. ADMIN ORDERS
- `GET /api/admin/orders`: Listado (`PagedResponse<AdminOrderListItemResponse>`).
- `GET /api/admin/orders/{id}`: Detalle completo.
- `PATCH /api/admin/orders/{id}/status`: Cambia estado (`ChangeOrderStatusRequest`).
- `GET /api/admin/orders/{id}/status-history`: Array de cambios de estado pasados.

## 23. NOTIFICATIONS
- `GET /api/admin/orders/{orderId}/notifications`: Lista mensajes generados para la orden.
- `POST /api/admin/orders/{orderId}/notifications/{notificationId}/prepare-whatsapp`: Devuelve la URL de `wa.me`. 
**El Admin debe hacer clic para enviarlo**. Backend no envía WhatsApps automáticos.

## 24. BUSINESS SETTINGS
- **Public**: `GET /api/business-settings` (Retorna `PublicBusinessSettingsResponse`).
- **Admin**: `GET /api/admin/business-settings` (Retorna `AdminBusinessSettingsResponse`), `PUT ...` (`UpdateBusinessSettingsRequest`).

## 25. AUDIT LOGS
- `GET /api/admin/audit-logs`: `PagedResponse<AdminAuditLogResponse>`. Filtros disponibles por query params.

## 26. HEALTH
- `GET /api/health`: Chequeo rápido de que la API levanta.
- `GET /api/health/database`: Chequeo para monitoring (verifica conexión a DB).

## 27. RESPONSE DTOS COMPLETOS

### AuthResponse
- `Token`: string (Non-Nullable)
- `AdminName`: string (Non-Nullable)

### ProductResponse
- `Id`: Guid (Non-Nullable)
- `Name`: string (Non-Nullable)
- `Description`: string (Nullable)
- `Price`: decimal (Non-Nullable)
- `Stock`: int (Non-Nullable)
- `ImageUrl`: string (Nullable)
- `IsAvailable`: boolean (Non-Nullable)
- `CreatedAt`: DateTimeOffset (Non-Nullable)
- `UpdatedAt`: DateTimeOffset (Nullable)

### DeliveryZoneResponse
- `Id`: Guid
- `Name`: string
- `District`: string
- `Cost`: decimal
- `IsActive`: boolean
- `CreatedAt`: DateTimeOffset
- `UpdatedAt`: DateTimeOffset (Nullable)

### MeetingPointResponse
- `Id`: Guid
- `Name`: string
- `Address`: string
- `Cost`: decimal
- `IsActive`: boolean
- `CreatedAt`: DateTimeOffset
- `UpdatedAt`: DateTimeOffset (Nullable)

### CreateOrderResponse
- `Id`: Guid
- `OrderCode`: string
- `TrackingToken`: string
- `Status`: int (OrderStatus Enum)
- `Subtotal`: decimal
- `DeliveryCost`: decimal (Nullable)
- `Total`: decimal (Nullable)
- `CreatedAt`: DateTimeOffset

### PaymentInfoResponse
- `enabled`: boolean
- `method`: string (Ej. "Yape")
- `holderName`: string
- `qrImageUrl`: string (Nullable)
- `businessName`: string

### PaymentResponse
- `Id`: Guid
- `OrderId`: Guid
- `Method`: int (PaymentMethod)
- `Status`: int (PaymentStatus)
- `Amount`: decimal
- `EvidenceUrl`: string (Nullable)
- `CreatedAt`: DateTimeOffset

### AdminPaymentResponse
- `Id`: Guid
- `OrderId`: Guid
- `OrderCode`: string
- `CustomerName`: string
- `Method`: int
- `Status`: int
- `Amount`: decimal
- `CreatedAt`: DateTimeOffset

### AdminPaymentDetailResponse
Mismo que AdminPaymentResponse, más:
- `EvidenceUrl`: string (Nullable)
- `Notes`: string (Nullable)
- `ConfirmedAt`: DateTimeOffset (Nullable)

### QuoteResponse
- `Id`: Guid
- `OrderId`: Guid
- `OrderCode`: string
- `Status`: int (QuoteStatus Enum)
- `ShippingCost`: decimal (Nullable)
- `Notes`: string (Nullable)
- `CreatedAt`: DateTimeOffset
- `UpdatedAt`: DateTimeOffset (Nullable)

### PublicTrackingResponse
- `OrderCode`: string
- `Status`: int
- `Subtotal`: decimal
- `DeliveryCost`: decimal (Nullable)
- `Total`: decimal (Nullable)
- `CustomerName`: string
- `DeliveryType`: int
- `CreatedAt`: DateTimeOffset

### NotificationResponse
- `Id`: Guid
- `OrderId`: Guid
- `OrderCode`: string
- `Type`: int
- `Channel`: int
- `Status`: int
- `Recipient`: string
- `Message`: string
- `ChannelUrl`: string (Nullable)
- `CreatedAt`: DateTimeOffset

### WhatsAppPreparationResponse
- `NotificationId`: Guid
- `Status`: int
- `Phone`: string
- `Message`: string
- `WhatsappUrl`: string

### DashboardSummaryResponse
- `PendingOrders`: int
- `PendingPayments`: int
- `PendingQuotes`: int
- `TotalRevenue`: decimal
- `ActiveProducts`: int

### AdminOrderListItemResponse
- `Id`: Guid
- `OrderCode`: string
- `CustomerName`: string
- `Status`: int
- `Total`: decimal (Nullable)
- `CreatedAt`: DateTimeOffset

### AdminOrderDetailResponse
- `Id`: Guid
- `OrderCode`: string
- `TrackingToken`: string
- `Status`: int
- `Subtotal`: decimal
- `DeliveryCost`: decimal (Nullable)
- `Total`: decimal (Nullable)
- `CustomerName`: string
- `CustomerPhone`: string
- `CustomerEmail`: string
- `DeliveryType`: int
- `DeliveryAddress`: string (Nullable)
- `District`: string (Nullable)
- `Items`: Array de `{ ProductId, ProductName, Quantity, UnitPrice, Subtotal }`
- `CreatedAt`: DateTimeOffset

### OrderStatusChangeResponse
- `OrderId`: Guid
- `OldStatus`: int
- `NewStatus`: int
- `Comment`: string (Nullable)

### OrderStatusHistoryResponse
- `Id`: Guid
- `Status`: int
- `Comment`: string (Nullable)
- `CreatedAt`: DateTimeOffset

### PublicBusinessSettingsResponse
- `businessName`: string
- `whatsappNumber`: string
- `yape`: object
  - `holderName`: string
  - `qrImageUrl`: string (Nullable)
- `trackingBaseUrl`: string

### AdminBusinessSettingsResponse
- `BusinessName`: string
- `WhatsAppNumber`: string
- `YapeHolderName`: string
- `YapeQrImageUrl`: string (Nullable)
- `TrackingBaseUrl`: string

### AdminAuditLogResponse
- `Id`: Guid
- `AdminUserId`: Guid
- `AdminName`: string
- `Action`: string
- `EntityType`: string
- `EntityId`: string
- `Details`: string (JSON serializado)
- `IpAddress`: string
- `CreatedAt`: DateTimeOffset

### PagedResponse<T>
- `Items`: Array<T>
- `Page`: int
- `PageSize`: int
- `TotalItems`: int
- `TotalPages`: int
- `HasNextPage`: boolean
- `HasPreviousPage`: boolean


## 28. REQUEST DTOS COMPLETOS

### LoginRequest
- `Email`: string (Required)
- `Password`: string (Required)

### CreateProductRequest
- `Name`: string (Required, MaxLength: 100)
- `Description`: string (Optional, MaxLength: 500)
- `Price`: decimal (Required, Min: 0)
- `Stock`: int (Required, Min: 0)
- `ImageUrl`: string (Optional)

### UpdateProductRequest
- `Name`: string (Required, MaxLength: 100)
- `Description`: string (Optional, MaxLength: 500)
- `Price`: decimal (Required, Min: 0)
- `ImageUrl`: string (Optional)

### UpdateProductStockRequest
- `Stock`: int (Required)

### UpdateProductAvailabilityRequest
- `IsAvailable`: boolean (Required)

### CreateDeliveryZoneRequest
- `Name`: string (Required)
- `District`: string (Required)
- `Cost`: decimal (Required)

### UpdateDeliveryZoneRequest
- `Name`: string (Required)
- `District`: string (Required)
- `Cost`: decimal (Required)

### CreateMeetingPointRequest
- `Name`: string (Required)
- `Address`: string (Required)
- `Cost`: decimal (Required)

### UpdateMeetingPointRequest
- (Mismos de CreateMeetingPointRequest)

### UpdateAvailabilityRequest
- `IsActive`: boolean (Required)

### CreateOrderRequest
- `Customer`: CreateOrderCustomerRequest (Required)
- `Items`: Array<CreateOrderItemRequest> (Required)
- `Delivery`: CreateOrderDeliveryRequest (Required)

### CreateOrderCustomerRequest
- `Name`: string (Required)
- `Phone`: string (Required)
- `Email`: string (Optional, Nullable)

### CreateOrderItemRequest
- `ProductId`: Guid (Required)
- `Quantity`: int (Required, Min: 1)

### CreateOrderDeliveryRequest
- `Type`: int (Required)
- `DeliveryZoneId`: Guid (Optional)
- `MeetingPointId`: Guid (Optional)
- `DeliveryAddress`: string (Optional)
- `Department`: string (Optional)
- `Province`: string (Optional)
- `District`: string (Optional)

### RejectPaymentRequest
- `Notes`: string (Optional)

### UpdateQuoteRequest
- `ShippingCost`: decimal (Required)
- `Notes`: string (Optional)

### ChangeOrderStatusRequest
- `Status`: int (Required)
- `Comment`: string (Optional)

### UpdateBusinessSettingsRequest
- `BusinessName`: string (Required)
- `WhatsAppNumber`: string (Required)
- `YapeHolderName`: string (Required)
- `TrackingBaseUrl`: string (Required)

## 29. WHAT FRONTEND SENDS
| Endpoint | Frontend Sends | Backend Calculates |
|----------|----------------|--------------------|
| POST `/api/orders` | `customer`, `items`, `delivery` info | `subtotal`, `deliveryCost`, `total`, `status`, tokens |
| POST `/api/orders/{id}/accept-quote` | Nada | `status` (pasa a WaitingPayment) |
| POST `/api/orders/{id}/payment-evidence` | Form Data (`file`) | Uploads file to Supabase, generates URL, status to Reported |
| PUT `/api/admin/business-settings` | Valores directos | Actualiza base de datos |

## 30. WHAT FRONTEND RECEIVES
*(Mapeados exactamente en la sección 27, con propiedades completas)*.

## 31. ENDPOINTS NO EXISTENTES
- `GET /api/public/delivery-zones`
- `GET /api/public/meeting-points`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/chart`
- `DELETE /api/admin/products`
- `GET /api/admin/payments/{orderId}/verify`

## 32. FRONTEND IMPLEMENTATION NOTES
Para Next.js:
- **Enums**: Utiliza `0, 1, 2` en el payload JSON.
- **Dates**: Convierte ISO strings devueltos a objetos `Date` locales (`new Date(res.createdAt)`).
- **Multipart**: Usa `FormData` nativo para envíos de archivos y omite el header `Content-Type` (fetch lo asigna solo).
- **Pagination**: Aprovecha los parámetros devueltos para componentes paginadores automáticos.
- **ProblemDetails**: Intercepta respuestas `!res.ok`, lee el JSON como `ProblemDetails` y renderiza el campo `detail`.

## 33. API MODULE MAP
- **Auth**: `/api/Auth`
- **Products**: `/api/products`, `/api/admin/products`
- **Orders**: `/api/orders`, `/api/admin/orders`
- **Delivery**: `/api/delivery-zones`, `/api/admin/delivery-zones`
- **MeetingPoints**: `/api/meeting-points`, `/api/admin/meeting-points`
- **Quotes**: `/api/admin/quotes`
- **Payments**: `/api/payment-info`, `/api/admin/payments`
- **Tracking**: `/api/public/orders/{code}/tracking/{token}`
- **Notifications**: `/api/admin/orders/{id}/notifications`
- **BusinessSettings**: `/api/business-settings`, `/api/admin/business-settings`
- **Dashboard**: `/api/admin/dashboard/summary`
- **Audit**: `/api/admin/audit-logs`

## 34. FINAL CHECKLIST
- [x] Todos los endpoints documentados.
- [x] Todos los request DTOs.
- [x] Todos los response DTOs.
- [x] Todos los enums (Integer).
- [x] Auth correcto (Admin vs Public).
- [x] Rate limits correctos.
- [x] Uploads documentados.
- [x] Pagination.
- [x] Errors (ProblemDetails).
- [x] Tracking.
- [x] Yape.
- [x] BusinessSettings.
- [x] WhatsApp (Manual).
- [x] Admin endpoints.
- [x] Public endpoints.
