"use client"

import { useState } from "react"
import { useHistory } from "react-router-dom"
import { Form, Button, Card, Container } from "react-bootstrap"
import { useAuth } from "../contexte/ContexteAuth"
import { toast } from "react-toastify"

export default function Authentification() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [loading, setLoading] = useState(false)
  const { connexion } = useAuth()
  const history = useHistory()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await connexion(email, motDePasse)
      toast.success("Connexion réussie")
      history.push("/")
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4">Connexion</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Adresse email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}

