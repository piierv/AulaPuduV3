// src/pages/Modelado3d/threeDEditorLogic.jsx
import * as THREE from 'three';
// 👇 CAMBIADO: antes 'three/examples/jsm/controls/OrbitControls.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variables globales compartidas dentro del módulo
let scene, camera, renderer, controls;
let objects = new Map();
let selectedObjectId = null;
let raycaster, mouse;

// Inicialización principal
function init() {
  console.log('🚀 Iniciando aplicación 3D...');
  updateStatus('Inicializando...');

  if (typeof THREE === 'undefined') {
    console.error('❌ THREE.js no cargado');
    updateStatus('ERROR: Three.js no cargado');
    return;
  }

  console.log('✅ THREE.js cargado');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a15);
  console.log('✅ Escena creada');

  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('❌ Contenedor canvas-container no encontrado');
    updateStatus('ERROR: contenedor no encontrado');
    return;
  }

  const aspect = container.clientWidth / (container.clientHeight || 1);
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);
  console.log('✅ Cámara creada');

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight || 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  console.log('✅ Renderer creado y añadido al DOM');

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 15, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
  console.log('✅ Luces añadidas');

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  console.log('✅ Controles añadidos');

  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  console.log('✅ Grilla y ejes añadidos');

  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  plane.userData.isGround = true;
  scene.add(plane);
  console.log('✅ Plano base añadido');

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onMouseClick);

  updateStatus('Listo');
  updateDebug();

  animate();
  console.log('🎬 Animación iniciada');
}

// Animación
let animationId = null;
function animate() {
  animationId = requestAnimationFrame(animate);

  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// Resize
function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container || !camera || !renderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight || 1;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

// Selección con raycaster
function onMouseClick(event) {
  if (!renderer || !camera || !scene) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(Array.from(objects.values()), true);

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    selectObject(intersected);
  } else {
    selectedObjectId = null;
    updateDebug();
  }
}

function selectObject(object) {
  console.log('🖱️ Seleccionando objeto...', object);

  let root = object;
  while (root.parent && !objects.has(root.uuid)) {
    root = root.parent;
  }

  if (!objects.has(root.uuid)) {
    console.warn('⚠️ Objeto no registrado en el mapa');
    return;
  }

  const current = objects.get(selectedObjectId);
  if (current && current.material && current.material.emissive) {
    current.material.emissive.setHex(0x000000);
  }

  selectedObjectId = root.uuid;
  const selected = objects.get(selectedObjectId);
  if (selected && selected.material && selected.material.emissive) {
    selected.material.emissive.setHex(0x555555);
  }

  updateDebug();
  console.log('✅ Objeto seleccionado:', selectedObjectId);
}

function getObjectColor() {
  const colorInput = document.getElementById('objectColor');
  const colorHex = colorInput ? colorInput.value : '#00f2fe';
  return parseInt(colorHex.replace('#', '0x'));
}

function createObject(mesh) {
  const id = mesh.uuid;
  mesh.userData.id = id;

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);
  objects.set(id, mesh);

  updateObjectsList();
  updateStatus(`Objeto creado: ${id}`);
  console.log('✅ Objeto creado y añadido:', id);
}

// ==== BOTONES DE CREACIÓN ====
export function addCubeBtn() {
  console.log('📦 Añadiendo cubo...');
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: getObjectColor(),
    metalness: 0.5,
    roughness: 0.5,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set((Math.random() - 0.5) * 6, 0.5, (Math.random() - 0.5) * 6);
  createObject(cube);
}

