import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Switch } from "react-native";
import { FlashList, ViewToken } from "@shopify/flash-list";

interface DataItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

// サンプルデータを生成
const generateComparisonData = (count: number): DataItem[] => {
  const data: DataItem[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - i * 60000); // 1分ずつ過去
    data.push({
      id: `item-${i}`,
      title: `メッセージ ${i + 1}`,
      description: `これは${i + 1}番目のメッセージです。`.repeat(
        Math.floor(Math.random() * 2) + 1
      ),
      timestamp: date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }
  return data;
};

const DATA = generateComparisonData(150);

interface ComparisonIndicatorProps {
  mode: "callback" | "ref";
  callbackData: { first: number; last: number; total: number };
  refData: { current: number; total: number };
}

const ComparisonIndicator: React.FC<ComparisonIndicatorProps> = ({
  mode,
  callbackData,
  refData,
}) => {
  const renderCallbackMode = () => (
    <View style={[styles.indicatorContainer, styles.callbackIndicator]}>
      <Text style={styles.indicatorTitle}>onViewableItemsChanged</Text>
      <Text style={styles.indicatorText}>
        {callbackData.first + 1}-{callbackData.last + 1} / {callbackData.total}
      </Text>
      <Text style={styles.indicatorDetail}>
        表示中: {callbackData.last - callbackData.first + 1}アイテム
      </Text>
    </View>
  );

  const renderRefMode = () => (
    <View style={[styles.indicatorContainer, styles.refIndicator]}>
      <Text style={styles.indicatorTitle}>getVisibleIndices()</Text>
      <Text style={styles.indicatorText}>
        {refData.current + 1} / {refData.total}
      </Text>
      <Text style={styles.indicatorDetail}>現在のアイテム</Text>
    </View>
  );

  return mode === "callback" ? renderCallbackMode() : renderRefMode();
};

interface MessageItemProps {
  item: DataItem;
  index: number;
}

const MessageItem: React.FC<MessageItemProps> = ({ item, index }) => {
  return (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageIndex}>#{index + 1}</Text>
        <Text style={styles.messageTime}>{item.timestamp}</Text>
      </View>
      <Text style={styles.messageTitle}>{item.title}</Text>
      <Text style={styles.messageDescription}>{item.description}</Text>
    </View>
  );
};

export const IndicatorComparisonExample: React.FC = () => {
  const flashListRef = useRef<FlashList<DataItem>>(null);
  const [mode, setMode] = useState<"callback" | "ref">("callback");

  // Callback モードのデータ
  const [callbackData, setCallbackData] = useState({
    first: 0,
    last: 0,
    total: DATA.length,
  });

  // Ref モードのデータ
  const [refData] = useState({
    current: 0,
    total: DATA.length,
  });

  // onViewableItemsChanged コールバック
  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<DataItem>[];
  }) => {
    if (viewableItems.length > 0) {
      const first = viewableItems[0].index ?? 0;
      const last = viewableItems[viewableItems.length - 1].index ?? 0;
      setCallbackData({
        first,
        last,
        total: DATA.length,
      });
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 30,
    minimumViewTime: 50,
  };

  // Ref を使った定期的な更新
  useEffect(() => {
    if (mode === "ref") {
      const interval = setInterval(() => {
        if (flashListRef.current) {
          try {
            // Note: getVisibleIndices は現在のFlashListバージョンでは利用できません
            // 実際の実装では onViewableItemsChanged を使用することを推奨します
            console.log(
              "getVisibleIndices is not available in current version"
            );
          } catch (error) {
            console.warn("getVisibleIndices error:", error);
          }
        }
      }, 150);

      return () => clearInterval(interval);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "callback" ? "ref" : "callback"));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>インジケーター比較例</Text>
        <Text style={styles.headerSubtitle}>2つのアプローチの比較デモ</Text>
      </View>

      {/* モード切替 */}
      <View style={styles.modeSelector}>
        <Text style={styles.modeLabel}>
          {mode === "callback" ? "Callback モード" : "Ref モード"}
        </Text>
        <Switch
          value={mode === "ref"}
          onValueChange={toggleMode}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={mode === "ref" ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* 比較インジケーター */}
      <ComparisonIndicator
        mode={mode}
        callbackData={callbackData}
        refData={refData}
      />

      {/* 利点説明 */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>
          {mode === "callback" ? "Callback モードの特徴:" : "Ref モードの特徴:"}
        </Text>
        <Text style={styles.infoPanelText}>
          {mode === "callback"
            ? "• イベント駆動で効率的\n• 複数のアイテムを同時に追跡\n• viewabilityConfig でカスタマイズ可能"
            : "• プログラム的制御が可能\n• リアルタイム更新\n• scrollToIndex などと組み合わせ可能"}
        </Text>
      </View>

      {/* FlashList */}
      {/* @ts-ignore */}
      <FlashList
        ref={flashListRef}
        data={DATA}
        renderItem={({ item, index }) => (
          <MessageItem item={item} index={index} />
        )}
        estimatedItemSize={100}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={
          mode === "callback" ? handleViewableItemsChanged : undefined
        }
        viewabilityConfig={mode === "callback" ? viewabilityConfig : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

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
  modeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  indicatorContainer: {
    position: "absolute",
    top: 140,
    right: 16,
    zIndex: 1000,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 180,
  },
  callbackIndicator: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  refIndicator: {
    backgroundColor: "rgba(255, 152, 0, 0.9)",
  },
  indicatorTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  indicatorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  indicatorDetail: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    opacity: 0.9,
  },
  infoPanel: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoPanelTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  infoPanelText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  messageItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageIndex: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2196F3",
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  messageDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
});
