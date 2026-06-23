"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep, seededRandom } from "@/lib/three-easing";
import { WoodCageFrame } from "@/lib/wood-cage-frame";
import { createMedallionVariationTextures, MEDALLION_VARIATION_COUNT } from "@/lib/medallion-texture";
import { createMoneyAtlasTexture } from "@/lib/money-atlas-texture";

// Colors below are median pixel samples taken directly from the real
// product photo (public/products/baptism.jpg), then lightened ~35% toward
// white to compensate for that photo's ambient shadow under this scene's
// brighter studio lighting — not guessed.
const RIBBON_IVORY = "#c0c0c2";
// Reused from the site's existing brand tokens (globals.css) — close match
// to the embroidered gold ring on the cross medallions in the real photo.
const MEDALLION_GOLD = "#e7b740";
const BAND_PAPER_BLUE = "#2c5fa8";

// TODO(shape-match): the real photo only shows the wrapped front of the
// piece at one angle — no side/back/turntable reference exists yet, so the
// exact taper profile is unverified. Using a plain right cylinder until a
// multi-angle photo or video confirms the true silhouette.
const TUBE_RADIUS = 0.85;
const TUBE_HALF_HEIGHT = 1.2;

// Scroll choreography phases: rest (idle) -> unravel (bands peel) -> burst
// (money erupts) -> settle (camera/CTA).
const REST_END = 0.15;
const UNRAVEL_END = 0.55;
const BURST_END = 0.85;

// Counted directly off the real photo's visible ribbon coils.
const BAND_COUNT = 13;

// Prop bill tier mix (~50% / 30% / 20%), matches the atlas's tier order.
const TIER_WEIGHTS = [0.5, 0.3, 0.2];
const MONEY_COUNT = 90;

function smoothInOut(p: number, start: number, peak: number, end: number) {
  return smoothstep(start, peak, p) * (1 - smoothstep(peak, end, p));
}

function pickTierIndex(seed: number) {
  const r = seededRandom(seed);
  let acc = 0;
  for (let i = 0; i < TIER_WEIGHTS.length; i++) {
    acc += TIER_WEIGHTS[i];
    if (r < acc) return i;
  }
  return TIER_WEIGHTS.length - 1;
}

interface MedallionDatum {
  angle: number;
  variation: number;
  jitter: number;
}

interface BandDatum {
  y: number;
  height: number;
  unravelAt: number;
  fallDistance: number;
  spin: number;
  drift: number;
  medallions: MedallionDatum[];
}

// Nine medallion variations are mapped onto nine evenly-spaced rows down the
// wrapped tube (row r -> variation V_r), each row stamped on all four faces
// (0/90/180/270 degrees) -> 36 decals total. Rows are pinned to the nearest
// existing ribbon band so each decal is a child of that band's group and
// inherits its peel/fall/spin animation directly, instead of animating
// separately and risking a detached floater once its band lifts off.
const MEDALLION_ROW_COUNT = MEDALLION_VARIATION_COUNT;
const MEDALLION_FACE_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

function bandIndexForRow(row: number) {
  return Math.round((row / (MEDALLION_ROW_COUNT - 1)) * (BAND_COUNT - 1));
}

