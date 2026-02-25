export const createNotificationSlice = (set, get) => ({
  pendingRequests: [],
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [request, ...state.pendingRequests],
    })),
  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
    })),
});
