import { useEffect } from 'react';

import { useGetMyChildrenQuery } from '@/api/parent/children-api';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { setSelectedChildId } from '@/store/selected-child-slice';

/**
 * Tracks which of a parent's children is currently active across the app.
 * Defaults to the first child once the list loads; screens read/write the
 * selection through this hook instead of managing local state.
 */
export function useSelectedChild() {
  const dispatch = useAppDispatch();
  const childId = useAppSelector((state) => state.selectedChild.childId);
  const { data: children, isLoading, isFetching, isError, refetch } = useGetMyChildrenQuery();

  useEffect(() => {
    if (!childId && children && children.length > 0) {
      dispatch(setSelectedChildId(children[0]!.id));
    }
  }, [childId, children, dispatch]);

  const selectedChild = children?.find((child) => child.id === childId) ?? children?.[0] ?? null;

  return {
    children: children ?? [],
    selectedChild,
    selectedChildId: selectedChild?.id ?? null,
    setSelectedChildId: (id: string) => dispatch(setSelectedChildId(id)),
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
