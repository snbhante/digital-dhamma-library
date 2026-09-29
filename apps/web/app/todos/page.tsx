"use client";

import { useEffect, useState } from 'react'
import { createClient } from '../../utils/supabase/client'

export default function Page() {
  const [todos, setTodos] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await supabase.from('todos').select()
      setTodos(data)
    }
    
    fetchTodos()
  }, [])

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
