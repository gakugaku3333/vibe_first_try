import type { FoodItem } from '../types';

interface NotificationBannerProps {
  /** 期限が近い食品のリスト */
  expiringItems: FoodItem[];
  /** 何日以内の食品を表示するか */
  days: number;
}

/**
 * 期限が近い食品を通知するバナーコンポーネント
 */
export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  expiringItems,
  days,
}) => {
  if (expiringItems.length === 0) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-icon">⚠️</div>
      <div className="notification-content">
        <h3>期限が近い食品があります</h3>
        <p>
          {days}日以内に期限が来る食品が <strong>{expiringItems.length}件</strong> あります
        </p>
        <ul className="notification-items">
          {expiringItems.slice(0, 3).map((item) => (
            <li key={item.id}>
              {item.name}（{item.expiryDate}）
            </li>
          ))}
          {expiringItems.length > 3 && (
            <li className="more-items">他 {expiringItems.length - 3}件</li>
          )}
        </ul>
      </div>
    </div>
  );
};
