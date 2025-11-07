import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { FoodItem, FoodItemInput } from './types';
import { auth } from './lib/firebase';
import { useFoodItemsFirestore } from './hooks/useFoodItemsFirestore';
import { Auth } from './components/Auth';
import { GroupSettings } from './components/GroupSettings';
import { FoodForm } from './components/FoodForm';
import { FoodList } from './components/FoodList';
import { NotificationBanner } from './components/NotificationBanner';
import './App.css';

const GROUP_ID_KEY = 'food-app-group-id';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groupId, setGroupId] = useState<string>(() => {
    return localStorage.getItem(GROUP_ID_KEY) || 'default';
  });

  const { items, loading, addItem, updateItem, deleteItem, getExpiringItems } =
    useFoodItemsFirestore(user, groupId);

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // グループIDの保存
  const handleGroupIdChange = (newGroupId: string) => {
    setGroupId(newGroupId);
    localStorage.setItem(GROUP_ID_KEY, newGroupId);
  };

  // 7日以内に期限が来る食品を取得
  const expiringItems = getExpiringItems(7);

  const handleAdd = async (data: FoodItemInput) => {
    try {
      await addItem(data);
      setShowForm(false);
    } catch (error) {
      console.error('追加エラー:', error);
      alert('食品の追加に失敗しました');
    }
  };

  const handleUpdate = async (data: FoodItemInput) => {
    if (editingItem) {
      try {
        await updateItem(editingItem.id, data);
        setEditingItem(null);
      } catch (error) {
        console.error('更新エラー:', error);
        alert('食品の更新に失敗しました');
      }
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('削除エラー:', error);
      alert('食品の削除に失敗しました');
    }
  };

  // 認証読み込み中
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">初期化中...</div>
      </div>
    );
  }

  // ログインしていない場合
  if (!user) {
    return (
      <div className="app">
        <Auth user={user} onAuthChange={setUser} />
      </div>
    );
  }

  // データ読み込み中
  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🍱 食品期限管理</h1>
          <p className="app-subtitle">賞味期限・消費期限をかんたん管理</p>
        </header>
        <div className="loading">データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍱 食品期限管理</h1>
        <p className="app-subtitle">賞味期限・消費期限をかんたん管理</p>
      </header>

      <main className="app-main">
        {/* 認証情報とグループ設定 */}
        <section className="section">
          <Auth user={user} onAuthChange={setUser} />
          <GroupSettings groupId={groupId} onGroupIdChange={handleGroupIdChange} />
        </section>

        {/* 通知バナー */}
        <NotificationBanner expiringItems={expiringItems} days={7} />

        {/* 食品リスト */}
        <section className="section">
          <div className="section-header">
            <h2>登録済み食品（{items.length}件）</h2>
          </div>
          <FoodList items={items} onEdit={handleEdit} onDelete={handleDelete} />
        </section>

        {/* 食品登録・編集フォーム */}
        <section className="section">
          {editingItem ? (
            <>
              <div className="section-header">
                <h2>食品を編集</h2>
              </div>
              <FoodForm
                initialData={editingItem}
                onSubmit={handleUpdate}
                onCancel={handleCancelEdit}
                submitLabel="更新"
              />
            </>
          ) : showForm ? (
            <>
              <div className="section-header">
                <h2>新しい食品を登録</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  閉じる
                </button>
              </div>
              <FoodForm onSubmit={handleAdd} submitLabel="登録" />
            </>
          ) : (
            <button
              className="btn btn-primary btn-large"
              onClick={() => setShowForm(true)}
            >
              ＋ 新しい食品を登録
            </button>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2024 食品期限管理アプリ</p>
      </footer>
    </div>
  );
}

export default App;
