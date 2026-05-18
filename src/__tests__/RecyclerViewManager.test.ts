import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { WarningMessages } from "../errors/WarningMessages";
import { FlashListProps } from "../FlashListProps";

describe("RecyclerViewManager", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("keyExtractor warning with maintainVisibleContentPosition", () => {
    const createMockProps = (overrides = {}) =>
      ({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        renderItem: jest.fn(),
        ...overrides,
      } as FlashListProps<unknown>);

    const createManager = (props: FlashListProps<unknown>) => {
      return new RecyclerViewManager(props);
    };

    it("should warn when onStartReached is defined but keyExtractor is not", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: undefined,
      });

      createManager(props);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        WarningMessages.keyExtractorNotDefinedForMVCP
      );
    });

    it("should not warn when both onStartReached and keyExtractor are defined", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: (item: any) => item.id.toString(),
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: undefined,
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined but keyExtractor is", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: (item: any) => item.id.toString(),
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("getItemHeight wiring", () => {
    const createMockProps = (overrides = {}) =>
      ({
        data: [{ id: 1 }, { id: 2 }],
        renderItem: jest.fn(),
        ...overrides,
      } as FlashListProps<unknown>);

    it("should pass item, index, and extraData to getItemHeight", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const extraData = { source: "cache" };
      const getItemHeight = jest.fn(() => 100);
      const manager = new RecyclerViewManager(
        createMockProps({
          data,
          extraData,
          getItemHeight,
        })
      );

      manager.updateLayoutParams({ width: 400, height: 800 }, 0);
      manager.modifyChildrenLayout([], data.length);

      expect(getItemHeight).toHaveBeenCalledWith(data[0], 0, extraData);
      expect(getItemHeight).toHaveBeenCalledWith(data[1], 1, extraData);
    });
  });
});
