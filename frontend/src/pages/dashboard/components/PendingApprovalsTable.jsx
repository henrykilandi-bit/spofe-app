import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Popconfirm, message } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';

/**
 * 📋 Pending Approvals Table
 * Tableau interactif des approbations en attente
 */
const PendingApprovalsTable = ({ data = [], onApprove, onReject, onRequestChanges, loading }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      changes_requested: 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      changes_requested: 'Modifications'
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (text) => <span>{text}</span>,
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      width: 120,
      render: (text, record) => `${record.prenom || ''} ${text || ''}`.trim()
    },
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
      filters: [
        { text: 'En attente', value: 'pending' },
        { text: 'Approuvée', value: 'approved' },
        { text: 'Rejetée', value: 'rejected' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Créée le',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approuver">
                <Popconfirm
                  title="Approuver"
                  description="Êtes-vous sûr de vouloir approuver cette demande?"
                  onConfirm={() => onApprove(record.id)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Popconfirm>
              </Tooltip>

              <Tooltip title="Rejeter">
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => onReject(record)}
                />
              </Tooltip>

              <Tooltip title="Modifications">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onRequestChanges(record)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Détails">
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data.map((item) => ({ ...item, key: item.id }))}
      loading={loading}
      pagination={{
        pageSize: 10,
        total: data.length,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} demandes`
      }}
      rowSelection={{
        selectedRowKeys: selectedRows,
        onChange: setSelectedRows
      }}
      bordered
      hover
      size="middle"
      style={{ marginTop: 16 }}
    />
  );
};

export default PendingApprovalsTable;
