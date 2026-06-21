"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FRINGE_COLORS = ["#e7b740", "#f6d678", "#ffcc00"];
const CONFETTI_COLORS = [
  "#e7b740",
  "#f6d678",
  "#d11f2c",
  "#1f8a4c",
  "#2459c7",
  "#f3a0c2",
];
const BODY_RADIUS = 1.3;
const RING_COUNT = 5;
const STRIPS_PER_RING = 14;
const CONFETTI_COUNT = 70;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Deterministic, seeded pseudo-random in [0, 1) so per-instance variation
// stays pure across renders instead of relying on Math.random().
function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface RingDatum {
  y: number;
  ringRadius: number;
  color: string;
  unravelAt: number;
}

interface StripDatum {
  angle: number;
  ring: RingDatum;
  fallDistance: number;
  spin: number;
  drift: number;
}

function FringeRings({ progress }: { progress: { current: number } }) {
  const strips = useMemo<StripDatum[]>(() => {
    const rings: RingDatum[] = Array.from({ length: RING_COUNT }).map(
      (_, i) => {
        const y = 0.95 - (i / (RING_COUNT - 1)) * 1.9;
        return {
          y,
          ringRadius: Math.sqrt(
            Math.max(0.05, BODY_RADIUS * BODY_RADIUS - y * y)
          ),
          color: FRINGE_COLORS[i % FRINGE_COLORS.length],
          unravelAt: i / RING_COUNT,
        };
      }
    );

    return rings.flatMap((ring, ringIndex) =>
      Array.from({ length: STRIPS_PER_RING }).map((_, j) => {
        const seed = ringIndex * STRIPS_PER_RING + j;
        return {
          angle: (j / STRIPS_PER_RING) * Math.PI * 2,
          ring,
          fallDistance: 2.2 + seededRandom(seed) * 1.4,
          spin: (seededRandom(seed + 0.37) - 0.5) * 6,
          drift: 0.6 + seededRandom(seed + 0.71) * 0.8,
        };
      })
    );
  }, []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    strips.forEach((strip, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(strip.ring.unravelAt, strip.ring.unravelAt + 1 / RING_COUNT, p);

      const outward = strip.ring.ringRadius + 0.05 + localT * strip.drift;
      const x = Math.sin(strip.angle) * outward;
      const z = Math.cos(strip.angle) * outward;
      const sway = Math.sin(t * 1.5 + strip.angle) * 0.03 * (1 - localT);
      mesh.position.set(x + sway, strip.ring.y - localT * localT * strip.fallDistance, z);
      mesh.rotation.y = strip.angle;
      mesh.rotation.x = localT * strip.spin;
      mesh.rotation.z = localT * strip.spin * 0.6;

      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 1 - smoothstep(0.7, 1, localT);
    });
  });

  return (
    <group>
      {strips.map((strip, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <boxGeometry args={[0.22, 0.5, 0.035]} />
          <meshStandardMaterial
            color={strip.ring.color}
            transparent
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

interface ConfettiDatum {
  direction: THREE.Vector3;
  fireAt: number;
  speed: number;
  color: string;
  spin: number;
}

function ConfettiBurst({ progress }: { progress: { current: number } }) {
  const pieces = useMemo<ConfettiDatum[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const theta = seededRandom(i + 0.13) * Math.PI * 2;
        const phi = Math.acos(2 * seededRandom(i + 0.49) - 1);
        return {
          direction: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.abs(Math.sin(phi) * Math.sin(theta)) * 0.6 + 0.2,
            Math.cos(phi)
          ),
          fireAt: seededRandom(i + 0.82) * 0.85,
          speed: 1.5 + seededRandom(i + 0.27) * 2,
          color:
            CONFETTI_COLORS[
              Math.floor(seededRandom(i + 0.65) * CONFETTI_COLORS.length)
            ],
          spin: (seededRandom(i + 0.91) - 0.5) * 10,
        };
      }),
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const p = progress.current;
    pieces.forEach((piece, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.3), p);
      const travel = localT * piece.speed;
      mesh.position.set(
        piece.direction.x * travel,
        piece.direction.y * travel - localT * localT * 1.6,
        piece.direction.z * travel
      );
      mesh.rotation.x = travel * piece.spin;
      mesh.rotation.y = travel * piece.spin * 0.5;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = localT <= 0 ? 0 : 1 - smoothstep(0.6, 1, localT);
    });
  });

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <tetrahedronGeometry args={[0.06]} />
          <meshStandardMaterial color={piece.color} transparent />
        </mesh>
      ))}
    </group>
  );
}

function PinataBody({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y = state.clock.elapsedTime * 0.15 + p * Math.PI * 1.4;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08 - p * 0.4;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[BODY_RADIUS, 1]} />
        <meshStandardMaterial color="#3a0a5e" flatShading roughness={0.55} />
      </mesh>
      <FringeRings progress={progress} />
      <ConfettiBurst progress={progress} />
    </group>
  );
}

export default function PinataHeroCanvas({
  progress,
}: {
  progress: { current: number };
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color="#e7b740" />
      <PinataBody progress={progress} />
    </Canvas>
  );
}
