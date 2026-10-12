import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCheck, FileText, AlertCircle, Wallet, Calendar, CheckCircle2 } from 'lucide-react';
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

const API = 'http://localhost:8080/api/v1/notifications';

function typeIcon(type: string, read: boolean) {
  const color = read ? '#94a3b8' : '#10b981';
  switch (type) {
    case 'budget':     return <Wallet size={16} color={color} />;
    case 'meeting':    return <Calendar size={16} color={color} />;
    case 'document':   return <FileText size={16} color={color} />;
    case 'delay':      return <AlertCircle size={16} color={color} />;
    case 'completion': return <CheckCircle2 size={16} color={color} />;
    default:           return <Bell size={16} color={color} />;
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen]     = useState(false);
  const [items, setItems]   = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const userId = (user as any)?.id;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        fetch(`${API}/user/${userId}`),
        fetch(`${API}/user/${userId}/unread-count`),
      ]);
      if (listRes.ok)  setItems(await listRes.json());
      if (countRes.ok) {
        const c = await countRes.json();
        setUnread(c.unread ?? 0);
      }
    } catch (e) {
      console.error('Notification fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = async () => {
    if (!userId) return;
    await fetch(`${API}/user/${userId}/mark-all-read`, { method: 'POST' });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markOneRead = async (id: number) => {
    await fetch(`${API}/${id}/mark-read`, { method: 'POST' });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        title="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '999px',
              fontSize: '10px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            right: 0,
            width: '380px',
            maxHeight: '520px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
            zIndex: 200,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
              position: 'sticky',
              top: 0,
              background: '#ffffff',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Notifications</strong>
              {unread > 0 && (
                <span
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '999px',
                  }}
                >
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <Bell size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <div>No notifications yet</div>
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markOneRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f8fafc',
                  background: n.isRead ? '#ffffff' : '#f0fdf4',
                  display: 'flex',
                  gap: '12px',
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: n.isRead ? '#f1f5f9' : '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(n.notificationType, n.isRead)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: n.isRead ? 500 : 600,
                      color: '#0f172a',
                      marginBottom: '2px',
                    }}
                  >
                    {n.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
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
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}