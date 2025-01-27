import { Menu, Package2, Home, Computer, LogOut, Settings, Boxes } from 'lucide-react';
import { Button } from './ui/button';
import { SheetTrigger, SheetContent, Sheet } from './ui/sheet';
import { Link } from '@remix-run/react';

function NavContent({ className }: { className?: string} ) {
  return (
    <nav className={className}>
      <Link
        to={'/'}
        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 bg-muted hover:text-foreground"
      >
        <Home className="size-6" />
        Dashboard
      </Link>
      <Link
        to={'/computers'}
        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 bg-muted hover:text-foreground"
      >
        <Computer className="size-6" />
        Computadores
      </Link>
      <Link
        to={'/groups'}
        className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 bg-muted hover:text-foreground'
      >
        <Boxes className='size-6'/>
        Grupos
      </Link>
      <Link
        to={'/settings'}
        className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 bg-muted hover:text-foreground'
      >
        <Settings className="size-6" />
        Configurações
      </Link>
      <hr/>
      <Link
        to={'/logout'}
        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 bg-muted hover:text-foreground"
      >
        <LogOut className="size-6" />
          Encerrar Sessão
      </Link>
    </nav>
  );
}

export default function NavBar({ children }: { children: React.ReactNode} ) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="size-7" />
              <span className="">Inventário</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavContent className="grid gap-2 px-2 text-sm font-medium lg:px-4"/>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="size-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <NavContent className="grid gap-2 text-lg font-medium"/>
            </SheetContent>
          </Sheet>
        </header>
        <main className='m-10'>{children}</main>
      </div>
    </div>
  );
}
