/**
 * AddNoteModal.js
 *
 * Full-screen modal for creating or editing a timeline note.
 *
 * Fields:
 *   • Title (required)
 *   • Description
 *   • Years Ago  — accepts plain numbers or suffixed values: 13.8B, 541M, 10K
 *   • Category   — scrollable row of category chips
 *
 * When editing a predefined event only the description is editable; title,
 * yearsAgo and category are locked to preserve the educational structure
 * (the user can still add personal notes in the description field).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { CATEGORIES, CATEGORY_META, getCategoryColor } from '../data/events';
import { formatYearsAgoLong, parseYearsAgo } from '../utils/timeUtils';

const ALL_CATEGORIES = Object.values(CATEGORIES);

export default function AddNoteModal({
  visible,
  note,          // null when creating; populated when editing
  initialYearsAgo,
  onSave,
  onDelete,
  onClose,
}) {
  const isEditing     = note !== null;
  const isPredefined  = note?.isPredefined ?? false;

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [yearsAgoStr, setYearsAgoStr] = useState('');
  const [category,    setCategory]    = useState(CATEGORIES.CUSTOM);
  const [error,       setError]       = useState('');

  // Populate fields when the modal opens
  useEffect(() => {
    if (visible) {
      if (isEditing && note) {
        setTitle(note.title);
        setDescription(note.description ?? '');
        setYearsAgoStr(String(note.yearsAgo));
        setCategory(note.category ?? CATEGORIES.CUSTOM);
      } else {
        setTitle('');
        setDescription('');
        setYearsAgoStr(
          initialYearsAgo != null ? String(Math.round(initialYearsAgo)) : ''
        );
        setCategory(CATEGORIES.CUSTOM);
      }
      setError('');
    }
  }, [visible, note, isEditing, initialYearsAgo]);

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a title.');
      return;
    }

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
      Alert.alert(
        'Cannot Delete',
        'Predefined Big History events cannot be deleted. You can edit their description.',
      );
      return;
    }
    Alert.alert(
      'Delete Note',
      `Delete "${title.trim() || note?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(note.id) },
      ],
    );
  }, [isPredefined, title, note, onDelete]);

  const parsedPreview = parseYearsAgo(yearsAgoStr);
  const previewLabel  = isNaN(parsedPreview) ? '' : formatYearsAgoLong(parsedPreview);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {isEditing ? (isPredefined ? 'Event Detail' : 'Edit Note') : 'Add Note'}
            </Text>

            <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Error */}
            {!!error && <Text style={styles.error}>{error}</Text>}

            {/* Predefined badge */}
            {isPredefined && (
              <View style={styles.predefinedBadge}>
                <Text style={styles.predefinedText}>
                  📚 Predefined Big History Event — only the description is editable.
                </Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={[styles.input, isPredefined && styles.inputReadOnly]}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title…"
              placeholderTextColor="#44445A"
              editable={!isPredefined}
              maxLength={80}
            />

            {/* Years ago */}
            <Text style={styles.fieldLabel}>
              Time  <Text style={styles.fieldHint}>(e.g. 13.8B · 541M · 10K · 250)</Text>
            </Text>
            <TextInput
              style={[styles.input, isPredefined && styles.inputReadOnly]}
              value={yearsAgoStr}
              onChangeText={(t) => { setYearsAgoStr(t); setError(''); }}
              placeholder="Years ago (e.g. 66M)"
              placeholderTextColor="#44445A"
              keyboardType="default"
              editable={!isPredefined}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {!!previewLabel && (
              <Text style={styles.previewLabel}>{previewLabel}</Text>
            )}

            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              style={isPredefined ? styles.categoryDisabled : undefined}
              scrollEnabled={!isPredefined}
            >
              {ALL_CATEGORIES.map((cat) => {
                const meta   = CATEGORY_META[cat];
                const active = category === cat;
                const color  = meta.color;

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      active && { backgroundColor: color + '33', borderColor: color },
                    ]}
                    onPress={() => !isPredefined && setCategory(cat)}
                    activeOpacity={isPredefined ? 1 : 0.7}
                  >
                    <Text style={styles.catEmoji}>{meta.emoji}</Text>
                    <Text
                      style={[
                        styles.catLabel,
                        active && { color, fontWeight: '700' },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Description */}
            <Text style={styles.fieldLabel}>Description / Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add context, class notes, or your own analysis…"
              placeholderTextColor="#44445A"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Delete button (editing only) */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.deleteBtn, isPredefined && styles.deleteBtnDisabled]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteText, isPredefined && styles.deleteTextDisabled]}>
                  {isPredefined ? 'Cannot Delete Predefined Event' : 'Delete Note'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
    backgroundColor: '#111122',
  },
  headerBtn: {
    minWidth: 60,
    paddingVertical: 4,
  },
  headerTitle: {
    color: '#DDDDFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: '#7777AA',
    fontSize: 15,
  },
  saveText: {
    color: '#7B68EE',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Error
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 10,
    backgroundColor: '#FF000022',
    borderRadius: 6,
    padding: 8,
  },

  // Predefined badge
  predefinedBadge: {
    backgroundColor: '#7B68EE22',
    borderWidth: 1,
    borderColor: '#7B68EE55',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  predefinedText: {
    color: '#9A88FF',
    fontSize: 12,
    lineHeight: 18,
  },

  // Form fields
  fieldLabel: {
    color: '#7777AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  fieldHint: {
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    fontSize: 11,
    color: '#44445A',
  },
  input: {
    backgroundColor: '#141428',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    borderRadius: 8,
    color: '#CCCCEE',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputReadOnly: {
    opacity: 0.55,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 10,
  },
  previewLabel: {
    color: '#5555AA',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Category row
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryDisabled: {
    opacity: 0.45,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141428',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  catEmoji: { fontSize: 13 },
  catLabel: {
    color: '#6666AA',
    fontSize: 12,
  },

  // Delete
  deleteBtn: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#CC2222',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    borderColor: '#333344',
  },
  deleteText: {
    color: '#FF5555',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteTextDisabled: {
    color: '#444455',
  },
});
