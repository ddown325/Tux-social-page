
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

document.addEventListener('DOMContentLoaded', () => {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x3a2885); // Setting the purple background color
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 3;

    // 3D Text
    let textMesh;
    const fontLoader = new FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.166.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry("Tux's Socials", {
            font: font,
            size: 2.5,
            height: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        textGeometry.center();

        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0.3
        });

        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 3, 0); // Position it in the hero section
        scene.add(textMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 200);
    pointLight.position.set(5, 10, 15);
    scene.add(pointLight);

    // Get viewport size
    const getViewportSize = () => {
        const distance = camera.position.z;
        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * distance;
        const width = height * camera.aspect;
        return { width, height };
    };

    let viewport = getViewportSize();

    // Disc Creation
    const discGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 64);
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x6A0DAD, metalness: 0.3, roughness: 0.4 }), // Purple
        new THREE.MeshStandardMaterial({ color: 0x00FFFF, metalness: 0.3, roughness: 0.4 }), // Teal
    ];

    const discs = [];
    const numDiscs = 25;

    for (let i = 0; i < numDiscs; i++) {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const disc = new THREE.Mesh(discGeometry, material);
        const scale = Math.random() * 1.5 + 0.5;
        disc.scale.set(scale, scale, scale);

        disc.position.set(
            (Math.random() - 0.5) * viewport.width,
            (Math.random() - 0.5) * viewport.height,
            (Math.random() - 0.5) * 15
        );

        disc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        
        disc.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.01);
        disc.userData.spin = new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0);
        disc.userData.radius = scale;

        scene.add(disc);
        discs.push(disc);
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.0005;

        if (textMesh) {
            textMesh.position.y = 3 + Math.sin(time * 2) * 0.1;
            textMesh.rotation.y = Math.sin(time * 0.7) * 0.05;
            textMesh.rotation.x = Math.sin(time * 0.5) * 0.05;
        }

        const halfWidth = viewport.width / 2;
        const halfHeight = viewport.height / 2;
        const halfDepth = 10;

        discs.forEach((disc, i) => {
            disc.position.add(disc.userData.velocity);
            disc.rotation.x += disc.userData.spin.x;
            disc.rotation.y += disc.userData.spin.y;

            const radius = disc.userData.radius;
            if (disc.position.x + radius > halfWidth || disc.position.x - radius < -halfWidth) {
                disc.userData.velocity.x *= -1;
                disc.position.x = Math.max(-halfWidth + radius, Math.min(halfWidth - radius, disc.position.x));
            }
            if (disc.position.y + radius > halfHeight || disc.position.y - radius < -halfHeight) {
                disc.userData.velocity.y *= -1;
                disc.position.y = Math.max(-halfHeight + radius, Math.min(halfHeight - radius, disc.position.y));
            }
             if (disc.position.z + radius > halfDepth || disc.position.z - radius < -halfDepth) {
                disc.userData.velocity.z *= -1;
                disc.position.z = Math.max(-halfDepth + radius, Math.min(halfDepth - radius, disc.position.z));
            }

            for (let j = i + 1; j < discs.length; j++) {
                const otherDisc = discs[j];
                const dist = disc.position.distanceTo(otherDisc.position);
                const min_dist = disc.userData.radius + otherDisc.userData.radius;

                if (dist < min_dist) {
                    const normal = disc.position.clone().sub(otherDisc.position).normalize();
                    const tangent = new THREE.Vector3(-normal.y, normal.x, 0);
                    const v1 = disc.userData.velocity;
                    const v2 = otherDisc.userData.velocity;
                    const v1n = normal.dot(v1);
                    const v1t = tangent.dot(v1);
                    const v2n = normal.dot(v2);
                    const v2t = tangent.dot(v2);
                    const v1n_new = (v1n * (disc.userData.radius - otherDisc.userData.radius) + 2 * otherDisc.userData.radius * v2n) / (disc.userData.radius + otherDisc.userData.radius);
                    const v2n_new = (v2n * (otherDisc.userData.radius - disc.userData.radius) + 2 * disc.userData.radius * v1n) / (disc.userData.radius + otherDisc.userData.radius);
                    const v1_normal_new = normal.clone().multiplyScalar(v1n_new);
                    const v2_normal_new = normal.clone().multiplyScalar(v2n_new);
                    const v1_tangent_new = tangent.clone().multiplyScalar(v1t);
                    const v2_tangent_new = tangent.clone().multiplyScalar(v2t);
                    disc.userData.velocity = v1_normal_new.add(v1_tangent_new);
                    otherDisc.userData.velocity = v2_normal_new.add(v2_tangent_new);
                    const overlap = min_dist - dist;
                    const correction = normal.multiplyScalar(overlap / 2);
                    disc.position.add(correction);
                    otherDisc.position.sub(correction);
                }
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        viewport = getViewportSize();
    });

    animate();
});
