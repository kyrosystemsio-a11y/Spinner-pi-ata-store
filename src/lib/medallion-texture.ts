import * as THREE from "three";

// Procedural cross-medallion artwork for the baptism spinner's ribbon bands.
// No external image assets — drawn with Canvas2D so it can ship as plain
// code. Nine distinct variations of the same medallion family (beaded ring
// + flared fleur-de-lis cross + center quatrefoil), authored as nine
// same-size canvases rather than one shared 3x3 atlas with UV-cropped
// views: each decal is its own small plane mesh (not a shared continuous
// surface), so there's no instancing win from atlasing, and per-canvas
// authoring sidesteps CanvasTexture flipY/offset edge cases. Each texture
// is still generated exactly once (see createMedallionVariationTextures)
// and reused across every decal that needs that variation.
export const MEDALLION_VARIATION_COUNT = 9;

const TEXTURE_SIZE = 1024;
const BEAD_COUNT = 44;
const CHARCOAL = "#1a1a1a";
// Antique-gold cross/outline fill. The ring uses a 3-stop gradient
// (#B8860B -> #D4AF37 -> #F2D98B); the cross itself uses this gradient's
// solid mid-stop instead of the gradient object, since the cross is drawn
// inside a translated/rotated context where a pre-built CanvasGradient's
// fixed coordinates would otherwise drift out of place per arm.
const GOLD_SOLID = "#d4af37";

interface VariationConfig {
  ringColor: "charcoal" | "gold";
  crossColor: string;
  outlineColor?: string;
  armWidthMultiplier: number;
  crossScaleRatio: number;
  beadRadiusRatio: number;
  hairlineCount: 1 | 2;
  ornate?: boolean;
}

// V1-V9 per the spec table: all keep the beaded ring + fleur cross +
// quatrefoil family so they read as variations of one design.
const VARIATIONS: Record<number, VariationConfig> = {
  1: { ringColor: "gold", crossColor: CHARCOAL, armWidthMultiplier: 1, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  2: { ringColor: "gold", crossColor: GOLD_SOLID, armWidthMultiplier: 1, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  3: { ringColor: "gold", crossColor: CHARCOAL, outlineColor: GOLD_SOLID, armWidthMultiplier: 1, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  4: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 1, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  5: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 1.45, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  6: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 0.65, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 1 },
  7: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 0.85, crossScaleRatio: 0.74, beadRadiusRatio: 0.034, hairlineCount: 1 },
  8: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 1, crossScaleRatio: 0.42, beadRadiusRatio: 0.058, hairlineCount: 1 },
  9: { ringColor: "charcoal", crossColor: CHARCOAL, armWidthMultiplier: 1, crossScaleRatio: 0.57, beadRadiusRatio: 0.044, hairlineCount: 2, ornate: true },
};

function drawBeadedRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  beadRadiusRatio: number,
  fillStyle: string | CanvasGradient
) {
  const beadR = outerR * beadRadiusRatio;
  for (let i = 0; i < BEAD_COUNT; i++) {
    const angle = (i / BEAD_COUNT) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR, beadR, 0, Math.PI * 2);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}

function drawHairline(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  strokeStyle: string | CanvasGradient
) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// One pointed petal (lobe) of a fleur-de-lis terminal, drawn from the origin
// out to a tip and back via two symmetric bezier curves.
function tracePetal(ctx: CanvasRenderingContext2D, length: number, width: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-width, -length * 0.35, -width * 0.5, -length * 0.85, 0, -length);
  ctx.bezierCurveTo(width * 0.5, -length * 0.85, width, -length * 0.35, 0, 0);
  ctx.closePath();
}

function drawFleurTerminal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  tipLength: number,
  lobeSpread: number,
  color: string
) {
  ctx.fillStyle = color;

  ctx.save();
  ctx.translate(cx, baseY);
  tracePetal(ctx, tipLength, tipLength * 0.32);
  ctx.fill();
  ctx.restore();

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(side * lobeSpread);
    tracePetal(ctx, tipLength * 0.62, tipLength * 0.26);
    ctx.fill();
    ctx.restore();
  }
}

interface ArmOptions {
  outlineColor?: string;
  ornate?: boolean;
}

