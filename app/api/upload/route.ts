import { NextResponse } from 'next/server';
import { parseFile } from '@/lib/parse';
import { chunkText } from '@/lib/chunk';
import { embedTexts } from '@/lib/embed';
import { upsertEmbeddings } from '@/lib/chroma';

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

    // Smaller chunks to better isolate document sections (EDUCATION, EXPERIENCE, etc)
    const chunks = chunkText(text, 400, 60);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No text chunks could be generated from the uploaded file' }, { status: 400 });
    }

    const embeddings = await embedTexts(chunks);
    if (embeddings.length === 0) {
      return NextResponse.json({ error: 'No embeddings were produced for the uploaded file' }, { status: 500 });
    }

    if (embeddings.length !== chunks.length) {
      return NextResponse.json(
        { error: 'Embedding count does not match chunk count; upload aborted' },
        { status: 500 },
      );
    }

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
