"use server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import ExtractorDatosIRCNL from "@/lib/extractorDatos"
import { OPENAI_EXTRACTION_PROMPT } from "@/lib/openai-extraction-prompt"
import API_CONFIG from "@/lib/config"
import type { DocumentType, ExtractorResult, ExtractedDataAI } from "@/lib/types"

// Convierte un data URL (data:application/pdf;base64,...) a Buffer
function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1] || ""
  return Buffer.from(base64, "base64")
}

// Normaliza la respuesta de la API catastral a nuestro esquema
function normalizeApiResponseToExtractedData(apiResponse: any): ExtractedDataAI {
  const toStringOrNoConsta = (v: any) => (v === null || v === undefined || v === "" ? "NO_CONSTA" : String(v))

  const data = apiResponse || {}

  return {
    informacion_predio: {
      expediente_catastral: toStringOrNoConsta(data.expediente_catastral || data.expediente),
      lote: toStringOrNoConsta(data.lote),
      manzana: toStringOrNoConsta(data.manzana),
      superficie: toStringOrNoConsta(data.superficie),
      colonia: toStringOrNoConsta(data.colonia),
      municipio: toStringOrNoConsta(data.municipio),
      codigo_postal: toStringOrNoConsta(data.codigo_postal || data.cp),
      tipo_predio: toStringOrNoConsta(data.tipo_predio),
    },
    medidas_colindancias: {
      norte: toStringOrNoConsta(data.colindancias?.norte || data.norte),
      sur: toStringOrNoConsta(data.colindancias?.sur || data.sur),
      este: toStringOrNoConsta(data.colindancias?.este || data.este),
      oeste: toStringOrNoConsta(data.colindancias?.oeste || data.oeste),
    },
    titulares: {
      vendedor_nombre: toStringOrNoConsta(data.vendedor_nombre || data.vendedor),
      vendedor_curp: toStringOrNoConsta(data.vendedor_curp),
      vendedor_rfc: toStringOrNoConsta(data.vendedor_rfc),
      comprador_nombre: toStringOrNoConsta(data.comprador_nombre || data.comprador),
      comprador_curp: toStringOrNoConsta(data.comprador_curp),
      comprador_rfc: toStringOrNoConsta(data.comprador_rfc),
      regimen_matrimonial: toStringOrNoConsta(data.regimen_matrimonial),
    },
    acto_juridico: {
      tipo_acto: toStringOrNoConsta(data.tipo_acto || data.acto),
      numero_escritura: toStringOrNoConsta(data.numero_escritura || data.escritura),
      fecha_escritura: toStringOrNoConsta(data.fecha_escritura),
      notario_nombre: toStringOrNoConsta(data.notario_nombre || data.notario),
      notario_numero: toStringOrNoConsta(data.notario_numero),
      valor_operacion: toStringOrNoConsta(data.valor_operacion || data.valor),
      moneda: toStringOrNoConsta(data.moneda),
    },
    datos_registrales: {
      volumen: toStringOrNoConsta(data.volumen),
      libro: toStringOrNoConsta(data.libro),
      seccion: toStringOrNoConsta(data.seccion),
      inscripcion: toStringOrNoConsta(data.inscripcion),
      folio_real: toStringOrNoConsta(data.folio_real || data.folio),
      fecha_registro: toStringOrNoConsta(data.fecha_registro),
    },
    antecedentes: {
      inscripcion_anterior: toStringOrNoConsta(data.inscripcion_anterior),
      volumen_anterior: toStringOrNoConsta(data.volumen_anterior),
      fecha_anterior: toStringOrNoConsta(data.fecha_anterior),
    },
    extractionQuality: {
      camposExtraidos: "0/0",
      confianzaOCR: "0%",
      estado: "Procesando",
    },
  }
}

