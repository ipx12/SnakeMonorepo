import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toaster, toast } from '../components/ui/sonner';

describe('Watermelon UI Sonner Component', () => {
  it('should render Toaster container without crashing', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });

  it('should render success toast notification when toast.success is triggered', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('Task created successfully');
    });

    const successToastMessage = await screen.findByText('Task created successfully');
    expect(successToastMessage).toBeInTheDocument();
  });

  it('should render error toast notification when toast.error is triggered', async () => {
    render(<Toaster />);

    act(() => {
      toast.error('Something went wrong');
    });

    const errorToastMessage = await screen.findByText('Something went wrong');
    expect(errorToastMessage).toBeInTheDocument();
  });

  it('should support toast descriptions and titles', async () => {
    render(<Toaster />);

    act(() => {
      toast('Notification Title', {
        description: 'Detailed description about the action',
      });
    });

    const titleElement = await screen.findByText('Notification Title');
    const descriptionElement = await screen.findByText('Detailed description about the action');
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
  });
});
