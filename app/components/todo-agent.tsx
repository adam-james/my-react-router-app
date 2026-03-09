import { useState, useRef, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

const COMMANDS = [
  { cmd: "add <task>", desc: "Add a new todo" },
  { cmd: "done <number>", desc: "Mark a todo as complete" },
  { cmd: "undo <number>", desc: "Mark a todo as incomplete" },
  { cmd: "remove <number>", desc: "Delete a todo" },
  { cmd: "clear done", desc: "Remove all completed todos" },
  { cmd: "list", desc: "Show all todos" },
  { cmd: "help", desc: "Show available commands" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function parseTodoCommand(
  input: string,
  todos: Todo[]
): { response: string; updatedTodos: Todo[] } {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "help") {
    const lines = COMMANDS.map((c) => `  ${c.cmd} — ${c.desc}`).join("\n");
    return { response: `Here's what I can do:\n\n${lines}`, updatedTodos: todos };
  }

  if (lower === "list") {
    if (todos.length === 0) {
      return { response: "Your list is empty. Try adding something with **add <task>**.", updatedTodos: todos };
    }
    const lines = todos.map(
      (t, i) => `  ${i + 1}. ${t.completed ? "~~" + t.text + "~~" : t.text} ${t.completed ? "✓" : ""}`
    );
    const done = todos.filter((t) => t.completed).length;
    return {
      response: `Here are your todos (${done}/${todos.length} done):\n\n${lines.join("\n")}`,
      updatedTodos: todos,
    };
  }

  if (lower.startsWith("add ")) {
    const text = trimmed.slice(4).trim();
    if (!text) {
      return { response: "Please provide a task description. Example: **add Buy groceries**", updatedTodos: todos };
    }
    const newTodo: Todo = { id: uid(), text, completed: false, createdAt: Date.now() };
    const updated = [...todos, newTodo];
    return {
      response: `Added **"${text}"** to your list. You now have ${updated.length} todo${updated.length > 1 ? "s" : ""}.`,
      updatedTodos: updated,
    };
  }

  if (lower.startsWith("done ")) {
    const num = parseInt(trimmed.slice(5), 10);
    if (isNaN(num) || num < 1 || num > todos.length) {
      return { response: `Invalid todo number. You have ${todos.length} todo${todos.length !== 1 ? "s" : ""}.`, updatedTodos: todos };
    }
    const updated = todos.map((t, i) => (i === num - 1 ? { ...t, completed: true } : t));
    return { response: `Marked **"${todos[num - 1].text}"** as done. Nice work!`, updatedTodos: updated };
  }

  if (lower.startsWith("undo ")) {
    const num = parseInt(trimmed.slice(5), 10);
    if (isNaN(num) || num < 1 || num > todos.length) {
      return { response: `Invalid todo number. You have ${todos.length} todo${todos.length !== 1 ? "s" : ""}.`, updatedTodos: todos };
    }
    const updated = todos.map((t, i) => (i === num - 1 ? { ...t, completed: false } : t));
    return { response: `Marked **"${todos[num - 1].text}"** as not done.`, updatedTodos: updated };
  }

  if (lower.startsWith("remove ")) {
    const num = parseInt(trimmed.slice(7), 10);
    if (isNaN(num) || num < 1 || num > todos.length) {
      return { response: `Invalid todo number. You have ${todos.length} todo${todos.length !== 1 ? "s" : ""}.`, updatedTodos: todos };
    }
    const removed = todos[num - 1];
    const updated = todos.filter((_, i) => i !== num - 1);
    return { response: `Removed **"${removed.text}"** from your list.`, updatedTodos: updated };
  }

  if (lower === "clear done") {
    const doneCount = todos.filter((t) => t.completed).length;
    if (doneCount === 0) {
      return { response: "No completed todos to clear.", updatedTodos: todos };
    }
    const updated = todos.filter((t) => !t.completed);
    return { response: `Cleared ${doneCount} completed todo${doneCount > 1 ? "s" : ""}.`, updatedTodos: updated };
  }

  return {
    response: `I didn't understand that. Type **help** to see what I can do.`,
    updatedTodos: todos,
  };
}

function renderMarkdownLite(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|~~(.+?)~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<span key={match.index} className="line-through opacity-60">{match[3]}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function TodoAgent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "agent",
      content:
        "Hey! I'm your todo list agent. Tell me what you need to get done and I'll keep track of it.\n\nType **help** to see all commands, or just say **add <task>** to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setTodos((currentTodos) => {
        const { response, updatedTodos } = parseTodoCommand(text, currentTodos);
        const agentMsg: Message = { id: uid(), role: "agent", content: response };
        setMessages((prev) => [...prev, agentMsg]);
        setIsTyping(false);
        return updatedTodos;
      });
    }, 400 + Math.random() * 400);
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col h-[90vh] bg-flame-900/50 rounded-2xl border border-flame-700/40 shadow-2xl shadow-ember-900/30 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 py-5 bg-gradient-to-r from-ember-600 to-flame-500 border-b border-flame-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl backdrop-blur-sm">
                🔥
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Todo Agent</h1>
                <p className="text-xs text-flame-200/80">
                  {todos.length === 0
                    ? "No tasks yet"
                    : `${completedCount}/${todos.length} tasks completed`}
                </p>
              </div>
            </div>
            {todos.length > 0 && (
              <div className="text-right">
                <span className="text-sm font-semibold text-white">{Math.round(progress)}%</span>
              </div>
            )}
          </div>
          {todos.length > 0 && (
            <div className="mt-3 h-1.5 bg-flame-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-flame-300 to-ember-300 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-flame-500 text-white rounded-br-md shadow-lg shadow-flame-900/30"
                    : "bg-flame-800/60 text-flame-100 rounded-bl-md border border-flame-700/30"
                }`}
              >
                {msg.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {renderMarkdownLite(line)}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-flame-800/60 border border-flame-700/30 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-flame-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-flame-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-ember-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-4 py-4 border-t border-flame-700/40 bg-flame-900/30"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command... (try 'help')"
              className="flex-1 bg-flame-800/50 border border-flame-700/40 rounded-xl px-4 py-3 text-sm text-flame-100 placeholder:text-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-400/50 focus:border-flame-400/50 transition-all"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-ember-500 to-flame-500 hover:from-ember-400 hover:to-flame-400 text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-ember-900/40 cursor-pointer"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
