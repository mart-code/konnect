import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createChatSlice } from "./slices/chat-slice";
import { createTaskSlice } from "./slices/task-slice";
import { createCallSlice } from "./slices/call-slice";
import { createNotificationSlice } from "./slices/notification-slice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createChatSlice(...a),
  ...createTaskSlice(...a),
  ...createCallSlice(...a),
  ...createNotificationSlice(...a),
}));