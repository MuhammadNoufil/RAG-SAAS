import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/chroma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentId = String(body.documentId ?? '').trim();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await deleteDocument(documentId);

    return NextResponse.json({
      success: true,
      message: `Document "${documentId}" deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Delete failed' },
      { status: 500 },
    );
  }
}
