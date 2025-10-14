export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <h4 className="text-foreground font-semibold mb-2">About</h4>
            <p>
              BooknWatch is a movie ticketing interface inspired by modern
              cinema apps to help customers reserve seats for their favorite movies.
            </p>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>Email: info@sunmatrixproduction.com</li>
              <li>Phone: +91 7411842999</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-2">Terms</h4>
            <ul className="space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-2">Support</h4>
            <ul className="space-y-1">
              <li>Help Center</li>
              <li>Report an Issue</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 text-xs">
          © {new Date().getFullYear()} BooknWatch
        </div>
      </div>
    </footer>
  );
}
