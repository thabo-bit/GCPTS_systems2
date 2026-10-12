import React, { useEffect, useState } from 'react';
import {
  Bell, CheckCheck, FileText, AlertCircle, Wallet, Calendar, CheckCircle2,
  X, MapPin, Users, TrendingUp, DollarSign, Building2,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Notif {
  id: number;
  userId: number;
  projectId?: number | null;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Project {
  id: number;
  referenceNumber?: string;
  title?: string;
  category?: string;
  department?: string;
  description?: string;
  location?: string;
  projectManager?: string;
  contractor?: string;
  startDate?: string;
  expectedCompletion?: string;
  overallProgress?: number;
  status?: string;
  budgetAllocated?: number;
  budgetUsed?: number;
}

const API = 'http://localhost:8080/api/v1/notifications';
const PROJECTS_API = 'http://localhost:8080/api/projects';

function typeIcon(type: string, read: boolean, size = 18) {
  const color = read ? '#94a3b8' : '#10b981';
  switch (type) {
    case 'budget':     return <Wallet size={size} color={color} />;
    case 'meeting':    return <Calendar size={size} color={color} />;
    case 'document':   return <FileText size={size} color={color} />;
    case 'delay':      return <AlertCircle size={size} color={color} />;
    case 'completion': return <CheckCircle2 size={size} color={color} />;
    default:           return <Bell size={size} color={color} />;
  }
}

function formatRand(n?: number | null) {
  if (n == null) return '—';
  return 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NotificationsModule() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selected, setSelected] = useState<Notif | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const userId = (user as any)?.id;

  // ─── Load notifications ───
  const load = async () => {
    if (!userId) return;
    const url = filter === 'unread'
      ? `${API}/user/${userId}/unread`
      : `${API}/user/${userId}`;
    const res = await fetch(url);
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, filter]);

  // ─── Load project when a notification is opened ───
  useEffect(() => {
    if (!selected) { setProject(null); setProjectError(null); return; }

    if (!selected.projectId) {
      setProject(null);
      setProjectError(null);
      return;
    }

    let cancelled = false;
    setLoadingProject(true);
    setProjectError(null);

    fetch(`${PROJECTS_API}/${selected.projectId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`Failed to load project (#${selected.projectId})`);
        const data = await res.json();
        setProject(data);
      })
      .catch((err) => {
        if (!cancelled) setProjectError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingProject(false);
      });

    return () => { cancelled = true; };
  }, [selected]);

  // ─── Click handler: mark read + open modal ───
  const openNotification = async (n: Notif) => {
    setSelected(n);

    if (!n.isRead) {
      try {
        await fetch(`${API}/${n.id}/mark-read`, { method: 'POST' });
        // Update local state so the dot disappears immediately
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      } catch (e) {
        console.error('Failed to mark notification as read', e);
      }
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    await fetch(`${API}/user/${userId}/mark-all-read`, { method: 'POST' });
    load();
  };

  const closeModal = () => {
    setSelected(null);
    setProject(null);
    setProjectError(null);
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <>
      <div>
        {/* ─── Header ─── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Notifications
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'} · {items.length} total
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: filter === 'all' ? '#10b981' : '#ffffff',
                color: filter === 'all' ? '#ffffff' : '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: filter === 'unread' ? '#10b981' : '#ffffff',
                color: filter === 'unread' ? '#ffffff' : '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Unread
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#10b981',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ─── List ─── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {items.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Bell size={32} style={{ opacity: 0.4, marginBottom: '10px' }} />
              <div style={{ fontSize: '14px' }}>No notifications to show</div>
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                onClick={() => openNotification(n)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  background: n.isRead ? '#ffffff' : '#f0fdf4',
                  display: 'flex',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = n.isRead ? '#f8fafc' : '#dcfce7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? '#ffffff' : '#f0fdf4'; }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: n.isRead ? '#f1f5f9' : '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(n.notificationType, n.isRead)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: n.isRead ? 500 : 700,
                      color: '#0f172a',
                      marginBottom: '4px',
                    }}
                  >
                    {n.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '8px' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {!n.isRead && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      marginTop: '10px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL — notification + project details
      ═══════════════════════════════════════════════ */}
      {selected && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(selected.notificationType, false, 20)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {selected.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Message */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Message
                </div>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.55 }}>
                  {selected.message}
                </div>
              </div>

              {/* Project details */}
              {selected.projectId ? (
                loadingProject ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Loading project details…
                  </div>
                ) : projectError ? (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '13px',
                    }}
                  >
                    {projectError}
                  </div>
                ) : project ? (
                  <>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '10px',
                      }}
                    >
                      Related Project
                    </div>

                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                          marginBottom: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                            {project.title || 'Untitled project'}
                          </div>
                          {project.referenceNumber && (
                            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                              {project.referenceNumber}
                            </div>
                          )}
                        </div>
                        {project.status && (
                          <span
                            style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '999px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.status}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px 16px',
                          fontSize: '13px',
                        }}
                      >
                        {project.department && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                            <Building2 size={15} color="#94a3b8" />
                            <span>{project.department}</span>
                          </div>
                        )}
                        {project.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                            <MapPin size={15} color="#94a3b8" />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.projectManager && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                            <Users size={15} color="#94a3b8" />
                            <span>{project.projectManager}</span>
                          </div>
                        )}
                        {project.contractor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                            <Building2 size={15} color="#94a3b8" />
                            <span>{project.contractor}</span>
                          </div>
                        )}
                      </div>

                      {project.overallProgress != null && (
                        <div style={{ marginTop: '16px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              color: '#64748b',
                              marginBottom: '6px',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <TrendingUp size={14} /> Progress
                            </span>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>
                              {project.overallProgress}%
                            </span>
                          </div>
                          <div
                            style={{
                              background: '#f1f5f9',
                              borderRadius: '999px',
                              height: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, project.overallProgress))}%`,
                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                height: '100%',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {(project.budgetAllocated != null || project.budgetUsed != null) && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginTop: '16px',
                          }}
                        >
                          <div
                            style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '10px',
                              padding: '10px 12px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#166534',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '4px',
                              }}
                            >
                              Allocated
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#065f46' }}>
                              {formatRand(project.budgetAllocated)}
                            </div>
                          </div>

                          <div
                            style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              borderRadius: '10px',
                              padding: '10px 12px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#9a3412',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '4px',
                              }}
                            >
                              Spent
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c2d12' }}>
                              {formatRand(project.budgetUsed)}
                            </div>
                          </div>
                        </div>
                      )}

                      {project.description && (
                        <div
                          style={{
                            fontSize: '12.5px',
                            color: '#475569',
                            marginTop: '16px',
                            lineHeight: 1.55,
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '14px',
                          }}
                        >
                          {project.description}
                        </div>
                      )}
                    </div>

                    {/* Link to full project page */}
                    <button
                      onClick={() => {
                        closeModal();
                        window.location.href = `/project/${project.id}`;
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <FileText size={15} /> View Full Project
                    </button>
                  </>
                ) : null
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '13px',
                  }}
                >
                  This is a general system notification — no project is linked.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}