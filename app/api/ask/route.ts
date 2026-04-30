import { neon } from "@neondatabase/serverless"

// Helper: una llamada limpia a Gemini con manejo de error 503
async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    { role: "user", parts: [{ text: userMessage }] }
                ]
            })
        }
    )
    const data = await res.json()

    // Manejar error 503 u otros errores de la API
    if (data.error) {
        console.error("❌ [GEMINI] Error de API:", data.error.message)
        return "__GEMINI_ERROR__"
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

export async function POST(req: Request) {
    const body = await req.json()
    const { question, history } = body

    // ─────────────────────────────────────────
    // LLAMADA 1: Gemini genera el SQL
    // ─────────────────────────────────────────
    const sqlRaw = await callGemini(
        `Eres un generador de SQL para PostgreSQL. Solo respondes con SQL puro.

         Tablas disponibles (nombres de columna en camelCase — exactamente como están en Prisma):

         - products (id TEXT, name TEXT, description TEXT, category TEXT, brand TEXT, "originalPrice" INTEGER, "salePrice" INTEGER, images TEXT[], "isActive" BOOLEAN, stock INTEGER, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP)
         
         - product_variants (id TEXT, "productId" TEXT, size TEXT, color TEXT, "colorHex" TEXT, volume TEXT, sku TEXT, stock INTEGER, "isActive" BOOLEAN)
         
         - customers (id TEXT, email TEXT, "fullName" TEXT, phone TEXT, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP)
         
         - orders (id TEXT, "orderNumber" TEXT, "customerId" TEXT, "shippingCity" TEXT, "shippingRegion" TEXT, "shippingCountry" TEXT, subtotal INTEGER, "shippingCost" INTEGER, total INTEGER, status "OrderStatus", notes TEXT, "trackingNumber" TEXT, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP)
         
         - order_items (id TEXT, "orderId" TEXT, "productId" TEXT, "variantId" TEXT, name TEXT, price INTEGER, quantity INTEGER, size TEXT, color TEXT)
         
         - payments (id TEXT, "orderId" TEXT, "mercadopagoId" TEXT, "paymentId" TEXT, status "PaymentStatus", "paymentMethod" TEXT, amount INTEGER, currency TEXT, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP, "paidAt" TIMESTAMP)
         
         - dropi_orders (id TEXT, "orderId" TEXT, "dropiOrderId" TEXT, status TEXT, "createdAt" TIMESTAMP)
         
         - users (id TEXT, "clerkId" TEXT, email TEXT, "firstName" TEXT, "lastName" TEXT, role TEXT, "createdAt" TIMESTAMP)

         ENUMS (usa SIEMPRE estos valores exactos con mayúsculas):
         - "OrderStatus": PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
         - "PaymentStatus": PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, IN_PROCESS

         Ejemplos de cómo responder:
         - Usuario: "productos con más stock" → SELECT id, name, stock FROM products ORDER BY stock DESC LIMIT 10
         - Usuario: "ticket promedio de ventas" → SELECT AVG(amount) as ticket_promedio FROM payments WHERE status = 'APPROVED'
         - Usuario: "clientes nuevos este mes" → SELECT COUNT(*) FROM customers WHERE "createdAt" >= date_trunc('month', CURRENT_DATE)
         - Usuario: "productos más caros" → SELECT name, "salePrice" FROM products ORDER BY "salePrice" DESC LIMIT 5
         - Usuario: "últimos pedidos" → SELECT "orderNumber", total, status, "createdAt" FROM orders ORDER BY "createdAt" DESC LIMIT 10
         - Usuario: "pedidos entregados" → SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED'
         - Usuario: "total de ventas aprobadas" → SELECT SUM(amount) as total FROM payments WHERE status = 'APPROVED'
         - Usuario: "hola" → NO_SQL

         Reglas OBLIGATORIAS:
         1. Responde ÚNICAMENTE con el SQL. Nada más. Cero palabras extra.
         2. Sin bloques de código, sin backticks, sin markdown.
         3. Solo SELECT. NUNCA uses INSERT, UPDATE, DELETE, DROP.
         4. Si la pregunta es un saludo o NO tiene relación con datos del negocio, responde exactamente: NO_SQL
         5. Pon entre comillas dobles los nombres de columna camelCase: "salePrice", "createdAt", "orderId", etc.
         6. Los valores de enum SIEMPRE en mayúsculas: 'APPROVED', 'PENDING', 'DELIVERED', etc.`,
        question
    )

    // Limpiar por si Gemini añade backticks de markdown a pesar de las instrucciones
    const sqlClean = sqlRaw
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim()

    console.log("\n🤖 [LLAMADA 1] SQL generado por Gemini:", sqlClean)

    // ─────────────────────────────────────────
    // Ejecutar el SQL en Neon (si aplica)
    // ─────────────────────────────────────────
    let dbContext = ""
    const isNoSQL = sqlClean === "" || sqlClean === "NO_SQL" || sqlClean === "__GEMINI_ERROR__"

    if (!isNoSQL) {
        try {
            const sql = neon(process.env.DATABASE_URL!)
            const rows = await sql.query(sqlClean)
            dbContext = `Datos reales de la base de datos:\n${JSON.stringify(rows, null, 2)}`
            console.log("✅ [NEON] Resultado:", rows)
        } catch (err) {
            console.error("❌ [NEON] Error ejecutando SQL:", err)
            dbContext = "Error al consultar la base de datos."
        }
    } else {
        console.log("⚠️  [NEON] Sin consulta a la DB (saludo o pregunta no relacionada)")
    }

    // ─────────────────────────────────────────
    // LLAMADA 2: Gemini interpreta y responde
    // ─────────────────────────────────────────
    const contents = [
        ...(history ?? []),
        {
            role: "user",
            parts: [{ text: question }]
        }
    ]

    const systemPromptFinal = dbContext
        ? `Eres un Analista de Datos experto y Asistente de Inteligencia de Negocios para el dueño de la empresa.
           El usuario (dueño del negocio) hizo una pregunta y estos son los datos reales extraídos de su base de datos:

           ${dbContext}

           Instrucciones:
           - Interpreta los datos y ofrécele un análisis ejecutivo claro y útil para tomar decisiones.
           - REGLA DE CONTEXTO: Los datos que recibes son el resultado exacto de la consulta (ej. si el usuario pidió "el producto con más stock", solo verás 1 producto). ¡NO asumas que es el único producto registrado en la empresa!
           - Si hay valores monetarios, menciónalos claramente (están en tu moneda local).
           - Resalta patrones, totales o métricas importantes si los datos lo permiten.
           - Responde con un tono profesional, claro y orientado a los negocios.
           - REGLA CRÍTICA: Tienes acceso de SOLO LECTURA a la base de datos. Si el usuario te pide insertar, actualizar o borrar datos, infórmale educadamente que por seguridad solo puedes analizar datos existentes, no modificarlos.`
        : `Eres un Analista de Datos experto y Asistente de Inteligencia de Negocios para el dueño de la empresa.
           Puedes consultar en tiempo real las bases de datos de inventario, ventas, clientes y pedidos.
           Si el usuario (el dueño) te hace preguntas generales o te saluda, preséntate brevemente y ofrécele analizar las métricas o datos que necesite.
           
           REGLA CRÍTICA: Tienes acceso de SOLO LECTURA a la base de datos. Si el usuario te pide insertar, actualizar o borrar datos, infórmale educadamente que por políticas de seguridad solo puedes consultar y analizar información, no modificarla. Nunca inventes que has insertado datos.`

    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPromptFinal }]
                },
                contents
            })
        }
    )

    const data = await res.json()

    // Manejar error 503 en la respuesta final
    if (data.error) {
        console.error("❌ [GEMINI] Error en respuesta final:", data.error.message)
        return Response.json({
            message: "La IA está experimentando alta demanda en este momento. Por favor intenta de nuevo en unos segundos.",
            newHistory: history ?? []
        })
    }

    console.log("✅ [LLAMADA 2] Respuesta enviada al usuario")

    const message =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No pude responder ahora."

    // Actualizamos el historial con la respuesta para mantener la memoria
    const newHistory = [
        ...contents,
        { role: "model", parts: [{ text: message }] }
    ]

    return Response.json({ message, newHistory })
}
