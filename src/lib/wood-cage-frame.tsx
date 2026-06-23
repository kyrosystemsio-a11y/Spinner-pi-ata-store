// Shared wood cage geometry used by both the homepage piñata hero
// (PinataHeroCanvas) and the baptism spinner hero (BaptismHeroCanvas), so
// the two product frames stay visually identical without each component
// re-deriving its own wood color or dowel/platform sizing.
export const CAGE_WOOD_COLOR = "#c9974c";
export const CAGE_DOWEL_COUNT = 5;
export const CAGE_DOWEL_RADIUS = 0.055;
export const CAGE_PLATFORM_THICKNESS = 0.12;
const CAGE_PLATFORM_RADIUS_RATIO = 0.92;

interface WoodCageFrameProps {
  radius: number;
  halfHeight: number;
  dowelCount?: number;
  dowelRadius?: number;
  platformThickness?: number;
}

// Three circular wood platforms (top/middle/bottom) connected by dowels
// spaced evenly around the circumference. The ribbon/satin wrap hides most
// of this until it peels or unravels away.
export function WoodCageFrame({
  radius,
  halfHeight,
  dowelCount = CAGE_DOWEL_COUNT,
  dowelRadius = CAGE_DOWEL_RADIUS,
  platformThickness = CAGE_PLATFORM_THICKNESS,
}: WoodCageFrameProps) {
  const platformRadius = radius * CAGE_PLATFORM_RADIUS_RATIO;
  const platformYs = [halfHeight, 0, -halfHeight];
  const dowelAngles = Array.from(
    { length: dowelCount },
    (_, i) => (i / dowelCount) * Math.PI * 2 + Math.PI / 4
  );

  return (
    <group>
      {platformYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[platformRadius, platformRadius, platformThickness, 24]} />
          <meshStandardMaterial color={CAGE_WOOD_COLOR} roughness={0.85} />
        </mesh>
      ))}
      {dowelAngles.map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(angle) * (radius - 0.07),
            0,
            Math.cos(angle) * (radius - 0.07),
          ]}
        >
          <cylinderGeometry
            args={[dowelRadius, dowelRadius, halfHeight * 2 + platformThickness, 12]}
          />
          <meshStandardMaterial color={CAGE_WOOD_COLOR} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
