import { useState, useEffect } from 'react';

interface GroupSettingsProps {
  groupId: string;
  onGroupIdChange: (groupId: string) => void;
}

/**
 * グループ設定コンポーネント
 */
export const GroupSettings: React.FC<GroupSettingsProps> = ({
  groupId,
  onGroupIdChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [inputValue, setInputValue] = useState(groupId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputValue(groupId);
  }, [groupId]);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onGroupIdChange(trimmed);
      setShowSettings(false);
    } else {
      alert('グループIDを入力してください');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(groupId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRandomId = () => {
    const randomId = `group-${Math.random().toString(36).substring(2, 10)}`;
    setInputValue(randomId);
  };

  if (!showSettings) {
    return (
      <div className="group-settings-compact">
        <div className="group-info">
          <span className="group-label">グループ:</span>
          <code className="group-id">{groupId}</code>
          <button
            className="btn btn-small btn-copy"
            onClick={handleCopy}
            title="グループIDをコピー"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
        <button
          className="btn btn-small btn-secondary"
          onClick={() => setShowSettings(true)}
        >
          グループ設定
        </button>
      </div>
    );
  }

  return (
    <div className="group-settings-panel">
      <h3>グループ設定</h3>
      <p className="group-description">
        同じグループIDを使うことで、家族や友人とリストを共有できます
      </p>

      <div className="form-group">
        <label htmlFor="groupId">グループID</label>
        <div className="input-with-button">
          <input
            type="text"
            id="groupId"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="例: my-family"
          />
          <button
            className="btn btn-secondary btn-small"
            onClick={generateRandomId}
            title="ランダムなIDを生成"
          >
            🎲
          </button>
        </div>
        <p className="hint">
          ※ このIDを家族や友人に共有してください
        </p>
      </div>

      <div className="group-settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          保存
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setInputValue(groupId);
            setShowSettings(false);
          }}
        >
          キャンセル
        </button>
      </div>

      <div className="group-settings-info">
        <h4>💡 使い方</h4>
        <ol>
          <li>新しいグループを作成する場合は🎲ボタンでIDを生成</li>
          <li>既存のグループに参加する場合は、共有されたIDを入力</li>
          <li>同じIDを使っている人全員で食品リストが同期されます</li>
        </ol>
      </div>
    </div>
  );
};
