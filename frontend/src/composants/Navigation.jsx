import { Link, useHistory } from "react-router-dom"
import { Nav, Navbar, Container, Button } from "react-bootstrap"
import { useAuth } from "../contexte/ContexteAuth"

export default function Navigation() {
  const { utilisateur, deconnexion } = useAuth()
  const history = useHistory()

  const handleDeconnexion = () => {
    deconnexion()
    history.push("/login")
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Gestion Présences
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Tableau de Bord
            </Nav.Link>
            {utilisateur && (utilisateur.role === "admin" || utilisateur.role === "rh") && (
              <>
                <Nav.Link as={Link} to="/employes">
                  Gestion Employés
                </Nav.Link>
                <Nav.Link as={Link} to="/export">
                  Export
                </Nav.Link>
              </>
            )}
            <Nav.Link as={Link} to="/reconnaissance">
              Reconnaissance
            </Nav.Link>
            <Nav.Link as={Link} to="/historique">
              Historique
            </Nav.Link>
          </Nav>
          {utilisateur ? (
            <Button variant="outline-light" onClick={handleDeconnexion}>
              Déconnexion
            </Button>
          ) : (
            <Nav.Link as={Link} to="/login" className="btn btn-outline-light">
              Connexion
            </Nav.Link>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

