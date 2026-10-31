'use client';

import { useEffect, useRef, useState } from 'react';
import { ROSETTE } from './Engraving.tsx';

/** Paint the engraved face: the site's own guilloche rosette, as a height map for the gold. */
function faceTexture(size = 1024): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#7a7a7a';
  g.fillRect(0, 0, size, size);
  g.translate(size / 2, size / 2);
  const s = (size / 2 / 170) * 0.94;
  g.scale(s, s);
  g.lineCap = 'round';
  // raised rim rings
  g.strokeStyle = '#ffffff';
  g.lineWidth = 7;
  g.beginPath();
  g.arc(0, 0, 162, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 150, 0, Math.PI * 2);
  g.stroke();
  // engraved rosette lines
  g.strokeStyle = '#f2f2f2';
  ROSETTE.forEach((d, i) => {
    g.lineWidth = i < 2 ? 1.1 : 1.4;
    g.stroke(new Path2D(d));
  });
  // center boss
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(0, 0, 12, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** Reeded edge: fine vertical ridges like a minted coin. */
function edgeTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 16;
  const g = c.getContext('2d')!;
  for (let x = 0; x < 1024; x += 8) {
    g.fillStyle = '#ffffff';
    g.fillRect(x, 0, 4, 16);
    g.fillStyle = '#5a5a5a';
    g.fillRect(x + 4, 0, 4, 16);
  }
  return c;
}

export default function Medallion({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const test = document.createElement('canvas');
        if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
        const THREE = await import('three');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        if (disposed) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, 0, 5.2);

        const face = new THREE.CanvasTexture(faceTexture());
        face.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const edge = new THREE.CanvasTexture(edgeTexture());
        edge.wrapS = THREE.RepeatWrapping;
        edge.repeat.set(3, 1);

        const gold = { color: new THREE.Color('#c9a050'), metalness: 1, roughness: 0.3 };
        const faceMat = new THREE.MeshStandardMaterial({ ...gold, bumpMap: face, bumpScale: 2.2, roughnessMap: face });
        const edgeMat = new THREE.MeshStandardMaterial({ ...gold, roughness: 0.38, bumpMap: edge, bumpScale: 1.4 });

        const coin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.13, 160, 1), [edgeMat, faceMat, faceMat]);
        coin.rotation.x = Math.PI / 2; // face toward the camera
        const pivot = new THREE.Group();
        pivot.add(coin);
        scene.add(pivot);

        const key = new THREE.DirectionalLight('#fff4dc', 2.2);
        key.position.set(2.5, 3, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight('#9cc3ff', 0.9);
        rim.position.set(-3, -2, -1);
        scene.add(rim);

        const resize = () => {
          const w = el.clientWidth || 1;
          const h = el.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        let tx = 0;
        let ty = 0;
        const onMove = (e: PointerEvent) => {
          tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
          ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
        };
        window.addEventListener('pointermove', onMove, { passive: true });

        let visible = true;
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
        io.observe(el);

        const clock = new THREE.Clock();
        let raf = 0;
        const frame = () => {
          raf = requestAnimationFrame(frame);
          if (!visible || document.hidden) return;
          const t = clock.getElapsedTime();
          if (!reduce) {
            coin.rotation.y = t * 0.12; // the engraving turns slowly on its face
            pivot.rotation.y += (Math.sin(t * 0.35) * 0.55 + tx - pivot.rotation.y) * 0.05;
            pivot.rotation.x += (Math.sin(t * 0.27) * 0.12 + ty - pivot.rotation.x) * 0.05;
          } else {
            pivot.rotation.set(0.12, -0.45, 0);
          }
          renderer.render(scene, camera);
        };
        if (reduce) renderer.render(scene, camera);
        frame();
        el.dataset.ready = 'true';

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          window.removeEventListener('pointermove', onMove);
          face.dispose();
          edge.dispose();
          faceMat.dispose();
          edgeMat.dispose();
          coin.geometry.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className={`${className || ''}${failed ? ' medallion-failed' : ''}`} aria-hidden="true" />;
}
