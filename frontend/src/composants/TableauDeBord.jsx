import { useState, useEffect } from "react"
import { Container, Row, Col, Card } from "react-bootstrap"
import { Line } from "react-chartjs-2"
import api from "../services/api"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function TableauDeBord() {
  const [statistiques, setStatistiques] = useState({
    presencesParJour: [],
    tauxPresence: 0,
    totalEmployes: 0,
    presentsAujourdhui: 0,
  })

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const response = await api.get("/presences/statistiques")
        setStatistiques(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
      }
    }

    fetchStatistiques()
    const interval = setInterval(fetchStatistiques, 300000) // Rafraîchir toutes les 5 minutes

    return () => clearInterval(interval)
  }, [])

  const donnees = {
    labels: statistiques.presencesParJour.map((jour) => jour.date),
    datasets: [
      {
        label: "Nombre de présences",
        data: statistiques.presencesParJour.map((jour) => jour.count),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Présences par jour",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <Container fluid>
      <h1 className="mb-4">Tableau de Bord</h1>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card primary">
            <Card.Body>
              <Card.Title>Taux de Présence</Card.Title>
              <Card.Text className="h2">{statistiques.tauxPresence}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stats-card success">
            <Card.Body>
              <Card.Title>Total Employés</Card.Title>
              <Card.Text className="h2">{statistiques.totalEmployes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stats-card warning">
            <Card.Body>
              <Card.Title>Présents Aujourd'hui</Card.Title>
              <Card.Text className="h2">{statistiques.presentsAujourdhui}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stats-card info">
            <Card.Body>
              <Card.Title>Absents</Card.Title>
              <Card.Text className="h2">{statistiques.totalEmployes - statistiques.presentsAujourdhui}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Line data={donnees} options={options} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

