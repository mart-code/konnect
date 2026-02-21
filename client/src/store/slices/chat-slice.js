// Chat slice manages selected contact/group and message history maps
export const createChatSlice = (set, get) => ({
  // The currently selected contact (user object) or group (group object)
  selectedContact: null,
  // DM messages: { [contactId]: Message[] }
  dmMessages: {},
  // Group messages: { [groupId]: Message[] }
  groupMessages: {},

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  setDmMessages: (contactId, messages) =>
    set((state) => ({
      dmMessages: { ...state.dmMessages, [contactId]: messages },
    })),

  addDmMessage: (contactId, message) =>
    set((state) => ({
      dmMessages: {
        ...state.dmMessages,
        [contactId]: [...(state.dmMessages[contactId] || []), message],
      },
    })),

  setGroupMessages: (groupId, messages) =>
    set((state) => ({
      groupMessages: { ...state.groupMessages, [groupId]: messages },
    })),

  addGroupMessage: (groupId, message) =>
    set((state) => ({
      groupMessages: {
        ...state.groupMessages,
        [groupId]: [...(state.groupMessages[groupId] || []), message],
      },
    })),
});
