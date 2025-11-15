// src/presentationEditorLogic.jsx

export class PresentationEditor {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.selectedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.zoom = 1;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.resizing = false;
        this.resizeHandle = null;

        this.init();
    }

    init() {
        this.setupDOM();

        // Aseguramos que existan elementos base
        if (!this.canvas || !this.canvasWrapper || !this.slidesList || !this.propertiesContent || !this.presentationTitle) {
            console.warn('[PresentationEditor] Faltan elementos base del DOM. Revisa tus IDs en el JSX.');
            return;
        }

        this.createInitialSlide();
        this.setupEventListeners();
        this.renderSlides();
        this.loadSlide(0);
    }

    setupDOM() {
        this.canvas = document.getElementById('canvas');
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.slidesList = document.getElementById('slidesList');
        this.propertiesContent = document.getElementById('propertiesContent');
        this.presentationTitle = document.getElementById('presentationTitle');
    }

    createInitialSlide() {
        this.addSlide();
    }

    // ===== GESTIÓN DE DIAPOSITIVAS =====
    addSlide(template = 'blank') {
        const slide = {
            id: Date.now(),
            background: '#ffffff',
            elements: []
        };

        // Plantillas
        if (template === 'title') {
            slide.elements.push(this.createTextElement('Título de la diapositiva', 100, 150, 760, 80, 48, 'bold', '#333', 'center'));
            slide.elements.push(this.createTextElement('Subtítulo o descripción', 100, 280, 760, 50, 24, 'normal', '#666', 'center'));
        } else if (template === 'content') {
            slide.elements.push(this.createTextElement('Título', 50, 40, 860, 60, 36, 'bold', '#333', 'left'));
            slide.elements.push(this.createTextElement('• Punto 1\n• Punto 2\n• Punto 3', 80, 140, 800, 300, 20, 'normal', '#333', 'left'));
        } else if (template === 'image-text') {
            slide.elements.push(this.createTextElement('Título', 500, 40, 420, 60, 32, 'bold', '#333', 'left'));
            slide.elements.push(this.createTextElement('Contenido de texto que acompaña a la imagen', 500, 140, 420, 300, 18, 'normal', '#333', 'left'));
            slide.elements.push(this.createShapeElement(40, 100, 400, 350, '#e5e7eb', 'rectangle'));
        }

        this.slides.push(slide);
        this.saveToHistory();
        return slide;
    }

    deleteSlide(index) {
        if (this.slides.length <= 1) {
            alert('Debe haber al menos una diapositiva');
            return;
        }

        this.slides.splice(index, 1);

        if (this.currentSlideIndex >= this.slides.length) {
            this.currentSlideIndex = this.slides.length - 1;
        }

        this.renderSlides();
        this.loadSlide(this.currentSlideIndex);
        this.saveToHistory();
    }

    loadSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        if (!this.canvas) return;

        this.currentSlideIndex = index;
        const slide = this.slides[index];

        this.canvas.innerHTML = '';
        this.canvas.style.background = slide.background;

        slide.elements.forEach(element => {
            this.renderElement(element);
        });

        this.selectedElement = null;
        this.updatePropertiesPanel();
        this.updateSlideThumbnails();
    }

    getCurrentSlide() {
        return this.slides[this.currentSlideIndex];
    }

    // ===== CREACIÓN DE ELEMENTOS =====
    createTextElement(text, x, y, width, height, fontSize = 16, fontWeight = 'normal', color = '#000000', align = 'left') {
        return {
            id: Date.now() + Math.random(),
            type: 'text',
            text,
            x,
            y,
            width,
            height,
            fontSize,
            fontWeight,
            color,
            textAlign: align,
            rotation: 0,
            opacity: 1
        };
    }

    createImageElement(src, x, y, width, height) {
        return {
            id: Date.now() + Math.random(),
            type: 'image',
            src,
            x,
            y,
            width,
            height,
            rotation: 0,
            opacity: 1
        };
    }

    createShapeElement(x, y, width, height, fillColor = '#6366f1', shapeType = 'rectangle') {
        return {
            id: Date.now() + Math.random(),
            type: 'shape',
            shapeType,
            x,
            y,
            width,
            height,
            fillColor,
            borderColor: '#333333',
            borderWidth: 0,
            rotation: 0,
            opacity: 1
        };
    }

    createVideoElement(src, x, y, width, height) {
        return {
            id: Date.now() + Math.random(),
            type: 'video',
            src,
            x,
            y,
            width,
            height,
            rotation: 0,
            opacity: 1
        };
    }

    // ===== RENDERIZADO DE ELEMENTOS =====
    renderElement(element) {
        if (!this.canvas) return;

        const div = document.createElement('div');
        div.className = `canvas-element ${element.type}-element`;
        div.dataset.elementId = element.id;
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';
        div.style.transform = `rotate(${element.rotation}deg)`;
        div.style.opacity = element.opacity;

        if (element.type === 'text') {
            div.contentEditable = false;
            div.innerHTML = element.text.replace(/\n/g, '<br>');
            div.style.fontSize = element.fontSize + 'px';
            div.style.fontWeight = element.fontWeight;
            div.style.color = element.color;
            div.style.textAlign = element.textAlign;
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordWrap = 'break-word';

            div.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                div.contentEditable = true;
                div.focus();
            });

            div.addEventListener('blur', () => {
                div.contentEditable = false;
                element.text = div.innerText;
                this.saveToHistory();
            });

        } else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.src;
            img.style.pointerEvents = 'none';
            div.appendChild(img);

        } else if (element.type === 'shape') {
            div.style.backgroundColor = element.fillColor;
            div.style.border = `${element.borderWidth}px solid ${element.borderColor}`;

            if (element.shapeType === 'circle') {
                div.style.borderRadius = '50%';
            } else if (element.shapeType === 'rounded') {
                div.style.borderRadius = '12px';
            }

        } else if (element.type === 'video') {
            const video = document.createElement('video');
            video.src = element.src;
            video.controls = true;
            video.style.pointerEvents = 'auto';
            div.appendChild(video);
        }

        // Selección y drag
        div.addEventListener('mousedown', (e) => this.onElementMouseDown(e, element));
        this.canvas.appendChild(div);
    }

    // ===== INTERACCIÓN CON ELEMENTOS =====
    onElementMouseDown(e, element) {
        if (e.target.contentEditable === 'true') return;

        e.stopPropagation();

        this.selectElement(element);

        const div = e.currentTarget;
        const rect = div.getBoundingClientRect();

        this.draggedElement = element;
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    selectElement(element) {
        if (!this.canvas) return;

        const prevSelected = this.canvas.querySelector('.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
            this.removeResizeHandles();
        }

        this.selectedElement = element;

        const div = this.canvas.querySelector(`[data-element-id="${element.id}"]`);
        if (div) {
            div.classList.add('selected');
            this.addResizeHandles(div);
        }

        this.updatePropertiesPanel();
    }

    addResizeHandles(div) {
        const positions = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            handle.dataset.position = pos;

            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.resizing = true;
                this.resizeHandle = pos;
                this.resizeStart = { x: e.clientX, y: e.clientY };
                this.resizeElementStart = {
                    x: this.selectedElement.x,
                    y: this.selectedElement.y,
                    width: this.selectedElement.width,
                    height: this.selectedElement.height
                };
            });

            div.appendChild(handle);
        });
    }

    removeResizeHandles() {
        if (!this.canvas) return;
        const handles = this.canvas.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
    }

    deleteSelectedElement() {
        if (!this.selectedElement) return;

        const slide = this.getCurrentSlide();
        const index = slide.elements.findIndex(el => el.id === this.selectedElement.id);

        if (index !== -1) {
            slide.elements.splice(index, 1);
            this.loadSlide(this.currentSlideIndex);
            this.saveToHistory();
        }
    }

    // ===== HISTORIAL (UNDO/REDO) =====
    saveToHistory() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(this.slides)));
        this.historyIndex++;

        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.slides = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.renderSlides();
            this.loadSlide(this.currentSlideIndex);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.slides = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.renderSlides();
            this.loadSlide(this.currentSlideIndex);
        }
    }

    // ===== ZOOM =====
    setZoom(newZoom) {
        this.zoom = Math.max(0.25, Math.min(2, newZoom));
        if (this.canvasWrapper) {
            this.canvasWrapper.style.transform = `scale(${this.zoom})`;
        }
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        }
    }

    fitToScreen() {
        const container = document.getElementById('canvasContainer');
        if (!container) {
            console.warn('[PresentationEditor] #canvasContainer no encontrado');
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const canvasWidth = 960;
        const canvasHeight = 540;

        const scaleX = (containerRect.width - 80) / canvasWidth;
        const scaleY = (containerRect.height - 80) / canvasHeight;

        this.setZoom(Math.min(scaleX, scaleY));
    }

    // ===== MINIATURAS =====
    renderSlides() {
        if (!this.slidesList) return;

        this.slidesList.innerHTML = '';

        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'slide-thumbnail';
            if (index === this.currentSlideIndex) {
                thumbnail.classList.add('active');
            }

            const canvas = document.createElement('div');
            canvas.className = 'slide-thumbnail-canvas';
            canvas.style.width = '960px';
            canvas.style.height = '540px';
            canvas.style.background = slide.background;
            canvas.style.position = 'relative';

            slide.elements.forEach(element => {
                const el = document.createElement('div');
                el.style.position = 'absolute';
                el.style.left = element.x + 'px';
                el.style.top = element.y + 'px';
                el.style.width = element.width + 'px';
                el.style.height = element.height + 'px';
                el.style.transform = `rotate(${element.rotation}deg)`;
                el.style.opacity = element.opacity;

                if (element.type === 'text') {
                    el.innerHTML = element.text.replace(/\n/g, '<br>');
                    el.style.fontSize = element.fontSize + 'px';
                    el.style.fontWeight = element.fontWeight;
                    el.style.color = element.color;
                    el.style.textAlign = element.textAlign;
                } else if (element.type === 'image') {
                    el.innerHTML = `<img src="${element.src}" style="width:100%;height:100%;object-fit:cover;">`;
                } else if (element.type === 'shape') {
                    el.style.backgroundColor = element.fillColor;
                    el.style.border = `${element.borderWidth}px solid ${element.borderColor}`;
                    if (element.shapeType === 'circle') el.style.borderRadius = '50%';
                    if (element.shapeType === 'rounded') el.style.borderRadius = '12px';
                }

                canvas.appendChild(el);
            });

            thumbnail.appendChild(canvas);

            const number = document.createElement('div');
            number.className = 'slide-number';
            number.textContent = index + 1;
            thumbnail.appendChild(number);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'slide-delete';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSlide(index);
            });
            thumbnail.appendChild(deleteBtn);

            thumbnail.addEventListener('click', () => this.loadSlide(index));

            this.slidesList.appendChild(thumbnail);
        });
    }

    updateSlideThumbnails() {
        this.renderSlides();
    }

    // ===== PANEL DE PROPIEDADES =====
    updatePropertiesPanel() {
        if (!this.propertiesContent) return;

        if (!this.selectedElement) {
            this.propertiesContent.innerHTML = '<p class="no-selection">Selecciona un elemento para editar sus propiedades</p>';
            return;
        }

        const element = this.selectedElement;
        let html = '';

        html += `
            <div class="property-group">
                <label class="property-label">Posición y Tamaño</label>
                <div class="property-row">
                    <div style="flex:1">
                        <small style="color:#9ca3af;font-size:11px;">X</small>
                        <input type="number" class="property-input" id="prop-x" value="${Math.round(element.x)}">
                    </div>
                    <div style="flex:1">
                        <small style="color:#9ca3af;font-size:11px;">Y</small>
                        <input type="number" class="property-input" id="prop-y" value="${Math.round(element.y)}">
                    </div>
                </div>
                <div class="property-row">
                    <div style="flex:1">
                        <small style="color:#9ca3af;font-size:11px;">Ancho</small>
                        <input type="number" class="property-input" id="prop-width" value="${Math.round(element.width)}">
                    </div>
                    <div style="flex:1">
                        <small style="color:#9ca3af;font-size:11px;">Alto</small>
                        <input type="number" class="property-input" id="prop-height" value="${Math.round(element.height)}">
                    </div>
                </div>
            </div>
        `;

        if (element.type === 'text') {
            html += `
                <div class="property-group">
                    <label class="property-label">Texto</label>
                    <textarea class="property-input" id="prop-text" rows="3">${element.text}</textarea>
                </div>
                <div class="property-group">
                    <label class="property-label">Tamaño de Fuente</label>
                    <input type="number" class="property-input" id="prop-fontSize" value="${element.fontSize}">
                </div>
                <div class="property-group">
                    <label class="property-label">Peso de Fuente</label>
                    <select class="property-input" id="prop-fontWeight">
                        <option value="normal" ${element.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="bold" ${element.fontWeight === 'bold' ? 'selected' : ''}>Negrita</option>
                        <option value="lighter" ${element.fontWeight === 'lighter' ? 'selected' : ''}>Ligera</option>
                    </select>
                </div>
                <div class="property-group">
                    <label class="property-label">Alineación</label>
                    <select class="property-input" id="prop-textAlign">
                        <option value="left" ${element.textAlign === 'left' ? 'selected' : ''}>Izquierda</option>
                        <option value="center" ${element.textAlign === 'center' ? 'selected' : ''}>Centro</option>
                        <option value="right" ${element.textAlign === 'right' ? 'selected' : ''}>Derecha</option>
                        <option value="justify" ${element.textAlign === 'justify' ? 'selected' : ''}>Justificado</option>
                    </select>
                </div>
                <div class="property-group">
                    <label class="property-label">Color</label>
                    <input type="color" class="property-input" id="prop-color" value="${element.color}">
                </div>
            `;
        }

        if (element.type === 'shape') {
            html += `
                <div class="property-group">
                    <label class="property-label">Tipo de Forma</label>
                    <select class="property-input" id="prop-shapeType">
                        <option value="rectangle" ${element.shapeType === 'rectangle' ? 'selected' : ''}>Rectángulo</option>
                        <option value="rounded" ${element.shapeType === 'rounded' ? 'selected' : ''}>Redondeado</option>
                        <option value="circle" ${element.shapeType === 'circle' ? 'selected' : ''}>Círculo</option>
                    </select>
                </div>
                <div class="property-group">
                    <label class="property-label">Color de Relleno</label>
                    <input type="color" class="property-input" id="prop-fillColor" value="${element.fillColor}">
                </div>
                <div class="property-group">
                    <label class="property-label">Color de Borde</label>
                    <input type="color" class="property-input" id="prop-borderColor" value="${element.borderColor}">
                </div>
                <div class="property-group">
                    <label class="property-label">Grosor de Borde</label>
                    <input type="number" class="property-input" id="prop-borderWidth" value="${element.borderWidth}" min="0">
                </div>
            `;
        }

        html += `
            <div class="property-group">
                <label class="property-label">Rotación (grados)</label>
                <input type="number" class="property-input" id="prop-rotation" value="${element.rotation}">
            </div>
            <div class="property-group">
                <label class="property-label">Opacidad</label>
                <input type="range" class="property-input" id="prop-opacity" min="0" max="1" step="0.1" value="${element.opacity}">
            </div>
            <div class="property-group">
                <button class="btn btn-sm" id="btn-delete-element" style="width:100%;background:#ef4444;color:white;">🗑️ Eliminar Elemento</button>
            </div>
        `;

        this.propertiesContent.innerHTML = html;
        this.setupPropertyListeners();
    }

    setupPropertyListeners() {
        const updateProperty = (propName, value) => {
            if (this.selectedElement) {
                this.selectedElement[propName] = value;
                this.loadSlide(this.currentSlideIndex);
                this.saveToHistory();
            }
        };

        const inputs = {
            'prop-x': (val) => updateProperty('x', parseFloat(val)),
            'prop-y': (val) => updateProperty('y', parseFloat(val)),
            'prop-width': (val) => updateProperty('width', parseFloat(val)),
            'prop-height': (val) => updateProperty('height', parseFloat(val)),
            'prop-rotation': (val) => updateProperty('rotation', parseFloat(val)),
            'prop-opacity': (val) => updateProperty('opacity', parseFloat(val)),
            'prop-text': (val) => updateProperty('text', val),
            'prop-fontSize': (val) => updateProperty('fontSize', parseFloat(val)),
            'prop-fontWeight': (val) => updateProperty('fontWeight', val),
            'prop-textAlign': (val) => updateProperty('textAlign', val),
            'prop-color': (val) => updateProperty('color', val),
            'prop-fillColor': (val) => updateProperty('fillColor', val),
            'prop-borderColor': (val) => updateProperty('borderColor', val),
            'prop-borderWidth': (val) => updateProperty('borderWidth', parseFloat(val)),
            'prop-shapeType': (val) => updateProperty('shapeType', val)
        };

        Object.keys(inputs).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => inputs[id](e.target.value));
            }
        });

        const deleteBtn = document.getElementById('btn-delete-element');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedElement());
        }
    }

    // ===== MODO PRESENTACIÓN =====
    startPresentation() {
        const modal = document.getElementById('presentationModal');
        if (!modal) {
            console.warn('[PresentationEditor] #presentationModal no encontrado');
            return;
        }
        modal.classList.add('active');
        this.presentationIndex = 0;
        this.renderPresentationSlide();
    }

    renderPresentationSlide() {
        const presentationSlide = document.getElementById('presentationSlide');
        if (!presentationSlide) return;

        const slide = this.slides[this.presentationIndex];

        presentationSlide.innerHTML = '';
        presentationSlide.style.background = slide.background;

        slide.elements.forEach(element => {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = element.x + 'px';
            div.style.top = element.y + 'px';
            div.style.width = element.width + 'px';
            div.style.height = element.height + 'px';
            div.style.transform = `rotate(${element.rotation}deg)`;
            div.style.opacity = element.opacity;

            if (element.type === 'text') {
                div.innerHTML = element.text.replace(/\n/g, '<br>');
                div.style.fontSize = element.fontSize + 'px';
                div.style.fontWeight = element.fontWeight;
                div.style.color = element.color;
                div.style.textAlign = element.textAlign;
                div.style.whiteSpace = 'pre-wrap';
            } else if (element.type === 'image') {
                const img = document.createElement('img');
                img.src = element.src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                div.appendChild(img);
            } else if (element.type === 'shape') {
                div.style.backgroundColor = element.fillColor;
                div.style.border = `${element.borderWidth}px solid ${element.borderColor}`;
                if (element.shapeType === 'circle') div.style.borderRadius = '50%';
                if (element.shapeType === 'rounded') div.style.borderRadius = '12px';
            } else if (element.type === 'video') {
                const video = document.createElement('video');
                video.src = element.src;
                video.controls = true;
                video.style.width = '100%';
                video.style.height = '100%';
                div.appendChild(video);
            }

            presentationSlide.appendChild(div);
        });

        const counter = document.getElementById('slideCounter');
        if (counter) {
            counter.textContent = `${this.presentationIndex + 1} / ${this.slides.length}`;
        }
    }

    nextSlide() {
        if (this.presentationIndex < this.slides.length - 1) {
            this.presentationIndex++;
            this.renderPresentationSlide();
        }
    }

    previousSlide() {
        if (this.presentationIndex > 0) {
            this.presentationIndex--;
            this.renderPresentationSlide();
        }
    }

    closePresentation() {
        const modal = document.getElementById('presentationModal');
        if (modal) modal.classList.remove('active');
    }

    // ===== EXPORTACIÓN =====
    exportAsJSON() {
        const title = this.presentationTitle ? this.presentationTitle.value : 'presentacion';
        const data = {
            title,
            slides: this.slides,
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'presentacion'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAsHTML() {
        const title = this.presentationTitle ? this.presentationTitle.value : 'presentacion';

        let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; overflow: hidden; background: #000; }
        .presentation { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .slide { width: 80vw; height: 45vw; max-width: 1600px; max-height: 900px; position: relative; display: none; }
        .slide.active { display: block; }
        .nav { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.3); color: white; border: none; width: 50px; height: 50px; font-size: 24px; cursor: pointer; border-radius: 50%; z-index: 10; }
        .prev { left: 20px; } .next { right: 20px; }
        .counter { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; }
    </style>
</head>
<body>
    <div class="presentation">`;

        this.slides.forEach((slide, index) => {
            html += `<div class="slide ${index === 0 ? 'active' : ''}" style="background:${slide.background}">`;

            slide.elements.forEach(element => {
                html += `<div style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;transform:rotate(${element.rotation}deg);opacity:${element.opacity};">`;

                if (element.type === 'text') {
                    html += `<div style="font-size:${element.fontSize}px;font-weight:${element.fontWeight};color:${element.color};text-align:${element.textAlign};white-space:pre-wrap;">${element.text.replace(/\n/g, '<br>')}</div>`;
                } else if (element.type === 'image') {
                    html += `<img src="${element.src}" style="width:100%;height:100%;object-fit:cover;">`;
                } else if (element.type === 'shape') {
                    let style = `background-color:${element.fillColor};border:${element.borderWidth}px solid ${element.borderColor};width:100%;height:100%;`;
                    if (element.shapeType === 'circle') style += 'border-radius:50%;';
                    if (element.shapeType === 'rounded') style += 'border-radius:12px;';
                    html += `<div style="${style}"></div>`;
                }

                html += `</div>`;
            });

            html += `</div>`;
        });

        html += `
    </div>
    <button class="nav prev" onclick="changeSlide(-1)">‹</button>
    <button class="nav next" onclick="changeSlide(1)">›</button>
    <div class="counter"><span id="current">1</span> / ${this.slides.length}</div>
    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        function changeSlide(direction) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + direction + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            document.getElementById('current').textContent = currentSlide + 1;
        }
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') changeSlide(-1);
            if (e.key === 'ArrowRight') changeSlide(1);
        });
    </script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'presentacion'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        const on = (id, event, handler) => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`[PresentationEditor] Elemento con id "#${id}" no encontrado`);
                return null;
            }
            el.addEventListener(event, handler);
            return el;
        };

        // Botones de herramientas
        on('btnAddText', 'click', () => {
            const slide = this.getCurrentSlide();
            const element = this.createTextElement('Haz doble clic para editar', 100, 100, 300, 100);
            slide.elements.push(element);
            this.loadSlide(this.currentSlideIndex);
            this.saveToHistory();
        });

        on('btnAddImage', 'click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const slide = this.getCurrentSlide();
                        const element = this.createImageElement(event.target.result, 100, 100, 300, 200);
                        slide.elements.push(element);
                        this.loadSlide(this.currentSlideIndex);
                        this.saveToHistory();
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });

        on('btnAddShape', 'click', () => {
            const slide = this.getCurrentSlide();
            const element = this.createShapeElement(100, 100, 200, 200);
            slide.elements.push(element);
            this.loadSlide(this.currentSlideIndex);
            this.saveToHistory();
        });

        on('btnAddVideo', 'click', () => {
            const url = prompt('Ingresa la URL del video:');
            if (url) {
                const slide = this.getCurrentSlide();
                const element = this.createVideoElement(url, 100, 100, 400, 300);
                slide.elements.push(element);
                this.loadSlide(this.currentSlideIndex);
                this.saveToHistory();
            }
        });

        // Plantillas
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                this.addSlide(template);
                this.renderSlides();
                this.loadSlide(this.slides.length - 1);
            });
        });

        // Fondos
        on('btnApplyBg', 'click', () => {
            const picker = document.getElementById('bgColorPicker');
            if (!picker) {
                console.warn('[PresentationEditor] #bgColorPicker no encontrado');
                return;
            }
            const color = picker.value;
            const slide = this.getCurrentSlide();
            slide.background = color;
            if (this.canvas) this.canvas.style.background = color;
            this.updateSlideThumbnails();
            this.saveToHistory();
        });

        document.querySelectorAll('.gradient-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gradient = btn.dataset.gradient;
                const slide = this.getCurrentSlide();
                slide.background = gradient;
                if (this.canvas) this.canvas.style.background = gradient;
                this.updateSlideThumbnails();
                this.saveToHistory();
            });
        });

        // Zoom
        on('btnZoomIn', 'click', () => this.setZoom(this.zoom + 0.1));
        on('btnZoomOut', 'click', () => this.setZoom(this.zoom - 0.1));
        on('btnFitScreen', 'click', () => this.fitToScreen());

        // Historial
        on('btnUndo', 'click', () => this.undo());
        on('btnRedo', 'click', () => this.redo());

        // Diapositivas
        on('btnAddSlide', 'click', () => {
            this.addSlide();
            this.renderSlides();
            this.loadSlide(this.slides.length - 1);
        });

        // Presentación
        on('btnPresent', 'click', () => this.startPresentation());
        on('closePresentation', 'click', () => this.closePresentation());
        on('prevSlide', 'click', () => this.previousSlide());
        on('nextSlide', 'click', () => this.nextSlide());

        // Exportación
        on('btnExport', 'click', () => {
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.add('active');
        });

        on('closeExportModal', 'click', () => {
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('active');
        });

        on('btnExportJSON', 'click', () => {
            this.exportAsJSON();
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('active');
        });

        on('btnExportHTML', 'click', () => {
            this.exportAsHTML();
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('active');
        });

        on('btnExportPDF', 'click', () => {
            alert('Exportación a PDF: Utiliza "Imprimir > Guardar como PDF" en el navegador después de abrir el HTML exportado');
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('active');
        });

        on('btnExportImages', 'click', () => {
            alert('Exportación a imágenes: esta funcionalidad requiere una librería adicional como html2canvas');
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('active');
        });

        // Mouse: drag y resize
        document.addEventListener('mousemove', (e) => {
            if (!this.canvas) return;

            if (this.draggedElement && !this.resizing) {
                const canvasRect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - canvasRect.left - this.dragOffset.x);
                const y = (e.clientY - canvasRect.top - this.dragOffset.y);

                this.draggedElement.x = Math.max(0, Math.min(x, this.canvas.offsetWidth - this.draggedElement.width));
                this.draggedElement.y = Math.max(0, Math.min(y, this.canvas.offsetHeight - this.draggedElement.height));

                const div = this.canvas.querySelector(`[data-element-id="${this.draggedElement.id}"]`);
                if (div) {
                    div.style.left = this.draggedElement.x + 'px';
                    div.style.top = this.draggedElement.y + 'px';
                }
            } else if (this.resizing && this.selectedElement && this.canvas) {
                const deltaX = e.clientX - this.resizeStart.x;
                const deltaY = e.clientY - this.resizeStart.y;

                const element = this.selectedElement;
                const start = this.resizeElementStart;

                if (this.resizeHandle.includes('e')) {
                    element.width = Math.max(20, start.width + deltaX);
                }
                if (this.resizeHandle.includes('w')) {
                    const newWidth = Math.max(20, start.width - deltaX);
                    element.x = start.x + (start.width - newWidth);
                    element.width = newWidth;
                }
                if (this.resizeHandle.includes('s')) {
                    element.height = Math.max(20, start.height + deltaY);
                }
                if (this.resizeHandle.includes('n')) {
                    const newHeight = Math.max(20, start.height - deltaY);
                    element.y = start.y + (start.height - newHeight);
                    element.height = newHeight;
                }

                const div = this.canvas.querySelector(`[data-element-id="${element.id}"]`);
                if (div) {
                    div.style.left = element.x + 'px';
                    div.style.top = element.y + 'px';
                    div.style.width = element.width + 'px';
                    div.style.height = element.height + 'px';
                }

                this.updatePropertiesPanel();
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.draggedElement || this.resizing) {
                this.saveToHistory();
                this.updateSlideThumbnails();
            }
            this.draggedElement = null;
            this.resizing = false;
            this.resizeHandle = null;
        });

        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => {
                if (e.target === this.canvas) {
                    this.selectedElement = null;
                    this.updatePropertiesPanel();
                    const selected = this.canvas.querySelector('.selected');
                    if (selected) {
                        selected.classList.remove('selected');
                        this.removeResizeHandles();
                    }
                }
            });
        }

        // Teclado
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
                const activeElement = document.activeElement;
                if (activeElement.contentEditable !== 'true' && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.deleteSelectedElement();
                }
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }

            const presentationModal = document.getElementById('presentationModal');
            if (presentationModal && presentationModal.classList.contains('active')) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    this.nextSlide();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousSlide();
                } else if (e.key === 'Escape') {
                    this.closePresentation();
                }
            }
        });

        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
}

export function initPresentationEditor() {
    if (!window.__presentationEditorInstance) {
        window.__presentationEditorInstance = new PresentationEditor();
    }
    return window.__presentationEditorInstance;
}
