const PDFDocument = require("pdfkit")

function exportToPDF(data, res) {
  const doc = new PDFDocument()

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", "attachment; filename=presences.pdf")

  doc.pipe(res)

  doc.fontSize(16).text("Rapport des Présences", { align: "center" })
  doc.moveDown()

  data.forEach((presence) => {
    doc
      .fontSize(12)
      .text(
        `${new Date(presence.date).toLocaleString()} - ${presence.employe.prenom} ${presence.employe.nom} - ${
          presence.type
        } - ${presence.methode}`,
      )
    doc.moveDown(0.5)
  })

  doc.end()
}

module.exports = exportToPDF

