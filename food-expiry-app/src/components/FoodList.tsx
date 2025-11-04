import type { FoodItem } from '../types';
import { FoodListItem } from './FoodListItem';

interface FoodListProps {
  /** 食品データの配列 */
  items: FoodItem[];
  /** 編集ボタンクリック時のコールバック */
  onEdit: (item: FoodItem) => void;
  /** 削除ボタンクリック時のコールバック */
  onDelete: (id: string) => void;
}

/**
 * 食品リストを表示するコンポーネント
 */
export const FoodList: React.FC<FoodListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>登録された食品がありません</p>
        <p className="empty-state-hint">下のフォームから食品を登録してください</p>
      </div>
    );
  }

  return (
    <div className="food-list">
      {items.map((item) => (
        <FoodListItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
