"use client"

import type React from "react"
import { useState, useRef } from "react"
import { UploadCloudIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
        isDragging ? "border-primary bg-primary/10" : "border-neutral bg-neutral/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept={allowedMimeTypes} // Use the new constant
      />
      <UploadCloudIcon className="mx-auto h-12 w-12 text-primary mb-4" />
      <p className="text-lg font-medium text-gray-700">Arrastra y suelta tus documentos aquí</p>
      <p className="text-sm text-gray-500 mb-4">o</p>
      <Button onClick={handleButtonClick} className="bg-primary hover:bg-primary/90 text-white">
        Seleccionar Archivos
      </Button>
      <p className="text-xs text-gray-500 mt-2">Formatos soportados: PDF. Tamaño máximo: 30 MB.</p>
      {errorMessage && (
        <p className="text-sm text-destructive mt-2" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
