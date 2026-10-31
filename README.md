# TechStore — Tienda demo de tecnología

Tienda en línea responsive para computadoras y artículos tecnológicos.  
Catálogo, carrito, checkout, revisión de compra y pago **deshabilitado** (sin cobros reales).

**Versión estática** lista para GitHub Pages.

## Publicar en GitHub Pages (pasos)

1. Crea un repositorio nuevo en GitHub (ej. `techstore`).
2. Sube **todo el contenido de esta carpeta** (`index.html`, `css/`, `js/`, `data/`, `README.md`) a la rama `main`.
3. En el repo: **Settings → Pages**.
4. Source: **Deploy from a branch** → Branch `main` → Folder `/ (root)` → Save.
5. En 1–2 minutos tu sitio estará en:

```
https://TU-USUARIO.github.io/techstore/
```

(Si el repo se llama `usuario.github.io`, la URL será solo `https://usuario.github.io/`).

### Subir con Git (ejemplo)

```bash
cd techstore-ghpages
git init
git add .
git commit -m "TechStore: tienda demo lista para GitHub Pages"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/techstore.git
git push -u origin main
```

Luego activa GitHub Pages como se indica arriba.

## Funciones visibles para el usuario

- Hero con productos destacados  
- Catálogo con búsqueda y filtro por categoría  
- Detalle de producto y agregar al carrito  
- Carrito (cantidades, eliminar, subtotal/impuestos/total)  
- Formulario de datos de entrega con validación  
- Revisión de compra  
- Pago deshabilitado con mensaje claro  
- Modo claro / oscuro  
- Diseño responsive  

## Nota técnica

En GitHub Pages el catálogo se carga desde `data/catalog.json`.  
Los totales e impuestos se calculan en el navegador a partir de ese catálogo.  
El pago **no procesa cobros** ni pide datos de tarjetas.