// The wound ivory ribbon, modelled as stacked open-ended cylinder shells
// that peel outward as the user scrolls.
function RibbonBands({ progress }: { progress: { current: number } }) {
  const { gl } = useThree();

  const medallionTextures = useMemo(() => {
    const textures = createMedallionVariationTextures();
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    textures.forEach((texture) => {
      texture.anisotropy = maxAniso;
    });
    return textures;
  }, [gl]);

  useEffect(() => {
    return () => {
      medallionTextures.forEach((texture) => texture.dispose());
    };
  }, [medallionTextures]);

  const bands = useMemo<BandDatum[]>(() => {
    const totalHeight = TUBE_HALF_HEIGHT * 2;
    const bandHeight = totalHeight / BAND_COUNT;
    const rowByBandIndex = new Map<number, number>();
    for (let row = 0; row < MEDALLION_ROW_COUNT; row++) {
      rowByBandIndex.set(bandIndexForRow(row), row);
    }
    return Array.from({ length: BAND_COUNT }).map((_, i) => {
      const row = rowByBandIndex.get(i);
      const medallions: MedallionDatum[] =
        row === undefined
          ? []
          : MEDALLION_FACE_ANGLES.map((angle, faceIndex) => ({
              angle,
              variation: row + 1,
              // +/-2 degrees: Math.PI/45 rad spans 4 degrees, halved by the
              // [-0.5, 0.5] seededRandom offset.
              jitter: (seededRandom(i * 4 + faceIndex + 0.05) - 0.5) * (Math.PI / 45),
            }));
      return {
        y: TUBE_HALF_HEIGHT - bandHeight * (i + 0.5),
        height: bandHeight * 0.96,
        unravelAt: REST_END + (i / BAND_COUNT) * (UNRAVEL_END - REST_END),
        fallDistance: 1.4 + seededRandom(i + 0.12) * 1.1,
        spin: (seededRandom(i + 0.46) - 0.5) * 6,
        drift: 0.6 + seededRandom(i + 0.63) * 1,
        medallions,
      };
    });
  }, []);

  const refs = useRef<(THREE.Group | null)[]>([]);
  const localUnravelSpan = (UNRAVEL_END - REST_END) / BAND_COUNT;

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    bands.forEach((band, i) => {
      const group = refs.current[i];
      if (!group) return;
      const localT = smoothstep(band.unravelAt, band.unravelAt + localUnravelSpan, p);

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
          {band.medallions.map((medallion, mi) => {
            const angle = medallion.angle + medallion.jitter;
            const texture = medallionTextures[medallion.variation - 1];
            return (
              <mesh
                key={mi}
                position={[
                  Math.sin(angle) * (TUBE_RADIUS + 0.035),
                  0,
                  Math.cos(angle) * (TUBE_RADIUS + 0.035),
                ]}
                rotation={[0, -angle, 0]}
              >
                <planeGeometry args={[0.22, 0.22]} />
                <meshStandardMaterial map={texture} transparent roughness={0.5} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// The loose ribbon tail that swings outward as it's pulled, matching the
// real photo's loose tail hanging off the lower-right of the wrapped front.
// Grows during the unravel phase, then tucks away before the money burst.
function PullTail({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const grow = smoothstep(0.1, 0.5, p) * (1 - smoothstep(0.55, 0.65, p));
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

// Thin "paper band" stacks tucked near the tube's top, visible during rest
// and early unravel, fading out once the money burst begins.
function MoneyStackBands({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const stacks = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        angle: (i / 4) * Math.PI * 2 + Math.PI / 4,
      })),
    []
  );

  useFrame(() => {
    const p = progress.current;
    const opacity = 1 - smoothstep(UNRAVEL_END, BURST_END - 0.3, p);
    refs.current.forEach((mesh) => {
      if (!mesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = opacity;
    });
  });

  return (
    <group position={[0, TUBE_HALF_HEIGHT * 0.55, 0]}>
      {stacks.map((stack, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[Math.sin(stack.angle) * 0.18, 0, Math.cos(stack.angle) * 0.18]}
          rotation={[0, -stack.angle, 0]}
        >
          <boxGeometry args={[0.27, 0.12, 0.22]} />
          <meshStandardMaterial color={BAND_PAPER_BLUE} roughness={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

interface MoneyPieceDatum {
  tierIndex: number;
  angle: number;
  outRadius: number;
  fireAt: number;
  fallSpeed: number;
  spin: number;
  flutter: number;
}

// Prop bills raining out as the ribbon opens, building to a finale burst.
// COMPLIANCE: see money-atlas-texture.ts — flat tier tints, no real bill
// artwork, baked-in non-spendable corner tab per piece. Rendered via one
// InstancedMesh per denomination tier (cut from ~90 individual meshes down
// to 3 draw calls) sharing a single canvas atlas via cheap texture.clone()
// UV-offset views rather than a custom per-instance-UV shader.
function MoneyField({ progress }: { progress: { current: number } }) {
  const { gl } = useThree();

  const atlas = useMemo(() => createMoneyAtlasTexture(), []);
  const tierTextures = useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    return Array.from({ length: atlas.tierCount }, (_, i) => {
      const clone = atlas.texture.clone();
      clone.repeat.set(1 / atlas.tierCount, 1);
      clone.offset.set(i / atlas.tierCount, 0);
      clone.anisotropy = maxAniso;
      clone.needsUpdate = true;
      return clone;
    });
  }, [atlas, gl]);

  useEffect(() => {
    return () => {
      tierTextures.forEach((tex) => tex.dispose());
      atlas.texture.dispose();
    };
  }, [tierTextures, atlas]);

  const piecesByTier = useMemo(() => {
    const groups: MoneyPieceDatum[][] = Array.from({ length: atlas.tierCount }, () => []);
    for (let i = 0; i < MONEY_COUNT; i++) {
      const tierIndex = pickTierIndex(i + 0.33);
      groups[tierIndex].push({
        tierIndex,
        angle: seededRandom(i + 0.21) * Math.PI * 2,
        outRadius: 0.3 + seededRandom(i + 0.77) * 1.6,
        fireAt: BURST_END - 0.3 + seededRandom(i + 0.44) * 0.3,
        fallSpeed: 1.4 + seededRandom(i + 0.61) * 1.8,
        spin: (seededRandom(i + 0.88) - 0.5) * 9,
        flutter: 0.5 + seededRandom(i + 0.55) * 1.5,
      });
    }
    return groups;
  }, [atlas.tierCount]);

  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const finale = smoothstep(0.85, 1, p);

    piecesByTier.forEach((pieces, tierIndex) => {
      const mesh = meshRefs.current[tierIndex];
      if (!mesh) return;
      pieces.forEach((piece, i) => {
        const localT = smoothstep(piece.fireAt, Math.min(1, piece.fireAt + 0.35), p);
        const spread = localT * piece.outRadius * (1 + finale * 0.6);
        const fall = localT * localT * piece.fallSpeed * 3.2;

        dummy.position.set(
          Math.sin(piece.angle) * spread + Math.sin(t * piece.flutter + i) * 0.15,
          TUBE_HALF_HEIGHT * 0.6 - fall,
          Math.cos(piece.angle) * spread
        );
        dummy.rotation.set(
          fall * piece.spin * 0.3 + Math.sin(t * piece.flutter) * 0.4,
          0,
          fall * piece.spin * 0.2
        );
        dummy.scale.setScalar(localT <= 0 ? 0 : 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      {piecesByTier.map((pieces, tierIndex) => (
        <instancedMesh
          key={tierIndex}
          ref={(el) => (meshRefs.current[tierIndex] = el)}
          args={[undefined, undefined, pieces.length]}
        >
          <planeGeometry args={[0.26, 0.11]} />
          <meshStandardMaterial
            map={tierTextures[tierIndex]}
            transparent
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      ))}
    </group>
  );
}

function BaptismBody({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y = state.clock.elapsedTime * 0.035 + p * Math.PI * 1.2;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.06 - p * 0.4;
  });

  return (
    <group ref={group}>
      <WoodCageFrame radius={TUBE_RADIUS} halfHeight={TUBE_HALF_HEIGHT} />
      <MoneyStackBands progress={progress} />
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
    const dolly = smoothInOut(p, 0.55, 0.75, 0.95) + smoothstep(0.95, 1, p) * 1.4;
    state.camera.position.z = 6.6 + dolly * 2.2;
    state.camera.position.y = 0.1 - smoothstep(0.55, 1, p) * 0.4;
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
