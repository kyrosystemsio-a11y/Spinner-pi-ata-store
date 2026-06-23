import * as THREE from "three";

// Procedural cross-medallion artwork for the baptism spinner's ribbon bands.
// No external image assets — drawn with Canvas2D so it can ship as plain
// code. One canonical design (beaded ring + flared fleur-de-lis cross +
// center quatrefoil), used identically for every decal so the wrapped tube
// reads as a single repeated medallion, matching the product photo.

const TEXTURE_SIZE = 1024;
const BEAD_COUNT = 44;
const CHARCOAL = "#1a1a1a";

const ARM_WIDTH_MULTIPLIER = 1;
const CROSS_SCALE_RATIO = 0.57;
const BEAD_RADIUS_RATIO = 0.044;

function drawBeadedRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  beadRadiusRatio: number,
  fillStyle: string
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
  strokeStyle: string
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

// One flared, double-line-engraved cross arm reaching out from the crossing
// point, capped with a fleur-de-lis terminal.
function drawArm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  armLength: number,
  waistWidth: number,
  flareWidth: number,
  color: string
) {
  const flareStart = armLength * 0.62;

  ctx.beginPath();
  ctx.moveTo(cx - waistWidth, cy);
  ctx.lineTo(cx - waistWidth, cy - flareStart);
  ctx.lineTo(cx - flareWidth, cy - armLength * 0.78);
  ctx.lineTo(cx, cy - armLength * 0.9);
  ctx.lineTo(cx + flareWidth, cy - armLength * 0.78);
  ctx.lineTo(cx + waistWidth, cy - flareStart);
  ctx.lineTo(cx + waistWidth, cy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Inset double-line engraving running the length of the arm.
  ctx.beginPath();
  ctx.moveTo(cx - waistWidth * 0.45, cy - 2);
  ctx.lineTo(cx - waistWidth * 0.45, cy - flareStart * 0.95);
  ctx.moveTo(cx + waistWidth * 0.45, cy - 2);
  ctx.lineTo(cx + waistWidth * 0.45, cy - flareStart * 0.95);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

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

function drawCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  const verticalLength = scale;
  const horizontalLength = scale / 1.1;
  const waistWidth = scale * 0.085 * ARM_WIDTH_MULTIPLIER;
  const flareWidth = scale * 0.2 * ARM_WIDTH_MULTIPLIER;

  ctx.save();
  ctx.translate(cx, cy);
  drawArm(ctx, 0, 0, verticalLength, waistWidth, flareWidth, CHARCOAL);
  ctx.rotate(Math.PI);
  drawArm(ctx, 0, 0, verticalLength, waistWidth, flareWidth, CHARCOAL);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 2);
  drawArm(ctx, 0, 0, horizontalLength, waistWidth, flareWidth, CHARCOAL);
  ctx.rotate(Math.PI);
  drawArm(ctx, 0, 0, horizontalLength, waistWidth, flareWidth, CHARCOAL);
  ctx.restore();

  drawCenterAccent(ctx, cx, cy, scale * 0.16, CHARCOAL);
}

function drawMedallion(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;

  drawBeadedRing(ctx, cx, cy, outerR, BEAD_RADIUS_RATIO, CHARCOAL);
  drawHairline(ctx, cx, cy, outerR * 0.88, CHARCOAL);
  drawCross(ctx, cx, cy, outerR * CROSS_SCALE_RATIO);
}

// Generates the single canonical medallion texture once, for the caller to
// memoize and reuse across every decal.
export function createMedallionTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for medallion texture");

  drawMedallion(ctx, TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
