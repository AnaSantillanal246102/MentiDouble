-- Seed data for TechStore
-- Categories and 32 products

INSERT OR IGNORE INTO categories (id, name, description, slug) VALUES
(1, 'Laptops', 'Computadoras portátiles de alto rendimiento', 'laptops'),
(2, 'Desktops', 'Computadoras de escritorio y workstations', 'desktops'),
(3, 'Componentes', 'Procesadores, memorias, almacenamiento y más', 'componentes'),
(4, 'Periféricos', 'Teclados, mouse, monitores y accesorios', 'perifericos'),
(5, 'Redes', 'Routers, switches y equipos de red', 'redes'),
(6, 'Almacenamiento', 'Discos duros, SSD y memorias externas', 'almacenamiento');

-- Products (32 items)
INSERT OR IGNORE INTO products (id, name, description, price, stock, category_id, image_url, available) VALUES
(1, 'Laptop Pro 14" M3', 'Laptop ultraligera con chip M3, 16GB RAM, 512GB SSD. Ideal para profesionales.', 1299.99, 15, 1, 'https://placehold.co/400x300/1a1a2e/eee?text=Laptop+Pro+14', 1),
(2, 'Laptop Gamer RTX 4060', '15.6" FHD 144Hz, Intel i7, 16GB, RTX 4060 8GB, 1TB SSD.', 1499.00, 8, 1, 'https://placehold.co/400x300/16213e/eee?text=Gamer+RTX', 1),
(3, 'Ultrabook Slim 13"', 'Pantalla OLED 13.3", 8GB, 256GB, batería 18h. Perfecta para viajes.', 899.50, 22, 1, 'https://placehold.co/400x300/0f3460/eee?text=Ultrabook', 1),
(4, 'Laptop Business 15"', 'Intel i5 12ª gen, 16GB, 512GB, teclado retroiluminado, Windows 11 Pro.', 1099.00, 12, 1, 'https://placehold.co/400x300/533483/eee?text=Business', 1),
(5, 'Chromebook Edu', '11.6" HD, 4GB, 64GB eMMC, ideal para estudiantes y uso ligero.', 249.99, 40, 1, 'https://placehold.co/400x300/e94560/eee?text=Chromebook', 1),
(6, 'Workstation Laptop 17"', 'Intel Xeon, 32GB ECC, RTX A2000, 1TB, para diseño y CAD.', 2799.00, 4, 1, 'https://placehold.co/400x300/1a1a2e/eee?text=Workstation', 1),

(7, 'PC Gaming Tower RGB', 'AMD Ryzen 7, 32GB, RTX 4070, 2TB NVMe, refrigeración líquida.', 1899.99, 6, 2, 'https://placehold.co/400x300/16213e/eee?text=Gaming+Tower', 1),
(8, 'Mini PC Office', 'Intel N100, 16GB, 512GB SSD, 4K dual, silencioso y compacto.', 349.00, 25, 2, 'https://placehold.co/400x300/0f3460/eee?text=Mini+PC', 1),
(9, 'All-in-One 27"', 'Pantalla 27" 4K, i5, 16GB, 1TB, cámara 1080p, altavoces.', 1199.00, 9, 2, 'https://placehold.co/400x300/533483/eee?text=AIO+27', 1),
(10, 'Servidor Torre Entry', 'Xeon E-2324G, 32GB ECC, 2x 2TB HDD RAID, para pequeñas empresas.', 1599.00, 3, 2, 'https://placehold.co/400x300/e94560/eee?text=Server', 1),
(11, 'PC Creator Studio', 'Ryzen 9, 64GB, RTX 4080, 4TB, optimizado para video 8K y 3D.', 3299.00, 2, 2, 'https://placehold.co/400x300/1a1a2e/eee?text=Creator', 1),

