import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BreadcrumbWithCustomSeparator() {
  const location = useLocation();
  const pathname = location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);

  const segments = pathSegments[0]?.toLowerCase() === 'home'
    ? pathSegments.slice(1)
    : pathSegments;

  return (
    <div className="w-full px-0 sm:px-6 mt-6">
      <div className="max-w-screen-xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center space-x-1 text-sm sm:text-base font-medium">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-gray-500 hover:text-gray-700">
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
                <div key={to} className="flex items-center space-x-1">
                  <BreadcrumbSeparator className="text-gray-400">›</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-black font-semibold">{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="text-gray-500 hover:text-gray-700">
                        <Link to={to}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
