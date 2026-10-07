import { createClient } from '@supabase/supabase-js';
import { requireUser } from './_auth.js';

const supabase = () => createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const db = supabase();
  const { resource, id, paciente_id } = req.query;

  // PACIENTES
  if (resource === 'pacientes') {
    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await db.from('pacientes').select('*').eq('id', id).single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }
      const { data, error } = await db.from('pacientes').select('*').order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { data, error } = await db.from('pacientes').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'PATCH') {
      const { data, error } = await db.from('pacientes').update({ ...req.body, updated_at: new Date() }).eq('id', id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await db.from('pacientes').delete().eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ success: true });
    }
  }

  // PRODUTOS
  if (resource === 'produtos') {
    if (req.method === 'GET') {
      const { data, error } = await db.from('produtos').select('*').eq('ativo', true).order('cat');
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { data, error } = await db.from('produtos').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'PATCH') {
      const { data, error } = await db.from('produtos').update(req.body).eq('id', id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { data, error } = await db.from('produtos').update({ ativo: false }).eq('id', id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  // SUB-RECURSOS
  const subResources = ['tratamentos', 'prontuarios', 'propostas', 'observacoes'];
  if (subResources.includes(resource)) {
    if (req.method === 'GET') {
      const { data, error } = await db.from(resource).select('*')
        .eq('paciente_id', paciente_id)
        .order('data', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { data, error } = await db.from(resource).insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'PATCH') {
      const { data, error } = await db.from(resource).update(req.body).eq('id', id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { error } = await db.from(resource).delete().eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ success: true });
    }
  }

  res.status(404).json({ error: 'Resource not found' });
}
