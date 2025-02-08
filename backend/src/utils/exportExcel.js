const ExcelJS = require("exceljs")

async function exportToExcel(data, res) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Présences")

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Employé", key: "employe", width: 30 },
    { header: "Type", key: "type", width: 10 },
    { header: "Méthode", key: "methode", width: 20 },
  ]

  data.forEach((presence) => {
    worksheet.addRow({
      date: new Date(presence.date).toLocaleString(),
      employe: `${presence.employe.prenom} ${presence.employe.nom}`,
      type: presence.type,
      methode: presence.methode,
    })
  })

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.setHeader("Content-Disposition", "attachment; filename=presences.xlsx")

  await workbook.xlsx.write(res)
  res.end()
}

module.exports = exportToExcel

