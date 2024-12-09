import { DropTargetEvent } from '@progress/kendo-angular-utils';

export const calculateDestinationIndex = (
    e: DropTargetEvent,
    fromElement: number,
    fromIndex: any,
    toElement: number | null
): number => {
    let toIndex = -1; // Default value if drop target or attribute is null

    if (e.dragTarget && e.dropTarget) {
        if (
            (e.dragTarget instanceof HTMLDivElement && e.dropTarget instanceof HTMLTableRowElement) ||
            (e.dragTarget instanceof HTMLTableRowElement && e.dropTarget instanceof HTMLTableRowElement)
        ) {
            const gridItemIndex = e.dropTarget.getAttribute('data-kendo-grid-item-index');
            if (gridItemIndex) {
                toIndex = +gridItemIndex;
            }
        } else if (
            (e.dragTarget instanceof HTMLTableRowElement && e.dropTarget instanceof HTMLDivElement) ||
            (e.dragTarget instanceof HTMLDivElement && e.dropTarget instanceof HTMLDivElement)
        ) {
            const listViewItemIndex = e.dropTarget.getAttribute('data-kendo-listview-item-index');
            if (listViewItemIndex) {
                toIndex = +listViewItemIndex;
            }
        }
    }

    const isInLowerHalf = isDroppedInLowerHalf(e);

    if (toElement !== null && fromElement !== toElement) {
        if (isInLowerHalf) {
            toIndex += 1;
        }
    } else {
        if (toElement !== null && isInLowerHalf && fromIndex > toIndex) {
            toIndex += 1;
        } else if (toElement !== null && !isInLowerHalf && fromIndex < toIndex) {
            toIndex -= 1;
        }
    }

    return toIndex;
};

const isDroppedInLowerHalf = (ev: DropTargetEvent) => {
    const itemCoords = ev.dropTarget.getBoundingClientRect();
    return ev.dragEvent.clientY > itemCoords.top + itemCoords.height / 2;
};
