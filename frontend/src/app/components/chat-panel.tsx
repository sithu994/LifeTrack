import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Send, X, Minimize2, Maximize2, Paperclip, Image as ImageIcon, Smile, Download, Check, CheckCheck, Users, User, Search, Plus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ChatMessage {
  id: string;
  sender: 'staff' | 'supplier';
  senderName: string;
  supplierId?: string; // Supplier ID for supplier messages
  recipientId?: string; // For staff messages: specific supplier ID or 'all'
  message: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  read?: boolean;
}

interface TypingStatus {
  userRole: 'staff' | 'supplier';
  timestamp: number;
}

interface ChatPanelProps {
  userRole: 'staff' | 'supplier';
  userName: string;
  supplierId?: string; // Required for suppliers
}

export default function ChatPanel({ userRole, userName, supplierId }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all'); // For staff: 'all' or specific supplier ID
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]); // List of supplier IDs
  const [supplierSearchQuery, setSupplierSearchQuery] = useState(''); // Search query for suppliers
  const [showSupplierSearch, setShowSupplierSearch] = useState(false); // Show/hide search dropdown
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '✅', '👌', '🙏', '💚', '🌿', '☕', '📊', '✨', '🔥'];

  // Urgent keywords to highlight
  const urgentKeywords = ['pohora illanawa', 'පොහොර ඉල්ලනවා', 'the kola illanawa', 'තේ කොළ ඉල්ලනවා', 'urgent', 'හදිසි', 'ප්‍රශ්නයක්', 'problem'];

  // Check if message contains urgent keywords
  const isUrgentMessage = (message: string) => {
    return urgentKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  };

  // Load available suppliers from tea entries
  useEffect(() => {
    if (userRole === 'staff') {
      const teaEntries = localStorage.getItem('teaEntries');
      if (teaEntries) {
        const entries = JSON.parse(teaEntries);
        const uniqueSuppliers = Array.from(new Set(entries.map((entry: any) => entry.supplierId))) as string[];
        setAvailableSuppliers(uniqueSuppliers.sort());
      }
    }
  }, [userRole]);

  // Load messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        
        // Filter messages based on user role and selected supplier
        let filteredMessages = parsed;
        
        if (userRole === 'staff') {
          // Staff sees messages for selected supplier or all messages
          if (selectedSupplier === 'all') {
            filteredMessages = parsed; // Show all messages
          } else {
            // Show messages to/from specific supplier
            filteredMessages = parsed.filter((msg: ChatMessage) => 
              msg.supplierId === selectedSupplier || 
              msg.recipientId === selectedSupplier || 
              msg.recipientId === 'all'
            );
          }
        } else {
          // Supplier only sees messages for their ID
          filteredMessages = parsed.filter((msg: ChatMessage) => 
            msg.supplierId === supplierId || 
            msg.recipientId === supplierId || 
            msg.recipientId === 'all'
          );
        }
        
        // Mark messages as read when chat is open
        if (isOpen) {
          const updatedMessages = parsed.map((msg: ChatMessage) => {
            if (msg.sender !== userRole && !msg.read) {
              // For suppliers, only mark their own messages as read
              if (userRole === 'supplier' && (msg.supplierId === supplierId || msg.recipientId === supplierId || msg.recipientId === 'all')) {
                return { ...msg, read: true };
              }
              // For staff, mark based on selected supplier
              if (userRole === 'staff' && (selectedSupplier === 'all' || msg.supplierId === selectedSupplier)) {
                return { ...msg, read: true };
              }
            }
            return msg;
          });
          
          if (JSON.stringify(updatedMessages) !== JSON.stringify(parsed)) {
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          }
          setMessages(filteredMessages);
        } else {
          setMessages(filteredMessages);
        }
        
        // Count unread messages
        if (!isOpen) {
          const unread = filteredMessages.filter((msg: ChatMessage) => 
            msg.sender !== userRole && !msg.read
          ).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(0);
        }
      }

      // Check typing status
      const typingStatus = localStorage.getItem('typingStatus');
      if (typingStatus) {
        const status: TypingStatus = JSON.parse(typingStatus);
        const isRecent = Date.now() - status.timestamp < 3000;
        setIsTyping(isRecent && status.userRole !== userRole);
      }

      // Check online status
      const onlineStatus = localStorage.getItem('onlineStatus');
      if (onlineStatus) {
        const statuses = JSON.parse(onlineStatus);
        const otherRole = userRole === 'staff' ? 'supplier' : 'staff';
        const lastSeen = statuses[otherRole];
        setOtherUserOnline(lastSeen && Date.now() - lastSeen < 10000);
      }
    };

    loadMessages();
    
    // Poll for new messages every 1 second
    const interval = setInterval(loadMessages, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, userRole, supplierId, selectedSupplier]);

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const onlineStatus = localStorage.getItem('onlineStatus') || '{}';
      const statuses = JSON.parse(onlineStatus);
      statuses[userRole] = Date.now();
      localStorage.setItem('onlineStatus', JSON.stringify(statuses));
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 5000);
    
    return () => clearInterval(interval);
  }, [userRole]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleTyping = () => {
    const typingStatus: TypingStatus = {
      userRole,
      timestamp: Date.now(),
    };
    localStorage.setItem('typingStatus', JSON.stringify(typingStatus));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      localStorage.removeItem('typingStatus');
    }, 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userRole,
      senderName: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false,
    };

    // Add supplier ID for supplier messages
    if (userRole === 'supplier' && supplierId) {
      message.supplierId = supplierId;
    }

    // Add recipient ID for staff messages
    if (userRole === 'staff') {
      message.recipientId = selectedSupplier; // 'all' or specific supplier ID
    }

    // Load all messages and append
    const savedMessages = localStorage.getItem('chatMessages');
    const allMessages = savedMessages ? JSON.parse(savedMessages) : [];
    const updatedMessages = [...allMessages, message];
    
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    localStorage.removeItem('typingStatus');
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: userRole,
        senderName: userName,
        message: type === 'image' ? 'Sent an image' : 'Sent a file',
        timestamp: new Date().toISOString(),
        type,
        fileUrl: event.target?.result as string,
        fileName: file.name,
        read: false,
      };

      // Add supplier ID for supplier messages
      if (userRole === 'supplier' && supplierId) {
        message.supplierId = supplierId;
      }

      // Add recipient ID for staff messages
      if (userRole === 'staff') {
        message.recipientId = selectedSupplier;
      }

      // Load all messages and append
      const savedMessages = localStorage.getItem('chatMessages');
      const allMessages = savedMessages ? JSON.parse(savedMessages) : [];
      const updatedMessages = [...allMessages, message];
      
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  // Filter suppliers based on search query
  const filteredSuppliers = availableSuppliers.filter(id => 
    id.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  // Handle supplier selection from search
  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setSupplierSearchQuery('');
    setShowSupplierSearch(false);
  };

  // Handle custom supplier ID entry
  const handleCustomSupplierEntry = (customId: string) => {
    if (customId.trim()) {
      setSelectedSupplier(customId.trim().toUpperCase());
      setSupplierSearchQuery('');
      setShowSupplierSearch(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
      >
        <MessageCircle className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <Card className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'} shadow-2xl border-green-200 z-50 transition-all duration-300`}>
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Chat | චැට්
            </CardTitle>
            {userRole === 'staff' && !isMinimized && (
              <div className="mt-2 space-y-2">
                {/* Quick Select Dropdown */}
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Suppliers | සියලු සැපයුම්කරුවන්
                      </div>
                    </SelectItem>
                    {availableSuppliers.map(id => (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {id}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search Supplier by ID */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/70" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search Supplier ID... | සැපයුම්කරු ID..."
                      value={supplierSearchQuery}
                      onChange={(e) => {
                        setSupplierSearchQuery(e.target.value);
                        setShowSupplierSearch(true);
                      }}
                      onFocus={() => setShowSupplierSearch(true)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-sm h-8 pl-7"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {showSupplierSearch && supplierSearchQuery && (
                    <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-green-200 max-h-48 overflow-auto z-50">
                      {filteredSuppliers.length > 0 ? (
                        <>
                          {filteredSuppliers.map(id => (
                            <button
                              key={id}
                              onClick={() => handleSupplierSelect(id)}
                              className="w-full px-3 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-sm text-gray-800"
                            >
                              <User className="w-4 h-4 text-green-600" />
                              {id}
                            </button>
                          ))}
                          {/* Option to use custom ID */}
                          {supplierSearchQuery && !availableSuppliers.includes(supplierSearchQuery.toUpperCase()) && (
                            <button
                              onClick={() => handleCustomSupplierEntry(supplierSearchQuery)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm border-t border-gray-200 text-blue-700"
                            >
                              <Plus className="w-4 h-4" />
                              Use "{supplierSearchQuery.toUpperCase()}" (Custom ID)
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          No suppliers found
                          <button
                            onClick={() => handleCustomSupplierEntry(supplierSearchQuery)}
                            className="mt-2 w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm text-blue-700 rounded"
                          >
                            <Plus className="w-4 h-4" />
                            Use "{supplierSearchQuery.toUpperCase()}" (Custom ID)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Supplier Display */}
                {selectedSupplier !== 'all' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/30 text-white text-xs border-white/30">
                      <User className="w-3 h-3 mr-1" />
                      Selected: {selectedSupplier}
                    </Badge>
                    <button
                      onClick={() => setSelectedSupplier('all')}
                      className="text-xs text-white/80 hover:text-white underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
            {userRole === 'supplier' && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                  ID: {supplierId}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${otherUserOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
              <p className="text-xs text-green-100">
                {otherUserOnline ? (userRole === 'staff' ? 'Supplier Online' : 'Staff Online') : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-96 p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">පණිවිඩ නැත</p>
                  {userRole === 'staff' && selectedSupplier !== 'all' && (
                    <p className="text-xs mt-2 text-green-600">Start chatting with {selectedSupplier}</p>
                  )}
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender === userRole && (userRole === 'supplier' ? msg.supplierId === supplierId : true);
                  const isUrgent = isUrgentMessage(msg.message);
                  const isBroadcast = msg.recipientId === 'all';
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isUrgent 
                            ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg' 
                            : isOwnMessage
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                            : 'bg-white border border-green-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {/* Supplier ID Badge for supplier messages */}
                          {msg.sender === 'supplier' && msg.supplierId && (
                            <Badge variant="outline" className={`text-xs ${isUrgent ? 'bg-yellow-200 border-yellow-600' : isOwnMessage ? 'bg-white/20 text-white border-white/30' : 'bg-green-100 text-green-800 border-green-300'}`}>
                              {msg.supplierId}
                            </Badge>
                          )}
                          
                          {/* Broadcast indicator */}
                          {isBroadcast && (
                            <Badge variant="outline" className={`text-xs ${isOwnMessage ? 'bg-white/20 text-white border-white/30' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                              <Users className="w-3 h-3 mr-1" />
                              All
                            </Badge>
                          )}
                          
                          <p className={`text-xs font-semibold ${isUrgent ? 'text-yellow-900' : isOwnMessage ? 'text-green-100' : 'text-green-700'}`}>
                            {msg.senderName}
                          </p>
                          <span className={`text-xs ${isUrgent ? 'text-yellow-700' : isOwnMessage ? 'text-green-200' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Urgent indicator */}
                        {isUrgent && (
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-xs font-bold text-red-600 uppercase">⚠️ Urgent | හදිසි</span>
                          </div>
                        )}
                        
                        {/* Text Message */}
                        {msg.type === 'text' && (
                          <p className={`text-sm break-words ${isUrgent ? 'text-gray-900 font-medium' : ''}`}>{msg.message}</p>
                        )}
                        
                        {/* Image Message */}
                        {msg.type === 'image' && msg.fileUrl && (
                          <div className="mt-2">
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName} 
                              className="max-w-full rounded-lg max-h-48 object-cover"
                            />
                            <p className="text-xs mt-1 opacity-75">{msg.fileName}</p>
                          </div>
                        )}
                        
                        {/* File Message */}
                        {msg.type === 'file' && msg.fileUrl && (
                          <a 
                            href={msg.fileUrl} 
                            download={msg.fileName}
                            className={`flex items-center gap-2 mt-1 p-2 rounded ${isOwnMessage ? 'bg-white/20' : 'bg-green-50'}`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-xs">{msg.fileName}</span>
                            <Download className="w-3 h-3 ml-auto" />
                          </a>
                        )}

                        {/* Read Receipt */}
                        {isOwnMessage && (
                          <div className="flex justify-end mt-1">
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-green-200" />
                            ) : (
                              <Check className="w-3 h-3 text-green-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-green-200 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="px-4 py-2 bg-white border-t border-green-100">
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-green-100">
            {userRole === 'staff' && selectedSupplier !== 'all' && (
              <div className="mb-2 text-xs text-gray-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                Chatting with {selectedSupplier}
              </div>
            )}
            {userRole === 'staff' && selectedSupplier === 'all' && (
              <div className="mb-2 text-xs text-blue-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Broadcasting to all suppliers | සියලු සැපයුම්කරුවන්ට
              </div>
            )}
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Attachment Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Emoji
                </Button>
              </div>

              {/* Message Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message... | පණිවිඩයක් ටයිප් කරන්න..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="flex-1 border-green-200 focus:border-green-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'file')}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}