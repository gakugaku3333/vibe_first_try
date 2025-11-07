import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

/**
 * 認証コンポーネント
 */
export const Auth: React.FC<AuthProps> = ({ user, onAuthChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuthChange(result.user);
    } catch (err: unknown) {
      console.error('ログインエラー:', err);
      if (err instanceof Error) {
        setError(`ログインに失敗しました: ${err.message}`);
      } else {
        setError('ログインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      onAuthChange(null);
    } catch (err: unknown) {
      console.error('ログアウトエラー:', err);
      if (err instanceof Error) {
        setError(`ログアウトに失敗しました: ${err.message}`);
      } else {
        setError('ログアウトに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="user-info">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'ユーザー'}
              className="user-avatar"
            />
          )}
          <div className="user-details">
            <p className="user-name">{user.displayName}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-logout"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? 'ログアウト中...' : 'ログアウト'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-container login-container">
      <div className="login-card">
        <h2>🍱 食品期限管理</h2>
        <p className="login-description">
          ログインして、家族や友人と食品リストを共有しましょう
        </p>
        <button
          className="btn btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'ログイン中...' : '🔐 Googleでログイン'}
        </button>
        {error && <p className="error-message">{error}</p>}
        <p className="login-hint">
          ※ ログインすると、複数のデバイスでデータを共有できます
        </p>
      </div>
    </div>
  );
};
