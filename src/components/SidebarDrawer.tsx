import React, { useState } from 'react';
import { BoltIcon } from './BoltIcon';
import { ChatSession, ProjectItem } from '../utils/boltEngine';
import { X, Plus, Pin, Trash2, Settings, FolderPlus, Check, Download, Mic } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onTogglePin: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenNativeModal: () => void;
  onOpenVoice: () => void;
  projects: ProjectItem[];
  onCreateProject: (name: string) => void;
  sidebarLayout: 'left' | 'right';
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onTogglePin,
  onDeleteSession,
  onOpenSettings,
  onOpenNativeModal,
  onOpenVoice,
  projects,
  onCreateProject,
  sidebarLayout,
}) => {
  // State for the "Sure?" delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  if (!isOpen) return null;

  const pinnedSessions = sessions.filter((s) => s.pinned);
  const historySessions = sessions.filter((s) => !s.pinned);

  const handleStartDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectModal(false);
    }
  };

  const isLeft = sidebarLayout === 'left';

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close sidebar backdrop"
      />

      {/* Drawer Container */}
      <aside
        className={`relative z-10 w-[85vw] max-w-sm h-full flex flex-col justify-between p-5 bg-white/90 dark:bg-[#12181b]/95 backdrop-blur-2xl border-x border-black/5 dark:border-white/10 shadow-2xl transition-transform duration-300 ${
          isLeft ? 'mr-auto rounded-r-3xl' : 'ml-auto rounded-l-3xl'
        }`}
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BoltIcon size={36} />
              <span className="font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white">
                Bolt
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat & Voice Button */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all"
            >
              <span>New chat</span>
            </button>
            <button
              onClick={() => {
                onOpenVoice();
                onClose();
              }}
              aria-label="Open voice mode"
              className="w-12 h-12 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center justify-center transition-all flex-shrink-0"
              title="Voice Chat (বাংলা ও English)"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Projects Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Projects
              </span>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors py-1"
            >
              <span>+ New project</span>
            </button>
            {projects.length > 0 && (
              <div className="mt-2 space-y-1">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 flex items-center justify-between"
                  >
                    <span>📁 {proj.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Chat Lists */}
          <div className="space-y-5 overflow-y-auto max-h-[46vh] pr-1">
            {/* Pinned Section */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2">
                Pinned
              </span>
              {pinnedSessions.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-1">No pinned chats</p>
              ) : (
                <div className="space-y-1">
                  {pinnedSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeSessionId === session.id
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-medium'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <span className="text-sm truncate max-w-[170px]" title={session.title}>
                        {session.title || 'Untitled chat'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Pinned Red Pin Icon matching screenshot */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(session.id);
                          }}
                          aria-label="Unpin chat"
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                          title="Unpin"
                        >
                          <span className="text-sm leading-none">📌</span>
                        </button>

                        {/* Delete / Sure? Confirmation */}
                        {confirmDeleteId === session.id ? (
                          <div
                            className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-lg px-2 py-0.5 animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 mr-1">
                              Sure?
                            </span>
                            <button
                              onClick={(e) => handleConfirmDelete(e, session.id)}
                              aria-label="Confirm delete"
                              className="text-xs text-white bg-red-600 hover:bg-red-700 px-1.5 py-0.5 rounded font-semibold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              aria-label="Cancel delete"
                              className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleStartDelete(e, session.id)}
                            aria-label={`Delete chat ${session.title}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2">
                History
              </span>
              {historySessions.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-1">No past chats yet</p>
              ) : (
                <div className="space-y-1">
                  {historySessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeSessionId === session.id
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-medium'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <span className="text-sm truncate max-w-[170px]" title={session.title}>
                        {session.title || 'Untitled chat'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Grey Pin Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(session.id);
                          }}
                          aria-label="Pin chat"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Pin"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete / Sure? confirmation */}
                        {confirmDeleteId === session.id ? (
                          <div
                            className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-lg px-2 py-0.5 animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 mr-1">
                              Sure?
                            </span>
                            <button
                              onClick={(e) => handleConfirmDelete(e, session.id)}
                              aria-label="Confirm delete"
                              className="text-xs text-white bg-red-600 hover:bg-red-700 px-1.5 py-0.5 rounded font-semibold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              aria-label="Cancel delete"
                              className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleStartDelete(e, session.id)}
                            aria-label={`Delete chat ${session.title}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2.5">
          <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 font-medium">
            Chats are saved on this device only.
          </p>

          {/* Install Native App (APK & EXE / GitHub) */}
          <button
            onClick={() => {
              onOpenNativeModal();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-500/25 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Install App (APK &amp; EXE / GitHub)</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 font-medium text-sm flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 transition-all"
          >
            <Settings className="w-4 h-4 text-neutral-500" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateProjectSubmit}
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-2xl border border-white/20 space-y-4"
          >
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              <span>Create New Project</span>
            </h3>
            <input
              type="text"
              placeholder="e.g. Science Homework, 3D Game, Client CRM"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
