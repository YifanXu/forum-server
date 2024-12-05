import express, { Request, Response, NextFunction } from 'express';
// import bcrypt from 'bcrypt';
import passport from 'passport';
import session from 'express-session';
import mysql from 'mysql2/promise';
import { db_middleware } from '../db';
import authRouter, { sessionMiddleware } from './auth';
import { AuthToken, Forum, ForumStats, Post, Thread } from './types';

const router = express();

// Sample data arrays
const forums: Forum[] = [];
const users: User[] = [];
const threads: Thread[] = [];
const posts: Post[] = [];
let sessionData: AuthToken | null = null;

interface RegisterRequestBody {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
}

interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
}

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

router.set('view-engine', 'ejs');
router.use(express.urlencoded({ extended: false }));
// router.use(session({
//     secret: process.env.SESSION_SECRET || 'default-secret',
//     resave: false,
//     saveUninitialized: false
// }));

router.use('/auth', authRouter)

// Route for homepage
router.get('/', (req: Request, res: Response) => {
    res.render('index.ejs');
})

router.get('/', (req, res) => {
    res.send('Hello world!');
});

router.get('/forumStats', (req, res) => {
    const stats: ForumStats = {
        totalUsers: users.length,
        totalThreads: threads.length,
        totalPosts: posts.length,
        latestThreads: threads.slice(-5)
    };
    res.json(stats);
});

router.get('/threadFeed', (req, res) => {
    const page = parseInt(req.query.page as string) || 0;
    const feed = threads.slice(page * 20, (page + 1) * 20);
    res.json(feed);
});

router.get('/postFeed', (req, res) => {
    const page = parseInt(req.query.page as string) || 0;
    const feed = posts.slice(page * 20, (page + 1) * 20);
    res.json(feed);
});

router.get('/forums', (req, res) => {
    res.json(forums);
});

router.get('/forums/:forumId', (req, res) => {
    const forum = forums.find(f => f.id === parseInt(req.params.forumId));
    if (forum) {
        res.json(forum);
    } else {
        res.status(404).send('Forum not found');
    }
});

router.get('/forums/:forumId/threads', (req, res) => {
    const forumId = parseInt(req.params.forumId);
    const page = parseInt(req.query.page as string) || 0;
    const forumThreads = threads.filter(t => t.parentForumId === forumId)
                                 .slice(page * 20, (page + 1) * 20);
    res.json(forumThreads);
});

router.get('/threads/:threadId', (req, res) => {
    const thread = threads.find(t => t.id === parseInt(req.params.threadId));
    if (thread) {
        res.json(thread);
    } else {
        res.status(404).send('Thread not found');
    }
});

router.get('/threads/:threadId/posts', (req, res) => {
    const threadId = parseInt(req.params.threadId);
    const page = parseInt(req.query.page as string) || 0;
    const threadPosts = posts.filter(p => p.threadId === threadId)
                             .slice(page * 20, (page + 1) * 20);
    res.json(threadPosts);
});

router.get('/users/:userId', (req, res) => {
    const userId = req.params.userId; // Keep as string
    const user = users.find(u => String(u.id) === userId); // Convert both to strings
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

router.get('/users/:userId/posts', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userPosts = posts.filter(p => p.author.id === userId);
    res.json(userPosts);
});

router.put('/users/:userId', (req, res) => {
    const userId = req.params.userId; // Keep as string
    const user = users.find(u => String(u.id) === userId); // Convert both to strings
    if (user) {
        Object.assign(user, req.body); // Merge incoming updates into the user object
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

router.post('/forums/:forumId/threads', (req, res) => {
    const { title, content } = req.body;
    const forumId = parseInt(req.params.forumId);
    const newThread: Thread = {
        id: threads.length + 1,
        title,
        parentForumId: forumId,
        postCount: 1,
        initialPost: {
            id: posts.length + 1,
            threadId: threads.length + 1,
            author: sessionData!.user,
            time: Date.now(),
            content
        },
        lastPost: {
            id: posts.length + 1,
            threadId: threads.length + 1,
            author: sessionData!.user,
            time: Date.now(),
            content
        }
    };
    threads.push(newThread);
    posts.push(newThread.initialPost);
    res.status(201).json(newThread);
});

router.post('/threads/:threadId/reply', (req, res) => {
    const { content } = req.body;
    const threadId = parseInt(req.params.threadId);
    const newPost: Post = {
        id: posts.length + 1,
        threadId: threads.length + 1,
        author: sessionData!.user,
        time: Date.now(),
        content
    };
    posts.push(newPost);
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        thread.postCount++;
        thread.lastPost = newPost;
        res.status(201).json(newPost);
    } else {
        res.status(404).send('Thread not found');
    }
});

router.post('/forums/:forumId/subscribe', (req, res) => {
    const { subscribed } = req.body;
    const forumId = parseInt(req.params.forumId);
    // Simulate subscription
    res.status(204).send();
});

router.post('/threads/:threadId/subscribe', (req, res) => {
	const { subscribed } = req.body;
	const user = req.user;
    
	const db: mysql.PoolConnection = res.locals.connnection

	// if (subscribed) {
	// 	// db.execute('INSERT INTO `user-thread` (userID, threadID) VALUES (?, ?)', [user])
	// }
});

export default router;