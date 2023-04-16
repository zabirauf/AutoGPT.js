import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { GitHubBadge } from './GitHubBadge';
import { useEffect, useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <a href="#" className="-m-1.5 p-1.5">
          <span className="h-8 w-auto text-xl font-semibold underline underline-offset-2">
            AutoGPT.js
          </span>
        </a>
        <div className="flex flex-1 justify-end">
          <GitHubBadge />
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 left-0 z-10 w-full overflow-y-auto bg-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <a href="#" className="-m-1.5 p-1.5">
              <span className="h-8 w-auto text-xl font-semibold underline underline-offset-2">
                AutoGPT.js
              </span>
            </a>
            <div className="flex flex-1 justify-end">
              <GitHubBadge />
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
