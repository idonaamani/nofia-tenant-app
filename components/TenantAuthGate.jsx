import { useState } from 'react';
import { supabase, villaEmail } from '../lib/supabaseClient';

const ERROR_MESSAGES = {
  invalid_credentials: 'מספר וילה או תעודת זהות שגויים.',
  locked_out: 'יותר מדי ניסיונות שגויים. נא לנסות שוב בעוד 15 דקות, או לפנות לחברת הניהול.',
  password_too_short: 'הסיסמה חייבת להכיל לפחות 6 תווים.',
  already_set_up: 'כבר הוגדרה סיסמה לוילה זו — יש להתחבר עם הסיסמה למטה.',
  passwords_dont_match: 'הסיסמאות שהוזנו אינן תואמות.',
  generic: 'משהו השתבש. נא לנסות שוב, ואם זה חוזר — לפנות לחברת הניהול.',
};

// Real (villa number + password) tenant login, backed by Supabase Auth via a synthetic
// per-villa email. Falls back to nothing here — App.jsx only renders this component
// once isSupabaseConfigured is true; otherwise it keeps the old plain villa+name form.
export default function TenantAuthGate({ onSuccess }) {
  const [mode, setMode] = useState('password'); // 'password' | 'verify_id' | 'set_password'
  const [villaNumber, setVillaNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const callFunction = async (name, body) => {
    const { data, error: fnError } = await supabase.functions.invoke(name, { body });
    if (fnError) throw fnError;
    return data;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsBusy(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: villaEmail(villaNumber),
        password,
      });
      if (signInError) {
        setError(ERROR_MESSAGES.invalid_credentials);
        return;
      }
      await completeLogin(data.user.id);
    } catch {
      setError(ERROR_MESSAGES.generic);
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyId = async (e) => {
    e.preventDefault();
    setError('');
    setIsBusy(true);
    try {
      const data = await callFunction('tenant-verify-id', { villaNumber, idNumber });
      if (data.error) {
        setError(ERROR_MESSAGES[data.error] ?? ERROR_MESSAGES.generic);
        return;
      }
      if (data.status === 'already_set_up') {
        setError(ERROR_MESSAGES.already_set_up);
        setMode('password');
        return;
      }
      setMode('set_password');
    } catch {
      setError(ERROR_MESSAGES.generic);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(ERROR_MESSAGES.passwords_dont_match);
      return;
    }
    setIsBusy(true);
    try {
      const data = await callFunction('tenant-set-password', { villaNumber, idNumber, newPassword });
      if (data.error) {
        setError(ERROR_MESSAGES[data.error] ?? ERROR_MESSAGES.generic);
        return;
      }
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: villaEmail(villaNumber),
        password: newPassword,
      });
      if (signInError) {
        setError(ERROR_MESSAGES.generic);
        return;
      }
      await completeLogin(signInData.user.id);
    } catch {
      setError(ERROR_MESSAGES.generic);
    } finally {
      setIsBusy(false);
    }
  };

  const completeLogin = async (authUserId) => {
    const { data: villa } = await supabase
      .from('villas')
      .select('villa_number, tenant_name')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    onSuccess({
      villaNumber: String(villa?.villa_number ?? villaNumber),
      tenantName: villa?.tenant_name ?? '',
    });
  };

  return (
    <>
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
        שינויי דיירים — שלב ב'
      </h3>

      {error && (
        <div className="warning-alert-banner" style={{ marginBottom: '1.25rem' }}>
          <span>⚠</span> {error}
        </div>
      )}

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin}>
          <div className="form-group">
            <label htmlFor="villaNum">מספר וילה</label>
            <input
              type="text" id="villaNum" className="form-control"
              placeholder="לדוגמה: 14 (טווח 1-24)"
              value={villaNumber} onChange={(e) => setVillaNumber(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password" id="password" className="form-control"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isBusy}>
            {isBusy ? 'מתחבר...' : 'כניסה למערכת'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => { setError(''); setMode('verify_id'); }}
          >
            כניסה ראשונה למערכת / שכחתי סיסמה
          </button>
        </form>
      )}

      {mode === 'verify_id' && (
        <form onSubmit={handleVerifyId}>
          <div className="form-group">
            <label htmlFor="villaNum2">מספר וילה</label>
            <input
              type="text" id="villaNum2" className="form-control"
              placeholder="לדוגמה: 14 (טווח 1-24)"
              value={villaNumber} onChange={(e) => setVillaNumber(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="idNumber">תעודת זהות</label>
            <input
              type="text" id="idNumber" className="form-control"
              placeholder="כפי שנמסרה לחברת הניהול"
              value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isBusy}>
            {isBusy ? 'בודק...' : 'המשך'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => { setError(''); setMode('password'); }}
          >
            חזרה לכניסה עם סיסמה
          </button>
        </form>
      )}

      {mode === 'set_password' && (
        <form onSubmit={handleSetPassword}>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
            הזהות אומתה בהצלחה. נא לבחור סיסמה אישית לכניסות הבאות למערכת.
          </p>
          <div className="form-group">
            <label htmlFor="newPassword">סיסמה חדשה</label>
            <input
              type="password" id="newPassword" className="form-control"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">אימות סיסמה</label>
            <input
              type="password" id="confirmPassword" className="form-control"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isBusy}>
            {isBusy ? 'שומר...' : 'שמירה וכניסה'}
          </button>
        </form>
      )}
    </>
  );
}
