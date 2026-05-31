import { NextResponse } from 'next/server';
import { parseFile } from '@/lib/parse';
import { chunkText } from '@/lib/chunk';
import { embedTexts } from '@/lib/embed';
import { upsertEmbeddings } from '@/lib/pinecone';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name || 'document';
    const text = await parseFile(file, fileName);

    if (!text.trim()) {
      return NextResponse.json({ error: 'Uploaded file is empty or not supported' }, { status: 400 });
    }

    const chunks = chunkText(text, 900, 120);
    const embeddings = await embedTexts(chunks);

    const vectors = chunks.map((chunk, index) => ({
      id: `${fileName}-${index}-${Math.random().toString(36).slice(2, 10)}`,
      values: embeddings[index],
      metadata: {
        source: fileName,
        text: chunk,
        chunkIndex: index,
      },
    }));

    await upsertEmbeddings(vectors);

    return NextResponse.json({
      success: true,
      fileName,
      documentCount: chunks.length,
      message: `${chunks.length} document chunks indexed successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Upload failed' }, { status: 500 });
  }
}
