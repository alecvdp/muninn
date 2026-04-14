import { Link } from 'react-router';
import { MagnifyingGlass } from '@phosphor-icons/react';

export default function NotFoundPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-6 text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <MagnifyingGlass size={32} className="text-brand" weight="duotone" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-high">Page not found</h1>
          <p className="text-sm text-low">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
        >
          Back to board
        </Link>
      </div>
    </div>
  );
}
