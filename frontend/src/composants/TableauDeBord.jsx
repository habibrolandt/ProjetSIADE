"use client"

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
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const StatCard = ({ title, value, color, loading }) => (
  <Card className={`stats-card ${color} fade-in`}>
    <Card.Body>
      <Card.Title className="text-muted h6">{title}</Card.Title>
      {loading ? <div className="loading-spinner" /> : <Card.Text className="h2">{value}</Card.Text>}
    </Card.Body>
  </Card>
)

export default function TableauDeBord() {
  const [statistiques, setStatistiques] = useState({
    presencesParJour: [],
    tauxPresence: 0,
    totalEmployes: 0,
    presentsAujourdhui: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const response = await api.get("/presences/statistiques")
        setStatistiques(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistiques()
    const interval = setInterval(fetchStatistiques, 300000)
    return () => clearInterval(interval)
  }, [])

  const donnees = {
    labels: statistiques.presencesParJour.map((jour) => jour.date),
    datasets: [
      {
        label: "Nombre de présences",
        data: statistiques.presencesParJour.map((jour) => jour.count),
        fill: true,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Évolution des présences",
        font: {
          size: 16,
          weight: "bold",
        },
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
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  }

  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Tableau de Bord</h1>

      <Row className="mb-4">
        <Col md={3}>
          <StatCard
            title="Taux de Présence"
            value={`${statistiques.tauxPresence}%`}
            color="primary"
            loading={loading}
          />
        </Col>
        <Col md={3}>
          <StatCard title="Total Employés" value={statistiques.totalEmployes} color="success" loading={loading} />
        </Col>
        <Col md={3}>
          <StatCard
            title="Présents Aujourd'hui"
            value={statistiques.presentsAujourdhui}
            color="warning"
            loading={loading}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Absents"
            value={statistiques.totalEmployes - statistiques.presentsAujourdhui}
            color="info"
            loading={loading}
          />
        </Col>
      </Row>

      <Card className="chart-container">
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <div style={{ height: "400px" }}>
              <Line data={donnees} options={options} />
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

