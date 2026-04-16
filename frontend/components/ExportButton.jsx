import { useState } from 'react';
import { Download, Loader } from 'lucide-react';

export default function ExportButton({ className = '' }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/api/reports/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlaceOPrep-Report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not generate report. Make sure pdfkit is installed on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className={`flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors text-sm ${className}`}
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      <span>{loading ? 'Generating...' : 'Export PDF'}</span>
    </button>
  );
}
