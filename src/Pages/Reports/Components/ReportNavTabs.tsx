import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wrench, BellRing, Users, CalendarCheck, AlertTriangle } from 'lucide-react';

export const ReportNavTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isTools = path === '/dashboard' || (path.includes('/tools') && !path.includes('/activities') && !path.includes('/low-stock'));
  const isPayments = path.includes('/payment-reminders');
  const isWorkforce = path.includes('/workforce-report');
  const isActivities = path.includes('/activities-report');
  const isLowStock = path.includes('/low-stock-report');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px',
        background: '#f1f5f9',
        borderRadius: 12,
        marginBottom: 16,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <button
        onClick={() => navigate('/dashboard')}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: isTools ? '#1e1b4b' : 'transparent',
          color: isTools ? '#ffffff' : '#64748b',
          boxShadow: isTools ? '0 2px 6px rgba(30, 27, 75, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Wrench size={13} />
        <span>Tools</span>
      </button>

      <button
        onClick={() => navigate('/dashboard/payment-reminders')}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: isPayments ? '#1e1b4b' : 'transparent',
          color: isPayments ? '#ffffff' : '#64748b',
          boxShadow: isPayments ? '0 2px 6px rgba(30, 27, 75, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <BellRing size={13} />
        <span>Payments</span>
      </button>

      <button
        onClick={() => navigate('/dashboard/workforce-report')}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: isWorkforce ? '#1e1b4b' : 'transparent',
          color: isWorkforce ? '#ffffff' : '#64748b',
          boxShadow: isWorkforce ? '0 2px 6px rgba(30, 27, 75, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Users size={13} />
        <span>Workforce</span>
      </button>

      <button
        onClick={() => navigate('/dashboard/activities-report')}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: isActivities ? '#1e1b4b' : 'transparent',
          color: isActivities ? '#ffffff' : '#64748b',
          boxShadow: isActivities ? '0 2px 6px rgba(30, 27, 75, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <CalendarCheck size={13} />
        <span>Activities</span>
      </button>

      <button
        onClick={() => navigate('/dashboard/low-stock-report')}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: isLowStock ? '#1e1b4b' : 'transparent',
          color: isLowStock ? '#ffffff' : '#64748b',
          boxShadow: isLowStock ? '0 2px 6px rgba(30, 27, 75, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <AlertTriangle size={13} />
        <span>Low Stock</span>
      </button>
    </div>
  );
};
