import { useEffect } from 'react';

import { useGetMyChildrenQuery } from '@/api/parent/children-api';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { setSelectedChildId } from '@/store/selected-child-slice';
import { resolveSelectedChildId } from '@/utils/selected-child';

/**
 * Tracks which of a parent's children is currently active across the app.
 * Defaults to the first child once the list loads, and replaces a stored id
 * that isn't one of this parent's children; screens read/write the
 * selection through this hook instead of managing local state.
 */
export function useSelectedChild() {
  const dispatch = useAppDispatch();
  const storedId = useAppSelector((state) => state.selectedChild.childId);
  const {
    data: children,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyChildrenQuery();

  const childIds = children?.map((child) => child.id) ?? [];
  const resolvedId = children ? resolveSelectedChildId(storedId, childIds) : storedId;

  useEffect(() => {
    if (children && resolvedId !== storedId) {
      dispatch(setSelectedChildId(resolvedId));
    }
  }, [children, resolvedId, storedId, dispatch]);

  const selectedChild = children?.find((child) => child.id === resolvedId) ?? null;

  return {
    children: children ?? [],
    selectedChild,
    selectedChildId: selectedChild?.id ?? null,
    setSelectedChildId: (id: string) => dispatch(setSelectedChildId(id)),
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
