import React from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, TrendingUp, 
  AlertTriangle, Zap
} from 'lucide-react';

/**
 * Composant de statistiques d'approbation
 */
const ApprovalStats = ({ stats, loading }) => {
  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} color={color} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{loading ? '...' : value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={14} />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="stats-grid">
      <StatCard
        title="En attente"
        value={stats.pending}
        icon={Clock}
        color="#F59E0B"
        subtitle={`+${stats.pending24h || 0} dernières 24h`}
      />
      
      <StatCard
        title="Approuvés"
        value={stats.approved}
        icon={CheckCircle}
        color="#10B981"
        trend={stats.approvalTrend}
      />
      
      <StatCard
        title="Rejetés"
        value={stats.rejected}
        icon={XCircle}
        color="#EF4444"
        subtitle={`${stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%`}
      />
      
      <StatCard
        title="Taux approbation"
        value={`${stats.approvalRate || 0}%`}
        icon={TrendingUp}
        color="#3B82F6"
        subtitle="Moyenne groupe: 92%"
      />
      
      <StatCard
        title="Temps réponse moyen"
        value={stats.avgResponseTime || '0h 0m'}
        icon={Zap}
        color="#8B5CF6"
        subtitle="Objectif: < 24h"
      />
      
      <StatCard
        title="Total inscriptions"
        value={stats.total}
        icon={Users}
        color="#6366F1"
        subtitle="30 derniers jours"
      />
    </div>
  );
};

export default ApprovalStats;
