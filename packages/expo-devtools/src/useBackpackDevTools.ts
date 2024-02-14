import { useDevToolsPluginClient, type EventSubscription } from "expo/devtools";
import { useEffect } from "react";

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

export function useBackpackDevTools() {
  const client = useDevToolsPluginClient("backpack-devtools");

  useEffect(() => {
    const subscriptions: EventSubscription[] = [];

    // subscriptions.push(
    //   client?.addMessageListener("ping", (data) => {
    //     alert(`!!Received ping from ${data.from}`);
    //   })
    // );
    // client?.sendMessage("ping", { from: "app" });

    return () => {
      for (const subscription of subscriptions) {
        subscription?.remove();
      }
    };
  }, [client]);

  useEffect(() => {
    async function setup() {
      console.log = function (...args) {
        const payload = args.length === 1 ? args[0] : JSON.stringify(args);
        client?.sendMessage("log", payload);
        originalConsoleLog.apply(console, arguments);
      };
      console.warn = function (...args) {
        const payload = args.length === 1 ? args[0] : JSON.stringify(args);
        client?.sendMessage("warn", payload);
        originalConsoleWarn.apply(console, arguments);
      };
      console.error = function (...args) {
        const payload = args.length === 1 ? args[0] : JSON.stringify(args);
        client?.sendMessage("error", payload);
        originalConsoleError.apply(console, arguments);
      };
    }

    async function teardown() {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    }

    // setup();
    return () => {
      teardown();
    };
  }, [client]);

  const log = (data: any) => {
    client?.sendMessage("log", data);
  };

  return {
    log,
  };
}
