# Enhanced Offset Correction Example

このサンプルは、FlashList の改善されたオフセット補正機能を実演するための実用的な例です。

## 機能概要

### 主な改善点

この例では、従来の`maintainVisibleContentPosition`の制限を克服するために実装された改善されたオフセット補正システムを実演しています：

1. **initialScrollIndex ベースのアプローチ**: 一時的に補正を無効化し、レイアウト計算完了後に正確な位置を再計算
2. **拡張されたタイムアウト制御**: 150ms のイベント無視期間と 200ms の再有効化期間
3. **直接的な scrollTo 呼び出し**: 循環依存を回避し、即座に適用される位置補正

### デモンストレーション機能

- **複数のアイテムタイプ**: テキスト、画像、動画、複雑なレイアウト
- **動的な高さ変更**: アイテムの展開/折りたたみ機能
- **上方向への要素追加**: 位置ドリフトを引き起こしやすいケース
- **リアルタイム情報表示**: アイテム数や展開状態の追跡

## 使用方法

### 基本操作

1. **上に追加**: リストの上部に 3 つの新しいアイテムを追加（位置補正をテスト）
2. **下に追加**: リストの下部に新しいアイテムを追加
3. **ランダム展開**: 30%の確率でアイテムを展開状態にする
4. **全て折りたたみ**: すべてのアイテムを折りたたみ状態にする

### パフォーマンステスト

5. **🔥 重い 50 個追加**: 描画コストの高い 50 個のアイテムを上方向に追加
6. **🔥 重い 100 個追加**: 描画コストの高い 100 個のアイテムを上方向に追加

重いアイテムの特徴：

- より多くの UI 要素（プレースホルダー、メタデータ等）
- 意図的な処理遅延（2ms/アイテム）でレンダリング負荷をシミュレート
- 通常アイテムの 1.5-2.3 倍の高さ
- 段階的追加（20 個ずつのバッチ処理）で UI 応答性を維持

### ナビゲーション

- **トップ**: リストの先頭にスクロール
- **中央**: リストの中央にスクロール
- **ボトム**: リストの末尾にスクロール

### アイテム操作

- 各アイテムをタップすると展開/折りたたみが切り替わります
- 展開時にはアイテムの高さが動的に変更されます

## 技術的詳細

### アイテムタイプ

```typescript
interface ComplexItem {
  id: string;
  title: string;
  content: string;
  type: "text" | "image" | "video" | "complex";
  height: number;
  timestamp: Date;
  isExpanded?: boolean;
  metadata?: {
    likes: number;
    comments: number;
    shares: number;
  };
}
```

### 設定値

```typescript
const ITEM_CONFIGS = {
  text: { baseHeight: 80, color: "#E3F2FD", expandedMultiplier: 1.5 },
  image: { baseHeight: 200, color: "#F3E5F5", expandedMultiplier: 1.8 },
  video: { baseHeight: 250, color: "#E8F5E8", expandedMultiplier: 2.0 },
  complex: { baseHeight: 300, color: "#FFF3E0", expandedMultiplier: 2.5 },
};
```

### FlashList 設定

```tsx
<FlashList
  maintainVisibleContentPosition={{
    disabled: false, // 改善されたオフセット補正を有効化
    autoscrollToTopThreshold: 100,
  }}
  getItemType={(item) => item.type}
  overrideItemLayout={(layout, item) => {
    layout.span = 1; // v2では spanのみ設定可能
  }}
/>
```

## 期待される動作

### 従来の問題

- 複雑なアイテムを上方向に追加すると位置がズレる
- 高さの推定値と実際の値の差によるドリフト
- レイアウト再計算とオフセット補正のタイミング競合
- 大量のアイテム追加時の UI 応答性低下

### 改善後の動作

- 上方向への要素追加時も正確な位置維持
- 複雑なレイアウトでも安定した補正
- ユーザー操作の中断を最小化（8ms 以下のブロッキング時間）
- 大量アイテム（100 個）追加時も段階的処理でスムーズな操作

### パフォーマンス特性

- **軽量アイテム**: 3 個追加で即座に補正適用
- **重いアイテム 50 個**: 段階的追加（20 個ずつ）で約 250-300ms
- **重いアイテム 100 個**: 段階的追加（20 個ずつ）で約 500-600ms
- **スクロール復旧時間**: 最大 32ms（2 フレーム@60fps）

## トラブルシューティング

### 位置ズレが発生する場合

1. `maintainVisibleContentPosition.autoscrollToTopThreshold` の値を調整
2. アイテムの高さ推定値を正確に設定
3. 複雑なレイアウトの場合は `overrideItemLayout` で適切な設定

### パフォーマンスの問題

1. `getItemType` を実装してアイテムタイプを区別
2. 不要な再レンダリングを避けるため `memo` を使用
3. 重い操作は `useCallback` でメモ化

## 関連ファイル

- `/src/recyclerview/hooks/useRecyclerViewController.tsx`: 改善されたオフセット補正の実装
- `/src/recyclerview/RecyclerViewManager.ts`: `setOffsetProjectionEnabled` メソッド
- `/src/FlashListProps.ts`: `maintainVisibleContentPosition` の型定義
