"use client"

import type React from "react"
import { useState, useRef } from "react"
import { UploadCloudIcon, FileIcon, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import API_CONFIG from "@/lib/config" // Importar la configuración

interface FileUploadAreaProps {
  onFilesUpload: (files: File[]) => void
}

export default function FileUploadArea({ onFilesUpload }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Constant for allowed MIME types
  const allowedMimeTypes = "application/pdf"

  const getFileTypeFromExtension = (fileName: string): string => {
    const ext = fileName.toLowerCase().split(".").pop()
    const typeMap: { [key: string]: string } = { pdf: "application/pdf" }
    return typeMap[ext || ""] || ""
  }

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = []
    setErrorMessage(null) // Reset error message

    for (const file of files) {
      const fileMimeType = file.type
      const fileExtensionType = getFileTypeFromExtension(file.name)

      // Priorizar la validación por MIME type, si no está disponible, usar la extensión
      const isAllowedFormat =
        (fileMimeType && allowedMimeTypes.includes(fileMimeType)) ||
        (fileExtensionType && allowedMimeTypes.includes(fileExtensionType))

      const isSizeValid = file.size <= API_CONFIG.MAX_FILE_SIZE

      if (!isAllowedFormat) {
        setErrorMessage(`Formato no soportado: ${file.name}. Solo se aceptan PDFs con texto.`)
        continue
      }
      if (!isSizeValid) {
        setErrorMessage(
          `Archivo demasiado grande: ${file.name}. Tamaño máximo: ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)} MB.`,
        )
        continue
      }
      validFiles.push(file)
    }

    return validFiles
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(files)
    if (validFiles.length > 0) {
      onFilesUpload(validFiles)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = validateFiles(files)
    if (validFiles.length > 0) {
      onFilesUpload(validFiles)
    }
    e.target.value = "" // Clear input to allow re-uploading same file
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-50 scale-[1.02] shadow-lg"
            : errorMessage
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          {isDragging ? (
            <UploadCloudIcon className="mx-auto h-16 w-16 text-blue-500 mb-4 animate-bounce" />
          ) : (
            <div className="relative mb-4">
              <UploadCloudIcon className="mx-auto h-16 w-16 text-gray-400" />
              <FileIcon className="absolute -top-2 -right-2 h-6 w-6 text-red-500" />
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragging ? "¡Suelta el archivo aquí!" : "Sube tus documentos registrales"}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md">
            Arrastra y suelta archivos PDF o haz clic para seleccionar.
            <br />
            <span className="text-sm font-medium">
              Tamaño máximo: {Math.round(API_CONFIG.MAX_FILE_SIZE / (1024 * 1024))} MB
            </span>
          </p>

          <Button 
            onClick={handleButtonClick} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-3"
            size="lg"
          >
            <FileIcon className="mr-2 h-5 w-5" />
            Seleccionar Archivos PDF
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejos para mejores resultados:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Usa documentos escaneados con buena calidad (300 DPI o más)</li>
              <li>• Asegúrate de que el texto sea legible y no esté borroso</li>
              <li>• Los documentos con texto nativo (no escaneados) funcionan mejor</li>
              <li>• Evita documentos con marcas de agua o sellos que oculten el texto</li>
            </ul>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept={allowedMimeTypes}
        aria-label="Seleccionar archivos PDF"
      />
    </div>
  )
}
