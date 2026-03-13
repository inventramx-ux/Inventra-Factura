import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface OptimizationResult {
  title: string;
  description: string;
  suggestedPrice: string;
  hashtags: string[];
  modelUsed?: string;
}

export async function optimizePublication(
  name: string,
  platform: string,
  data: any,
  enabledFields: Record<string, boolean> = {}
): Promise<OptimizationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "tu_llave_aqui") {
    throw new Error("Falta la GEMINI_API_KEY. Ve al walkthrough.md para ver cómo conseguirla.");
  }

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-pro"
  ];

  // Filtrar solo los datos habilitados
  const getVal = (field: string, val: any) => enabledFields[field] ? val : "No incluir";

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
    4. Descripción: Persuasiva, con bullet points de beneficios, destacando MSI o Envío Gratis si están habilitados.
    5. Responde ÚNICAMENTE con un objeto JSON (sin bloques de código markdown, solo el texto del JSON):
    {
      "title": "título optimizado",
      "description": "descripción optimizada",
      "suggestedPrice": "precio sugerido",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
  `;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Intentando optimización con modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("La IA no devolvió un formato válido.");

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        modelUsed: modelName
      } as OptimizationResult;
    } catch (error: any) {
      console.error(`Error con modelo ${modelName}:`, error.message);
      lastError = error;
      // Si el error es 404 (Not Found), intentamos con el siguiente modelo
      if (error.message?.includes("404") || error.status === 404) {
        continue;
      }
      // Para otros errores (403, 401), lanzamos el error inmediatamente
      if (error.status === 403 || error.status === 401) {
        throw new Error("Tu API KEY de Gemini es inválida o no tiene permisos.");
      }
      // Si no es 404, lanzamos el error
      throw new Error(error.message || "Error al comunicarse con la IA.");
    }
  }

  throw new Error(lastError?.message || "No se pudo encontrar un modelo de IA disponible.");
}
