"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  LineChart,
  Settings,
  LogOut,
  Wallet,
  MoreVertical,
  Plus,
  Kanban
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="fixed left-0 top-0 flex h-screen flex-col justify-between border-r border-white/10 bg-black/50 backdrop-blur-xl w-52">
      <div className="px-3 py-6">
        <div className="flex items-center gap-2 mb-8">
          <Image
            src="/supatrades.svg"
            alt="Supatrades Logo"
            width={120}
            height={36}
            className="h-8 w-auto"
          />
        </div>
        
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-all duration-200 hover:text-white hover:bg-white/10 text-sm font-medium',
              pathname === '/dashboard' ? 'bg-white/10 text-white border border-white/20' : 'hover:border-white/20'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          
          <Link
            href="/trades"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-all duration-200 hover:text-white hover:bg-white/10 text-sm font-medium',
              pathname === '/trades' ? 'bg-white/10 text-white border border-white/20' : 'hover:border-white/20'
            )}
          >
            <LineChart className="h-4 w-4" />
            Trades
          </Link>
          
          <Link
            href="/calendar"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-all duration-200 hover:text-white hover:bg-white/10 text-sm font-medium',
              pathname === '/calendar' ? 'bg-white/10 text-white border border-white/20' : 'hover:border-white/20'
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendario
          </Link>
          
          <Link
            href="/accounts"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-all duration-200 hover:text-white hover:bg-white/10 text-sm font-medium',
              pathname === '/accounts' ? 'bg-white/10 text-white border border-white/20' : 'hover:border-white/20'
            )}
          >
            <Wallet className="h-4 w-4" />
            Cuentas
          </Link>
          
          <Link
            href="/kanban"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 transition-all duration-200 hover:text-white hover:bg-white/10 text-sm font-medium',
              pathname === '/kanban' ? 'bg-white/10 text-white border border-white/20' : 'hover:border-white/20'
            )}
          >
            <Kanban className="h-4 w-4" />
            Kanban
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {session?.user?.name || 'Usuario'}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
            >
              <DropdownMenuItem asChild>
                <Link 
                  href="/settings" 
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/10" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-3 cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 