// app/api/extract-pdf-text/route.ts
// Extracción robusta de texto:
// 1) Intenta con pdfjs-dist (sin worker).
// Devuelve mensajes de error específicos para facilitar el diagnóstico.

import { NextResponse, type NextRequest } from 'next/server'

async function extractWithPdfJs(arrayBuffer: ArrayBuffer): Promise<string> {
  // Carga dinámica del build legacy (compatible en navegador) y sin worker
  const mod: any = await import('pdfjs-dist/legacy/build/pdf')
  const pdfjs = mod?.default ?? mod

  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    disableWorker: true, // v2/v3
    useWorker: false,    // v4
    verbosity: 0,
  })

  const pdf = await loadingTask.promise
  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = (content.items || [])
      .map((it: any) => (it && typeof it.str === 'string' ? it.str : ''))
      .join(' ')
    text += pageText + '\n'
  }

  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Archivo no proporcionado.' }, { status: 400 })
    }

    // Validaciones: solo PDF y tamaño max 30MB
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json({ error: 'Formato no soportado. Solo se aceptan PDFs.' }, { status: 400 })
    }
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: 'Archivo muy grande. Máximo 30MB.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()

    let cleaned = ''
    try {
      cleaned = await extractWithPdfJs(arrayBuffer)
    } catch (e: any) {
      const msg = String(e?.message || e)
      if (/Password/i.test(msg)) {
        return NextResponse.json({ error: 'El PDF está protegido con contraseña.' }, { status: 400 })
      }
      // Si falla pdfjs-dist devolvemos el mensaje concreto
      return NextResponse.json(
        { error: `No se pudo extraer texto del PDF (pdfjs): ${msg}` },
        { status: 400 }
      )
    }

    if (!cleaned || cleaned.length < 50) {
      return NextResponse.json(
        { error: 'Este PDF no contiene texto extraíble. Parece ser escaneado (requiere OCR).' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      text: cleaned,
      meta: { fileName: file.name, size: file.size },
    })
  } catch (err: any) {
    console.error('Error extrayendo texto del PDF:', err)
    return NextResponse.json(
      { error: err?.message || 'Fallo al extraer texto del PDF.' },
      { status: 500 }
    )
  }
}
