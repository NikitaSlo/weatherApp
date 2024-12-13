import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "../earth/getStarfield.js";
import { getFresnelMat } from "../earth/getFresnelMat.js";

// Get a reference to the `.earth-container` element
const earthContainer = document.getElementById("earth-container");

const w = earthContainer.clientWidth; // Use the width from the wrapper
const h = earthContainer.clientHeight; // Use the height from the wrapper

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
earthContainer.appendChild(renderer.domElement); // Append to the wrapper

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);

const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);

const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});

const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function handleWindowResize() {
  // Adjust the camera aspect ratio and renderer size based on the wrapper
  const newWidth = earthContainer.clientWidth;
  const newHeight = earthContainer.clientHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
}

document.getElementById('earth-btn').addEventListener('click', function() {
  const earthWrapper = document.querySelector('.earth-wrapper');
  earthWrapper.classList.toggle('visible'); 

  // // Resizing the canvas if the wrapper is made visible
  // if (earthWrapper.classList.contains('visible')) {
  //     handleWindowResize(); // Ensure the canvas is resized accordingly
  // }
});

window.addEventListener('resize', handleWindowResize, false);

handleWindowResize();



function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.001;
  lightsMesh.rotation.y += 0.001;
  cloudsMesh.rotation.y += 0.0013;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();
