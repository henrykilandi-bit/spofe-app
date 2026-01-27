import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyId] = useState(1);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      console.log("📍 ChartOfAccounts: Token present?", !!token);

      if (!token) {
        setError("Aucun token trouvé. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001/api";
      const url = `${API_BASE}/chart-of-accounts?companyId=${companyId}`;
      console.log("📍 ChartOfAccounts: Fetching from", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📍 ChartOfAccounts: Response received", response.status);
      console.log("📍 ChartOfAccounts: response.data structure", {
        success: response.data.success,
        hasData: !!response.data.data,
        dataIsArray: Array.isArray(response.data.data),
        accountsCount: Array.isArray(response.data.data) ? response.data.data.length : 0,
      });

      if (Array.isArray(response.data.data)) {
        console.log("✅ ChartOfAccounts: Successfully parsed", response.data.data.length, "accounts");
        setAccounts(response.data.data);
      } else {
        console.error("❌ ChartOfAccounts: Unexpected response structure", response.data);
        setError("Structure de réponse inattendue.");
      }
    } catch (err) {
      console.error("❌ ChartOfAccounts: Erreur complète:", err);
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
        setError(err.response?.data?.message || "Impossible de charger le plan comptable.");
      }
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const getTypeLabel = (type) => {
    switch (type) {
      case "ASSET":
      case "ASSETS":
        return "Actif";
      case "LIABILITY":
      case "LIABILITIES":
        return "Passif";
      case "EQUITY":
        return "Capitaux Propres";
      case "REVENUE":
      case "INCOME":
        return "Produits";
      case "EXPENSE":
      case "EXPENSES":
        return "Charges";
      default:
        return "Autres";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ASSET":
      case "ASSETS":
        return "#0d6efd";
      case "LIABILITY":
      case "LIABILITIES":
        return "#6f42c1";
      case "EQUITY":
        return "#198754";
      case "REVENUE":
      case "INCOME":
        return "#20c997";
      case "EXPENSE":
      case "EXPENSES":
        return "#dc3545";
      default:
        return "#adb5bd";
    }
  };

  return (
    <div className="chart-of-accounts" style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>📋 Plan Comptable OHADA</h2>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            fontSize: "1.2rem",
            color: "#666",
          }}
        >
          Chargement du plan comptable...
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

      {!loading && !error && accounts.length > 0 && (
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
                <th style={thStyle}>N° Compte</th>
                <th style={thStyle}>Intitulé</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id || acc.accountNumber}>
                  <td style={tdStyle}>{acc.accountNumber}</td>
                  <td style={tdStyle}>{acc.accountName}</td>
                  <td style={{ ...tdStyle, color: getTypeColor(acc.accountType) }}>
                    {getTypeLabel(acc.accountType)}
                  </td>
                  <td style={tdStyle}>
                    {acc.accountCategory || acc.category || "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        backgroundColor: acc.isActive ? "#d1e7dd" : "#f8d7da",
                        color: acc.isActive ? "#0f5132" : "#842029",
                      }}
                    >
                      {acc.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
            background: "#fafafa",
            borderRadius: "8px",
          }}
        >
          Aucun compte disponible.
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

export default ChartOfAccounts;
