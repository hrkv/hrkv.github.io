const SVG_NS = 'http://www.w3.org/2000/svg';

class Funnel {
    constructor(options) {
        // nodes
        this._root = null;
        this._levels = null;
        this._labels = null;

        // props
        this.input = null;
        this.width = null;
        this.height = null;
        this.levels = [];

        this.style = {
            lineWidth: 4
        };

        this.init(options);
        this.render();
    }

    init(options) {
        const { input,
                width,
                height,
                levels,
                parent } = options;

        this._root = document.createElementNS(SVG_NS, 'svg');

        this.input = input;
        this.width = width;
        this.height = height;

        this._root.setAttribute('height', height);
        this._root.setAttribute('width', width);

        this._levels = document.createElementNS(SVG_NS, 'g');
        this._root.appendChild(this._levels);

        this._labels = document.createElementNS(SVG_NS, 'g');
        this._root.appendChild(this._labels);

        this.setLevels(levels);

        if (parent) {
            parent.appendChild(this._root);
        }
    }

    setInput(value) {
        this.input = value;
    }

    updateLevels() {
        const { style,
                width,
                height,
                levels } = this;
        const { lineWidth } = style;

        const labelHeight = 40;
        const levelHeight = (height - (lineWidth) * levels.length - labelHeight) / levels.length;
        const levelsWidths = levels.reduce((result, { value }) => {
            const previousWidth = result.length ? result[result.length - 1] : width;

            result.push(previousWidth * value / 100);
            return result;
        }, []);

        levelsWidths.forEach((levelWidth, index) => {
            const previousWidth = index ? levelsWidths[index - 1] : width;
            const diffWidth = previousWidth - levelWidth;

            const top = labelHeight + index * levelHeight + lineWidth / 2;
            const topLeft = (width - previousWidth) / 2;

            const path = `M${topLeft} ${top} h ${previousWidth} l ${-diffWidth/2} ${levelHeight} h ${-levelWidth} Z`;
            const { node } = levels[index];

            node.setAttribute('d', path);
            this._levels.appendChild(node);
        });
    }

    updateValues() {
        if (!this.levels.length) {
            return;
        }

        const { width, height, levels, style } = this;
        const { lineWidth } = style;

        const labelHeight = 30;
        const levelHeight = (height - (lineWidth) * levels.length - labelHeight) / levels.length;
        const values = [this.input];

        levels.forEach(({ value }) => values.push(values[values.length - 1] * value / 100));

        values.forEach((value, index) => {
            const textNode = document.createElementNS(SVG_NS, 'text');
            textNode.textContent = Math.floor(value);

            textNode.setAttribute('x', width / 2);
            textNode.setAttribute('y', index * levelHeight + labelHeight + (lineWidth / 2));
            textNode.setAttribute('text-anchor', 'middle');

            this._labels.appendChild(textNode);
        });
    }

    clearCanvas() {
        const { _levels, _labels } = this;

        while (_levels.firstChild) {
            _levels.removeChild(_levels.firstChild);
        }

        while (_labels.firstChild) {
            _labels.removeChild(_labels.firstChild);
        }
    }

    render() {
        this.clearCanvas();
        this.updateLevels();
        this.updateValues();
    }

    setLevels(levels) {
        this.levels = [];

        levels.forEach((value) => {
            this.addLevel(value);
        });
    }

    addLevel(value) {
        this.levels.push(this.createLevel(value));
    }

    removeLevel(index) {
        this.levels.splice(index, 1);
    }

    createLevel(value) {
        const node = document.createElementNS(SVG_NS, 'path');

        node.classList.add('Level');
        node.setAttribute('fill', 'transparent');
        node.setAttribute('stroke', '#999');
        node.setAttribute('stroke-width', `${this.style.lineWidth}px`);

        return { node, value };
    }
}