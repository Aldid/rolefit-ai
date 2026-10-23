// src/app/api/parse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractProfileFromText } from '@/lib/extractProfile';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided. Please upload a valid PDF or DOCX resume.' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 5 MB limit. Please upload a smaller document.' },
        { status: 413 }
      );
    }

    const fileName = file instanceof File ? file.name : 'uploaded-resume';
    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const isDocx = lowerName.endsWith('.docx');

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: 'Unsupported file format. Only .pdf and .docx documents are supported.' },
        { status: 400 }
      );
    }

    // Read file buffer directly into RAM (NO disk writes, NO persistent logging)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (isPdf) {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || '';
      } catch {
        return NextResponse.json(
          { error: 'Failed to read PDF document. The file may be password-protected or corrupted.' },
          { status: 422 }
        );
      }
    } else if (isDocx) {
      try {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value || '';
      } catch {
        return NextResponse.json(
          { error: 'Failed to read DOCX document. The file may be damaged or in an unsupported Word format.' },
          { status: 422 }
        );
      }
    }

    // Check if readable text was extracted
    const cleanText = extractedText.trim();
    if (!cleanText || cleanText.length < 20) {
      return NextResponse.json(
        {
          error:
            'Could not extract readable text from this document. It may be an image-only scan or empty. You can still use the 1-Click Sample CV to test the application.',
        },
        { status: 422 }
      );
    }

    // Deterministic profile extraction
    const profile = extractProfileFromText(cleanText, fileName);

    return NextResponse.json({ profile }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the document. Please try again or use the Sample CV.' },
      { status: 500 }
    );
  }
}
