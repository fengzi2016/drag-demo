import React, { useCallback, useState, useLayoutEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { DraggableBox } from "./DraggableBox";
import { snapToGrid as doSnapToGrid } from "./snapToGrid";
import update from "immutability-helper";
import { DragItem } from "./interfaces";
import { DragItems } from "./buttons/DragItems";
interface DragItemIntoContainer {
  position: {
    x: number;
    y: number;
  };
  type: string;
  title: string;
}

const styles: React.CSSProperties = {
  width: 300,
  height: 300,
  border: "1px solid black",
  position: "relative",
};

let id = 0;
export interface ContainerProps {
  snapToGrid: boolean;
}

interface BoxMap {
  [id: string]: {
    top: number;
    left: number;
    type: string;
    id: number;
    title: string;
  };
}
interface Position {
  left: number;
  top: number;
}

function renderBox(item: any, key: any) {
  return <DraggableBox key={key} id={key} {...item} />;
}

export const Container: React.FC<ContainerProps> = ({ snapToGrid }) => {
  const [boxes, setBoxes] = useState<BoxMap>({});
  const [containerPosition, setContainerPosition] = useState<Position>({
    left: 0,
    top: 0,
  });

  const dropC = useRef<HTMLDivElement>(null);
  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
      setBoxes(
        update(boxes, {
          [id]: {
            $merge: { left, top },
          },
        })
      );
    },
    [boxes]
  );

  useLayoutEffect(() => {
    if (dropC.current) {
      const { left, top } = dropC.current.getBoundingClientRect();
      setContainerPosition({
        left,
        top,
      });
    }
  }, [dropC]);
  const [, drop] = useDrop({
    accept: ItemTypes.BTN,
    drop(item: DragItem, monitor) {
      const position = monitor.getClientOffset() as {
        x: number;
        y: number;
      };
      //按钮的位置上生成对应的套件
      // function createComponent(arg: DragItemIntoContainer) {

      id++;
      setBoxes(
        update(boxes, {
          $merge: {
            [id]: {
              type: item.type,
              left: position.x - containerPosition?.left,
              top: position.y - containerPosition.top,
              id,
              title: id.toString(),
            },
          },
        })
      );

      //}
      // createComponent();
    },
  });

  const [, dropInner] = useDrop({
    accept: ItemTypes.BOX,
    drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number;
        y: number;
      };

      let left = Math.round(item.left + delta.x);
      let top = Math.round(item.top + delta.y);
      if (snapToGrid) {
        [left, top] = doSnapToGrid(left, top);
      }

      moveBox(item.id, left, top);
      return undefined;
    },
  });

  return (
    <>
      <div>
        <DragItems />
      </div>
      <div ref={dropC} id="dropC">
        <div ref={drop} style={styles}>
          <div ref={dropInner} style={styles}>
            {boxes
              ? Object.values(boxes).map((box) => renderBox(box, box.id))
              : null}
          </div>
        </div>
      </div>
    </>
  );
};
