import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

export function HomeMap({
  locationValue,
  locationAttribute,
}: {
  locationValue: string;
  locationAttribute: string | null | undefined;
}) {
  const LazyMap = dynamic(() => import('@/app/components/Map'), {
    ssr: false,
    loading: () => <Skeleton className='h-[50vh] w-full' />,
  });

  return (
    <LazyMap
      locationValue={locationValue}
      locationAttribute={locationAttribute}
    />
  );
}
