import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolDetail } from '../ToolDetail';

// ── Store mocks ─────────────────────────────────────────────────
const mockCreateTool = vi.fn();
const mockUpdateTool = vi.fn();
const mockDeleteTool = vi.fn();
const mockSelectTool = vi.fn();
const mockClosePanel = vi.fn();

vi.mock('../../../store/tools', () => ({
  useToolsStore: () => ({
    selectedTool: null,
    selectedToolId: 'new',
    createTool: mockCreateTool,
    updateTool: mockUpdateTool,
    deleteTool: mockDeleteTool,
    selectTool: mockSelectTool,
  }),
}));

vi.mock('../../../store/ui', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      closePanel: mockClosePanel,
    }),
}));

describe('ToolDetail validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTool.mockResolvedValue({ id: '1', name: 'Test Tool' });
  });

  it('shows error when name is empty on save', () => {
    render(<ToolDetail />);
    fireEvent.click(screen.getByLabelText('Save tool'));

    expect(screen.getByText('Tool name is required')).toBeInTheDocument();
    expect(mockCreateTool).not.toHaveBeenCalled();
  });

  it('clears name error on typing', () => {
    render(<ToolDetail />);
    fireEvent.click(screen.getByLabelText('Save tool'));
    expect(screen.getByText('Tool name is required')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Tool name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    expect(screen.queryByText('Tool name is required')).not.toBeInTheDocument();
  });

  it('shows error for invalid URL', () => {
    render(<ToolDetail />);
    const nameInput = screen.getByPlaceholderText('Tool name');
    const urlInput = screen.getByPlaceholderText('https://...');

    fireEvent.change(nameInput, { target: { value: 'My Tool' } });
    fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByLabelText('Save tool'));

    expect(screen.getByText('Enter a valid URL (e.g. https://example.com)')).toBeInTheDocument();
    expect(mockCreateTool).not.toHaveBeenCalled();
  });

  it('allows empty URL (optional field)', async () => {
    render(<ToolDetail />);
    const nameInput = screen.getByPlaceholderText('Tool name');

    fireEvent.change(nameInput, { target: { value: 'My Tool' } });
    fireEvent.click(screen.getByLabelText('Save tool'));

    await waitFor(() => {
      expect(screen.queryByText('Enter a valid URL (e.g. https://example.com)')).not.toBeInTheDocument();
      expect(mockCreateTool).toHaveBeenCalled();
    });
  });

  it('allows valid URLs', async () => {
    render(<ToolDetail />);
    const nameInput = screen.getByPlaceholderText('Tool name');
    const urlInput = screen.getByPlaceholderText('https://...');

    fireEvent.change(nameInput, { target: { value: 'My Tool' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByLabelText('Save tool'));

    await waitFor(() => {
      expect(screen.queryByText('Enter a valid URL (e.g. https://example.com)')).not.toBeInTheDocument();
      expect(mockCreateTool).toHaveBeenCalled();
    });
  });

  it('clears URL error on typing', () => {
    render(<ToolDetail />);
    const nameInput = screen.getByPlaceholderText('Tool name');
    const urlInput = screen.getByPlaceholderText('https://...');

    fireEvent.change(nameInput, { target: { value: 'My Tool' } });
    fireEvent.change(urlInput, { target: { value: 'bad' } });
    fireEvent.click(screen.getByLabelText('Save tool'));
    expect(screen.getByText('Enter a valid URL (e.g. https://example.com)')).toBeInTheDocument();

    fireEvent.change(urlInput, { target: { value: 'https://fixed.com' } });
    expect(screen.queryByText('Enter a valid URL (e.g. https://example.com)')).not.toBeInTheDocument();
  });

  it('shows name label with required indicator', () => {
    render(<ToolDetail />);
    expect(screen.getByText('Name *')).toBeInTheDocument();
  });

  it('sets aria-invalid on name input when error is shown', () => {
    render(<ToolDetail />);
    fireEvent.click(screen.getByLabelText('Save tool'));

    const nameInput = screen.getByPlaceholderText('Tool name');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows both errors when name is empty and URL is invalid', () => {
    render(<ToolDetail />);
    const urlInput = screen.getByPlaceholderText('https://...');

    fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByLabelText('Save tool'));

    expect(screen.getByText('Tool name is required')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid URL (e.g. https://example.com)')).toBeInTheDocument();
    expect(mockCreateTool).not.toHaveBeenCalled();
  });
});
