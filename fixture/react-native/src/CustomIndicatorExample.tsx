import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";
interface DataItem {
  id: string;
  title: string;
  description: string;
  height: number;
}

// サンプルデータを生成（異なる高さのアイテム）
const generateData = (count: number): DataItem[] => {
  const data: DataItem[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: `item-${i}`,
      title: `アイテム ${i + 1}`,
      description: `これは${i + 1}番目のアイテムです。`.repeat(
        Math.floor(Math.random() * 3) + 1
      ),
      height: 80 + Math.floor(Math.random() * 100), // 80-180pxの可変高さ
    });
  }
  return data;
};

const DATA = generateData(100);

interface CustomIndicatorProps {
  startIndexValue: Animated.SharedValue<number>;
  endIndexValue: Animated.SharedValue<number>;
  totalCount: number;
  visibility?: Animated.SharedValue<number>;
  parentHeight?: Animated.SharedValue<number>;
  showScrollbar?: boolean;
}

const CustomIndicator: React.FC<CustomIndicatorProps> = ({
  startIndexValue,
  endIndexValue,
  totalCount,
  visibility,
  parentHeight,
  showScrollbar = true,
}) => {
  const [displayText, setDisplayText] = React.useState("");
  const [displayProgress, setDisplayProgress] = React.useState(0);

  // SharedValueの変更を監視してテキストを更新
  useDerivedValue(() => {
    const firstIndex = Math.floor(startIndexValue.value);
    const lastIndex = Math.floor(endIndexValue.value);
    const progress = ((firstIndex + 1) / totalCount) * 100;

    runOnJS(setDisplayText)(
      firstIndex === lastIndex
        ? `${firstIndex + 1} / ${totalCount}`
        : `${firstIndex + 1}-${lastIndex + 1} / ${totalCount}`
    );
    runOnJS(setDisplayProgress)(Math.round(progress));
  });

  // プログレスバーのアニメーションスタイル
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progress =
      ((Math.floor(startIndexValue.value) + 1) / totalCount) * 100;
    return {
      transform: [
        {
          scaleX: interpolate(progress, [0, 100], [0, 1], Extrapolate.CLAMP),
        },
      ],
    };
  });

  // スクロールバーのアニメーションスタイル
  const scrollbarAnimatedStyle = useAnimatedStyle(() => {
    const firstIndex = Math.floor(startIndexValue.value);
    const lastIndex = Math.floor(endIndexValue.value);

    // スクロールバーの位置とサイズを計算
    const startPosition = (firstIndex / totalCount) * 100;
    const endPosition = ((lastIndex + 1) / totalCount) * 100;
    const thumbHeight = Math.max(5, endPosition - startPosition); // 最小5%の高さを保証

    const opacity = visibility?.value ?? 1;

    return {
      opacity: opacity,
      transform: [
        {
          translateY: interpolate(
            startPosition,
            [0, 100],
            [0, parentHeight?.value ?? 0],
            Extrapolate.CLAMP
          ),
        },
        {
          scaleY: interpolate(
            thumbHeight,
            [5, 100],
            [0.5, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // インジケーター全体のアニメーションスタイル
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = visibility?.value ?? 1;
    return {
      opacity: opacity,
      transform: [
        {
          scale: interpolate(opacity, [0, 1], [0.85, 1], Extrapolate.CLAMP),
        },
        {
          translateX: interpolate(opacity, [0, 1], [30, 0], Extrapolate.CLAMP),
        },
        {
          rotateZ: `${interpolate(
            opacity,
            [0, 1],
            [5, 0],
            Extrapolate.CLAMP
          )}deg`,
        },
      ],
    };
  });

  // テキストコンテンツ用のアニメーションスタイル
  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = visibility?.value ?? 1;
    return {
      transform: [
        {
          translateY: interpolate(opacity, [0, 1], [8, 0], Extrapolate.CLAMP),
        },
      ],
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.indicatorContainer, containerAnimatedStyle]}
      >
        <Animated.View style={[styles.indicatorContent, textAnimatedStyle]}>
          <Text style={styles.indicatorText}>{displayText}</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, progressAnimatedStyle]}
            />
          </View>
          <Text style={styles.progressText}>{displayProgress}%</Text>
        </Animated.View>
      </Animated.View>

      {showScrollbar && (
        <View style={styles.scrollbarContainer}>
          <Animated.View
            style={[styles.scrollbarThumb, scrollbarAnimatedStyle]}
          />
        </View>
      )}
    </>
  );
};

