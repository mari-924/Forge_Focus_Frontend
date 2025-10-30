import * as WebBrowser from 'expo-web-browser';

describe('expo-web-browser mock', () => {
  it('exposes maybeCompleteAuthSession as a jest.fn', () => {
    expect(typeof WebBrowser.maybeCompleteAuthSession).toBe('function');
    expect(jest.isMockFunction(WebBrowser.maybeCompleteAuthSession)).toBe(true);
  });

  it('tracks calls to maybeCompleteAuthSession', () => {
    (WebBrowser.maybeCompleteAuthSession as jest.Mock).mockClear();
    WebBrowser.maybeCompleteAuthSession();
    WebBrowser.maybeCompleteAuthSession();
    expect(WebBrowser.maybeCompleteAuthSession).toHaveBeenCalledTimes(2);
  });
});