// Normaliza respuesta de OpenAI (que usa null) a nuestro esquema (strings)
function normalizeOpenAIResponse(data: any): ExtractedDataAI {
  const toStringOrNoConsta = (v: any) => (v === null || v === undefined ? "NO_CONSTA" : String(v))

  const clone = JSON.parse(JSON.stringify(data ?? {}))

  return {
    informacion_predio: {
      expediente_catastral: toStringOrNoConsta(clone?.informacion_predio?.expediente_catastral),
      lote: toStringOrNoConsta(clone?.informacion_predio?.lote),
      manzana: toStringOrNoConsta(clone?.informacion_predio?.manzana),
      superficie: toStringOrNoConsta(clone?.informacion_predio?.superficie),
      colonia: toStringOrNoConsta(clone?.informacion_predio?.colonia),
      municipio: toStringOrNoConsta(clone?.informacion_predio?.municipio),
      codigo_postal: toStringOrNoConsta(clone?.informacion_predio?.codigo_postal),
      tipo_predio: toStringOrNoConsta(clone?.informacion_predio?.tipo_predio),
    },
    medidas_colindancias: {
      norte: toStringOrNoConsta(clone?.medidas_colindancias?.norte),
      sur: toStringOrNoConsta(clone?.medidas_colindancias?.sur),
      este: toStringOrNoConsta(clone?.medidas_colindancias?.este),
      oeste: toStringOrNoConsta(clone?.medidas_colindancias?.oeste),
    },
    titulares: {
      vendedor_nombre: toStringOrNoConsta(clone?.titulares?.vendedor_nombre),
      vendedor_curp: toStringOrNoConsta(clone?.titulares?.vendedor_curp),
      vendedor_rfc: toStringOrNoConsta(clone?.titulares?.vendedor_rfc),
      comprador_nombre: toStringOrNoConsta(clone?.titulares?.comprador_nombre),
      comprador_curp: toStringOrNoConsta(clone?.titulares?.comprador_curp),
      comprador_rfc: toStringOrNoConsta(clone?.titulares?.comprador_rfc),
      regimen_matrimonial: toStringOrNoConsta(clone?.titulares?.regimen_matrimonial),
    },
    acto_juridico: {
      tipo_acto: toStringOrNoConsta(clone?.acto_juridico?.tipo_acto),
      numero_escritura: toStringOrNoConsta(clone?.acto_juridico?.numero_escritura),
      fecha_escritura: toStringOrNoConsta(clone?.acto_juridico?.fecha_escritura),
      notario_nombre: toStringOrNoConsta(clone?.acto_juridico?.notario_nombre),
      notario_numero: toStringOrNoConsta(clone?.acto_juridico?.notario_numero),
      valor_operacion: toStringOrNoConsta(clone?.acto_juridico?.valor_operacion),
      moneda: toStringOrNoConsta(clone?.acto_juridico?.moneda),
    },
    datos_registrales: {
      volumen: toStringOrNoConsta(clone?.datos_registrales?.volumen),
      libro: toStringOrNoConsta(clone?.datos_registrales?.libro),
      seccion: toStringOrNoConsta(clone?.datos_registrales?.seccion),
      inscripcion: toStringOrNoConsta(clone?.datos_registrales?.inscripcion),
      folio_real: toStringOrNoConsta(clone?.datos_registrales?.folio_real),
      fecha_registro: toStringOrNoConsta(clone?.datos_registrales?.fecha_registro),
    },
    antecedentes: {
      inscripcion_anterior: toStringOrNoConsta(clone?.antecedentes?.inscripcion_anterior),
      volumen_anterior: toStringOrNoConsta(clone?.antecedentes?.volumen_anterior),
      fecha_anterior: toStringOrNoConsta(clone?.antecedentes?.fecha_anterior),
    },
    extractionQuality: {
      camposExtraidos: "0/0",
      confianzaOCR: "0%",
      estado: "Procesando",
    },
  }
}

