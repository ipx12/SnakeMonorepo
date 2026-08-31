import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../components/dashboard/TaskList';
import type { Task } from '../lib/api';

describe('TaskList Component', () => {
  const mockTaskList: Task[] = [
    {
      id: 'task-1',
      title: 'Setup Vitest Testing',
      description: 'Configure frontend unit tests',
      completed: false,
      userId: 'user-123',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Review Monorepo AGENTS.md',
      description: 'Ensure rules are documented',
      completed: true,
      userId: 'user-123',
      createdAt: new Date().toISOString(),
    },
  ];

  it('should render loading spinner when isTasksLoading is true', () => {
    render(
      <TaskList
        items={[]}
        loading={true}
        editingItem={null}
        editTitle=""
        editDescription=""
        setEditTitle={vi.fn()}
        setEditDescription={vi.fn()}
        onRefresh={vi.fn()}
        onToggle={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should render empty state message when task list is empty', () => {
    render(
      <TaskList
        items={[]}
        loading={false}
        editingItem={null}
        editTitle=""
        editDescription=""
        setEditTitle={vi.fn()}
        setEditDescription={vi.fn()}
        onRefresh={vi.fn()}
        onToggle={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('No tasks available.')).toBeInTheDocument();
  });

  it('should render list of tasks correctly', () => {
    render(
      <TaskList
        items={mockTaskList}
        loading={false}
        editingItem={null}
        editTitle=""
        editDescription=""
        setEditTitle={vi.fn()}
        setEditDescription={vi.fn()}
        onRefresh={vi.fn()}
        onToggle={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Setup Vitest Testing')).toBeInTheDocument();
    expect(screen.getByText('Review Monorepo AGENTS.md')).toBeInTheDocument();
  });

  it('should trigger onDelete callback when delete button is clicked', async () => {
    const mockDeleteHandler = vi.fn();

    render(
      <TaskList
        items={mockTaskList}
        loading={false}
        editingItem={null}
        editTitle=""
        editDescription=""
        setEditTitle={vi.fn()}
        setEditDescription={vi.fn()}
        onRefresh={vi.fn()}
        onToggle={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={mockDeleteHandler}
      />
    );

    const deleteButtons = screen.getAllByTitle('Delete');
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteHandler).toHaveBeenCalledWith('task-1');
  });
});
