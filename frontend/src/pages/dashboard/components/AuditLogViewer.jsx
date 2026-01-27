import React from 'react';
import { Timeline, Card, Empty, Tag, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

/**
 * 📜 Audit Log Viewer
 * Affiche la timeline des approbations avec audit trail
 */
const AuditLogViewer = ({ logs = [] }) => {
  const getActionColor = (action) => {
    const colors = {
      approved: 'green',
      rejected: 'red',
      changes_requested: 'blue',
      submitted: 'orange',
      reassigned: 'cyan'
    };
    return colors[action] || 'default';
  };

  const getActionLabel = (action) => {
    const labels = {
      approved: '✓ Approbation accordée',
      rejected: '✗ Rejetée',
      changes_requested: '✎ Modifications demandées',
      submitted: '→ Soumise',
      reassigned: '↻ Réassignée'
    };
    return labels[action] || action;
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Action', 'Utilisateur', 'Commentaire'],
      ...logs.map((log) => [
        new Date(log.action_date).toLocaleString('fr-FR'),
        getActionLabel(log.action),
        log.actionByUser?.username || 'Système',
        log.comment || '-'
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!logs || logs.length === 0) {
    return <Empty description="Aucun log d'audit" />;
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>📊 Historique des approbations</h3>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Exporter
        </Button>
      </div>

      <Timeline
        items={logs.map((log) => ({
          dot: (
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: getActionColor(log.action),
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 2px #f0f0f0'
              }}
            />
          ),
          children: (
            <div style={{ paddingBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Tag color={getActionColor(log.action)}>
                  {getActionLabel(log.action)}
                </Tag>
                <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>
                  {new Date(log.action_date).toLocaleString('fr-FR')}
                </span>
              </div>
              {log.actionByUser && (
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <strong>Par:</strong> {log.actionByUser.username} ({log.actionByUser.email})
                </div>
              )}
              {log.comment && (
                <div style={{ fontSize: 12, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {log.comment}
                </div>
              )}
            </div>
          )
        }))}
      />
    </Card>
  );
};

export default AuditLogViewer;
