// Call slice tracks incoming call state for the UI overlay
export const createCallSlice = (set) => ({
  // incomingCall: { from: { id, firstName, lastName }, offer: RTCSessionDescription } | null
  incomingCall: null,
  // activeCall: { peerId, type: 'audio'|'video' } | null
  activeCall: null,

  setIncomingCall: (call) => set({ incomingCall: call }),
  clearIncomingCall: () => set({ incomingCall: null }),
  setActiveCall: (call) => set({ activeCall: call }),
  clearActiveCall: () => set({ activeCall: null }),
});
