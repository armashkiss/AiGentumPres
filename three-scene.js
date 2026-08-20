import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';

const canvas = document.getElementById('metal-scene');
if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Graceful static fallback.
} else {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 80);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const world = new THREE.Group();
    world.position.x = innerWidth > 900 ? 2.8 : 0.5;
    scene.add(world);

    const silver = new THREE.MeshStandardMaterial({
      color: 0xdfe3e7,
      metalness: 0.93,
      roughness: 0.24,
      transparent: true,
      opacity: 0.31,
      wireframe: true
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x8a929b,
      metalness: 0.98,
      roughness: 0.18,
      transparent: true,
      opacity: 0.075
    });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.34, 3), darkMetal);
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 2), silver);
    world.add(core, cage);

    [1.92, 2.45, 3.08].forEach((radius, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.013 + i * 0.003, 8, 140),
        new THREE.MeshBasicMaterial({ color: i === 1 ? 0xf3f5f7 : 0xaeb5bd, transparent: true, opacity: 0.18 - i * .025 })
      );
      ring.rotation.x = Math.PI * (0.45 + i * .11);
      ring.rotation.y = i * .72;
      ring.userData.speed = (i % 2 ? -1 : 1) * (0.00022 + i * .00006);
      world.add(ring);
    });

    const nodeGroup = new THREE.Group();
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0xe7eaed, metalness: .8, roughness: .28, emissive: 0x4d535a, emissiveIntensity: .18 });
    const nodePositions = [];
    const nodeCount = innerWidth < 700 ? 22 : 34;
    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.7 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * .7,
        radius * Math.sin(phi) * Math.sin(theta) * .8
      );
      nodePositions.push(pos);
      const node = new THREE.Mesh(new THREE.SphereGeometry(i % 6 === 0 ? .075 : .045, 10, 10), nodeMat);
      node.position.copy(pos);
      nodeGroup.add(node);
    }
    world.add(nodeGroup);

    const linePositions = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.75 && Math.random() > .22) {
          linePositions.push(...nodePositions[i].toArray(), ...nodePositions[j].toArray());
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xcdd2d8, transparent: true, opacity: .12 }));
    world.add(lines);

    const particles = innerWidth < 700 ? 320 : 760;
    const p = new Float32Array(particles * 3);
    for (let i = 0; i < particles; i++) {
      const r = 4 + Math.random() * 8;
      const a = Math.random() * Math.PI * 2;
      p[i*3] = Math.cos(a) * r + (Math.random()-.5)*2;
      p[i*3+1] = (Math.random()-.5) * 8;
      p[i*3+2] = Math.sin(a) * r - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const stars = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd8dde2, size: innerWidth < 700 ? .022 : .028, transparent: true, opacity: .34, sizeAttenuation: true }));
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.PointLight(0xffffff, 11, 24, 1.7); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0x89929b, 7, 20, 1.5); rim.position.set(-5, -2, 3); scene.add(rim);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    window.addEventListener('pointermove', e => {
      targetX = (e.clientX / innerWidth - .5) * .9;
      targetY = (e.clientY / innerHeight - .5) * .7;
    }, { passive: true });

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      mouseX += (targetX - mouseX) * .035;
      mouseY += (targetY - mouseY) * .035;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const s = scrollY / maxScroll;

      world.rotation.y = t * .035 + mouseX * .22 + s * 1.45;
      world.rotation.x = -0.08 + mouseY * .12 + Math.sin(t * .3) * .025;
      world.position.y = Math.sin(t * .24) * .16 - s * .42;
      cage.rotation.y = t * .16;
      cage.rotation.x = t * .09;
      core.rotation.y = -t * .075;
      nodeGroup.rotation.y = -t * .025;
      lines.rotation.y = -t * .025;
      stars.rotation.y = t * .006;

      world.children.forEach(obj => {
        if (obj.userData.speed) obj.rotation.z += obj.userData.speed * 16.67;
      });

      camera.position.x = mouseX * .35;
      camera.position.y = -mouseY * .26;
      camera.lookAt(0.8, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(innerWidth, innerHeight, false);
      world.position.x = innerWidth > 900 ? 2.8 : .5;
    };
    window.addEventListener('resize', resize, { passive: true });
  } catch (err) {
    console.warn('AIgentum WebGL fallback:', err);
    canvas.style.display = 'none';
  }
}
