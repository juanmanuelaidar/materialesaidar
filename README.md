<p align="center">
  <img src="assets/logo-aidar.png" alt="Aidar Materiales de Construcción" width="180">
</p>

<h1 align="center">Aidar Materiales de Construcción</h1>

<p align="center">
  Landing del corralón Aidar en Maipú, Mendoza.<br>
  <a href="https://www.aidar.com.ar">www.aidar.com.ar</a>
</p>

---

Sitio de una sola página para que los clientes vean qué materiales hay, consulten precio por WhatsApp con un toque y encuentren el local. Es HTML, CSS y JavaScript puro: no necesita build, frameworks ni dependencias.

## Qué tiene la página

| Sección | Qué hace |
|---|---|
| **Encabezado** | Fijo arriba, con el nombre, la navegación, el teléfono fijo y el botón de WhatsApp. |
| **Hero** (`#inicio`) | "Todo para tu obra", el indicador **Abierto / Cerrado ahora** (en hora de Mendoza), los botones de WhatsApp y "Cómo llegar" y el logo grande. |
| **Qué tenemos** (`#productos`) | Cuatro grupos: obra gruesa, instalaciones, terminaciones y áridos. Cada producto abre WhatsApp con la consulta ya escrita. |
| **Banda amarilla** (`#entrega`) | Entrega en obra, stock real y asesoramiento. |
| **Nuestras reseñas** (`#resenas`) | Nota de Google y tres reseñas reales, con link a todas en Google Maps. |
| **Ubicación** (`#ubicacion`) | Dirección, horarios, mapa de Google y botones para abrir Maps y llamar. |
| **Contacto** (`#contacto`) | Formulario que manda la consulta por mail (Web3Forms). Si falla, abre el correo del usuario como alternativa. |
| **Barra en celular** | Botones fijos abajo: **Llamar** y **WhatsApp**. |

Además incluye datos estructurados para Google (`HardwareStore` con dirección, teléfonos, coordenadas y horarios), favicon legible a tamaño chico e ícono para iPhone.

## Estructura

```
├── index.html            Página completa y datos estructurados (JSON-LD)
├── styles.css            Estilos (variables de color al principio)
├── script.js             Datos del negocio, links, horario, formulario y analítica
├── favicon.ico           Favicon 16/32/48 px (Google lo busca en la raíz)
└── assets/
    ├── logo-aidar.png        Logo circular con fondo transparente (512 px)
    ├── favicon.svg           Favicon simplificado: círculo azul con "A"
    ├── favicon-48.png
    ├── favicon-96.png
    ├── favicon-192.png
    └── apple-touch-icon.png  Ícono para iPhone (180 px)
```

## Cómo cambiar cosas comunes

### Teléfonos, mail, dirección y link de Maps

Están todos en el objeto `BUSINESS` al principio de `script.js`:

| Campo | Para qué se usa |
|---|---|
| `whatsappNumber` | Número para los links `wa.me` (solo dígitos, con 549). |
| `phoneNumber` | Número de WhatsApp para mostrar. |
| `landlineNumber` | Teléfono fijo: lo usan los botones de **Llamar**. |
| `email` | Mail de destino y alternativa si falla el formulario. |
| `mapsUrl` | Link de Google Maps de "Cómo llegar" y de las reseñas. |
| `address` | Dirección que se muestra en Ubicación. |
| `defaultMessage` | Mensaje con el que se abre WhatsApp desde los botones generales. |

Los números también aparecen escritos en `index.html` (encabezado, botones y JSON-LD). Si cambia alguno, buscalo y reemplazalo ahí también.

### Horarios

Hay que cambiarlos en **tres lugares**, porque cada uno cumple una función distinta:

1. `index.html` → la lista de horarios en la sección Ubicación (lo que lee la gente).
2. `index.html` → `openingHoursSpecification` en el JSON-LD (lo que lee Google).
3. `script.js` → `weekdayRanges` en `getHoursStatus()` (lo que calcula "Abierto / Cerrado ahora").

### Productos

Cada producto es un botón en `index.html` dentro de `#productos`:

```html
<li><button type="button" data-message="Hola, quisiera consultar ...">Producto</button></li>
```

El texto de `data-message` es el mensaje con el que se abre WhatsApp. Para sumar un producto, copiá una línea y cambiá el texto.

### Reseñas y nota de Google

Están en `index.html`, en la sección `#resenas`:

- La nota está en `reviews-score-num`.
- Cada reseña es un `<figure class="review-card">`. Copiar el texto **tal cual** está en Google y poner nombre + inicial del apellido. Sin fotos ni fechas relativas ("hace 2 meses" queda viejo enseguida).

### Formulario de contacto

Usa [Web3Forms](https://web3forms.com). La clave está en `WEB3FORMS_ACCESS_KEY` en `script.js` y está asociada a `materialesaidar@gmail.com`: los mails llegan ahí con el asunto `[Web AIDAR] Consulta de <nombre>`.

### Colores y tipografía

Los colores son variables en `:root` al principio de `styles.css`:

| Variable | Color | Uso |
|---|---|---|
| `--chapa` | `#2C5F82` | Azul del portón (hero, botones) |
| `--chapa-dark` | `#173A52` | Encabezado y contacto |
| `--ink` | `#15202B` | Texto y pie |
| `--yellow` | `#F2BE22` | Botones de WhatsApp y banda amarilla |
| `--concrete` | `#EFEDE8` | Fondo general |

La tipografía es [Archivo](https://fonts.google.com/specimen/Archivo) desde Google Fonts, en versión ancha para los títulos.

## Analítica

Google Analytics (`G-BEENNPYZQV`). Cada contacto se registra como evento `generate_lead` con un `lead_source`:

| `lead_source` | Cuándo |
|---|---|
| `whatsapp` | Botones generales de WhatsApp |
| `whatsapp_category` | Un producto de "Qué tenemos" |
| `phone` | Botones de llamar |
| `maps` | "Cómo llegar", abrir Maps o ver reseñas |
| `email_form_submit` | Formulario enviado bien |
| `email_form_error` | El formulario falló y se abrió el correo |

## Correr localmente

No hace falta instalar nada. Desde la carpeta del repo:

```bash
python3 -m http.server 8000
```

y abrir <http://localhost:8000>. También funciona con Live Server de VS Code, o abriendo `index.html` con doble clic. En ese último caso el mapa y el formulario pueden no andar.

## Publicar

Es un sitio estático: se sube la carpeta tal cual a cualquier hosting estático (por ejemplo Vercel) y no tiene paso de build.

Forma de trabajo: cada cambio va en una rama y entra a `main` con un pull request.

## Antes de publicar un cambio

- Revisar en celular (390 px) y en escritorio ancho (1920 px), que no haya scroll horizontal.
- Probar que los botones de WhatsApp abran con el mensaje correcto.
- Si cambiaste horarios, chequear los tres lugares de arriba.
