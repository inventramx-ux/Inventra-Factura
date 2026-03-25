import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface OptimizationResult {
  title: string;
  description: string;
  suggestedPrice: string;
  hashtags: string[];
  modelUsed?: string;
  optimizationState?: string;
}

export async function optimizePublication(
  name: string,
  platform: string,
  data: any,
  enabledFields: Record<string, boolean> = {},
  style: string = "Profesional",
  isPro: boolean = false,
  length: string = "medium"
): Promise<OptimizationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "tu_llave_aqui") {
    throw new Error("Falta la GROQ_API_KEY en las variables de entorno.");
  }

  const modelsToTry = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768"
  ];

  // Filtrar solo los datos habilitados
  const getVal = (field: string, val: any) => enabledFields[field] ? val : "No incluir";

  let lengthInstruction = "";
  if (length === "short") {
    lengthInstruction = "IMPORTANTE: La descripción debe ser MUY CORTA y DIRECTA (1 o 2 párrafos breves máximo).";
  } else if (length === "long") {
    lengthInstruction = "IMPORTANTE: La descripción debe ser DETALLADA y LARGA (3 o 4 párrafos), enfatizando todas las características y beneficios a profundidad.";
  } else {
    lengthInstruction = "IMPORTANTE: La descripción debe tener una longitud MEDIA (2 o 3 párrafos), concisa pero informativa sobre los beneficios clave.";
  }

  const prompt = `
    Actúa como un experto en marketing de e-commerce y optimización de marketplaces.
    
    Tu tarea es generar contenido optimizado para la plataforma: "${platform}".
    
    DATOS DEL PRODUCTO (Solo usa los campos que tienen un valor asignado):
    - Nombre: "${name}"
    - Descripción base: "${getVal('description', data.description)}"
    - Precio: "${getVal('price', data.price)}"
    - Tags SEO: "${getVal('tags', data.tags)}"
    - Meses Sin Intereses (MSI): "${getVal('msi', data.msi ? 'Disponible' : 'No disponible')}"
    - Envío: "${getVal('shipping', data.shipping === 'free' ? 'Gratis' : 'A cargo del comprador')}"
    - Garantía: "${getVal('warranty', data.warranty)}"
    - Condición: "${getVal('condition', data.condition)}"
    - Marca: "${getVal('brand', data.brand)}"
    - Modelo: "${getVal('model', data.model)}"
    - Categoría: "${getVal('category', data.category)}"
    - Stock: "${getVal('stock', data.stock)}"

    INSTRUCCIONES CRÍTICAS:
    1. Si un campo dice "No incluir", NO menciones ese dato en la optimización.
    2. Usa los "Tags SEO" para incorporar esas palabras clave de forma natural en la descripción y el título.
    3. Título: Maximizar clics y SEO específico para ${platform}.
    4. Descripción: ${lengthInstruction} Evita introducciones largas o texto excesivo de relleno. Usa bullet points de beneficios, destacando MSI o Envío Gratis si están habilitados.
       IMPORTANTE: Usa formato Markdown en la descripción. Usa **negritas** para resaltar palabras clave. Usa guiones (-) para las listas de viñetas. NO uses otro tipo de formato. La descripción DEBE ser muy clara y fácil de leer.
    5. PRECIO SUGERIDO: Investiga mentalmente o estima el valor de mercado actual de este producto (Marca, Modelo, Condición) en plataformas de venta en línea. Devuelve un valor numérico realista (sin símbolos de moneda) como "suggestedPrice". Si no tienes suficiente información, estima un valor competitivo.
    6. Responde ÚNICAMENTE con un objeto JSON (sin bloques de código markdown, solo el texto del JSON):
    {
      "title": "título optimizado",
      "description": "descripción optimizada con formato markdown",
      "suggestedPrice": "valor numérico (ej: 1500.00)",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]${isPro ? ',\n      "optimizationState": "Estado de la optimización (ej. Excelente, Analizado)"' : ''}
    }
  `;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Intentando optimización con modelo Groq: ${modelName}`);
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: modelName,
        response_format: { type: "json_object" },
      });

      const text = chatCompletion.choices[0]?.message?.content || "";
      if (!text) throw new Error("La IA no devolvió contenido.");

      const parsed = JSON.parse(text);
      return {
        ...parsed,
        modelUsed: modelName
      } as OptimizationResult;
    } catch (error: any) {
      console.error(`Error con modelo Groq ${modelName}:`, error.message);
      lastError = error;
      
      // Manejar errores de cuota o límites de tokens
      if (error.status === 429) {
        continue; // Intentar con el siguiente modelo
      }

      // Si el error es de autenticación
      if (error.status === 401) {
        throw new Error("Tu API KEY de Groq es inválida.");
      }

      // Si no es un error que queramos ignorar para el fallback
      if (error.status !== 404 && error.status !== 429) {
        throw new Error(error.message || "Error al comunicarse con Groq.");
      }
    }
  }

  throw new Error(lastError?.message || "No se pudo encontrar un modelo de Groq disponible.");
}
