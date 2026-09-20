import { safeBack } from '../src/utils/navigation';

describe('safeBack Navigation Utility', () => {
  it('calls router.back() when router.canGoBack() is true', () => {
    const mockBack = jest.fn();
    const mockReplace = jest.fn();
    const mockRouter = {
      canGoBack: jest.fn().mockReturnValue(true),
      back: mockBack,
      replace: mockReplace,
    };

    safeBack(mockRouter);

    expect(mockRouter.canGoBack).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('calls router.replace(fallbackRoute) when router.canGoBack() is false', () => {
    const mockBack = jest.fn();
    const mockReplace = jest.fn();
    const mockRouter = {
      canGoBack: jest.fn().mockReturnValue(false),
      back: mockBack,
      replace: mockReplace,
    };

    safeBack(mockRouter, '/(tabs)');

    expect(mockRouter.canGoBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('defaults fallbackRoute to "/(tabs)" when omitted', () => {
    const mockBack = jest.fn();
    const mockReplace = jest.fn();
    const mockRouter = {
      canGoBack: jest.fn().mockReturnValue(false),
      back: mockBack,
      replace: mockReplace,
    };

    safeBack(mockRouter);

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('catches exceptions and falls back to router.replace', () => {
    const mockReplace = jest.fn();
    const mockRouter = {
      canGoBack: jest.fn().mockImplementation(() => {
        throw new Error('Navigation state corrupted');
      }),
      back: jest.fn(),
      replace: mockReplace,
    };

    safeBack(mockRouter, '/custom-route');

    expect(mockReplace).toHaveBeenCalledWith('/custom-route');
  });
});
