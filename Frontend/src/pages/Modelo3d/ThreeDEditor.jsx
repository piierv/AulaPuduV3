// src/ThreeDEditor.jsx
import { useEffect } from 'react';
import './three-d-editor.css';
import {
  initThreeEditor,
  addCubeBtn,
  addSphereBtn,
  addCylinderBtn,
  addPlaneBtn,
  addBounceBtn,
  addFloatBtn,
  addRotationBtn,
  stopAnimationBtn,
  exportSceneBtn,
  takeScreenshotBtn,
  clearSceneBtn,
} from './threeDEditorLogic';

export default function ThreeDEditor() {
  useEffect(() => {
    initThreeEditor();
  }, []);

  return (
    <div id="app-container">
      <div id="sidebar">
        <h2>🎨 Editor 3D</h2>

        <div className="control-section">
          <h3>Añadir Objetos</h3>
          <div className="button-group">
            <button onClick={addCubeBtn}>📦 Cubo</button>
            <button onClick={addSphereBtn}>⚽ Esfera</button>
            <button onClick={addCylinderBtn}>🛢️ Cilindro</button>
            <button onClick={addPlaneBtn}>📐 Plano</button>
          </div>
        </div>

        <div className="control-section">
          <h3>Color del Siguiente Objeto</h3>
          <div className="color-picker-group">
            <label htmlFor="objectColor">Color:</label>
            <input id="objectColor" type="color" defaultValue="#00f2fe" />
          </div>
        </div>

        <div className="control-section">
          <h3>Animaciones rápidas</h3>
          <div className="button-group">
            <button className="secondary" onClick={addBounceBtn}>
              ⬆️ Rebotar
            </button>
            <button className="secondary" onClick={addFloatBtn}>
              🌊 Flotar
            </button>
            <button className="secondary" onClick={addRotationBtn}>
              🔁 Rotar
            </button>
            <button className="secondary" onClick={stopAnimationBtn}>
              ⏹️ Detener
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>
            Objetos en Escena (<span id="object-count">0</span>)
          </h3>
          <div id="objects-list" />
        </div>

        <div className="control-section">
          <h3>Acciones</h3>
          <button
            className="success"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={exportSceneBtn}
          >
            💾 Exportar Escena
          </button>
          <button
            className="success"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={takeScreenshotBtn}
          >
            📸 Captura
          </button>
          <button
            className="danger"
            style={{ width: '100%' }}
            onClick={clearSceneBtn}
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      <div id="canvas-container">
        <div id="info-panel">
          <h3>ℹ️ Instrucciones</h3>
          <p>
            <strong>Ratón:</strong> Arrastra para rotar
          </p>
          <p>
            <strong>Rueda:</strong> Zoom in/out
          </p>
          <p>
            <strong>Click:</strong> Seleccionar objeto
          </p>
        </div>

        <div id="debug">
          <div>
            Estado: <span id="status">Inicializando...</span>
          </div>
          <div>
            Objetos: <span id="obj-count">0</span>
          </div>
          <div>
            Seleccionado: <span id="selected">Ninguno</span>
          </div>
        </div>
      </div>
    </div>
  );
}

