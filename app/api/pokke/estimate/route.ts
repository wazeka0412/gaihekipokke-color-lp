const POKKE_ORIGIN = 'https://www.gaihekipokke.jp';

export async function POST(request: Request) {
  const input = await request.json() as Record<string, unknown>;
  const payload = {
    buildingType: input.buildingType,
    area: Number(input.area),
    areaLarge: Boolean(input.areaLarge),
    floors: Number(input.floors),
    wallMaterial: input.wallMaterial,
    paintGrade: input.paintGrade,
    additionalWorks: Array.isArray(input.additionalWorks) ? input.additionalWorks : [],
    caulkingAddMeters: Number(input.caulkingAddMeters) || 0,
    caulkingReplaceMeters: Number(input.caulkingReplaceMeters) || 0,
  };

  if (!payload.buildingType || !payload.wallMaterial || !payload.paintGrade || !Number.isFinite(payload.area) || payload.area <= 0) {
    return Response.json({ message: '建物情報を確認してください。' }, { status: 400 });
  }

  const upstream = await fetch(`${POKKE_ORIGIN}/api/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}
