"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep, seededRandom } from "@/lib/three-easing";

// Colors below are median pixel samples taken directly from the real
// product photo (public/products/baptism.jpg), then lightened ~35% toward
// white to compensate for that photo's ambient shadow under this scene's
// brighter studio lighting — not guessed.
const RIBBON_IVORY = "#c0c0c2";
const KRAFT_CARDBOARD = "#ac8d74";
// Reused from the site's existing brand tokens (globals.css) — close match
// to the embroidered gold ring on the cross medallions in the real photo.
const MEDALLION_GOLD = "#e7b740";
const MEDALLION_INK = "#18101f";

// TODO(shape-match): the real photo only shows the wrapped front of the
// piece at one angle — no side/back/turntable reference exists yet, so the
// exact taper profile is unverified. Using a plain right cylinder until a
// multi-angle photo or video confirms the true silhouette.
const TUBE_RADIUS = 0.85;
const TUBE_HALF_HEIGHT = 1.2;
const KRAFT_RIM_HEIGHT = 0.08;

// Counted directly off the real photo's visible ribbon coils.
const BAND_COUNT = 13;
const MEDALLION_CHANCE = 0.4;

// Tier colors sampled from a real licensed prop-money reference photo
// (paper tone per denomination), then lightened ~35% the same way as the
// ribbon color above. COMPLIANCE: these stay flat color tiers — no
// portraits, seals, or replicated bill artwork — and every bill below
// carries a high-contrast corner tab, mirroring how real licensed prop
// money marks itself as non-spendable. Even with a real currency photo
// available as a reference, nothing here approaches counterfeit fidelity.
const MONEY_TIERS = ["#aca79d", "#cbbab8", "#bdbdbf"];
const PROP_TAB_COLORS = ["#e8722e", "#1da7d3"];
const MONEY_COUNT = 90;

function smoothInOut(p: number, start: number, peak: number, end: number) {
  return smoothstep(start, peak, p) * (1 - smoothstep(peak, end, p));
}

// The bare kraft-cardboard tube the ribbon is wound around. Always present
// — the ribbon bands simply hide most of it until they peel away.
// TODO(shape-match): no bare/unwrapped reference photo exists yet, so the
// inner structure (solid tube vs. visible struts, any printed graphics) is
// approximated as a plain open-ended kraft cylinder.
function BareFrame() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, TUBE_HALF_HEIGHT * 2, 32, 1, true]} />
        <meshStandardMaterial color={KRAFT_CARDBOARD} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, TUBE_HALF_HEIGHT - KRAFT_RIM_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[TUBE_RADIUS + 0.02, TUBE_RADIUS + 0.02, KRAFT_RIM_HEIGHT, 32, 1, true]}
        />
        <meshStandardMaterial color={KRAFT_CARDBOARD} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

interface BandDatum {
  y: number;
  height: number;
  unravelAt: number;
  fallDistance: number;
  spin: number;
  drift: number;
  hasMedallion: boolean;
  medallionAngle: number;
}

// The wound ivory ribbon, modelled as stacked open-ended cylinder shells
// that peel outward as the user scrolls — same mechanic as the homepage
// piñata hero's RibbonBands, applied to this product's coil pattern.
function RibbonBands({ progress }: { progress: { current: number } }) {
  const bands = useMemo<BandDatum[]>(() => {
    const totalHeight = TUBE_HALF_HEIGHT * 2 - KRAFT_RIM_HEIGHT;
    const bandHeight = totalHeight / BAND_COUNT;
    return Array.from({ length: BAND_COUNT }).map((_, i) => ({
      y: TUBE_HALF_HEIGHT - KRAFT_RIM_HEIGHT - bandHeight * (i + 0.5),
      height: bandHeight * 0.96,
      unravelAt: i / BAND_COUNT,
      fallDistance: 1.4 + seededRandom(i + 0.12) * 1.1,
      spin: (seededRandom(i + 0.46) - 0.5) * 6,
      drift: 0.6 + seededRandom(i + 0.63) * 1,
      hasMedallion: seededRandom(i + 0.27) < MEDALLION_CHANCE,
      medallionAngle: seededRandom(i + 0.71) * Math.PI * 2,
    }));
  }, []);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    bands.forEach((band, i) => {
      const group = refs.current[i];
      if (!group) return;
      const localT = smoothstep(band.unravelAt, band.unravelAt + 1 / BAND_COUNT, p);

      const outward = localT * band.drift;
      group.position.set(
        Math.sin(t * 0.5 + i) * outward * 0.3,
        band.y - localT * localT * band.fallDistance,
        Math.cos(t * 0.5 + i) * outward * 0.3
      );
      group.rotation.x = localT * band.spin;
      group.rotation.z = localT * band.spin * 0.5;
      group.scale.setScalar(1 - 0.25 * localT);

      const mesh = group.children[0] as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 1 - smoothstep(0.75, 1, localT);
    });
  });

  return (
    <group>
      {bands.map((band, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} position={[0, band.y, 0]}>
          <mesh>
            <cylinderGeometry args={[TUBE_RADIUS + 0.03, TUBE_RADIUS + 0.03, band.height, 32, 1, true]} />
            <meshStandardMaterial
              color={RIBBON_IVORY}
              transparent
              roughness={0.25}
              metalness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
          {band.hasMedallion && (
            <group
              position={[
                Math.sin(band.medallionAngle) * (TUBE_RADIUS + 0.04),
                0,
                Math.cos(band.medallionAngle) * (TUBE_RADIUS + 0.04),
              ]}
              rotation={[0, -band.medallionAngle, 0]}
            >
              <mesh>
                <torusGeometry args={[0.07, 0.012, 8, 20]} />
                <meshStandardMaterial color={MEDALLION_GOLD} roughness={0.4} metalness={0.3} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.09, 0.014, 0.005]} />
                <meshStandardMaterial color={MEDALLION_INK} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.014, 0.09, 0.005]} />
                <meshStandardMaterial color={MEDALLION_INK} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// The loose ribbon tail that swings outward as it's pulled, matching the
// real photo's loose tail hanging off the lower-right of the wrapped front.
function PullTail({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const grow = smoothstep(0, 0.4, p) * (1 - smoothstep(0.8, 1, p));
    const length = 0.3 + grow * 2.6;
    const swing = grow * 1.1;

    group.current.position.set(
      Math.sin(swing) * (TUBE_RADIUS + length * 0.5),
      -TUBE_HALF_HEIGHT + 0.1 + Math.sin(t * 1.1) * 0.05,
      Math.cos(swing) * (TUBE_RADIUS + length * 0.5)
    );
    group.current.rotation.y = -swing + Math.PI / 2;

    const mesh = group.current.children[0] as THREE.Mesh;
    mesh.scale.set(1, length, 1);
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.opacity = grow;
  });

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[0.18, 1, 0.02]} />
        <meshStandardMaterial color={RIBBON_IVORY} transparent roughness={0.25} />
      </mesh>
    </group>
  );
}

