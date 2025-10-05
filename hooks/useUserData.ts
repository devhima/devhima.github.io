import { useState, useEffect } from 'react';
import type { User, UsageRecord } from '../types';

const STORAGE_KEY = 'mobileDataTrackerUsers';

const getInitialUsers = (): User[] => {
    try {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
    }
    // Return some default data if nothing is in storage
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return [
        { 
            id: '1', 
            name: 'Alice', 
            totalUsage: 157286400, // ~150 MB
            usageHistory: [
                { timestamp: now - 6 * day, usage: 20 * 1024 * 1024 },
                { timestamp: now - 5 * day, usage: 35 * 1024 * 1024 },
                { timestamp: now - 3 * day, usage: 15 * 1024 * 1024 },
                { timestamp: now - 1 * day, usage: 87286400 },
            ]
        },
        { 
            id: '2', 
            name: 'Bob', 
            totalUsage: 377487360, // ~360 MB
            usageHistory: [
                { timestamp: now - 7 * day, usage: 50 * 1024 * 1024 },
                { timestamp: now - 4 * day, usage: 120 * 1024 * 1024 },
                { timestamp: now - 2 * day, usage: 80 * 1024 * 1024 },
                { timestamp: now, usage: 127487360 },
            ]
        },
        { 
            id: '3', 
            name: 'Charlie', 
            totalUsage: 2684354560, // ~2.5 GB
            usageHistory: [
                { timestamp: now - 10 * day, usage: 1610612736 }, // 1.5 GB
                { timestamp: now - 5 * day, usage: 1073741824 }, // 1 GB
            ]
        },
        { 
            id: '4', 
            name: 'Dana', 
            totalUsage: 1319413953331, // ~1.2 TB
            usageHistory: [
                { timestamp: now - 20 * day, usage: 879609302221 }, // 0.8 TB
                { timestamp: now - 10 * day, usage: 439804651110 }, // 0.4 TB
            ]
        },
    ];
};


export const useUserData = () => {
    const [users, setUsers] = useState<User[]>(getInitialUsers);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }, [users]);

    const addUser = (name: string) => {
        const newUser: User = {
            id: new Date().toISOString(),
            name,
            totalUsage: 0,
            usageHistory: [],
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
    };

    const updateUserUsage = (userId: string, sessionUsage: number) => {
        const newRecord: UsageRecord = {
            timestamp: Date.now(),
            usage: sessionUsage,
        };
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId
                    ? { 
                        ...user, 
                        totalUsage: user.totalUsage + sessionUsage,
                        usageHistory: [...user.usageHistory, newRecord] 
                      }
                    : user
            )
        );
    };

    const deleteUser = (userId: string) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    };

    const clearUserHistory = (userId: string) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId
                    ? {
                        ...user,
                        totalUsage: 0,
                        usageHistory: [],
                      }
                    : user
            )
        );
    };

    const clearAllUsersHistory = () => {
        setUsers(prevUsers =>
            prevUsers.map(user => ({
                ...user,
                totalUsage: 0,
                usageHistory: [],
            }))
        );
    };

    const clearAllData = () => {
        setUsers([]);
    };

    return { users, addUser, updateUserUsage, deleteUser, clearUserHistory, clearAllUsersHistory, clearAllData };
};