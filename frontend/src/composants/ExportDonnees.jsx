import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ExportDonnees() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [format, setFormat] = useState('excel');
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get(`/export`, {
        params: {
          dateDebut,
          dateFin,
          format
        },
        responseType: 'blob'
      });

      // Créer un URL pour le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Définir le nom du fichier
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `export_presences_${dateDebut}_${dateFin}.${extension}`;
      link.setAttribute('download', fileName);
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error('Erreur d\'export:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Export des Données</h1>

      <div className="max-w-xl bg-white rounded-lg shadow p-6">
        <form onSubmit={handleExport} className="space-y-6">
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
              Date de début
            </label>
            <input
              type="date"
              id="dateDebut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
              Date de fin
            </label>
            <input
              type="date"
              id="dateFin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">
              Format d'export
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Export en cours...' : 'Exporter les données'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
