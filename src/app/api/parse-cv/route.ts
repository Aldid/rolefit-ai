// src/app/api/parse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractProfileFromText } from '@/lib/extractProfile';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB file size limit (5,242,880 bytes)
const MAX_MULTIPART_OVERHEAD = 64 * 1024; // 64 KB allowance for multipart boundary and headers

/**
 * Wraps a ReadableStream to monitor and limit incoming chunked byte volume.
 * If the byte stream exceeds maxBytes, the controller is errored with PAYLOAD_TOO_LARGE,
 * immediately halting stream consumption before buffering the entire payload into RAM.
 */
function meterStream(source: ReadableStream<Uint8Array>, maxBytes: number): ReadableStream<Uint8Array> {
  let bytesCount = 0;
  const reader = source.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        bytesCount += value.byteLength;
        if (bytesCount > maxBytes) {
          controller.error(new Error('PAYLOAD_TOO_LARGE'));
          return;
        }
        controller.enqueue(value);
      } catch (err) {
        controller.error(err);
      }
    },
    async cancel(reason) {
      try {
        await reader.cancel(reason);
      } catch {
        // Ignore downstream cancellation errors
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Fast-fail Content-Length pre-buffer check (including multipart overhead allowance)
    //    Prevents buffering excessively large requests into RAM while allowing a 5 MB file + envelope
    const contentLengthHeader = req.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (!isNaN(contentLength) && contentLength > MAX_FILE_SIZE + MAX_MULTIPART_OVERHEAD) {
        return NextResponse.json(
          { error: 'File size exceeds the 5 MB limit. Please upload a smaller document.' },
          { status: 413 }
        );
      }
    }

    // 2. Stream-level metering for chunked / unmetered incoming requests:
    //    If Content-Length was missing or invalid, meter the body stream so oversized payloads
    //    abort during reception without buffering the whole stream into RAM.
    let formData: FormData;
    try {
      if (req.body && !req.body.locked) {
        const meteredBody = meterStream(req.body, MAX_FILE_SIZE + MAX_MULTIPART_OVERHEAD);
        const meteredReq = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: meteredBody,
          // @ts-expect-error duplex is required in Node.js undici when body is a stream
          duplex: 'half',
        });
        formData = await meteredReq.formData();
      } else {
        formData = await req.formData();
      }
    } catch (streamErr: unknown) {
      const errorMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
      if (errorMsg.includes('PAYLOAD_TOO_LARGE')) {
        return NextResponse.json(
          { error: 'File size exceeds the 5 MB limit. Please upload a smaller document.' },
          { status: 413 }
        );
      }
      return NextResponse.json(
        { error: 'Could not parse request body. Please upload a valid PDF or DOCX resume.' },
        { status: 400 }
      );
    }
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
        const parsed = await pdfParse(new Uint8Array(buffer) as unknown as Buffer);
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
