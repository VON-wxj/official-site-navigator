import type { BgMessage, BgResponse, ContentMessage } from './types';

export function sendMessage(msg: BgMessage): Promise<BgResponse> {
  return chrome.runtime.sendMessage(msg);
}

export function sendContentMessage(tabId: number, msg: ContentMessage): Promise<void> {
  return chrome.tabs.sendMessage(tabId, msg);
}

export function addMessageListener(
  handler: (msg: BgMessage, sender: chrome.runtime.MessageSender) => Promise<BgResponse> | BgResponse
): () => void {
  const listener = (
    msg: BgMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res: BgResponse) => void
  ) => {
    const result = handler(msg, sender);
    if (result instanceof Promise) {
      result.then(sendResponse).catch((err) => {
        sendResponse({ type: 'ERROR', message: err instanceof Error ? err.message : String(err) });
      });
    } else {
      sendResponse(result);
    }
    return true; // keep channel open for async
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
