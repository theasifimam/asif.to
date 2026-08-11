/**
 * generateCertificate
 * Generates a premium certificate of completion as a PNG blob using Canvas API.
 *
 * @param {object} opts
 * @param {string} opts.studentName
 * @param {string} opts.studentEmail
 * @param {string} opts.courseName
 * @param {number} opts.score
 * @param {number} opts.total
 * @param {string} opts.date
 * @returns {Promise<void>} Triggers a file download
 */
export async function generateCertificate({ studentName, studentEmail, courseName, score, total, date }) {
  const W = 1100;
  const H = 780;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Background ────────────────────────────────────────────────────────────
  // Deep dark gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0a0f1e");
  bgGrad.addColorStop(0.5, "#0d1530");
  bgGrad.addColorStop(1, "#0a0f1e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative corner patterns ────────────────────────────────────────────
  const drawCornerDot = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(196,160,80,0.6)";
    ctx.fill();
  };

  // Corner flourishes
  [
    [50, 50], [60, 50], [70, 50], [50, 60], [50, 70],
    [W - 50, 50], [W - 60, 50], [W - 70, 50], [W - 50, 60], [W - 50, 70],
    [50, H - 50], [60, H - 50], [70, H - 50], [50, H - 60], [50, H - 70],
    [W - 50, H - 50], [W - 60, H - 50], [W - 70, H - 50], [W - 50, H - 60], [W - 50, H - 70],
  ].forEach(([x, y]) => drawCornerDot(x, y));

  // ── Outer gold border ─────────────────────────────────────────────────────
  const borderGrad = ctx.createLinearGradient(0, 0, W, H);
  borderGrad.addColorStop(0, "#c4a050");
  borderGrad.addColorStop(0.3, "#f0d080");
  borderGrad.addColorStop(0.6, "#c4a050");
  borderGrad.addColorStop(1, "#a07830");

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Inner thinner border
  ctx.strokeStyle = "rgba(196,160,80,0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(42, 42, W - 84, H - 84);

  // ── Glowing center circle (decorative) ───────────────────────────────────
  const circleGrad = ctx.createRadialGradient(W / 2, 160, 0, W / 2, 160, 70);
  circleGrad.addColorStop(0, "rgba(196,160,80,0.25)");
  circleGrad.addColorStop(1, "rgba(196,160,80,0)");
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(W / 2, 160, 70, 0, Math.PI * 2);
  ctx.fill();

  // ── React.js Logo area (stylised) ─────────────────────────────────────────
  ctx.save();
  ctx.translate(W / 2, 145);

  // React atom-like icon (simplified circles)
  ctx.strokeStyle = "rgba(97,218,251,0.7)";
  ctx.lineWidth = 3;

  const drawEllipse = (rotAngle) => {
    ctx.save();
    ctx.rotate(rotAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  drawEllipse(0);
  drawEllipse(Math.PI / 3);
  drawEllipse(-Math.PI / 3);

  // Center nucleus
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(97,218,251,0.9)";
  ctx.fill();

  ctx.restore();

  // ── Header text ───────────────────────────────────────────────────────────
  // "CERTIFICATE OF COMPLETION"
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(196,160,80,0.9)";
  ctx.font = "bold 13px 'Arial', sans-serif";
  ctx.letterSpacing = "0.3em";
  ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 230);

  // Divider line
  const divGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.5, "rgba(196,160,80,0.7)");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 220, 245);
  ctx.lineTo(W / 2 + 220, 245);
  ctx.stroke();

  // "This is to certify that"
  ctx.fillStyle = "rgba(180,190,210,0.7)";
  ctx.font = "italic 16px 'Georgia', serif";
  ctx.fillText("This is to certify that", W / 2, 290);

  // ── Student Name ──────────────────────────────────────────────────────────
  const nameGrad = ctx.createLinearGradient(0, 310, W, 370);
  nameGrad.addColorStop(0, "#f0d080");
  nameGrad.addColorStop(0.5, "#ffffff");
  nameGrad.addColorStop(1, "#c4a050");
  ctx.fillStyle = nameGrad;
  ctx.font = "bold 48px 'Georgia', serif";
  ctx.fillText(studentName || "Student", W / 2, 360);

  // Underline below name
  const nameWidth = ctx.measureText(studentName || "Student").width;
  ctx.strokeStyle = "rgba(196,160,80,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 372);
  ctx.lineTo(W / 2 + nameWidth / 2, 372);
  ctx.stroke();

  // "has successfully demonstrated mastery in"
  ctx.fillStyle = "rgba(180,190,210,0.7)";
  ctx.font = "italic 16px 'Georgia', serif";
  ctx.fillText("has successfully demonstrated mastery in", W / 2, 415);

  // ── Course name ───────────────────────────────────────────────────────────
  const courseGrad = ctx.createLinearGradient(0, 430, W, 470);
  courseGrad.addColorStop(0, "#61dafb");
  courseGrad.addColorStop(0.5, "#a8eeff");
  courseGrad.addColorStop(1, "#61dafb");
  ctx.fillStyle = courseGrad;
  ctx.font = "bold 30px 'Arial', sans-serif";
  ctx.fillText(courseName, W / 2, 465);

  // ── Score badge ───────────────────────────────────────────────────────────
  const scorePercent = Math.round((score / total) * 100);
  const badgeCenterX = W / 2;
  const badgeCenterY = 520;

  ctx.fillStyle = "rgba(196,160,80,0.12)";
  ctx.beginPath();
  const badgeW = 220;
  const badgeH = 44;
  const r = 22;
  const bx = badgeCenterX - badgeW / 2;
  const by = badgeCenterY - badgeH / 2;
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + badgeW - r, by);
  ctx.quadraticCurveTo(bx + badgeW, by, bx + badgeW, by + r);
  ctx.lineTo(bx + badgeW, by + badgeH - r);
  ctx.quadraticCurveTo(bx + badgeW, by + badgeH, bx + badgeW - r, by + badgeH);
  ctx.lineTo(bx + r, by + badgeH);
  ctx.quadraticCurveTo(bx, by + badgeH, bx, by + badgeH - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(196,160,80,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "rgba(196,160,80,0.9)";
  ctx.font = "bold 15px 'Arial', sans-serif";
  ctx.fillText(`Score: ${score}/${total} (${scorePercent}%)`, badgeCenterX, badgeCenterY + 5);

  // ── Footer: date, platform ────────────────────────────────────────────────
  const footerY = H - 100;

  // Divider
  const footDivGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
  footDivGrad.addColorStop(0, "transparent");
  footDivGrad.addColorStop(0.5, "rgba(196,160,80,0.4)");
  footDivGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = footDivGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, footerY - 15);
  ctx.lineTo(W - 100, footerY - 15);
  ctx.stroke();

  // Date (left)
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(180,190,210,0.6)";
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillText(`Date Issued: ${date}`, 100, footerY + 10);

  // Platform (right)
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(180,190,210,0.6)";
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillText("asif.to — Learn. Build. Ship.", W - 100, footerY + 10);

  // Email (center, subtle)
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(180,190,210,0.35)";
  ctx.font = "11px 'Arial', sans-serif";
  ctx.fillText(studentEmail || "", W / 2, footerY + 35);

  // ── Watermark ─────────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 160px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.translate(W / 2, H / 2 + 60);
  ctx.rotate(-Math.PI / 8);
  ctx.fillText("CERTIFIED", 0, 0);
  ctx.restore();

  // ── Download ──────────────────────────────────────────────────────────────
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = (studentName || "student").replace(/\s+/g, "_");
      link.download = `ReactJS_Certificate_${safeName}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    }, "image/png");
  });
}
