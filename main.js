import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Sky } from 'three/addons/objects/Sky.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true} );
const heartAudio = new Audio('audio.m4a');
heartAudio.preload = 'auto';

renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
 const controls = new OrbitControls( camera, canvas );
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let juan = {
    instance: null,
    moveDistance: 2,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.1,
    forwardOffset: Math.PI
}
const modalContent = {
    juan: {
        title: "Project One",
        content: "this is proejct one",   
        
},
    headshot: {
        title: "Project One",
        content: "this is proejct one",  
       
},
    sign: {
        title: "Project One",
        content: "this is proejct one",  
        link: "https://example.com/", 
},
};
  const modal = document.querySelector('.modal');
const modalTitle = document.querySelector('.modal-title');
const modalProjectDescription = document.querySelector('.modal-project-description');
const modalExitButton = document.querySelector('.modal-exit-button');
const modalVisitProjectButton = document.querySelector('.modal-project-visit-button');


// Bloom
renderer.outputColorSpace = THREE.SRGBColorSpace;

let bloomComposer;
let bloomPass;
let finalComposer;

function initPostprocessing() {
  const bloomRender = new RenderPass(scene, camera);
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(bloomRender);
bloomComposer.renderToScreen = true;
finalComposer = null;
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.02,
    0.08
  );
  bloomComposer.addPass(bloomPass);
  bloomComposer.renderToScreen = false;

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
    }),
    "baseTexture"
  );

  const finalRender = new RenderPass(scene, camera);
  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(finalRender);
  finalComposer.addPass(mixPass);

  const outputPass = new OutputPass();
  finalComposer.addPass(outputPass);
}

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materials = {};
const visibility = {};

function nonBloomed(obj) {
  if (bloomLayer.test(obj.layers)) return;

  if (obj.isMesh) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
    return;
  }

  if (obj.isPoints || obj.isLine || obj.isSprite) {
    visibility[obj.uuid] = obj.visible;
    obj.visible = false;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }

  if (visibility[obj.uuid] !== undefined) {
    obj.visible = visibility[obj.uuid];
    delete visibility[obj.uuid];
  }
}

function showModal(id) {
    const content = modalContent[id];
    if(content) {
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;
        if (content.link) {
            modalVisitProjectButton.href = content.link;
            modalVisitProjectButton.classList.remove("hidden");
        }else{
            modalVisitProjectButton.classList.remove("hidden");
        }
        modal.classList.toggle("hidden");
        
    }
}

function hideModal() {
    modal.classList.toggle("hidden");
}


 camera.position.x = -42;
camera.position.y = 36;
camera.position.z = 23;
 controls.update();
let intersectObject = '';
 

const charLoader = new GLTFLoader();


const loader = new GLTFLoader();
const intersectObjects = [];
const intersectObjectsNames = [
    "juan",
    "headshot",
    "sign",
];
//
charLoader.load('./valentinModel.glb', (gltf) => {
    juan.instance = gltf.scene;
    juan.instance.scale.set(3, 3, 3);
    juan.instance.position.set(0,-6.9,20);
    juan.instance.castShadow = false;
    juan.instance.receiveShadow = false;
    juan.instance.rotation.set(0, Math.PI, 0)
     
    juan.instance.traverse((child) => {
  if (!child.isMesh) return;
  const m = child.material;
  if (!m) return;

  if ("roughness" in m) m.roughness = Math.max(m.roughness, 0.6);
  if ("metalness" in m) m.metalness = Math.min(m.metalness, 0.1);
});
    scene.add(juan.instance);
    juan.instance.add(new THREE.AxesHelper(2))
}
)
let heart = null;
const dLoader = new DRACOLoader();
dLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
dLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dLoader);
loader.load(
    "./valentinWorld.glb", 
    function (glb) {
        glb.scene.traverse((child) => {
        console.log(child);
        if (intersectObjectsNames.includes(child.name)) {
            intersectObjects.push(child);
        }
        //

        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
 
        if (child.name.startsWith('heart')) {
            child.material.emissive = new THREE.Color('#ff2a2a');
  child.material.emissiveIntensity = 1; // try 10–50
  bloomPass.strength = 1.0;
bloomPass.threshold = 0.3;
bloomPass.radius = 0.5;
            heart = child;
            console.log('hiii')
        child.layers.enable(BLOOM_SCENE);
        const light = new THREE.PointLight('#E72D00', .5, 10, 1);  
        light.position.set(0, 1, 0);
        child.add(light);
        child.traverse((desc) => desc.layers.enable(BLOOM_SCENE));
      }

         
    });
        scene.add(glb.scene);
    },
    undefined,
    function(error) {
        console.error(error);
    }
);

 
const light = new THREE.DirectionalLight(0xffffff, .8);
light.position.set(50, 60, 20);
light.castShadow = true;

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;

