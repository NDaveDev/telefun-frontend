import uuid4 from "uuid4";
import { baseEncode } from "@near-js/utils";
import { InjectedState, HotRequest, HotResponse } from "./helpers/types.ts";
import { createRequest, getResponse } from "./helpers/proxy.ts";

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export class RequestFailed extends Error {
  name = "RequestFailed";
  constructor(readonly payload: any) {
    super();
  }
}

class HOT {
  walletId = "https://t.me/herewalletbot/app";
  ancestorOrigins = [
    "http://localhost:1234",
    "https://my.herewallet.app",
    "https://tgapp-dev.herewallet.app",
    "https://tgapp.herewallet.app",
    "https://beta.herewallet.app",
  ];

  readonly connection = new Promise<InjectedState | null>((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window?.self === window?.top) return resolve(null);
    this.injectedRequest("initialized", {})
      .then(resolve)
      .catch(() => resolve(null));
  });

  get isInjected() {
    return this.ancestorOrigins.includes(window.location.ancestorOrigins?.[0]);
  }

  openInHotBrowser = false;
  toggleOpenInHotBrowser(is: boolean) {
    this.openInHotBrowser = is;
  }

  customProvider?: (data: any, chain: number, address?: string | null) => Promise<any>;
  setupEthProvider(provider?: (data: any, chain: number, address?: string | null) => Promise<any>) {
    this.customProvider = provider;
  }

  async injectedRequest<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    const id = uuid4();
    return new Promise<HotResponse[T]>((resolve, reject) => {
      const handler = (e: any) => {
        if (e.data.id !== id) return;
        window?.removeEventListener("message", handler);
        if (e.data.success) return resolve(e.data.payload);
        else return reject(e.data.payload);
      };

      window?.parent.postMessage({ $hot: true, method, request, id }, "*");
      window?.addEventListener("message", handler);
    });
  }

  async request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    if (this.isInjected) {
      return this.injectedRequest(method, request);
    }

    const id = uuid4();
    const WebApp: any = (window as any)?.Telegram?.WebApp;
    const panel = WebApp == null ? window.open("about:blank", "_blank") : null;

    const requestId = await createRequest({
      inside: this.openInHotBrowser || (method === "ethereum" && this.customProvider == null),
      origin: window.location.href,
      $hot: true,
      method,
      request,
      id,
    });

    const link = `${this.walletId}?startapp=hotconnect-${baseEncode(requestId)}`;
    if (panel) panel.location.assign(link);
    else WebApp?.openTelegramLink(link);

    const poolResponse = async () => {
      await wait(3000);
      const data: any = await getResponse(requestId).catch(() => null);
      if (data == null) return await poolResponse();
      if (data.success) return data.payload;
      throw new RequestFailed(data.payload);
    };

    const result = await poolResponse();
    panel?.close();
    return result;
  }
}

export default new HOT();
