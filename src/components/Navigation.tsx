'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2, Map, LineChart, BarChart2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-lg font-semibold"
            >
              Pollution Tracker
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Live Map</span>
              </Link>
              <Link
                href="/locations"
                className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                  isActive('/locations') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Location Comparison</span>
              </Link>
              <Link
                href="/timeline"
                className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                  isActive('/timeline') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <LineChart className="h-4 w-4" />
                <span>Timeline</span>
              </Link>
              <Link
                href="/globe"
                className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                  isActive('/globe') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Globe2 className="h-4 w-4" />
                <span>Global View</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 