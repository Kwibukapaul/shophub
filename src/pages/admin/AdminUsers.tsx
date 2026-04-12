import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { UserProfile } from "../../lib/supabase";
import {
  Trash2,
  ToggleRight,
  ToggleLeft,
  Edit2,
  AlertCircle,
  Search,
} from "lucide-react";

type UserRole = "admin" | "store_manager" | "customer";

interface PartnerStore {
  id: string;
  name: string;
}

interface StoreManagerAssignment {
  id: string;
  store_id: string;
}

interface ExtendedUserProfile extends UserProfile {
  role: UserRole;
  store_id?: string | null;
  store_name?: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "customer" as UserRole,
    store_id: "",
    is_active: true,
  });

  useEffect(() => {
    void fetchUsers();
    void fetchPartnerStores();
  }, []);

  const fetchPartnerStores = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_stores")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      setPartnerStores((data || []) as PartnerStore[]);
    } catch (err) {
      console.error("Error fetching partner stores:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) {
        throw usersError;
      }

      const { data: adminsData, error: adminsError } = await supabase
        .from("admin_users")
        .select("id");

      if (adminsError) {
        throw adminsError;
      }

      const { data: managersData, error: managersError } = await supabase
        .from("store_managers")
        .select("id, store_id");

      if (managersError) {
        throw managersError;
      }

      const { data: storesData, error: storesError } = await supabase
        .from("partner_stores")
        .select("id, name");

      if (storesError) {
        throw storesError;
      }

      const adminIds = new Set((adminsData || []).map((admin) => admin.id));
      const managerMap = new Map<string, string>(
        ((managersData || []) as StoreManagerAssignment[]).map((manager) => [
          manager.id,
          manager.store_id,
        ]),
      );
      const storeNameMap = new Map<string, string>(
        ((storesData || []) as PartnerStore[]).map((store) => [store.id, store.name]),
      );

      const extendedUsers: ExtendedUserProfile[] = (usersData || []).map((user) => {
        let role: UserRole = "customer";
        if (adminIds.has(user.id)) {
          role = "admin";
        } else if (managerMap.has(user.id)) {
          role = "store_manager";
        } else if (user.is_admin) {
          role = "admin";
        }

        const storeId = managerMap.get(user.id) || null;

        return {
          ...user,
          role,
          store_id: storeId,
          store_name: storeId ? storeNameMap.get(storeId) || null : null,
        };
      });

      setUsers(extendedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setMessage("User status updated successfully");
      void fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating user");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "customer",
      store_id: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user: ExtendedUserProfile) => {
    setFormData({
      email: "",
      password: "",
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role,
      store_id: user.store_id || "",
      is_active: user.is_active,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "customer",
      store_id: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const updateUserRole = async (
    userId: string,
    targetRole: UserRole,
    storeId: string,
  ) => {
    const { error: adminDeleteError } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", userId);

    if (adminDeleteError) {
      throw adminDeleteError;
    }

    const { error: managerDeleteError } = await supabase
      .from("store_managers")
      .delete()
      .eq("id", userId);

    if (managerDeleteError) {
      throw managerDeleteError;
    }

    if (targetRole === "admin") {
      const { error: adminInsertError } = await supabase
        .from("admin_users")
        .insert({ id: userId, role: "admin" });

      if (adminInsertError) {
        throw adminInsertError;
      }
    } else if (targetRole === "store_manager") {
      if (!storeId) {
        throw new Error("Please select a store for the store manager.");
      }

      const { error: managerInsertError } = await supabase
        .from("store_managers")
        .insert({ id: userId, store_id: storeId });

      if (managerInsertError) {
        throw managerInsertError;
      }
    }

    const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({ is_admin: targetRole === "admin" })
      .eq("id", userId);

    if (profileUpdateError) {
      throw profileUpdateError;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (formData.role === "store_manager" && !formData.store_id) {
      setError("Please choose a store for the store manager.");
      return;
    }

    try {
      if (!editingId) {
        if (!formData.email || !formData.password) {
          throw new Error("Email and password are required to create a new user.");
        }

        const {
          data: { session: currentAdminSession },
        } = await supabase.auth.getSession();

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        if (!authData.user) {
          throw new Error("User was not created successfully.");
        }

        const { error: profileInsertError } = await supabase
          .from("user_profiles")
          .upsert({
            id: authData.user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            is_active: formData.is_active,
            is_admin: formData.role === "admin",
          });

        if (profileInsertError) {
          throw profileInsertError;
        }

        await updateUserRole(authData.user.id, formData.role, formData.store_id);

        if (currentAdminSession) {
          const { error: restoreError } = await supabase.auth.setSession({
            access_token: currentAdminSession.access_token,
            refresh_token: currentAdminSession.refresh_token,
          });

          if (restoreError) {
            console.error("Failed to restore admin session after user creation:", restoreError);
          }
        }
      } else {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (profileError) {
          throw profileError;
        }

        await updateUserRole(editingId, formData.role, formData.store_id);
      }

      setMessage(editingId ? "User updated successfully" : "User created successfully");
      resetForm();
      void fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const { error: adminDeleteError } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", id);

      if (adminDeleteError) {
        throw adminDeleteError;
      }

      const { error: managerDeleteError } = await supabase
        .from("store_managers")
        .delete()
        .eq("id", id);

      if (managerDeleteError) {
        throw managerDeleteError;
      }

      const { error } = await supabase.from("user_profiles").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setMessage("User deleted successfully");
      void fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting user");
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      user.full_name,
      user.phone,
      user.role,
      user.store_name,
      user.is_active ? "active" : "inactive",
      user.id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Users Management
        </h1>
        <button
          onClick={handleAddNew}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Add New User
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="font-medium text-green-700 dark:text-green-300">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="flex-shrink-0 text-red-600 dark:text-red-400" size={20} />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Users
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Search size={18} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, phone, role, store, status, or user ID"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit User" : "Add New User"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({ ...formData, password: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(event) =>
                  setFormData({ ...formData, full_name: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({ ...formData, phone: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    role: event.target.value as UserRole,
                    store_id:
                      event.target.value === "store_manager"
                        ? formData.store_id
                        : "",
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="customer">Customer</option>
                <option value="store_manager">Store Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === "store_manager" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Store
                </label>
                <select
                  value={formData.store_id}
                  onChange={(event) =>
                    setFormData({ ...formData, store_id: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Store</option>
                  {partnerStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) =>
                    setFormData({ ...formData, is_active: event.target.checked })
                  }
                  className="h-4 w-4 rounded"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  Active Account
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {editingId ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <p className="text-gray-600 dark:text-gray-400">
            No users match "{searchTerm.trim()}".
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : user.role === "store_manager"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "store_manager"
                          ? "Store Manager"
                          : "Customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {user.store_name || (user.role === "store_manager" ? "Unassigned" : "—")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="flex gap-2 px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(user)}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title={user.is_active ? "Deactivate" : "Activate"}
                    >
                      {user.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
