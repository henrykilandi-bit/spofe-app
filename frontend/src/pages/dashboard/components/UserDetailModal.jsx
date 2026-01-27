import React from 'react';
import { Modal, Tabs, Descriptions, Timeline, Button, Space } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

/**
 * 👤 User Detail Modal
 * Affiche les détails d'un utilisateur en attente d'approbation
 */
const UserDetailModal = ({ visible, onCancel, user = {} }) => {
  if (!user?.id) return null;

  const tabsItems = [
    {
      key: '1',
      label: 'Profil',
      children: (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Prénom">{user.prenom}</Descriptions.Item>
          <Descriptions.Item label="Nom">{user.nom}</Descriptions.Item>
          <Descriptions.Item label="Utilisateur">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Date de création">
            {new Date(user.created_at).toLocaleDateString('fr-FR')}
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      key: '2',
      label: 'Validation',
      children: (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Statut">{user.status}</Descriptions.Item>
          <Descriptions.Item label="Notes">{user.validation_notes || '-'}</Descriptions.Item>
          <Descriptions.Item label="Approuvé par">
            {user.approved_by ? `User ID: ${user.approved_by}` : 'Pas encore approuvé'}
          </Descriptions.Item>
          <Descriptions.Item label="Date d'approbation">
            {user.validation_date ? new Date(user.validation_date).toLocaleString('fr-FR') : '-'}
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      key: '3',
      label: 'Audit',
      children: <div>Historique des actions à afficher ici</div>
    },
    {
      key: '4',
      label: 'Actions',
      children: (
        <Space>
          <Button type="primary" icon={<DownloadOutlined />}>
            Télécharger les détails
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Modal
      title={`Détails - ${user.email}`}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="close" onClick={onCancel}>
          Fermer
        </Button>
      ]}
    >
      <Tabs items={tabsItems} />
    </Modal>
  );
};

export default UserDetailModal;
