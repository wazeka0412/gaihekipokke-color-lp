const POKKE_ORIGIN = 'https://www.gaihekipokke.jp';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get('image');

  if (!(image instanceof File) || !image.type.startsWith('image/') || image.size > MAX_IMAGE_SIZE) {
    return Response.json({ message: '10MB以下の画像ファイルを選択してください。' }, { status: 400 });
  }

  const upstreamForm = new FormData();
  upstreamForm.append('image', image, image.name);
  const upstream = await fetch(`${POKKE_ORIGIN}/api/simulation/detect`, {
    method: 'POST',
    body: upstreamForm,
    signal: AbortSignal.timeout(30000),
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}
