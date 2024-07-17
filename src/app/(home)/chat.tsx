import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayer } from "@/context/player";
import { useSocket } from "@/context/socket";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FC, FormEvent, useEffect, useRef, useState } from "react";

import Whiteboard from "./whiteboard";
import { Palette } from "lucide-react";

type ChatProps = {
  myPeerId: string | null;
};

const Chat: FC<ChatProps> = ({ myPeerId }) => {
  const socket = useSocket();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const { chats, setChats, roomId, waitingForMatch } = usePlayer();
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const handleChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !myPeerId || !roomId || !chatInput) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_SENT, roomId, myPeerId, chatInput);
    setChats((prev) => {
      return [
        ...prev,
        {
          content: chatInput.trim(),
          senderPeerId: myPeerId,
        },
      ];
    });
    setChatInput("");
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats]);

  const toggleDrawingMode = (data: boolean) => {
    setIsDrawingMode(data);
  };

  return (
    <div className="flex flex-col h-full w-full rounded-xl shadow-xl bg-newSecondary">
      {!isDrawingMode ? (
        <>
          <main
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            ref={scrollAreaRef}
          >
            <Palette
              className={`text-newAccent absolute top-1 right-1`}
              style={{
                opacity: waitingForMatch ? 0.5 : 1,
                cursor: waitingForMatch ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                if (waitingForMatch) return;
                toggleDrawingMode(true);
              }}
            />
            {chats.map((chat, index) => {
              return (
                <div
                  className={cn("flex items-end space-x-2", {
                    "justify-end": chat.senderPeerId === myPeerId,
                  })}
                  key={String(index)}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg bg-gray-100 dark:bg-gray-800",
                      {
                        "text-white bg-newAccent":
                          chat.senderPeerId === myPeerId,
                      }
                    )}
                  >
                    <p className="text-sm">{chat.content}</p>
                  </div>
                </div>
              );
            })}
          </main>
          <div className="w-full flex flex-col items-center">
            <form
              className="flex items-center space-x-2 p-2 w-full"
              onSubmit={handleChat}
            >
              <Input
                className="flex-1"
                placeholder="say hi..."
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                }}
                disabled={waitingForMatch}
              />
              <Button
                className="bg-primaryBtn"
                size="sm"
                disabled={!roomId || waitingForMatch}
              >
                Send
              </Button>
            </form>
          </div>
        </>
      ) : (
        <Whiteboard roomId={roomId} toggleDrawingMode={toggleDrawingMode} />
      )}
    </div>
  );
};

export default Chat;