(12, 'Procesador Ryzen 7 7800X3D', '8 núcleos, 4.2GHz, cache 3D, ideal gaming. Socket AM5.', 399.99, 18, 3, 'https://placehold.co/400x300/16213e/eee?text=Ryzen+7', 1),
(13, 'Intel Core i9-14900K', '24 núcleos, hasta 6.0GHz, desbloqueado para overclock.', 549.00, 10, 3, 'https://placehold.co/400x300/0f3460/eee?text=i9-14900K', 1),
(14, 'Memoria RAM 32GB DDR5', 'Kit 2x16GB 6000MHz CL30, RGB, alto rendimiento.', 129.99, 35, 3, 'https://placehold.co/400x300/533483/eee?text=DDR5+32GB', 1),
(15, 'Placa Base B650', 'AM5, WiFi 6E, 4x DDR5, PCIe 5.0, 3x M.2.', 189.00, 14, 3, 'https://placehold.co/400x300/e94560/eee?text=B650', 1),
(16, 'Fuente 850W 80+ Gold', 'Modular, ATX 3.0, compatible RTX 40 series.', 139.99, 20, 3, 'https://placehold.co/400x300/1a1a2e/eee?text=PSU+850W', 1),
(17, 'Cooler AIO 360mm', 'Refrigeración líquida RGB, compatible Intel/AMD.', 119.00, 16, 3, 'https://placehold.co/400x300/16213e/eee?text=AIO+360', 1),

(18, 'Monitor Gaming 27" 165Hz', 'QHD IPS, 1ms, FreeSync/G-Sync Compatible, HDR400.', 299.99, 22, 4, 'https://placehold.co/400x300/0f3460/eee?text=Monitor+27', 1),
(19, 'Teclado Mecánico RGB', 'Switches red, 100%, anti-ghosting, reposamuñecas.', 89.99, 40, 4, 'https://placehold.co/400x300/533483/eee?text=Keyboard', 1),
(20, 'Mouse Inalámbrico Pro', '25K DPI, 70h batería, 2.4GHz + BT, ergonómico.', 79.00, 50, 4, 'https://placehold.co/400x300/e94560/eee?text=Mouse+Pro', 1),
(21, 'Auriculares Gaming 7.1', 'Sonido espacial, micrófono detachable, RGB.', 69.99, 30, 4, 'https://placehold.co/400x300/1a1a2e/eee?text=Headset', 1),
(22, 'Webcam 4K', 'UHD 30fps, autofoco, micrófono dual, cover privacidad.', 99.00, 18, 4, 'https://placehold.co/400x300/16213e/eee?text=Webcam+4K', 1),
(23, 'Monitor Ultrawide 34"', 'WQHD 144Hz, curvo 1500R, USB-C 90W, ideal productividad.', 449.00, 7, 4, 'https://placehold.co/400x300/0f3460/eee?text=Ultrawide', 1),

(24, 'Router WiFi 6 Mesh', 'Sistema 3 nodos, hasta 6000 Mbps, cobertura 500m².', 299.99, 12, 5, 'https://placehold.co/400x300/533483/eee?text=Mesh+WiFi6', 1),
(25, 'Switch Gigabit 8 puertos', 'Unmanaged, PoE+ 60W, metal, plug & play.', 59.99, 25, 5, 'https://placehold.co/400x300/e94560/eee?text=Switch+8P', 1),
(26, 'Adaptador USB WiFi 6', 'AX1800, dual band, antena externa, Windows/macOS.', 29.99, 60, 5, 'https://placehold.co/400x300/1a1a2e/eee?text=USB+WiFi', 1),
(27, 'Access Point WiFi 6', 'Ceiling mount, 2.4/5GHz, PoE, gestión cloud.', 149.00, 8, 5, 'https://placehold.co/400x300/16213e/eee?text=AP+WiFi6', 1),

(28, 'SSD NVMe 2TB Gen4', '7000MB/s lectura, PCIe 4.0, ideal PS5 y PC.', 159.99, 28, 6, 'https://placehold.co/400x300/0f3460/eee?text=SSD+2TB', 1),
(29, 'HDD 4TB 7200rpm', 'SATA 6Gb/s, cache 256MB, para almacenamiento masivo.', 89.99, 20, 6, 'https://placehold.co/400x300/533483/eee?text=HDD+4TB', 1),
(30, 'SSD Externo 1TB', 'USB-C 3.2, 1050MB/s, resistente a golpes, portátil.', 109.00, 35, 6, 'https://placehold.co/400x300/e94560/eee?text=SSD+Ext', 1),
(31, 'Pendrive 256GB USB-C', 'USB 3.2 Gen2, 400MB/s, metal, llavero.', 34.99, 80, 6, 'https://placehold.co/400x300/1a1a2e/eee?text=USB+256GB', 1),
(32, 'NAS 2 Bahías', 'RAID 0/1, 2.5GbE, apps multimedia, hasta 36TB.', 249.00, 5, 6, 'https://placehold.co/400x300/16213e/eee?text=NAS+2Bay', 1);
