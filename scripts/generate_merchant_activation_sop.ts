import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { jsPDF } from "jspdf";

const outputPath = resolve(process.cwd(), "docs/internal/merchant-activation-sop.pdf");

mkdirSync(dirname(outputPath), { recursive: true });

const doc = new jsPDF({
  orientation: "portrait",
  unit: "pt",
  format: "letter",
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const left = 42;
let y = 42;

doc.setFillColor(10, 14, 20);
doc.rect(0, 0, pageWidth, pageHeight, "F");

doc.setFillColor(249, 115, 22);
doc.rect(0, 0, pageWidth, 66, "F");

doc.setTextColor(255, 255, 255);
doc.setFont("helvetica", "bold");
doc.setFontSize(24);
doc.text("TrueServe Merchant Activation SOP", left, 42);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.text("Internal one-page guide for Eric and Leon", pageWidth - 220, 42);

y = 96;

const writeSection = (title: string, lines: string[]) => {
  doc.setTextColor(249, 115, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), left, y);
  y += 18;

  doc.setTextColor(232, 232, 232);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, pageWidth - left * 2);
    doc.text(wrapped, left, y);
    y += wrapped.length * 13 + 6;
  });

  y += 6;
};

writeSection("Purpose", [
  "The merchant storefront toolkit helps a newly approved restaurant start promoting direct ordering immediately.",
  "It turns the storefront into a launch kit with a live link, QR code, social copy, embed code, and printable in-store assets.",
]);

writeSection("What Eric and Leon should do", [
  "After merchant approval, send the partner to the Storefront section of the merchant dashboard.",
  "Confirm the restaurant can see the direct ordering link, QR code, social caption, flyer PDF, and table-tent PDF.",
  "Have the merchant publish at least one social post and download at least one in-store QR asset before onboarding ends.",
]);

writeSection("Minimum launch standard", [
  "Storefront link copied and tested.",
  "QR flyer or table tent downloaded for in-store use.",
  "First Facebook or Instagram promo post prepared with the provided caption.",
  "If the merchant has a website or GHL page, share the embed snippet with them.",
]);

writeSection("How to explain it to merchants", [
  "You are not just getting a dashboard. You are getting a launch kit that helps you promote your TrueServe storefront right away.",
  "Use your direct ordering link online and your QR materials in-store to turn traffic into orders faster.",
]);

writeSection("One-line internal positioning", [
  "TrueServe gives each merchant a storefront plus the tools to actually market it.",
]);

doc.setDrawColor(255, 255, 255, 0.12);
doc.line(left, pageHeight - 58, pageWidth - left, pageHeight - 58);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(170, 170, 170);
doc.text("Reference: Merchant Dashboard → Storefront", left, pageHeight - 38);
doc.text("Generated for pilot operations", pageWidth - 170, pageHeight - 38);

doc.save(outputPath);
console.log(`Generated ${outputPath}`);
