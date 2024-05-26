"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './page.module.css';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const Index = () => {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [newTodo, setNewTodo] = useState({ id: uuidv4() ,title: '', description: '', completed: false });

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('/api/todos');
        const data = await response.json();
        setTodos(data.todos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      });
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodo({ title: '', description: '', completed: false });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = (id: string, updatedTodo: Todo) => {
    setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Todo List</h1>
      <form onSubmit={addTodo} className={styles.form}>
        <input
          type="text"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="Title"
          required
          className={styles.input}
        />
        <input
          type="text"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          placeholder="Description"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Add Todo</button>
      </form>
      {todos.map((todo) => (
        <div key={todo.id} className={styles.todo}>
          <div className={styles.todoContent}>
            <h2 className={styles.todoTitle}>{todo.title}</h2>
            <p className={styles.todoDescription}>{todo.description}</p>
          </div>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => updateTodo(todo.id, { ...todo, completed: e.target.checked })}
            className={styles.checkbox}
          />
          <button onClick={() => deleteTodo(todo.id)} className={styles.deleteButton}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Index;