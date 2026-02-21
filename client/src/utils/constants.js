export const HOST = import.meta.env.VITE_SERVER_URL;

// Auth
export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;


// Contacts
export const CONTACTS_ROUTES = "api/contacts";
export const SEARCH_CONTACTS = `${CONTACTS_ROUTES}/search`;
export const GET_FRIENDS = `${CONTACTS_ROUTES}/friends`;
export const GET_PENDING_REQUESTS = `${CONTACTS_ROUTES}/requests`;
export const SEND_FRIEND_REQUEST = `${CONTACTS_ROUTES}/friend-request`;
export const ACCEPT_FRIEND_REQUEST = (id) => `${CONTACTS_ROUTES}/friend-request/${id}/accept`;

// Posts
export const POSTS_ROUTES = "api/posts";
export const GET_FEED = `${POSTS_ROUTES}/feed`;
export const CREATE_POST = POSTS_ROUTES;

// Messages
export const MESSAGES_ROUTES = "api/messages";
export const GET_DM_MESSAGES = (contactId) => `${MESSAGES_ROUTES}/dm/${contactId}`;
export const GET_GROUP_MESSAGES = (groupId) => `${MESSAGES_ROUTES}/group/${groupId}`;
export const UPLOAD_FILE = `${MESSAGES_ROUTES}/upload`;

// Groups
export const GROUPS_ROUTES = "api/groups";
export const GET_MY_GROUPS = `${GROUPS_ROUTES}/my-groups`;
export const CREATE_GROUP = GROUPS_ROUTES;

// Tasks
export const TASKS_ROUTES = "api/tasks";
export const UPDATE_TASK = (id) => `${TASKS_ROUTES}/${id}`;
export const DELETE_TASK = (id) => `${TASKS_ROUTES}/${id}`;