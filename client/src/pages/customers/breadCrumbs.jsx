import { Link, useLocation } from 'react-router-dom'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator() {
  const location = useLocation();
  const pathname = location.pathname; // e.g., "/home/men"
  const pathSegments = pathname.split('/').filter(Boolean); // ['home', 'men']

  // Remove the first "home" segment since you're manually showing "Home"
  const segments = pathSegments[0]?.toLowerCase() === 'home'
    ? pathSegments.slice(1)
    : pathSegments;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/home">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const to = '/home/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          return (
            <div key={to} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
