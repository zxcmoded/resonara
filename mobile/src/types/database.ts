export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['follows']['Insert']>;
      };
      albums: {
        Row: {
          id: string;
          title: string;
          artist: string;
          artwork_url: string | null;
          release_year: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          artwork_url?: string | null;
          release_year?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['albums']['Insert']>;
      };
      tracks: {
        Row: {
          id: string;
          title: string;
          artist: string;
          album_id: string | null;
          audio_url: string | null;
          artwork_url: string | null;
          duration_ms: number | null;
          track_number: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          album_id?: string | null;
          audio_url?: string | null;
          artwork_url?: string | null;
          duration_ms?: number | null;
          track_number?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          host_id: string;
          track_id: string | null;
          position_ms: number;
          is_playing: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          track_id?: string | null;
          position_ms?: number;
          is_playing?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          body: string;
          song_position_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          body: string;
          song_position_seconds: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
    };
  };
}

// Convenience row types
export type Profile  = Database['public']['Tables']['profiles']['Row'];
export type Follow   = Database['public']['Tables']['follows']['Row'];
export type Album    = Database['public']['Tables']['albums']['Row'];
export type Track    = Database['public']['Tables']['tracks']['Row'];
export type Session  = Database['public']['Tables']['sessions']['Row'];
export type Comment  = Database['public']['Tables']['comments']['Row'];

// Track joined with its album (used in library / player)
export type TrackWithAlbum = Track & { albums: Album | null };
