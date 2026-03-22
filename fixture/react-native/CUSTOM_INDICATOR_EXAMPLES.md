# FlashList カスタムインジケーター例

このディレクトリには、FlashList で現在表示中のアイテムのインデックスと総アイテム数を使って、カスタムインジケーターを表示する 3 つの例が含まれています。

## 追加されたサンプル

### 1. CustomIndicatorExample.tsx

**基本的なカスタムインジケーター例**

- `onViewableItemsChanged` プロパティを使用
- 現在表示中の範囲（例：3-5 / 100）とプログレスバーを表示
- 可変高さのアイテムでの動作例
- `overrideItemLayout` を使用してスクロールインジケーターを安定化

**特徴：**

- イベント駆動型で効率的
- 複数のアイテムを同時に追跡
- `viewabilityConfig` でカスタマイズ可能

### 2. RefBasedIndicatorExample.tsx

**ref ベースのインジケーター例**

- FlashList の ref を使用（注：`getVisibleIndices()` は現在のバージョンでは利用不可）
- クイックジャンプ機能付きインジケーター
- カテゴリー別ニュースアイテムの例
- タップでアラートからジャンプ先を選択可能

**特徴：**

- プログラム的制御が可能
- `scrollToIndex` などと組み合わせ可能
- インタラクティブな機能を追加しやすい

### 3. IndicatorComparisonExample.tsx

**両方のアプローチの比較例**

- コールバックモードと ref モードを切り替え可能
- 各アプローチの特徴を実際に体験できる
- メッセージアプリ風の UI
- リアルタイムでの動作比較

**特徴：**

- 2 つのアプローチの違いを理解しやすい
- 切り替えスイッチで動作を比較
- 各方法の利点と制限を説明

## 実装のポイント

### スクロールインジケーター安定化のベストプラクティス

1. **正確な `estimatedItemSize` を設定**

   ```tsx
   estimatedItemSize={120} // アイテムの平均的な高さ
   ```

2. **`overrideItemLayout` を使用**

   ```tsx
   overrideItemLayout={(layout, item) => {
     layout.size = item.height;
   }}
   ```

3. **`viewabilityConfig` を最適化**
   ```tsx
   const viewabilityConfig = {
     itemVisiblePercentThreshold: 50, // 50%以上表示されているアイテム
     minimumViewTime: 100, // 最低100ms表示
   };
   ```

### 推奨アプローチ

**`onViewableItemsChanged` を使用する方法を推奨**

理由：

- パフォーマンスが良い（イベント駆動型）
- FlashList 内部の viewability ロジックを直接利用
- カスタマイズ性が高い

## アプリでのテスト方法

1. React Native アプリを起動：

   ```bash
   cd fixture/react-native
   yarn ios  # または yarn android
   ```

2. サンプル一覧から以下を選択：

   - "Custom Indicator Example"
   - "Ref-Based Indicator Example"
   - "Indicator Comparison Example"

3. スクロールして動作を確認

## 注意事項

- `getVisibleIndices()` メソッドは現在の FlashList バージョンでは利用できません
- 実際のプロダクションでは `onViewableItemsChanged` の使用を推奨します
- 型の問題は `@ts-ignore` で一時的に回避していますが、実際の開発では適切な型定義の使用を推奨します
