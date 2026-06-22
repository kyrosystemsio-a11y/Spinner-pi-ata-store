interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  path?: string;
}

export async function POST(request: Request) {
  const metric = (await request.json()) as WebVitalMetric;

  if (typeof metric.name !== "string" || typeof metric.value !== "number") {
    return new Response(null, { status: 400 });
  }

  // No analytics provider is configured yet — log real-user CWV samples so
  // they're visible in server/runtime logs until one is wired up.
  console.log(
    `[web-vitals] ${metric.name}=${metric.value.toFixed(2)} rating=${metric.rating ?? "n/a"} path=${metric.path ?? "n/a"} id=${metric.id}`
  );

  return new Response(null, { status: 204 });
}
