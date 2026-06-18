const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const generateReceipt = async (payment, register) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  // URL de vérification
  const verificationUrl =
    `${process.env.FRONTEND_URL}/paiements-register-recu/${payment._id}?ref=${payment.paymentNumber}`;

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

  const qrImage = Buffer.from(
    qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  const schoolName = register?.schoolId?.name || "ÉTABLISSEMENT SCOLAIRE";

  // ==========================
  // HEADER
  // ==========================

  const logoPath = path.join(
    process.cwd(),
    "uploads",
    "logo.png"
  );

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, {
      width: 60,
    });
  }

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("ACADEMIX ERP SCHOOL", {
      align: "center",
    });

  doc
    .fontSize(14)
    .font("Helvetica")
    .text(schoolName, {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("REÇU DE PAIEMENT D'INSCRIPTION", {
      align: "center",
    });

  doc.moveDown();

  // ==========================
  // NUMERO RECU
  // ==========================

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      `N° Reçu : REC-${payment.paymentNumber}`,
      {
        align: "right",
      }
    );

  doc.text(
    `Date : ${moment(payment.createdAt).format(
      "DD/MM/YYYY HH:mm"
    )}`,
    {
      align: "right",
    }
  );

  doc.moveDown();

  // ==========================
  // LIGNE
  // ==========================

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown();

  // ==========================
  // INFORMATIONS ELEVE
  // ==========================

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Informations de l'élève");

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(
      `Nom complet : ${register?.studentId?.nom} ${register?.studentId?.postnom} ${register?.studentId?.prenom}`
    );

  doc.text(
    `Matricule : ${register?.studentId?.matricule}`
  );

  doc.text(
    `Sexe : ${register?.studentId?.sexe || "-"}`
  );

  doc.text(
    `Classe : ${register?.classroomId?.name || "-"}`
  );

  doc.text(
    `Cycle : ${register?.cycleId?.name || "-"}`
  );

  doc.text(
    `Section : ${register?.sectionId?.name || "-"}`
  );

  doc.text(
    `Option : ${register?.optionId?.name || "-"}`
  );

  doc.text(
    `Année scolaire : ${register?.yearId?.year || "-"}`
  );

  doc.moveDown();

  // ==========================
  // DETAILS PAIEMENT
  // ==========================

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Détails du paiement");

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(
      `Montant payé : ${Number(payment.amountPaid).toFixed(2)} $`
    );

  doc.text(
    `Motif : ${payment.typeFee}`
  );

  doc.text(
    `Référence paiement : ${payment.paymentNumber}`
  );

  doc.moveDown();

  // ==========================
  // ENCADRE MONTANT
  // ==========================

  const currentY = doc.y;

  doc
    .rect(50, currentY, 495, 60)
    .stroke();

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(
      `Montant encaissé : ${Number(payment.amountPaid).toFixed(2)} $`,
      70,
      currentY + 20
    );

  doc.moveDown(4);

  // ==========================
  // QR CODE
  // ==========================

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(
      "Scanner pour vérifier l'authenticité du reçu :"
    );

  doc.moveDown();

  doc.image(qrImage, {
    fit: [120, 120],
    align: "center",
  });

  doc.moveDown();

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(verificationUrl, {
      align: "center",
    });

  doc.moveDown(2);

  // ==========================
  // SIGNATURE
  // ==========================

  doc.text(
    "Signature du caissier",
    350,
    doc.y
  );

  doc.moveDown(3);

  doc.text(
    "______________________",
    330,
    doc.y
  );

  // ==========================
  // FOOTER
  // ==========================

  doc.moveDown(4);

  doc
    .fontSize(8)
    .fillColor("gray")
    .text(
      "Document généré automatiquement par Academix ERP School",
      {
        align: "center",
      }
    );

  return doc;
};

module.exports = generateReceipt;