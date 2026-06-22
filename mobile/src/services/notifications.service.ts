import { supabase } from '@/lib/supabase';

interface PushPayload {
  expoPushToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const NotificationsService = {
  /**
   * Send an Expo push notification via the Supabase Edge Function.
   * The Edge Function keeps the Expo Push API call server-side.
   */
  async send(payload: PushPayload): Promise<void> {
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: payload,
    });

    if (error) throw new Error(error.message);
  },

  /** Convenience helper for a "Now Listening" session-start notification */
  async notifySessionStart(params: {
    recipientToken: string;
    hostName: string;
    trackTitle: string;
    sessionId: string;
  }) {
    await NotificationsService.send({
      expoPushToken: params.recipientToken,
      title: `${params.hostName} is listening`,
      body: params.trackTitle,
      data: { sessionId: params.sessionId, type: 'session_start' },
    });
  },

  /** Notify a user that someone commented on their session */
  async notifyComment(params: {
    recipientToken: string;
    commenterName: string;
    comment: string;
    sessionId: string;
  }) {
    await NotificationsService.send({
      expoPushToken: params.recipientToken,
      title: `${params.commenterName} commented`,
      body: params.comment,
      data: { sessionId: params.sessionId, type: 'comment' },
    });
  },

  /** Notify a user they have a new follower */
  async notifyNewFollow(params: {
    recipientToken: string;
    followerName: string;
    followerId: string;
  }) {
    await NotificationsService.send({
      expoPushToken: params.recipientToken,
      title: 'New follower',
      body: `${params.followerName} started following you`,
      data: { followerId: params.followerId, type: 'follow' },
    });
  },
};
