"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FRINGE_COLORS = ["#b5472b", "#e7b740", "#e3d3b6", "#f6d678"];
const CONFETTI_COLORS = [
  "#b5472b",
  "#e7b740",
  "#f6d678",
  "#e3d3b6",
  "#1f8a4c",
  "#2459c7",
  "#f3a0c2",
];
const LED_COLORS = ["#ff5b5b", "#ffcc00", "#4ddd6a", "#4da6ff", "#caa6ff"];
const CANDY_COLORS = ["#ff3b3b", "#ffd23f", "#3fa9f5", "#7ed957", "#ff7fb7", "#ff9f1c"];
const CANDY_COUNT = 55;
const DRUM_RADIUS = 1.05;
const DRUM_HALF_HEIGHT = 1;
const LEDS_PER_RIM = 16;
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
        const y = DRUM_HALF_HEIGHT * 0.9 - (i / (RING_COUNT - 1)) * DRUM_HALF_HEIGHT * 1.8;
        return {
          y,
          ringRadius: DRUM_RADIUS + 0.05,
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

interface LedDatum {
  angle: number;
  y: number;
  color: string;
  phase: number;
}

function RimLights({ progress }: { progress: { current: number } }) {
  const leds = useMemo<LedDatum[]>(() => {
    const rims = [DRUM_HALF_HEIGHT, -DRUM_HALF_HEIGHT];
    return rims.flatMap((y, rimIndex) =>
      Array.from({ length: LEDS_PER_RIM }).map((_, j) => {
        const seed = rimIndex * LEDS_PER_RIM + j;
        return {
          angle: (j / LEDS_PER_RIM) * Math.PI * 2,
          y,
          color: LED_COLORS[j % LED_COLORS.length],
          phase: seededRandom(seed + 0.19) * Math.PI * 2,
        };
      })
    );
  }, []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const fade = 1 - smoothstep(0.8, 1, p);
    leds.forEach((led, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const pulse = 0.6 + 0.4 * Math.sin(t * 3 + led.phase);
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = fade;
      material.emissiveIntensity = pulse * fade * 1.4;
    });
  });

  return (
    <group>
      {leds.map((led, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[
            Math.sin(led.angle) * (DRUM_RADIUS + 0.04),
            led.y,
            Math.cos(led.angle) * (DRUM_RADIUS + 0.04),
          ]}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color={led.color}
            emissive={led.color}
            emissiveIntensity={1}
            transparent
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

interface CandyDatum {
  angle: number;
  outRadius: number;
  fireAt: number;
  fallSpeed: number;
  color: string;
  spin: number;
  scale: number;
}

function CandySpill({ progress }: { progress: { current: number } }) {
  const pieces = useMemo<CandyDatum[]>(
    () =>
      Array.from({ length: CANDY_COUNT }).map((_, i) => ({
        angle: seededRandom(i + 0.21) * Math.PI * 2,
        outRadius: 0.15 + seededRandom(i + 0.77) * 0.95,
        fireAt: 0.2 + seededRandom(i + 0.44) * 0.6,
        fallSpeed: 1.3 + seededRandom(i + 0.61) * 1.7,
        color:
          CANDY_COLORS[Math.floor(seededRandom(i + 0.33) * CANDY_COLORS.length)],
        spin: (seededRandom(i + 0.88) - 0.5) * 8,
        scale: 0.55 + seededRandom(i + 0.5) * 0.55,
      })),
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const p = progress.current;
    pieces.forEach((piece, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.4), p);
      const spread = localT * piece.outRadius;
      const fall = localT * localT * piece.fallSpeed * 3.4;
      mesh.position.set(
        Math.sin(piece.angle) * spread,
        DRUM_HALF_HEIGHT * 0.4 - fall,
        Math.cos(piece.angle) * spread
      );
      mesh.rotation.x = fall * piece.spin;
      mesh.rotation.z = fall * piece.spin * 0.7;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = localT <= 0 ? 0 : 1 - smoothstep(0.85, 1, localT);
    });
  });

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          scale={piece.scale}
        >
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={piece.color} transparent roughness={0.4} />
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
      {/* Wooden dowel running through the drum, like the real spin handle */}
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, DRUM_HALF_HEIGHT * 2 + 1.6, 12]} />
        <meshStandardMaterial color="#c9974c" roughness={0.85} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[DRUM_RADIUS, DRUM_RADIUS, DRUM_HALF_HEIGHT * 2, 32]} />
        <meshStandardMaterial color="#f3e8d6" roughness={0.85} />
      </mesh>
      <RimLights progress={progress} />
      <FringeRings progress={progress} />
      <ConfettiBurst progress={progress} />
      <CandySpill progress={progress} />
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
