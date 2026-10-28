// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom has no layout, so scrolling APIs are no-ops in tests.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
