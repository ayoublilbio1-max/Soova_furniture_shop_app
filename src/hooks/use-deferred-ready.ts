// Defers "ready" until the current navigation transition/interactions have
// finished, so heavy screen content doesn't build on the same frame as the
// tab/stack transition animation — that collision is what causes the
// perceived freeze on heavy screens.

import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

export function useDeferredReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return ready;
}