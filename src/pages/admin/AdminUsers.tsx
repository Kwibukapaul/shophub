import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../lib/supabase';
import { Trash2, ToggleRight, ToggleLeft, Edit2, AlertCircle } from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  role: 'admin' | 'store_manager' | 'customer';
  email?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer' as 'admin' | 'store_manager' | 'customer',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (usersError) throw usersError;

      const { data: adminsData } = await supabase.from('admin_users').select('id');
      const { data: managersData } = await supabase.from('store_managers').select('id');

      const adminIds = new Set(adminsData?.map(a => a.id) || []);
      const managerIds = new Set(managersData?.map(m => m.id) || []);

      const extendedUsers: ExtendedUserProfile[] = (usersData || []).map(user => {
        let role: 'admin' | 'store_manager' | 'customer' = 'customer';
        if (adminIds.has(user.id)) role = 'admin';
        else if (managerIds.has(user.id)) role = 'store_manager';
        else if (user.is_admin) role = 'admin'; // Fallback
        
        return { ...user, role };
      });

      setUsers(extendedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ is_active: !currentStatus }).eq('id', userId);

      if (error) throw error;
      setMessage('User status updated successfully');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
    }
  };

  const handleEdit = (user: ExtendedUserProfile) => {
    setFormData({
      email: '', // Don't show email/password on edit
      password: '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'customer',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const updateUserRole = async (userId: string, targetRole: 'admin' | 'store_manager' | 'customer') => {
    // Revoke both existing roles first to be safe
    await supabase.from('admin_users').delete().eq('id', userId);
    await supabase.from('store_managers').delete().eq('id', userId);

    if (targetRole === 'admin') {
      await supabase.from('admin_users').insert({ id: userId });
      await supabase.from('user_profiles').update({ is_admin: true }).eq('id', userId);
    } else if (targetRole === 'store_manager') {
      await supabase.from('store_managers').insert({ id: userId, store_id: `store_${userId}` }); // Default store_id
      await supabase.from('user_profiles').update({ is_admin: false }).eq('id', userId);
    } else {
      await supabase.from('user_profiles').update({ is_admin: false }).eq('id', userId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (!editingId) {
        // Create new user
        if (!formData.email || !formData.password) {
          throw new Error("Email and password are required to create a new user.");
        }
        // Note: Creating a user via signUp on the client will log the current user in as the new user.
        // For a full admin dashboard, a secure edge function should be used.
        // Using it here for functionality but warning applies.
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('user_profiles').insert({
            id: authData.user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            is_active: formData.is_active,
            is_admin: formData.role === 'admin'
          });
          
          await updateUserRole(authData.user.id, formData.role);
        }
      } else {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            is_active: formData.is_active,
          })
          .eq('id', editingId);

        if (error) throw error;
        
        await updateUserRole(editingId, formData.role);
      }

      setMessage(editingId ? 'User updated successfully' : 'User created successfully');
      setShowForm(false);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);

      if (error) throw error;
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Add New User
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editingId ? 'Edit User' : 'Add New User'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
               <select
                 value={formData.role}
                 onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'store_manager' | 'customer' })}
                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               >
                 <option value="customer">Customer</option>
                 <option value="store_manager">Store Manager</option>
                 <option value="admin">Admin</option>
               </select>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-900 dark:text-white font-medium">Active Account</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Role</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : user.role === 'store_manager'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : user.role === 'store_manager' ? 'Store Manager' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}