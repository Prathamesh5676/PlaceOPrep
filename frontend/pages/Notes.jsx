import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, Trash2, Edit3, X, Check, BookOpen, Tag } from 'lucide-react';

function FlashCard({ note, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="cursor-pointer bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all relative group"
      onClick={() => setFlipped(!flipped)}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
          className="p-1 text-gray-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-3">
        <BookOpen className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-purple-400 font-medium">FLASHCARD</span>
        {flipped && <span className="text-xs text-green-400">— Answer</span>}
      </div>
      <p className="text-gray-200 text-sm">{flipped ? (note.flashcardBack || 'No answer added.') : note.content}</p>
      <p className="text-gray-600 text-xs mt-3">Click to flip</p>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({ content: '', flashcardBack: '', isFlashcard: false, tags: '', questionId: 'general', questionTitle: 'General Note' });

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const params = activeTab === 'flashcards' ? '?isFlashcard=true' : '';
      const { data } = await api.get(`/notes${params}`);
      setNotes(data.notes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [activeTab]);

  const createNote = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/notes', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setNotes(prev => [data.note, ...prev]);
      setForm({ content: '', flashcardBack: '', isFlashcard: false, tags: '', questionId: 'general', questionTitle: 'General Note' });
      setShowForm(false);
    } catch (err) { console.error(err); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = activeTab === 'flashcards' ? notes.filter(n => n.isFlashcard) : notes;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <FileText className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Notes & Flashcards</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={createNote} className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Create New Note</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <textarea
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder={form.isFlashcard ? 'Front (question)...' : 'Write your note...'}
            className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm resize-none h-24 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <label className="flex items-center space-x-2 mb-3 cursor-pointer">
            <input type="checkbox" checked={form.isFlashcard} onChange={e => setForm(p => ({ ...p, isFlashcard: e.target.checked }))} className="rounded" />
            <span className="text-gray-300 text-sm">Make this a flashcard</span>
          </label>
          {form.isFlashcard && (
            <textarea
              value={form.flashcardBack}
              onChange={e => setForm(p => ({ ...p, flashcardBack: e.target.value }))}
              placeholder="Back (answer/explanation)..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm resize-none h-20 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="Tags (comma separated)"
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button type="submit" className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-colors">
            <Check className="w-4 h-4" /><span>Save Note</span>
          </button>
        </form>
      )}

      <div className="flex space-x-2 mb-6">
        {['all', 'flashcards'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t === 'all' ? 'All Notes' : 'Flashcards'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-purple-500"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(note => note.isFlashcard ? (
            <FlashCard key={note._id} note={note} onDelete={deleteNote} />
          ) : (
            <div key={note._id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 group relative hover:border-purple-500/50 transition-all">
              <button onClick={() => deleteNote(note._id)}
                className="absolute top-3 right-3 p-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 mb-2">{note.questionTitle}</p>
              <p className="text-gray-200 text-sm">{note.content}</p>
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {note.tags.map(t => (
                    <span key={t} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
