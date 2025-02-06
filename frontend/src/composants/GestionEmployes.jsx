"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Table, Card, Alert } from "react-bootstrap"
import api from "../services/api"
import { toast } from "react-toastify"

export default function GestionEmployes() {
  const [employes, setEmployes] = useState([])
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    poste: "",
    role: "employe",
    photo: null,
    motDePasse: "",
  })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("creation")
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    chargerEmployes()
  }, [])

  const chargerEmployes = async () => {
    try {
      setLoading(true)
      const response = await api.get("/employes")
      setEmployes(response.data)
      setError(null)
    } catch (error) {
      console.error("Erreur détaillée lors du chargement des employés:", error.response || error)
      setError("Erreur lors du chargement des employés. Veuillez réessayer.")
      toast.error("Erreur lors du chargement des employés")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      console.log("Données envoyées:", Object.fromEntries(formDataToSend))

      let response
      if (mode === "creation") {
        response = await api.post("/employes", formDataToSend)
        toast.success("Employé ajouté avec succès")
      } else {
        response = await api.put(`/employes/${selectedId}`, formDataToSend)
        toast.success("Employé modifié avec succès")
      }

      console.log("Réponse du serveur:", response.data)

      resetForm()
      chargerEmployes()
    } catch (error) {
      console.error("Erreur détaillée lors de l'opération:", error.response || error)
      setError(`Une erreur est survenue. ${error.response?.data?.message || error.message}`)
      toast.error("Erreur lors de l'opération")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employe) => {
    setFormData({
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      poste: employe.poste,
      role: employe.role,
      photo: null,
      motDePasse: "",
    })
    setSelectedId(employe._id)
    setMode("edition")
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      try {
        setLoading(true)
        await api.delete(`/employes/${id}`)
        toast.success("Employé supprimé avec succès")
        chargerEmployes()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        setError("Erreur lors de la suppression. Veuillez réessayer.")
        toast.error("Erreur lors de la suppression")
      } finally {
        setLoading(false)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      poste: "",
      role: "employe",
      photo: null,
      motDePasse: "",
    })
    setMode("creation")
    setSelectedId(null)
  }

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Gestion des Employés</h1>

      <Row>
        <Col md={4}>
          <Card className="mb-4 slide-in">
            <Card.Body>
              <h2 className="h4 mb-3">{mode === "creation" ? "Ajouter un employé" : "Modifier un employé"}</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Poste</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employe">Employé</option>
                    <option value="rh">RH</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Photo</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                    accept="image/*"
                  />
                </Form.Group>

                {mode === "creation" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={formData.motDePasse}
                      onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                      required
                    />
                  </Form.Group>
                )}

                <div className="d-flex justify-content-between">
                  <Button type="submit" variant="primary" disabled={loading} className="btn-animate">
                    {loading ? "Chargement..." : mode === "creation" ? "Ajouter" : "Modifier"}
                  </Button>
                  {mode === "edition" && (
                    <Button variant="secondary" onClick={resetForm} className="btn-animate">
                      Annuler
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="slide-in">
            <Card.Body>
              <h2 className="h4 mb-3">Liste des Employés</h2>
              {loading ? (
                <div className="text-center py-4">
                  <div className="loading-spinner" />
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Poste</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employes.map((employe) => (
                      <tr key={employe._id} className="fade-in">
                        <td>
                          <img
                            src={employe.photo || "/placeholder.svg"}
                            alt={`${employe.prenom} ${employe.nom}`}
                            className="rounded-circle"
                            width="40"
                            height="40"
                          />
                        </td>
                        <td>
                          {employe.prenom} {employe.nom}
                        </td>
                        <td>{employe.email}</td>
                        <td>{employe.poste}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(employe)}
                            className="me-2 btn-animate"
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(employe._id)}
                            className="btn-animate"
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

