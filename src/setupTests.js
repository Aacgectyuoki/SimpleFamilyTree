// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import React from 'react';
import '@testing-library/jest-dom';
import 'mutationobserver-shim';

// Add MutationObserver to the global scope
global.MutationObserver = window.MutationObserver;

// Mock react-d3-tree
jest.mock('react-d3-tree', () => {
  const Tree = () => <div>Mocked Tree Component</div>;
  return { __esModule: true, default: Tree };
});