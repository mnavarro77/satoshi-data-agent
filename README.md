<div align="center">

# 🤖 Satoshi Data Agent

**Convierte lenguaje natural en análisis de negocio en tiempo real.**

Un agente AI Text-to-SQL construido con Next.js, Google Gemini y Neon PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-Flash_Lite-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Neon](https://img.shields.io/badge/Neon_DB-PostgreSQL-00E599?style=flat-square)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## 📖 Tabla de Contenidos

- [¿Qué es Satoshi?](#-qué-es-satoshi)
- [Demo](#-demo)
- [Arquitectura](#-arquitectura)
- [Flujo de Datos](#-flujo-de-datos)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Stack Técnico](#-stack-técnico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Reference](#-api-reference)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Deploy en Vercel](#-deploy-en-vercel)
- [Seguridad](#-seguridad)
- [Contribuir](#-contribuir)

---

## 🧠 ¿Qué es Satoshi?

**Satoshi** es un agente de Inteligencia de Negocios que permite a dueños de empresa y analistas consultar su base de datos en lenguaje natural, sin escribir una sola línea de SQL.

```
Usuario: "¿Cuál fue el ticket promedio de ventas aprobadas este mes?"
  ↓
Satoshi genera SQL → ejecuta en PostgreSQL → interpreta los datos
  ↓
Respuesta: "El ticket promedio fue de $47,320 sobre 38 pagos aprobados."
```

### ¿Por qué "agentic"?

A diferencia de un chatbot simple, Satoshi ejecuta un **flujo de razonamiento de dos etapas**:

1. **Etapa de Generación:** Un LLM especializado convierte la pregunta en SQL válido y seguro.
2. **Etapa de Interpretación:** Un segundo LLM toma los datos crudos de la DB y los convierte en análisis ejecutivo.

Esto es un patrón **RAG sobre base de datos relacional** — en lugar de buscar en vectores, hacemos RAG estructurado con SQL.

---

## 🎬 Demo

> *(Agrega aquí un GIF o screenshot de la app en funcionamiento)*

---

## 🏗️ Arquitectura

```mermaid
graph TB
    subgraph Cliente ["🖥️ Frontend (Next.js App Router)"]
        UI["Chat UI\n(page.tsx)"]
        STATE["Estado React\nmessages + history"]
    end

    subgraph Servidor ["⚙️ Backend (Next.js API Route — Serverless)"]
        API["POST /api/ask\n(route.ts)"]
        GEM1["🔵 Gemini Call #1\nSQL Generator"]
        GEM2["🟣 Gemini Call #2\nData Analyst (Satoshi)"]
    end

    subgraph Datos ["🗄️ Infraestructura de Datos"]
        NEON["Neon DB\n(PostgreSQL Serverless)"]
    end

    subgraph External ["🌐 APIs Externas"]
        GEMINI_API["Google Gemini API\ngemini-flash-lite-latest"]
    end

    UI -->|"POST { question, history }"| API
    API --> GEM1
    GEM1 -->|"SQL puro"| API
    API -->|"SELECT ..."| NEON
    NEON -->|"rows[]"| API
    API --> GEM2
    GEM2 -->|"Análisis ejecutivo"| API
    API -->|"{ message, newHistory }"| UI
    UI --> STATE

    GEM1 -.->|"HTTPS"| GEMINI_API
    GEM2 -.->|"HTTPS"| GEMINI_API

    style Cliente fill:#f0f4ff,stroke:#a5b4fc
    style Servidor fill:#fdf4ff,stroke:#d8b4fe
    style Datos fill:#f0fdf4,stroke:#86efac
    style External fill:#fff7ed,stroke:#fcd34d
```

---

## 🔄 Flujo de Datos

### Petición completa de principio a fin

```mermaid
sequenceDiagram
    actor User as 👤 Usuario
    participant UI as Chat UI
    participant API as /api/ask
    participant G1 as Gemini (SQL)
    participant DB as Neon PostgreSQL
    participant G2 as Gemini (Analyst)

    User->>UI: Escribe pregunta en lenguaje natural
    UI->>API: POST { question, history[] }

    note over API: LLAMADA 1 — Generación SQL

    API->>G1: system: "Eres generador SQL, esquema: [...]"<br/>user: "¿Cuál es el producto con más stock?"
    G1-->>API: "SELECT id, name, stock FROM products ORDER BY stock DESC LIMIT 1"

    note over API: Sanitización SQL (quitar markdown, backticks)

    API->>DB: sql.query("SELECT id, name, stock...")
    DB-->>API: [{ id: "abc", name: "Camiseta", stock: 150 }]

    note over API: LLAMADA 2 — Interpretación

    API->>G2: system: "Eres Satoshi, Analista de Datos.<br/>Datos reales: [{...}]"<br/>contents: [history... + user question]
    G2-->>API: "El producto con mayor stock es la Camiseta Básica<br/>con 150 unidades disponibles. Representa el 23% de tu inventario total."

    API-->>UI: { message: "...", newHistory: [...] }
    UI->>User: Muestra respuesta con Markdown renderizado
    UI->>UI: Guarda newHistory en estado (memoria)
```

### Caso especial: Preguntas sin contexto de DB

```mermaid
flowchart LR
    Q["Pregunta del usuario"] --> C{¿Es consulta\nde negocio?}
    C -->|Sí| SQL["Gemini genera SQL"] --> DB["Ejecutar en Neon"] --> R["Gemini interpreta datos"]
    C -->|No\ne.g. 'hola'| G2["Gemini responde\ncomo asistente"] --> RES["Respuesta sin DB"]
    R --> RES
    RES --> U["Usuario"]
```

---

## 🗄️ Esquema de Base de Datos

El agente tiene acceso de **solo lectura** a las siguientes tablas:

```mermaid
erDiagram
    PRODUCTS {
        TEXT id PK
        TEXT name
        TEXT description
        TEXT category
        TEXT brand
        INTEGER originalPrice
        INTEGER salePrice
        TEXT[] images
        BOOLEAN isActive
        INTEGER stock
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    PRODUCT_VARIANTS {
        TEXT id PK
        TEXT productId FK
        TEXT size
        TEXT color
        TEXT colorHex
        TEXT volume
        TEXT sku
        INTEGER stock
        BOOLEAN isActive
    }

    CUSTOMERS {
        TEXT id PK
        TEXT email
        TEXT fullName
        TEXT phone
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    ORDERS {
        TEXT id PK
        TEXT orderNumber
        TEXT customerId FK
        TEXT shippingCity
        TEXT shippingRegion
        TEXT shippingCountry
        INTEGER subtotal
        INTEGER shippingCost
        INTEGER total
        OrderStatus status
        TEXT notes
        TEXT trackingNumber
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    ORDER_ITEMS {
        TEXT id PK
        TEXT orderId FK
        TEXT productId FK
        TEXT variantId FK
        TEXT name
        INTEGER price
        INTEGER quantity
        TEXT size
        TEXT color
    }

    PAYMENTS {
        TEXT id PK
        TEXT orderId FK
        TEXT mercadopagoId
        TEXT paymentId
        PaymentStatus status
        TEXT paymentMethod
        INTEGER amount
        TEXT currency
        TIMESTAMP paidAt
    }

    CUSTOMERS ||--o{ ORDERS : "realiza"
    ORDERS ||--|{ ORDER_ITEMS : "contiene"
    PRODUCTS ||--o{ ORDER_ITEMS : "incluido en"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "tiene"
    ORDERS ||--o| PAYMENTS : "tiene"
```

### ENUMs

| Enum | Valores |
|------|---------|
| `OrderStatus` | `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |
| `PaymentStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `REFUNDED`, `IN_PROCESS` |

---

## 🛠️ Stack Técnico

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) App Router | Frontend + API routes serverless |
| **Lenguaje** | TypeScript 5.7 | Type safety end-to-end |
| **IA** | Google Gemini Flash Lite | Generación SQL + análisis de datos |
| **Base de Datos** | [Neon DB](https://neon.tech/) PostgreSQL | Almacenamiento serverless escalable |
| **Estilos** | Tailwind CSS v4 | Utility-first styling |
| **UI Components** | Shadcn/UI + Radix UI | Componentes accesibles |
| **Markdown** | react-markdown | Renderizado de respuestas de IA |
| **Iconos** | Lucide React | Sistema de iconos |
| **Analytics** | Vercel Analytics | Métricas de uso en producción |
| **Hosting** | Vercel | Deploy automático desde GitHub |

---

## 📁 Estructura del Proyecto

```
satoshi-data-agent/
├── app/
│   ├── api/
│   │   └── ask/
│   │       └── route.ts        # 🧠 Core del agente (Text-to-SQL + Interpretación)
│   ├── globals.css             # Estilos globales + animaciones custom
│   ├── layout.tsx              # Root layout con metadata SEO y Analytics
│   └── page.tsx                # Chat UI principal (componente cliente)
│
├── components/
│   ├── blockmind/              # Componentes legacy (no usados en producción)
│   └── ui/                     # Componentes Shadcn/UI generados
│
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/
│   └── utils.ts                # Utilidades (cn helper de Tailwind)
│
├── public/                     # Assets estáticos e íconos
│
├── .env.example                # Template de variables de entorno
├── .env.local                  # Variables locales (¡ignorado por git!)
├── next.config.mjs             # Configuración de Next.js
├── package.json
└── tsconfig.json
```

### Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `app/api/ask/route.ts` | El "cerebro" del agente. Orquesta las 2 llamadas a Gemini y la consulta a Neon |
| `app/page.tsx` | Chat UI completo: estado de mensajes, historial de conversación, scroll automático |
| `app/layout.tsx` | Metadata SEO, fuente Inter, Vercel Analytics |
| `app/globals.css` | Animaciones del orb, estilos de burbujas de chat, indicador de "pensando" |

---

## 📡 API Reference

### `POST /api/ask`

El único endpoint del agente. Procesa una pregunta en lenguaje natural y devuelve un análisis de datos.

**Request Body**

```typescript
{
  question: string;        // Pregunta del usuario en lenguaje natural
  history?: GeminiTurn[];  // Historial de la conversación (para memoria)
}

// GeminiTurn shape
type GeminiTurn = {
  role: "user" | "model";
  parts: [{ text: string }];
}
```

**Response Body**

```typescript
{
  message: string;         // Respuesta del agente en Markdown
  newHistory: GeminiTurn[]; // Historial actualizado para el siguiente turno
}
```

**Ejemplos de Request/Response**

```bash
curl -X POST https://tu-app.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Cuál fue el total de ventas aprobadas?",
    "history": []
  }'
```

```json
{
  "message": "## 💰 Total de Ventas Aprobadas\n\nEl total acumulado de pagos con estado **APPROVED** es de **$1,847,230**.\n\n...",
  "newHistory": [
    { "role": "user", "parts": [{ "text": "¿Cuál fue el total de ventas aprobadas?" }] },
    { "role": "model", "parts": [{ "text": "## 💰 Total de Ventas Aprobadas\n..." }] }
  ]
}
```

**Manejo de errores**

| Caso | Comportamiento |
|------|----------------|
| Pregunta no relacionada con datos | Gemini responde como asistente sin consultar DB |
| Error de Gemini API (503) | Devuelve mensaje de "alta demanda, intenta de nuevo" |
| Error de SQL / DB | Registra error en consola, devuelve mensaje de error |

---

## ⚡ Instalación y Configuración

### Pre-requisitos

- Node.js 18+ 
- Una cuenta en [Google AI Studio](https://aistudio.google.com/) (para la API key de Gemini, gratis)
- Una base de datos en [Neon.tech](https://neon.tech/) (tier gratuito disponible)

### 1. Clonar el repositorio

```bash
git clone https://github.com/mnavarro77/satoshi-data-agent.git
cd satoshi-data-agent
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
```

### 4. Adaptar el esquema de BD

> [!IMPORTANT]
> El prompt del agente en `app/api/ask/route.ts` contiene el esquema específico de esta base de datos de e-commerce. Para usar con **tu propia base de datos**, debes editar el system prompt de la **Llamada 1** con tus tablas y columnas reales.

```typescript
// app/api/ask/route.ts — Línea ~39
const sqlRaw = await callGemini(
    `Eres un generador de SQL para PostgreSQL. Solo respondes con SQL puro.
     
     // 👇 Reemplaza esto con TUS tablas
     Tablas disponibles:
     - products (id TEXT, name TEXT, stock INTEGER...)
     - orders (id TEXT, total INTEGER, status TEXT...)`,
    question
)
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y prueba con:

- *"¿Cuántos clientes tenemos registrados?"*
- *"¿Cuál es el producto con mayor stock?"*
- *"Muéstrame los últimos 5 pedidos"*

---

## 🔐 Variables de Entorno

| Variable | Requerida | Descripción | Dónde obtenerla |
|----------|-----------|-------------|-----------------|
| `GEMINI_API_KEY` | ✅ | API key de Google Gemini | [aistudio.google.com](https://aistudio.google.com/) → "Get API key" |
| `DATABASE_URL` | ✅ | Connection string PostgreSQL | Neon Dashboard → tu proyecto → "Connection string" |

---

## 🚀 Deploy en Vercel

### Opción A — Deploy automático (recomendado)

1. Haz fork o push del proyecto a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new) e importa el repositorio
3. En **"Environment Variables"**, agrega `GEMINI_API_KEY` y `DATABASE_URL`
4. Click en **"Deploy"** — Vercel detecta Next.js automáticamente

### Opción B — Vercel CLI

```bash
npm i -g vercel
vercel

# Configurar variables de entorno
vercel env add GEMINI_API_KEY
vercel env add DATABASE_URL

# Deploy a producción
vercel --prod
```

### Configuración de Neon para producción

En el dashboard de Neon, asegúrate de habilitar **"Pooled connections"** y usar el connection string con pooler para mejor rendimiento en Serverless:

```
postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🔒 Seguridad

Satoshi implementa las siguientes medidas:

| Medida | Implementación |
|--------|----------------|
| **Solo lectura** | El system prompt prohíbe explícitamente `INSERT`, `UPDATE`, `DELETE`, `DROP` |
| **Sanitización** | El SQL generado pasa por limpieza de bloques markdown antes de ejecutarse |
| **Secrets en servidor** | `GEMINI_API_KEY` y `DATABASE_URL` nunca se exponen al cliente (solo usados en API routes) |
| **Respuesta a modificaciones** | Si el usuario pide modificar datos, el agente responde educadamente que no puede |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: descripción del cambio'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

<div align="center">

Desarrollado con ❤️ por **Michael Navarro**

</div>
