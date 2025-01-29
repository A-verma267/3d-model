import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import './style.css';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3.5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ canvas : document.querySelector("#canvas") , alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio,2);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Setup post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015;
composer.addPass(rgbShiftPass);

let model;

// Load HDRI environment map
new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lilienstein_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        
        // Load GLTF model after environment is ready
        const loader = new GLTFLoader();
        loader.load(
            './DamagedHelmet.gltf', // Path to your GLTF file
            function (gltf) {
              model= gltf.scene
                scene.add(model);
                // Adjust model position/scale if needed
                gltf.scene.position.set(0, 0, 0);
                gltf.scene.scale.set(1, 1, 1);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened:', error);
            }
        );
    });

window.addEventListener("mousemove", (e)=>{
  if (model){
    const rotationX = (e.clientX/window.innerWidth - .5) * (Math.PI * .09);
    const rotationY = (e.clientY/window.innerHeight - .5) * (Math.PI * .09);
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.3,
    //   ease: "power2.out"
    });
  }
});



// Animation loop
function animate() {
    window.requestAnimationFrame(animate);
    composer.render(); // Use composer instead of renderer
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size
    renderer.setPixelRatio(window.devicePixelRatio);
});
