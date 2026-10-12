// src/Components/CreateUpcomingProject.tsx
import React, { useState } from 'react';
import {
  Save, X, ArrowLeft,
  Landmark,
  FileText, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

interface CreateUpcomingProjectProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── DEMO / AUTO-GENERATED HELPERS ──────────────────────────────────

// Random integer between min and max (inclusive)
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Pick a random element from an array
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Auto-generate a government reference number like: NCG-COGHSTA-2026-089
const generateGovRef = (): string => {
  const year = new Date().getFullYear();
  const seq = String(randInt(100, 999));
  return `NCG-COGHSTA-${year}-${seq}`;
};

// Demo allocating ministries
const ALLOCATING_MINISTRIES = [
  'MEC for Cooperative Governance',
  'MEC for Public Works & Infrastructure',
  'MEC for Human Settlements',
  'MEC for Transport, Safety & Liaison',
  'MEC for Finance, Economic Development & Tourism',
];

// Demo durations
const DURATIONS = ['3 Months', '6 Months', '8 Months', '12 Months', '18 Months', '24 Months'];

// Demo community impact priorities
const COMMUNITY_IMPACTS = ['High Priority', 'Medium Priority', 'Low Priority'];

// Auto-generate a scheduled start date (30–180 days from today)
const generateScheduledStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + randInt(30, 180));
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Auto-generate an estimated budget (R 500k – R 15M, rounded to nearest 10k)
const generateEstimatedBudget = (): number => {
  const raw = randInt(500_000, 15_000_000);
  return Math.round(raw / 10_000) * 10_000;
};

// ────────────────────────────────────────────────────────────────────

