"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorTheme } from "@/lib/theme";

// Types
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  createdAt: number;
  dueDate?: number;
}

interface TodoListProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentTheme: ColorTheme;
}

// Local Storage Key
const TODO_STORAGE_KEY = "focusbolt-todos";
const TODO_CATEGORIES_KEY = "focusbolt-todo-categories";

// Default categories
const DEFAULT_CATEGORIES = ["Work", "Personal", "Study", "Health"];

export function TodoList({ open, onOpenChange, currentTheme }: TodoListProps) {
  const [todos, setTodos] = React.useState<TodoItem[]>([]);
  const [categories, setCategories] = React.useState<string[]>(DEFAULT_CATEGORIES);
  const [newTodo, setNewTodo] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Work");
  const [selectedPriority, setSelectedPriority] = React.useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = React.useState<"all" | "active" | "completed">("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const [showAddCategory, setShowAddCategory] = React.useState(false);
  const [showQuickSettings, setShowQuickSettings] = React.useState(false);
  const [showAllCategories, setShowAllCategories] = React.useState(false);

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);
    const savedCategories = localStorage.getItem(TODO_CATEGORIES_KEY);

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save todos to localStorage
  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  // Save categories to localStorage
  const saveCategories = (updatedCategories: string[]) => {
    setCategories(updatedCategories);
    localStorage.setItem(TODO_CATEGORIES_KEY, JSON.stringify(updatedCategories));
  };

  // Add new todo
  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      priority: selectedPriority,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    saveTodos([...todos, todo]);
    setNewTodo("");
    setShowQuickSettings(false);
  };

  // Toggle todo completion
  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  // Delete todo
  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    saveTodos(updatedTodos);
  };

  // Add new category
  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;

    const updatedCategories = [...categories, newCategory.trim()];
    saveCategories(updatedCategories);
    setNewCategory("");
    setShowAddCategory(false);
    setSelectedCategory(newCategory.trim());
  };

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !todo.completed) ||
      (filter === "completed" && todo.completed);

    const matchesSearch =
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return currentTheme.separatorColor;
    }
  };

  // Stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;

  const isImageTheme = currentTheme.backgroundImage;
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 4);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => onOpenChange?.(true)}
        style={{
          background: currentTheme.background,
          color: currentTheme.digitColor,
          border: `1px solid ${currentTheme.cardBorder}`,
        }}
      >
        To-Do
      </Button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-[2px]"
            style={{
              backgroundColor: isImageTheme ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.25)",
            }}
            onClick={() => onOpenChange?.(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[85vh] border animate-in zoom-in-95 duration-300"
              style={{
                background: isImageTheme ? "rgba(0, 0, 0, 0.85)" : currentTheme.background,
                borderColor: isImageTheme ? "rgba(255, 255, 255, 0.25)" : `${currentTheme.cardBorder}80`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: isImageTheme
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)"
                  : `0 25px 50px -12px ${currentTheme.cardBorder}40`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{
                  borderBottomColor: isImageTheme ? "rgba(255, 255, 255, 0.15)" : currentTheme.cardBorder,
                  background: isImageTheme ? "rgba(0, 0, 0, 0.2)" : "transparent",
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.15)" : `${currentTheme.cardBorder}40`,
                      border: `1px solid ${isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.cardBorder}`,
                    }}
                  >
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isImageTheme ? "rgba(255, 255, 255, 0.95)" : currentTheme.digitColor,
                      }}
                    >
                      To-Do List
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: isImageTheme ? "rgba(255, 255, 255, 0.8)" : currentTheme.separatorColor,
                      }}
                    >
                      {activeTodos} active • {completedTodos} completed • {totalTodos} total
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 border"
                  style={{
                    color: isImageTheme ? "rgba(255, 255, 255, 0.9)" : currentTheme.separatorColor,
                    backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    borderColor: isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.cardBorder,
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div
                className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar"
                style={{
                  background: isImageTheme ? "rgba(0, 0, 0, 0.1)" : "transparent",
                }}
              >
                {/* Add Todo Section */}
                <div
                  className="mb-6 p-5 rounded-2xl border-2 border-dashed transition-all hover:border-solid"
                  style={{
                    backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.05)" : `${currentTheme.background}10`,
                    borderColor: isImageTheme ? "rgba(255, 255, 255, 0.15)" : `${currentTheme.cardBorder}60`,
                  }}
                >
                  {/* Primary Input Row */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Add a new task..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTodo()}
                        onFocus={() => setShowQuickSettings(true)}
                        // onBlur={() => setTimeout(() => setShowQuickSettings(false), 200)}
                        className="w-full px-4 py-3 text-sm rounded-xl border transition-all focus:scale-[1.01] focus:shadow-lg"
                        style={{
                          backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.12)" : currentTheme.background,
                          color: isImageTheme ? "rgba(255, 255, 255, 0.95)" : currentTheme.digitColor,
                          borderColor: isImageTheme ? "rgba(255, 255, 255, 0.25)" : currentTheme.cardBorder,
                        }}
                      />
                      {newTodo.trim() && (
                        <div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: getPriorityColor(selectedPriority) + "20",
                            color: getPriorityColor(selectedPriority),
                          }}
                        >
                          {selectedPriority}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={addTodo}
                      disabled={!newTodo.trim()}
                      className="px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:opacity-50 font-medium shadow-lg"
                      style={{
                        backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.15)" : currentTheme.digitColor,
                        color: isImageTheme ? "rgba(255, 255, 255, 0.95)" : currentTheme.background,
                        border: `1px solid ${isImageTheme ? "rgba(255, 255, 255, 0.3)" : "transparent"}`,
                      }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Settings */}
                  {(newTodo.trim() || showQuickSettings) && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex gap-3 items-center flex-wrap">
                        {/* Category Pills */}
                        <div className="flex gap-2 flex-wrap">
                          {visibleCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-all hover:scale-105 ${
                                selectedCategory === cat ? "ring-2 ring-opacity-40" : ""
                              }`}
                              style={{
                                backgroundColor:
                                  selectedCategory === cat
                                    ? getPriorityColor(selectedPriority) + "20"
                                    : isImageTheme
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "transparent",
                                color:
                                  selectedCategory === cat
                                    ? getPriorityColor(selectedPriority)
                                    : isImageTheme
                                    ? "rgba(255, 255, 255, 0.8)"
                                    : currentTheme.digitColor,
                                borderColor:
                                  selectedCategory === cat
                                    ? getPriorityColor(selectedPriority)
                                    : isImageTheme
                                    ? "rgba(255, 255, 255, 0.2)"
                                    : currentTheme.cardBorder,
                                boxShadow:
                                  selectedCategory === cat
                                    ? `0 0 0 2px ${getPriorityColor(selectedPriority)}40`
                                    : "none",
                              }}
                            >
                              {cat}
                            </button>
                          ))}

                          {categories.length > 4 && (
                            <button
                              onClick={() => setShowAllCategories(!showAllCategories)}
                              className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                              style={{
                                backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.08)" : "transparent",
                                color: isImageTheme ? "rgba(255, 255, 255, 0.7)" : currentTheme.separatorColor,
                                borderColor: isImageTheme ? "rgba(255, 255, 255, 0.2)" : currentTheme.cardBorder,
                              }}
                            >
                              {showAllCategories ? "Less" : `+${categories.length - 4} more`}
                            </button>
                          )}
                        </div>

                        {/* Priority Indicator */}
                        <div className="flex gap-2 items-center ml-auto">
                          <span
                            className="text-xs"
                            style={{
                              color: isImageTheme ? "rgba(255, 255, 255, 0.7)" : currentTheme.separatorColor,
                            }}
                          >
                            Priority:
                          </span>
                          <div className="flex gap-1">
                            {(["low", "medium", "high"] as const).map((priority) => (
                              <button
                                key={priority}
                                onClick={() => setSelectedPriority(priority)}
                                className="w-3 h-3 rounded-full border-2 transition-all hover:scale-125"
                                style={{
                                  backgroundColor:
                                    selectedPriority === priority ? getPriorityColor(priority) : "transparent",
                                  borderColor: getPriorityColor(priority),
                                  boxShadow:
                                    selectedPriority === priority
                                      ? `0 0 0 2px ${getPriorityColor(priority)}40`
                                      : "none",
                                }}
                                title={`${priority} priority`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Add Category */}
                      {!showAddCategory ? (
                        <button
                          onClick={() => setShowAddCategory(true)}
                          className="text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 transition-all"
                          style={{
                            backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.08)" : "transparent",
                            color: isImageTheme ? "rgba(255, 255, 255, 0.8)" : currentTheme.separatorColor,
                            borderColor: isImageTheme ? "rgba(255, 255, 255, 0.2)" : currentTheme.cardBorder,
                          }}
                        >
                          + Add New Category
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCategory()}
                            className="px-3 py-1.5 text-xs rounded-lg border flex-1 max-w-40"
                            style={{
                              backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.1)" : currentTheme.background,
                              color: isImageTheme ? "rgba(255, 255, 255, 0.9)" : currentTheme.digitColor,
                              borderColor: isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.cardBorder,
                            }}
                          />
                          <button
                            onClick={addCategory}
                            disabled={!newCategory.trim()}
                            className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
                            style={{
                              backgroundColor: getPriorityColor("low"),
                              color: "white",
                            }}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategory("");
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
                            style={{
                              backgroundColor: getPriorityColor("high"),
                              color: "white",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Filters and Search */}
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="flex gap-2">
                    {(["all", "active", "completed"] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-3 py-1 text-xs rounded-xl border transition-all capitalize ${
                          filter === filterType ? "opacity-100" : "opacity-60 hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor:
                            filter === filterType
                              ? isImageTheme
                                ? "rgba(255, 255, 255, 0.2)"
                                : currentTheme.digitColor + "20"
                              : isImageTheme
                              ? "rgba(255, 255, 255, 0.1)"
                              : "transparent",
                          color: isImageTheme ? "rgba(255, 255, 255, 0.9)" : currentTheme.digitColor,
                          borderColor: isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.cardBorder,
                        }}
                      >
                        {filterType}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 text-xs rounded-xl border flex-1 max-w-48"
                    style={{
                      backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.1)" : currentTheme.background,
                      color: isImageTheme ? "rgba(255, 255, 255, 0.9)" : currentTheme.digitColor,
                      borderColor: isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.cardBorder,
                    }}
                  />
                </div>

                {/* Todo List */}
                <div className="space-y-3">
                  {filteredTodos.length === 0 ? (
                    <div
                      className="text-center py-8"
                      style={{
                        color: isImageTheme ? "rgba(255, 255, 255, 0.7)" : currentTheme.separatorColor,
                      }}
                    >
                      {todos.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your search."}
                    </div>
                  ) : (
                    filteredTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`p-3 rounded-2xl transition-all hover:scale-[1.01] ${
                          todo.completed ? "opacity-60" : ""
                        }`}
                        style={{
                          backgroundColor: isImageTheme ? "rgba(255, 255, 255, 0.08)" : `${currentTheme.background}20`,
                          borderTop: `1px solid ${
                            isImageTheme ? "rgba(255, 255, 255, 0.2)" : currentTheme.cardBorder
                          }`,
                          borderRight: `1px solid ${
                            isImageTheme ? "rgba(255, 255, 255, 0.2)" : currentTheme.cardBorder
                          }`,
                          borderBottom: `1px solid ${
                            isImageTheme ? "rgba(255, 255, 255, 0.2)" : currentTheme.cardBorder
                          }`,
                          borderLeft: `3px solid ${getPriorityColor(todo.priority)}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className="w-5 h-5 rounded border-2 flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                              style={{
                                borderColor: getPriorityColor(todo.priority),
                                backgroundColor: todo.completed ? getPriorityColor(todo.priority) : "transparent",
                              }}
                            >
                              {todo.completed && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm font-medium ${todo.completed ? "line-through" : ""}`}
                                style={{
                                  color: isImageTheme ? "rgba(255, 255, 255, 0.9)" : currentTheme.digitColor,
                                }}
                              >
                                {todo.text}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: getPriorityColor(todo.priority) + "20",
                                    color: getPriorityColor(todo.priority),
                                  }}
                                >
                                  {todo.category}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{
                                    color: isImageTheme ? "rgba(255, 255, 255, 0.6)" : currentTheme.separatorColor,
                                  }}
                                >
                                  {todo.priority}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-1 rounded-lg hover:scale-110 transition-transform"
                            style={{
                              color: getPriorityColor("high"),
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M4 7l16 0" />
                              <path d="M10 11l0 6" />
                              <path d="M14 11l0 6" />
                              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: ${isImageTheme ? "rgba(255, 255, 255, 0.1)" : currentTheme.cardBorder + "20"};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${isImageTheme ? "rgba(255, 255, 255, 0.4)" : currentTheme.cardBorder};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${isImageTheme ? "rgba(255, 255, 255, 0.6)" : currentTheme.digitColor + "80"};
            }

            @keyframes zoom-in-95 {
              0% {
                transform: scale(0.95);
                opacity: 0;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }

            @keyframes slide-in-from-top-2 {
              0% {
                transform: translateY(-8px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }

            .animate-in {
              animation-fill-mode: both;
            }
            .zoom-in-95 {
              animation-name: zoom-in-95;
            }
            .slide-in-from-top-2 {
              animation-name: slide-in-from-top-2;
            }
            .duration-300 {
              animation-duration: 300ms;
            }
            .duration-200 {
              animation-duration: 200ms;
            }

            input:focus,
            select:focus {
              outline: none;
              box-shadow: 0 0 0 2px
                ${isImageTheme ? "rgba(255, 255, 255, 0.3)" : currentTheme.digitColor + "40"};
            }
          `}</style>
        </>
      )}
    </>
  );
}
