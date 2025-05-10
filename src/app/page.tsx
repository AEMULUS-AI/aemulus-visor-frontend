"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Upload, Plus, MessageSquare } from "lucide-react";
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
} from "@/components/ui/sidebar";

type ChatSession = {
  id: string;
  title: string;
  date: Date;
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here you would typically handle the files, perhaps uploading them
    // to your server or processing them for the RAG system
    console.log("Files to process:", files);

    // Clear files after submission
    setFiles([]);

    // Submit the text input
    handleSubmit(e);
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
          <SidebarFooter className="p-4">
            <div className="text-xs text-[#8F8181]/70">
              {/* Powered by RAG LLM System */}
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full">
          {/* Header */}
          <header className="p-4 flex items-center justify-between border-b border-[#8F8181]/2">
            {/* <div className="flex items-center"> */}
              <SidebarTrigger className="mr-2" />
              {/* <h1 className="text-xl font-bold text-[#8F8181]">VISOR</h1> */}
            {/* </div> */}
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#8F8181] text-white rounded-tr-none"
                      : "bg-white text-[#8F8181] rounded-tl-none"
                  } shadow-sm`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      )
                    }
                    return null
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
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
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
                />

                {/* Text input */}
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything"
                  className="flex-1 h-12 bg-transparent border-0 focus:ring-0 focus:outline-none text-[#8F8181] px-2"
                />

                {/* Send button - only shows when there's input or the AI is responding */}
                { input.trim() || isLoading ? (
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