light.shadow.camera.near = 1;
light.shadow.camera.far = 200;
light.shadow.camera.left = -80;
light.shadow.camera.right = 80;
light.shadow.camera.top = 80;
light.shadow.camera.bottom = -80;

light.shadow.bias = -0.0002;        // helps acne
light.shadow.normalBias = 0.02;     // helps acne on glTF

scene.add(light);
const helper = new THREE.DirectionalLightHelper( light, 5 );
scene.add( helper );

light.shadow.normalBias = 0.1;
 
function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (bloomComposer) bloomComposer.setSize(sizes.width, sizes.height);
  if (finalComposer) finalComposer.setSize(sizes.width, sizes.height);
  if (bloomPass) bloomPass.setSize(sizes.width, sizes.height);
}


function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  // raycast from last pointer position
  raycaster.setFromCamera(pointer, camera);

  // include heart meshes too (either store them, or raycast whole scene)
  const hits = raycaster.intersectObjects(scene.children, true);

  if (!hits.length) return;

  // find the first hit whose object (or parent) is the heart
  const hit = hits.find(h =>
    h.object.name.startsWith('heart') ||
    h.object.parent?.name?.startsWith('heart')
  );

  if (hit) {
    heartAudio.currentTime = 0;
    heartAudio.play().catch(err => console.error("Audio play failed:", err));
    return; // stop here if you don't want modal
  }

  // your existing modal logic
  if (intersectObject !== "") {
    showModal(intersectObject);
  }
}


const amColor = 0xFFFFFF;
const amIntensity = .5;
const ambientLight = new THREE.AmbientLight(amColor, amIntensity);
scene.add(ambientLight);
// Soft environment-style lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, .8);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);


function moveCharacter(targetPosition, targetRotation) {
    juan.isMoving = true;
    const t1 = gsap.timeline({onComplete: () => {
        juan.isMoving = false;
    },});
    t1.to(juan.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: juan.moveDuration,
    });

    t1.to(juan.instance.rotation, {
        y: targetRotation,
        duration: juan.moveDuration,
    },0);

    t1.to(juan.instance.position, {
        y: targetPosition.y + juan.jumpHeight,
        duration: juan.moveDuration / 2,
        yoyo: true,
        repeat: 1,
    },0);

    
}
function onKeyDown(event) {
  if (!juan.instance) return;
  if (juan.isMoving) return;

  const key = event.key.toLowerCase();

  // direction in X/Z plane
  let dx = 0;
  let dz = 0;

  switch (key) {
    case "w":
    case "arrowup":
      dz = -1;
      break;
    case "s":
    case "arrowdown":
      dz = 1;
      break;
    case "a":
    case "arrowleft":
      dx = -1;
      break;
    case "d":
    case "arrowright":
      dx = 1;
      break;
    default:
      return;
  }

  const targetPosition = juan.instance.position.clone();
  targetPosition.x += dx * juan.moveDistance;
  targetPosition.z += dz * juan.moveDistance;

  // rotation that faces movement direction
  // atan2(x, z) gives yaw for Three's Y-up world
  const targetRotation = (Math.atan2(dx, dz) + juan.forwardOffset) + Math.PI;

  moveCharacter(targetPosition, targetRotation);
}

function heartClick() {
    const audio = new Audio('audio.m4a');
    audio.play();
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener("click", onClick);
window.addEventListener("resize", handleResize);
window.addEventListener("pointermove", onPointerMove);
modalExitButton.addEventListener("click", hideModal);
 
 
function animate() {
  if (heart) {
    heart.rotation.y += 0.01;
    heart.rotation.z += 0.01;
    heart.rotation.x += 0.01;
  }

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(intersectObjects);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
    intersectObject = intersects[0].object.parent.name;
  } else {
    document.body.style.cursor = "default";
    intersectObject = "";
  }

  // --- BLOOM PIPELINE ---
  if (bloomComposer && finalComposer) {
    renderer.clear();

    scene.traverse(nonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);

    finalComposer.render();
  } else {
    renderer.render(scene, camera);
  }
}

renderer.setAnimationLoop( animate ); 
  initPostprocessing();
  const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 8;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

// sun position
const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 15);  // elevation
const theta = THREE.MathUtils.degToRad(180);    // azimuth
sun.setFromSphericalCoords(1, phi, theta);

skyUniforms['sunPosition'].value.copy(sun);

// optional: use it for lighting/reflections (simple approximation)
scene.environment = null; // keep if you don't want environment reflections
