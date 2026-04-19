import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateProjectDetail } from '../CreateProjectDetail';

// ── Store mocks ─────────────────────────────────────────────────
const mockCreateProject = vi.fn();
const mockSelectProject = vi.fn();
const mockClosePanel = vi.fn();

vi.mock('../../../store/projects', () => ({
  useProjectsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      createProject: mockCreateProject,
      selectProject: mockSelectProject,
    }),
}));

vi.mock('../../../store/ui', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      closePanel: mockClosePanel,
    }),
}));

describe('CreateProjectDetail validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateProject.mockResolvedValue({ id: '1', name: 'Test' });
  });

  it('shows error when name is empty on submit', () => {
    render(<CreateProjectDetail />);
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByText('Project name is required')).toBeInTheDocument();
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  it('shows error when name is only whitespace', () => {
    render(<CreateProjectDetail />);
    const nameInput = screen.getByPlaceholderText('Project name');
    fireEvent.change(nameInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByText('Project name is required')).toBeInTheDocument();
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  it('clears name error on typing', () => {
    render(<CreateProjectDetail />);
    fireEvent.click(screen.getByText('Create Project'));
    expect(screen.getByText('Project name is required')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Project name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
  });

  it('shows error when priority is out of range', () => {
    render(<CreateProjectDetail />);
    const nameInput = screen.getByPlaceholderText('Project name');
    const priorityInput = screen.getByPlaceholderText('0–5');

    fireEvent.change(nameInput, { target: { value: 'My Project' } });
    fireEvent.change(priorityInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByText('Priority must be 0–5')).toBeInTheDocument();
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  it('shows error when priority is negative', () => {
    render(<CreateProjectDetail />);
    const nameInput = screen.getByPlaceholderText('Project name');
    const priorityInput = screen.getByPlaceholderText('0–5');

    fireEvent.change(nameInput, { target: { value: 'My Project' } });
    fireEvent.change(priorityInput, { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByText('Priority must be 0–5')).toBeInTheDocument();
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  it('allows empty priority (optional field)', async () => {
    render(<CreateProjectDetail />);
    const nameInput = screen.getByPlaceholderText('Project name');

    fireEvent.change(nameInput, { target: { value: 'My Project' } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.queryByText('Priority must be 0–5')).not.toBeInTheDocument();
      expect(mockCreateProject).toHaveBeenCalled();
    });
  });

  it('allows valid priority values 0–5', async () => {
    render(<CreateProjectDetail />);
    const nameInput = screen.getByPlaceholderText('Project name');
    const priorityInput = screen.getByPlaceholderText('0–5');

    fireEvent.change(nameInput, { target: { value: 'My Project' } });
    fireEvent.change(priorityInput, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.queryByText('Priority must be 0–5')).not.toBeInTheDocument();
      expect(mockCreateProject).toHaveBeenCalled();
    });
  });

  it('sets aria-invalid on name input when error is shown', () => {
    render(<CreateProjectDetail />);
    fireEvent.click(screen.getByText('Create Project'));

    const nameInput = screen.getByPlaceholderText('Project name');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });
});
