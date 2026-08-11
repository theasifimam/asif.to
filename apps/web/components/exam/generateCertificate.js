const PAGE_WIDTH = 1400;
const PAGE_HEIGHT = 990;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Unable to load certificate asset: ${src}`));
    image.src = src;
  });
}

function fitFont(ctx, text, maxWidth, initialSize, family, weight = "700") {
  let size = initialSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 2;
  } while (ctx.measureText(text).width > maxWidth && size > 24);
}

function dataUrlToBytes(dataUrl) {
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function textBytes(value) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function createImagePdf(jpegBytes, imageWidth, imageHeight) {
  const pdfWidth = 842;
  const pdfHeight = 595;
  const contentStream = textBytes(
    `q\n${pdfWidth} 0 0 ${pdfHeight} 0 0 cm\n/Certificate Do\nQ`,
  );
  const objects = [
    textBytes("<< /Type /Catalog /Pages 2 0 R >>"),
    textBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    textBytes(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth} ${pdfHeight}] /Resources << /XObject << /Certificate 4 0 R >> >> /Contents 5 0 R >>`,
    ),
    concatBytes([
      textBytes(
        `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
      ),
      jpegBytes,
      textBytes("\nendstream"),
    ]),
    concatBytes([
      textBytes(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      textBytes("\nendstream"),
    ]),
  ];

  const parts = [textBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  const offsets = [0];
  let byteOffset = parts[0].length;

  objects.forEach((object, index) => {
    offsets.push(byteOffset);
    const wrapped = concatBytes([
      textBytes(`${index + 1} 0 obj\n`),
      object,
      textBytes("\nendobj\n"),
    ]);
    parts.push(wrapped);
    byteOffset += wrapped.length;
  });

  const xrefOffset = byteOffset;
  const xrefRows = offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  parts.push(
    textBytes(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefRows}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );

  return new Blob(parts, { type: "application/pdf" });
}

function drawSeal(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#0f2747";
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c49a45";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 14px Arial, sans-serif";
  ctx.fillText("VERIFIED", 0, -4);
  ctx.font = "700 11px Arial, sans-serif";
  ctx.fillText("ASIF.TO", 0, 15);
  ctx.restore();
}

/** Generate and download a branded, landscape PDF certificate. */
export async function generateCertificate({
  studentName,
  studentEmail,
  courseName,
  score,
  total,
  date,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  const logo = await loadImage("/logo.svg");
  const percentage = Math.round((score / total) * 100);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  ctx.strokeStyle = "#0f2747";
  ctx.lineWidth = 14;
  ctx.strokeRect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68);
  ctx.strokeStyle = "#c49a45";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, PAGE_WIDTH - 108, PAGE_HEIGHT - 108);
  ctx.strokeStyle = "#d8dee8";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, PAGE_WIDTH - 136, PAGE_HEIGHT - 136);

  ctx.drawImage(logo, 652, 82, 96, 96);
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f2747";
  ctx.font = "800 25px Arial, sans-serif";
  ctx.fillText("asif.to", PAGE_WIDTH / 2, 204);

  ctx.fillStyle = "#a47b2d";
  ctx.font = "700 17px Arial, sans-serif";
  ctx.fillText("CERTIFICATE OF ACHIEVEMENT", PAGE_WIDTH / 2, 264);

  ctx.strokeStyle = "#c49a45";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 288);
  ctx.lineTo(970, 288);
  ctx.stroke();

  ctx.fillStyle = "#556274";
  ctx.font = "italic 24px Georgia, serif";
  ctx.fillText("This certificate is proudly presented to", PAGE_WIDTH / 2, 350);

  const displayName = (studentName || "Student").trim();
  ctx.fillStyle = "#111827";
  fitFont(ctx, displayName, 1050, 72, "Georgia, serif");
  ctx.fillText(displayName, PAGE_WIDTH / 2, 445);

  const nameWidth = Math.min(ctx.measureText(displayName).width + 80, 1080);
  ctx.strokeStyle = "#c49a45";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo((PAGE_WIDTH - nameWidth) / 2, 468);
  ctx.lineTo((PAGE_WIDTH + nameWidth) / 2, 468);
  ctx.stroke();

  ctx.fillStyle = "#556274";
  ctx.font = "24px Georgia, serif";
  ctx.fillText(
    "for successfully passing the final examination in",
    PAGE_WIDTH / 2,
    530,
  );

  const displayCourse = courseName || "Web Development";
  ctx.fillStyle = "#0f2747";
  fitFont(ctx, displayCourse, 1020, 48, "Arial, sans-serif", "800");
  ctx.fillText(displayCourse, PAGE_WIDTH / 2, 608);

  ctx.fillStyle = "#f5f7fa";
  ctx.fillRect(476, 650, 448, 72);
  ctx.strokeStyle = "#d8dee8";
  ctx.strokeRect(476, 650, 448, 72);
  ctx.fillStyle = "#0f2747";
  ctx.font = "700 21px Arial, sans-serif";
  ctx.fillText(
    `Final score: ${score}/${total}  |  ${percentage}%`,
    PAGE_WIDTH / 2,
    695,
  );

  drawSeal(ctx, 700, 798);

  ctx.fillStyle = "#27364a";
  ctx.font = "700 17px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DATE ISSUED", 130, 810);
  ctx.fillStyle = "#667085";
  ctx.font = "17px Arial, sans-serif";
  ctx.fillText(date, 130, 840);

  ctx.textAlign = "right";
  ctx.fillStyle = "#27364a";
  ctx.font = "700 17px Arial, sans-serif";
  ctx.fillText("ASIF.TO LEARNING", 1270, 810);
  ctx.fillStyle = "#667085";
  ctx.font = "17px Arial, sans-serif";
  ctx.fillText("Learn. Build. Ship.", 1270, 840);

  ctx.textAlign = "center";
  ctx.fillStyle = "#8a94a3";
  ctx.font = "14px Arial, sans-serif";
  ctx.fillText(studentEmail || "", PAGE_WIDTH / 2, 900);

  const jpegBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.96));
  const pdfBlob = createImagePdf(jpegBytes, PAGE_WIDTH, PAGE_HEIGHT);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  const safeName = displayName
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "");
  link.href = url;
  link.download = `${displayCourse.replace(/[^a-z0-9]+/gi, "_")}_Certificate_${safeName || "Student"}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
