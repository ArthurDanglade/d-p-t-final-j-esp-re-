import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // V6

const layouts = [
  {
    name: 'Single Panel',
    panels: [{ x: 0, y: 0, width: 100, height: 100 }],
  },
  {
    name: 'Two Panels Horizontal',
    panels: [
      { x: 0, y: 0, width: 50, height: 100 },
      { x: 50, y: 0, width: 50, height: 100 },
    ],
  },
  {
    name: 'Two Panels Vertical',
    panels: [
      { x: 0, y: 0, width: 100, height: 50 },
      { x: 0, y: 50, width: 100, height: 50 },
    ],
  },
  {
    name: 'Four Panels',
    panels: [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 50, y: 0, width: 50, height: 50 },
      { x: 0, y: 50, width: 50, height: 50 },
      { x: 50, y: 50, width: 50, height: 50 },
    ],
  },
];

const fontOptions = [
  { name: 'Badaboom BB', value: 'Badaboom BB' },
  { name: 'The Amazing Spider Man', value: 'The Amazing Spider Man' },
  { name: 'Hey Comic', value: 'Hey Comic' },
  { name: 'Manga Temple', value: 'Manga Temple' },
  { name: 'Komigo', value: 'Komigo' },
  { name: 'Fighting Spirit TBS', value: 'Fighting Spirit TBS' },
  { name: 'Futura Handwritten', value: 'Futura Handwritten' },
  { name: 'Super Comic 3', value: 'Super Comic 3' },
];

