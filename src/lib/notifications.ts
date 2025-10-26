import { supabase } from './supabaseClient';

export type NotificationEvent =
  | 'issue_registered'
  | 'issue_accepted'
  | 'issue_in_progress'
  | 'issue_resolved_with_photo'
  | 'issue_closed'
  | 'user_feedback';

export async function notify(event: NotificationEvent, payload: Record<string, any>) {
  try {
    const { data, error } = await supabase.functions.invoke('notify', {
      body: { event, payload },
    });
    if (error) {
      console.warn('notify failed', error, data);
      throw error;
    }
    if (data !== undefined) {
      console.log('notify result', data);
    }
    return data as any;
  } catch (e) {
    console.warn('notify failed', e);
    throw e;
  }
}
