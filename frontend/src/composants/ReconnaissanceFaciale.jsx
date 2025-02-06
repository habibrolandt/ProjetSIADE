"use client"

import { useRef, useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap"
import api from "../services/api"
import { toast } from "react-toastify"

export default function ReconnaissanceFaciale() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [cameras, setCameras] = useState([])
  const [cameraActive, setCameraActive] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Votre navigateur ne supporte pas l'accès à la caméra. Veuillez utiliser un navigateur moderne.")
      return
    }
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setCameras(videoDevices)
        if (videoDevices.length > 0) {
          setCameraActive(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des caméras:", error)
        setError("Impossible d'accéder aux caméras. Veuillez vérifier les permissions.")
        toast.error("Impossible d'accéder aux caméras")
      }
    }

    getCameras()
  }, [])

  useEffect(() => {
    if (cameraActive) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraActive, stream]) // Added stream to dependencies

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: cameraActive ? { exact: cameraActive } : undefined,
        },
      })

      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
      setError(null)
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error)
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setError(
          "L'accès à la caméra a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.",
        )
      } else {
        setError("Impossible d'accéder à la caméra. Veuillez vérifier votre connexion et réessayer.")
      }
      toast.error("Impossible d'accéder à la caméra")
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const context = canvasRef.current.getContext("2d")
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    return canvasRef.current.toDataURL("image/jpeg")
  }

  const handleReconnaissance = async () => {
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
  }

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Reconnaissance Faciale</h1>

      <Row>
        <Col md={6}>
          <Card className="mb-4 slide-in">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Sélectionner une caméra</Form.Label>
                <Form.Select value={cameraActive} onChange={(e) => setCameraActive(e.target.value)}>
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Caméra ${camera.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="position-relative mb-3" style={{ aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100 rounded"
                  style={{ objectFit: "cover" }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>

              <Button onClick={handleReconnaissance} disabled={loading} className="w-100 btn-animate" variant="primary">
                {loading ? "Reconnaissance en cours..." : "Lancer la reconnaissance"}
              </Button>

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