const DrawingCanvas = ({ onSave }) => {
    const canvasRef = useRef(null);
    const canvas = useRef(null);
    const [brushColor, setBrushColor] = useState('black');
    const [brushSize, setBrushSize] = useState(5);
    const [isErasing, setIsErasing] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState(null);
    const [borderColor, setBorderColor] = useState('black');
    const [borderWidth, setBorderWidth] = useState(5);
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [menuOpen, setMenuOpen] = useState(false);
    const [textMenuOpen, setTextMenuOpen] = useState(false);
  
    useEffect(() => {
        if (!canvasRef.current) return;
      
        // Dispose of the existing canvas if it exists
        if (canvas.current) {
          canvas.current.dispose();
        }
      
        // Initialize the new canvas
        canvas.current = new fabric.Canvas(canvasRef.current);
        initializeBrush();
      
        const resizeCanvas = () => {
          if (canvas.current) {
            canvas.current.setWidth(window.innerWidth);
            canvas.current.setHeight(window.innerHeight);
            if (selectedLayout) {
              drawLayout(selectedLayout);
            }
            canvas.current.renderAll();
          }
        };
      
        // Initial resize
        resizeCanvas();
      
        // Add resize event listener
        window.addEventListener('resize', resizeCanvas);
      
        // Add canvas click event listener
        canvas.current.on('mouse:down', handleCanvasClick);
      
        return () => {
          // Cleanup resize event listener
          window.removeEventListener('resize', resizeCanvas);
      
          // Dispose of the canvas
          if (canvas.current) {
            canvas.current.dispose();
            canvas.current = null;
          }
        };
      }, [selectedLayout]);
  
    useEffect(() => {
      updateBrush();
    }, [brushSize, brushColor, isErasing]);
  
    useEffect(() => {
      if (selectedLayout) {
        drawLayout(selectedLayout);
      }
    }, [selectedLayout, borderColor, borderWidth]);
  
    const initializeBrush = () => {
      if (canvas.current) {
        canvas.current.isDrawingMode = false; // Disable drawing mode by default
        canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
        canvas.current.freeDrawingBrush.width = brushSize;
        canvas.current.freeDrawingBrush.color = brushColor;
        canvas.current.backgroundColor = 'white';
        canvas.current.renderAll();
      }
    };
  
    const updateBrush = () => {
      if (canvas.current && canvas.current.freeDrawingBrush) {
        canvas.current.freeDrawingBrush.width = brushSize;
        canvas.current.freeDrawingBrush.color = isErasing ? 'white' : brushColor;
        canvas.current.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: 0,
          offsetX: 0,
          offsetY: 0,
          affectStroke: true,
          color: brushColor,
        });
      }
    };
  
    const drawLayout = (layout) => {
      if (canvas.current) {
        canvas.current.clear();
        layout.panels.forEach(panel => {
          const rect = new fabric.Rect({
            left: (panel.x / 100) * canvas.current.width,
            top: (panel.y / 100) * canvas.current.height,
            width: (panel.width / 100) * canvas.current.width - borderWidth,
            height: (panel.height / 100) * canvas.current.height - borderWidth,
            fill: 'white',
            stroke: borderColor,
            strokeWidth: borderWidth,
            selectable: false,
          });
          canvas.current.add(rect);
        });
        canvas.current.renderAll();
      }
    };
  
    const enableDrawingMode = () => {
      if (canvas.current) {
        canvas.current.isDrawingMode = true;
      }
      setIsErasing(false);
      setIsTextMode(false);
    };
  
    const enableErasingMode = () => {
      if (canvas.current) {
        canvas.current.isDrawingMode = true;
      }
      setIsErasing(true);
      setIsTextMode(false);
    };
  

  
    const handleCanvasClick = (event) => {
      if (isTextMode && canvas.current) {
        const pointer = canvas.current.getPointer(event.e);
        const text = new fabric.IText('Texte ici', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: selectedFont,
          fontSize: 20,
          fill: brushColor,
        });
        canvas.current.add(text);
        canvas.current.setActiveObject(text);
        canvas.current.renderAll();
        setIsTextMode(false);
      }
    };
  
    const changeBrushColor = (event) => {
      setBrushColor(event.target.value);
    };
  
    const changeBrushSize = (event) => {
      const newSize = parseInt(event.target.value, 10);
      if (!isNaN(newSize)) {
        setBrushSize(newSize);
      }
    };
  
    const changeBorderColor = (event) => {
      setBorderColor(event.target.value);
    };
  
    const changeBorderWidth = (event) => {
      const newSize = parseInt(event.target.value, 10);
      if (!isNaN(newSize)) {
        setBorderWidth(newSize);
      }
    };
  

  
    const saveDrawing = () => {
      if (canvas.current) {
        const dataUrl = canvas.current.toDataURL({
          format: 'png',
        });
        onSave(dataUrl);
      }
    };
  
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
  
    const toggleTextMenu = () => {
      setTextMenuOpen(!textMenuOpen);
    };
  
    const handleLayoutChange = (event) => {
      const layoutName = event.target.value;
      const layout = layouts.find(l => l.name === layoutName);
      setSelectedLayout(layout);
    };
  
    const addTextToCanvas = (font) => {
      if (canvas.current) {
        const text = new fabric.IText('Texte ici', {
          left: 50,
          top: 50,
          fontFamily: font,
          fontSize: 20,
          fill: brushColor,
        });
        canvas.current.add(text);
        canvas.current.setActiveObject(text);
        canvas.current.renderAll();
      }
    };
  
    const changeTextColor = (event) => {
      setBrushColor(event.target.value);
    };
  
    return (
      <>
        <canvas ref={canvasRef}></canvas>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <div className={`menu ${menuOpen ? 'open' : ''}`}>
          <div className="controls">
            <label>
              Couleur du pinceau :
              <input type="color" value={brushColor} onChange={changeBrushColor} />
            </label>
            <label>
              Taille du pinceau :
              <input type="number" value={brushSize} onChange={changeBrushSize} min="1" max="50" />
            </label>
            <button onClick={enableDrawingMode}>Dessiner</button>
            <button onClick={enableErasingMode}>Effacer</button>
            <label>
              Mise en page:
              <select onChange={handleLayoutChange}>
                <option value="">Sélectionner mise en page</option>
                {layouts.map(layout => (
                  <option key={layout.name} value={layout.name}>{layout.name}</option>
                ))}
              </select>

            </label>
            <label>
              Couleur de bordure :
              <input type="color" value={borderColor} onChange={changeBorderColor} />
            </label>
            <label>
              Epaisseur bordure:
              <input type="number" value={borderWidth} onChange={changeBorderWidth} min="1" max="20" />
            </label>
                        <button onClick={saveDrawing}>Sauvegarder page</button>

          </div>
        </div>
        <button className="text-menu-toggle" onClick={toggleTextMenu}>
          ☰
        </button>
        <div className={`text-menu ${textMenuOpen ? 'open' : ''}`}>
          <div className="controls">
            <label>
              Couleur du texte :
              <input type="color" value={brushColor} onChange={changeTextColor} />
            </label>
          </div>
          <div className="font-examples">
            {fontOptions.map((font, index) => (
              <React.Fragment key={font.value}>
                <div
                  style={{ fontFamily: font.value, cursor: 'pointer', color: 'white', padding: '5px 0' }} // Padding for spacing
                  onClick={() => {
                    addTextToCanvas(font.value);
                    setTextMenuOpen(false);
                  }}
                >
                  <span>Police {index + 1}</span>
                </div>
                {index < fontOptions.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  export default DrawingCanvas;