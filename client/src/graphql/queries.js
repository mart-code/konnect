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
