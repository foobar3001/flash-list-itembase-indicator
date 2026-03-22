import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { isNewArch } from "../../../src/isNewArch";

// 複雑なアイテムのデータ構造
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

// アイテムタイプ別のスタイルと高さ設定
const ITEM_CONFIGS = {
  text: { baseHeight: 80, color: "#E3F2FD", expandedMultiplier: 1.5 },
  image: { baseHeight: 200, color: "#F3E5F5", expandedMultiplier: 1.8 },
  video: { baseHeight: 250, color: "#E8F5E8", expandedMultiplier: 2.0 },
  complex: { baseHeight: 300, color: "#FFF3E0", expandedMultiplier: 2.5 },
};

// サンプルデータ生成
const generateComplexItem = (
  index: number,
  type?: ComplexItem["type"],
  isHeavy?: boolean
): ComplexItem => {
  const types: ComplexItem["type"][] = ["text", "image", "video", "complex"];
  const itemType = type || types[index % types.length];
  const config = ITEM_CONFIGS[itemType];

  // 重いアイテムの場合は高さを増加
  const heightVariation = Math.random() * 50 - 25; // -25 to +25
  const heavyMultiplier = isHeavy ? 1.5 + Math.random() * 0.8 : 1; // 1.5x - 2.3x for heavy items
  const baseHeight = config.baseHeight * heavyMultiplier + heightVariation;

  // CPU集約的な計算をシミュレート（重いアイテムの場合）
  // Note: simulateHeavyComputation は外部で定義されている関数を使用する想定

  // 重いアイテムの場合はより複雑なコンテンツを生成
  const generateHeavyContent = () => {
    if (!isHeavy)
      return `これは${itemType}タイプのアイテムです。高さが${Math.round(
        baseHeight
      )}pxで、複雑なレイアウトを持っています。`;

    // 重いアイテムの場合は簡単な計算処理をシミュレート
    const startTime = Date.now();
    while (Date.now() - startTime < 0.5) {
      Math.random() * Math.random() * Math.random();
    }

    const longTexts = [
      "これは非常に複雑で重いレンダリングを要するアイテムです。複数行のテキスト、画像、動画、インタラクティブな要素などが含まれています。",
      "パフォーマンステストのために設計された重いコンテンツです。実際のアプリケーションでは、ニュース記事、ソーシャルメディアの投稿、製品詳細などがこのような重いコンテンツになることがあります。",
      "FlashListのオフセット補正機能をテストするために、意図的に描画コストを高くしています。これにより、実際のアプリケーションで発生する可能性のある問題を再現できます。",
      "大量のアイテムが追加された時のスクロール位置の維持、ユーザーのスクロール操作の応答性、メモリ使用量の最適化などを検証することができます。",
    ];

    return (
      longTexts[index % longTexts.length] +
      ` インデックス: ${index}, 高さ: ${Math.round(
        baseHeight
      )}px, タイムスタンプ: ${new Date().toLocaleTimeString()}`
    );
  };

  return {
    id: `item-${index}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    title: `${
      isHeavy ? "🔥 HEAVY" : ""
    } ${itemType.toUpperCase()} Item #${index}`,
    content: generateHeavyContent(),
    type: itemType,
    height: baseHeight,
    timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time within last day
    metadata: {
      likes: Math.floor(Math.random() * (isHeavy ? 1000 : 100)),
      comments: Math.floor(Math.random() * (isHeavy ? 500 : 50)),
      shares: Math.floor(Math.random() * (isHeavy ? 200 : 20)),
    },
  };
};

