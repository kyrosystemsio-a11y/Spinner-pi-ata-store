import * as THREE from "three";

// Procedural "prop money" atlas for the baptism spinner's money burst.
// COMPLIANCE: by design these are stylized novelty bills, not a facsimile of
// real currency — flat per-tier tints (not real denomination palettes), a
// generic abstract portrait silhouette (not any real person's likeness),
// placeholder serial-style text in a format distinct from real US currency,
// a baked-in "PARTY MONEY - NOT LEGAL TENDER" disclaimer, and a bright
// corner tab baked into every cell as a non-spendable visual cue. No
// Treasury seal, no security ribbon, no real serial format.
export interface MoneyTierStyle {
  label: string;
  bg: string;
  silhouette: string;
  tab: string;
}

const TIERS: MoneyTierStyle[] = [
  { label: "20", bg: "#cbbab8", silhouette: "#8c8884", tab: "#e8722e" },
  { label: "50", bg: "#bdbdbf", silhouette: "#86868a", tab: "#1da7d3" },
  { label: "100", bg: "#aca79d", silhouette: "#7f7a72", tab: "#e8722e" },
];

const CELL_WIDTH = 512;
const CELL_HEIGHT = 220;

function drawBillFace(ctx: CanvasRenderingContext2D, originX: number, tier: MoneyTierStyle) {
  ctx.fillStyle = tier.bg;
  ctx.fillRect(originX, 0, CELL_WIDTH, CELL_HEIGHT);

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 4;
  ctx.strokeRect(originX + 6, 6, CELL_WIDTH - 12, CELL_HEIGHT - 12);

  // Generic abstract "portrait" — two overlapping ellipses (head +
  // shoulders) inside a thin oval frame, deliberately not depicting anyone.
  const portraitCx = originX + CELL_WIDTH * 0.32;
  const portraitCy = CELL_HEIGHT * 0.52;
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(portraitCx, portraitCy, 62, 78, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = tier.silhouette;
  ctx.beginPath();
  ctx.ellipse(portraitCx, portraitCy - 18, 30, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(portraitCx, portraitCy + 42, 46, 36, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();

  // Large denomination numeral.
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.font = "bold 64px serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(tier.label, originX + CELL_WIDTH - 24, 16);

  // Placeholder serial-style text — distinct format from real currency.
  ctx.font = "16px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("PN 00000000 X", originX + CELL_WIDTH * 0.5, CELL_HEIGHT - 44);

  // Baked-in novelty disclaimer.
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("PARTY MONEY • NOT LEGAL TENDER", originX + CELL_WIDTH * 0.5, CELL_HEIGHT - 22);

  // Non-spendable corner tab (COMPLIANCE cue), baked into the texture.
  ctx.fillStyle = tier.tab;
  ctx.fillRect(originX + CELL_WIDTH - 86, CELL_HEIGHT - 56, 70, 40);
}

export function createMoneyAtlasTexture(): { texture: THREE.CanvasTexture; tierCount: number } {
  const canvas = document.createElement("canvas");
  canvas.width = CELL_WIDTH * TIERS.length;
  canvas.height = CELL_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for money atlas texture");

  TIERS.forEach((tier, i) => drawBillFace(ctx, i * CELL_WIDTH, tier));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, tierCount: TIERS.length };
}

export const MONEY_TIER_COUNT = TIERS.length;
