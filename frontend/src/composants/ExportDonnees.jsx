"use client"

import { useState } from "react"
import { Container, Form, Button, Card, Alert } from "react-bootstrap"
import { toast } from "react-toastify"
import api from "../services/api"

export default function ExportDonnees() {
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [format, setFormat] = useState("excel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExport = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`/export`, {
        params: {
          dateDebut,
          dateFin,
          format,
        },
        responseType: "blob",
      })

      // Créer un URL pour le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url

      // Définir le nom du fichier
      const extension = format === "excel" ? "xlsx" : "pdf"
      const fileName = `export_presences_${dateDebut}_${dateFin}.${extension}`
      link.setAttribute("download", fileName)

      // Déclencher le téléchargement
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Export réussi")
    } catch (error) {
      console.error("Erreur d'export:", error)
      setError("Une erreur est survenue lors de l'export. Veuillez réessayer.")
      toast.error("Erreur lors de l'export")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Export des Données</h1>

      <Card className="slide-in">
        <Card.Body>
          <Form onSubmit={handleExport}>
            <Form.Group className="mb-3">
              <Form.Label>Date de début</Form.Label>
              <Form.Control type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <Form.Control type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Format d'export</Form.Label>
              <Form.Select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF (.pdf)</option>
              </Form.Select>
            </Form.Group>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-100 btn-animate">
              {loading ? "Export en cours..." : "Exporter les données"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

