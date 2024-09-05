import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BDPage.css';
import ImageColorExtractor from './ImageColorExtractor';

function BDPage({ utilisateur_id }) {
    const [bd, setBd] = useState(null);
    const [backgroundColors, setBackgroundColors] = useState([]);
    const [showArrow, setShowArrow] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBd = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/bd/${id}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setBd(data);
            } catch (error) {
                console.error('Erreur lors de la récupération de la BD:', error);
            }
        };

        fetchBd();
    }, [id]);

    const handleColorExtracted = (color, index) => {
        setBackgroundColors(prev => {
            const newColors = [...prev];
            newColors[index] = `rgb(${color.join(',')})`;
            return newColors;
        });
    };

    useEffect(() => {
        let lastScrollTop = 0;
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowArrow(scrollTop <= lastScrollTop);
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleBackClick = () => {
        navigate(-1);
    };

    if (!bd || !bd.pages) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="bd-page-container">
            {showArrow && (
                <div className="back-arrow" onClick={handleBackClick}>
                    &#8592;
                </div>
            )}
            <div className="bd-intro">
                <header className="bd-header">
                    <h1>{bd.title}</h1>
                    <p>{bd.description}</p>
                </header>
            </div>
            <div className="bd-pages">
                {bd.pages.map((page, index) => (
                    <React.Fragment key={index}>
                        <div
                            className="bd-page"
                            style={{ backgroundColor: backgroundColors[index] || 'white' }}
                        >
                            <ImageColorExtractor
                                src={`http://localhost:3001/${page.image_url.replace(/\\/g, '/')}`}
                                onColorExtracted={(color) => handleColorExtracted(color, index)}
                            />
                            <img
                                src={`http://localhost:3001/${page.image_url.replace(/\\/g, '/')}`}
                                alt={`Page ${index + 1}`}
                                className="bd-page-image"
                            />
                        </div>
                        {index < bd.pages.length - 1 && (
                            <div
                                className="bd-gradient"
                                style={{
                                    background: `linear-gradient(${backgroundColors[index]}, ${backgroundColors[index + 1]})`,
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default BDPage;
