import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  getFriendlyErrorMessage,
  offlineMessage,
} from '../../lib/errorHandling';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Star, Check, X, AlertCircle } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  product_name?: string;
  user_name?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    fetchReviews();
  }, [filter, isOnline]);

  const fetchReviews = async () => {
    if (!isOnline) {
      setError(offlineMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          products:product_id (name)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filter === 'pending') {
        query = query.eq('is_approved', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Extract unique user IDs to fetch their profiles
      const userIds = [...new Set((data || []).map((review: any) => review.user_id))].filter(Boolean);
      let userProfilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (!profilesError && profiles) {
          userProfilesData = profiles;
        }
      }

      const userProfilesMap = Object.fromEntries(
        userProfilesData.map((p: any) => [p.id, p.full_name])
      );

      const formattedReviews = (data || []).map((review: any) => ({
        id: review.id,
        product_id: review.product_id,
        user_id: review.user_id,
        rating: review.rating,
        comment: review.comment,
        is_approved: review.is_approved,
        created_at: review.created_at,
        product_name: review.products?.name || 'Unknown Product',
        user_name: userProfilesMap[review.user_id] || 'Anonymous',
      }));

      setReviews(formattedReviews);
      setError('');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to load reviews.'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    if (!isOnline) {
      setError(offlineMessage);
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;
      setMessage('Review approved successfully');
      fetchReviews();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to approve review.'));
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Are you sure you want to reject this review?')) return;
    if (!isOnline) {
      setError(offlineMessage);
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      setMessage('Review rejected and deleted');
      fetchReviews();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to reject review.'));
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Reviews</h1>
        <div className="flex gap-2">
          {(['all', 'approved', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                filter === f
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All Reviews' : f === 'approved' ? 'Approved' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{review.product_name}</h3>
                    {!review.is_approved && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {review.user_name} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({review.rating}/5)
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                </div>
                {!review.is_approved && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






