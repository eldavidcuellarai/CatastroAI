// CatastroAI Test UI - JavaScript
const BACKEND_URL = 'https://8080-cs-f36064f3-70e1-4a6c-9760-da09e18f7444.cs-us-east1-yeah.cloudshell.dev';

class CatastroTestUI {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.selectedFile = null;
    }

    initializeElements() {
        this.testConnectionBtn = document.getElementById('testConnection');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.backendInfo = document.getElementById('backendInfo');
        this.backendDetails = document.getElementById('backendDetails');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.docType = document.getElementById('docType');
        this.processBtn = document.getElementById('processBtn');
        this.processingStatus = document.getElementById('processingStatus');
        this.results = document.getElementById('results');
        this.processingMetrics = document.getElementById('processingMetrics');
        this.extractedData = document.getElementById('extractedData');
        this.dataOutput = document.getElementById('dataOutput');
        this.errorDisplay = document.getElementById('errorDisplay');
        this.errorMessage = document.getElementById('errorMessage');
    }

    attachEventListeners() {
        this.testConnectionBtn.addEventListener('click', () => this.testConnection());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.processBtn.addEventListener('click', () => this.processDocument());
    }

    async testConnection() {
        this.setConnectionStatus('testing', 'Probando...', 'text-yellow-600');
        this.hideError();

        try {
            const response = await fetch(`${BACKEND_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setConnectionStatus('connected', 'Conectado', 'text-green-600');
                this.showBackendInfo(data);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.setConnectionStatus('error', 'Error de Conexión', 'text-red-600');
            this.showError(`Error conectando con backend: ${error.message}`);
        }
    }

    setConnectionStatus(status, text, colorClass) {
        const iconMap = {
            testing: 'fas fa-spinner fa-spin',
            connected: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle'
        };

        this.connectionStatus.innerHTML = `
            <i class="${iconMap[status]} mr-2"></i>
            ${text}
        `;
        this.connectionStatus.className = `px-3 py-1 rounded text-sm font-medium ${colorClass}`;
    }

    showBackendInfo(data) {
        this.backendDetails.textContent = JSON.stringify(data, null, 2);
        this.backendInfo.classList.remove('hidden');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                this.showError('Solo se aceptan archivos PDF');
                return;
            }

            this.selectedFile = file;
            this.fileName.textContent = file.name;
            this.fileSize.textContent = this.formatFileSize(file.size);
            this.fileInfo.classList.remove('hidden');
            this.processBtn.disabled = false;
            this.hideError();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processDocument() {
        if (!this.selectedFile) {
            this.showError('Selecciona un archivo PDF primero');
            return;
        }

        this.hideError();
        this.hideResults();
        this.showProcessing();

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('document_type', this.docType.value);

        const startTime = Date.now();

        try {
            const response = await fetch(`${BACKEND_URL}/extract`, {
                method: 'POST',
                body: formData
            });

            const processingTime = Date.now() - startTime;

            if (response.ok) {
                const result = await response.json();
                this.showResults(result, processingTime);
            } else {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.showError(`Error procesando documento: ${error.message}`);
        } finally {
            this.hideProcessing();
        }
    }

    showProcessing() {
        this.processingStatus.classList.remove('hidden');
        this.processBtn.disabled = true;
    }

    hideProcessing() {
        this.processingStatus.classList.add('hidden');
        this.processBtn.disabled = false;
    }

    showResults(result, clientProcessingTime) {
        // Crear métricas de procesamiento
        const metrics = [
            {
                label: 'Éxito',
                value: result.success ? 'Sí' : 'No',
                color: result.success ? 'green' : 'red',
                icon: result.success ? 'fas fa-check' : 'fas fa-times'
            },
            {
                label: 'Confianza',
                value: result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A',
                color: 'blue',
                icon: 'fas fa-percentage'
            },
            {
                label: 'Tiempo (Backend)',
                value: result.processing_time ? `${result.processing_time.toFixed(0)}ms` : 'N/A',
                color: 'purple',
                icon: 'fas fa-clock'
            },
            {
                label: 'Tiempo (Total)',
                value: `${clientProcessingTime}ms`,
                color: 'indigo',
                icon: 'fas fa-stopwatch'
            }
        ];

        this.processingMetrics.innerHTML = metrics.map(metric => `
            <div class="bg-${metric.color}-50 border border-${metric.color}-200 rounded-lg p-3 flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <i class="${metric.icon} text-${metric.color}-600"></i>
                    <span class="text-sm font-medium text-${metric.color}-800">${metric.label}</span>
                </div>
                <div class="text-lg font-bold text-${metric.color}-900 mt-1">${metric.value}</div>
            </div>
        `).join('');

        // Mostrar datos extraídos
        if (result.data) {
            this.dataOutput.textContent = JSON.stringify(result.data, null, 2);
        } else {
            this.dataOutput.textContent = result.message || 'No hay datos disponibles';
        }

        this.results.classList.remove('hidden');
    }

    hideResults() {
        this.results.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorDisplay.classList.remove('hidden');
    }

    hideError() {
        this.errorDisplay.classList.add('hidden');
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new CatastroTestUI();
});

// Configuración de Tailwind CSS dinámico
tailwind.config = {
    theme: {
        extend: {
            colors: {
                blue: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a'
                }
            }
        }
    }
}