interface ItemComponentProps {
  item: DataItem;
}

const ItemComponent: React.FC<ItemComponentProps> = ({ item }) => {
  return (
    <View style={[styles.itemContainer, { minHeight: item.height }]}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <Text style={styles.itemHeight}>高さ: {item.height}px</Text>
    </View>
  );
};

export const CustomIndicatorExample: React.FC = () => {
  // SharedValueを直接使用
  const startIndexValue = useSharedValue(0);
  const endIndexValue = useSharedValue(0);
  const parentHeight = useSharedValue(0);

  // インジケーターの表示制御用
  const indicatorVisibility = useSharedValue(1);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // 50%以上表示されているアイテムを「表示中」とみなす
    minimumViewTime: 100, // 最低100ms表示されていることを要求
  };

  // スクロール中の表示制御
  const handleScrollStart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    indicatorVisibility.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
  };

  const handleScrollEnd = () => {
    timeoutRef.current = setTimeout(() => {
      indicatorVisibility.value = withSpring(0.7, {
        damping: 12,
        stiffness: 100,
      });
    }, 1500); // 1.5秒後にフェードアウト
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>カスタムインジケーター例</Text>
        <Text style={styles.headerSubtitle}>
          可変高さアイテムでのスクロール位置表示
        </Text>
      </View>

      {/* カスタムインジケーター */}
      <CustomIndicator
        startIndexValue={startIndexValue}
        endIndexValue={endIndexValue}
        parentHeight={parentHeight}
        totalCount={DATA.length}
        visibility={indicatorVisibility}
        showScrollbar={true}
      />

      {/* FlashList */}
      {/* @ts-ignore */}
      <FlashList
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          parentHeight.value = height; // 親の高さをSharedValueに保存
        }}
        data={DATA}
        renderItem={({ item }) => <ItemComponent item={item} />}
        keyExtractor={(item) => item.id}
        onEngagedIndicesChanged={(startIndex, endIndex) => {
          console.log("Engaged indices:", startIndex, endIndex);
          // スクロール位置の更新
          // SharedValueに直接代入でアニメーション付きで更新
          startIndexValue.value = withSpring(startIndex, {
            damping: 20,
            stiffness: 200,
            mass: 0.8,
          });
          endIndexValue.value = withSpring(endIndex, {
            damping: 20,
            stiffness: 200,
            mass: 0.8,
          });
          console.log("Engaged indices changed:", startIndex, endIndex);
        }}
        viewabilityConfig={viewabilityConfig}
        onScroll={(event) => {
          handleScrollStart();
          // console.log("Scrolling:", event.nativeEvent.contentOffset.y);
        }}
        onScrollEndDrag={() => {
          handleScrollEnd();
        }}
        onMomentumScrollEnd={() => {
          handleScrollEnd();
        }}
        showsVerticalScrollIndicator={false} // 標準のスクロールバーを非表示
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
  indicatorContainer: {
    position: "absolute",
    top: 80,
    right: 16,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  indicatorContent: {
    alignItems: "center",
  },
  indicatorText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressBarContainer: {
    width: 80,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1.5,
    marginBottom: 4,
    overflow: "hidden", // scaleXアニメーションのために追加
  },
  progressBar: {
    width: "100%", // 幅を100%に設定してscaleXで制御
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 1.5,
    transformOrigin: "left", // scaleXの基点を左端に設定
  },
  progressText: {
    color: "white",
    fontSize: 10,
  },
  scrollbarContainer: {
    position: "absolute",
    top: 80,
    right: 6,
    bottom: 20,
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    zIndex: 999,
  },
  scrollbarThumb: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "10%",
    backgroundColor: "rgba(0, 255, 255, 0.8)",
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  itemHeight: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
