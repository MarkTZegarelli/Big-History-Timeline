/**
 * App.jsx — Main entry point for the Big History Timeline web app.
 *
 * State lives here so every child component is a pure function of props:
 *   • notes          — all events (predefined + user-created)
 *   • selectedCats   — active category filters (empty = show all)
 *   • modalState     — controls AddNoteModal visibility & content
 */

import React, { useState, useCallback, useMemo } from 'react';
import Timeline     from './components/Timeline';
import Filters      from './components/Filters';
import AddNoteModal from './components/AddNoteModal';
import { PREDEFINED_EVENTS } from './data/events';

export default function App() {
  const [notes,        setNotes]        = useState(PREDEFINED_EVENTS);
  const [selectedCats, setSelectedCats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote,  setEditingNote]  = useState(null);
  const [tapYearsAgo,  setTapYearsAgo]  = useState(null);

  // ── filter logic ──────────────────────────────────────────────────────────

  const filteredNotes = useMemo(() => {
    if (selectedCats.length === 0) return notes;
    return notes.filter((n) => selectedCats.includes(n.category));
  }, [notes, selectedCats]);

  const toggleCategory = useCallback((cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  // ── modal handlers ────────────────────────────────────────────────────────

  const openNoteDetail = useCallback((note) => {
    setEditingNote(note);
    setTapYearsAgo(null);
    setModalVisible(true);
  }, []);

  const openAddNote = useCallback((yearsAgo) => {
    setEditingNote(null);
    setTapYearsAgo(yearsAgo);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingNote(null);
    setTapYearsAgo(null);
  }, []);

  const handleSave = useCallback((noteData) => {
    if (noteData.id) {
      setNotes((prev) => prev.map((n) => (n.id === noteData.id ? noteData : n)));
    } else {
      const newNote = {
        ...noteData,
        id: `user_${Date.now()}`,
        isPredefined: false,
        isMajor: false,
      };
      setNotes((prev) => [...prev, newNote]);
    }
    closeModal();
  }, [closeModal]);

  const handleDelete = useCallback((noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    closeModal();
  }, [closeModal]);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.appTitle}>Big History Timeline</div>
          <div style={styles.appSubtitle}>13.8 billion years · Click to add · Scroll to zoom</div>
        </div>
        <button style={styles.addButton} onClick={() => openAddNote(null)}>
          + Add Note
        </button>
      </div>

      {/* Category filters */}
      <Filters
        selectedCategories={selectedCats}
        onToggleCategory={toggleCategory}
      />

      {/* Main Timeline */}
      <Timeline
        notes={filteredNotes}
        onNotePress={openNoteDetail}
        onTimelinePress={openAddNote}
      />

      {/* Note detail / create modal */}
      {modalVisible && (
        <AddNoteModal
          note={editingNote}
          initialYearsAgo={tapYearsAgo}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#0D0D1A',
  },
  topBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#111122',
    borderBottom: '1px solid #1A1A2E',
    flexShrink: 0,
  },
  appTitle: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  appSubtitle: {
    color: '#44445A',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: '0.3px',
  },
  addButton: {
    backgroundColor: '#1E1E3A',
    border: '1px solid #7B68EE',
    borderRadius: 16,
    padding: '7px 14px',
    color: '#7B68EE',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
