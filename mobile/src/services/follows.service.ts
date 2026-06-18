import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export const FollowsService = {
  async follow(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw error;
  },

  async unfollow(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return (count ?? 0) > 0;
  },

  async getFollowers(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);
    if (error) throw error;
    return (data?.map((r: any) => r.profiles) ?? []) as Profile[];
  },

  async getFollowing(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);
    if (error) throw error;
    return (data?.map((r: any) => r.profiles) ?? []) as Profile[];
  },
};
