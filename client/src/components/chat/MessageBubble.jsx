import { HOST } from "../../utils/constants";
import { getColor } from "../../lib/utils";
import { FileIcon, Download, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

/**
 * MessageBubble — Handles rendering for different message types (text, image, audio, video)
 *
 * Props:
 *   - message: { sender, content, messageType, fileUrl, createdAt }
 *   - isSender: boolean
 */
const MessageBubble = ({ message, isSender }) => {
  const { sender, content, messageType, fileUrl, createdAt } = message;

  const renderContent = () => {
    switch (messageType) {
      case "image":
        return (
          <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-black/20">
            <img
              src={`${HOST}${fileUrl}`}
              alt="Uploaded content"
              className="max-w-full max-h-[400px] object-contain block"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={`${HOST}${fileUrl}`}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <Download size={18} />
              </a>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="rounded-xl overflow-hidden border border-white/5 bg-black/40 max-w-[400px]">
            <video controls className="w-full block">
              <source src={`${HOST}${fileUrl}`} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="bg-[#13141f] p-3 rounded-xl border border-white/5 min-w-[240px]">
            <audio controls className="w-full h-8 custom-audio-player">
              <source src={`${HOST}${fileUrl}`} />
            </audio>
          </div>
        );

      case "file":
        return (
          <a
            href={`${HOST}${fileUrl}`}
            target="_blank"
            rel="noreferrer"
            download
            className="flex items-center gap-3 bg-[#13141f] p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all group"
          >
            <div className="p-2 bg-violet-600/20 text-violet-500 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-all">
              <FileIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[200px]">
                {fileUrl.split("/").pop()}
              </p>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-0.5">
                Download Attachment
              </p>
            </div>
          </a>
        );

      default:
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} gap-1`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-lg relative transition-all ${
          isSender
            ? "bg-violet-600 text-white rounded-tr-none"
            : "bg-[#1e1f2e] text-white/80 border border-white/5 rounded-tl-none"
        }`}
      >
        {!isSender && (
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${getColor(sender.color)} bg-transparent border-none p-0`}>
            {sender.firstName || sender.email.split("@")[0]}
          </p>
        )}
        
        {renderContent()}

        <span
          className={`text-[9px] mt-1.5 block opacity-40 font-medium ${
            isSender ? "text-right" : "text-left"
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
