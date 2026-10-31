# TechStore — Tienda en línea de computadoras y artículos tecnológicos

Proyecto full-stack de demostración: catálogo persistente en SQLite, carrito, checkout con validación de datos, revisión de compra y **pago intencionalmente deshabilitado**.

## Cómo ejecutar

```bash
cd techstore
python3 server.py
```

Abre en el navegador: **http://localhost:8080**

Requisitos: Python 3.8+ (solo biblioteca estándar: `sqlite3`, `http.server`).

## Arquitectura

```
techstore/
├── server.py          # Backend HTTP + API REST (stdlib)
├── sql/
│   ├── schema.sql     # Tablas: categories, products, orders...
│   └── seed.sql       # 6 categorías + 32 productos
├── data/
│   └── techstore.db   # SQLite (se crea al iniciar)
├── static/
│   ├── index.html     # SPA
│   ├── css/styles.css # Diseño moderno, modo oscuro, responsive
│   └── js/app.js      # Lógica frontend (router, carrito, validaciones)
└── README.md
```

- **Catálogo**: almacenado en base de datos (no en arrays del backend).
- **Precios, stock e impuestos**: calculados y verificados siempre en el backend.
- **Tasa de impuestos**: `TAX_RATE = 0.16` (16 %) — valor de ejemplo **pendiente de confirmación por la empresa**.
- **Pago**: ruta `/api/payment/attempt` y vista `/payment` muestran el mensaje requerido y **no procesan cobros ni solicitan datos de tarjetas**.

## Funcionalidades implementadas

### A. Catálogo y detalle
- Listado de productos con imagen, nombre, precio y disponibilidad.
- Búsqueda por texto y filtro por categoría.
- Página de detalle con descripción, stock y selector de cantidad.
- Agregar al carrito solo con cantidades válidas y stock suficiente.
- Mensajes claros cuando no hay resultados o no hay existencias.

### B. Carrito
- Ver productos, cantidades, precios unitarios e importes.
- Modificar cantidades y eliminar productos.
- Subtotal, impuestos y total calculados en el servidor.
- Impide continuar si el carrito está vacío o hay inconsistencias de stock.

### C. Datos del cliente
- Formulario: nombre completo, correo, teléfono, dirección, ciudad, estado, código postal.
- Validación de campos obligatorios y formato de email/teléfono.
- Errores mostrados junto a cada campo.
- Datos conservados en `localStorage` al navegar entre pasos.

### D. Revisión de compra
- Resumen de productos, cantidades, precios, subtotal, impuestos, total.
- Datos de entrega.
- Botones para regresar al carrito o editar datos del cliente.

### E. Pago no disponible
- Muestra el importe correspondiente.
- Mensaje exacto: *«El servicio de pago todavía no está disponible. No se ha realizado ningún cobro.»*
- No solicita datos de tarjetas, CVV ni credenciales financieras.
- Permite regresar al resumen o al carrito.

## Diseño visual (Makeover / Vibe Coding)

- Interfaz moderna, limpia y accesible.
- **Modo oscuro / claro** (toggle en header, persistente).
- Efecto **glassmorphism** en tarjetas y header (backdrop-filter).
- Tipografía Inter + JetBrains Mono para precios.
- Totalmente **responsive** (móvil, tablet, escritorio).
- Cards con hover sutil, badges de carrito, toasts de feedback.
- Paleta índigo/cian profesional.

## Lista completa de funciones del proyecto

1. Inicialización de base de datos SQLite (schema + seed de 32 productos).
2. API REST: categorías, productos (filtro/búsqueda), detalle de producto.
3. API de configuración (tasa de impuestos, flag de pago deshabilitado).
4. Validación de carrito en backend (precios reales + stock).
5. Preparación de checkout (validación cliente + carrito + totales).
6. Endpoint de intento de pago (siempre rechazado con mensaje fijo).
7. SPA con routing por hash: `/`, `/product/:id`, `/cart`, `/checkout`, `/review`, `/payment`.
8. Carrito en `localStorage` + sincronización con validación servidor.
9. Persistencia de datos de cliente entre pasos.
10. Cálculo de impuestos configurable en backend.
11. Tema claro/oscuro.
12. Diseño responsive y accesible.
13. Mensajes de error y estados vacíos claros.
14. Servidor estático + API en un solo proceso Python.

## Notas importantes

- No se integran pasarelas de pago ni se simulan transacciones exitosas.
- No se confía en importes enviados por el navegador.
- El stock se comprueba antes de aceptar el carrito o continuar.
- Las imágenes de productos usan placeholders (placehold.co); se pueden reemplazar por URLs reales.
