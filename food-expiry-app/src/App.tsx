import { useState } from 'react';
import type { FoodItem, FoodItemInput } from './types';
import { useFoodItems } from './hooks/useFoodItems';
import { FoodForm } from './components/FoodForm';
import { FoodList } from './components/FoodList';
import { NotificationBanner } from './components/NotificationBanner';
import './App.css';

function App() {
  const { items, loading, addItem, updateItem, deleteItem, getExpiringItems } =
    useFoodItems();
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 7日以内に期限が来る食品を取得
  const expiringItems = getExpiringItems(7);

  const handleAdd = (data: FoodItemInput) => {
    addItem(data);
    setShowForm(false);
  };

  const handleUpdate = (data: FoodItemInput) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      setEditingItem(null);
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">読み込み中...</div>
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
        {/* 通知バナー */}
        <NotificationBanner expiringItems={expiringItems} days={7} />

        {/* 食品リスト */}
        <section className="section">
          <div className="section-header">
            <h2>登録済み食品（{items.length}件）</h2>
          </div>
          <FoodList items={items} onEdit={handleEdit} onDelete={deleteItem} />
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
