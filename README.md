# 🌌 DataMind — Tu Analista de Datos con IA

**DataMind** es un asistente de Inteligencia de Negocios de vanguardia que transforma el lenguaje natural en consultas SQL precisas. Diseñado para empoderar a dueños de negocio y analistas, permite obtener *insights* críticos de una base de datos PostgreSQL sin escribir una sola línea de código.

![DataMind Demo Preview](https://raw.githubusercontent.com/username/repo/main/public/preview.png) *(Nota: Reemplaza con una captura real de tu app)*

---

## ✨ Características Principales

- **🤖 Agente Satoshi:** Un analista virtual que entiende el contexto de tu negocio.
- **🧠 Text-to-SQL Pro:** Generación dinámica de consultas SQL seguras (Solo lectura).
- **📊 Análisis Ejecutivo:** No solo entrega datos, sino que interpreta resultados para la toma de decisiones.
- **⚡ Consultas en Tiempo Real:** Conexión directa con bases de datos PostgreSQL (Neon DB).
- **🎨 Interfaz Premium:** Experiencia de usuario fluida con animaciones modernas y diseño minimalista.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS.
- **IA:** [Google Gemini Flash Lite](https://ai.google.dev/) (Llamadas encadenadas para razonamiento).
- **Base de Datos:** [Neon DB](https://neon.tech/) (PostgreSQL Serverless).
- **Componentes:** Lucide React, React Markdown.

---

## ⚙️ ¿Cómo funciona?

El sistema utiliza un flujo de trabajo de dos pasos (Chaining) para garantizar precisión y seguridad:

```mermaid
graph TD
    A[Usuario: '¿Cuál es el producto más vendido?'] --> B{Llamada 1: Gemini SQL}
    B -->|Genera| C[SELECT name, SUM... FROM orders...]
    C --> D[Ejecución en Neon DB]
    D -->|Retorna| E[Filas de Datos / JSON]
    E --> F{Llamada 2: Gemini Analyst}
    F -->|Interpreta| G[Respuesta: 'El producto más vendido es X con Y ventas...']
    G --> H[Usuario Final]
    
    style B fill:#4f46e5,color:#fff
    style F fill:#4f46e5,color:#fff
    style D fill:#10b981,color:#fff
```

1.  **Traducción:** El primer modelo de IA traduce la intención del usuario a SQL puro basado en el esquema de la base de datos.
2.  **Ejecución:** El comando se ejecuta de forma segura en la base de datos relacional.
3.  **Interpretación:** Un segundo modelo recibe los datos crudos y los traduce a una respuesta humana y ejecutiva.

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/datamind-ai.git
cd datamind-ai
```

### 2. Instalar dependencias
```bash
npm install
# o
pnpm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz y añade tus credenciales:

```env
# Google Gemini API Key
GEMINI_API_KEY=tu_api_key_aqui

# Neon DB / PostgreSQL URL
DATABASE_URL=postgres://user:password@hostname/dbname?sslmode=require
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) en su navegador para ver el resultado.

---

## 🔒 Seguridad
DataMind implementa reglas críticas para la seguridad de tus datos:
- **Solo Lectura:** El sistema está instruido para generar únicamente comandos `SELECT`.
- **Sanitización:** Limpieza automática de bloques de código y caracteres innecesarios.
- **Acceso Restringido:** Las claves de API y URLs de base de datos nunca se exponen al cliente.

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.

---

Desarrollado con ❤️ por **Michael Navarro**