// 複雑なアイテムレンダラー
const ComplexItemRenderer = React.memo(
  ({
    item,
    onToggleExpand,
  }: {
    item: ComplexItem;
    onToggleExpand: (id: string) => void;
  }) => {
    const config = ITEM_CONFIGS[item.type];
    const currentHeight = item.isExpanded
      ? item.height * config.expandedMultiplier
      : item.height;

    // 重いアイテムの場合は意図的に処理負荷を増加（開発用）
    const isHeavy = item.title.includes("🔥 HEAVY");
    if (isHeavy) {
    }

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: config.color,
            minHeight: currentHeight,
          },
        ]}
        onPress={() => onToggleExpand(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
        </View>

        <Text
          style={styles.itemContent}
          numberOfLines={item.isExpanded ? undefined : 2}
        >
          {item.content}
        </Text>

        {item.isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedText}>
              展開されたコンテンツ: このアイテムは動的に高さが変更されています。
              オフセット補正機能により、スクロール位置が適切に維持されます。
            </Text>

            <View style={styles.metadata}>
              <Text style={styles.metadataText}>👍 {item.metadata?.likes}</Text>
              <Text style={styles.metadataText}>
                💬 {item.metadata?.comments}
              </Text>
              <Text style={styles.metadataText}>
                📤 {item.metadata?.shares}
              </Text>
            </View>

            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* 重いアイテムの場合は追加の描画要素 */}
        {isHeavy && (
          <View style={styles.heavyItemExtras}>
            {/* 複数のプレースホルダー要素 */}
            {Array.from({ length: 3 }, (_, idx) => (
              <View key={idx} style={styles.placeholderRow}>
                <View style={styles.placeholderCircle} />
                <View style={styles.placeholderTextContainer}>
                  <View style={styles.placeholderText} />
                  <View style={[styles.placeholderText, { width: "70%" }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.heightIndicator}>
          <Text style={styles.heightText}>
            {isHeavy ? "🔥 " : ""}高さ: {Math.round(currentHeight)}px{" "}
            {item.isExpanded ? "(展開中)" : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export default function EnhancedOffsetCorrectionExample() {
  const [data, setData] = useState<ComplexItem[]>(() =>
    Array.from({ length: 20 }, (_, i) => generateComplexItem(i))
  );
  const [isAddingItems, setIsAddingItems] = useState(false);

  const listRef = useRef<FlashListRef<ComplexItem>>(null);

  // アイテムの展開/折りたたみ
  const toggleItemExpansion = useCallback((id: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  }, []);

  // 上方向にアイテムを追加（オフセット補正のテスト）
  const addItemsToTop = useCallback(
    async (count: number = 3) => {
      if (isAddingItems) return;

      setIsAddingItems(true);

      try {
        // 複雑なアイテムを一度に追加（オフセット補正をより効果的にテスト）
        const newItems = Array.from({ length: count }, (_, i) =>
          generateComplexItem(
            Date.now() + i,
            i % 2 === 0 ? "complex" : "video" // 大きなアイテムを交互に追加
          )
        );

        setData((prevData) => [...newItems, ...prevData]);
      } finally {
        setIsAddingItems(false);
      }
    },
    [isAddingItems]
  );

  // 大量の重いアイテムを上方向に追加（100個のパフォーマンステスト）
  const addManyHeavyItemsToTop = useCallback(
    async (count: number = 100) => {
      if (isAddingItems) return;

      setIsAddingItems(true);

      try {
        console.log(
          `Adding ${count} heavy items to top - this may take a moment...`
        );
        const startTime = Date.now();

        // 手動でスクロール位置補正を行う（オフセット補正機能に頼らない）
        console.log(
          `Manually handling scroll position for ${count} heavy items`
        );

        // すべての重いアイテムを一度に生成
        const allItems = Array.from({ length: count }, (_, i) =>
          generateComplexItem(
            Date.now() + i,
            ["complex", "video"][i % 2] as ComplexItem["type"],
            true // 重いアイテムフラグ
          )
        );

        // アイテム追加
        setData((prevData) => [...allItems, ...prevData]);

        // 大量追加時は自動オフセット補正に任せる
        // （手動補正ではなく、改良されたオフセット補正機能を活用）

        const endTime = Date.now();
        console.log(`Added ${count} heavy items in ${endTime - startTime}ms`);
      } finally {
        setIsAddingItems(false);
      }
    },
    [isAddingItems]
  );

  // 下方向にアイテムを追加
  const addItemsToBottom = useCallback(() => {
    const newItems = Array.from({ length: 5 }, (_, i) =>
      generateComplexItem(data.length + i)
    );
    setData((prevData) => [...prevData, ...newItems]);
  }, [data.length]);

  // ランダムなアイテムを展開
  const expandRandomItems = useCallback(() => {
    setData((prevData) =>
      prevData.map((item) => ({
        ...item,
        isExpanded: Math.random() > 0.7, // 30%の確率で展開
      }))
    );
  }, []);

  // すべてのアイテムを折りたたみ
  const collapseAllItems = useCallback(() => {
    setData((prevData) =>
      prevData.map((item) => ({ ...item, isExpanded: false }))
    );
  }, []);

  // 特定の位置にスクロール
  const scrollToPosition = useCallback(
    (position: "top" | "middle" | "bottom") => {
      if (!listRef.current) return;

      switch (position) {
        case "top":
          listRef.current.scrollToOffset({ offset: 0, animated: true });
          break;
        case "middle":
          const middleIndex = Math.floor(data.length / 2);
          listRef.current.scrollToIndex({ index: middleIndex, animated: true });
          break;
        case "bottom":
          listRef.current.scrollToEnd({ animated: true });
          break;
      }
    },
    [data.length]
  );

  const renderItem = useCallback(
    ({ item }: { item: ComplexItem }) => (
      <ComplexItemRenderer item={item} onToggleExpand={toggleItemExpansion} />
    ),
    [toggleItemExpansion]
  );

  const keyExtractor = useCallback((item: ComplexItem) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>拡張オフセット補正テスト</Text>
        <Text style={styles.headerSubtitle}>
          複雑なアイテムでのスクロール位置維持機能
        </Text>
      </View>

      {/* コントロールパネル */}
      <View style={styles.controlPanel}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              isAddingItems && styles.disabledButton,
            ]}
            onPress={() => addItemsToTop(3)}
            disabled={isAddingItems}
          >
            <Text style={styles.buttonText}>
              {isAddingItems ? "追加中..." : "上に追加"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={addItemsToBottom}
          >
            <Text style={styles.buttonText}>下に追加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={expandRandomItems}
          >
            <Text style={styles.buttonText}>ランダム展開</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={collapseAllItems}
          >
            <Text style={styles.buttonText}>全て折りたたみ</Text>
          </TouchableOpacity>
        </View>

        {/* 重いアイテム用のボタン行 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.heavyButton,
              isAddingItems && styles.disabledButton,
            ]}
            onPress={() => addManyHeavyItemsToTop(50)}
            disabled={isAddingItems}
          >
            <Text style={styles.buttonText}>🔥 重い50個追加</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.heavyButton,
              isAddingItems && styles.disabledButton,
            ]}
            onPress={() => addManyHeavyItemsToTop(100)}
            disabled={isAddingItems}
          >
            <Text style={styles.buttonText}>🔥 重い100個追加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.navigationButton]}
            onPress={() => scrollToPosition("top")}
          >
            <Text style={styles.buttonText}>トップ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.navigationButton]}
            onPress={() => scrollToPosition("middle")}
          >
            <Text style={styles.buttonText}>中央</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.navigationButton]}
            onPress={() => scrollToPosition("bottom")}
          >
            <Text style={styles.buttonText}>ボトム</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* リスト */}
      <FlashList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maintainVisibleContentPosition={{
          disabled: false, // 改善されたオフセット補正を有効化
        }}
        getItemType={(item) => item.type}
        onLoad={({ elapsedTimeInMs }: { elapsedTimeInMs: number }) => {
          console.log(`FlashList loaded in ${elapsedTimeInMs}ms`);
        }}
        contentContainerStyle={styles.listContent}
      />

      {/* 情報パネル */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          アーキテクチャ: {isNewArch() ? "New (Fabric)" : "Old (Paper)"}
        </Text>
        <Text style={styles.infoText}>アイテム数: {data.length}</Text>
        <Text style={styles.infoText}>
          重いアイテム:{" "}
          {data.filter((item) => item.title.includes("🔥 HEAVY")).length}
        </Text>
        <Text style={styles.infoText}>
          展開中: {data.filter((item) => item.isExpanded).length}
        </Text>
        <Text style={[styles.infoText, { fontSize: 12, color: "#666" }]}>
          💡 テスト手順: 中間位置までスクロール → 大量追加 → 位置確認
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  controlPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "#4CAF50",
  },
  tertiaryButton: {
    backgroundColor: "#FF9800",
  },
  navigationButton: {
    backgroundColor: "#9C27B0",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  itemType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  expandedText: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
    marginBottom: 8,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: "#666",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  heightIndicator: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  heightText: {
    fontSize: 10,
    color: "#999",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  // 重いアイテム用のスタイル
  heavyItemExtras: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 152, 0, 0.2)",
  },
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  placeholderCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 152, 0, 0.3)",
    marginRight: 8,
  },
  placeholderTextContainer: {
    flex: 1,
  },
  placeholderText: {
    height: 8,
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderRadius: 4,
    marginBottom: 4,
  },
  // 重いアイテム追加ボタン用
  heavyButton: {
    backgroundColor: "#FF5722",
  },
});