// Función para extraer con OpenAI como fallback
async function extractWithOpenAI(pdfBuffer: Buffer, documentType: DocumentType): Promise<ExtractedDataAI> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI ?? null
  if (!OPENAI_KEY) {
    throw new Error("OpenAI API key no configurada")
  }

  const models = [API_CONFIG.OPENAI_MODEL, API_CONFIG.OPENAI_FALLBACK_MODEL].filter(Boolean) as string[]

  for (const modelId of models) {
    try {
      const userText = OPENAI_EXTRACTION_PROMPT.replace("{AQUÍ_VA_EL_TEXTO_DEL_PDF}", "(PDF adjunto)")

      const result = streamText({
        model: openai(modelId as any),
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en análisis de documentos notariales mexicanos. Responde únicamente con JSON válido.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "file", data: pdfBuffer, mediaType: "application/pdf" },
            ],
          },
        ],
        temperature: API_CONFIG.TEMPERATURE ?? 0.1,
        maxTokens: API_CONFIG.MAX_TOKENS ?? 4000,
      })

      const chunks: string[] = []
      for await (const delta of result.textStream) chunks.push(delta)
      const fullText = chunks.join("").trim()

      // Parseo básico del JSON
      const jsonMatch = fullText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No se encontró JSON en la respuesta")

      const parsed = JSON.parse(jsonMatch[0])
      return normalizeOpenAIResponse(parsed)
    } catch (err: any) {
      console.log(`Fallo con modelo ${modelId}:`, err.message)
      continue
    }
  }

  throw new Error("Todos los modelos de OpenAI fallaron")
}

// Función para intentar con API catastral
async function tryExtractWithCatastralAPI(pdfBuffer: Buffer): Promise<ExtractedDataAI | null> {
  try {
    const formData = new FormData()
    const blob = new Blob([pdfBuffer], { type: "application/pdf" })
    formData.append("file", blob, "document.pdf")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos

    const response = await fetch("https://catastral-data-extractor-172197426333.us-central1.run.app/dataCatastral", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Si es error de tamaño, retornar null para usar fallback
      if (response.status === 413 || response.statusText.includes("Too Large")) {
        console.log("API catastral rechazó por tamaño, usando OpenAI como fallback")
        return null
      }
      throw new Error(`API catastral error: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      if (responseText.includes("Request Entity Too Large")) {
        console.log("API catastral rechazó por tamaño (texto), usando OpenAI como fallback")
        return null
      }
      throw new Error("Respuesta no-JSON de API catastral")
    }

    const responseText = await response.text()
    const apiResponse = JSON.parse(responseText)
    return normalizeApiResponseToExtractedData(apiResponse)
  } catch (error: any) {
    console.log("Error en API catastral:", error.message)
    // Si es error de tamaño o timeout, usar fallback
    if (error.message.includes("Too Large") || error.name === "AbortError") {
      return null
    }
    throw error
  }
}

// Función principal con sistema híbrido
export async function extractDataFromPdf(
  pdfDataUrl: string,
  documentType: DocumentType,
): Promise<{ data?: ExtractorResult; error?: string }> {
  try {
    const pdfBuffer = dataUrlToBuffer(pdfDataUrl)
    const fileSizeInMB = pdfBuffer.length / (1024 * 1024)

    console.log(`Procesando PDF de ${fileSizeInMB.toFixed(2)} MB`)

    let extractedData: ExtractedDataAI

    // Intentar primero con API catastral
    console.log("Intentando con API catastral...")
    const catastralResult = await tryExtractWithCatastralAPI(pdfBuffer)

    if (catastralResult) {
      console.log("✅ Extracción exitosa con API catastral")
      extractedData = catastralResult
    } else {
      // Fallback a OpenAI
      console.log("🔄 Usando OpenAI como fallback...")
      extractedData = await extractWithOpenAI(pdfBuffer, documentType)
      console.log("✅ Extracción exitosa con OpenAI")
    }

    // Validar y calcular métricas
    const extractor = new ExtractorDatosIRCNL()
    const validated = extractor.validarDatos(extractedData)

    return { data: validated }
  } catch (error: any) {
    console.error("Error en extracción híbrida:", error)
    return {
      error: `Error al procesar el documento: ${error?.message || "desconocido"}`,
    }
  }
}
