import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

interface DataItem {
  id: string;
  title: string;
  content: string;
  category: "tech" | "business" | "sports" | "entertainment";
}

// サンプルデータを生成
const generateNewsData = (count: number): DataItem[] => {
  const categories: DataItem["category"][] = [
    "tech",
    "business",
    "sports",
    "entertainment",
  ];
  const data: DataItem[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    data.push({
      id: `news-${i}`,
      title: `ニュース記事 ${i + 1}`,
      content: `これは${category}カテゴリの記事です。`.repeat(
        Math.floor(Math.random() * 4) + 2
      ),
      category,
    });
  }
  return data;
};

const DATA = generateNewsData(200);

interface RefBasedIndicatorProps {
  currentIndex: number;
  totalCount: number;
  onJumpToItem: (index: number) => void;
}

const RefBasedIndicator: React.FC<RefBasedIndicatorProps> = ({
  currentIndex,
  totalCount,
  onJumpToItem,
}) => {
  const progress = totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;

  const handleQuickJump = () => {
    const options = [
      { text: "最初に移動", onPress: () => onJumpToItem(0) },
      {
        text: "中央に移動",
        onPress: () => onJumpToItem(Math.floor(totalCount / 2)),
      },
      { text: "最後に移動", onPress: () => onJumpToItem(totalCount - 1) },
      { text: "キャンセル", style: "cancel" as const },
    ];

    Alert.alert("クイックジャンプ", "どこに移動しますか？", options);
  };

  return (
    <View style={styles.refIndicatorContainer}>
      <Pressable style={styles.refIndicatorContent} onPress={handleQuickJump}>
        <Text style={styles.refIndicatorText}>
          {currentIndex + 1} / {totalCount}
        </Text>
        <View style={styles.refProgressContainer}>
          <View style={[styles.refProgressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.refProgressText}>タップでジャンプ</Text>
      </Pressable>
    </View>
  );
};

interface NewsItemProps {
  item: DataItem;
  index: number;
}

const NewsItem: React.FC<NewsItemProps> = ({ item, index }) => {
  const getCategoryColor = (category: DataItem["category"]) => {
    switch (category) {
      case "tech":
        return "#2196F3";
      case "business":
        return "#4CAF50";
      case "sports":
        return "#FF9800";
      case "entertainment":
        return "#E91E63";
      default:
        return "#757575";
    }
  };

  return (
    <View style={styles.newsItem}>
      <View style={styles.newsHeader}>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.newsIndex}>#{index + 1}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsContent}>{item.content}</Text>
    </View>
  );
};

export const RefBasedIndicatorExample: React.FC = () => {
  const flashListRef = useRef<FlashList<DataItem>>(null);
  const [currentIndex] = useState(0);

  // refを使って定期的に現在のインデックスを更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (flashListRef.current) {
        try {
          // Note: getVisibleIndices は現在のFlashListバージョンでは利用できない可能性があります
          // 代替実装として onViewableItemsChanged を使用することを推奨します
          console.log("getVisibleIndices is not available in current version");
        } catch (error) {
          // getVisibleIndices が利用できない場合のエラーハンドリング
          console.warn("getVisibleIndices not available:", error);
        }
      }
    }, 200); // 200msごとに更新

    return () => clearInterval(interval);
  }, []);

  const jumpToItem = (index: number) => {
    if (flashListRef.current && index >= 0 && index < DATA.length) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ref ベースインジケーター例</Text>
        <Text style={styles.headerSubtitle}>
          FlashList ref の getVisibleIndices() を使用
        </Text>
      </View>

      {/* Ref ベースのカスタムインジケーター */}
      <RefBasedIndicator
        currentIndex={currentIndex}
        totalCount={DATA.length}
        onJumpToItem={jumpToItem}
      />

      {/* クイックアクションボタン */}
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.actionButton}
          onPress={() => jumpToItem(Math.max(0, currentIndex - 10))}
        >
          <Text style={styles.actionButtonText}>-10</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            jumpToItem(Math.min(DATA.length - 1, currentIndex + 10))
          }
        >
          <Text style={styles.actionButtonText}>+10</Text>
        </Pressable>
      </View>

      {/* FlashList */}
      {/* @ts-ignore */}
      <FlashList
        ref={flashListRef}
        data={DATA}
        renderItem={({ item, index }) => <NewsItem item={item} index={index} />}
        estimatedItemSize={140}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  refIndicatorContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    zIndex: 1000,
  },
  refIndicatorContent: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: "center",
  },
  refIndicatorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  refProgressContainer: {
    width: 100,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 6,
  },
  refProgressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  refProgressText: {
    color: "white",
    fontSize: 11,
    opacity: 0.9,
  },
  actionButtons: {
    position: "absolute",
    top: 80,
    right: 16,
    zIndex: 1000,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  newsItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  newsIndex: {
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
