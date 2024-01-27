import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image,
  Transformer,
  Group,
  Text,
} from "react-konva";
import {
  FaSave,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaArrowsAlt,
  FaSync,
  FaEdit,
} from "react-icons/fa";

const ImageEditor = () => {
  // const aa = reactConvaCoordinates.map(rect => {
  //   const x1 = rect.x;
  //   const y1 = rect.y;
  //   const x2 = rect.x + rect.width;
  //   const y2 = rect.y + rect.height;

  //   return { x1, y1, x2, y2 };
  // });

  // const bb = cartesianCoordinates.map(coord => {
  //   const x = coord.x1;
  //   const y = coord.y1;
  //   const width = coord.x2 - coord.x1;
  //   const height = coord.y2 - coord.y1;

  //   return { x, y, width, height };
  // });

  const [drawingHistory, setDrawingHistory] = useState([
    {
      x: 147,
      y: 131,
      width: 50,
      height: 25,
    },
    {
      x: 277,
      y: 143,
      width: 50,
      height: 26,
    },
    {
      x: 391,
      y: 127,
      width: 63,
      height: 37,
    },
  ]);

  const [visibleDeleteButton, setVisibleDeleteButton] = useState(true);

  const [hoveredRectIndex, setHoveredRectIndex] = useState(null);
  const [rectangles, setRectangles] = useState(drawingHistory.flat());
  const [drawing, setDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [moveMode, setMoveMode] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [savedImageDataURL, setSavedImageDataURL] = useState(null);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // This is the minimum size of the rectangle Less than this size the rectangle will be excluded from array.
  const minimumSize = 8;

  useEffect(() => {
    const img = new window.Image();
    img.src =
      "https://chex-ai-uploads.s3.amazonaws.com/uploads/45/vuSPIMTi0U9NUvLVHKCuW";
    // img.src = "https://picsum.photos/1000/700?random=1";
    img.onload = () => {
      setImage(img);
    };
    img.crossOrigin = "Anonymous";

    // const updatedDrawing = drawingHistory.slice();
    // setRectangles(updatedDrawing.flat());
  }, []);

  const handleMoveButtonClick = () => {
    setMoveMode(!moveMode);
  };

  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    const scale = stage.scaleX();
    const position = stage.getPointerPosition();

    if (moveMode) {
      // If move mode is active, set the initial position for dragging
      setDragStartPosition({
        x: e.evt.clientX,
        y: e.evt.clientY,
        stageX: stageRef.current.x(),
        stageY: stageRef.current.y(),
      });
    } else {
      // Start a new drawing operation
      setDrawing(true);

      // Start a new drawing operation
      setDrawingHistory([
        ...drawingHistory,
        {
          x: (position.x - stage.x()) / scale,
          y: (position.y - stage.y()) / scale,
          width: 0,
          height: 0,
        },
      ]);
    }
  };

  const handleMouseMove = (e) => {
    const stage = stageRef.current;
    const position = stage.getPointerPosition();
  
    if (!drawing) {
      // Check if move mode is active
      if (moveMode && dragStartPosition) {
        const deltaX = e.evt.clientX - dragStartPosition.x;
        const deltaY = e.evt.clientY - dragStartPosition.y;
  
        // Update the stage's position based on the drag
        stage.x(dragStartPosition.stageX + deltaX);
        stage.y(dragStartPosition.stageY + deltaY);
        stage.batchDraw();
  
        // Change cursor style to "grabbing" when in move mode
        stage.container().style.cursor = "grabbing";
        return;
      }
  
      // Reset cursor style when not in move mode
      stage.container().style.cursor = "default";
      return;
    }
  
    const scale = stage.scaleX();
  
    // Update the last drawing operation
    const updatedDrawing = drawingHistory.slice();
    const lastOperation = updatedDrawing[drawingHistory.length - 1];
    lastOperation.width = (position.x - stage.x()) / scale - lastOperation.x;
    lastOperation.height = (position.y - stage.y()) / scale - lastOperation.y;
  
    setRectangles(updatedDrawing);
  
    // Update the hovered rectangle index
    const hoveredIndex = rectangles.findIndex((rect) => {
      const rectX = rect.x * scale + stage.x();
      const rectY = rect.y * scale + stage.y();
      const rectWidth = rect.width * scale;
      const rectHeight = rect.height * scale;
  
      return (
        position.x >= rectX &&
        position.x <= rectX + rectWidth &&
        position.y >= rectY &&
        position.y <= rectY + rectHeight
      );
    });
  
    // Change cursor style to "grab" when in move mode
    stage.container().style.cursor = moveMode ? "grab" : "default";
  };

  const handleMouseUp = () => {
    setDrawing(false);

    // Check if move mode is active and reset the drag start position
    if (moveMode) {
      setDragStartPosition(null);
    }
  };

  const saveImage = () => {
    console.log("drawingHistory", drawingHistory);
    console.log("rectangles", rectangles);

    if (!stageRef.current) return;
    handleReset();

    const stage = stageRef.current.getStage();
    const layer = stage.findOne("Layer");

    if (layer) {
      const dataURL = stage.toDataURL();

      setSavedImageDataURL(dataURL);

      localStorage.setItem("savedImage", dataURL);
      console.log("Image saved to local storage:", dataURL);
    }
  };

  const handleZoomIn = () => {
    const zoomFactor = 1.2; // You can adjust the zoom factor as needed

    if (selectedId !== null) {
      // Zoom in the selected rectangle
      const updatedRectangles = rectangles.map((rect) => {
        if (rect.id === selectedId) {
          // Calculate the new width and height
          const newWidth = rect.width * zoomFactor;
          const newHeight = rect.height * zoomFactor;

          // Calculate the change in width and height
          const deltaWidth = newWidth - rect.width;
          const deltaHeight = newHeight - rect.height;

          // Adjust the x and y coordinates to keep the center fixed
          const newX = rect.x - deltaWidth / 2;
          const newY = rect.y - deltaHeight / 2;

          return {
            ...rect,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        }
        return rect;
      });

      setRectangles(updatedRectangles);
    } else {
      // Zoom in the entire canvas
      const stage = stageRef.current;

      // Get the current scale
      const currentScaleX = stage.scaleX();
      const currentScaleY = stage.scaleY();

      // Calculate the new scale
      const newScaleX = currentScaleX * zoomFactor;
      const newScaleY = currentScaleY * zoomFactor;

      // Set the transformation origin to the center of the stage
      const centerX = stage.width() / 2;
      const centerY = stage.height() / 2;

      stage.scale({ x: newScaleX, y: newScaleY });

      // Adjust the position to keep the center fixed
      stage.x(centerX - (centerX - stage.x()) * zoomFactor);
      stage.y(centerY - (centerY - stage.y()) * zoomFactor);

      stage.batchDraw();
    }
  };

  const handleZoomOut = () => {
    const zoomOutFactor = 0.8; // You can adjust the zoom out factor as needed

    if (selectedId !== null) {
      // Zoom out the selected rectangle
      const updatedRectangles = rectangles.map((rect) => {
        if (rect.id === selectedId) {
          // Calculate the new width and height
          const newWidth = rect.width * zoomOutFactor;
          const newHeight = rect.height * zoomOutFactor;

          // Calculate the change in width and height
          const deltaWidth = newWidth - rect.width;
          const deltaHeight = newHeight - rect.height;

          // Adjust the x and y coordinates to keep the center fixed
          const newX = rect.x + deltaWidth / 2;
          const newY = rect.y + deltaHeight / 2;

          return {
            ...rect,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        }
        return rect;
      });

      setRectangles(updatedRectangles);
    } else {
      // Zoom out the entire canvas
      const stage = stageRef.current;

      // Get the current scale
      const currentScaleX = stage.scaleX();
      const currentScaleY = stage.scaleY();

      // Calculate the new scale
      const newScaleX = currentScaleX * zoomOutFactor;
      const newScaleY = currentScaleY * zoomOutFactor;

      // Set the transformation origin to the center of the stage
      const centerX = stage.width() / 2;
      const centerY = stage.height() / 2;

      stage.scale({ x: newScaleX, y: newScaleY });

      // Adjust the position to keep the center fixed
      stage.x(centerX - (centerX - stage.x()) * zoomOutFactor);
      stage.y(centerY - (centerY - stage.y()) * zoomOutFactor);

      stage.batchDraw();
    }
  };

  const handleSelect = (e) => {
    // If a rectangle is hovered, select it
    if (hoveredRectIndex !== null) {
      setSelectedId(hoveredRectIndex);
    } else {
      // Deselect when clicking on the stage
      setSelectedId(null);
    }
  };

  const onTransformEnd = () => {
    // Update rectangles after transformation
    const updatedRectangles = rectangles.map((rect) => {
      if (rect.id === selectedId) {
        const transformerNode = transformerRef.current;
        const scaleX = transformerNode.scaleX();
        const scaleY = transformerNode.scaleY();
        const width = transformerNode.width() * scaleX;
        const height = transformerNode.height() * scaleY;
        const x = transformerNode.x();
        const y = transformerNode.y();

        return { ...rect, x, y, width, height };
      }
      return rect;
    });

    setRectangles(updatedRectangles);
  };

  const undoDrawing = () => {
    if (drawingHistory.length > 0) {
      const updatedDrawingHistory = drawingHistory.slice(0, -1);
      setDrawingHistory(updatedDrawingHistory);
      setRectangles(updatedDrawingHistory.flat());
    }
  };

  const handleReset = () => {
    if (!stageRef.current) return;

    const stage = stageRef.current;

    if (selectedId !== null) {
      // Reset the selected rectangle to its original state
      const updatedRectangles = rectangles.map((rect) => {
        if (rect.id === selectedId) {
          // Use the original values (you may need to store these during creation)
          const originalWidth = rect.originalWidth || 0;
          const originalHeight = rect.originalHeight || 0;
          const originalX = rect.originalX || 0;
          const originalY = rect.originalY || 0;

          return {
            ...rect,
            x: originalX,
            y: originalY,
            width: originalWidth,
            height: originalHeight,
          };
        }
        return rect;
      });

      setRectangles(updatedRectangles);
    } else {
      stage.scale({ x: 1, y: 1 }); // Reset scale
      stage.x(0); // Reset x position
      stage.y(0); // Reset y position

      // setRectangles([]); // Reset rectangles
      setSelectedId(null);
      setMoveMode(false);
      setDragStartPosition(null);

      stage.batchDraw();
    }
  };

  const handleMouseEnter = (index) => {
    setVisibleDeleteButton(true);
    setHoveredRectIndex(index);
    // setSelectedId(null);
  };

  const handleMouseLeave = (e) => {
    setVisibleDeleteButton(false);
    // setSelectedId(null);
  };

  const handleDelete = (index) => {
    const updatedRectangles = rectangles.filter((rect, i) => i !== index);
    setRectangles(updatedRectangles);
    // setSelectedId(null);

    setDrawingHistory(updatedRectangles);
    setSelectedId(null);
    setHoveredRectIndex(null);
  };

  const handleButtonHover = () => {
    setSelectedId(null);
    setHoveredRectIndex(null);
    const filteredDrawingHistory = drawingHistory.filter(
      (rect) =>
        rect.width >= minimumSize ||
        rect.width <= -minimumSize ||
        rect.height >= minimumSize ||
        rect.height <= -minimumSize
    );
    setDrawingHistory(filteredDrawingHistory);

    const filteredRectangles = drawingHistory.filter(
      (rect) =>
        rect.width >= minimumSize ||
        rect.width <= -minimumSize ||
        rect.height >= minimumSize ||
        rect.height <= -minimumSize
    );
    setRectangles(filteredRectangles);
  };

  const makeVisible = () => {
    setVisibleDeleteButton(true);
  };

  const makeInvisible = () => {
    setVisibleDeleteButton(false);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center"}}
    >
      <h1>Manual Annotation </h1>
      <div
        style={{
          border: "1px solid black",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <Stage
          width={600}
          height={300}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          onClick={handleSelect}
        >
          <Layer>
            {image && <Image image={image} width={600} height={300} />}
            {/* Render rectangles on the image */}
            {image && rectangles.map((rect, index) => (
              <Group key={index}>
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  stroke={"red"}
                  strokeWidth={2}
                  rotation={rect.rotation || 0}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setSelectedId(index)}
                  onTransformEnd={onTransformEnd}
                />
                {hoveredRectIndex === index && (
                  <Group>
                    <Rect
                      opacity={visibleDeleteButton === true ? 1 : 0.2}
                      x={rect.width >= 0 ? rect.x + rect.width + 3 : rect.x + 3}
                      y={
                        rect.height >= 0
                          ? rect.y - 10
                          : rect.y + rect.height - 10
                      }
                      width={12}
                      height={12}
                      fill="red"
                      cornerRadius={5}
                      onClick={() => handleDelete(index)}
                      onMouseEnter={makeVisible}
                      onMouseLeave={makeInvisible}
                    />
                    <Text
                      opacity={visibleDeleteButton === true ? 1 : 0.2}
                      text="x"
                      x={rect.width >= 0 ? rect.x + rect.width + 6 : rect.x + 6}
                      y={
                        rect.height >= 0
                          ? rect.y - 10
                          : rect.y + rect.height - 10
                      }
                      fontSize={12}
                      fill="white"
                      onClick={() => handleDelete(index)}
                      onMouseEnter={makeVisible}
                      onMouseLeave={makeInvisible}
                    />
                  </Group>
                )}
              </Group>
            ))}

            {/* Render transformer for selected rectangle */}
            {selectedId !== null && (
              <Transformer ref={transformerRef} rotateEnabled={true} />
            )}
          </Layer>
        </Stage>
      </div>
      <div style={{ marginTop: "10px" }}>
        <>
          <button onClick={saveImage} onMouseEnter={handleButtonHover}>
            <FaSave />
          </button>
          <button
            onClick={handleZoomIn}
            onMouseEnter={handleButtonHover}
            style={{ marginLeft: "10px" }}
          >
            <FaSearchPlus />
          </button>
          <button
            onClick={handleZoomOut}
            onMouseEnter={handleButtonHover}
            style={{ marginLeft: "10px" }}
          >
            <FaSearchMinus />
          </button>
          <button
            onMouseEnter={handleButtonHover}
            onClick={undoDrawing}
            disabled={drawingHistory.length === 0}
            style={{ marginLeft: "10px" }}
          >
            <FaUndo />
          </button>
          <button
            onMouseEnter={handleButtonHover}
            onClick={handleMoveButtonClick}
            style={{ marginLeft: "10px" }}
          >
            {moveMode ? (
              <FaArrowsAlt style={{ backgroundColor: "black" }} />
            ) : (
              <FaArrowsAlt />
            )}
          </button>
        </>
      </div>
      {savedImageDataURL && (
        <div>
          <h2>Saved Image</h2>
          <img src={savedImageDataURL} alt="Saved" />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
