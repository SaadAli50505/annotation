import React, { useState, useRef } from 'react';
import { ImageEditorComponent } from '@syncfusion/ej2-react-image-editor';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Browser } from '@syncfusion/ej2-base';

const ImageEditor = () => {
  const imgObjRef = useRef(null);

  const [shapeDimensions, setShapeDimensions] = useState(null);

  const imageEditorCreated = () => {
    if (Browser.isDevice) {
      imgObjRef.current.open('flower.png');
    } else {
      imgObjRef.current.open('bridge.png');
    }
  };

  const drawShape = (shapeType) => {
    const dimension = imgObjRef.current.getImageDimension();
    setShapeDimensions(dimension);

    switch (shapeType) {
      case 'rectangle':
        imgObjRef.current.drawRectangle(dimension.x, dimension.y);
        break;
      case 'ellipse':
        imgObjRef.current.drawEllipse(dimension.x, dimension.y);
        break;
      case 'line':
        imgObjRef.current.drawLine(dimension.x, dimension.y);
        break;
      case 'arrow':
        imgObjRef.current.drawArrow(dimension.x, dimension.y + 10, dimension.x + 50, dimension.y + 10, 10);
        break;
      case 'path':
        imgObjRef.current.drawPath([{ x: dimension.x, y: dimension.y }, { x: dimension.x + 50, y: dimension.y + 50 }, { x: dimension.x + 20, y: dimension.y + 50 }], 8);
        break;
      default:
        break;
    }
  };

  const drawText = () => {
    if (shapeDimensions) {
      imgObjRef.current.drawText(shapeDimensions.x, shapeDimensions.y);
    }
  };

  return (
    <div className='e-img-editor-sample'>
      <ImageEditorComponent ref={imgObjRef} created={imageEditorCreated} toolbar={[]} />
      <div>
        <ButtonComponent cssClass='e-primary' content='Draw Rectangle' onClick={() => drawShape('rectangle')} />
        <ButtonComponent cssClass='e-primary' content='Draw Ellipse' onClick={() => drawShape('ellipse')} />
        <ButtonComponent cssClass='e-primary' content='Draw Line' onClick={() => drawShape('line')} />
        <ButtonComponent cssClass='e-primary' content='Draw Arrow' onClick={() => drawShape('arrow')} />
        <ButtonComponent cssClass='e-primary' content='Draw Path' onClick={() => drawShape('path')} />
        <ButtonComponent cssClass='e-primary' content='Add Text' onClick={drawText} />
      </div>
    </div>
  );
};

export default ImageEditor;
