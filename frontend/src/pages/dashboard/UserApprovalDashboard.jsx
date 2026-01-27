import React, { useEffect, useState } from 'react';
import { Tabs, Card, Table, Button, Statistic, Modal, Form, Input, message, Spin, Empty, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  LoadingOutlined,
  SearchOutlined
} from '@ant-design/icons';
import useSuperUser from '../../hooks/useSuperUser';
import ApprovalStats from './components/ApprovalStats';
import PendingApprovalsTable from './components/PendingApprovalsTable';
import AuditLogViewer from './components/AuditLogViewer';
import UserDetailModal from './components/UserDetailModal';
import '../../styles/admin-dashboard.css';

/**
 * 🎯 Super User Approval Dashboard
 * Orchestrateur principal pour le workflow d'approbation
 */
const UserApprovalDashboard = () => {
  const {
    getApprovalStats,
    getPendingApprovals,
    approveApproval,
    rejectApproval,
    requestChanges,
    getAuditLogs,
    getStatusBreakdown,
    loading
  } = useSuperUser();

  const [stats, setStats] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ visible: false, record: null });
  const [changesModal, setChangesModal] = useState({ visible: false, record: null });
  const [form] = Form.useForm();

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [stats, approvals, logs, breakdown] = await Promise.all([
        getApprovalStats(),
        getPendingApprovals({ status: 'pending' }),
        getAuditLogs(),
        getStatusBreakdown()
      ]);

      setStats(stats);
      setApprovals(approvals?.approvals || []);
      setAuditLogs(logs?.logs || []);
      setBreakdown(breakdown || []);
    } catch (error) {
      message.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await approveApproval(approvalId, { notes: 'Approbation accordée' });
      message.success('Approbation accordée');
      loadDashboardData();
    } catch (error) {
      message.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (values) => {
    try {
      await rejectApproval(rejectModal.record.id, { reason: values.reason });
      message.success('Demande rejetée');
      setRejectModal({ visible: false, record: null });
      form.resetFields();
      loadDashboardData();
    } catch (error) {
      message.error('Erreur lors du rejet');
    }
  };

  const handleRequestChanges = async (values) => {
    try {
      await requestChanges(changesModal.record.id, { changes: values.changes });
      message.success('Modifications demandées');
      setChangesModal({ visible: false, record: null });
      form.resetFields();
      loadDashboardData();
    } catch (error) {
      message.error('Erreur lors de la demande de modifications');
    }
  };

  if (isLoading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  const tabsItems = [
    {
      key: '1',
      label: (
        <span>
          <CheckCircleOutlined /> Tableau de bord
        </span>
      ),
      children: (
        <>
          <ApprovalStats stats={stats} breakdown={breakdown} />
          <Card style={{ marginTop: 24, borderRadius: 8 }}>
            <h3>📊 État du workflow</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {breakdown.map((item) => (
                <div key={item.status} style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{item.status.toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{item.count}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{item.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <ClockCircleOutlined /> Approbations en attente ({approvals.length})
        </span>
      ),
      children: approvals.length > 0 ? (
        <PendingApprovalsTable
          data={approvals}
          onApprove={handleApprove}
          onReject={(record) => setRejectModal({ visible: true, record })}
          onRequestChanges={(record) => setChangesModal({ visible: true, record })}
          loading={loading}
        />
      ) : (
        <Empty description="Aucune approbation en attente" />
      )
    },
    {
      key: '3',
      label: (
        <span>
          <FileTextOutlined /> Logs d'audit
        </span>
      ),
      children: <AuditLogViewer logs={auditLogs} />
    }
  ];

  return (
    <div className="dashboard-container" style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>🎯 Tableau de bord d'approbation</h1>
        <p style={{ color: '#666' }}>Gestion des demandes d'approbation utilisateur</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabsItems}
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }}
      />

      {/* Modal de rejet */}
      <Modal
        title="Rejeter la demande"
        open={rejectModal.visible}
        onCancel={() => setRejectModal({ visible: false, record: null })}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleReject} layout="vertical">
          <Form.Item
            name="reason"
            label="Raison du rejet"
            rules={[{ required: true, message: 'Veuillez entrer une raison' }]}
          >
            <Input.TextArea rows={4} placeholder="Explicitez la raison du rejet..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de modifications */}
      <Modal
        title="Demander des modifications"
        open={changesModal.visible}
        onCancel={() => setChangesModal({ visible: false, record: null })}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleRequestChanges} layout="vertical">
          <Form.Item
            name="changes"
            label="Modifications demandées"
            rules={[{ required: true, message: 'Veuillez entrer les modifications' }]}
          >
            <Input.TextArea rows={4} placeholder="Décrivez les modifications demandées..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserApprovalDashboard;