export default function CreateUpcomingProject({ onSuccess, onCancel }: CreateUpcomingProjectProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Government Project', // locked
    department: '',
    ward: '',
    location: '',
    description: '',
    status: 'Waiting for Approval', // locked
    issuer: '',
    tags: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      const payload = {
        title: formData.title,
        category: 'Government Project',
        department: formData.department,
        ward: formData.ward,
        location: formData.location,
        description: formData.description,
        issuer: formData.issuer,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),

        // 🤖 Auto-generated — never shown to the user
        duration: pick(DURATIONS),
        scheduledStart: generateScheduledStart(),
        estimatedBudget: generateEstimatedBudget(),
        communityImpact: pick(COMMUNITY_IMPACTS),
        tenderStatus: 'Pending Municipal Council Approval',
        status: 'Waiting for Approval',
        govRef: generateGovRef(),
        allocatingMinistry: pick(ALLOCATING_MINISTRIES),
      };

      data.append(
        'project',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );

      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      }

      await axios.post(`${API_URL}/api/upcoming-projects`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setToast('Upcoming project created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('Create upcoming project error:', err);
      setToast('Failed to create project. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .cup-container { max-width: 960px; margin: 0 auto; font-family: 'Inter', system-ui, -apple-system, sans-serif; }

        .cup-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 20px; margin-bottom: 24px; flex-wrap: wrap;
        }
        .cup-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f1f5f9; border: none; color: #64748b;
          padding: 8px 14px; border-radius: 8px; font-size: 13px;
          font-weight: 500; cursor: pointer; margin-bottom: 12px;
          font-family: inherit;
        }
        .cup-back-btn:hover { background: #e2e8f0; color: #0f172a; }

        .cup-title {
          font-size: 22px; font-weight: 700; color: #0f172a;
          margin: 0 0 6px; letter-spacing: -0.02em;
        }
        .cup-subtitle { font-size: 14px; color: #64748b; margin: 0; }

        .cup-actions { display: flex; gap: 10px; }
        .cup-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          border: 1px solid transparent; font-family: inherit;
          transition: all 0.2s ease;
        }
        .cup-btn.cancel {
          background: #fff; color: #475569; border-color: #e2e8f0;
        }
        .cup-btn.cancel:hover { background: #f8fafc; }
        .cup-btn.save {
          background: #10b981; color: #fff;
          box-shadow: 0 4px 12px -4px rgba(16,185,129,0.4);
        }
        .cup-btn.save:hover { background: #059669; transform: translateY(-1px); }
        .cup-btn.save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .cup-card {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 24px; margin-bottom: 18px;
        }
        .cup-card-header {
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cup-card-title {
          font-size: 15px; font-weight: 700; color: #0f172a;
          margin: 0 0 4px;
          display: flex; align-items: center; gap: 8px;
        }
        .cup-card-sub { font-size: 12.5px; color: #94a3b8; margin: 0; }

        .cup-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .cup-grid-full { grid-column: 1 / -1; }

        .cup-field { display: flex; flex-direction: column; gap: 6px; }
        .cup-field label {
          font-size: 12px; font-weight: 600; color: #475569;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .cup-field input,
        .cup-field select,
        .cup-field textarea {
          padding: 11px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13.5px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box;
          width: 100%;
        }
        .cup-field input:focus,
        .cup-field select:focus,
        .cup-field textarea:focus {
          border-color: #10b981;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .cup-field textarea { resize: vertical; min-height: 90px; }

        .cup-image-preview {
          width: 100%; height: 180px;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s ease;
          color: #94a3b8;
        }
        .cup-image-preview:hover { border-color: #10b981; color: #10b981; }
        .cup-image-preview img { width: 100%; height: 100%; object-fit: cover; }

        .cup-toast {
          position: fixed; top: 24px; left: 50%;
          transform: translateX(-50%);
          background: #0f172a; color: #fff;
          padding: 12px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 500;
          z-index: 1000;
          box-shadow: 0 20px 44px -16px rgba(15,23,42,0.5);
          animation: cup-toast-in 0.3s ease;
        }
        @keyframes cup-toast-in {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @media (max-width: 640px) {
          .cup-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cup-container">
        <div className="cup-header">
          <div>
            <button className="cup-back-btn" onClick={onCancel} type="button">
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="cup-title">Add Upcoming Project</h1>
            <p className="cup-subtitle">
              Publish a new government initiative to the public pipeline. It appears instantly in the Upcoming Projects view.
            </p>
          </div>
          <div className="cup-actions">
            <button type="button" className="cup-btn cancel" onClick={onCancel}>
              <X size={14} /> Cancel
            </button>
            <button
              type="submit"
              form="cup-form"
              className="cup-btn save"
              disabled={isSubmitting}
            >
              <Save size={14} /> {isSubmitting ? 'Publishing…' : 'Publish Project'}
            </button>
          </div>
        </div>

        <form id="cup-form" onSubmit={handleSubmit}>

          {/* CARD 1: Overview */}
          <div className="cup-card">
            <div className="cup-card-header">
              <h3 className="cup-card-title"><FileText size={15} /> Project Overview</h3>
              <p className="cup-card-sub">Basic details about the initiative.</p>
            </div>

            <div className="cup-grid">
              <div className="cup-field cup-grid-full">
                <label>Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Galeshewe Stormwater Drainage Overhaul"
                  required
                />
              </div>

              <div className="cup-field">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Infrastructure & Engineering"
                  required
                />
              </div>

              <div className="cup-field">
                <label>Ward *</label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="e.g., Ward 4 - Galeshewe"
                  required
                />
              </div>

              <div className="cup-field cup-grid-full">
                <label>Full Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Matsela Street & 7th Avenue Junction"
                  required
                />
              </div>

              <div className="cup-field cup-grid-full">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe what the project will deliver..."
                  required
                />
              </div>

              <div className="cup-field cup-grid-full">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., Infrastructure, Flood Prevention, Municipal"
                />
              </div>
            </div>
          </div>

          {/* CARD 2 (Timeline & Budget) — REMOVED — auto-generated */}

          {/* CARD 3: Issuing Authority */}
          <div className="cup-card">
            <div className="cup-card-header">
              <h3 className="cup-card-title"><Landmark size={15} /> Issuing Authority</h3>
              <p className="cup-card-sub">Which government department is driving this project.</p>
            </div>

            <div className="cup-grid">
              <div className="cup-field cup-grid-full">
                <label>Issuing Community *</label>
                <input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  placeholder="e.g., Northern Cape COGHSTA"
                  required
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Cover Image */}
          <div className="cup-card">
            <div className="cup-card-header">
              <h3 className="cup-card-title"><ImageIcon size={15} /> Cover Image</h3>
              <p className="cup-card-sub">Upload a photo representing the project. Optional.</p>
            </div>

            <label className="cup-image-preview">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {formData.imagePreview ? (
                <img src={formData.imagePreview} alt="Preview" />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <ImageIcon size={28} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Click to upload image</div>
                </div>
              )}
            </label>
          </div>

        </form>
      </div>

      {toast && <div className="cup-toast">{toast}</div>}
    </>
  );
}