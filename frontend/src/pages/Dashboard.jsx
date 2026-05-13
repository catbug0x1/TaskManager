import { useState, useEffect } from 'react'

export default function Dashboard({ apiBase, token, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${apiBase}/tasks`, { headers })
      if (!res.ok) throw new Error('Failed to fetch tasks')
      setTasks(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [token])

  const createTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const res = await fetch(`${apiBase}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error('Failed to create task')
      setTitle('')
      setDescription('')
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleDone = async (task) => {
    try {
      const res = await fetch(`${apiBase}/tasks/${task.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${apiBase}/tasks/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error('Failed to delete task')
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Task Manager</h1>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </header>

      <main style={styles.main}>
        <form style={styles.form} onSubmit={createTask}>
          <input
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            style={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button style={styles.addBtn} type="submit">Add Task</button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p style={styles.loading}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={styles.empty}>No tasks yet. Create one above!</p>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.id} style={{
                ...styles.taskCard,
                opacity: task.completed ? 0.6 : 1,
              }}>
                <div style={styles.taskInfo}>
                  <h3 style={{
                    ...styles.taskTitle,
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}>{task.title}</h3>
                  {task.description && (
                    <p style={styles.taskDesc}>{task.description}</p>
                  )}
                  <span style={styles.taskDate}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.taskActions}>
                  <button
                    style={{
                      ...styles.doneBtn,
                      background: task.completed ? '#f59e0b' : '#10b981',
                    }}
                    onClick={() => toggleDone(task)}
                  >
                    {task.completed ? 'Undo' : 'Done'}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  header: {
    background: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.4rem',
    color: '#4f46e5',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#666',
  },
  main: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: '1 1 200px',
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '3rem',
    fontSize: '1.1rem',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  taskCard: {
    background: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'opacity 0.2s',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: '1.05rem',
    marginBottom: '0.25rem',
  },
  taskDesc: {
    color: '#666',
    fontSize: '0.9rem',
  },
  taskDate: {
    color: '#999',
    fontSize: '0.8rem',
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
    marginLeft: '1rem',
  },
  doneBtn: {
    padding: '0.4rem 0.8rem',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '0.4rem 0.8rem',
    background: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
}
