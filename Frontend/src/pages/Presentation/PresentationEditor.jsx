// src/PresentationEditor.jsx
import { useEffect } from 'react';
import './presentation-editor.css';
import { initPresentationEditor } from './presentationEditorLogic';

export default function PresentationEditor() {
  useEffect(() => {
    initPresentationEditor();
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">📊 Presentation Editor</h1>
          <input
            type="text"
            id="presentationTitle"
            className="title-input"
            defaultValue="Mi Presentación"
            placeholder="Título de la presentación"
          />
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" id="btnUndo">
            ↶ Deshacer
          </button>
          <button className="btn btn-secondary" id="btnRedo">
            ↷ Rehacer
          </button>
          <button className="btn btn-primary" id="btnExport">
            💾 Exportar
          </button>
          <button className="btn btn-success" id="btnPresent">
            ▶️ Presentar
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Sidebar izquierda */}
        <aside className="sidebar">
          {/* Elementos */}
          <div className="tool-section">
            <h3>Elementos</h3>
            <button className="tool-btn" id="btnAddText" type="button">
              <span className="icon">🅰️</span>
              <span>Texto</span>
            </button>
            <button className="tool-btn" id="btnAddImage" type="button">
              <span className="icon">🖼️</span>
              <span>Imagen</span>
            </button>
            <button className="tool-btn" id="btnAddShape" type="button">
              <span className="icon">⬛</span>
              <span>Forma</span>
            </button>
            <button className="tool-btn" id="btnAddVideo" type="button">
              <span className="icon">🎥</span>
              <span>Video</span>
            </button>
          </div>

          {/* Plantillas */}
          <div className="tool-section">
            <h3>Plantillas</h3>
            <div className="templates-grid">
              <button
                type="button"
                className="template-card"
                data-template="blank"
              >
                <div className="template-preview blank" />
                <span>En blanco</span>
              </button>
              <button
                type="button"
                className="template-card"
                data-template="title"
              >
                <div className="template-preview title-template" />
                <span>Título</span>
              </button>
              <button
                type="button"
                className="template-card"
                data-template="content"
              >
                <div className="template-preview content-template" />
                <span>Contenido</span>
              </button>
              <button
                type="button"
                className="template-card"
                data-template="image-text"
              >
                <div className="template-preview image-text-template" />
                <span>Imagen + texto</span>
              </button>
            </div>
          </div>

          {/* Fondo */}
          <div className="tool-section">
            <h3>Fondo</h3>
            <div className="color-picker-container">
              <input type="color" id="bgColorPicker" defaultValue="#ffffff" />
              <button className="btn btn-sm" id="btnApplyBg" type="button">
                Aplicar color
              </button>
            </div>
            <div className="gradient-options">
              <button
                type="button"
                className="gradient-btn"
                data-gradient="linear-gradient(135deg, #6366f1, #a855f7)"
              />
              <button
                type="button"
                className="gradient-btn"
                data-gradient="linear-gradient(135deg, #0ea5e9, #22c55e)"
              />
              <button
                type="button"
                className="gradient-btn"
                data-gradient="linear-gradient(135deg, #f97316, #ef4444)"
              />
              <button
                type="button"
                className="gradient-btn"
                data-gradient="linear-gradient(135deg, #111827, #1f2937)"
              />
            </div>
          </div>

          {/* Miniaturas de diapositivas */}
          <div className="slides-panel">
            <div className="slides-header">
              <h3>Diapositivas</h3>
              <button
                className="btn btn-primary btn-sm"
                id="btnAddSlide"
                type="button"
              >
                + Nueva
              </button>
            </div>
            <div className="slides-list" id="slidesList" />
          </div>
        </aside>

        {/* Área de canvas */}
        <section className="canvas-area">
          <div className="canvas-toolbar">
            <button className="toolbar-btn" id="btnZoomOut" type="button">
              −
            </button>
            <span id="zoomLevel">100%</span>
            <button className="toolbar-btn" id="btnZoomIn" type="button">
              +
            </button>
            <button className="toolbar-btn" id="btnFitScreen" type="button">
              Ajustar a pantalla
            </button>
          </div>

          <div className="canvas-container" id="canvasContainer">
            <div className="canvas-wrapper" id="canvasWrapper">
              <div className="canvas" id="canvas" />
            </div>
          </div>
        </section>

        {/* Panel de propiedades */}
        <aside className="properties-panel" id="propertiesPanel">
          <h3>Propiedades</h3>
          <div id="propertiesContent" />
        </aside>
      </div>

      {/* Modal de presentación */}
      <div className="modal" id="presentationModal">
        <div className="modal-content presentation-modal-content">
          <div className="presentation-container">
            <button
              className="close-presentation"
              id="closePresentation"
              type="button"
            >
              ×
            </button>
            <button
              className="nav-btn prev-slide"
              id="prevSlide"
              type="button"
            >
              ‹
            </button>
            <button
              className="nav-btn next-slide"
              id="nextSlide"
              type="button"
            >
              ›
            </button>

            <div id="presentationSlide" className="presentation-slide" />
            <div className="slide-counter">
              <span id="slideCounter">1 / 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de exportación */}
      <div className="modal" id="exportModal">
        <div className="modal-content export-modal-content">
          <h2>Exportar presentación</h2>
          <div className="export-options">
            <button className="export-btn" id="btnExportJSON" type="button">
              <span className="icon">🧾</span>
              <span>JSON</span>
              <small>Datos de la presentación</small>
            </button>
            <button className="export-btn" id="btnExportPDF" type="button">
              <span className="icon">📄</span>
              <span>PDF</span>
              <small>Una página por diapositiva</small>
            </button>
            <button className="export-btn" id="btnExportImages" type="button">
              <span className="icon">🖼️</span>
              <span>Imágenes</span>
              <small>PNG por diapositiva</small>
            </button>
            <button className="export-btn" id="btnExportHTML" type="button">
              <span className="icon">🌐</span>
              <span>HTML</span>
              <small>Presentación web</small>
            </button>
          </div>
          <button
            className="btn btn-secondary"
            id="closeExportModal"
            type="button"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
