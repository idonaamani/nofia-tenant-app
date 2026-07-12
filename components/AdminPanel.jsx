import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const emptyForm = { villaNumber: '', tenantName: '', idNumbers: '', phone: '', email: '' };

// id_numbers is stored as a Postgres text[] (a villa usually has 2 owners); the admin
// panel edits it as one comma-separated string for simplicity.
const idNumbersToArray = (value) => value.split(',').map((v) => v.trim()).filter(Boolean);

export default function AdminPanel() {
  if (!isSupabaseConfigured) {
    return (
      <div className="admin-shell">
        <div className="warning-alert-banner">
          <span>⚠</span> פאנל הניהול דורש הגדרת Supabase — ראו SETUP_SUPABASE.md.
        </div>
      </div>
    );
  }

  return <AdminPanelInner />;
}

function AdminPanelInner() {
  const [status, setStatus] = useState('checking'); // checking | logged_out | logged_in | forbidden
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [villas, setVillas] = useState([]);
  const [listError, setListError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus('logged_out');
      return;
    }
    await verifyAdminAndLoad(session.user.id);
  };

  const verifyAdminAndLoad = async (userId) => {
    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!adminRow) {
      await supabase.auth.signOut();
      setStatus('forbidden');
      return;
    }
    setStatus('logged_in');
    loadVillas();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoginError('מייל או סיסמה שגויים.');
      return;
    }
    await verifyAdminAndLoad(data.user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatus('logged_out');
    setVillas([]);
  };

  const loadVillas = async () => {
    const { data, error } = await supabase
      .from('villas')
      .select('id, villa_number, tenant_name, id_numbers, phone, email, needs_password_setup, submitted_at')
      .order('villa_number');
    if (error) {
      setListError('שגיאה בטעינת רשימת הוילות.');
      return;
    }
    setListError('');
    setVillas(data ?? []);
  };

  const handleAddVilla = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('villas').insert({
      villa_number: Number(addForm.villaNumber),
      tenant_name: addForm.tenantName,
      id_numbers: idNumbersToArray(addForm.idNumbers),
      phone: addForm.phone || null,
      email: addForm.email || null,
    });
    if (error) {
      setActionMessage(`שגיאה בהוספת וילה: ${error.message}`);
      return;
    }
    setAddForm(emptyForm);
    setShowAddForm(false);
    setActionMessage('');
    loadVillas();
  };

  const startEdit = (villa) => {
    setEditingId(villa.id);
    setEditForm({
      villaNumber: String(villa.villa_number),
      tenantName: villa.tenant_name,
      idNumbers: (villa.id_numbers ?? []).join(', '),
      phone: villa.phone ?? '',
      email: villa.email ?? '',
    });
  };

  const handleSaveEdit = async (villaId) => {
    const { error } = await supabase
      .from('villas')
      .update({
        tenant_name: editForm.tenantName,
        id_numbers: idNumbersToArray(editForm.idNumbers),
        phone: editForm.phone || null,
        email: editForm.email || null,
      })
      .eq('id', villaId);
    if (error) {
      setActionMessage(`שגיאה בשמירה: ${error.message}`);
      return;
    }
    setEditingId(null);
    setActionMessage('');
    loadVillas();
  };

  const handleDelete = async (villaId, villaNumber) => {
    if (!window.confirm(`למחוק את וילה ${villaNumber}? הפעולה אינה הפיכה.`)) return;
    const { error } = await supabase.functions.invoke('admin-delete-villa', { body: { villaId } });
    if (error) {
      setActionMessage('שגיאה במחיקת הוילה.');
      return;
    }
    setActionMessage('');
    loadVillas();
  };

  const handleResetPassword = async (villaNumber) => {
    const { error } = await supabase.functions.invoke('admin-reset-password', { body: { villaNumber } });
    if (error) {
      setActionMessage('שגיאה באיפוס הסיסמה.');
      return;
    }
    setActionMessage(`הסיסמה של וילה ${villaNumber} אופסה — הדייר יידרש לאמת ת.ז ולבחור סיסמה חדשה.`);
    loadVillas();
  };

  if (status === 'checking') {
    return <div className="admin-shell"><p>טוען...</p></div>;
  }

  if (status === 'logged_out' || status === 'forbidden') {
    return (
      <div className="admin-shell">
        <div className="floating-card" style={{ maxWidth: '420px', margin: '4rem auto' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
            כניסת צוות ניהול
          </h3>
          {status === 'forbidden' && (
            <div className="warning-alert-banner" style={{ marginBottom: '1.25rem' }}>
              <span>⚠</span> חשבון זה אינו מוגדר כמנהל.
            </div>
          )}
          {loginError && (
            <div className="warning-alert-banner" style={{ marginBottom: '1.25rem' }}>
              <span>⚠</span> {loginError}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="adminEmail">מייל</label>
              <input type="email" id="adminEmail" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="adminPassword">סיסמה</label>
              <input type="password" id="adminPassword" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>כניסה</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h2>ניהול וילות — נופיה אלפי מנשה</h2>
        <button type="button" className="btn btn-secondary" onClick={handleSignOut}>יציאה</button>
      </div>

      {actionMessage && <div className="highlight-box green" style={{ marginBottom: '1.5rem' }}>{actionMessage}</div>}
      {listError && <div className="warning-alert-banner" style={{ marginBottom: '1.5rem' }}><span>⚠</span> {listError}</div>}

      <button type="button" className="btn btn-accent" style={{ marginBottom: '1.5rem' }} onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'ביטול' : '+ הוספת וילה'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddVilla} className="admin-inline-form">
          <input type="number" className="form-control" placeholder="מספר וילה" value={addForm.villaNumber} onChange={(e) => setAddForm({ ...addForm, villaNumber: e.target.value })} required />
          <input type="text" className="form-control" placeholder="שם הדייר (או שני הדיירים)" value={addForm.tenantName} onChange={(e) => setAddForm({ ...addForm, tenantName: e.target.value })} required />
          <input type="text" className="form-control" placeholder="ת.ז — אפשר כמה, מופרדות בפסיק" value={addForm.idNumbers} onChange={(e) => setAddForm({ ...addForm, idNumbers: e.target.value })} required />
          <input type="text" className="form-control" placeholder="טלפון" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
          <input type="email" className="form-control" placeholder="מייל" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
          <button type="submit" className="btn btn-primary">הוספה</button>
        </form>
      )}

      <div className="summary-table-container">
        <table className="summary-table">
          <thead>
            <tr>
              <th>וילה</th>
              <th>שם דייר</th>
              <th>ת.ז</th>
              <th>טלפון</th>
              <th>מייל</th>
              <th>סטטוס סיסמה</th>
              <th>הוגש</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {villas.map((villa) => (
              <tr key={villa.id}>
                <td>{villa.villa_number}</td>
                {editingId === villa.id ? (
                  <>
                    <td><input type="text" className="form-control" value={editForm.tenantName} onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })} /></td>
                    <td><input type="text" className="form-control" value={editForm.idNumbers} onChange={(e) => setEditForm({ ...editForm, idNumbers: e.target.value })} /></td>
                    <td><input type="text" className="form-control" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></td>
                    <td><input type="email" className="form-control" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                  </>
                ) : (
                  <>
                    <td>{villa.tenant_name}</td>
                    <td>{(villa.id_numbers ?? []).join(', ')}</td>
                    <td>{villa.phone}</td>
                    <td>{villa.email}</td>
                  </>
                )}
                <td>{villa.needs_password_setup ? 'ממתין להגדרה ראשונית' : 'הוגדרה'}</td>
                <td>{villa.submitted_at ? new Date(villa.submitted_at).toLocaleDateString('he-IL') : 'טרם'}</td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {editingId === villa.id ? (
                    <>
                      <button type="button" className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleSaveEdit(villa.id)}>שמירה</button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setEditingId(null)}>ביטול</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => startEdit(villa)}>עריכה</button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleResetPassword(villa.villa_number)}>איפוס סיסמה</button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--red-text)' }} onClick={() => handleDelete(villa.id, villa.villa_number)}>מחיקה</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
