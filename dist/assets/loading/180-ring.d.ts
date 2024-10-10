import React from 'react';
interface Loading180RingProps {
    width?: number;
    height?: number;
    fill?: string;
}
/**
 * Loading180Ring component.
 *
 * @param {Object} props - The component properties.
 * @param {number} props.width - The width of the SVG.
 * @param {number} props.height - The height of the SVG.
 * @param {string} [props.fill='white'] - The fill color of the SVG.
 * @returns {JSX.Element} React JSX element.
 */
declare const Loading180Ring: ({ width, height, fill }: Loading180RingProps) => React.JSX.Element;
export default Loading180Ring;
