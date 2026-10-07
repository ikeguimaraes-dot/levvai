import { requireUser } from './_auth.js';
import { ADMIN_MASTER_EMAILS } from '../shared/auth-config.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res, { admin: true });
  if (!user) return;
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'User administration is not configured' });
  }
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const safeUser = (u, member) => ({
    id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
    user_metadata: u.user_metadata, managed_auth: member.managed_auth,
  });

  try {
    if (req.method === 'GET') {
      const { data: members, error } = await supabase.from('levvai_members').select('user_id, managed_auth');
      if (error) throw error;
      const users = await Promise.all(members.map(async member => {
        const { data, error: authError } = await supabase.auth.admin.getUserById(member.user_id);
        if (authError) throw authError;
        return safeUser(data.user, member);
      }));
      return res.status(200).json({ users });
    }

    const body = req.body || {};
    if (req.method === 'POST') {
      const { email, password, nome, cargo } = body;
      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { nome, cargo },
      });
      if (error) return res.status(400).json({ error: error.message });
      const { error: memberError } = await supabase.from('levvai_members').insert({ user_id: data.user.id, managed_auth: true });
      if (memberError) {
        // Fail closed: an Auth account alone never grants portal access.
        return res.status(503).json({ error: 'Conta criada, mas sem acesso ao Levvai. Solicite ao responsável a conclusão do vínculo.' });
      }
      return res.status(200).json({ user: safeUser(data.user, { managed_auth: true }) });
    }

    const { userId } = body;
    if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const { data: member, error: memberError } = await supabase.from('levvai_members')
      .select('user_id, managed_auth').eq('user_id', userId).maybeSingle();
    if (memberError) throw memberError;
    if (!member) return res.status(404).json({ error: 'Usuário não pertence ao Levvai.' });
    const { data: target, error: targetError } = await supabase.auth.admin.getUserById(userId);
    if (targetError) throw targetError;

    if (req.method === 'PATCH') {
      if (!member.managed_auth) {
        return res.status(409).json({ error: 'Conta compartilhada com o hos-alter. Altere o perfil e as credenciais pelo responsável do projeto.' });
      }
      const { nome, cargo, password, email, foto } = body;
      const metadata = { ...target.user.user_metadata };
      for (const [key, value] of Object.entries({ nome, cargo, foto })) {
        if (value !== undefined) metadata[key] = value;
      }
      const updates = { user_metadata: metadata };
      if (password) updates.password = password;
      if (email) updates.email = email;
      const { data, error } = await supabase.auth.admin.updateUserById(userId, updates);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ user: safeUser(data.user, member) });
    }

    if (userId === user.id || ADMIN_MASTER_EMAILS.includes(target.user.email?.toLowerCase())) {
      return res.status(409).json({ error: 'Não é permitido remover o acesso de administradores por este painel.' });
    }
    // Revoke only Levvai membership; never delete a shared project's Auth user.
    const { error } = await supabase.from('levvai_members').delete().eq('user_id', userId);
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch {
    return res.status(503).json({ error: 'User administration temporarily unavailable' });
  }
}
