import { gql } from "@apollo/client";

export const GET_FEED_QUERY = gql`
  query GetFeed {
    getFeed {
      id
      content
      createdAt
      author {
        id
        firstName
        lastName
        image
        color
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      image
      color
      profileSetup
    }
  }
`;
export const GET_PENDING_REQUESTS_QUERY = gql`
  query GetPendingRequests {
    getPendingRequests {
      id
      status
      createdAt
      sender {
        id
        email
        firstName
        lastName
        image
        color
      }
    }
  }
`;
export const GET_FRIENDS_QUERY = gql`
  query GetFriends {
    getFriends {
      id
      email
      firstName
      lastName
      image
      color
    }
  }
`;
export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      createdAt
      author {
        id
        firstName
        lastName
        image
        color
      }
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId)
  }
`;

export const REJECT_FRIEND_REQUEST_MUTATION = gql`
  mutation RejectFriendRequest($requestId: ID!) {
    rejectFriendRequest(requestId: $requestId)
  }
`;

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($q: String!) {
    searchUsers(q: $q) {
      id
      email
      firstName
      lastName
      image
      color
    }
  }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiverId: $receiverId) {
      id
      status
    }
  }
`;

export const GET_TASKS_QUERY = gql`
  query GetTasks {
    getTasks {
      id
      title
      status
      createdAt
    }
  }
`;

export const GET_GROUPS_QUERY = gql`
  query GetGroups {
    getGroups {
      id
      name
      admin {
        id
        firstName
        lastName
      }
      members {
        id
        firstName
        lastName
        image
        color
      }
      createdAt
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($title: String!) {
    createTask(title: $title) {
      id
      title
      status
      createdAt
    }
  }
`;

export const UPDATE_TASK_STATUS_MUTATION = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId)
  }
`;

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($name: String!, $members: [ID!]!) {
    createGroup(name: $name, members: $members) {
      id
      name
      admin {
        id
        firstName
      }
      members {
        id
        firstName
      }
    }
  }
`;

export const ADD_MEMBERS_TO_GROUP_MUTATION = gql`
  mutation AddMembersToGroup($groupId: ID!, $members: [ID!]!) {
    addMembersToGroup(groupId: $groupId, members: $members) {
      id
      name
      members {
        id
        firstName
      }
    }
  }
`;

export const GET_DM_MESSAGES_QUERY = gql`
  query GetDirectMessages($userId: ID!) {
    getDirectMessages(userId: $userId) {
      id
      sender {
        id
      }
      receiver {
        id
      }
      messageType
      content
      fileUrl
      createdAt
    }
  }
`;

export const GET_GROUP_MESSAGES_QUERY = gql`
  query GetGroupMessages($groupId: ID!) {
    getGroupMessages(groupId: $groupId) {
      id
      sender {
        id
        firstName
        lastName
        image
        color
      }
      messageType
      content
      fileUrl
      createdAt
    }
  }
`;
