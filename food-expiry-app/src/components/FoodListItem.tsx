import type { FoodItem } from '../types';
import { getExpiryStatus, formatDateJa } from '../utils/dateUtils';

interface FoodListItemProps {
  /** 食品データ */
  item: FoodItem;
  /** 編集ボタンクリック時のコールバック */
  onEdit: (item: FoodItem) => void;
  /** 削除ボタンクリック時のコールバック */
  onDelete: (id: string) => void;
}

/**
 * 食品リストの1行を表示するコンポーネント
 */
export const FoodListItem: React.FC<FoodListItemProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const status = getExpiryStatus(item.expiryDate);

  const handleDelete = () => {
    if (window.confirm(`「${item.name}」を削除しますか？`)) {
      onDelete(item.id);
    }
  };

  return (
    <div className={`food-item food-item-${status.colorType}`}>
      <div className="food-item-main">
        <div className="food-item-header">
          <h3 className="food-name">{item.name}</h3>
          <span className="expiry-badge">{item.expiryType}</span>
        </div>
        <div className="food-item-details">
          <div className="expiry-info">
            <span className="expiry-date">{formatDateJa(item.expiryDate)}</span>
            <span className={`days-remaining days-${status.colorType}`}>
              {status.message}
            </span>
          </div>
          {item.memo && <p className="food-memo">{item.memo}</p>}
        </div>
      </div>
      <div className="food-item-actions">
        <button
          className="btn btn-edit"
          onClick={() => onEdit(item)}
          aria-label="編集"
        >
          編集
        </button>
        <button
          className="btn btn-delete"
          onClick={handleDelete}
          aria-label="削除"
        >
          削除
        </button>
      </div>
    </div>
  );
};