export function addSphereBtn() {
  console.log('⚽ Añadiendo esfera...');
  const geometry = new THREE.SphereGeometry(0.6, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: getObjectColor(),
    metalness: 0.3,
    roughness: 0.6,
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set((Math.random() - 0.5) * 6, 0.6, (Math.random() - 0.5) * 6);
  createObject(sphere);
}

export function addCylinderBtn() {
  console.log('🛢️ Añadiendo cilindro...');
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
  const material = new THREE.MeshStandardMaterial({
    color: getObjectColor(),
    metalness: 0.4,
    roughness: 0.5,
  });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set((Math.random() - 0.5) * 6, 0.75, (Math.random() - 0.5) * 6);
  createObject(cylinder);
}

export function addPlaneBtn() {
  console.log('📐 Añadiendo plano...');
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: getObjectColor(),
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set((Math.random() - 0.5) * 6, 0.01, (Math.random() - 0.5) * 6);
  createObject(plane);
}

// ==== ANIMACIONES ====
export function addBounceBtn() {
  if (!selectedObjectId || !objects.has(selectedObjectId)) {
    updateStatus('Selecciona un objeto para animar');
    return;
  }
  const obj = objects.get(selectedObjectId);
  const startY = obj.position.y;
  let t = 0;

  function bounce() {
    if (!objects.has(selectedObjectId)) return;
    t += 0.05;
    obj.position.y = startY + Math.abs(Math.sin(t)) * 0.8;
    requestAnimationFrame(bounce);
  }

  bounce();
  updateStatus('Animación: rebote');
}

export function addFloatBtn() {
  if (!selectedObjectId || !objects.has(selectedObjectId)) {
    updateStatus('Selecciona un objeto para animar');
    return;
  }
  const obj = objects.get(selectedObjectId);
  const startY = obj.position.y;
  let t = 0;

  function floatAnim() {
    if (!objects.has(selectedObjectId)) return;
    t += 0.02;
    obj.position.y = startY + Math.sin(t) * 0.3;
    requestAnimationFrame(floatAnim);
  }

  floatAnim();
  updateStatus('Animación: flotando');
}

export function addRotationBtn() {
  if (!selectedObjectId || !objects.has(selectedObjectId)) {
    updateStatus('Selecciona un objeto para animar');
    return;
  }
  const obj = objects.get(selectedObjectId);

  function rotateAnim() {
    if (!objects.has(selectedObjectId)) return;
    obj.rotation.y += 0.03;
    requestAnimationFrame(rotateAnim);
  }

  rotateAnim();
  updateStatus('Animación: rotación');
}

export function stopAnimationBtn() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  animate();
  updateStatus('Animaciones reiniciadas');
}

// ==== EXPORT / CAPTURA ====
export function exportSceneBtn() {
  const data = [];
  objects.forEach((obj, id) => {
    data.push({
      id,
      type: obj.geometry.type,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      color:
        obj.material && obj.material.color
          ? obj.material.color.getHexString()
          : null,
    });
  });

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'escena-3d.json';
  a.click();
  URL.revokeObjectURL(url);
  updateStatus('Escena exportada como JSON');
}

export function takeScreenshotBtn() {
  if (!renderer) return;
  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'captura-3d.png';
  a.click();
  updateStatus('Captura de pantalla guardada');
}

// ==== BORRADO / LIMPIEZA ====
function deleteObject(id) {
  const obj = objects.get(id);
  if (obj) {
    scene.remove(obj);
    objects.delete(id);
    if (selectedObjectId === id) selectedObjectId = null;
    updateObjectsList();
    updateStatus(`Objeto eliminado: ${id}`);
  }
}

export function clearSceneBtn() {
  objects.forEach(obj => {
    if (obj.parent) obj.parent.remove(obj);
  });
  objects.clear();
  selectedObjectId = null;
  updateObjectsList();
  updateStatus('Escena limpiada');
  console.log('🗑️ Escena limpiada');
}

// ==== UI HELPERS ====
function updateStatus(status) {
  const el = document.getElementById('status');
  if (el) el.textContent = status;
}

function updateDebug() {
  const objCount = document.getElementById('obj-count');
  const selected = document.getElementById('selected');
  if (objCount) objCount.textContent = objects.size;
  if (selected) selected.textContent = selectedObjectId || 'Ninguno';
}

function updateObjectsList() {
  const listContainer = document.getElementById('objects-list');
  const count = document.getElementById('object-count');
  if (!listContainer || !count) return;

  listContainer.innerHTML = '';
  let objectCount = 0;

  objects.forEach((object, id) => {
    objectCount++;
    const item = document.createElement('div');
    item.className = 'object-item';

    const label = document.createElement('span');
    label.textContent = id;

    const btn = document.createElement('button');
    btn.textContent = '🗑️';
    btn.addEventListener('click', () => deleteObject(id));

    item.appendChild(label);
    item.appendChild(btn);
    listContainer.appendChild(item);
  });

  count.textContent = objectCount;
  updateDebug();
}

// Función de arranque que se usa desde React
export function initThreeEditor() {
  if (!scene) {
    init();
  }
}
