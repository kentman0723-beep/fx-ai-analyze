/**
 * Chart Uploader Component
 * Handles drag & drop and file selection for chart images
 */

export function initChartUploader(callbacks) {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const chartPreview = document.getElementById('chart-preview');
    const removeBtn = document.getElementById('remove-chart');

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    // Remove button
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearPreview();
        callbacks.onRemove();
    });

    /**
     * Handle uploaded file
     */
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            showPreview(imageData);
            callbacks.onUpload(imageData);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show preview of uploaded image
     */
    function showPreview(imageData) {
        chartPreview.src = imageData;
        dropZone.style.display = 'none';
        previewContainer.style.display = 'block';
    }

    /**
     * Clear preview
     */
    function clearPreview() {
        chartPreview.src = '';
        dropZone.style.display = 'block';
        previewContainer.style.display = 'none';
        fileInput.value = '';
    }
}
