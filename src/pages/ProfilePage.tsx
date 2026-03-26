import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { ChevronLeft, Edit2 } from "lucide-react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { session, userProfile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.full_name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Sync form fields when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setPhone(userProfile.phone || "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      await updateProfile({ full_name: fullName, phone });
      setMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate("home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
            >
              <Edit2 size={18} />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium">
                {message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={session?.user.email || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-600 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-600 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Status
              </label>
              <input
                type="text"
                value={userProfile?.is_active ? "Active" : "Inactive"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Discard
              </button>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Other Options
            </h2>
            <button
              onClick={() => onNavigate("reviews")}
              className="block w-full text-left px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition mb-2 font-medium"
            >
              Write a Review
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
