import { useSocket } from "@/context/socket";
import { SOCKET_EVENTS } from "@/lib/constants";
import { useEffect, useState } from "react";
import {
  createTLStore,
  defaultShapeUtils,
  HistoryEntry,
  StoreListener,
  throttle,
  TLRecord,
  TLStoreWithStatus,
  uniqueId,
} from "tldraw";

const clientId = uniqueId();

const useTldDrawSyncStore = ({ roomId }: { roomId: string | null }) => {
  const [store] = useState(() => {
    const store = createTLStore({
      shapeUtils: [...defaultShapeUtils],
    });
    return store;
  });
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "synced-remote",
    connectionStatus: "online",
    store,
  });

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;
    const unSubs: (() => void)[] = [];

    const handleMessage = (message: any) => {
      try {
        const data = message;
        if (data.clientId === clientId) {
          return;
        }

        switch (data.type) {
          case "init": {
            store.loadSnapshot(data.snapshot);
            break;
          }
          case "recovery": {
            store.loadSnapshot(data.snapshot);
            break;
          }
          case "update": {
            try {
              for (const update of data.updates) {
                store.mergeRemoteChanges(() => {
                  const {
                    changes: { added, updated, removed },
                  } = update as HistoryEntry<TLRecord>;

                  for (const record of Object.values(added)) {
                    store.put([record]);
                  }
                  for (const [, to] of Object.values(updated)) {
                    store.put([to]);
                  }
                  for (const record of Object.values(removed)) {
                    store.remove([record.id]);
                  }
                });
              }
            } catch (e) {
              console.error(e);
              // socket.send(JSON.stringify({ clientId, type: 'recovery' }))
            }
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const pendingChanges: HistoryEntry<TLRecord>[] = [];
    const sendChanges = throttle(() => {
      if (pendingChanges.length === 0) return;
      socket.emit(SOCKET_EVENTS.SYNC_WHITEBOARD, {
        roomId,
        clientId,
        type: "update",
        updates: pendingChanges,
      });
      pendingChanges.length = 0;
    }, 32);

    const handleChange: StoreListener<TLRecord> = (event) => {
      if (event.source !== "user") return;
      pendingChanges.push(event);
      sendChanges();
    };

    socket.on(SOCKET_EVENTS.SYNC_WHITEBOARD, handleMessage);

    unSubs.push(
      store.listen(handleChange, {
        source: "user",
        scope: "document",
      })
    );
    return () => {
      unSubs.forEach((fn) => fn());
      socket.off(SOCKET_EVENTS.SYNC_WHITEBOARD, handleMessage);
      unSubs.length = 0;
    };
  }, [store, socket, roomId]);

  return storeWithStatus;
};

export default useTldDrawSyncStore;
