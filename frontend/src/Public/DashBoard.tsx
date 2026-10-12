// src/Components/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  HardHat,
  Users,
  AlertCircle,
  FileText,
  BarChart3,
  Map,
  Files,
  Calendar,
  ScrollText,
  Search,
  ChevronLeft,
  ArrowLeft,
  Bell,
  FilePlus,
  Home,
  LogOut,
} from 'lucide-react';
import coatOfArms from '../assets/coat_of_arms_of_south_africa_1.png';
import UpcomingProjects from '../Components/UpcomingProjects';
import DashboardHome from '../Components/DashboardHome';
import ContractorsModule from '../Components/ContractorsModule';
import AuditLogsModule from '../Components/AuditLogs';
import BudgetTracking from '../Components/BudgetTracking';
import ProjectCalendar from '../Components/projectcalenderguide';
import ReportsModule from '../Components/ReportsModule';
import CommunityModule from '../Components/CommunityModule';
import IssuesModule from '../Components/IssuesModule';
import NotificationBell from '../Components/NotificationBell';
import NotificationsModule from '../Components/NotificationsModule';
import CreateUpcomingProject from '../Components/CreateUpcomingProject';

// 👇 Import the public Projects page
import ProjectsPage from '../Components/ProjectsPage';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard',         icon: LayoutDashboard },
    { name: 'Projects',          icon: FileText },
    { name: 'Upcoming Project',  icon: FolderKanban },
    { name: 'Create Proposal',   icon: FilePlus },
    { name: 'Budgets',           icon: Wallet },
    { name: 'Contractors',       icon: HardHat },
    { name: 'Issues',            icon: AlertCircle },
    { name: 'Reports',           icon: BarChart3 },
    { name: 'Calendar',          icon: Calendar },
    { name: 'Notifications',     icon: Bell },
  ];

  // ─── Home: go back to the site landing page ───
  const handleGoHome = () => {
    navigate('/');
  };

  // ─── Logout: clear auth + redirect to login ───
  const handleLogout = () => {
    // Clear anything auth-related you store client-side
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // If your AuthContext exposes a logout(), call it here too:
    // logout();

    navigate('/login');
  };

  const renderActiveModule = () => {
    switch (activeNav) {
      case 'Dashboard':
        return <DashboardHome />;

      case 'Projects':
        return <ProjectsPage />;

      case 'Upcoming Project':
        return <UpcomingProjects />;

      case 'Create Proposal':
        return (
          <CreateUpcomingProject
            onSuccess={() => setActiveNav('Upcoming Project')}
            onCancel={() => setActiveNav('Upcoming Project')}
          />
        );

      case 'Budgets':
        return <BudgetTracking />;
      case 'Contractors':
        return <ContractorsModule />;
      case 'Audit Logs':
        return <AuditLogsModule />;
      case 'Community':
        return <CommunityModule />;
      case 'Issues':
        return <IssuesModule />;
      case 'Reports':
        return <ReportsModule />;
      case 'Calendar':
        return <ProjectCalendar />;
      case 'Notifications':
        return <NotificationsModule />;

      default:
        return (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              {activeNav} Module
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Management and tracking interface for {activeNav.toLowerCase()}.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#070e1b',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              padding: '20px 20px 16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#131d35',
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              <img
                src={coatOfArms}
                alt="Coat of Arms of South Africa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '4px',
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                }}
              >
                GCPTS
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Enterprise
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 220px)',
            }}
          >
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#131d35' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '6px',
                        bottom: '6px',
                        width: '3px',
                        backgroundColor: '#10b981',
                        borderTopRightRadius: '3px',
                        borderBottomRightRadius: '3px',
                      }}
                    />
                  )}
                  <IconComponent
                    size={18}
                    style={{ color: isActive ? '#10b981' : '#64748b' }}
                  />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom action block: Home + Logout + collapse ─── */}
        <div style={{ padding: '12px', borderTop: '1px solid #16223b' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            {/* Home button */}
            <button
              onClick={handleGoHome}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #16223b',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.color = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#16223b';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <Home size={14} />
              Home
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #16223b',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#16223b';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '360px',
              gap: '8px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search projects, contractors, reports... (press /)"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#0f172a',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setActiveNav('Dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
          </div>

          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}