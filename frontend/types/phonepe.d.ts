declare global {
  interface Window {
    PhonePeCheckout: {
      transact: (options: {
        tokenUrl: string;
        callback: (response: string) => void;
        type: "IFRAME";
      }) => void;
      closePage: () => void;
    };
  }
}

export {};
