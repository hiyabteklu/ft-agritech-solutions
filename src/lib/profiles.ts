import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** Keep public.profiles in sync when a user is signed in. Safe to call often. */
export async function upsertProfile(user: User | null | undefined): Promise<void> {
  if (!user?.id || !user.email) return;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: avatarUrl,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    // Table may not exist yet until SQL migration is run — fail quietly
    console.warn('[profiles] upsert failed:', error.message);
  }
}

export type AdminActionInput = {
  adminEmail: string;
  adminId?: string | null;
  actionType: string;
  targetTable?: string;
  targetId?: string | number;
  summary: string;
  details?: Record<string, unknown>;
};

/** Record an admin dashboard action for the History tab. */
export async function logAdminAction(input: AdminActionInput): Promise<void> {
  const { error } = await supabase.from('admin_actions').insert({
    admin_email: input.adminEmail,
    admin_id: input.adminId || null,
    action_type: input.actionType,
    target_table: input.targetTable || null,
    target_id: input.targetId != null ? String(input.targetId) : null,
    summary: input.summary,
    details: input.details || {},
  });

  if (error) {
    console.warn('[admin_actions] log failed:', error.message);
  }
}
