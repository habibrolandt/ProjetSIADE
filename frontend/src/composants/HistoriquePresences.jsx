"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Table, Card, Alert, Pagination } from "react-bootstrap"
import api from "../services/api"
import { toast } from "react-toastify"

export default function HistoriquePresences() {
  const [presences, setPresences] = useState([])
  const [filtres, setFiltres] = useState({
    dateDebut: "",
    dateFin: "",
    employe: "",
  })
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  useEffect(() => {
    chargerEmployes()
  }, [])

  useEffect(() => {
    chargerPresences()
  }, [filtres, page])

  const chargerEmployes = async () => {
    try {
      const response = await api.get("/employes")
      setEmployes(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error)
      toast.error("Erreur lors du chargement des employés")
    }
  }

  const chargerPresences = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/presences", {
        params: {
          ...filtres,
          page,
          limite: 10,
        },
      })
      setPresences(response.data.presences)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Erreur détaillée lors du chargement des présences:", error.response || error)
      setError("Erreur lors du chargement des présences. Veuillez réessayer.")
      toast.error("Erreur lors du chargement des présences")
    } finally {
      setLoading(false)
    }
  }

  const handleFiltreChange = (e) => {
    const { name, value } = e.target
    setFiltres((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPage(1)
  }

  const resetFiltres = () => {
    setFiltres({
      dateDebut: "",
      dateFin: "",
      employe: "",
    })
    setPage(1)
  }

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Historique des Présences</h1>

      <Card className="mb-4 slide-in">
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de début</Form.Label>
                  <Form.Control type="date" name="dateDebut" value={filtres.dateDebut} onChange={handleFiltreChange} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de fin</Form.Label>
                  <Form.Control type="date" name="dateFin" value={filtres.dateFin} onChange={handleFiltreChange} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Employé</Form.Label>
                  <Form.Select name="employe" value={filtres.employe} onChange={handleFiltreChange}>
                    <option value="">Tous les employés</option>
                    {employes.map((employe) => (
                      <option key={employe._id} value={employe._id}>
                        {employe.prenom} {employe.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="secondary" onClick={resetFiltres} className="w-100 btn-animate">
                  Réinitialiser les filtres
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="slide-in">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center py-4">
              <div className="loading-spinner" />
            </div>
          ) : presences.length === 0 ? (
            <Alert variant="info">Aucune présence trouvée</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Méthode</th>
                </tr>
              </thead>
              <tbody>
                {presences.map((presence) => (
                  <tr key={presence._id} className="fade-in">
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={presence.employe.photo || "/placeholder.svg"}
                          alt=""
                          className="rounded-circle me-2"
                          width="32"
                          height="32"
                        />
                        <div>
                          <div>
                            {presence.employe.prenom} {presence.employe.nom}
                          </div>
                          <small className="text-muted">{presence.employe.poste}</small>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(presence.date).toLocaleDateString()}</td>
                    <td>{new Date(presence.date).toLocaleTimeString()}</td>
                    <td>
                      <span className={`badge ${presence.type === "entree" ? "bg-success" : "bg-danger"}`}>
                        {presence.type === "entree" ? "Entrée" : "Sortie"}
                      </span>
                    </td>
                    <td>{presence.methode === "reconnaissance_faciale" ? "Reconnaissance faciale" : "Manuel"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
              <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
            </Pagination>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