// One flared, double-line-engraved cross arm reaching out from the crossing
// point, capped with a fleur-de-lis terminal.
function drawArm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  armLength: number,
  waistWidth: number,
  flareWidth: number,
  color: string,
  options: ArmOptions = {}
) {
  const flareStart = armLength * 0.62;

  const traceArmPath = () => {
    ctx.beginPath();
    ctx.moveTo(cx - waistWidth, cy);
    ctx.lineTo(cx - waistWidth, cy - flareStart);
    ctx.lineTo(cx - flareWidth, cy - armLength * 0.78);
    ctx.lineTo(cx, cy - armLength * 0.9);
    ctx.lineTo(cx + flareWidth, cy - armLength * 0.78);
    ctx.lineTo(cx + waistWidth, cy - flareStart);
    ctx.lineTo(cx + waistWidth, cy);
    ctx.closePath();
  };

  traceArmPath();
  ctx.fillStyle = color;
  ctx.fill();

  if (options.outlineColor) {
    traceArmPath();
    ctx.strokeStyle = options.outlineColor;
    ctx.lineWidth = Math.max(1.5, waistWidth * 0.5);
    ctx.stroke();
  }

  // Inset double-line engraving running the length of the arm.
  ctx.beginPath();
  ctx.moveTo(cx - waistWidth * 0.45, cy - 2);
  ctx.lineTo(cx - waistWidth * 0.45, cy - flareStart * 0.95);
  ctx.moveTo(cx + waistWidth * 0.45, cy - 2);
  ctx.lineTo(cx + waistWidth * 0.45, cy - flareStart * 0.95);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Extra interior flourish/veining for the "ornate" variation: small
  // diamond facets set at an angle along each arm.
  if (options.ornate) {
    [0.35, 0.62].forEach((t, i) => {
      const y = cy - flareStart * t;
      const side = i % 2 === 0 ? -1 : 1;
      ctx.save();
      ctx.translate(cx + side * waistWidth * 1.6, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = color;
      ctx.fillRect(-waistWidth * 0.3, -waistWidth * 0.3, waistWidth * 0.6, waistWidth * 0.6);
      ctx.restore();
    });
  }

  drawFleurTerminal(ctx, cx, cy - armLength * 0.9, armLength * 0.22, 0.5, color);
}

function drawCenterAccent(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, color: string) {
  ctx.fillStyle = color;
  // Quatrefoil: four small ellipses rotated 90 degrees apart.
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.PI / 2) * i);
    ctx.beginPath();
    ctx.ellipse(0, -scale * 0.45, scale * 0.22, scale * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Small diamond accent at the crossing itself.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-scale * 0.16, -scale * 0.16, scale * 0.32, scale * 0.32);
  ctx.restore();
}

function drawCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, config: VariationConfig) {
  const verticalLength = scale;
  const horizontalLength = scale / 1.1;
  const waistWidth = scale * 0.085 * config.armWidthMultiplier;
  const flareWidth = scale * 0.2 * config.armWidthMultiplier;
  const armOptions: ArmOptions = { outlineColor: config.outlineColor, ornate: config.ornate };

  ctx.save();
  ctx.translate(cx, cy);
  drawArm(ctx, 0, 0, verticalLength, waistWidth, flareWidth, config.crossColor, armOptions);
  ctx.rotate(Math.PI);
  drawArm(ctx, 0, 0, verticalLength, waistWidth, flareWidth, config.crossColor, armOptions);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 2);
  drawArm(ctx, 0, 0, horizontalLength, waistWidth, flareWidth, config.crossColor, armOptions);
  ctx.rotate(Math.PI);
  drawArm(ctx, 0, 0, horizontalLength, waistWidth, flareWidth, config.crossColor, armOptions);
  ctx.restore();

  drawCenterAccent(ctx, cx, cy, scale * 0.16, config.crossColor);
}

function ringStyleFor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  ringColor: VariationConfig["ringColor"]
): string | CanvasGradient {
  if (ringColor === "charcoal") return CHARCOAL;
  const gradient = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
  gradient.addColorStop(0, "#b8860b");
  gradient.addColorStop(0.5, "#d4af37");
  gradient.addColorStop(1, "#f2d98b");
  return gradient;
}

function drawMedallionVariation(ctx: CanvasRenderingContext2D, size: number, variation: number) {
  const config = VARIATIONS[variation];
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;

  const ringStyle = ringStyleFor(ctx, cx, cy, outerR, config.ringColor);
  drawBeadedRing(ctx, cx, cy, outerR, config.beadRadiusRatio, ringStyle);
  drawHairline(ctx, cx, cy, outerR * 0.88, ringStyle);
  if (config.hairlineCount === 2) {
    drawHairline(ctx, cx, cy, outerR * 0.8, ringStyle);
  }
  drawCross(ctx, cx, cy, outerR * config.crossScaleRatio, config);
}

// Generates all nine medallion variations once, each as its own
// CanvasTexture, for the caller to memoize and index by row (V1..V9).
export function createMedallionVariationTextures(): THREE.CanvasTexture[] {
  const textures: THREE.CanvasTexture[] = [];
  for (let variation = 1; variation <= MEDALLION_VARIATION_COUNT; variation++) {
    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable for medallion texture");

    drawMedallionVariation(ctx, TEXTURE_SIZE, variation);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    textures.push(texture);
  }
  return textures;
}
