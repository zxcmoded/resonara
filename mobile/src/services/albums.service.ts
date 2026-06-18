import { supabase } from '@/lib/supabase';
import type { Album, Track, TrackWithAlbum } from '@/types/database';

// ── Storage helpers ─────────────────────────────────────────────────────────

async function uploadFile(
  bucket: string,
  path: string,
  uri: string,
  contentType: string
): Promise<string> {
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Albums ───────────────────────────────────────────────────────────────────

export const AlbumsService = {
  /** Fetch all albums, ordered by most recent */
  async getAll(): Promise<Album[]> {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Fetch albums uploaded by a specific user */
  async getByUser(userId: string): Promise<Album[]> {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Fetch a single album with all its tracks */
  async getWithTracks(albumId: string): Promise<{ album: Album; tracks: Track[] } | null> {
    const { data: album } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .single();

    if (!album) return null;

    const { data: tracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('album_id', albumId)
      .order('track_number', { ascending: true });

    return { album, tracks: tracks ?? [] };
  },

  /**
   * Create an album record. Optionally upload cover art.
   * artworkUri: local file URI from expo-image-picker
   */
  async create(
    userId: string,
    meta: { title: string; artist: string; releaseYear?: number },
    artworkUri?: string
  ): Promise<Album> {
    let artworkUrl: string | null = null;

    if (artworkUri) {
      const ext = artworkUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const ct = ext === 'png' ? 'image/png' : 'image/jpeg';
      artworkUrl = await uploadFile('album-art', `${userId}/${Date.now()}.${ext}`, artworkUri, ct);
    }

    const { data, error } = await supabase
      .from('albums')
      .insert({
        title: meta.title,
        artist: meta.artist,
        release_year: meta.releaseYear ?? null,
        artwork_url: artworkUrl,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(albumId: string, patch: Partial<Pick<Album, 'title' | 'artist' | 'artwork_url' | 'release_year'>>) {
    const { error } = await supabase.from('albums').update(patch).eq('id', albumId);
    if (error) throw error;
  },

  async delete(albumId: string) {
    const { error } = await supabase.from('albums').delete().eq('id', albumId);
    if (error) throw error;
  },

  /** Upload cover art and save the URL to an existing album */
  async uploadArtwork(userId: string, albumId: string, artworkUri: string): Promise<string> {
    const ext = artworkUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const ct = ext === 'png' ? 'image/png' : 'image/jpeg';
    const url = await uploadFile('album-art', `${userId}/${albumId}.${ext}`, artworkUri, ct);
    await supabase.from('albums').update({ artwork_url: url }).eq('id', albumId);
    return url;
  },
};

// ── Tracks (audio) ───────────────────────────────────────────────────────────

export const TracksAudioService = {
  /**
   * Upload an audio file and create a track record.
   * audioUri: local file URI (from expo-document-picker or expo-image-picker video/audio)
   */
  async uploadTrack(
    userId: string,
    albumId: string,
    meta: { title: string; artist: string; trackNumber?: number; durationMs?: number },
    audioUri: string
  ): Promise<Track> {
    // Determine content type from extension
    const lower = audioUri.toLowerCase();
    const contentType = lower.endsWith('.m4a')
      ? 'audio/mp4'
      : lower.endsWith('.aac')
      ? 'audio/aac'
      : lower.endsWith('.wav')
      ? 'audio/wav'
      : 'audio/mpeg'; // default: mp3

    const ext = audioUri.split('.').pop()?.toLowerCase() ?? 'mp3';
    const storagePath = `${userId}/${albumId}/${Date.now()}.${ext}`;
    const audioUrl = await uploadFile('songs', storagePath, audioUri, contentType);

    const { data, error } = await supabase
      .from('tracks')
      .insert({
        title: meta.title,
        artist: meta.artist,
        album_id: albumId,
        audio_url: audioUrl,
        duration_ms: meta.durationMs ?? null,
        track_number: meta.trackNumber ?? null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Fetch all tracks in an album, joined with album info */
  async getAlbumTracks(albumId: string): Promise<TrackWithAlbum[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, albums(*)')
      .eq('album_id', albumId)
      .order('track_number', { ascending: true });
    if (error) throw error;
    return (data ?? []) as TrackWithAlbum[];
  },

  async delete(trackId: string) {
    const { error } = await supabase.from('tracks').delete().eq('id', trackId);
    if (error) throw error;
  },
};
