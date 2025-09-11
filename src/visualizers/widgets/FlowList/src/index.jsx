import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import List from './main';

const container = document.getElementById(VISUALIZER_INSTANCE_ID);
const root = ReactDOMClient.createRoot(container);

const onUpdateFromControl = (descriptor) => {
  console.log('rendering', descriptor);
  root.render(<List elements = {descriptor.elements} global = {descriptor.global}/>);
};

console.log('connecting to control');
WEBGME_CONTROL.registerUpdate(onUpdateFromControl);