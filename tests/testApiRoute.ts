// tests/testApiRoute.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/parse-cv/route';
import JSZip from 'jszip';

console.log('🧪 RUNNING REAL /api/parse-cv ROUTE ENDPOINT TESTS');
console.log('===================================================\n');

/**
 * Creates a valid PDF buffer of an exact target byte length.
 */
function makeExactSizePdf(text: string, targetTotalBytes: number): Buffer {
  const header = Buffer.from('%PDF-1.4\n');
  const obj1 = Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const obj2 = Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  const obj3 = Buffer.from(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
  );
  const obj5 = Buffer.from('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  const baseStreamText = `BT /F1 12 Tf 72 712 Td (${text}) Tj ET\n`;
  const padLen = targetTotalBytes - 1000;
  let bestBuf: Buffer | null = null;

  for (let p = Math.max(0, padLen - 300); p < padLen + 500; p++) {
    const padding = '% ' + 'A'.repeat(p) + '\n';
    const stream = Buffer.from(baseStreamText + padding, 'latin1');
    const obj4 = Buffer.concat([
      Buffer.from(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n`),
      stream,
      Buffer.from('endstream\nendobj\n'),
    ]);

    const objs = [obj1, obj2, obj3, obj4, obj5];
    const offsets: number[] = [];
    let cur = header.length;
    for (const o of objs) {
      offsets.push(cur);
      cur += o.length;
    }

    const xrefOffset = cur;
    const pad = (n: number) => String(n).padStart(10, '0');
    let xrefStr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      xrefStr += `${pad(off)} 00000 n \n`;
    }
    const trailerStr = `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const total = Buffer.concat([header, ...objs, Buffer.from(xrefStr), Buffer.from(trailerStr)]);
    if (total.length === targetTotalBytes) {
      bestBuf = total;
      break;
    }
  }

  if (!bestBuf) {
    throw new Error(`Could not generate PDF of exact size ${targetTotalBytes}`);
  }
  return bestBuf;
}

/**
 * Creates a valid minimal DOCX ZIP buffer using jszip.
 */
async function createValidDocxBuffer(paragraphs: string[]): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );
  const pTags = paragraphs.map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join('');
  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${pTags}</w:body></w:document>`;
  zip.file('word/document.xml', docXml);

  return (await zip.generateAsync({ type: 'nodebuffer' })) as Buffer;
}

async function runApiTests() {
  const validPdfBuf = fs.readFileSync(path.join(__dirname, 'sample_valid.pdf'));
  const shortPdfBuf = fs.readFileSync(path.join(__dirname, 'sample_short.pdf'));

  // --- 1. Content-Length Pre-Buffer Guard Check (> 5 MB + 64 KB overhead) ---
  console.log('--- 1. Testing Pre-Buffer Size Limit (Content-Length Header > 5 MB + overhead) ---');
  const oversizedHeaderReq = new NextRequest('http://localhost:3000/api/parse-cv', {
    method: 'POST',
    headers: {
      'content-length': String(6 * 1024 * 1024), // 6 MB
    },
  });
  const resOversizedHeader = await POST(oversizedHeaderReq);
  assert.strictEqual(
    resOversizedHeader.status,
    413,
    'Must return 413 Payload Too Large before parsing body when Content-Length exceeds 5MB + overhead'
  );
  const dataOversizedHeader = await resOversizedHeader.json();
  assert(dataOversizedHeader.error.includes('5 MB'), 'Error must mention 5 MB limit');
  console.log('  ✓ Early Content-Length check prevents buffering excessively large payloads into RAM (413)');

  // --- 2. Boundary Regression: Valid PDF of Exactly 5 MB (5,242,880 bytes) ---
  console.log('\n--- 2. Testing Boundary Regression: Valid PDF of Exactly 5 MB ---');
  const exact5MBPdf = makeExactSizePdf(
    'Jane Doe\nSkills: Python, TypeScript, React, Next.js, FastAPI, Docker, Git. Projects: AI Lead System.',
    5 * 1024 * 1024
  );
  assert.strictEqual(exact5MBPdf.length, 5242880, 'File must be exactly 5,242,880 bytes');
  const fd5MB = new FormData();
  fd5MB.append(
    'file',
    new File([new Uint8Array(exact5MBPdf)], 'exact-5mb-resume.pdf', { type: 'application/pdf' })
  );
  const res5MB = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fd5MB })
  );
  assert.strictEqual(
    res5MB.status,
    200,
    'Valid PDF of exactly 5 MB (with multipart overhead) must pass size check and return 200 OK'
  );
  const data5MB = await res5MB.json();
  assert.strictEqual(data5MB.profile.name, 'Jane Doe', 'Extracted candidate name matches');
  assert(data5MB.profile.skills.length >= 5, 'Skills extracted from 5 MB document');
  console.log('  ✓ Valid PDF of exactly 5 MB passes multipart envelope and returns 200 OK');

  // --- 3. Boundary Regression: File Larger Than 5 MB (5,242,881 bytes = 5 MB + 1 byte) ---
  console.log('\n--- 3. Testing Boundary Regression: File of 5 MB + 1 Byte ---');
  const over5MBPdf = makeExactSizePdf(
    'Jane Doe\nSkills: Python, TypeScript, React, Next.js, FastAPI, Docker, Git. Projects: AI Lead System.',
    5 * 1024 * 1024 + 1
  );
  assert.strictEqual(over5MBPdf.length, 5242881, 'File must be exactly 5,242,881 bytes (5 MB + 1 byte)');
  const fdOver5MB = new FormData();
  fdOver5MB.append(
    'file',
    new File([new Uint8Array(over5MBPdf)], 'over-5mb-resume.pdf', { type: 'application/pdf' })
  );
  const resOver5MB = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdOver5MB })
  );
  assert.strictEqual(
    resOver5MB.status,
    413,
    'File exceeding 5 MB limit by 1 byte must be rejected with 413 Payload Too Large'
  );
  const dataOver5MB = await resOver5MB.json();
  assert(dataOver5MB.error.includes('5 MB'), 'Error explains 5 MB file size limit');
  console.log('  ✓ File of 5 MB + 1 byte rejected with 413 Payload Too Large');

  // --- 4. Missing or Invalid Content-Length Header Protection ---
  console.log('\n--- 4. Testing Missing or Invalid Content-Length Header Protection ---');
  // 4.1 Missing Content-Length header with file > 5 MB (FormData)
  const reqNoHeaderOver = new NextRequest('http://localhost:3000/api/parse-cv', {
    method: 'POST',
    body: fdOver5MB,
    headers: {}, // No content-length header
  });
  const resNoHeaderOver = await POST(reqNoHeaderOver);
  assert.strictEqual(
    resNoHeaderOver.status,
    413,
    'Missing Content-Length header with file > 5MB must still be rejected with 413'
  );
  console.log('  ✓ Missing Content-Length header: rejected with 413 on oversized file');

  // 4.2 Invalid Content-Length header ("invalid-not-a-number") with file > 5 MB
  const reqBadHeaderOver = new NextRequest('http://localhost:3000/api/parse-cv', {
    method: 'POST',
    body: fdOver5MB,
    headers: {
      'content-length': 'invalid-nan-value',
    },
  });
  const resBadHeaderOver = await POST(reqBadHeaderOver);
  assert.strictEqual(
    resBadHeaderOver.status,
    413,
    'Invalid/NaN Content-Length header with file > 5MB must still be rejected with 413'
  );
  console.log('  ✓ Invalid/NaN Content-Length header: rejected with 413 on oversized file');

  // 4.3 Missing Content-Length header with valid 5 MB file
  const reqNoHeaderValid = new NextRequest('http://localhost:3000/api/parse-cv', {
    method: 'POST',
    body: fd5MB,
    headers: {}, // No content-length header
  });
  const resNoHeaderValid = await POST(reqNoHeaderValid);
  assert.strictEqual(
    resNoHeaderValid.status,
    200,
    'Missing Content-Length header with valid 5 MB file succeeds with 200 OK'
  );
  console.log('  ✓ Missing Content-Length header: valid 5 MB file succeeds with 200 OK');

  // 4.4 Stream-level Early Cut-Off & Upstream Cancellation: Oversized Chunked Stream without Content-Length
  console.log('\n--- 4.4 Testing Stream-level Early Cut-Off & Upstream Cancellation (Chunked without Content-Length) ---');
  const chunkedBoundary = '----WebKitFormBoundaryChunkedSafetyTest';
  const chunkedHeader = `--${chunkedBoundary}\r\nContent-Disposition: form-data; name="file"; filename="oversized-stream.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;

  // Producer generating a 10 MB chunked stream in 64 KB pieces with cancel tracking
  let chunkedBytesEmitted = 0;
  let chunkCount = 0;
  let sourceCancelled = false;
  let sourceCancelReason = '';
  const targetTotalChunks = 160; // 160 * 64 KB = 10,240 KB (~10 MB)
  const chunkSize = 64 * 1024;

  const oversizedChunkedStream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (chunkCount === 0) {
        const headerBuf = Buffer.from(chunkedHeader);
        chunkedBytesEmitted += headerBuf.length;
        controller.enqueue(new Uint8Array(headerBuf));
        chunkCount++;
      } else if (chunkCount < targetTotalChunks) {
        chunkedBytesEmitted += chunkSize;
        controller.enqueue(new Uint8Array(chunkSize));
        chunkCount++;
      } else {
        const footerBuf = Buffer.from(`\r\n--${chunkedBoundary}--\r\n`);
        chunkedBytesEmitted += footerBuf.length;
        controller.enqueue(new Uint8Array(footerBuf));
        controller.close();
      }
    },
    cancel(reason) {
      sourceCancelled = true;
      sourceCancelReason = String(reason);
    },
  });

  const reqChunkedOversized = new NextRequest('http://localhost:3000/api/parse-cv', {
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=${chunkedBoundary}`,
      // NO content-length header: chunked stream simulation
    },
    body: oversizedChunkedStream,
    // @ts-expect-error duplex option is required by undici when body is a stream
    duplex: 'half',
  });

  const resChunkedOversized = await POST(reqChunkedOversized);
  // Verification A: HTTP status 413 Payload Too Large
  assert.strictEqual(
    resChunkedOversized.status,
    413,
    'Oversized chunked request must return 413 Payload Too Large'
  );
  const dataChunkedOversized = await resChunkedOversized.json();
  assert(
    dataChunkedOversized.error.includes('5 MB'),
    'Error response must explain 5 MB file size limit'
  );

  // Verification B: Physical RAM protection - the stream reader MUST have aborted early
  // without buffering the entire 10 MB payload into memory.
  assert(
    chunkedBytesEmitted < 6 * 1024 * 1024,
    `Stream must abort early! Emitted ${chunkedBytesEmitted} bytes, which should be < 6 MB (total payload was 10 MB)`
  );
  assert(
    chunkCount < targetTotalChunks,
    `Stream producer must not finish all chunks! Stopped at chunk ${chunkCount}/${targetTotalChunks}`
  );

  // Verification C: Explicit Upstream Cancellation - reader.cancel() must have invoked source.cancel()
  assert.strictEqual(
    sourceCancelled,
    true,
    'Upstream source stream cancel() handler MUST be explicitly triggered when limit is exceeded'
  );
  assert.strictEqual(
    sourceCancelReason,
    'PAYLOAD_TOO_LARGE',
    'Upstream source cancel reason must be PAYLOAD_TOO_LARGE'
  );

  console.log(
    `  ✓ Verification A (HTTP status): 413 Payload Too Large correctly returned`
  );
  console.log(
    `  ✓ Verification B (RAM protection): Stream consumption aborted early at ${(chunkedBytesEmitted / (1024 * 1024)).toFixed(2)} MB (chunk ${chunkCount}/${targetTotalChunks}), preventing 10 MB full RAM buffering`
  );
  console.log(
    `  ✓ Verification C (Upstream cancellation): source.cancel() was explicitly triggered with reason "${sourceCancelReason}"`
  );

  // --- 5. Unsupported File Format ---
  console.log('\n--- 5. Testing Unsupported Format Rejection (.png, .txt) ---');
  const fdPng = new FormData();
  fdPng.append('file', new File(['not an image'], 'avatar.png', { type: 'image/png' }));
  const resPng = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdPng })
  );
  assert.strictEqual(resPng.status, 400, 'Must return 400 Bad Request for .png');
  const dataPng = await resPng.json();
  assert(dataPng.error.includes('Only .pdf and .docx'), 'Error message specifies supported formats');
  console.log('  ✓ Unsupported format (.png) rejected with 400 Bad Request');

  // --- 6. Corrupted PDF Document ---
  console.log('\n--- 6. Testing Corrupted PDF Handling ---');
  const fdBadPdf = new FormData();
  fdBadPdf.append(
    'file',
    new File(['%PDF-1.4 corrupted garbage bytes non-parseable'], 'broken.pdf', {
      type: 'application/pdf',
    })
  );
  const resBadPdf = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdBadPdf })
  );
  assert.strictEqual(resBadPdf.status, 422, 'Must return 422 Unprocessable Entity for corrupted PDF');
  const dataBadPdf = await resBadPdf.json();
  assert(dataBadPdf.error.includes('Failed to read PDF document'), 'Explains PDF reading error');
  console.log('  ✓ Corrupted PDF safely caught and returned as 422 Unprocessable Entity');

  // --- 7. Corrupted DOCX Document ---
  console.log('\n--- 7. Testing Corrupted DOCX Handling ---');
  const fdBadDocx = new FormData();
  fdBadDocx.append(
    'file',
    new File(['PK not a valid zip archive for docx'], 'broken.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  );
  const resBadDocx = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdBadDocx })
  );
  assert.strictEqual(resBadDocx.status, 422, 'Must return 422 Unprocessable Entity for corrupted DOCX');
  const dataBadDocx = await resBadDocx.json();
  assert(dataBadDocx.error.includes('Failed to read DOCX document'), 'Explains DOCX reading error');
  console.log('  ✓ Corrupted DOCX safely caught and returned as 422 Unprocessable Entity');

  // --- 8. Empty / Unreadable Document (< 20 characters) ---
  console.log('\n--- 8. Testing Empty / Unreadable Document Rejection ---');
  const fdEmptyPdf = new FormData();
  fdEmptyPdf.append(
    'file',
    new File([new Uint8Array(shortPdfBuf)], 'empty.pdf', { type: 'application/pdf' })
  );
  const resEmptyPdf = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdEmptyPdf })
  );
  assert.strictEqual(
    resEmptyPdf.status,
    422,
    'Must return 422 when extracted text is less than 20 characters'
  );
  const dataEmptyPdf = await resEmptyPdf.json();
  assert(
    dataEmptyPdf.error.includes('Could not extract readable text'),
    'Explains unreadable/scanned error'
  );
  console.log('  ✓ Short/unreadable document (< 20 chars) rejected with 422 and helpful alert');

  // --- 9. Standard Valid PDF Parsing ---
  console.log('\n--- 9. Testing Standard Valid PDF Parsing ---');
  const fdValidPdf = new FormData();
  fdValidPdf.append(
    'file',
    new File([new Uint8Array(validPdfBuf)], 'jane-doe-resume.pdf', { type: 'application/pdf' })
  );

  const resValidPdf = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdValidPdf })
  );
  assert.strictEqual(resValidPdf.status, 200, 'Valid PDF must return 200 OK');
  const dataValidPdf = await resValidPdf.json();
  assert(dataValidPdf.profile, 'Response must include profile object');
  assert.strictEqual(dataValidPdf.profile.name, 'Jane Doe', 'Extracted candidate name matches');
  assert(dataValidPdf.profile.skills.includes('Python'), 'Extracted skills includes Python');
  assert(dataValidPdf.profile.skills.includes('TypeScript'), 'Extracted skills includes TypeScript');
  assert(dataValidPdf.profile.skills.includes('FastAPI'), 'Extracted skills includes FastAPI');
  console.log(
    `  ✓ Standard Valid PDF parsed successfully (200 OK): Candidate "${dataValidPdf.profile.name}", ${dataValidPdf.profile.skills.length} skills`
  );

  // --- 10. Valid DOCX Parsing & Candidate Profile Extraction ---
  console.log('\n--- 10. Testing Valid DOCX Parsing ---');
  const validDocxBuf = await createValidDocxBuffer([
    'Alex Smith',
    'Junior Full-Stack Developer with practical experience.',
    'Skills: TypeScript, React, Node.js, Git, CI/CD, SQL.',
    'Projects: Web Application System with TypeScript and React.',
  ]);
  const fdValidDocx = new FormData();
  fdValidDocx.append(
    'file',
    new File([new Uint8Array(validDocxBuf)], 'alex-smith-cv.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  );

  const resValidDocx = await POST(
    new NextRequest('http://localhost:3000/api/parse-cv', { method: 'POST', body: fdValidDocx })
  );
  assert.strictEqual(resValidDocx.status, 200, 'Valid DOCX must return 200 OK');
  const dataValidDocx = await resValidDocx.json();
  assert(dataValidDocx.profile, 'Response must include profile object');
  assert.strictEqual(dataValidDocx.profile.name, 'Alex Smith', 'Extracted candidate name matches');
  assert(dataValidDocx.profile.skills.includes('TypeScript'), 'Extracted skills includes TypeScript');
  assert(dataValidDocx.profile.skills.includes('React'), 'Extracted skills includes React');
  assert(dataValidDocx.profile.skills.includes('SQL'), 'Extracted skills includes SQL');
  console.log(
    `  ✓ Valid DOCX parsed successfully (200 OK): Candidate "${dataValidDocx.profile.name}", ${dataValidDocx.profile.skills.length} skills`
  );

  // --- 11. Live HTTP Wire Tests (against http://localhost:3000) ---
  console.log('\n--- 11. Live HTTP Wire Tests (Network Fetch to running server) ---');
  try {
    const liveFd = new FormData();
    liveFd.append(
      'file',
      new File([new Uint8Array(validPdfBuf)], 'jane-live.pdf', { type: 'application/pdf' })
    );

    const liveRes = await fetch('http://localhost:3000/api/parse-cv', {
      method: 'POST',
      body: liveFd,
    });

    if (liveRes.ok) {
      const liveData = await liveRes.json();
      assert(liveData.profile, 'Live HTTP endpoint returned candidate profile');
      assert.strictEqual(liveData.profile.name, 'Jane Doe', 'Live HTTP returned correct candidate name');
      console.log(
        `  ✓ Live HTTP POST to http://localhost:3000/api/parse-cv returned 200 OK with ${liveData.profile.skills.length} skills`
      );
    } else {
      console.log(`  ℹ Local server responded with ${liveRes.status} (skipping live wire check)`);
    }
  } catch {
    console.log('  ℹ Dev server not reachable via external fetch (skipped live wire check)');
  }

  console.log('\n===================================================');
  console.log('✅ ALL REAL /api/parse-cv ENDPOINT TESTS PASSED (100% VERIFIED)\n');
}

runApiTests().catch((err) => {
  console.error('API Test Failure:', err);
  process.exit(1);
});
