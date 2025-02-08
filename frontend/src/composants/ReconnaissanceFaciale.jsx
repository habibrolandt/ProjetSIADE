"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Alert, ProgressBar } from "react-bootstrap"
import Webcam from "react-webcam"
import api from "../services/api"
import { toast } from "react-toastify"

export default function ReconnaissanceFaciale() {
  const webcamRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [error, setError] = useState(null)

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    return imageSrc
  }, [])

  const handleReconnaissance = useCallback(async () => {
    setLoading(true)
    setResultat(null)
    setError(null)

    try {
      const imageData = captureImage()
      if (!imageData) {
        throw new Error("Impossible de capturer l'image")
      }

      const response = await api.post("/reconnaissance-faciale", {
        image: imageData,
      })

      if (response.data.success) {
        setResultat(response.data)
        toast.success("Présence enregistrée avec succès")
      } else {
        setError("Personne non reconnue. Veuillez réessayer ou contacter un administrateur.")
        toast.warning("Personne non reconnue")
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la reconnaissance:", error.response || error)
      setError("Erreur lors de la reconnaissance faciale. Veuillez réessayer.")
      toast.error("Erreur lors de la reconnaissance faciale")
    } finally {
      setLoading(false)
    }
  }, [captureImage])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        handleReconnaissance()
      }
    }, 5000) // Essayer la reconnaissance toutes les 5 secondes

    return () => clearInterval(interval)
  }, [handleReconnaissance, loading])

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Reconnaissance Faciale</h1>

      <Row>
        <Col md={6}>
          <Card className="mb-4 slide-in">
            <Card.Body>
              <div className="position-relative mb-3" style={{ aspectRatio: "16/9" }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-100 h-100 rounded"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="slide-in">
            <Card.Body>
              <h2 className="h4 mb-3">Résultat</h2>

              {resultat ? (
                <div className="fade-in">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={resultat.photo || "/placeholder.svg"}
                      alt="Photo de l'employé"
                      className="rounded-circle me-3"
                      width="64"
                      height="64"
                    />
                    <div>
                      <h3 className="h5 mb-1">
                        {resultat.prenom} {resultat.nom}
                      </h3>
                      <p className="text-muted mb-0">{resultat.poste}</p>
                    </div>
                  </div>

                  <Alert variant="success">
                    Présence enregistrée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
                  </Alert>

                  {resultat.etatEmploye && (
                    <div className="mt-3">
                      <h4 className="h6">État de l'employé</h4>
                      <div className="mb-2">
                        <label>Fatigue</label>
                        <ProgressBar now={resultat.etatEmploye.fatigue * 100} variant="warning" />
                      </div>
                      <div className="mb-2">
                        <label>Stress</label>
                        <ProgressBar now={resultat.etatEmploye.stress * 100} variant="danger" />
                      </div>
                    </div>
                  )}

                  {resultat.recommandations && resultat.recommandations.length > 0 && (
                    <div className="mt-3">
                      <h4 className="h6">Recommandations</h4>
                      <ul>
                        {resultat.recommandations.map((recommandation, index) => (
                          <li key={index}>{recommandation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted py-5">En attente d'une reconnaissance...</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

