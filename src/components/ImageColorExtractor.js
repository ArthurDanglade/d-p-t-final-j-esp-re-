import React, { useEffect, useRef, useState } from 'react';

const ImageColorExtractor = ({ src, onColorExtracted }) => {
    const imgRef = useRef(null);

    useEffect(() => {
        const img = imgRef.current;

        if (window.ColorThief && img) {
            img.onload = () => {
                const colorThief = new window.ColorThief();
                try {
                    const color = colorThief.getColor(img);
                    onColorExtracted(color);
                } catch (error) {
                    console.error('Error extracting colors:', error);
                }
            };
            
            img.crossOrigin = 'anonymous'; // Ajout de l'attribut crossOrigin
        }
    }, [src, onColorExtracted]);

    return (
        <div>
            <img ref={imgRef} src={src} alt="Source" style={{ display: 'none' }} />
        </div>
    );
};

export default ImageColorExtractor;

