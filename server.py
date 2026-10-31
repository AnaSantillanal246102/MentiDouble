#!/usr/bin/env python3
"""
TechStore - Backend API and Static Server
Pure Python stdlib: sqlite3 + http.server
Tax rate configurable (example value pending company confirmation)
"""

import json
import os
import re
import sqlite3
import uuid
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# ============== CONFIG ==============
PORT = 8080
BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "data" / "techstore.db"
STATIC_DIR = BASE_DIR / "static"
TAX_RATE = 0.16  # 16% example rate - PENDING confirmation by company
# ====================================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db()
    schema = (BASE_DIR / "sql" / "schema.sql").read_text(encoding="utf-8")
    seed = (BASE_DIR / "sql" / "seed.sql").read_text(encoding="utf-8")
    conn.executescript(schema)
    conn.executescript(seed)
    conn.commit()
    conn.close()
    print(f"[DB] Initialized at {DB_PATH}")

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

class TechStoreHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _send_error_json(self, message, status=400):
        self._send_json({"error": message}, status)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        # API routes
        if path.startswith("/api/"):
            self.handle_api_get(path, qs)
            return

        # SPA fallback: serve index.html for frontend routes
        if path in ("/", "/cart", "/checkout", "/review", "/payment", "/product") or path.startswith("/product/"):
            self.path = "/index.html"
            return super().do_GET()

        # Static files
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            self.handle_api_post(path)
            return
        self._send_error_json("Not found", 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            self.handle_api_put(path)
            return
        self._send_error_json("Not found", 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            self.handle_api_delete(path)
            return
        self._send_error_json("Not found", 404)

    # ---------- API GET ----------
    def handle_api_get(self, path, qs):
        conn = get_db()
        try:
            if path == "/api/categories":
                rows = conn.execute("SELECT * FROM categories ORDER BY name").fetchall()
                self._send_json(rows_to_list(rows))
                return

            if path == "/api/products":
                category = qs.get("category", [None])[0]
                search = qs.get("q", [None])[0]
                available_only = qs.get("available", ["1"])[0] == "1"

                sql = """
                    SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    JOIN categories c ON c.id = p.category_id
                    WHERE 1=1
                """
                params = []
                if available_only:
                    sql += " AND p.available = 1 AND p.stock > 0"
                if category:
                    sql += " AND (c.slug = ? OR c.id = ?)"
                    params.extend([category, category])
                if search:
                    sql += " AND (p.name LIKE ? OR p.description LIKE ?)"
                    params.extend([f"%{search}%", f"%{search}%"])
                sql += " ORDER BY p.name"

                rows = conn.execute(sql, params).fetchall()
                self._send_json(rows_to_list(rows))
                return

            m = re.match(r"^/api/products/(\d+)$", path)
            if m:
                pid = int(m.group(1))
                row = conn.execute("""
                    SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    JOIN categories c ON c.id = p.category_id
                    WHERE p.id = ?
                """, (pid,)).fetchone()
                if not row:
                    self._send_error_json("Producto no encontrado", 404)
                    return
                self._send_json(row_to_dict(row))
                return

            if path == "/api/config":
                self._send_json({
                    "tax_rate": TAX_RATE,
                    "tax_rate_note": "Valor de ejemplo pendiente de confirmación por parte de la empresa",
                    "currency": "USD",
                    "payment_enabled": False
                })
                return

            self._send_error_json("Endpoint no encontrado", 404)
        finally:
            conn.close()

    # ---------- API POST ----------
    def handle_api_post(self, path):
        data = self._read_json()
        if data is None:
            self._send_error_json("JSON inválido")
            return

        conn = get_db()
        try:
            if path == "/api/cart/validate":
                # Validate cart items against DB prices & stock
                items = data.get("items", [])
                if not isinstance(items, list) or len(items) == 0:
                    self._send_error_json("El carrito está vacío")
                    return

                validated = []
                subtotal = 0.0
                errors = []

                for item in items:
                    pid = item.get("product_id")
                    qty = item.get("quantity", 0)
                    if not isinstance(pid, int) or not isinstance(qty, int) or qty < 1:
                        errors.append(f"Ítem inválido: {item}")
                        continue

                    row = conn.execute(
                        "SELECT id, name, price, stock, available, image_url FROM products WHERE id = ?",
                        (pid,)
                    ).fetchone()
                    if not row:
                        errors.append(f"Producto {pid} no existe")
                        continue
                    if not row["available"]:
                        errors.append(f"{row['name']} no está disponible")
                        continue
                    if row["stock"] < qty:
                        errors.append(f"Stock insuficiente para {row['name']}: disponible {row['stock']}, solicitado {qty}")
                        continue

                    unit_price = float(row["price"])
                    line_total = unit_price * qty
                    subtotal += line_total
                    validated.append({
                        "product_id": row["id"],
                        "name": row["name"],
                        "image_url": row["image_url"],
                        "unit_price": unit_price,
                        "quantity": qty,
                        "line_total": round(line_total, 2),
                        "stock": row["stock"]
                    })

                if errors:
                    self._send_json({"ok": False, "errors": errors}, 400)
                    return

                tax = round(subtotal * TAX_RATE, 2)
                total = round(subtotal + tax, 2)
                self._send_json({
                    "ok": True,
                    "items": validated,
                    "subtotal": round(subtotal, 2),
                    "tax_rate": TAX_RATE,
                    "tax": tax,
                    "total": total
                })
                return

            if path == "/api/checkout/prepare":
                # Validate customer + cart, return summary (no order creation / no payment)
                customer = data.get("customer", {})
                items = data.get("items", [])

                # Validate customer fields
                required = ["full_name", "email", "phone", "address", "city", "state", "postal_code"]
                cust_errors = {}
                for f in required:
                    val = (customer.get(f) or "").strip()
                    if not val:
                        cust_errors[f] = "Campo obligatorio"
                email = (customer.get("email") or "").strip()
                if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                    cust_errors["email"] = "Correo electrónico inválido"
                phone = (customer.get("phone") or "").strip()
                if phone and not re.match(r"^[\d\s\+\-\(\)]{7,20}$", phone):
                    cust_errors["phone"] = "Teléfono inválido"

                if cust_errors:
                    self._send_json({"ok": False, "customer_errors": cust_errors}, 400)
                    return

                # Validate cart (reuse logic)
                if not items:
                    self._send_error_json("El carrito está vacío")
                    return

                validated = []
                subtotal = 0.0
                errors = []
                for item in items:
                    pid = item.get("product_id")
                    qty = item.get("quantity", 0)
                    row = conn.execute(
                        "SELECT id, name, price, stock, available, image_url FROM products WHERE id = ?",
                        (pid,)
                    ).fetchone()
                    if not row or not row["available"] or row["stock"] < qty:
                        errors.append(f"Problema con producto {pid}")
                        continue
                    unit = float(row["price"])
                    line = unit * qty
                    subtotal += line
                    validated.append({
                        "product_id": row["id"],
                        "name": row["name"],
                        "image_url": row["image_url"],
                        "unit_price": unit,
                        "quantity": qty,
                        "line_total": round(line, 2)
                    })

                if errors or not validated:
                    self._send_json({"ok": False, "errors": errors or ["Carrito inválido"]}, 400)
                    return

                tax = round(subtotal * TAX_RATE, 2)
                total = round(subtotal + tax, 2)

                self._send_json({
                    "ok": True,
                    "customer": {
                        "full_name": customer["full_name"].strip(),
                        "email": email,
                        "phone": phone,
                        "address": customer["address"].strip(),
                        "city": customer["city"].strip(),
                        "state": customer["state"].strip(),
                        "postal_code": customer["postal_code"].strip()
                    },
                    "items": validated,
                    "subtotal": round(subtotal, 2),
                    "tax_rate": TAX_RATE,
                    "tax": tax,
                    "total": total,
                    "payment_available": False,
                    "message": "Resumen listo. El servicio de pago todavía no está disponible."
                })
                return

            if path == "/api/payment/attempt":
                # Explicitly disabled payment endpoint
                total = data.get("total")
                self._send_json({
                    "ok": False,
                    "payment_processed": False,
                    "amount": total,
                    "message": "El servicio de pago todavía no está disponible. No se ha realizado ningún cobro."
                })
                return

            self._send_error_json("Endpoint no encontrado", 404)
        finally:
            conn.close()

    def handle_api_put(self, path):
        self._send_error_json("Método no implementado", 405)

    def handle_api_delete(self, path):
        self._send_error_json("Método no implementado", 405)


def main():
    if not DB_PATH.exists():
        init_db()
    else:
        # Ensure schema is present
        conn = get_db()
        try:
            conn.execute("SELECT 1 FROM products LIMIT 1")
        except sqlite3.OperationalError:
            init_db()
        finally:
            conn.close()

    print(f"TechStore running at http://localhost:{PORT}")
    print(f"Tax rate (example): {TAX_RATE*100}% - pending company confirmation")
    print("Payment is DISABLED by design.")
    server = HTTPServer(("0.0.0.0", PORT), TechStoreHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()

if __name__ == "__main__":
    main()
