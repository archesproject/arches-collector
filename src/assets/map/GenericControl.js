export default class GenericControl {
    constructor(container) {
        this._container = container;
    }
    onAdd() {
        return this._container;
    }
    onRemove() {
        this._container.parentNode.removeChild(this._container);
    }
}
