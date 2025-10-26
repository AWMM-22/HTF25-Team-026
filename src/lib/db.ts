import { supabase } from './supabaseClient';

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  ward: string | null;
  lat: number | null;
  lng: number | null;
  media: string[] | null;
  created_by: string;
  created_at: string;
  completed_image?: string | null;
  // workflow fields (optional)
  accepted_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  user_satisfied?: boolean | null;
  user_feedback?: string | null;
};

export async function createIssue(payload: Omit<Issue, 'id'|'created_at'>) {
  const { data, error } = await supabase
    .from('issues')
    .insert({ ...payload })
    .select('*')
    .single();
  if (error) throw error;
  return data as Issue;
}

export async function listIssues() {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as Issue[];
}

export async function getIssueById(id: string) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Issue;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(row: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateIssue(id: string, patch: Partial<Issue>) {
  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Issue;
}

export async function adminUpdateIssue(id: string, patch: Partial<Issue>) {
  const { data, error } = await supabase.rpc('admin_update_issue', {
    p_id: id,
    p_patch: patch as any,
  });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as Issue;
}

// Community interactions (tables are optional; these calls will throw if absent)
export type IssueComment = {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export async function upvoteIssue(issueId: string, userId: string) {
  const { error } = await supabase.from('issue_votes').insert({ issue_id: issueId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function listIssueComments(issueId: string) {
  const { data, error } = await supabase
    .from('issue_comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as IssueComment[];
}

export async function addIssueComment(issueId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('issue_comments')
    .insert({ issue_id: issueId, user_id: userId, content })
    .select('*')
    .single();
  if (error) throw error;
  return data as IssueComment;
}
