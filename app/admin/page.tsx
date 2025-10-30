"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'chaser' | 'supe' | 'admin';
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || '',
        name: doc.data().name || 'Unknown',
        role: doc.data().role || 'chaser',
      }));
      setUsers(usersData);
      console.log(`[Admin] Loaded ${usersData.length} users`);
    } catch (error) {
      console.error('[Admin] Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: 'chaser' | 'supe' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      console.log(`[Admin] Changed user ${userId} role to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      alert(`User role updated to ${newRole.toUpperCase()}!`);
    } catch (error) {
      console.error('[Admin] Failed to update role:', error);
      alert('Failed to update role. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">👤 User Management</h1>

        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Current Role</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4 text-sm">{user.name}</td>
                  <td className="p-4">
                    <Badge
                      className={
                        user.role === 'admin'
                          ? 'bg-purple-500'
                          : user.role === 'supe'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }
                    >
                      {user.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeRole(user.id, 'chaser')}
                        disabled={user.role === 'chaser'}
                        className="text-xs"
                      >
                        → Chaser
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeRole(user.id, 'supe')}
                        disabled={user.role === 'supe'}
                        className="text-xs"
                      >
                        → Supe
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeRole(user.id, 'admin')}
                        disabled={user.role === 'admin'}
                        className="text-xs"
                      >
                        → Admin
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">💡 How to use:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click a button to change a user's role</li>
            <li>• <strong>Chaser</strong>: Field responder, sees incidents, can chat with supes</li>
            <li>• <strong>Supe</strong>: Supervisor, manages chasers, sees everything</li>
            <li>• <strong>Admin</strong>: Full access, can manage users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
