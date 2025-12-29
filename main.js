
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
    renderer.setClearColor(0x3a2885);
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 200);
    pointLight.position.set(5, 10, 15);
    scene.add(pointLight);

    // --- 3D Text Management ---
    const textMeshes = [];
    const fontLoader = new FontLoader();

    const getViewportSize = () => {
        const distance = camera.position.z;
        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * distance;
        const width = height * camera.aspect;
        return { width, height };
    };
    
    const positionText = (textItem) => {
        const container = document.getElementById(textItem.id);
        if (!container) return;

        const viewport = getViewportSize();
        const rect = container.getBoundingClientRect();

        const x_ratio = (rect.left + rect.width / 2) / window.innerWidth;
        const y_ratio = (rect.top + rect.height / 2) / window.innerHeight;

        const worldX = (x_ratio - 0.5) * viewport.width;
        const worldY = -(y_ratio - 0.5) * viewport.height;

        textItem.mesh.position.set(worldX, worldY, 0);
        textItem.initialPosition.copy(textItem.mesh.position);
        textItem.bbox.setFromObject(textItem.mesh);
        console.log(`Positioned ${textItem.id} at:`, textItem.mesh.position);
    };

    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.166.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const createTextMesh = (text, size) => {
            const textGeometry = new TextGeometry(text, {
                font: font, size: size, height: 0.2, curveSegments: 12, bevelEnabled: true,
                bevelThickness: 0.03, bevelSize: 0.02, bevelOffset: 0, bevelSegments: 5
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.5, roughness: 0.3 });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(textMesh);
            return textMesh;
        };

        const textItems = [
            { text: "Tux's Socials", size: 3.5, id: 'hero-text-placeholder' },
            { text: 'TikTok', size: 1, id: 'tiktok-text' },
            { text: 'YouTube', size: 1, id: 'youtube-text' },
            { text: 'Twitch', size: 1, id: 'twitch-text' },
            { text: 'made by kantasu', size: 0.5, id: 'footer-text' }
        ];

        textItems.forEach(config => {
            const mesh = createTextMesh(config.text, config.size);
            const bbox = new THREE.Box3();
            textMeshes.push({
                mesh: mesh, id: config.id, bbox: bbox,
                initialPosition: new THREE.Vector3(),
                anim: { speedFactor: 0.5 + Math.random(), timeOffset: Math.random() * Math.PI * 2 }
            });
        });

        textMeshes.forEach(positionText);
    });

    // Disc Creation
    const discGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 64);
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x6A0DAD, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0x00FFFF, metalness: 0.3, roughness: 0.4 }),
    ];
    const discs = [];
    const numDiscs = 25;
    let viewport = getViewportSize();

    for (let i = 0; i < numDiscs; i++) {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const disc = new THREE.Mesh(discGeometry, material);
        const scale = Math.random() * 1.5 + 0.5;
        disc.scale.set(scale, scale, scale);
        disc.position.set(
            (Math.random() - 0.5) * viewport.width, (Math.random() - 0.5) * viewport.height, (Math.random() - 0.5) * 15
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

        textMeshes.forEach(item => {
            if (item.initialPosition.x !== 0 || item.initialPosition.y !== 0) { // Check if initialPosition is set
                const animTime = time * item.anim.speedFactor + item.anim.timeOffset;
                item.mesh.position.set(
                    item.initialPosition.x,
                    item.initialPosition.y + Math.sin(animTime * 2) * 0.05,
                    item.initialPosition.z
                );
                item.mesh.rotation.y = Math.sin(animTime * 0.7) * 0.05;
                item.mesh.rotation.x = Math.sin(animTime * 0.5) * 0.05;
                item.bbox.setFromObject(item.mesh);
            }
        });

        const halfWidth = viewport.width / 2, halfHeight = viewport.height / 2, halfDepth = 10;

        discs.forEach((disc, i) => {
            disc.position.add(disc.userData.velocity);
            disc.rotation.x += disc.userData.spin.x; disc.rotation.y += disc.userData.spin.y;

            const radius = disc.userData.radius;
            if ((disc.position.x + radius > halfWidth && disc.userData.velocity.x > 0) || (disc.position.x - radius < -halfWidth && disc.userData.velocity.x < 0)) disc.userData.velocity.x *= -1;
            if ((disc.position.y + radius > halfHeight && disc.userData.velocity.y > 0) || (disc.position.y < -halfHeight && disc.userData.velocity.y < 0)) disc.userData.velocity.y *= -1;
            if ((disc.position.z + radius > halfDepth && disc.userData.velocity.z > 0) || (disc.position.z - radius < -halfDepth && disc.userData.velocity.z < 0)) disc.userData.velocity.z *= -1;

            // Disc-Disc Collision
            for (let j = i + 1; j < discs.length; j++) {
                const otherDisc = discs[j];
                const dist = disc.position.distanceTo(otherDisc.position);
                const min_dist = disc.userData.radius + otherDisc.userData.radius;
                if (dist < min_dist) {
                    const normal = disc.position.clone().sub(otherDisc.position).normalize();
                    const tangent = new THREE.Vector3(-normal.y, normal.x, 0).normalize();
                    const v1 = disc.userData.velocity, v2 = otherDisc.userData.velocity;
                    const v1n = normal.dot(v1), v1t = tangent.dot(v1);
                    const v2n = normal.dot(v2), v2t = tangent.dot(v2);
                    const v1n_new = (v1n * (disc.userData.radius - otherDisc.userData.radius) + 2 * otherDisc.userData.radius * v2n) / (min_dist);
                    const v2n_new = (v2n * (otherDisc.userData.radius - disc.userData.radius) + 2 * disc.userData.radius * v1n) / (min_dist);
                    disc.userData.velocity = normal.clone().multiplyScalar(v1n_new).add(tangent.clone().multiplyScalar(v1t));
                    otherDisc.userData.velocity = normal.clone().multiplyScalar(v2n_new).add(tangent.clone().multiplyScalar(v2t));
                    const overlap = min_dist - dist;
                    disc.position.add(normal.clone().multiplyScalar(overlap / 2));
                    otherDisc.position.sub(normal.clone().multiplyScalar(overlap / 2));
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
        textMeshes.forEach(positionText);
    });

    animate();
});