interface MoneyDatum {
  angle: number;
  outRadius: number;
  fireAt: number;
  fallSpeed: number;
  color: string;
  tabColor: string;
  spin: number;
  flutter: number;
}

// Prop bills raining out as the ribbon opens, building to a finale burst.
// See the COMPLIANCE note above MONEY_TIERS — flat color tiers only, no
// real bill artwork, each piece carries a bright non-spendable corner tab.
function MoneyField({ progress }: { progress: { current: number } }) {
  const pieces = useMemo<MoneyDatum[]>(
    () =>
      Array.from({ length: MONEY_COUNT }).map((_, i) => ({
        angle: seededRandom(i + 0.21) * Math.PI * 2,
        outRadius: 0.3 + seededRandom(i + 0.77) * 1.6,
        fireAt: 0.45 + seededRandom(i + 0.44) * 0.5,
        fallSpeed: 1.4 + seededRandom(i + 0.61) * 1.8,
        color: MONEY_TIERS[Math.floor(seededRandom(i + 0.33) * MONEY_TIERS.length)],
        tabColor: PROP_TAB_COLORS[i % PROP_TAB_COLORS.length],
        spin: (seededRandom(i + 0.88) - 0.5) * 9,
        flutter: 0.5 + seededRandom(i + 0.55) * 1.5,
      })),
    []
  );

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    pieces.forEach((piece, i) => {
      const group = refs.current[i];
      if (!group) return;
      const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.35), p);
      const finale = smoothstep(0.85, 1, p);
      const spread = localT * piece.outRadius * (1 + finale * 0.6);
      const fall = localT * localT * piece.fallSpeed * 3.2;

      group.position.set(
        Math.sin(piece.angle) * spread + Math.sin(t * piece.flutter + i) * 0.15,
        TUBE_HALF_HEIGHT * 0.6 - fall,
        Math.cos(piece.angle) * spread
      );
      group.rotation.x = fall * piece.spin * 0.3 + Math.sin(t * piece.flutter) * 0.4;
      group.rotation.z = fall * piece.spin * 0.2;

      const opacity = localT <= 0 ? 0 : 1 - smoothstep(0.92, 1, localT) * (1 - finale);
      group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.opacity = opacity;
      });
    });
  });

  return (
    <group>
      {pieces.map((piece, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)}>
          <mesh>
            <boxGeometry args={[0.24, 0.1, 0.004]} />
            <meshStandardMaterial color={piece.color} transparent roughness={0.6} />
          </mesh>
          <mesh position={[0.09, 0.035, 0.003]}>
            <boxGeometry args={[0.05, 0.03, 0.002]} />
            <meshStandardMaterial color={piece.tabColor} transparent roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BaptismBody({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y = state.clock.elapsedTime * 0.12 + p * Math.PI * 1.2;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.06 - p * 0.4;
  });

  return (
    <group ref={group}>
      <BareFrame />
      <RibbonBands progress={progress} />
      <PullTail progress={progress} />
      <MoneyField progress={progress} />
    </group>
  );
}

// Pulls the camera back during the finale so the widening money field stays
// in frame instead of clipping at the edges.
function CameraRig({ progress }: { progress: { current: number } }) {
  useFrame((state) => {
    const p = progress.current;
    const dolly = smoothInOut(p, 0.7, 0.9, 1) + smoothstep(0.9, 1, p) * 1.4;
    state.camera.position.z = 6.6 + dolly * 2.2;
    state.camera.position.y = 0.1 - smoothstep(0.6, 1, p) * 0.4;
    state.camera.lookAt(0, -0.2, 0);
  });

  return null;
}

export default function BaptismHeroCanvas({
  progress,
}: {
  progress: { current: number };
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 6.6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color={MEDALLION_GOLD} />
      <CameraRig progress={progress} />
      <BaptismBody progress={progress} />
    </Canvas>
  );
}
