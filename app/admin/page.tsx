"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/use-profile';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'supe' | 'chaser';
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: currentUserProfile } = useProfile(currentUserId || undefined);

  // Auth check: Ensure user is signed in and has admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('[Admin] ❌ No user signed in, redirecting to login');
        router.push('/login');
        return;
      }

      setCurrentUserId(user.uid);
      console.log('[Admin] ✅ User authenticated:', user.email);
    });

    return () => unsubscribe();
  }, [router]);

  // Role check: Ensure user has admin or super_admin role
  useEffect(() => {
    if (!currentUserProfile) return;

    if (currentUserProfile.role !== 'admin' && currentUserProfile.role !== 'super_admin') {
      console.log(`[Admin] ❌ Access denied: User role is "${currentUserProfile.role}", requires admin or super_admin"`);
      alert('Access Denied: Admin privileges required');
      router.push('/');
      return;
    }

    console.log(`[Admin] ✅ Access granted: ${currentUserProfile.role}`);
    setAuthChecking(false);
  }, [currentUserProfile, router]);

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

  const changeRole = async (userId: string, newRole: 'super_admin' | 'admin' | 'supe' | 'chaser') => {
    // Prevent non-super_admin from creating other admins
    if (currentUserProfile?.role !== 'super_admin' && (newRole === 'admin' || newRole === 'super_admin')) {
      alert('Only Super Admin can create admins');
      return;
    }

    // Prevent changing super_admin role (only super_admin can)
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'super_admin' && currentUserProfile?.role !== 'super_admin') {
      alert('Only Super Admin can modify Super Admin accounts');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      console.log(`[Admin] Changed user ${userId} role to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      alert(`User role updated to ${newRole.toUpperCase().replace('_', ' ')}!`);
    } catch (error) {
      console.error('[Admin] Failed to update role:', error);
      alert('Failed to update role. Check console for details.');
    }
  };

  // Show loading while checking auth
  if (authChecking || !currentUserProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#007AFF] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#007AFF] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">🔒 Admin Panel</h1>
            <p className="text-gray-600 text-sm mt-1">
              Logged in as: <span className="font-semibold">{currentUserProfile.email}</span>
              <Badge className={`ml-2 ${currentUserProfile.role === 'super_admin' ? 'bg-red-600' : 'bg-purple-500'}`}>
                {currentUserProfile.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
              </Badge>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/chaser/incidents')}
            className="flex items-center gap-2"
          >
            ← Back to Incidents
          </Button>
        </div>

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
                        user.role === 'super_admin'
                          ? 'bg-red-600'
                          : user.role === 'admin'
                          ? 'bg-purple-500'
                          : user.role === 'supe'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }
                    >
                      {user.role === 'super_admin' ? 'SUPER ADMIN' : user.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeRole(user.id, 'chaser')}
                        disabled={user.role === 'chaser' || (user.role === 'super_admin' && currentUserProfile?.role !== 'super_admin')}
                        className="text-xs"
                      >
                        → Chaser
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeRole(user.id, 'supe')}
                        disabled={user.role === 'supe' || (user.role === 'super_admin' && currentUserProfile?.role !== 'super_admin')}
                        className="text-xs"
                      >
                        → Supe
                      </Button>
                      {currentUserProfile?.role === 'super_admin' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeRole(user.id, 'admin')}
                            disabled={user.role === 'admin'}
                            className="text-xs"
                          >
                            → Admin
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeRole(user.id, 'super_admin')}
                            disabled={user.role === 'super_admin'}
                            className="text-xs bg-red-50 hover:bg-red-100"
                          >
                            → Super Admin
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">💡 Role Hierarchy:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong className="text-red-600">Super Admin</strong>: GOD MODE - full control, can manage all roles including admins</li>
            <li>• <strong className="text-purple-600">Admin</strong>: Can manage chasers and supes only (not other admins)</li>
            <li>• <strong className="text-blue-600">Supe</strong>: Supervisor, manages chasers, sees live map, approves docs</li>
            <li>• <strong className="text-green-600">Chaser</strong>: Field responder, sees incidents, responds to alerts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
