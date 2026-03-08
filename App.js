/**
 * App.js — Main entry point for the Big History Timeline app.
 *
 * State lives here so every child component is a pure function of props:
 *   • notes          — all events (predefined + user-created)
 *   • selectedCats   — active category filters (empty = show all)
 *   • modalState     — controls AddNoteModal visibility & content
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import Timeline       from './src/components/Timeline';
import Filters        from './src/components/Filters';
import AddNoteModal   from './src/components/AddNoteModal';
import { PREDEFINED_EVENTS } from './src/data/events';

// ─── initial state ────────────────────────────────────────────────────────────

const INITIAL_NOTES = PREDEFINED_EVENTS;

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [notes,          setNotes]          = useState(INITIAL_NOTES);
  const [selectedCats,   setSelectedCats]   = useState([]);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingNote,    setEditingNote]    = useState(null);
  const [tapYearsAgo,    setTapYearsAgo]    = useState(null);

  // ── filter logic ───────────────────────────────────────────────────────────

  const filteredNotes = useMemo(() => {
    if (selectedCats.length === 0) return notes;
    return notes.filter((n) => selectedCats.includes(n.category));
  }, [notes, selectedCats]);

  const toggleCategory = useCallback((cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  // ── modal handlers ─────────────────────────────────────────────────────────

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
      // Update existing
      setNotes((prev) => prev.map((n) => (n.id === noteData.id ? noteData : n)));
    } else {
      // Create new with a unique id
      const newNote = {
        ...noteData,
        id:          `user_${Date.now()}`,
        isPredefined: false,
        isMajor:      false,
      };
      setNotes((prev) => [...prev, newNote]);
    }
    closeModal();
  }, [closeModal]);

  const handleDelete = useCallback((noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    closeModal();
  }, [closeModal]);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root}>
      <ExpoStatusBar style="light" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>Big History Timeline</Text>
          <Text style={styles.appSubtitle}>13.8 billion years · Tap to add · Pinch to zoom</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddNote(null)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category filters ── */}
      <Filters
        selectedCategories={selectedCats}
        onToggleCategory={toggleCategory}
      />

      {/* ── Main Timeline ── */}
      <Timeline
        notes={filteredNotes}
        onNotePress={openNoteDetail}
        onTimelinePress={openAddNote}
      />

      {/* ── Note detail / create modal ── */}
      <AddNoteModal
        visible={modalVisible}
        note={editingNote}
        initialYearsAgo={tapYearsAgo}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#111122',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  appTitle: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    color: '#44445A',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  addButton: {
    backgroundColor: '#1E1E3A',
    borderWidth: 1,
    borderColor: '#7B68EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addButtonText: {
    color: '#7B68EE',
    fontSize: 13,
    fontWeight: '700',
  },
});
