import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';

const canvas = document.getElementById('metal-scene');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !reduce) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.1, 90);
    camera.position.set(0, 0, 11.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const world = new THREE.Group();
    world.position.x = innerWidth > 900 ? 2.95 : .5;
    scene.add(world);

    const silver = new THREE.MeshStandardMaterial({
      color: 0xe4e8ec,
      metalness: .94,
      roughness: .2,
      transparent: true,
      opacity: .31,
      wireframe: true
    });
    const darkMetal = new THREE.MeshPhysicalMaterial({
      color: 0x747d88,
      metalness: 1,
      roughness: .18,
      transmission: .06,
      transparent: true,
      opacity: .10,
      clearcoat: .9,
      clearcoatRoughness: .18
    });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.32, 4), darkMetal);
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.42, 2), silver);
    world.add(core, cage);

    // Inner luminous lattice - restrained cool light rather than a neon glow.
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(.72, 2),
      new THREE.MeshBasicMaterial({
        color: 0xa8c8f1,
        transparent: true,
        opacity: .14,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    world.add(inner);

    const haloGroup = new THREE.Group();
    const ringConfig = [
      [1.9, 0xe9edf1, .19, .00026],
      [2.42, 0xaac9ef, .13, -.00021],
      [3.04, 0xd9c4aa, .09, .00017],
      [3.56, 0xcbd2da, .07, -.00012]
    ];
    ringConfig.forEach(([radius, color, opacity, speed], i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, .012 + i * .002, 8, 160),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI * (.42 + i * .095);
      ring.rotation.y = i * .67;
      ring.userData.speed = speed;
      haloGroup.add(ring);
    });
    world.add(haloGroup);

    // Data nodes and local connections.
    const nodeGroup = new THREE.Group();
    const nodePositions = [];
    const nodeCount = innerWidth < 700 ? 20 : 36;
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xe9edf1,
      metalness: .82,
      roughness: .24,
      emissive: 0x6f8eaf,
      emissiveIntensity: .16
    });
    const warmNodeMat = nodeMat.clone();
    warmNodeMat.emissive.setHex(0x8c7257);
    warmNodeMat.emissiveIntensity = .12;

    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.62 + Math.random() * 2.16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * .72,
        radius * Math.sin(phi) * Math.sin(theta) * .82
      );
      nodePositions.push(pos);
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(i % 7 === 0 ? .078 : .044, 12, 12),
        i % 9 === 0 ? warmNodeMat : nodeMat
      );
      node.position.copy(pos);
      node.userData.phase = Math.random() * Math.PI * 2;
      nodeGroup.add(node);
    }
    world.add(nodeGroup);

    const linePositions = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.7 && Math.random() > .28) {
          linePositions.push(...nodePositions[i].toArray(), ...nodePositions[j].toArray());
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xd8dee4, transparent: true, opacity: .11 })
    );
    world.add(lines);

    // Small orbiting signal points provide a premium animated focal cue.
    const signals = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.x = .45 + i * .2;
      pivot.rotation.y = i * .76;
      pivot.userData.speed = (i % 2 ? -1 : 1) * (.12 + i * .012);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(.035 + (i % 3) * .009, 10, 10),
        new THREE.MeshBasicMaterial({
          color: i === 3 ? 0xe2c9ab : 0xc3ddff,
          transparent: true,
          opacity: .88,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      dot.position.x = 1.8 + i * .27;
      pivot.add(dot);
      signals.add(pivot);
    }
    world.add(signals);

    // Fine background particles.
    const particles = innerWidth < 700 ? 280 : 700;
    const pos = new Float32Array(particles * 3);
    for (let i = 0; i < particles; i++) {
      const r = 4 + Math.random() * 8.5;
      const a = Math.random() * Math.PI * 2;
      pos[i*3] = Math.cos(a) * r + (Math.random()-.5) * 2.2;
      pos[i*3+1] = (Math.random()-.5) * 8.5;
      pos[i*3+2] = Math.sin(a) * r - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0xe0e5ea,
        size: innerWidth < 700 ? .022 : .028,
        transparent: true,
        opacity: .3,
        sizeAttenuation: true
      })
    );
    scene.add(stars);

    // Metallic lighting with very subtle cold/warm contrast.
    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const key = new THREE.PointLight(0xf7f8fa, 12, 24, 1.65);
    key.position.set(3.2, 4.2, 5);
    scene.add(key);
    const cool = new THREE.PointLight(0x8fb9ef, 5.2, 19, 1.6);
    cool.position.set(-4.8, 1.2, 3.8);
    scene.add(cool);
    const warm = new THREE.PointLight(0xd1b38f, 2.4, 17, 1.7);
    warm.position.set(4.5, -3.5, 2);
    scene.add(warm);

    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * .9;
      ty = (e.clientY / innerHeight - .5) * .7;
    }, { passive: true });

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      mx += (tx - mx) * .035;
      my += (ty - my) * .035;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const s = scrollY / maxScroll;

      world.rotation.y = t * .031 + mx * .23 + s * 1.42;
      world.rotation.x = -.08 + my * .12 + Math.sin(t * .31) * .022;
      world.position.y = Math.sin(t * .23) * .15 - s * .4;
      world.scale.setScalar(1 + Math.sin(t * .55) * .007);

      cage.rotation.y = t * .145;
      cage.rotation.x = t * .076;
      core.rotation.y = -t * .069;
      inner.rotation.x = t * .12;
      inner.rotation.z = -t * .09;
      nodeGroup.rotation.y = -t * .022;
      lines.rotation.y = -t * .022;
      stars.rotation.y = t * .0055;

      haloGroup.children.forEach(ring => { ring.rotation.z += ring.userData.speed * 16.67; });
      signals.children.forEach(pivot => { pivot.rotation.z += pivot.userData.speed * .008; });
      nodeGroup.children.forEach((node, i) => {
        if (i % 5 === 0) node.scale.setScalar(1 + Math.sin(t * 1.8 + node.userData.phase) * .16);
      });

      camera.position.x = mx * .35;
      camera.position.y = -my * .25;
      camera.lookAt(.85, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
      renderer.setSize(innerWidth, innerHeight, false);
      world.position.x = innerWidth > 900 ? 2.95 : .5;
    };
    window.addEventListener('resize', resize, { passive: true });
  } catch (err) {
    console.warn('AIgentum WebGL fallback:', err);
    canvas.style.display = 'none';
  }
}
