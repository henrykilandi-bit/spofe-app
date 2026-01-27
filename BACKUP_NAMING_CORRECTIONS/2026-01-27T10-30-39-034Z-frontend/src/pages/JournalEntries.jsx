import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [companyId] = useState(1);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      console.log("📍 JournalEntries: Token present?", !!token);

      if (!token) {
        setError("Aucun token trouvé. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001/api";
      const url = `${API_BASE}/journal-entries?companyId=${companyId}&page=${page}`;
      console.log("📍 JournalEntries: Fetching from", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📍 JournalEntries: Response received", response.status);
      console.log("📍 JournalEntries: response.data structure", {
        success: response.data.success,
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : [],
        entriesCount: response.data.data?.entries?.length || 0,
      });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.entries)
      ) {
        console.log("✅ JournalEntries: Successfully parsed", response.data.data.entries.length, "entries");
        setEntries(response.data.data.entries);
        setPagination(response.data.data.pagination || {});
      } else {
        console.error("❌ JournalEntries: Unexpected response structure", response.data);
        setError("Structure de réponse inattendue.");
      }
    } catch (err) {
      console.error("❌ JournalEntries: Erreur complète:", err);
      console.error("   - Status:", err.response?.status);
      console.error("   - Message:", err.response?.data?.message);
      console.error("   - Error data:", err.response?.data);

      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem("token");
      } else if (err.response?.status === 400) {
        setError(`Erreur requête: ${err.response.data?.message || "Paramètres invalides"}`);
      } else if (err.code === "ECONNABORTED") {
        setError("Délai d'attente dépassé. Vérifiez que le serveur est accessible.");
      } else if (!err.response) {
        setError("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
      } else {
        setError(err.response?.data?.message || "Impossible de charger les écritures.");
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR");
  const formatCurrency = (value) =>
    parseFloat(value || 0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    });

  return (
    <div className="journal-entries-container" style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>✏️ Écritures de Journal</h2>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            fontSize: "1.2rem",
            color: "#666",
          }}
        >
          Chargement des écritures...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            color: "red",
            textAlign: "center",
            background: "#ffe5e5",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ background: "#f5f5f5" }}>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Journal</th>
                <th style={thStyle}>N° Pièce</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Débit</th>
                <th style={thStyle}>Crédit</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={tdStyle}>{formatDate(entry.entryDate)}</td>
                  <td style={tdStyle}>{entry.journalCode}</td>
                  <td style={tdStyle}>{entry.entryNumber}</td>
                  <td style={tdStyle}>{entry.description}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {formatCurrency(entry.totalDebit)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {formatCurrency(entry.totalCredit)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        color:
                          entry.status === "POSTED"
                            ? "#0f5132"
                            : entry.status === "DRAFT"
                            ? "#664d03"
                            : "#842029",
                        background:
                          entry.status === "POSTED"
                            ? "#d1e7dd"
                            : entry.status === "DRAFT"
                            ? "#fff3cd"
                            : "#f8d7da",
                      }}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.total > pagination.limit && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                style={buttonStyle}
              >
                ◀️ Précédent
              </button>
              <span>
                Page {page} / {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setPage((p) =>
                    p < pagination.pages ? p + 1 : pagination.pages
                  )
                }
                disabled={page === pagination.pages}
                style={buttonStyle}
              >
                Suivant ▶️
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
            background: "#fafafa",
            borderRadius: "8px",
          }}
        >
          Aucun enregistrement disponible.
        </div>
      )}
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ddd",
  fontWeight: "bold",
  color: "#333",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  color: "#444",
};

const buttonStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  background: "#1976d2",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default JournalEntries;
