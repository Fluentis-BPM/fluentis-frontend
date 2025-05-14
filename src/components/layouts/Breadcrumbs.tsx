import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';

export default function Breadcrumbs() {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="mb-4">
      <ol className="flex items-center text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground" />
              )}
              
              {isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  to={crumb.path} 
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}