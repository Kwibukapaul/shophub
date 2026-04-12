import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { ChevronLeft, Edit2 } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";
import { getImagePreviewUrl, normalizeOptionalImageUrl } from "../lib/imageUrl";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { session, userProfile, updateProfile, signOut } = useAuth();
  const isOnline = useOnlineStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.full_name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    userProfile?.profile_image_url || "",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setPhone(userProfile.phone || "");
      setProfileImageUrl(userProfile.profile_image_url || "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!isOnline) {
      setMessageType("error");
      setMessage(offlineMessage);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const normalizedProfileImageUrl = normalizeOptionalImageUrl(profileImageUrl);
      await updateProfile({
        full_name: fullName,
        phone,
        profile_image_url: normalizedProfileImageUrl || "",
      });
      setMessageType("success");
      setMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to update profile",
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

  const profilePreviewUrl = getImagePreviewUrl(profileImageUrl);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("home")}
          className="mb-8 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Edit2 size={18} />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-lg border p-4 ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              }`}
            >
              <p
                className={`font-medium ${
                  messageType === "success"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {!isOnline && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                {offlineMessage}
              </p>
            </div>
          )}

          <div className="mb-8 flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
              {isOnline && profilePreviewUrl ? (
                <img
                  src={profilePreviewUrl}
                  alt={fullName || "Profile picture"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500 dark:text-gray-300">
                  {(fullName || session?.user.email || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This name and phone are synced to your profile data, and your name is also stored in auth metadata so it follows your account after login.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={session?.user.email || ""}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                placeholder="+250..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Status
              </label>
              <input
                type="text"
                value={userProfile?.is_active ? "Active" : "Inactive"}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Image URL
              </label>
              <input
                type="text"
                value={profileImageUrl}
                onChange={(event) => setProfileImageUrl(event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                placeholder="https://example.com/profile.jpg"
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Paste an image link if you want a profile picture.
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || !isOnline}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Discard
              </button>
            </div>
          )}

          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Other Options
            </h2>
            <button
              onClick={() => onNavigate("reviews")}
              className="mb-2 block w-full rounded-lg px-4 py-3 text-left font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              Write a Review
            </button>
            <button
              onClick={handleLogout}
              className="block w-full rounded-lg px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
