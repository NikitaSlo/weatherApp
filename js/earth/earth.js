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
  // map: loader.load("./resources/textures/00_earthmap1k.jpg"),
  // specularMap: loader.load("./resources/textures/02_earthspec1k.jpg"),
  // bumpMap: loader.load("./resources/textures/01_earthbump1k.jpg"),
  // bumpScale: 0.04,
});

const earthMesh = new THREE.Mesh(geometry, material);
// earthGroup.add(earthMesh);

// const lightsMat = new THREE.MeshBasicMaterial({
//   map: loader.load("./resources/textures/03_earthlights1k.jpg"),
//   blending: THREE.AdditiveBlending,
// });
// const lightsMesh = new THREE.Mesh(geometry, lightsMat);
// earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./resources/textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./resources/textures/05_earthcloudmaptrans.jpg'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
// earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
// earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);



let geoJsonData;

// Step 1: Load GeoJSON data
async function loadGeoJSON() {
  const response = await fetch('../resources/borders/custom.geo.json'); 
  geoJsonData = await response.json();
}

const countryBorders = [];

// Step 2: Create a function to process and display country borders
function createCountryBorders() {
  geoJsonData.features.forEach(feature => {
      const countryName = feature.properties.name;

      if (feature.geometry.type === "MultiPolygon") {
          // Each feature may have multiple polygons.
          feature.geometry.coordinates.forEach(polygon => {
              const points = [];
              
              // The polygon is an array where the first index contains a single ring
              // Inside your createCountryBorders function
              polygon.forEach(ring => {
                ring.forEach(coord => {
                    const longitude = coord[0] * (Math.PI / 180); // Convert degrees to radians
                    const latitude = coord[1] * (Math.PI / 180); // Convert degrees to radians

                    // Check if the calculated values are finite numbers
                    if (!isFinite(longitude) || !isFinite(latitude)) {
                        console.error('Invalid coordinates:', coord);
                        return; // Skip invalid coordinates
                    }

                    // Calculate the 3D coordinates for points on the sphere
                    const radius = 1; // Assuming your sphere has a radius of 1
                    const x = radius * Math.cos(latitude) * Math.cos(longitude);
                    const y = radius * Math.cos(latitude) * Math.sin(longitude);
                    const z = radius * Math.sin(latitude);

                    // Check calculated values before adding to points
                    if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
                        console.error('Computed 3D coordinates are not finite:', { x, y, z, coord });
                        return; // Skip invalid calculations
                    }

                    points.push(new THREE.Vector3(x, y, z));
                });

                // Close the ring by returning to the first point
                if (points.length > 0) {
                    points.push(points[0]);
                }
                
              });

              // Create line geometry and mesh for the border
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const borderMesh = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
              earthGroup.add(borderMesh);

              // Store the country border along with its name
              countryBorders.push({ mesh: borderMesh, name: countryName });
          });
      } else if (feature.geometry.type === "Polygon") {
          // Handle single polygons similarly
          const points = [];
          feature.geometry.coordinates.forEach(coord => {
              const longitude = coord[0] * (Math.PI / 180); // Convert degrees to radians
              const latitude = coord[1] * (Math.PI / 180); // Convert degrees to radians
              
              // Calculate the 3D coordinates for points on the sphere
              const radius = 1; // Assuming your sphere has a radius of 1
              const x = radius * Math.cos(latitude) * Math.cos(longitude);
              const y = radius * Math.cos(latitude) * Math.sin(longitude);
              const z = radius * Math.sin(latitude);

              points.push(new THREE.Vector3(x, y, z));
          });

          // Close the polygon by returning to the first point
          if (points.length > 0) {
              points.push(points[0]);
          }

          // Create line geometry and mesh for the border
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const borderMesh = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
          earthGroup.add(borderMesh);

          // Store the country border along with its name
          countryBorders.push({ mesh: borderMesh, name: countryName });
      }
  });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Step 3: Raycasting to detect clicks
function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(countryBorders.map(country => country.mesh));

  if (intersects.length > 0) {
    const intersectedBorder = intersects[0].object;
    // Find the country name based on the intersected border
    const countryInfo = countryBorders.find(country => country.mesh === intersectedBorder);
    if (countryInfo) {
      console.log("Clicked on country:", countryInfo.name); // Log the name of the country
    }
  }
}


// Event listener for click
window.addEventListener('click', onMouseClick, false);

// Load the GeoJSON and create borders
loadGeoJSON().then(createCountryBorders);



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

  // earthMesh.rotation.y += 0.001;
  // lightsMesh.rotation.y += 0.001;
  // cloudsMesh.rotation.y += 0.0013;
  // glowMesh.rotation.y += 0.002;
  // stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();
