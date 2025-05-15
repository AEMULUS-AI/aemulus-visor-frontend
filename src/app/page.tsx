"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Message, useChat } from "@ai-sdk/react";
import {
  Send,
  Upload,
  Plus,
  MessageSquare,
  Database,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarProvider,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UploadButton } from "@/utils/uploadthing";
import { UploadDropzone } from "@uploadthing/react";
import { uploadFiles } from "./lib/upload";
import { Attachment } from "@ai-sdk/ui-utils";

type ChatSession = {
  id: string;
  title: string;
  date: Date;
};

type ContextFile = {
  id: string;
  name: string;
  type: string;
  size: number;
};

export default function ChatInterface() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    { id: "1", title: "Previous Chat 1", date: new Date() },
    {
      id: "2",
      title: "Previous Chat 2",
      date: new Date(Date.now() - 86400000),
    },
  ]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const contextFileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const chosen = Array.from(e.target.files);

    const uploaded = await uploadFiles("imageUploader", { files: chosen });
    const newAttachments = uploaded.map((f) => ({
      name: f.key,
      contentType: f.type,
      url: f.ufsUrl,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    setFiles((prev) => [...prev, ...chosen]);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleContextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setContextFiles((prev) => [...prev, ...newFiles]);
      setIsContextExpanded(true);

      // Here you would typically process these files for your RAG system
      console.log("Context files to process:", e.target.files);
    }
  };

  const toggleContextExpanded = () => {
    setIsContextExpanded((prev) => !prev);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeContextFile = (id: string) => {
    setContextFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleContextUploadClick = () => {
    contextFileInputRef.current?.click();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("doc")) return "📝";
    if (fileType.includes("csv") || fileType.includes("excel")) return "📊";
    if (fileType.includes("json")) return "{ }";
    if (fileType.includes("text")) return "📃";
    return "📁";
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();
    e.preventDefault();
    setFiles([]);

    handleSubmit(e, { experimental_attachments: attachments });
    console.log("Attachments:", attachments);
    setAttachments([]); 
  };

  const startNewChat = () => {
    // Create a new chat session
    const newSession = {
      id: Date.now().toString(),
      title: "New Chat",
      date: new Date(),
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    setMessages([]);
  };

  const selectChatSession = (sessionId: string) => {
    // In a real app, you would load the messages for this session from storage
    setCurrentSession(sessionId);
    // Simulating loading messages for the selected chat
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-[#F9F6EE]">
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar className="border-r border-[#8F8181]/20">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">VISOR</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={startNewChat}>
                  <Plus size={18} />
                  <span>New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {chatSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => selectChatSession(session.id)}
                    isActive={currentSession === session.id}
                  >
                    <MessageSquare size={18} />
                    <span>{session.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          {/* Context Upload Section in Sidebar Footer */}
          <SidebarFooter className="flex flex-col">
            <SidebarSeparator />

            {/* Context Section Header */}
            <div
              className="p-3 flex justify-between items-center cursor-pointer"
              onClick={toggleContextExpanded}
            >
              <div className="flex items-center gap-2 text-[#8F8181]">
                <Database size={16} />
                <span className="text-sm font-medium">Context Files</span>
              </div>
              {isContextExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </div>

            {/* Context Upload Button */}
            <div
              className={`px-3 pb-2 ${isContextExpanded ? "block" : "hidden"}`}
            >
              <button
                onClick={handleContextUploadClick}
                className="w-full py-2 px-3 bg-[#F9F6EE] text-[#8F8181] rounded border border-[#8F8181]/20 hover:bg-[#F9F6EE]/70 flex items-center justify-center gap-2 text-sm"
              >
                <Upload size={14} />
                <span>Upload Context</span>
              </button>
              <input
                type="file"
                ref={contextFileInputRef}
                onChange={handleContextFileChange}
                className="hidden"
                multiple
                accept=".txt,.pdf,.docx,.doc,.csv,.json"
              />
              <div className="text-xs text-[#8F8181]/60 mt-1 text-center">
                Supports .txt, .pdf, .docx, .csv, .json
              </div>
            </div>

            {/* Context Files List */}
            {contextFiles.length > 0 && isContextExpanded && (
              <div className="max-h-40 overflow-y-auto px-3 pb-3">
                <div className="space-y-1">
                  {contextFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-[#F9F6EE] p-1.5 rounded text-xs"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[#8F8181]">
                          {getFileIcon(file.type)}
                        </span>
                        <span className="truncate max-w-[120px]">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeContextFile(file.id);
                        }}
                        className="text-[#8F8181] hover:text-red-500 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full">
          {/* Header */}
          <header className="p-4 flex items-center justify-between border-b border-[#8F8181]/2">
            <SidebarTrigger className="mr-2" />
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#8F8181] text-white rounded-tr-none"
                      : "bg-white text-[#8F8181] rounded-tl-none"
                  } shadow-sm`}
                >
                  <div>
                    {message.experimental_attachments?.map(
                      (attachment, index) => (
                        <img
                          key={`${message.id}-${index}`}
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-[80%] rounded-md mb-2"
                        />
                      )
                    )}
                  </div>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-white text-[#8F8181] rounded-tl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#8F8181] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#8F8181] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#8F8181] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="px-4 py-2 bg-white border-t border-[#8F8181]/20">
              <p className="text-sm text-[#8F8181] mb-2">Attached files:</p>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-[#F9F6EE] px-2 py-1 rounded text-sm"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    {/* for image preview  */}
                    {/* <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="max-w-[30%] rounded-md shadow-sm"
                      onLoad={() =>
                        URL.revokeObjectURL(URL.createObjectURL(file))
                      }
                    /> */}

                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 text-[#8F8181] hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Redesigned to match the screenshot */}
          <div className="w-full px-4 py-6 border-[#8F8181]/20">
            <form
              onSubmit={handleSend}
              encType="multipart/form-data"
              className="max-w-4xl mx-auto"
            >
              <div className="relative flex items-center w-full bg-white rounded-full border border-[#8F8181]/20 shadow-sm">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={handleFileUploadClick}
                  className="flex items-center justify-center h-10 w-10 rounded-full text-[#8F8181] hover:bg-[#8F8181]/10 transition-colors ml-1"
                >
                  <Upload size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*" // ← only allow images
                />

                {/* <UploadButton
                  endpoint="imageUploader"
                  // blank out both the “label” and the “allowed-content” regions
                  onClientUploadComplete={(res) => {
                    console.log("uploaded", res);
                  }}
                  onUploadError={(err) => {
                    console.error(err);
                  }}
                  className="mt-4 ut-button:bg-red-500 ut-button:ut-readying:bg-red-500/50"
                /> */}
                {/* </div> */}
                {/* </button> */}

                {/* Text input */}
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything"
                  className="flex-1 h-12 bg-transparent border-0 focus:ring-0 focus:outline-none text-[#8F8181] px-2"
                />

                {/* Send button - only shows when there's input or the AI is responding */}
                {input.trim() || isLoading ? (
                  <button
                    type="submit"
                    disabled={
                      isLoading || (!input.trim() && files.length === 0)
                    }
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-[#8F8181] text-white mr-1 disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                ) : (
                  <div className="w-10 mr-1"></div> /* Spacer when button is hidden */
                )}
              </div>

              {/* Optional hint text */}
              <div className="text-xs text-center mt-2 text-[#8F8181]/60">
                {/* VISOR can process your files and answer questions about them */}
              </div>
            </form>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
