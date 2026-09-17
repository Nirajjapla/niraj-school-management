import React, { useState } from 'react';
import { Search, Send, CheckCheck, User, GraduationCap, Users, Plus, X, MessageSquarePlus } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const MessageManagement: React.FC = () => {
  const { conversations, messages, sendMessage, markConversationRead, teachers, students, createConversation } = useData();

  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Teacher' | 'Student'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');

  // New Message Modal State
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMsgRole, setNewMsgRole] = useState<'Teacher' | 'Student'>('Teacher');
  const [newMsgSearch, setNewMsgSearch] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [initialMessageText, setInitialMessageText] = useState('');

  const filteredConversations = conversations.filter(conv => {
    // Only Teacher and Student categories (Parent removed)
    const matchesCategory = selectedCategory === 'All' || conv.participantRole === selectedCategory;
    const matchesSearch = conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeConversation = conversations.find(c => c.id === activeConvId) || filteredConversations[0];
  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    markConversationRead(id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, inputText.trim());
    setInputText('');
  };

  // Candidate recipients for New Message modal
  const candidateRecipients = newMsgRole === 'Teacher'
    ? teachers
        .filter(t => t.name.toLowerCase().includes(newMsgSearch.toLowerCase()) || t.department?.toLowerCase().includes(newMsgSearch.toLowerCase()))
        .map(t => ({
          id: t.id,
          name: t.name,
          role: 'Teacher' as const,
          subtext: `${t.department || 'Faculty'} • ${t.designation || 'Teacher'}`
        }))
    : students
        .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(newMsgSearch.toLowerCase()) || s.class?.toLowerCase().includes(newMsgSearch.toLowerCase()))
        .map(s => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          role: 'Student' as const,
          subtext: `Class ${s.class}-${s.section} • Roll #${s.rollNumber}`
        }));

  const handleStartConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !initialMessageText.trim()) return;

    const recipient = candidateRecipients.find(r => r.id === selectedRecipientId);
    if (!recipient) return;

    const newConvId = createConversation(
      recipient.id,
      recipient.name,
      recipient.role,
      recipient.subtext,
      initialMessageText.trim()
    );

    setActiveConvId(newConvId);
    setShowNewMessageModal(false);
    setSelectedRecipientId('');
    setInitialMessageText('');
    setNewMsgSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Communicate with Teachers and Students across the campus
          </p>
        </div>

        <button
          onClick={() => setShowNewMessageModal(true)}
          className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-md shadow-blue-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Main Messaging Box with Highlighted Interactive Borders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-indigo-100 dark:border-slate-800 h-[calc(100vh-210px)] min-h-[550px] flex overflow-hidden">
        {/* Left Conversations Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/80">
          {/* Search Box (Requirement 4: placeholder "search") */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>

            {/* Category Filter Pills (Requirement 6: Only Teacher | Student) */}
            <div className="flex gap-1.5 mt-3">
              {(['All', 'Teacher', 'Student'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    selectedCategory === cat
                      ? 'bg-[#4e74f9] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/80">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversation?.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-4 transition flex items-start gap-3 relative ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-[#4e74f9] shadow-sm'
                      : 'hover:bg-gray-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-[#4e74f9] flex items-center justify-center font-bold text-sm">
                      {conv.participantRole === 'Teacher' ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    {conv.onlineStatus && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-slate-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          conv.participantRole === 'Teacher'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {conv.participantRole} {conv.participantClass ? `• ${conv.participantClass}` : ''}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-[#4e74f9] text-white rounded-full text-[11px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Right Active Chat Box */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            {/* Header (Requirement 5: Removed call, video, 3-dots actions) */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#4e74f9] flex items-center justify-center font-bold">
                  {activeConversation.participantRole === 'Teacher' ? (
                    <GraduationCap className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {activeConversation.participantName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{activeConversation.participantRole}</span>
                    {activeConversation.participantClass && (
                      <span>• {activeConversation.participantClass}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
              {activeMessages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isAdmin
                          ? 'bg-[#4e74f9] text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 dark:text-slate-500 px-1">
                      <span>{msg.timestamp}</span>
                      {isAdmin && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box (Requirement 7: Highlight border at place of interaction) */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 p-1.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 focus-within:border-[#4e74f9] focus-within:ring-2 focus-within:ring-blue-500/20 transition shadow-sm"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.participantName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] disabled:opacity-40 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {/* New Message / Compose Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#4e74f9]">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Compose New Message</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Search and message any Teacher or Student</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartConversation} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Recipient Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMsgRole('Teacher');
                      setSelectedRecipientId('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      newMsgRole === 'Teacher'
                        ? 'bg-[#4e74f9] text-white border-[#4e74f9] shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Faculty / Teachers ({teachers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewMsgRole('Student');
                      setSelectedRecipientId('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      newMsgRole === 'Student'
                        ? 'bg-[#4e74f9] text-white border-[#4e74f9] shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Students ({students.length})</span>
                  </button>
                </div>
              </div>

              {/* Recipient Search & Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Select Recipient *
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${newMsgRole.toLowerCase()} by name, subject or class...`}
                    value={newMsgSearch}
                    onChange={(e) => setNewMsgSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-800/50">
                  {candidateRecipients.slice(0, 30).map(rec => {
                    const isSelected = selectedRecipientId === rec.id;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecipientId(rec.id)}
                        className={`p-2.5 cursor-pointer flex items-center justify-between text-xs transition ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 font-bold text-[#4e74f9]'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{rec.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">{rec.subtext}</p>
                        </div>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-[#4e74f9] px-2 py-0.5 bg-blue-100 dark:bg-blue-950 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {candidateRecipients.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No {newMsgRole.toLowerCase()}s found matching search.
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={initialMessageText}
                  onChange={(e) => setInitialMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRecipientId || !initialMessageText.trim()}
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start Conversation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageManagement;
