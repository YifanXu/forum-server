// Auth Token
export type AuthToken = {
    user: User,
    token: string,
    expireAt: number,
}

// Forum Statistics
export type ForumStats = {
    totalUsers: number,
    totalThreads: number,
    totalPosts: number,
    latestThreads: Thread[]
}

// Forum Details
export type Forum =  {
    id: number,
    name: string,
    description: string,
    threadCount: number,
    icon: string,
    lastUpdatedThread?: Thread, // Optional property for forums
}

// Thread Details
export type Thread = {
    parentForumId?: number, // Optional for specific thread requests
    parentForumName?: string, // Optional for specific thread requests

    id: number,
    title: string,
    initialPost: Post,
    lastPost: Post,
    postCount: number,
}

// Post Details
export type Post = {
    threadId: number, // Add threadId for identifying the thread
    parentThreadId?: number, // Optional for list of posts in thread
    parentThreadTitle?: string, // Optional for list of posts in thread
    parentThreadForum?: string, // Optional for list of posts in thread

    id: number,
    author: User,
    time: number,
    content: string,
}

// User Details
export type User = {
    id: number,
    name: string,
    flair: string,
    pic: string,
}
