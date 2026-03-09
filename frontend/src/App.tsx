import { useState, useEffect, type KeyboardEvent } from 'react';
import { Check, Edit2, Plus, Trash2, ListTodo } from 'lucide-react';
import './index.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('premium-todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          // Handle migrated dates
          createdAt: typeof t.createdAt === 'string' ? Date.parse(t.createdAt) : t.createdAt || Date.now()
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('premium-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!inputValue.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      priority: 'medium',
      createdAt: Date.now()
    };
    
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) {
      deleteTodo(id);
      return;
    }
    
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: editValue.trim() } : todo
    ));
    setEditingId(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const filteredTodos = getFilteredTodos();

  return (
    <div className="glass-panel">
      <div className="header">
        <h1>SyncTask Pro</h1>
        <p>Elevate your productivity today</p>
      </div>

      <div className="todo-form">
        <input 
          type="text" 
          className="todo-input" 
          placeholder="What needs to be done?" 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        
        <button className="add-btn" onClick={addTodo} aria-label="Add Todo">
          <Plus size={20} />
        </button>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <div className="empty-state">
            <ListTodo className="empty-icon" />
            <p>Ready to accomplish great things?</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks match this filter.</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div 
                className="checkbox-container" 
                onClick={() => toggleTodo(todo.id)}
              >
                <Check className="checkbox-icon" />
              </div>
              
              <div className="todo-content">
                {editingId === todo.id ? (
                  <input
                    type="text"
                    className="edit-input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={e => handleEditKeyDown(e, todo.id)}
                    autoFocus
                  />
                ) : (
                  <span 
                    className="todo-text" 
                    onDoubleClick={() => startEdit(todo)}
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              
              <div className="todo-actions">
                {editingId !== todo.id && (
                  <button 
                    className="action-btn" 
                    onClick={() => startEdit(todo)}
                    title="Edit Task"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <button 
                  className="action-btn delete" 
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {todos.length > 0 && (
        <div className="stats">
          <span>{activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining</span>
          {todos.some(t => t.completed) && (
            <button className="clear-btn" onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
