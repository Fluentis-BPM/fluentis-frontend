export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-border py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} ASOFARMA Centro América & Caribe. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-muted-foreground">BPM v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}