# Aidar Materiales — Landing V2

## Estructura

aidar-landing-v2/
├── index.html
├── styles.css
├── script.js
└── assets/
    └── logo-aidar.png

## Personalización

Editar `script.js`:

- whatsappNumber
- phoneNumber
- email
- mapsUrl
- address

## Ejecutar localmente

Opción simple:
- doble clic en `index.html`

Recomendado:
- VS Code + Live Server

También:
python3 -m http.server 8000

Luego abrir:
http://localhost:8000

## Vercel

Se puede subir esta carpeta directamente a Vercel. El comando de build genera `catalog-config.js` y deja el catálogo desactivado si la URL no está configurada.

### Catálogo público (staging)

1. En el proyecto de Vercel, configurá `PUBLIC_CATALOG_API_BASE_URL` **solo para Staging/Preview** con la URL base de GestiKo, sin `/api/public/v1` al final.
2. Vercel ejecuta `npm run build`, que publica esa URL sin secretos en `catalog-config.js`.
3. Confirmá que GestiKo permita CORS desde el dominio Preview/Staging de la landing y que `PUBLIC_CATALOG_ENABLED` esté activo únicamente allí.

La landing no calcula, redondea ni guarda precios: los muestra tal como los recibe del catálogo y usa `cache: "no-store"` en cada consulta. Si el catálogo no está configurado, no entrega resultados o falla, ofrece y abre el fallback de WhatsApp.
