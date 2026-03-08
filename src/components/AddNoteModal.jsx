/**
 * AddNoteModal.jsx
 *
 * Slide-up overlay for creating or editing a timeline note.
 * Replaces the React Native Modal with a fixed overlay div.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CATEGORY_META } from '../data/events';
import { formatYearsAgoLong, parseYearsAgo } from '../utils/timeUtils';

const ALL_CATEGORIES = Object.values(CATEGORIES);

export default function AddNoteModal({
  note,
  initialYearsAgo,
  onSave,
  onDelete,
  onClose,
}) {
  const isEditing    = note !== null;
  const isPredefined = note?.isPredefined ?? false;

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [yearsAgoStr, setYearsAgoStr] = useState('');
  const [category,    setCategory]    = useState(CATEGORIES.CUSTOM);
  const [error,       setError]       = useState('');

  // Populate fields when modal opens
  useEffect(() => {
    if (isEditing && note) {
      setTitle(note.title);
      setDescription(note.description ?? '');
      setYearsAgoStr(String(note.yearsAgo));
      setCategory(note.category ?? CATEGORIES.CUSTOM);
    } else {
      setTitle('');
      setDescription('');
      setYearsAgoStr(initialYearsAgo != null ? String(Math.round(initialYearsAgo)) : '');
      setCategory(CATEGORIES.CUSTOM);
    }
    setError('');
  }, [note, isEditing, initialYearsAgo]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError('Please enter a title.'); return; }

    const parsedYears = parseYearsAgo(yearsAgoStr);
    if (isNaN(parsedYears) || parsedYears < 0) {
      setError('Enter a valid time (e.g. 13.8B, 541M, 10K, or 250).');
      return;
    }

    onSave({
      id:          isEditing ? note.id : undefined,
      title:       isPredefined ? note.title : trimmedTitle,
      description: description.trim(),
      yearsAgo:    isPredefined ? note.yearsAgo : parsedYears,
      category:    isPredefined ? note.category : category,
      isPredefined,
      isMajor:     note?.isMajor ?? false,
    });
  }, [title, description, yearsAgoStr, category, isEditing, isPredefined, note, onSave]);

  const handleDelete = useCallback(() => {
    if (isPredefined) {
      alert('Predefined Big History events cannot be deleted. You can edit their description.');
      return;
    }
    if (window.confirm(`Delete "${title.trim() || note?.title}"?`)) {
      onDelete(note.id);
    }
  }, [isPredefined, title, note, onDelete]);

  const parsedPreview = parseYearsAgo(yearsAgoStr);
  const previewLabel  = isNaN(parsedPreview) ? '' : formatYearsAgoLong(parsedPreview);

  return (
    /* Backdrop */
    <div style={styles.backdrop} onClick={onClose}>
      {/* Panel */}
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <span style={styles.headerTitle}>
            {isEditing ? (isPredefined ? 'Event Detail' : 'Edit Note') : 'Add Note'}
          </span>
          <button style={styles.saveBtn} onClick={handleSave}>Save</button>
        </div>

        {/* Scrollable body */}
        <div style={styles.body}>
          {!!error && <div style={styles.error}>{error}</div>}

          {isPredefined && (
            <div style={styles.predefinedBadge}>
              📚 Predefined Big History Event — only the description is editable.
            </div>
          )}

          {/* Title */}
          <label style={styles.fieldLabel}>Title</label>
          <input
            style={{ ...styles.input, ...(isPredefined ? styles.inputReadOnly : {}) }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title…"
            readOnly={isPredefined}
            maxLength={80}
          />

          {/* Years ago */}
          <label style={styles.fieldLabel}>
            Time <span style={styles.fieldHint}>(e.g. 13.8B · 541M · 10K · 250)</span>
          </label>
          <input
            style={{ ...styles.input, ...(isPredefined ? styles.inputReadOnly : {}) }}
            value={yearsAgoStr}
            onChange={(e) => { setYearsAgoStr(e.target.value); setError(''); }}
            placeholder="Years ago (e.g. 66M)"
            readOnly={isPredefined}
            autoComplete="off"
          />
          {!!previewLabel && (
            <div style={styles.previewLabel}>{previewLabel}</div>
          )}

          {/* Category */}
          <label style={styles.fieldLabel}>Category</label>
          <div style={{ ...styles.categoryRow, ...(isPredefined ? styles.categoryDisabled : {}) }}>
            {ALL_CATEGORIES.map((cat) => {
              const meta   = CATEGORY_META[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  style={{
                    ...styles.catChip,
                    ...(active
                      ? { backgroundColor: meta.color + '33', borderColor: meta.color }
                      : {}),
                  }}
                  onClick={() => !isPredefined && setCategory(cat)}
                  disabled={isPredefined}
                >
                  <span>{meta.emoji}</span>
                  <span
                    style={{
                      ...styles.catLabel,
                      ...(active ? { color: meta.color, fontWeight: 700 } : {}),
                    }}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Description */}
          <label style={styles.fieldLabel}>Description / Notes</label>
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, class notes, or your own analysis…"
            rows={6}
          />

          {/* Delete button */}
          {isEditing && (
            <button
              style={{
                ...styles.deleteBtn,
                ...(isPredefined ? styles.deleteBtnDisabled : {}),
              }}
              onClick={handleDelete}
            >
              <span style={isPredefined ? styles.deleteTextDisabled : styles.deleteText}>
                {isPredefined ? 'Cannot Delete Predefined Event' : 'Delete Note'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position:        'fixed',
    inset:           0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display:         'flex',
    alignItems:      'flex-end',
    justifyContent:  'center',
    zIndex:          100,
  },
  panel: {
    width:           '100%',
    maxWidth:        600,
    maxHeight:       '90vh',
    backgroundColor: '#0D0D1A',
    borderRadius:    '16px 16px 0 0',
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
  },
  header: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         '16px',
    borderBottom:    '1px solid #1A1A2E',
    backgroundColor: '#111122',
    flexShrink:      0,
  },
  headerTitle: {
    color:      '#DDDDFF',
    fontSize:   16,
    fontWeight: 700,
  },
  cancelBtn: {
    color:      '#7777AA',
    fontSize:   15,
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    minWidth:   60,
  },
  saveBtn: {
    color:      '#7B68EE',
    fontSize:   15,
    fontWeight: 700,
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    minWidth:   60,
    textAlign:  'right',
  },
  body: {
    overflowY: 'auto',
    padding:   '16px',
    flex:      1,
  },
  error: {
    color:           '#FF6B6B',
    fontSize:        13,
    marginBottom:    10,
    backgroundColor: '#FF000022',
    borderRadius:    6,
    padding:         8,
  },
  predefinedBadge: {
    backgroundColor: '#7B68EE22',
    border:          '1px solid #7B68EE55',
    borderRadius:    8,
    padding:         10,
    marginBottom:    14,
    color:           '#9A88FF',
    fontSize:        12,
    lineHeight:      1.5,
  },
  fieldLabel: {
    display:       'block',
    color:         '#7777AA',
    fontSize:      12,
    fontWeight:    600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom:  6,
    marginTop:     14,
  },
  fieldHint: {
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight:    400,
    fontSize:      11,
    color:         '#44445A',
  },
  input: {
    display:         'block',
    width:           '100%',
    backgroundColor: '#141428',
    border:          '1px solid #2A2A4A',
    borderRadius:    8,
    color:           '#CCCCEE',
    fontSize:        14,
    padding:         '10px 12px',
    outline:         'none',
  },
  inputReadOnly: {
    opacity: 0.55,
    cursor:  'default',
  },
  textarea: {
    resize:    'vertical',
    minHeight: 120,
  },
  previewLabel: {
    color:     '#5555AA',
    fontSize:  11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryRow: {
    display:   'flex',
    flexWrap:  'wrap',
    gap:       8,
    padding:   '4px 0',
  },
  categoryDisabled: {
    opacity:        0.45,
    pointerEvents:  'none',
  },
  catChip: {
    display:         'flex',
    alignItems:      'center',
    gap:             4,
    backgroundColor: '#141428',
    border:          '1px solid #2A2A4A',
    borderRadius:    14,
    padding:         '5px 10px',
    cursor:          'pointer',
    color:           '#CCCCEE',
  },
  catLabel: {
    color:    '#6666AA',
    fontSize: 12,
  },
  deleteBtn: {
    marginTop:     32,
    border:        '1px solid #CC2222',
    borderRadius:  8,
    padding:       '12px 0',
    width:         '100%',
    textAlign:     'center',
    cursor:        'pointer',
    background:    'none',
  },
  deleteBtnDisabled: {
    borderColor: '#333344',
    cursor:      'default',
  },
  deleteText: {
    color:      '#FF5555',
    fontSize:   14,
    fontWeight: 600,
  },
  deleteTextDisabled: {
    color: '#444455',
  },
};
