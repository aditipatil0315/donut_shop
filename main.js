import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1, 1);

const target = document.querySelector("#app");
const renderer = new THREE.WebGLRenderer({canvas:target});
renderer.setSize(window.innerWidth, window.innerHeight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new RGBELoader();
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/klippad_sunrise_1_1k.hdr",
  (evnMap) => {
    evnMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = evnMap;
  }
);




const loadedModels = [];
const modelLoader = new GLTFLoader();

function loadModel(url, scale) {
  return new Promise((resolve) => {
    modelLoader.load(url, (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale.x, scale.y, scale.z);
      resolve(model);
    });
  });
}
const donuts = new THREE.Group();




async function loadAllModels() {
  const models = await Promise.all([
    loadModel("/chocolate_donut.glb", { x: 25, y: 25, z: 25 }),
    loadModel("/donut_glazed.glb", { x: 12.5, y: 12.5, z: 12.5 }),
    loadModel("/spider_halloween_donut.glb", { x: 7.7, y: 7.7, z: 7.7 }),
    loadModel("/donut.glb", { x: 0.025, y: 0.025, z: 0.025 }),
  ]);

  models.forEach((model) => loadedModels.push(model));
  
  const radius = 9; 
  const totalDonuts = loadedModels.length;

  loadedModels.forEach((donut, index) => {
    const angle = (index / totalDonuts) * Math.PI * 2; 
    donut.position.x = radius * Math.cos(angle);
    donut.position.z = radius * Math.sin(angle);
    if( index === 1) {
      donut.rotation.x = 1.2;
    donut.rotation.y = -5.5;
    donut.rotation.z = -0.3;
    }
    if(index === 3) {
      donut.rotation.x = 5;
    donut.rotation.y = 2;

    }
    // donut.lookAt(camera.position);
    // gsap.to(donut.rotation, {
    //   y:`${0.007}`,
    //   duration: 5,
    //   repeat: -1,
    //   yoyo: true,
    //   ease: "easeIn"
    // })

    donuts.add(donut);
    console.log(index)
  });

  
  scene.add(donuts);
  donuts.position.z = -7.8;
}

loadAllModels();

const startext = new THREE.TextureLoader().load('/texture4.jpg');
const starGeo = new THREE.SphereGeometry(15, 64,64);
const starMat = new THREE.MeshBasicMaterial({
  map: startext,
  transparent: true,
  opacity: 1,
  side: THREE.BackSide,
});

const starSphere = new THREE.Mesh(starGeo, starMat);
starSphere.position.z = -10; 
starSphere.renderOrder = -1; 
scene.add(starSphere);


camera.position.z = 5;

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttleWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    const direction = event.deltaY > 0 ? "+=100" : "-=100";
    scrollCount = (scrollCount + 1) % 4;
    console.log(scrollCount);

    donuts.children.forEach((donut, index) => {
      console.log(index)
      gsap.to(donut.rotation, {
        z: `+=${Math.PI/2}`,
        x: `-=${Math.PI/2}`,
        z: `+=${Math.PI/2}`,  
        duration: 1,
        ease: "power2.inOut",
        stagger: index * 0.1,  // Optional: Stagger the rotation to add visual appeal
      });
    });

    const headings = document.querySelectorAll("h3");
    gsap.to( headings, {
      y: `-=${90}`,
      ease: "easeIn",
      // stagger: 0.3
    })

    gsap.to(donuts.rotation , {
      y : `+=${Math.PI/2}`,
      duration : 1,
      ease : "expo.easeIn",
      // stagger: 0.3
  })


    if(scrollCount === 0) {
      gsap.to( headings, {
        y: `0`,
        ease: "power2.inOut"
      })
    }
  }

}

const page_one = document.querySelector(".page_one");

page_one.addEventListener("wheel", throttleWheelHandler);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", onWindowResize);
function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
