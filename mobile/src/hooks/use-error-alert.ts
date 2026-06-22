import { Alert } from 'react-native';

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

/**
 * Provides a consistent, user-facing error dialog.
 *
 * Usage:
 *   const { handleError } = useErrorAlert();
 *   try { await someService() } catch (e) { handleError(e) }
 */
export function useErrorAlert() {
  function showError(message: string, title = 'Something went wrong') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  function handleError(error: unknown, fallback = 'An unexpected error occurred. Please try again.') {
    const message = extractMessage(error, fallback);
    console.error('[Resonara error]', message, error);
    showError(message);
  }

  return { showError, handleError };
}
